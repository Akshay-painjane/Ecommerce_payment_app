import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api, categories as storefrontCategories } from "../services/api.js";

const imageByCategoryName = new Map(
  storefrontCategories.map((category) => [category.name.toLowerCase(), category.image])
);

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.getCategories()
      .then((data) => {
        if (active) {
          setCategories(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load categories.");
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

  const submit = async (event) => {
    event.preventDefault();
    const categoryName = name.trim();

    if (!categoryName) {
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const category = await api.createCategory({ name: categoryName });
      setCategories((currentCategories) => [...currentCategories, category]);
      setName("");
      setMessage("Category added successfully.");
    } catch (err) {
      setError(err.message || "Unable to add category.");
    } finally {
      setSaving(false);
    }
  };

  const showDeleteNotice = (category) => {
    setMessage("");
    setError(`"${category.name}" cannot be deleted yet. The backend category delete API is missing.`);
  };

  return (
    <section className="admin-layout page-section">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Manage categories</h1>
        {message && <p className="success">{message}</p>}
        {error && <p className="alert">{error}</p>}
        <p className="soft-note">Delete is shown in the frontend, but the backend does not currently provide a category delete API.</p>

        <form className="admin-form" onSubmit={submit}>
          <h2>Add category</h2>
          <label>Category name<input value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <button disabled={saving} type="submit">{saving ? "Adding..." : "Add Category"}</button>
        </form>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Category</th><th>ID</th><th>Storefront Image</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && (
                <tr><td colSpan="4">Loading categories...</td></tr>
              )}
              {!loading && categories.length === 0 && (
                <tr><td colSpan="4">No categories found.</td></tr>
              )}
              {!loading && categories.map((category) => {
                const image = imageByCategoryName.get(category.name.toLowerCase());

                return (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.id}</td>
                    <td>{image ? <img src={image} alt={category.name} /> : "No image URL in category API"}</td>
                    <td><button className="danger" onClick={() => showDeleteNotice(category)} type="button">Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminCategories;
