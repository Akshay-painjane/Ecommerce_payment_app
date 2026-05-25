import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api, getCategoriesWithFallback } from "../services/api.js";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  file: null,
  stock: "",
  rating: "4.5",
};

function AdminAddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getCategoriesWithFallback()
      .then((items) => {
        if (active) {
          setCategories(items);
          setForm((currentForm) => ({
            ...currentForm,
            category_id: currentForm.category_id || items[0]?.id || "",
          }));
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load categories.");
        }
      })
      .finally(() => {
        if (active) {
          setCategoriesLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const change = (event) => {
    const { name, value, files } = event.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.category_id) {
      setError("Please add or select a category before creating a product.");
      return;
    }

    try {
      await api.createProduct({
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
        rating: Number(form.rating),
        file: form.file,
      });
      setMessage("Product added successfully. It is now visible on the storefront.");
      setForm(initialForm);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="admin-layout page-section">
      <AdminSidebar />
      <form className="admin-form" onSubmit={submit}>
        <h1>Add product</h1>
        {message && <p className="success">{message}</p>}
        {error && <p className="alert">{error}</p>}
        <label>Product name<input name="name" value={form.name} onChange={change} required /></label>
        <label>Description<textarea name="description" value={form.description} onChange={change} required /></label>
        <label>Price<input name="price" value={form.price} onChange={change} type="number" min="1" required /></label>
        <label>
          Category
          <select name="category_id" value={form.category_id} onChange={change} required disabled={categoriesLoading || categories.length === 0}>
            {categoriesLoading && <option value="">Loading categories...</option>}
            {!categoriesLoading && categories.length === 0 && <option value="">No categories found</option>}
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label>Product image<input name="file" onChange={change} type="file" accept="image/*" required /></label>
        <label>Stock<input name="stock" value={form.stock} onChange={change} type="number" min="0" required /></label>
        <label>Rating<input name="rating" value={form.rating} onChange={change} type="number" min="1" max="5" step="0.1" required /></label>
        <button disabled={categoriesLoading || categories.length === 0} type="submit">Add Product</button>
      </form>
    </section>
  );
}

export default AdminAddProduct;

