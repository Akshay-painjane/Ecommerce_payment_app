import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../services/api.js";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await api.login(form);
      auth.saveSession(data);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page auth-gradient">
      <form className="auth-card glass-card login-card" onSubmit={submit}>
        <div className="auth-logo">Style Store</div>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue shopping, track orders, and manage your cart.</p>

        {error && <p className="alert">{error}</p>}

        <label>
          Email
          <input name="email" value={form.email} onChange={update} type="email" placeholder="you@example.com" required />
        </label>

        <label>
          Password
          <div className="password-field">
            <input name="password" value={form.password} onChange={update} type={showPassword ? "text" : "password"} placeholder="Enter password" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button className="auth-submit" disabled={loading} type="submit">
          {loading ? "Signing in..." : "Login"}
        </button>

        <div className="social-login-row">
          <button type="button">Continue with Google</button>
          <button type="button">Continue with Facebook</button>
        </div>

        <p className="auth-switch">
          New customer? <Link to="/register">Create your Style Store account</Link>
        </p>
      </form>
    </section>
  );
}

export default Login;
