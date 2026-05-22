import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api } from "../services/api.js";

const initialForm = {
  name: "",
  description: "",
  file: null,
};

const API_ORIGIN = "http://127.0.0.1:8000";

const getCategoryPayload = (form, includeFile) => {
  const categoryName = form.name.trim();
  const payload = new FormData();

  payload.append("name", categoryName);
  payload.append("description", form.description.trim() || `${categoryName} category`);

  if (includeFile && form.file) {
    payload.append("file", form.file);
  }

  return payload;
};

const getCategoryImageValue = (category) => (
  category.image_url
  || category.image
  || category.file
  || category.image_path
  || category.category_image
  || ""
);

const getCategoryImageUrl = (category) => {
  const image = getCategoryImageValue(category);

  if (typeof image !== "string" || !image.trim()) {
    return "";
  }

  const imageUrl = image.trim();

  if (/^(?:https?:|data:|blob:)/i.test(imageUrl)) {
    return imageUrl;
  }

  return `${API_ORIGIN}/${imageUrl.replace(/^\/+/, "")}`;
};

function CategoryPreview({ category }) {
  const [broken, setBroken] = useState(false);
  const imageUrl = getCategoryImageUrl(category);

  if (!imageUrl || broken) {
    return <span className="category-image-fallback">Image preview unavailable</span>;
  }

  return <img src={imageUrl} alt={category.name} onError={() => setBroken(true)} />;
}

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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

  const refreshCategories = async () => {
    const data = await api.getCategories();
    setCategories(Array.isArray(data) ? data : []);
  };

  const change = (event) => {
    const { name, files, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: files ? files[0] || null : value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const categoryName = form.name.trim();

    if (!categoryName) {
      setMessage("");
      setError("Please enter category name.");
      return;
    }

    if (!editing && !form.file) {
      setMessage("");
      setError("Please upload category image");
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const payload = getCategoryPayload(form, Boolean(form.file));

      if (editing) {
        await api.updateCategory(editing.id, payload);
        setMessage("Category updated successfully.");
      } else {
        await api.createCategory(payload);
        setMessage("Category added successfully.");
      }

      await refreshCategories();
      setEditing(null);
      setForm(initialForm);
      event.currentTarget.reset();
    } catch (err) {
      setError(err.message || `Unable to ${editing ? "update" : "add"} category.`);
    } finally {
      setSaving(false);
    }
  };

  const edit = (category) => {
    setError("");
    setMessage("");
    setEditing(category);
    setForm({
      name: category.name || "",
      description: category.description || `${category.name || ""} category`,
      file: null,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(initialForm);
    setError("");
  };

  const remove = async (category) => {
    const confirmed = window.confirm(`Delete "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");
    setDeletingId(category.id);

    try {
      await api.deleteCategory(category.id);
      await refreshCategories();
      setMessage("Category deleted successfully.");

      if (editing?.id === category.id) {
        cancelEdit();
      }
    } catch (err) {
      setError(err.message || "Unable to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-layout page-section">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Manage categories</h1>
        {message && <p className="success">{message}</p>}
        {error && <p className="alert">{error}</p>}

        <form className="admin-form" onSubmit={submit}>
          <h2>{editing ? "Edit category" : "Add category"}</h2>
          <label>Category name<input name="name" value={form.name} onChange={change} required /></label>
          <label>Description<textarea name="description" value={form.description} onChange={change} /></label>
          <label>Category image<input key={editing?.id || "new-category"} name="file" onChange={change} type="file" accept="image/*" /></label>
          <div>
            <button disabled={saving} type="submit">{saving ? "Saving..." : editing ? "Save Category" : "Add Category"}</button>
            {editing && <button onClick={cancelEdit} type="button">Cancel</button>}
          </div>
        </form>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Category</th><th>Description</th><th>ID</th><th>Image</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && (
                <tr><td colSpan="5">Loading categories...</td></tr>
              )}
              {!loading && categories.length === 0 && (
                <tr><td colSpan="5">No categories found.</td></tr>
              )}
              {!loading && categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.description || "No description"}</td>
                  <td>{category.id}</td>
                  <td><CategoryPreview key={`${category.id}-${getCategoryImageUrl(category)}`} category={category} /></td>
                  <td>
                    {api.updateCategory && <button onClick={() => edit(category)} type="button">Edit</button>}
                    {api.deleteCategory && (
                      <button className="danger" disabled={deletingId === category.id} onClick={() => remove(category)} type="button">
                        {deletingId === category.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
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

export default AdminCategories;
