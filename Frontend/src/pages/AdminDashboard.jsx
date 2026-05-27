import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api } from "../services/api.js";

function AdminDashboard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const inventory = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);

  return (
    <section className="admin-layout page-section">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Dashboard</h1>
        <div className="metric-grid">
          <div><span>Total Products</span><strong>{products.length}</strong></div>
          <div><span>Inventory Units</span><strong>{inventory}</strong></div>
          <div><span>Store Status</span><strong>Live</strong></div>
        </div>
        <section className="admin-info-card">
          <span>Delivery charges</span>
          <h2>Frontend-managed configuration</h2>
          <p>Delivery charge configuration is currently frontend-managed. Backend API is required for permanent admin-managed delivery charges.</p>
        </section>
        <div className="admin-actions">
          <Link className="primary-link" to="/admin/add-product">Add Product</Link>
          <Link className="secondary-link" to="/admin/products">Manage Products</Link>
          <Link className="secondary-link" to="/admin/categories">Manage Categories</Link>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;

