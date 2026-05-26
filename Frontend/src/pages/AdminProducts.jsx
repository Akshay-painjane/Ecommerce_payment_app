import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api, getCategoriesWithFallback } from "../services/api.js";

function AdminProducts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.message) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    let active = true;

    Promise.all([api.getProducts(), getCategoriesWithFallback()])
      .then(([productData, categoryData]) => {
        if (active) {
          setProducts(Array.isArray(productData) ? productData : []);
          setCategories(categoryData);
        }
      })
      .catch((err) => {
        if (active) {
          setProducts([]);
          setError(err.message || "Unable to load products.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const remove = async (product) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This will remove it from the database.`);

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(product.id);

    try {
      await api.deleteProduct(product.id);
      setProducts((currentProducts) => currentProducts.filter((item) => item.id !== product.id));
      setMessage("Product deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-layout page-section">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Manage products</h1>
        {message && <p className="success">{message}</p>}
        {error && <p className="alert">{error}</p>}
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && (
                <tr><td colSpan="6">Loading products...</td></tr>
              )}
              {!loading && products.length === 0 && (
                <tr><td colSpan="6">No products found.</td></tr>
              )}
              {!loading && products.map((product) => (
                <tr key={product.id}>
                  <td><img src={product.image_url} alt={product.name} />{product.name}</td>
                  <td>{categories.find((item) => String(item.id) === String(product.category_id))?.name || `Category #${product.category_id}`}</td>
                  <td>Rs. {Number(product.price).toLocaleString("en-IN")}</td>
                  <td>{product.stock}</td>
                  <td>{Number(product.rating || 4.5).toFixed(1)}</td>
                  <td>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/admin/products/edit/${product.id}`);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button className="danger" disabled={deletingId === product.id} onClick={() => remove(product)} type="button">{deletingId === product.id ? "Deleting..." : "Delete"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminProducts;

