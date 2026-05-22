import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../services/api.js";

function Navbar() {
  const navigate = useNavigate();
  const user = auth.getUser();

  const isAdmin = user?.role === "admin";
  const isUser = Boolean(user) && user?.role !== "admin";

  const onSearch = (event) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    navigate(`/products?q=${encodeURIComponent(value || "")}`);
  };

  return (
    <header className="topbar">
      <div className="nav-main">
        <Link className="brand" to="/home">Style Store</Link>

        <div className="location">
          <span>Deliver to</span>
          <strong>India</strong>
        </div>

        <form className="searchbar" onSubmit={onSearch}>
          <select name="category">
            <option>All</option>
            <option>Mobiles</option>
            <option>Fashion</option>
            <option>Home</option>
          </select>

          <input name="q" placeholder="Search Style Store" />
          <button type="submit">Search</button>
        </form>

        <div className="nav-actions">
          {!user && (
            <Link to="/login">
              <span>Hello, sign in</span>
              <strong>Account</strong>
            </Link>
          )}

          {user && (
            <Link to="/account">
              <span>Hello, {user.name || user.email || "there"}</span>
              <strong>Account</strong>
            </Link>
          )}

          {isUser && (
            <Link className="cart-link" to="/cart">
              <span>Cart</span>
              <strong>Basket</strong>
            </Link>
          )}

          {isAdmin && (
            <>
              <Link to="/dashboard">
                <span>Store</span>
                <strong>Dashboard</strong>
              </Link>

              <Link to="/admin">
                <span>Admin</span>
                <strong>Dashboard</strong>
              </Link>
            </>
          )}
        </div>
      </div>

      <nav className="nav-strip">
        <NavLink to="/home">Home</NavLink>

        {!user && (
          <>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/login">Login</NavLink>
          </>
        )}

        {isUser && (
          <>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/products?category=Mobiles">Mobiles</NavLink>
            <NavLink to="/products?category=Electronics">Electronics</NavLink>
            <NavLink to="/products?category=Fashion">Fashion</NavLink>
            <NavLink to="/products?category=Home">Home</NavLink>
            <NavLink to="/products?category=Beauty">Beauty</NavLink>
            <NavLink to="/products?category=Grocery">Grocery</NavLink>
          </>
        )}

        {isAdmin && (
          <>
            <NavLink to="/admin">Admin Dashboard</NavLink>
            <NavLink to="/admin/add-product">Add Product</NavLink>
            <NavLink to="/admin/products">Manage Products</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
