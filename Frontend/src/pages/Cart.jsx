import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import fallbackImage from "../assets/hero.png";
import { api, auth } from "../services/api.js";

const getProductId = (item) => item.product_id ?? item.product?.id ?? item.id;

const normalizeProduct = (source, productId) => {
  const product = source?.product && typeof source.product === "object" ? source.product : source;
  const price = product?.price ?? source?.price;
  const image = product?.image_url || product?.image || product?.img || source?.image_url || source?.image || source?.img;

  return {
    id: product?.id ?? source?.product_id ?? productId,
    name: product?.name || product?.title || source?.name || source?.title || `Product #${productId}`,
    description: product?.description || source?.description || "Product details are being refreshed.",
    price: price === undefined || price === null || price === "" ? null : Number(price),
    image: image || fallbackImage,
    category: product?.category || product?.category_name || source?.category || "",
    rating: product?.rating ?? source?.rating ?? 4.5,
  };
};

const normalizeCartItem = (item, product) => {
  const productId = getProductId(item);
  const normalizedProduct = normalizeProduct(product || item, productId);

  return {
    ...item,
    id: item.id ?? `local-${productId}`,
    product_id: productId,
    quantity: Math.max(1, Number(item.quantity || 1)),
    product: normalizedProduct,
  };
};

const hydrateCartItems = async (cartItems) => {
  return Promise.all(cartItems.map(async (item) => {
    const productId = getProductId(item);

    if (item.product || item.name || item.title) {
      return normalizeCartItem(item, item.product);
    }

    if (!productId) {
      return normalizeCartItem(item);
    }

    try {
      const product = await api.getProduct(productId);
      return normalizeCartItem(item, product);
    } catch {
      return normalizeCartItem(item);
    }
  }));
};

const getDisplayCartItems = async () => {
  const backendItems = await api.getCart();
  const hydratedBackendItems = await hydrateCartItems(Array.isArray(backendItems) ? backendItems : []);

  return {
    items: hydratedBackendItems,
    error: "",
  };
};

function Cart() {
  const user = auth.getUser();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getDisplayCartItems();
      setItems(result.items);
      setError(result.error);
    } catch (err) {
      setItems([]);
      setError(err.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCart = () => {
      setLoading(true);
      setError("");

      return getDisplayCartItems()
      .then((result) => {
        if (isMounted) {
          setItems(result.items);
          setError(result.error);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setItems([]);
          setError(err.message || "Unable to load your cart.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    };

    fetchCart();
    window.addEventListener("pageshow", fetchCart);
    window.addEventListener("focus", fetchCart);

    return () => {
      isMounted = false;
      window.removeEventListener("pageshow", fetchCart);
      window.removeEventListener("focus", fetchCart);
    };
  }, []);

  const remove = async (item) => {
    setItems((current) => current.filter((cartItem) => String(cartItem.id) !== String(item.id)));

    try {
      await api.removeCartItem(item.id);
    } catch (err) {
      setError(err.message || "Could not remove item from cart.");
      loadCart();
    }
  };

  const addOne = async (item) => {
    setError("");

    try {
      await api.addToCart({ product_id: item.product_id, quantity: 1 });
      loadCart();
    } catch (err) {
      setError(err.message || "Could not update cart quantity.");
    }
  };

  const total = useMemo(() => items.reduce((sum, item) => {
    const price = item.product?.price;
    return price === null || Number.isNaN(price) ? sum : sum + Number(price) * item.quantity;
  }, 0), [items]);
  const hasPricedItems = items.some((item) => item.product?.price !== null && !Number.isNaN(item.product?.price));

  return (
    <section className="cart-page page-section">
      <div className="cart-list">
        <div className="cart-header-panel">
          <div>
            <span>Shopping Cart</span>
            <h1>Your Basket</h1>
            <p>{user?.email || user?.name || "Signed-in user"} - your saved basket</p>
          </div>
          <strong>{items.length} items</strong>
        </div>
        {error && <p className="alert">{error}</p>}
        {loading && <p className="loading">Loading cart...</p>}

        {!loading && items.length === 0 && (
          <div className="empty-state">
            <h2>Your cart is empty</h2>
            <p>Items added while signed in will appear here and stay with this account.</p>
            <Link className="primary-link" to="/products">Shop products</Link>
          </div>
        )}

        {!loading && items.map((item) => {
          const product = item.product;
          const hasPrice = product.price !== null && !Number.isNaN(product.price);
          const lineTotal = hasPrice ? product.price * item.quantity : null;

          return (
            <article className="cart-item" key={item.id}>
              <img src={product.image} alt={product.name} />
              <div>
                <div className="cart-item-title">
                  <h3>{product.name}</h3>
                  <span>Cart #{item.id}</span>
                </div>
                <p>{product.description}</p>
                <div className="rating">Rating {Number(product.rating || 4.5).toFixed(1)} / 5</div>
                <strong>
                  {hasPrice ? `Rs. ${product.price.toLocaleString("en-IN")}` : "Price unavailable"}
                </strong>
                <p>
                  Subtotal: {lineTotal === null ? "Price unavailable" : `Rs. ${lineTotal.toLocaleString("en-IN")}`}
                </p>
                <div className="quantity-row">
                  <span className="quantity-pill">Qty {item.quantity}</span>
                  <button onClick={() => addOne(item)} type="button">+ Add one</button>
                  <button className="link-button" onClick={() => remove(item)} type="button">Remove</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <aside className="summary-box">
        <h2>Subtotal</h2>
        <p>{items.length} account-specific cart items</p>
        <strong>{hasPricedItems ? `Rs. ${total.toLocaleString("en-IN")}` : "Price unavailable"}</strong>
        <Link className={`primary-link ${items.length ? "" : "disabled-link"}`} to={items.length ? "/checkout" : "/products"}>Proceed to Buy</Link>
      </aside>
    </section>
  );
}

export default Cart;

