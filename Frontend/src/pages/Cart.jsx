import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

function Cart() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const loadCart = () => {
    api.getCart().then(setItems).catch((err) => setError(`${err.message}. Please login to view your cart.`));
  };

  useEffect(loadCart, []);

  const remove = async (id) => {
    await api.removeCartItem(id);
    loadCart();
  };

  const changeQuantity = (id, delta) => {
    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )));
  };

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0), [items]);

  return (
    <section className="cart-page page-section">
      <div className="cart-list">
        <h1>Shopping Cart</h1>
        {error && <p className="alert">{error}</p>}
        {items.length === 0 && !error && <p>Your cart is empty.</p>}
        {items.map((item) => (
          <article className="cart-item" key={item.id}>
            <img src={item.product?.image_url} alt={item.product?.name} />
            <div>
              <h3>{item.product?.name}</h3>
              <p>{item.product?.description}</p>
              <strong>Rs. {Number(item.product?.price || 0).toLocaleString("en-IN")}</strong>
              <div className="quantity-row">
                <button onClick={() => changeQuantity(item.id, -1)} type="button">-</button>
                <span>{item.quantity}</span>
                <button onClick={() => changeQuantity(item.id, 1)} type="button">+</button>
                <button className="link-button" onClick={() => remove(item.id)} type="button">Remove</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <aside className="summary-box">
        <h2>Subtotal</h2>
        <strong>Rs. {total.toLocaleString("en-IN")}</strong>
        <Link className="primary-link" to="/checkout">Proceed to Buy</Link>
      </aside>
    </section>
  );
}

export default Cart;

