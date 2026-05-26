import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, auth } from "../services/api.js";

const getCategoryName = (product) => {
  if (typeof product.category === "string") {
    return product.category;
  }

  return product.category?.name || product.category_name || product.categoryName || "";
};

const getDiscountValue = (product) => {
  const rawDiscount = product.discount || product.discount_percent || product.discountPercentage || "";
  const numericDiscount = Number(String(rawDiscount).replace(/[^\d.]/g, ""));

  return Number.isFinite(numericDiscount) ? numericDiscount : 0;
};

const getOfferText = (product) => {
  const offerText = product.offer_text || product.offerText || product.offer || product.deal_label || product.dealLabel || product.badge_text || product.badgeText || "";

  return typeof offerText === "string" ? offerText.trim() : "";
};

function ProductCard({ product }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const price = Number(product.price || 0);
  const rating = product.rating ? Number(product.rating).toFixed(1) : "";
  const oldPrice = Number(product.old_price || product.oldPrice || product.mrp || product.original_price || 0);
  const explicitDiscount = getDiscountValue(product);
  const derivedDiscount = oldPrice > price && price > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const discount = explicitDiscount || derivedDiscount;
  const categoryName = getCategoryName(product);
  const offerText = getOfferText(product);
  const stock = Number(product.stock || 0);
  const stockLabel = stock > 0 && stock < 5 ? "Limited Stock" : stock > 0 ? "In Stock" : "";

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
      <button className="wishlist-button" type="button" aria-label={`Add ${product.name} to wishlist`}>♡</button>
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        {product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" /> : <span className="product-image-placeholder">No image</span>}
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        {stockLabel && <span className={`stock-badge${stock < 5 ? " limited" : ""}`}>{stockLabel}</span>}
        <span className="quick-view-overlay">Quick view</span>
      </Link>
      <div className="product-card-body">
        <span className={`offer-category${categoryName ? "" : " card-slot-empty"}`}>{categoryName || " "}</span>
        <Link className="product-title" to={`/products/${product.id}`}>{product.name}</Link>
        <div className={`star-rating${rating ? "" : " card-slot-empty"}`} aria-hidden={rating ? undefined : "true"}>
          <span>*****</span><strong>{rating}</strong>
        </div>
        <div className="catalog-price-row">
          <strong className="price">Rs. {price.toLocaleString("en-IN")}</strong>
          {oldPrice > price && <s>Rs. {oldPrice.toLocaleString("en-IN")}</s>}
        </div>
        <span className={`offer-text${offerText ? "" : " card-slot-empty"}`}>{offerText || " "}</span>
        <small className="product-card-message" aria-live="polite">{message}</small>
        <div className="product-actions">
          <button disabled={adding} onClick={addToCart} type="button">{adding ? "Adding..." : "Add to Cart"}</button>
          <Link className="buy-now" to={`/checkout?product=${product.id}`}>Buy Now</Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
