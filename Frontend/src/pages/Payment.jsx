import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../services/api.js";

const methods = ["Card", "UPI", "Cash on Delivery"];

function Payment() {
  const { state } = useLocation();
  const [order, setOrder] = useState(() => state?.order || null);
  const amount = state?.amount || order?.total_price || 0;
  const [method, setMethod] = useState("Card");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(() => !state?.order);

  useEffect(() => {
    let active = true;

    if (order) {
      return () => {
        active = false;
      };
    }

    api.getOrders()
      .then((orders) => {
        if (!active) {
          return;
        }

        const orderList = Array.isArray(orders) ? orders : [];
        const pendingOrder = orderList
          .filter((item) => String(item.status || "").toUpperCase() === "PENDING")
          .sort((a, b) => Number(b.id) - Number(a.id))[0];

        setOrder(pendingOrder || null);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to restore payment order.");
        }
      })
      .finally(() => {
        if (active) {
          setRecovering(false);
        }
      });

    return () => {
      active = false;
    };
  }, [order]);

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.createPayment({ order_id: order.id, amount, method });
      setReceipt(data);
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (recovering) {
    return <section className="page-section"><p className="loading">Loading payment details...</p></section>;
  }

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
          <Link className="primary-link" to="/orders">View orders</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="payment-layout page-section">
      <div className="payment-panel">
        <h1>Payment</h1>
        <p>Choose a payment method for Order #{order.id}. A successful payment updates the backend payment row and marks the order as paid.</p>
        {error && <p className="alert">{error}</p>}
        <div className="payment-methods">
          {methods.map((item) => (
            <label key={item}>
              <input checked={method === item} onChange={() => setMethod(item)} type="radio" />
              {item}
            </label>
          ))}
        </div>
        {method === "Card" && (
          <div className="card-form">
            <input placeholder="Card number" />
            <input placeholder="Name on card" />
            <input placeholder="MM / YY" />
            <input placeholder="CVV" />
          </div>
        )}
        {method === "UPI" && <input placeholder="yourname@upi" />}
        {method === "Cash on Delivery" && <p className="soft-note">Pay when the order is delivered. The backend will record this payment method.</p>}
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
