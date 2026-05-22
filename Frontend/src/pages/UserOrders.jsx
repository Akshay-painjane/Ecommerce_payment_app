import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.getOrders()
      .then((data) => {
        if (active) {
          setOrders(Array.isArray(data) ? data : []);
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

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="account-orders page-section">
      <div className="account-page-heading">
        <div>
          <Link to="/account">Your Account</Link>
          <h1>Your Orders</h1>
        </div>
        <Link className="secondary-link" to="/products">Keep Shopping</Link>
      </div>

      {error && <p className="alert">{error}</p>}
      {loading && <p className="loading">Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <div className="account-placeholder">
          <h2>No orders yet</h2>
          <p>Placed orders will appear here after checkout.</p>
          <Link className="primary-link" to="/products">Browse products</Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="account-order-list">
          {orders.map((order) => (
            <article className="account-order" key={order.id}>
              <div>
                <span>Order</span>
                <strong>#{order.id}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{order.status || "Placed"}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>Rs. {Number(order.total_price || 0).toLocaleString("en-IN")}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default UserOrders;
