import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, auth } from "../services/api.js";

function OfferCard({ item }) {
  const navigate = useNavigate();
  const toastTimer = useRef(null);
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const rating = item.rating ? Number(item.rating).toFixed(1) : "";
  const hasDiscount = Boolean(item.discount);
  const hasOldPrice = Number(item.oldPrice || 0) > Number(item.price || 0);
  const productUrl = item.id ? `/products/${item.id}` : "";

  if (!item.id) {
    return null;
  }

  const openDetails = () => {
    navigate(productUrl);
  };

  const showMessage = (value) => {
    setMessage(value);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setMessage(""), 2200);
  };

  const addCurrentProductToCart = async () => {
    await api.addToCart({
      product_id: item.id,
      quantity: 1,
    });
  };

  const addToCart = async () => {
    if (!auth.isAuthenticated()) {
      navigate("/login");
      return;
    }

    setAdding(true);

    try {
      await addCurrentProductToCart();
      showMessage("Added to cart");
    } catch (err) {
      showMessage(err.message || "Unable to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const buyNow = async () => {
    if (!auth.isAuthenticated()) {
      navigate("/login");
      return;
    }

    setBuying(true);

    try {
      await addCurrentProductToCart();
      navigate("/checkout");
    } catch (err) {
      showMessage(err.message || "Unable to start checkout");
    } finally {
      setBuying(false);
    }
  };

  const onKeyDown = (event) => {
    if (event.target.closest("button")) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  };

  return (
    <article className="offer-card" onClick={openDetails} onKeyDown={onKeyDown} role="link" tabIndex={0}>
      {message && <div className="toast-message success offer-toast" role="status">{message}</div>}
      <div className="offer-image-wrap">
        {item.image ? <img src={item.image} alt={item.name} /> : <span className="product-image-placeholder">No image</span>}
        {hasDiscount && <span className="discount-badge">{item.discount}</span>}
      </div>
      <div className="offer-card-body">
        <span className="offer-title">{item.name}</span>
        {rating && (
          <div className="star-rating" aria-label={`${rating} out of 5 stars`}>
            <span>*****</span>
            <strong>{rating}</strong>
          </div>
        )}
        <div className="offer-price-row">
          <strong>Rs. {Number(item.price).toLocaleString("en-IN")}</strong>
          {hasOldPrice && <s>Rs. {Number(item.oldPrice).toLocaleString("en-IN")}</s>}
        </div>
        {item.offerText && <span className="offer-text">{item.offerText}</span>}
        <div className="offer-actions">
          <button
            className="offer-cta"
            disabled={adding || buying}
            onClick={(event) => {
              event.stopPropagation();
              addToCart();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            {adding ? "..." : "Cart"}
          </button>
          <button
            className="offer-cta offer-buy-now"
            disabled={adding || buying}
            onClick={(event) => {
              event.stopPropagation();
              buyNow();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            type="button"
          >
            {buying ? "..." : "Buy"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default OfferCard;
