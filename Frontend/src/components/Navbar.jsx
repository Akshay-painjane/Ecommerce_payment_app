import { useNavigate } from "react-router-dom";

function Navbar({ cartCount }) {

  const navigate = useNavigate();

  return (
    <header className="top-navbar">

      <div
        className="logo"
        onClick={() => navigate("/products")}
      >
        Style Store
      </div>

      <div className="search-box">
        <input placeholder="Search products" />

        <button>🔍</button>
      </div>

      <div className="nav-item">
        <span>Hello</span>

        <b>
          {localStorage.getItem("user")}
        </b>
      </div>

      <div
        className="cart"
        onClick={() => navigate("/checkout")}
      >
        🛒 Cart ({cartCount})
      </div>

      <button
        className="logout"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        Logout
      </button>
    </header>
  );
}

export default Navbar;