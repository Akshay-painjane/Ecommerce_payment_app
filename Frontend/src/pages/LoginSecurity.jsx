import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, auth } from "../services/api.js";

const getStatus = (user) => user?.account_status || user?.status || "Active";

function SecurityIcon({ type }) {
  return <span className={`security-icon ${type}`} aria-hidden="true">{type === "warn" ? "!" : "i"}</span>;
}

function SecurityRow({ icon = "info", label, value, action }) {
  return (
    <div className="security-row">
      <SecurityIcon type={icon} />
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
        <span>Login and Security</span>
      </nav>

      <div className="security-layout">
        <div className="account-subpage-heading">
          <div>
            <h1>Login and Security</h1>
            <p>Manage the core details that protect your Style Store account.</p>
          </div>
        </div>

        {error && <p className="alert">{error}</p>}

        <article className="security-list-card">
          <SecurityRow label="Name" value={user?.name || "Not provided"} action="Edit" />
          <SecurityRow label="Email" value={user?.email || "Add an email address"} action={user?.email ? "Edit" : "Add"} />
          <SecurityRow label="Primary mobile number" value={user?.phone || user?.mobile || "Not provided"} action="Edit" />
          <SecurityRow icon="warn" label="Password" value="Keep your password private and unique to Style Store." action={user ? "Change" : "Set up"} />
          <SecurityRow label="Account status" value={getStatus(user)} action="View" />
          <SecurityRow icon="warn" label="Compromised account?" value="Take quick steps if you notice unusual account activity." action="Start" />
        </article>
      </div>
    </section>
  );
}

export default LoginSecurity;
