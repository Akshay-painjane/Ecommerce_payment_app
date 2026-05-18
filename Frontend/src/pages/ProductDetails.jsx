import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api.js";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.getProduct(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    await api.addToCart({ product_id: Number(id), quantity: 1 });
    setMessage("Added to cart");
  };

  if (loading) return <p className="loading page-section">Loading product...</p>;
  if (!product) return <p className="page-section">Product not found.</p>;

  return (
    <section className="product-detail page-section">
      <div className="detail-image"><img src={product.image_url} alt={product.name} /></div>
      <div className="detail-info">
        <h1>{product.name}</h1>
        <p className="rating">Rating {Number(product.rating || 4.5).toFixed(1)} / 5</p>
        <p>{product.description}</p>
        <strong className="detail-price">Rs. {Number(product.price).toLocaleString("en-IN")}</strong>
        <p className="stock">{product.stock > 0 ? "In stock" : "Out of stock"}</p>
      </div>
      <aside className="buy-box">
        <strong>Rs. {Number(product.price).toLocaleString("en-IN")}</strong>
        <span>FREE delivery on eligible orders</span>
        {message && <p className="success">{message}</p>}
        <button onClick={addToCart} type="button">Add to Cart</button>
        <Link to={`/checkout?product=${product.id}`}>Buy Now</Link>
      </aside>
    </section>
  );
}

export default ProductDetails;

