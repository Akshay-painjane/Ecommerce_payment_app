import { useState } from "react";
import "./App.css";


function App() {
  const [page, setPage] = useState("login");
  const [cart, setCart] = useState([]);

  const products = [
    { name: "Smart Watch", price: 40000, img: "⌚", tag: "Best Seller" },
    { name: "iPhone 15 Pro", price: 129999, img: "📱", tag: "Best Seller" },
    { name: "MacBook Air", price: 89999, img: "💻", tag: "Deal" },
    { name: "Sony Headphones", price: 12999, img: "🎧", tag: "Top Rated" },
    { name: "Smart Watch", price: 3999, img: "⌚", tag: "New" },
    { name: "Gaming Mouse", price: 1299, img: "🖱️", tag: "Offer" },
    { name: "Travel Backpack", price: 999, img: "🎒", tag: "Hot" },
    { name: "Smart Watch", price: 10000, img: "⌚", tag: "New" },
    
    
  ];

  const addToCart = (product) => {
    setCart([...cart, product]);
    setPage("checkout");
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (page === "login") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="brand">Style Store</h1>
          <h2>Sign in</h2>

          <input type="email" placeholder="Email or mobile number" />
          <input type="password" placeholder="Password" />

          <button onClick={() => setPage("dashboard")}>Sign in</button>

          <p>New customer?</p>

          <button className="outline-btn" onClick={() => setPage("register")}>
            Create your account
          </button>
        </div>
      </div>
    );
  }

  if (page === "register") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="brand">Style Store</h1>
          <h2>Create account</h2>

          <input type="text" placeholder="Your name" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />

          <button onClick={() => setPage("login")}>Register</button>

          <p>
            Already have account?{" "}
            <span onClick={() => setPage("login")}>Sign in</span>
          </p>
        </div>
      </div>
    );
  }

  if (page === "checkout") {
    return (
      <div className="checkout-page">
        <header className="top-navbar">
          <div className="logo">Style Store</div>

          <div className="search-box">
            <input placeholder="Search Style Store products" />
            <button>🔍</button>
          </div>

          <div className="cart" onClick={() => setPage("checkout")}>
            🛒 Cart ({cart.length})
          </div>

          <button className="logout" onClick={() => setPage("dashboard")}>
            ← Back
          </button>
        </header>

        <div className="checkout-container">
          <div className="checkout-left">
            <h2>Shopping Cart</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              cart.map((item, index) => (
                <div className="checkout-item" key={index}>
                  <div className="checkout-img">{item.img}</div>

                  <div>
                    <h3>{item.name}</h3>
                    <p>₹{item.price}</p>
                  </div>
                </div>
              ))
            )}

            <button onClick={() => setPage("dashboard")}>
              Continue Shopping
            </button>
          </div>

          <div className="checkout-right">
            <h2>Order Summary</h2>

            <p>Total Items: {cart.length}</p>

            <h1>₹{total}</h1>

            <button className="payment-btn">Proceed to Payment</button>

            <div className="payment-icons">
              💳 Card &nbsp;&nbsp; 💰 UPI &nbsp;&nbsp; 🏦 Net Banking
            </div>
          </div>
        </div>

        <div className="call-button">📞</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="top-navbar">
        <div className="logo">Style Store</div>

        <div className="location">
          <span>Deliver to</span>
          <b>India</b>
        </div>

        <div className="search-box">
          <select>
            <option>All</option>
            <option>Mobiles</option>
            <option>Fashion</option>
            <option>Electronics</option>
          </select>

          <input placeholder="Search Style Store products" />

          <button>🔍</button>
        </div>

        <div className="nav-item">
          <span>Hello, Monika</span>
          <b>Account</b>
        </div>

        <div className="nav-item">
          <span>Returns</span>
          <b>& Orders</b>
        </div>

        <div className="cart" onClick={() => setPage("checkout")}>
          🛒 Cart ({cart.length})
        </div>

        <button className="logout" onClick={() => setPage("login")}>
          Logout
        </button>
      </header>

      <nav className="category-bar">
        <span>☰ All</span>
        <span>Today Deals</span>
        <span>Mobiles</span>
        <span>Electronics</span>
        <span>Fashion</span>
        <span>Beauty</span>
        <span>Home</span>
        <span>Grocery</span>
        <span>Customer Service</span>
      </nav>

      <section className="hero-banner">
        <div className="hero-content">
          <p className="badge">Mega Sale Live</p>

          <h1>Upgrade Your Lifestyle With Style Store</h1>

          <p>
            Premium products, fast delivery, best prices and amazing deals.
          </p>

          <button>Shop Now</button>
        </div>
      </section>

      <section className="deal-row">
        <div>🚚 Free Delivery</div>
        <div>💳 Secure Payments</div>
        <div>↩️ Easy Returns</div>
        <div>🎁 Big Offers</div>
      </section>

      <section className="product-section">
        <h2>Recommended Products</h2>

        <div className="product-grid">
          {products.map((product, index) => (
            <div className="product-card" key={index}>
              <span className="product-tag">{product.tag}</span>

              <div className="product-img">{product.img}</div>

              <h3>{product.name}</h3>

              <p className="rating">★★★★★</p>

              <p className="price">₹{product.price}</p>

              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div>
            <h3>Get to Know Us</h3>
            <p>About Us</p>
            <p>Careers</p>
            <p>Press Releases</p>
            <p>Style Store Science</p>
          </div>

          <div>
            <h3>Connect with Us</h3>
            <p>Facebook</p>
            <p>Instagram</p>
            <p>Twitter</p>
            <p>LinkedIn</p>
          </div>

          <div>
            <h3>Make Money with Us</h3>
            <p>Sell on Style Store</p>
            <p>Affiliate Program</p>
            <p>Advertise Products</p>
            <p>Become Seller</p>
          </div>

          <div>
            <h3>Let Us Help You</h3>
            <p>Your Account</p>
            <p>Returns Centre</p>
            <p>Recalls and Product Safety Alerts</p>
            <p>100% Purchase Protection</p>
            <p>Style Store App Download</p>
            <p>Help</p>
          </div>
        </div>

        <hr />

        <h2>Style Store</h2>

        <div className="social-icons">
          <span>📘</span>
          <span>📸</span>
          <span>🐦</span>
          <span>▶️</span>
          <span>💼</span>
        </div>

        <p className="copy">© 2026 Style Store. All rights reserved.</p>
      </footer>

      <div className="call-button">📞</div>
    </div>
  );
}

export default App;