import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../services/api.js";

const getStatus = (user) => user?.account_status || user?.status || "Active account";

function AccountMark({ label }) {
  return <span className="account-card-mark" aria-hidden="true">{label}</span>;
}

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.me()
      .then((data) => {
        if (active) {
          setUser(data);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load your account details.");
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

  const logout = () => {
    auth.logout();
    navigate("/login");
  };

  const cards = [
    {
      label: "ORD",
      title: "Your Orders",
      subtitle: "Track recent orders and purchases.",
      to: "/orders",
    },
    {
      label: "SEC",
      title: "Login & Security",
      subtitle: "Review your account details.",
      to: "#login-security",
    },
    {
      label: "ADR",
      title: "Your Addresses",
      subtitle: "Manage your preferred delivery address for checkout.",
      to: "#addresses",
    },
    {
      label: "PAY",
      title: "Payment Options",
      subtitle: "Get help with secure payments, refunds, and payment options.",
      to: "/payment-help",
    },
    {
      label: "CRT",
      title: "Cart / Basket",
      subtitle: "Return to saved shopping items.",
      to: "/cart",
    },
    {
      label: "RET",
      title: "Returns & Refunds",
      subtitle: "Start returns and check refund timelines.",
      to: "/returns",
    },
    {
      label: "SUP",
      title: "Contact Us",
      subtitle: "Reach our support team for orders, payments, and returns.",
      to: "/contact",
    },
  ];

  if (user?.role === "admin") {
    cards.push({
      label: "ADM",
      title: "Store Dashboard",
      subtitle: "Manage Style Store operations.",
      to: "/admin",
    });
  }

  return (
    <section className="account-page page-section">
      <div className="account-page-heading account-hero-panel">
        <div>
          <span className="account-kicker">Your Style Store</span>
          <h1>Your Account</h1>
          <p>Hi {user?.name || user?.email || "there"}, manage orders, account details, and shopping shortcuts from one place.</p>
        </div>
        <div className="account-identity">
          {user?.profile_image ? (
            <img className="account-profile-image" src={user.profile_image} alt={user.name || "Profile"} />
          ) : (
            <span className="account-avatar">{String(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}</span>
          )}
          <strong>{getStatus(user)}</strong>
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {loading && <p className="loading">Loading your account...</p>}

      <div className="account-card-grid">
        {cards.map((card) => (
          <Link className="account-card" key={card.title} to={card.to}>
            <AccountMark label={card.label} />
            <span>
              <strong>{card.title}</strong>
              <small>{card.subtitle}</small>
            </span>
          </Link>
        ))}
        <button className="account-card account-logout-card" onClick={logout} type="button">
          <AccountMark label="OUT" />
          <span>
            <strong>Logout</strong>
            <small>Sign out of this account.</small>
          </span>
        </button>
      </div>

      <div className="account-detail-grid">
        <article className="account-detail-panel" id="login-security">
          <h2>Login & Security</h2>
          <dl>
            <div><dt>Name</dt><dd>{user?.name || "Not provided"}</dd></div>
            <div><dt>Email</dt><dd>{user?.email || "Not provided"}</dd></div>
            <div><dt>Role</dt><dd>{user?.role || "user"}</dd></div>
            <div><dt>Account status</dt><dd>{getStatus(user)}</dd></div>
          </dl>
        </article>

        <article className="account-detail-panel" id="addresses">
          <h2>Your Addresses</h2>
          <p>Use your preferred delivery address during checkout.</p>
          {user?.phone && <p>Contact phone: {user.phone}</p>}
        </article>

        <article className="account-detail-panel" id="payment-options">
          <h2>Payment Options</h2>
          <p>Choose a secure payment method when you complete checkout.</p>
          <Link className="secondary-link" to="/cart">Continue to basket</Link>
        </article>

        <article className="account-detail-panel" id="contact-us">
          <h2>Contact Us</h2>
          <p>Need help with an order or payment? Start from your orders or contact Style Store support.</p>
          <Link className="secondary-link" to="/orders">View orders</Link>
        </article>
      </div>
    </section>
  );
}

export default UserProfile;
