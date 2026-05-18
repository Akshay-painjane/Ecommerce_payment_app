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
    const load = productId
      ? api.getProduct(productId).then((product) => [{ product, quantity: 1 }])
      : api.getCart();

    load.then(setItems).finally(() => setLoading(false));
  }, [searchParams]);

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0), [items]);

  const placeOrder = async () => {
    const payload = {
      items: items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
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
          {loading ? <p>Loading...</p> : items.map((item) => (
            <div className="checkout-item" key={item.product?.id}>
              <span>{item.product?.name} x {item.quantity}</span>
              <strong>Rs. {(Number(item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}</strong>
            </div>
          ))}
        </section>
      </div>
      <aside className="summary-box">
        <h2>Order Summary</h2>
        <p>Items: Rs. {total.toLocaleString("en-IN")}</p>
        <p>Delivery: Free</p>
        <strong>Total: Rs. {total.toLocaleString("en-IN")}</strong>
        <button disabled={!items.length} onClick={placeOrder} type="button">Continue to Payment</button>
      </aside>
    </section>
  );
}

export default Checkout;

