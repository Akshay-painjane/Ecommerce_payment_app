import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, tokenStore } from "../services/api.js";

const getProductId = (item) => (
  item?.product_id
  ?? item?.productId
  ?? item?.product?.id
  ?? item?.product?.product_id
);

const getProductPrice = (product, item) => {
  const value = product?.price
    ?? product?.sale_price
    ?? product?.unit_price
    ?? item?.price
    ?? item?.unit_price
    ?? item?.product_price;

  const price = Number(value);
  return Number.isFinite(price) ? price : 0;
};

const normalizeCheckoutItem = (item, product) => {
  const productId = getProductId(item) ?? product?.id;
  const productData = product && typeof product === "object" ? product : item?.product;
  const quantity = Number(item?.quantity ?? item?.qty ?? 1);

  return {
    ...item,
    product_id: productId,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    product: {
      ...productData,
      id: productData?.id ?? productId,
      name: productData?.name || productData?.title || item?.name || item?.title || `Product #${productId}`,
      price: getProductPrice(productData, item),
    },
  };
};

const deliveryOptions = [
  { location: "Bengaluru", charge: 0 },
  { location: "Hyderabad", charge: 50 },
  { location: "Mumbai", charge: 80 },
  { location: "Delhi", charge: 100 },
  { location: "Other", charge: 120 },
];

function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState("221B Blue Avenue, Bengaluru, Karnataka 560001");
  const [deliveryLocation, setDeliveryLocation] = useState("Bengaluru");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [error, setError] = useState("");
  const placingRef = useRef(false);

  useEffect(() => {
    let active = true;
    const productId = searchParams.get("product");

    const loadCheckoutItems = async () => {
      setError("");
      const token = tokenStore.getAccess();

      if (!token) {
        navigate("/login", { state: { message: "Please login to checkout" }, replace: true });
        return [];
      }

      if (productId) {
        const product = await api.getProduct(productId);
        return [normalizeCheckoutItem({ product_id: productId, quantity: 1 }, product)];
      }

      const cartItems = await api.getCart();

      const cartList = Array.isArray(cartItems) ? cartItems : [];

      const itemsWithProducts = await Promise.all(
        cartList.map(async (item) => {
          const id = getProductId(item);
          let product = item.product && typeof item.product === "object" ? item.product : null;
          const needsProductDetails = id && (!product || !product.name || product.price === undefined || product.price === null);

          if (needsProductDetails) {
            try {
              product = await api.getProduct(id);
            } catch {
              product = product || null;
            }
          }

          return normalizeCheckoutItem(item, product);
        })
      );

      return itemsWithProducts;
    };

    const fetchCheckoutItems = () => {
      setLoading(true);

      return loadCheckoutItems()
      .then((data) => {
        if (!active) {
          return;
        }
        const safeItems = Array.isArray(data) ? data.filter(Boolean) : [];
        setItems(safeItems);
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setError(error.message || "Unable to load checkout items.");
        setItems([]);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    };

    fetchCheckoutItems();
    window.addEventListener("pageshow", fetchCheckoutItems);
    window.addEventListener("focus", fetchCheckoutItems);

    return () => {
      active = false;
      window.removeEventListener("pageshow", fetchCheckoutItems);
      window.removeEventListener("focus", fetchCheckoutItems);
    };
  }, [navigate, searchParams]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = item.product || item;
      const price = getProductPrice(product, item);
      const quantity = Number(item.quantity || 1);
      return sum + price * quantity;
    }, 0);
  }, [items]);
  const deliveryCharge = deliveryOptions.find((option) => option.location === deliveryLocation)?.charge ?? 120;
  const finalTotal = total + deliveryCharge;

  const placeOrder = async () => {
    if (placingRef.current || placing || loading) {
      return;
    }

    if (!items.length) {
      setError("Your checkout has no items.");
      return;
    }

    placingRef.current = true;
    setPlacing(true);
    setError("");

    const payload = {
      items: items
        .map((item) => {
          const product = item.product || item;

          return {
            product_id: product?.id || item.product_id,
            quantity: Number(item.quantity || 1),
          };
        })
        .filter((item) => item.product_id),
    };

    if (!payload.items.length) {
      setError("Unable to place order because product details are missing.");
      setPlacing(false);
      placingRef.current = false;
      return;
    }

    try {
      const orderResponse = await api.createOrder({
        ...payload,
        payment_method: paymentMethod,
        delivery_charge: deliveryCharge,
        delivery_location: deliveryLocation,
      });

      navigate("/payment", {
        state: {
          order: orderResponse,
          amount: finalTotal,
          payment_method: paymentMethod,
        },
      });
    } catch (err) {
      setError(err.message || "Unable to place order.");
    } finally {
      setPlacing(false);
      placingRef.current = false;
    }
  };

  return (
    <section className="checkout-page page-section">
      <div className="checkout-main">
        <div className="cart-header-panel">
          <div>
            <span>Secure Checkout</span>
            <h1>Review your order</h1>
            <p>Confirm your delivery details and review your items before payment.</p>
          </div>
          <strong>{items.length} items</strong>
        </div>

        {error && <p className="alert">{error}</p>}

        <section className="checkout-panel">
          <h2>Delivery address</h2>
          <label className="delivery-location-field">
            Delivery location
            <select value={deliveryLocation} onChange={(event) => setDeliveryLocation(event.target.value)}>
              {deliveryOptions.map((option) => (
                <option key={option.location} value={option.location}>
                  {option.location} {option.charge === 0 ? "- Free delivery" : `- Rs. ${option.charge}`}
                </option>
              ))}
            </select>
          </label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        </section>

        <section className="checkout-panel">
          <h2>Payment method</h2>
          <div className="payment-methods">
            {['Card', 'UPI', 'Cash on Delivery'].map((method) => (
              <label key={method}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                {method}
              </label>
            ))}
          </div>
        </section>

        <section className="checkout-panel">
          <h2>Review items</h2>

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <div className="empty-state compact">
              <h2>No checkout items</h2>
              <p>Your checkout is waiting for something you love. Add products to your basket or choose Buy Now from a product page.</p>
            </div>
          ) : (
            items.map((item, index) => {
              const product = item.product || item;
              const quantity = Number(item.quantity || 1);
              const price = getProductPrice(product, item);

              return (
                <div className="checkout-item" key={product?.id || item.product_id || index}>
                  <span>{product?.name || "Product"} x {quantity}</span>
                  <strong>Rs. {(price * quantity).toLocaleString("en-IN")}</strong>
                </div>
              );
            })
          )}
        </section>
      </div>

      <aside className="summary-box">
        <h2>Order Summary</h2>
        <p>Items: Rs. {total.toLocaleString("en-IN")}</p>
        <p>Delivery to {deliveryLocation}: {deliveryCharge === 0 ? "Free" : `Rs. ${deliveryCharge.toLocaleString("en-IN")}`}</p>
        <strong>Total: Rs. {finalTotal.toLocaleString("en-IN")}</strong>

        <button disabled={!items.length || loading || placing} aria-busy={placing} onClick={placeOrder} type="button">
          {placing ? "Creating order..." : "Continue to Payment"}
        </button>
      </aside>
    </section>
  );
}

export default Checkout;
