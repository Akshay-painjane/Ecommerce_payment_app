import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../services/api.js";

function Navbar() {
  const navigate = useNavigate();
  const user = auth.getUser();

  const logout = () => {
    auth.logout();
    navigate("/");
  };

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
          <select name="category" aria-label="Category">
            <option>All</option>
            <option>Mobiles</option>
            <option>Fashion</option>
            <option>Home</option>
          </select>
          <input name="q" placeholder="Search Style Store" />
          <button type="submit">Search</button>
        </form>
        <div className="nav-actions">
          {user ? (
            <button className="nav-link-button" onClick={logout} type="button">
              <span>Hello, {user.name?.split(" ")[0]}</span>
              <strong>Logout</strong>
            </button>
          ) : (
            <Link to="/login"><span>Hello, sign in</span><strong>Account</strong></Link>
          )}
          <Link to="/dashboard"><span>Store</span><strong>Dashboard</strong></Link>
          <Link to="/admin"><span>Admin</span><strong>Dashboard</strong></Link>
          <Link className="cart-link" to="/cart"><span>Cart</span><strong>Basket</strong></Link>
        </div>
      </div>
      <nav className="nav-strip">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/products">Categories</NavLink>
        <NavLink to="/products?category=Mobiles">Mobiles</NavLink>
        <NavLink to="/products?category=Electronics">Electronics</NavLink>
        <NavLink to="/products?category=Fashion">Fashion</NavLink>
        <NavLink to="/products?category=Home">Home</NavLink>
        <NavLink to="/products?category=Beauty">Beauty</NavLink>
        <NavLink to="/products?category=Grocery">Grocery</NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
