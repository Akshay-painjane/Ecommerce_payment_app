import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.login(form);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Sign in</h1>
        {error && <p className="alert">{error}</p>}
        <label>Email<input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" required /></label>
        <label>Password<input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" required /></label>
        <button disabled={loading} type="submit">{loading ? "Signing in..." : "Login"}</button>
        <p>New customer? <Link to="/register">Create your Style Store account</Link></p>
      </form>
    </section>
  );
}

export default Login;

