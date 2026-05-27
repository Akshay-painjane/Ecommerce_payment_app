import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { auth, getCategoriesWithFallback } from "../services/api.js";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.getUser();
  const [navCategories, setNavCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = user?.role === "admin";
  const routeCategory = location.pathname.startsWith("/category/")
    ? decodeURIComponent(location.pathname.replace("/category/", ""))
    : "";
  const selectedCategory = new URLSearchParams(location.search).get("category") || routeCategory;

  useEffect(() => {
    let active = true;

    getCategoriesWithFallback()
      .then((items) => {
        if (active) {
          setNavCategories(items);
        }
      })
      .catch(() => {
        if (active) {
          setNavCategories([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = form.get("q") || "";
    const category = form.get("category") || "";
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }

    if (value) {
      params.set("q", value);
    }

    const query = value ? `?q=${encodeURIComponent(value)}` : "";
    navigate(category ? `/category/${encodeURIComponent(category)}${query}` : `/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const onCategoryChange = (event) => {
    const category = event.target.value;

    navigate(category ? `/category/${encodeURIComponent(category)}` : "/products");
  };

  return (
    <header className={`topbar${scrolled ? " scrolled" : ""}`}>
      <div className="nav-main">
        <Link className="brand" to="/home">Style Store</Link>

        <div className="location">
          <span>Deliver to</span>
          <strong>India</strong>
        </div>

        <form className="searchbar" onSubmit={onSearch}>
          <select name="category" value={selectedCategory} onChange={onCategoryChange}>
            <option value="">All</option>
            {navCategories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
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

          {user && (
            <Link className="wishlist-nav-link" to="/wishlist">
              <span>Saved</span>
              <strong>Wishlist</strong>
            </Link>
          )}

          {user && (
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

        {!isAdmin && (
          <>
            <NavLink to="/categories">Categories</NavLink>
            {navCategories.map((category) => (
              <NavLink key={category.id} to={`/category/${encodeURIComponent(category.name)}`}>
                {category.name}
              </NavLink>
            ))}
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
