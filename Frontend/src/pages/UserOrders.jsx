import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

const RETURN_STORAGE_KEY = "style-store-return-requests";
const RETURN_REASONS = [
  "Wrong product received",
  "Damaged product",
  "Quality issue",
  "No longer needed",
  "Other",
];

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

const getReturnRequests = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(RETURN_STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const getProductName = (order) => {
  const items = Array.isArray(order.items) ? order.items : [];
  const firstItem = items[0];
  const firstName = firstItem?.product?.name || (firstItem?.product_id ? `Product #${firstItem.product_id}` : "Product not available");

  if (items.length > 1) {
    return `${firstName} + ${items.length - 1} more`;
  }

  return firstName;
};

const canRequestReturn = (order) => ["delivered", "paid"].includes(String(order.status || "").toLowerCase());

function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnRequests, setReturnRequests] = useState(() => getReturnRequests());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState(RETURN_REASONS[0]);
  const [returnComments, setReturnComments] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  const hasReturnRequest = (orderId) => returnRequests.some((request) => String(request.orderId) === String(orderId));

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setReturnReason(RETURN_REASONS[0]);
    setReturnComments("");
    setSuccessMessage("");
  };

  const closeReturnModal = () => {
    setSelectedOrder(null);
    setReturnComments("");
  };

  const submitReturnRequest = (event) => {
    event.preventDefault();

    if (!selectedOrder) {
      return;
    }

    const nextRequest = {
      id: `${selectedOrder.id}-${Date.now()}`,
      orderId: selectedOrder.id,
      productName: getProductName(selectedOrder),
      reason: returnReason,
      comments: returnComments.trim(),
      status: "Return Requested",
      submittedAt: new Date().toISOString(),
    };

    const nextRequests = [
      ...returnRequests.filter((request) => String(request.orderId) !== String(selectedOrder.id)),
      nextRequest,
    ];

    localStorage.setItem(RETURN_STORAGE_KEY, JSON.stringify(nextRequests));
    setReturnRequests(nextRequests);
    setSelectedOrder(null);
    setSuccessMessage("Return request submitted successfully.");
  };

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
      {successMessage && <p className="success return-success-message">{successMessage}</p>}
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
          {orders.map((order) => {
            const returnRequested = hasReturnRequest(order.id);

            return (
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
                  {canRequestReturn(order) && (
                    <div className="order-return-action">
                      {returnRequested && <span className="return-requested-badge">Return Requested</span>}
                      <button
                        className="return-order-btn"
                        disabled={returnRequested}
                        onClick={() => openReturnModal(order)}
                        type="button"
                      >
                        <span className="return-order-icon" aria-hidden="true">&#8635;</span>
                        {returnRequested ? "Return Requested" : "Return Order"}
                      </button>
                    </div>
                  )}
                </div>
                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div className="order-item-row" key={item.id || `${order.id}-${item.product_id}`}>
                        <span>{item.product?.name || `Product #${item.product_id}`}</span>
                        <small>Qty {item.quantity} - Rs. {Number(item.price || 0).toLocaleString("en-IN")}</small>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="return-modal-backdrop" role="presentation">
          <div className="return-modal" role="dialog" aria-modal="true" aria-labelledby="return-modal-title">
            <div className="return-modal-header">
              <div>
                <h2 id="return-modal-title">Return Order</h2>
                <p>Order #{selectedOrder.id}</p>
              </div>
              <button aria-label="Close return request" onClick={closeReturnModal} type="button">x</button>
            </div>

            <form className="return-form" onSubmit={submitReturnRequest}>
              <div className="return-order-product">
                <span>Product Name</span>
                <strong>{getProductName(selectedOrder)}</strong>
              </div>

              <label>
                Reason for return
                <select value={returnReason} onChange={(event) => setReturnReason(event.target.value)}>
                  {RETURN_REASONS.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </label>

              <label>
                Additional comments
                <textarea
                  placeholder="Add any details that can help us review your request."
                  value={returnComments}
                  onChange={(event) => setReturnComments(event.target.value)}
                />
              </label>

              <div className="return-form-actions">
                <button className="return-cancel-btn" onClick={closeReturnModal} type="button">Cancel</button>
                <button className="return-submit-btn" type="submit">Submit Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default UserOrders;
