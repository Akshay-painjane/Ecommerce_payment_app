import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../services/api.js";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profile_image: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    let score = 0;
    if (form.password.length >= 6) score += 25;
    if (/[A-Z]/.test(form.password)) score += 25;
    if (/[0-9]/.test(form.password)) score += 25;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 25;
    return score;
  }, [form.password]);

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const uploadPreview = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profile_image: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        profile_image: form.profile_image,
      });
      const data = await api.login({ email: form.email, password: form.password });
      auth.saveSession(data);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page auth-gradient">
      <form className="auth-card glass-card register-card" onSubmit={submit}>
        <div className="auth-logo">Style Store</div>
        <h1>Create account</h1>
        <p className="auth-subtitle">Join Style Store for faster checkout, orders, and personalized deals.</p>

        {error && <p className="alert">{error}</p>}

        <div className="form-grid">
          <label>Name<input name="name" value={form.name} onChange={update} required /></label>
          <label>Email<input name="email" value={form.email} onChange={update} type="email" required /></label>
          <label>Phone<input name="phone" value={form.phone} onChange={update} type="tel" placeholder="+91 98765 43210" /></label>
          <label>Profile image<input onChange={uploadPreview} type="file" accept="image/*" /></label>
          <label>Password<input name="password" value={form.password} onChange={update} type="password" minLength="6" required /></label>
          <label>Confirm password<input name="confirmPassword" value={form.confirmPassword} onChange={update} type="password" minLength="6" required /></label>
        </div>

        <div className="strength-wrap">
          <span>Password strength</span>
          <div className="strength-track"><div style={{ width: `${strength}%` }} /></div>
        </div>

        {form.profile_image && <img className="profile-preview" src={form.profile_image} alt="Profile preview" />}

        <button className="auth-submit" disabled={loading} type="submit">
          {loading ? "Creating..." : "Register"}
        </button>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </section>
  );
}

export default Register;
