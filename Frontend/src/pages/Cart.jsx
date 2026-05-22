import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import fallbackImage from "../assets/hero.png";
import { api, cartStore } from "../services/api.js";

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
  const localItems = cartStore.getItems();
  const localByProductId = new Map(localItems.map((item) => [String(getProductId(item)), item]));

  return Promise.all(cartItems.map(async (item) => {
    const productId = getProductId(item);
    const cachedItem = localByProductId.get(String(productId));
    const cachedProduct = cachedItem?.product || cachedItem;

    if (item.product || item.name || item.title || cachedProduct?.name || cachedProduct?.title) {
      return normalizeCartItem(item, item.product || cachedProduct);
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
  const localItems = cartStore.getItems();

  try {
    const backendItems = await api.getCart();
    const hydratedBackendItems = await hydrateCartItems(backendItems);
    const backendProductIds = new Set(hydratedBackendItems.map((item) => String(item.product_id)));
    const localOnlyItems = localItems
      .filter((item) => !backendProductIds.has(String(getProductId(item))))
      .map((item) => normalizeCartItem(item));

    return {
      items: [...hydratedBackendItems, ...localOnlyItems],
      error: "",
    };
  } catch (err) {
    return {
      items: (await hydrateCartItems(localItems)).map((item) => ({ ...item, localOnly: true })),
      error: localItems.length ? "" : `${err.message}. Please login to view your cart.`,
    };
  }
};

function Cart() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    setLoading(true);
    setError("");

    const result = await getDisplayCartItems();
    setItems(result.items);
    setError(result.error);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    getDisplayCartItems().then((result) => {
      if (isMounted) {
        setItems(result.items);
        setError(result.error);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const remove = async (item) => {
    cartStore.removeItem(item.id, item.product_id);
    setItems((current) => current.filter((cartItem) => String(cartItem.id) !== String(item.id)));

    if (!String(item.id).startsWith("local-")) {
      try {
        await api.removeCartItem(item.id);
      } catch (err) {
        setError(err.message || "Could not remove item from cart.");
        loadCart();
      }
    }
  };

  const changeQuantity = (id, delta) => {
    setItems((current) => current.map((item) => {
      if (String(item.id) !== String(id)) {
        return item;
      }

      const quantity = Math.max(1, Number(item.quantity || 1) + delta);
      cartStore.updateQuantity(item.id, quantity);
      return { ...item, quantity };
    }));
  };

  const total = useMemo(() => items.reduce((sum, item) => {
    const price = item.product?.price;
    return price === null || Number.isNaN(price) ? sum : sum + Number(price) * item.quantity;
  }, 0), [items]);
  const hasPricedItems = items.some((item) => item.product?.price !== null && !Number.isNaN(item.product?.price));

  return (
    <section className="cart-page page-section">
      <div className="cart-list">
        <h1>Shopping Cart</h1>
        {error && <p className="alert">{error}</p>}
        {loading && <p className="loading">Loading cart...</p>}

        {!loading && items.length === 0 && (
          <div className="summary-box">
            <h2>Your cart is empty</h2>
            <p>Find something you love and add it here for a faster checkout.</p>
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
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="rating">Rating {Number(product.rating || 4.5).toFixed(1)} / 5</div>
                <strong>
                  {hasPrice ? `Rs. ${product.price.toLocaleString("en-IN")}` : "Price unavailable"}
                </strong>
                <p>
                  Subtotal: {lineTotal === null ? "Price unavailable" : `Rs. ${lineTotal.toLocaleString("en-IN")}`}
                </p>
                <div className="quantity-row">
                  <button onClick={() => changeQuantity(item.id, -1)} type="button">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.id, 1)} type="button">+</button>
                  <button className="link-button" onClick={() => remove(item)} type="button">Remove</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <aside className="summary-box">
        <h2>Subtotal</h2>
        <strong>{hasPricedItems ? `Rs. ${total.toLocaleString("en-IN")}` : "Price unavailable"}</strong>
        <Link className="primary-link" to="/checkout">Proceed to Buy</Link>
      </aside>
    </section>
  );
}

export default Cart;
