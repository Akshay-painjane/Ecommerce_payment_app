import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import fallbackImage from "../assets/hero.png";
import { api, auth } from "../services/api.js";

const getWishlistErrorMessage = (err) => (
  err?.status === 500
    ? "Wishlist service is not ready. Please check database setup."
    : err?.message || "Unable to load your wishlist."
);

const normalizeWishlistItem = (item) => {
  const product = item?.product && typeof item.product === "object" ? item.product : item;
  const productId = item?.product_id ?? product?.id;
  const image = product?.image_url || product?.image || product?.img || fallbackImage;
  const price = Number(product?.price || 0);

  return {
    ...item,
    id: item?.id,
    product_id: productId,
    product: {
      ...product,
      id: productId,
      name: product?.name || product?.title || `Product #${productId}`,
      description: product?.description || "Product details are being refreshed.",
      image,
      price,
      rating: Number(product?.rating || 4.5),
      stock: Number(product?.stock || 0),
    },
  };
};

function Wishlist() {
  const user = auth.getUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadWishlist = async () => {
    setLoading(true);
    setError("");

    try {
      const wishlist = await api.getWishlist();
      setItems(Array.isArray(wishlist) ? wishlist.map(normalizeWishlistItem) : []);
    } catch (err) {
      setItems([]);
      setError(getWishlistErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchWishlist = async () => {
      setLoading(true);
      setError("");

      try {
        const wishlist = await api.getWishlist();
        if (active) {
          setItems(Array.isArray(wishlist) ? wishlist.map(normalizeWishlistItem) : []);
        }
      } catch (err) {
        if (active) {
          setItems([]);
          setError(getWishlistErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchWishlist();
    window.addEventListener("wishlist:updated", fetchWishlist);
    window.addEventListener("pageshow", fetchWishlist);
    window.addEventListener("focus", fetchWishlist);

    return () => {
      active = false;
      window.removeEventListener("wishlist:updated", fetchWishlist);
      window.removeEventListener("pageshow", fetchWishlist);
      window.removeEventListener("focus", fetchWishlist);
    };
  }, []);

  const remove = async (item) => {
    setBusyId(`remove-${item.id}`);
    setMessage("");
    setError("");

    try {
      await api.removeFromWishlist(item.id);
      setItems((current) => current.filter((wishlistItem) => String(wishlistItem.id) !== String(item.id)));
      setMessage("Removed from wishlist");
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
    } catch (err) {
      setError(err.message || "Could not remove item from wishlist.");
      loadWishlist();
    } finally {
      setBusyId("");
    }
  };

  const moveToCart = async (item) => {
    setBusyId(`move-${item.id}`);
    setMessage("");
    setError("");

    try {
      await api.addToCart({ product_id: item.product_id, quantity: 1 });
      await api.removeFromWishlist(item.id);
      setItems((current) => current.filter((wishlistItem) => String(wishlistItem.id) !== String(item.id)));
      setMessage("Moved to cart");
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
    } catch (err) {
      setError(err.message || "Could not move item to cart.");
      loadWishlist();
    } finally {
      setBusyId("");
    }
  };

  const clearAll = async () => {
    setBusyId("clear");
    setMessage("");
    setError("");

    try {
      await api.clearWishlist();
      setItems([]);
      setMessage("Wishlist cleared");
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
    } catch (err) {
      setError(err.message || "Could not clear wishlist.");
      loadWishlist();
    } finally {
      setBusyId("");
    }
  };

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.product.price || 0), 0), [items]);

  return (
    <section className="wishlist-page page-section">
      <div className="wishlist-list">
        <div className="cart-header-panel wishlist-header-panel">
          <div>
            <span>Wishlist</span>
            <h1>Your Saved Items</h1>
            <p>{user?.email || user?.name || "Signed-in user"} - products you saved for later</p>
          </div>
          <strong>{items.length} items</strong>
        </div>

        {message && <p className="success">{message}</p>}
        {error && <p className="alert">{error}</p>}
        {loading && <p className="loading">Loading wishlist...</p>}

        {!loading && items.length === 0 && (
          <div className="empty-state wishlist-empty-state">
            <span className="empty-heart" aria-hidden="true">{"\u2661"}</span>
            <h2>Your wishlist is empty</h2>
            <p>Tap the heart on products you like. Saved items stay with your account and appear here after refresh.</p>
            <Link className="primary-link" to="/products">Discover products</Link>
          </div>
        )}

        {!loading && items.map((item) => {
          const product = item.product;
          const price = Number(product.price || 0);
          const rating = Number(product.rating || 4.5).toFixed(1);

          return (
            <article className="wishlist-item" key={item.id}>
              <Link className="wishlist-item-image" to={`/products/${product.id}`}>
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="wishlist-item-main">
                <div className="cart-item-title">
                  <div>
                    <Link to={`/products/${product.id}`}>
                      <h3>{product.name}</h3>
                    </Link>
                    <p>{product.description}</p>
                  </div>
                  <span>Saved #{item.id}</span>
                </div>
                <div className="wishlist-meta-row">
                  <span className="rating">Rating {rating} / 5</span>
                  <span className={product.stock > 0 ? "stock" : "alert-inline"}>{product.stock > 0 ? "In stock" : "Out of stock"}</span>
                </div>
                <strong className="wishlist-price">Rs. {price.toLocaleString("en-IN")}</strong>
                <div className="wishlist-actions">
                  <button
                    disabled={busyId === `move-${item.id}` || product.stock <= 0}
                    onClick={() => moveToCart(item)}
                    type="button"
                  >
                    {busyId === `move-${item.id}` ? "Moving..." : "Move to Cart"}
                  </button>
                  <button
                    className="link-button"
                    disabled={busyId === `remove-${item.id}`}
                    onClick={() => remove(item)}
                    type="button"
                  >
                    {busyId === `remove-${item.id}` ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="summary-box wishlist-summary">
        <h2>Saved for Later</h2>
        <p>{items.length} wishlist items stored in your account.</p>
        <strong>{items.length ? `Rs. ${total.toLocaleString("en-IN")}` : "No saved items"}</strong>
        <Link className="primary-link" to="/products">Continue Shopping</Link>
        {items.length > 0 && (
          <button className="secondary-button" disabled={busyId === "clear"} onClick={clearAll} type="button">
            {busyId === "clear" ? "Clearing..." : "Clear Wishlist"}
          </button>
        )}
      </aside>
    </section>
  );
}

export default Wishlist;
