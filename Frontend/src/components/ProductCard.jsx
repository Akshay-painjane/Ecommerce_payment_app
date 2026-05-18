import { Link } from "react-router-dom";
import { api } from "../services/api.js";

function ProductCard({ product }) {
  const addToCart = async () => {
    await api.addToCart({ product_id: product.id, quantity: 1 });
  };

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img src={product.image_url} alt={product.name} />
      </Link>
      <div className="product-card-body">
        <Link className="product-title" to={`/products/${product.id}`}>{product.name}</Link>
        <p>{product.description}</p>
        <div className="rating">Rating {Number(product.rating || 4.5).toFixed(1)} / 5</div>
        <strong className="price">Rs. {Number(product.price).toLocaleString("en-IN")}</strong>
        <div className="product-actions">
          <button onClick={addToCart} type="button">Add to Cart</button>
          <Link className="buy-now" to={`/checkout?product=${product.id}`}>Buy Now</Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;

