import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([api.getProduct(id), api.getProducts()])
      .then(([singleProduct, products]) => {
        setProduct(singleProduct);
        setRelated(products.filter((item) => item.id !== singleProduct.id && item.category_id === singleProduct.category_id).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = async () => {
    await api.addToCart({ product_id: Number(id), quantity });
    setMessage("Added to cart");
  };

  const buyNow = async () => {
    await api.addToCart({ product_id: Number(id), quantity });
    navigate(`/checkout?product=${id}`);
  };

  if (loading) return <p className="loading page-section">Loading product...</p>;
  if (!product) return <p className="page-section">Product not found.</p>;

  return (
    <section className="page-section">
      <div className="product-detail">
        <div className="detail-gallery">
          <div className="gallery-thumbs">
            {[1, 2, 3].map((item) => <img key={item} src={product.image_url} alt={`${product.name} view ${item}`} />)}
          </div>
          <div className="detail-image"><img src={product.image_url} alt={product.name} /></div>
        </div>
        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="rating">Rating {Number(product.rating || 4.5).toFixed(1)} / 5 from verified customers</p>
          <p>{product.description}</p>
          <strong className="detail-price">Rs. {Number(product.price).toLocaleString("en-IN")}</strong>
          <p className="stock">{product.stock > 0 ? "In stock" : "Out of stock"}</p>
          <div className="spec-box">
            <h2>Product specifications</h2>
            <p>Category ID: {product.category_id}</p>
            <p>Warranty: 1 year service support</p>
            <p>Delivery: Free standard delivery</p>
          </div>
          <div className="review-box">
            <h2>Reviews</h2>
            <p>Customers like the value, clean design, and fast delivery experience.</p>
          </div>
        </div>
        <aside className="buy-box">
          <strong>Rs. {Number(product.price).toLocaleString("en-IN")}</strong>
          <span>FREE delivery on eligible orders</span>
          <label>Quantity<input value={quantity} min="1" max={product.stock || 1} onChange={(e) => setQuantity(Number(e.target.value))} type="number" /></label>
          {message && <p className="success">{message}</p>}
          <button onClick={addToCart} type="button">Add to Cart</button>
          <button className="orange-button" onClick={buyNow} type="button">Buy Now</button>
        </aside>
      </div>

      <div className="section-heading">
        <h2>Related products</h2>
        <Link to="/products">View all</Link>
      </div>
      <div className="related-grid">
        {related.map((item) => (
          <Link key={item.id} to={`/product/${item.id}`} className="related-card">
            <img src={item.image_url} alt={item.name} />
            <strong>{item.name}</strong>
            <span>Rs. {Number(item.price).toLocaleString("en-IN")}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default ProductDetails;
