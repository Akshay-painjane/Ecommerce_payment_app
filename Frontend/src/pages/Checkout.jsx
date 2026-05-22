import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";

function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState("221B Blue Avenue, Bengaluru, Karnataka 560001");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productId = searchParams.get("product");

    const loadCheckoutItems = async () => {
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

    loadCheckoutItems()
      .then((data) => {
        const safeItems = Array.isArray(data) ? data.filter(Boolean) : [];
        setItems(safeItems);
      })
      .catch((error) => {
        console.error("Checkout load error:", error);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = item.product || item;
      const price = Number(product?.price || 0);
      const quantity = Number(item.quantity || 1);
      return sum + price * quantity;
    }, 0);
  }, [items]);

  const placeOrder = async () => {
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

    const order = await api.createOrder(payload);
    navigate("/payment", { state: { order, amount: total } });
  };

  return (
    <section className="checkout-page page-section">
      <div className="checkout-main">
        <h1>Checkout</h1>

        <section className="checkout-panel">
          <h2>Delivery address</h2>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        </section>

        <section className="checkout-panel">
          <h2>Review items</h2>

          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p>No items found.</p>
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

        <button disabled={!items.length || loading} onClick={placeOrder} type="button">
          Continue to Payment
        </button>
      </aside>
    </section>
  );
}

export default Checkout;
