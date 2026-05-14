import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail);
        return;
      }

      localStorage.setItem("user", data.user);

      navigate("/products");
    } catch (error) {
      alert("Backend server not running");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand">Style Store</h1>

        <h2>Sign in</h2>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          onChange={handleChange}
        />

        <button onClick={handleLogin}>
          Sign in
        </button>

        <p>
          New customer?
        </p>

        <Link to="/register">
          <button className="outline-btn">
            Create your account
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Login;