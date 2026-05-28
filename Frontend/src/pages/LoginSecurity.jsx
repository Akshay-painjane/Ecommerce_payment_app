import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, auth } from "../services/api.js";

const getStatus = (user) => user?.account_status || user?.status || "Active";

function SecurityIcon({ type, name }) {
  const icons = {
    user: (
      <>
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4 20a8 8 0 0 1 16 0" />
      </>
    ),
    email: (
      <>
        <path d="M4 6h16v12H4z" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    phone: (
      <path d="M8 5c0 6.1 4.9 11 11 11v3a2 2 0 0 1-2.2 2A15 15 0 0 1 3 7.2 2 2 0 0 1 5 5h3Z" />
    ),
    lock: (
      <>
        <path d="M6 10h12v10H6z" />
        <path d="M9 10V7a3 3 0 0 1 6 0v3" />
      </>
    ),
    check: (
      <>
        <path d="M12 21s7-3.8 7-10V5l-7-3-7 3v6c0 6.2 7 10 7 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3 2.7 19h18.6L12 3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    shield: (
      <>
        <path d="M12 21s7-3.8 7-10V5l-7-3-7 3v6c0 6.2 7 10 7 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  };

  return (
    <span className={`security-icon ${type}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {icons[name]}
      </svg>
    </span>
  );
}

function SecurityRow({ icon = "user", tone = "info", label, value, action }) {
  return (
    <div className="security-row">
      <SecurityIcon type={tone} name={icon} />
      <div>
        <strong>{label}</strong>
        <span>{value}</span>
      </div>
      <button type="button">{action}</button>
    </div>
  );
}

function LoginSecurity() {
  const [user, setUser] = useState(auth.getUser());
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
          setError(err.message || "Unable to load account security details.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="account-subpage page-section">
      <nav className="account-breadcrumb" aria-label="Breadcrumb">
        <Link to="/account">Your account</Link>
        <span>&gt;</span>
        <span>Login & Security</span>
      </nav>

      <div className="security-layout">
        <div className="security-hero">
          <SecurityIcon type="hero" name="shield" />
          <div>
            <h1>Login & Security</h1>
            <p>Manage the core details that protect your Style Store account.</p>
          </div>
        </div>

        {error && <p className="alert">{error}</p>}

        <article className="security-list-card">
          <SecurityRow icon="user" label="Name" value={user?.name || "Not provided"} action="Edit" />
          <SecurityRow icon="email" label="Email" value={user?.email || "Add an email address"} action={user?.email ? "Edit" : "Add"} />
          <SecurityRow icon="phone" label="Primary mobile number" value={user?.phone || user?.mobile || "Not provided"} action="Edit" />
          <SecurityRow icon="lock" tone="warn" label="Password" value="Keep your password private and unique to Style Store." action={user ? "Change" : "Set up"} />
          <SecurityRow icon="check" label="Account status" value={getStatus(user)} action="View" />
          <SecurityRow icon="alert" tone="warn" label="Compromised account?" value="Take quick steps if you notice unusual account activity." action="Start" />
        </article>
      </div>
    </section>
  );
}

export default LoginSecurity;
