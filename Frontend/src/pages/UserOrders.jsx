import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

const getPaymentLabel = (order) => {
  const status = String(order.status || "").toUpperCase();

  if (status === "PAID") {
    return "Payment completed";
  }

  if (status === "PENDING") {
    return "Payment pending";
  }

  return order.payment_status || "Payment not available";
};

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchOrders = () => {
      setLoading(true);
      setError("");

      return api.getOrders()
      .then((data) => {
        if (active) {
          const orderList = Array.isArray(data) ? data : [];
          setOrders(orderList.sort((a, b) => Number(b.id) - Number(a.id)));
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load orders.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    };

    fetchOrders();
    window.addEventListener("pageshow", fetchOrders);
    window.addEventListener("focus", fetchOrders);

    return () => {
      active = false;
      window.removeEventListener("pageshow", fetchOrders);
      window.removeEventListener("focus", fetchOrders);
    };
  }, []);

  return (
    <section className="account-orders page-section">
      <div className="account-page-heading account-hero-panel">
        <div>
          <Link to="/account">Your Account</Link>
          <h1>Your Orders</h1>
          <p>Review your recent purchases, payment status, and order details in one place.</p>
        </div>
        <Link className="secondary-link" to="/products">Keep Shopping</Link>
      </div>

      {error && <p className="alert">{error}</p>}
      {loading && <p className="loading">Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Placed orders will appear here after checkout.</p>
          <Link className="primary-link" to="/products">Browse products</Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="account-order-list">
          {orders.map((order) => (
            <article className="account-order" key={order.id}>
              <div className="order-summary-row">
                <div>
                  <span>Order</span>
                  <strong>#{order.id}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong className={`status-pill ${String(order.status || "").toLowerCase()}`}>{order.status || "Placed"}</strong>
                </div>
                <div>
                  <span>Payment</span>
                  <strong>{getPaymentLabel(order)}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>Rs. {Number(order.total_price || 0).toLocaleString("en-IN")}</strong>
                </div>
              </div>
              {Array.isArray(order.items) && order.items.length > 0 && (
                <div className="order-items">
                  {order.items.map((item) => (
                    <div className="order-item-row" key={item.id || `${order.id}-${item.product_id}`}>
                      <span>{item.product?.name || `Product #${item.product_id}`}</span>
                      <small>Qty {item.quantity} · Rs. {Number(item.price || 0).toLocaleString("en-IN")}</small>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default UserOrders;
