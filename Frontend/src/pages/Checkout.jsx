import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, tokenStore } from "../services/api.js";

function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState("221B Blue Avenue, Bengaluru, Karnataka 560001");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

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
        return [{ product, quantity: 1 }];
      }

      const cartItems = await api.getCart();

      const cartList = Array.isArray(cartItems) ? cartItems : [];

      const itemsWithProducts = await Promise.all(
        cartList.map(async (item) => {
          const id = item.product_id || item.product?.id || item.id;
          const product = item.product || (id ? await api.getProduct(id) : null);

          return {
            ...item,
            product,
            quantity: Number(item.quantity || 1),
          };
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
      const price = Number(product?.price || 0);
      const quantity = Number(item.quantity || 1);
      return sum + price * quantity;
    }, 0);
  }, [items]);

  const placeOrder = async () => {
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

    try {
      const order = await api.createOrder(payload);
      navigate("/payment", { state: { order, amount: total } });
    } catch (err) {
      setError(err.message || "Unable to place order.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="checkout-page page-section">
      <div className="checkout-main">
        <div className="cart-header-panel">
          <div>
            <span>Secure Checkout</span>
            <h1>Review your order</h1>
            <p>Orders are created against the currently signed-in account.</p>
          </div>
          <strong>{items.length} items</strong>
        </div>

        {error && <p className="alert">{error}</p>}

        <section className="checkout-panel">
          <h2>Delivery address</h2>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        </section>

        <section className="checkout-panel">
          <h2>Review items</h2>

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <div className="empty-state compact">
              <h2>No checkout items</h2>
              <p>Add products to your cart or use Buy Now from a product page.</p>
            </div>
          ) : (
            items.map((item, index) => {
              const product = item.product || item;
              const quantity = Number(item.quantity || 1);
              const price = Number(product?.price || 0);

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
        <p>Delivery: Free</p>
        <strong>Total: Rs. {total.toLocaleString("en-IN")}</strong>

        <button disabled={!items.length || loading || placing} onClick={placeOrder} type="button">
          {placing ? "Creating order..." : "Continue to Payment"}
        </button>
      </aside>
    </section>
  );
}

export default Checkout;
