import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

function Products() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  const products = [
    {
      name: "iPhone 15 Pro",
      price: 129999,
      img: "https://m.media-amazon.com/images/I/81fxjeu8fdL._SX679_.jpg",
      tag: "Best Seller",
    },

    {
      name: "MacBook Air",
      price: 89999,
      img: "https://m.media-amazon.com/images/I/71TPda7cwUL._SX679_.jpg",
      tag: "Deal",
    },

    {
      name: "Sony Headphones",
      price: 12999,
      img: "https://m.media-amazon.com/images/I/61CGHv6kmWL._SX679_.jpg",
      tag: "Top Rated",
    },

    {
      name: "Smart Watch",
      price: 3999,
      img: "https://m.media-amazon.com/images/I/61ZjlBOp+rL._SX679_.jpg",
      tag: "New",
    },

    {
      name: "Gaming Mouse",
      price: 1299,
      img: "https://m.media-amazon.com/images/I/61LtuGzXeaL._SX679_.jpg",
      tag: "Offer",
    },

    {
      name: "Travel Backpack",
      price: 999,
      img: "https://m.media-amazon.com/images/I/81KEhQ6w1fL._SX679_.jpg",
      tag: "Hot",
    },
  ];

  const addToCart = (product) => {
    const updatedCart = [...cart, product];

    setCart(updatedCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart)
    );

    navigate("/checkout");
  };

  return (
    <div className="dashboard">
      <Navbar cartCount={cart.length} />

      <nav className="category-bar">
        <span>☰ All</span>
        <span>Mobiles</span>
        <span>Fashion</span>
        <span>Electronics</span>
        <span>Beauty</span>
        <span>Home</span>
      </nav>

      <section className="hero-banner">
        <div className="hero-content">
          <p className="badge">Mega Sale Live</p>

          <h1>Upgrade Your Lifestyle</h1>

          <p>
            Premium products with amazing offers
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
            <ProductCard
              key={index}
              product={product}
              addToCart={addToCart}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Products;