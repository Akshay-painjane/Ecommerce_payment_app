import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api, categories } from "../services/api.js";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.getProducts()
      .then((data) => {
        if (active) {
          setProducts(data);
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

      if (editing?.id === product.id) {
        setEditing(null);
      }
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const updatedProduct = await api.updateProduct(editing.id, {
        ...editing,
        price: Number(editing.price),
        stock: Number(editing.stock),
        category_id: Number(editing.category_id),
        rating: Number(editing.rating),
      });
      setProducts((currentProducts) => currentProducts.map((product) => (
        product.id === updatedProduct.id ? updatedProduct : product
      )));
      setEditing(null);
      setMessage("Product updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update product.");
    } finally {
      setSaving(false);
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
                  <td>{categories.find((item) => item.id === product.category_id)?.name}</td>
                  <td>Rs. {Number(product.price).toLocaleString("en-IN")}</td>
                  <td>{product.stock}</td>
                  <td>{Number(product.rating || 4.5).toFixed(1)}</td>
                  <td><button onClick={() => setEditing(product)} type="button">Edit</button><button className="danger" disabled={deletingId === product.id} onClick={() => remove(product)} type="button">{deletingId === product.id ? "Deleting..." : "Delete"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <form className="edit-panel" onSubmit={save}>
            <h2>Edit product</h2>
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <input value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} type="number" />
            <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            <input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
            <input value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} type="number" />
            <input value={editing.rating || 4.5} onChange={(e) => setEditing({ ...editing, rating: e.target.value })} type="number" min="1" max="5" step="0.1" />
            <div><button disabled={saving} type="submit">{saving ? "Saving..." : "Save"}</button><button onClick={() => setEditing(null)} type="button">Cancel</button></div>
          </form>
        )}
      </div>
    </section>
  );
}

export default AdminProducts;

