import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../services/api.js";

const methods = ["Credit Card", "UPI", "PayPal", "Razorpay", "Cash on Delivery"];

function Payment() {
  const { state } = useLocation();
  const order = state?.order;
  const amount = state?.amount || order?.total_price || 0;
  const [method, setMethod] = useState("Credit Card");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.dummyPayment({ order_id: order.id, amount, method });
      setReceipt(data);
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <section className="page-section"><h1>Payment</h1><p>No active order found.</p><Link className="primary-link" to="/cart">Return to cart</Link></section>;
  }

  if (receipt) {
    return (
      <section className="payment-success page-section">
        <div className="success-card">
          <h1>Payment successful</h1>
          <p>Your order has been placed with receipt ID <strong>{receipt.receipt_id}</strong>.</p>
          <p>Order ID: {receipt.order_id}</p>
          <p>Paid: Rs. {Number(receipt.amount).toLocaleString("en-IN")} via {receipt.method}</p>
          <Link className="primary-link" to="/products">Continue shopping</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="payment-layout page-section">
      <div className="payment-panel">
        <h1>Payment</h1>
        <p>Choose a payment method for Order #{order.id}.</p>
        {error && <p className="alert">{error}</p>}
        <div className="payment-methods">
          {methods.map((item) => (
            <label key={item}>
              <input checked={method === item} onChange={() => setMethod(item)} type="radio" />
              {item}
            </label>
          ))}
        </div>
        {method === "Credit Card" && (
          <div className="card-form">
            <input placeholder="Card number" />
            <input placeholder="Name on card" />
            <input placeholder="MM / YY" />
            <input placeholder="CVV" />
          </div>
        )}
        {method === "UPI" && <input placeholder="yourname@upi" />}
        {method === "PayPal" && <p className="soft-note">PayPal checkout placeholder for demo payments.</p>}
        {method === "Razorpay" && <p className="soft-note">Razorpay integration placeholder. Dummy payment will simulate success.</p>}
        <textarea placeholder="Billing address" defaultValue="221B Blue Avenue, Bengaluru, Karnataka 560001" />
        <button disabled={loading} onClick={pay} type="button">{loading ? "Processing..." : `Pay Rs. ${Number(amount).toLocaleString("en-IN")}`}</button>
      </div>
      <aside className="summary-box">
        <h2>Order Summary</h2>
        <p>Order #{order.id}</p>
        <p>Payment method: {method}</p>
        <strong>Total: Rs. {Number(amount).toLocaleString("en-IN")}</strong>
      </aside>
    </section>
  );
}

export default Payment;
