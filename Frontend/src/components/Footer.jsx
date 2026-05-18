import { Link } from "react-router-dom";

const socialLinks = [
  { label: "Facebook", short: "f", href: "https://facebook.com" },
  { label: "Instagram", short: "ig", href: "https://instagram.com" },
  { label: "LinkedIn", short: "in", href: "https://linkedin.com" },
  { label: "YouTube", short: "yt", href: "https://youtube.com" },
];

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <button className="support-float" type="button" onClick={() => window.open("tel:+911234567890", "_self")}>
        Call | Chat
      </button>
      <footer className="footer">
        <button className="back-top" type="button" onClick={scrollToTop}>Back to top</button>
        <div className="footer-grid">
          <section>
            <h3>Get to Know Us</h3>
            <Link to="/home">About Style Store</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/products">Products</Link>
            <Link to="/cart">Basket</Link>
          </section>
          <section>
            <h3>Connect with Us</h3>
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
            ))}
          </section>
          <section>
            <h3>Make Money with Us</h3>
            <Link to="/admin/add-product">Sell on Style Store</Link>
            <Link to="/admin/products">Manage Products</Link>
            <Link to="/admin">Admin Dashboard</Link>
            <Link to="/checkout">Checkout Tools</Link>
          </section>
          <section>
            <h3>Let Us Help You</h3>
            <Link to="/login">Your Account</Link>
            <Link to="/cart">Returns Centre</Link>
            <Link to="/products">Shipping Rates</Link>
            <Link to="/payment">Payment Help</Link>
          </section>
        </div>
        <div className="footer-bottom">
          <strong>Style Store</strong>
          <div className="socials" aria-label="Social links">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                {link.short}
              </a>
            ))}
          </div>
          <div className="app-buttons">
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer">App Store</a>
            <a href="https://play.google.com/store" target="_blank" rel="noreferrer">Google Play</a>
          </div>
        </div>
        <div className="footer-cta-row">
          <Link className="footer-cta primary" to="/products">Shop Deals</Link>
          <Link className="footer-cta outline" to="/dashboard">Open Dashboard</Link>
          <Link className="footer-cta soft" to="/admin">Admin Console</Link>
        </div>
      </footer>
    </>
  );
}

export default Footer;
