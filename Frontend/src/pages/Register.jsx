import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://127.0.0.1:8000";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API}/auth/register`, {
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

      alert("Registration Successful");

      navigate("/");
    } catch (error) {
      alert("Backend server not running");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand">Style Store</h1>

        <h2>Create Account</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          onChange={handleChange}
        />

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

        <button onClick={handleRegister}>
          Register
        </button>

        <Link to="/">
          <p>Already have account? Sign in</p>
        </Link>
      </div>
    </div>
  );
}

export default Register;