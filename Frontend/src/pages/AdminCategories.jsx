import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api, getCategoryImageUrl, normalizeCategories } from "../services/api.js";

const initialForm = {
  name: "",
  description: "",
  file: null,
};

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
  const [previewUrl, setPreviewUrl] = useState("");
  const [formResetKey, setFormResetKey] = useState(0);
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
          setCategories(normalizeCategories(data));
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

  useEffect(() => () => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const refreshCategories = async () => {
    const data = await api.getCategories();
    setCategories(normalizeCategories(data));
  };

  const change = (event) => {
    const { name, files, value } = event.target;

    const file = files ? files[0] || null : null;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: files ? file : value,
    }));

    if (files) {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(file ? URL.createObjectURL(file) : "");
    }
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
      setPreviewUrl("");
      setFormResetKey((key) => key + 1);
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
    setPreviewUrl(getCategoryImageUrl(category));
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(initialForm);
    setPreviewUrl("");
    setFormResetKey((key) => key + 1);
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
      <div className="admin-content admin-category-page">
        <div className="admin-page-header">
          <div>
            <span>Catalog setup</span>
            <h1>Manage categories</h1>
            <p>Add departments, upload category images, and keep storefront category cards fresh.</p>
          </div>
          <strong>{categories.length} categories</strong>
        </div>
        {message && <p className="success toast-message">{message}</p>}
        {error && <p className="alert">{error}</p>}

        <form className="admin-form category-editor" onSubmit={submit}>
          <div className="category-editor-copy">
            <h2>{editing ? "Edit category" : "Add category"}</h2>
            <p>Images are uploaded to the backend and reused automatically on the home and category pages.</p>
          </div>
          <div className="category-form-grid">
            <div className="category-fields">
              <label>Category name<input name="name" value={form.name} onChange={change} required /></label>
              <label>Description<textarea name="description" value={form.description} onChange={change} /></label>
              <label>Category image<input key={`${editing?.id || "new-category"}-${formResetKey}`} name="file" onChange={change} type="file" accept="image/*" /></label>
            </div>
            <div className="category-upload-preview">
              {previewUrl ? <img src={previewUrl} alt={form.name || "Category preview"} /> : <span>Image preview</span>}
            </div>
          </div>
          <div className="form-actions">
            <button disabled={saving} type="submit">{saving ? "Saving..." : editing ? "Save Category" : "Add Category"}</button>
            {editing && <button className="secondary-button" onClick={cancelEdit} type="button">Cancel</button>}
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
