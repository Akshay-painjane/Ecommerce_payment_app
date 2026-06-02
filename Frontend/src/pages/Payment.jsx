import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../services/api.js";

function Payment() {
  const { state } = useLocation();
  const initialOrderData = state?.order || null;
  const initialMethod = state?.payment_method || "Card";
  const [orderData, setOrderData] = useState(() => initialOrderData);
  const order = orderData?.order || orderData;
  const razorpayOrder = orderData?.razorpay_order || order?.razorpay_order || null;
  const amount = state?.amount || order?.total_price || 0;
  const [method, setMethod] = useState(initialMethod);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(() => !order);

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

  const loadRazorpayScript = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Unable to load Razorpay SDK."));
    document.body.appendChild(script);
  });

  const openRazorpay = async () => {
    if (!razorpayOrder) {
      throw new Error("Razorpay order is unavailable.");
    }

    await loadRazorpayScript();

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      throw new Error("Razorpay key is not configured. Set VITE_RAZORPAY_KEY_ID in the frontend environment.");
    }

    const options = {
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Style Store",
      description: `Payment for order #${order?.id || "N/A"}`,
      order_id: razorpayOrder.id,
      handler: async (response) => {
        try {
          setLoading(true);
          const data = await api.verifyPayment({
            order_id: order.id,
            gateway_order_id: response.razorpay_order_id,
            gateway_payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            method,
          });
          setReceipt(data);
        } catch (verifyError) {
          setError(verifyError.message || "Unable to verify payment.");
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        email: "",
      },
      theme: {
        color: "#FFA500",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const pay = async () => {
    setLoading(true);
    setError("");

    try {
      if (razorpayOrder) {
        await openRazorpay();
        return;
      }

      const data = await api.createPayment({
        order_id: order.id,
        amount,
        method,
        gateway: "cod",
      });
      setReceipt(data);
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      if (!razorpayOrder) {
        setLoading(false);
      }
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

  const displayMethod = order?.payment_method || method;
  const isOnlinePayment = !!razorpayOrder;

  return (
    <section className="payment-layout page-section">
      <div className="payment-panel">
        <h1>Payment</h1>
        <p>
          {isOnlinePayment
            ? "Complete the payment securely through Razorpay."
            : "Your order will be processed with Cash on Delivery."
          }
        </p>
        {error && <p className="alert">{error}</p>}
        <div className="payment-details">
          <p><strong>Order #{order.id}</strong></p>
          <p>Amount: Rs. {Number(amount).toLocaleString("en-IN")}</p>
          <p>Payment method: {displayMethod}</p>
        </div>
        <button disabled={loading} onClick={pay} type="button">
          {loading ? "Processing..." : isOnlinePayment ? `Pay Rs. ${Number(amount).toLocaleString("en-IN")}` : `Confirm COD order`}
        </button>
      </div>
      <aside className="summary-box">
        <h2>Order Summary</h2>
        <p>Items: {order.items?.length ?? order.order_items?.length ?? 0}</p>
        <strong>Total: Rs. {Number(amount).toLocaleString("en-IN")}</strong>
      </aside>
    </section>
  );
}

export default Payment;
