import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../services/api.js";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);

  const addToCart = async () => {
    if (!auth.isAuthenticated()) {
      navigate("/login");
      return;
    }

    setAdding(true);
    setMessage("");

    try {
      await api.addToCart({
        product_id: product.id,
        quantity: 1,
      });
      setMessage("Added to cart");
    } catch (err) {
      setMessage(err.message || "Unable to add");
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span className="product-image-placeholder">No image</span>}
      </Link>
      <div className="product-card-body">
        <Link className="product-title" to={`/products/${product.id}`}>{product.name}</Link>
        <p>{product.description}</p>
        <div className="rating">Rating {Number(product.rating || 4.5).toFixed(1)} / 5</div>
        <strong className="price">Rs. {Number(product.price).toLocaleString("en-IN")}</strong>
        {message && <small className="product-card-message">{message}</small>}
        <div className="product-actions">
          <button disabled={adding} onClick={addToCart} type="button">{adding ? "Adding..." : "Add to Cart"}</button>
          <Link className="buy-now" to={`/checkout?product=${product.id}`}>Buy Now</Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;

