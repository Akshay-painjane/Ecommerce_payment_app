import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.getProducts(),
      api.getOrders(),
      api.getCart(),
    ]).then(([productsResult, ordersResult, cartResult]) => {
      setProducts(productsResult.status === "fulfilled" ? productsResult.value : []);
      setOrders(ordersResult.status === "fulfilled" ? ordersResult.value : []);
      setCartItems(cartResult.status === "fulfilled" ? cartResult.value : []);
    }).finally(() => setLoading(false));
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_price || 0), 0),
    [orders]
  );

  const totalCartItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const metrics = [
    { label: "Total Products", value: products.length },
    { label: "Total Orders", value: orders.length },
    { label: "Total Cart Items", value: totalCartItems },
    { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString("en-IN")}` },
  ];

  return (
    <section className="dashboard-page page-section">
      <div className="dashboard-hero">
        <div>
          <span>Style Store Control Room</span>
          <h1>Dashboard</h1>
          <p>Track storefront activity, manage product actions, and jump back into shopping workflows quickly.</p>
        </div>
        <Link to="/home">Go Home</Link>
      </div>

      {loading ? <p className="loading">Loading dashboard...</p> : (
        <div className="dashboard-metrics">
          {metrics.map((metric) => (
            <article className="dashboard-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>
      )}

      <div className="dashboard-actions">
        <Link className="dash-action add" to="/admin/add-product">Add Product</Link>
        <Link className="dash-action view" to="/admin/products">View Products</Link>
        <Link className="dash-action cart" to="/cart">View Cart</Link>
        <Link className="dash-action home" to="/home">Go Home</Link>
      </div>
    </section>
  );
}

export default Dashboard;
