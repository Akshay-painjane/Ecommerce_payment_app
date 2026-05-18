import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api, categories } from "../services/api.js";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category_id: 1,
  image_url: "",
  stock: "",
  rating: "4.5",
};

function AdminAddProduct() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.createProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
        rating: Number(form.rating),
      });
      setMessage("Product added successfully. It is now visible on the storefront.");
      setForm(initialForm);
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
        <label>Category<select name="category_id" value={form.category_id} onChange={change}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label>Image URL<input name="image_url" value={form.image_url} onChange={change} required /></label>
        <label>Stock<input name="stock" value={form.stock} onChange={change} type="number" min="0" required /></label>
        <label>Rating<input name="rating" value={form.rating} onChange={change} type="number" min="1" max="5" step="0.1" required /></label>
        <button type="submit">Add Product</button>
      </form>
    </section>
  );
}

export default AdminAddProduct;

