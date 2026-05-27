import { Link } from "react-router-dom";
import { auth } from "../services/api.js";

const socialLinks = [
  { label: "Facebook", short: "F", href: "https://facebook.com" },
  { label: "Instagram", short: "IG", href: "https://instagram.com" },
  { label: "LinkedIn", short: "IN", href: "https://linkedin.com" },
  { label: "YouTube", short: "YT", href: "https://youtube.com" },
];

function Footer() {
  const user = auth.getUser();
  const isAdmin = user?.role === "admin";
  const isUser = Boolean(user) && user?.role !== "admin";
  const accountPath = user ? "/account" : "/login";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <button
        className="support-float"
        type="button"
        onClick={() => window.open("tel:+911234567890", "_self")}
      >
        Call | Chat
      </button>

      <footer className="footer">
        <button className="back-top" type="button" onClick={scrollToTop}>
          Back to top
        </button>

        <div className="footer-grid">
          <section>
            <h3>Get to Know Us</h3>
            <Link to="/about">About Style Store</Link>
            <Link to="/products">Products</Link>

            {!isAdmin && (
              <>
                <Link to="/categories">Categories</Link>
                {isUser && <Link to="/cart">Basket</Link>}
                {isUser && <Link to="/wishlist">Wishlist</Link>}
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/dashboard">Store Dashboard</Link>
                <Link to="/admin">Admin Dashboard</Link>
              </>
            )}
          </section>

          <section>
            <h3>Connect with Us</h3>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
          </section>

          <section>
            <h3>Make Money with Us</h3>

            {isAdmin ? (
              <>
                <Link to="/admin/add-product">Sell on Style Store</Link>
                <Link to="/admin/products">Manage Products</Link>
                <Link to="/admin">Admin Dashboard</Link>
                <Link to="/dashboard">Store Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/products">Today&apos;s Deals</Link>
                <Link to="/products">Popular Products</Link>
                <Link to="/categories">Shop by Category</Link>
                <Link to="/login">Become a Seller</Link>
              </>
            )}
          </section>

          <section>
            <h3>Let Us Help You</h3>

            {!isAdmin && (
              <>
                <Link to={accountPath}>Your Account</Link>
                {isUser && <Link to="/wishlist">Your Wishlist</Link>}
                <Link to="/returns">Returns Centre</Link>
                <Link to="/shipping-rates">Shipping Rates</Link>
                <Link to="/payment-help">Payment Help</Link>
                <Link to="/contact">Contact Support</Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/products">Product Management</Link>
                <Link to="/admin/add-product">Add Product</Link>
                <Link to="/admin">Admin Help</Link>
                <Link to="/home">Go to Store</Link>
              </>
            )}
          </section>
        </div>

        <div className="footer-bottom">
          <strong>Style Store</strong>
          <div className="footer-contact">
            <a href="mailto:monikachebrolu1@gmail.com">monikachebrolu1@gmail.com</a>
            <a href="mailto:deepthiupadhyayula@gmail.com">deepthiupadhyayula@gmail.com</a>
          </div>

          <div className="socials" aria-label="Social links">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
              >
                {link.short}
              </a>
            ))}
          </div>

          <div className="app-buttons">
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noreferrer"
            >
              App Store
            </a>

            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noreferrer"
            >
              Google Play
            </a>
          </div>
        </div>

        <div className="footer-cta-row">
          <Link className="footer-cta primary" to="/products">
            Shop Deals
          </Link>

          {isAdmin && (
            <>
              <Link className="footer-cta outline" to="/dashboard">
                Open Dashboard
              </Link>

              <Link className="footer-cta soft" to="/admin">
                Admin Console
              </Link>
            </>
          )}

          {isUser && (
            <>
              <Link className="footer-cta outline" to="/wishlist">
                View Wishlist
              </Link>

              <Link className="footer-cta soft" to="/cart">
                View Basket
              </Link>
            </>
          )}
        </div>
      </footer>
    </>
  );
}

export default Footer;
