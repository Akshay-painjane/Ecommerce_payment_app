import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../services/api.js";

const methods = ["Credit Card", "UPI", "Net Banking", "Cash on Delivery"];

function Payment() {
  const { state } = useLocation();
  const order = state?.order;
  const amount = state?.amount || order?.total_price || 0;
  const [method, setMethod] = useState("Credit Card");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    const data = await api.dummyPayment({ order_id: order.id, amount, method });
    setReceipt(data);
    setLoading(false);
  };

  if (!order) {
    return <section className="page-section"><h1>Payment</h1><p>No active order found.</p><Link to="/cart">Return to cart</Link></section>;
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
    <section className="payment-page page-section">
      <div className="payment-panel">
        <h1>Payment</h1>
        <p>Choose a dummy payment method for Order #{order.id}.</p>
        <div className="payment-methods">
          {methods.map((item) => (
            <label key={item}>
              <input checked={method === item} onChange={() => setMethod(item)} type="radio" />
              {item}
            </label>
          ))}
        </div>
        <button disabled={loading} onClick={pay} type="button">{loading ? "Processing..." : `Pay Rs. ${Number(amount).toLocaleString("en-IN")}`}</button>
      </div>
    </section>
  );
}

export default Payment;

