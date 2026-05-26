import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api, getCategoriesWithFallback } from "../services/api.js";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  image_url: "",
  file: null,
  stock: "",
  rating: "4.5",
};

function AdminAddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (!isEditMode) {
      return undefined;
    }

    let active = true;

    api.getProduct(id)
      .then((product) => {
        if (!active) {
          return;
        }

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          category_id: product.category_id ?? product.category?.id ?? "",
          image_url: product.image_url || "",
          file: null,
          stock: product.stock ?? "",
          rating: product.rating ?? "4.5",
        });
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to load product.");
        }
      })
      .finally(() => {
        if (active) {
          setProductLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id, isEditMode]);

  const change = (event) => {
    const { name, value, files } = event.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.category_id) {
      setError(`Please add or select a category before ${isEditMode ? "updating" : "creating"} a product.`);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
        rating: Number(form.rating),
      };

      if (isEditMode) {
        payload.image_url = form.image_url || null;
      } else if (form.file) {
        payload.file = form.file;
      }

      if (isEditMode) {
        await api.updateProduct(id, payload);
        setMessage("Product updated successfully.");
      } else {
        await api.createProduct({
          ...payload,
          file: form.file,
        });
        setMessage("Product added successfully. It is now visible on the storefront.");
        setForm(initialForm);
      }

      navigate("/admin/products", {
        state: {
          message: isEditMode ? "Product updated successfully." : "Product added successfully.",
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loading = categoriesLoading || productLoading;

  return (
    <section className="admin-layout page-section">
      <AdminSidebar />
      <form className="admin-form" onSubmit={submit}>
        <h1>{isEditMode ? "Edit product" : "Add product"}</h1>
        {message && <p className="success">{message}</p>}
        {error && <p className="alert">{error}</p>}
        {productLoading && <p className="loading">Loading product...</p>}
        <label>Product name<input name="name" value={form.name} onChange={change} required disabled={productLoading} /></label>
        <label>Description<textarea name="description" value={form.description} onChange={change} required disabled={productLoading} /></label>
        <label>Price<input name="price" value={form.price} onChange={change} type="number" min="1" required disabled={productLoading} /></label>
        <label>
          Category
          <select name="category_id" value={form.category_id} onChange={change} required disabled={loading || categories.length === 0}>
            {categoriesLoading && <option value="">Loading categories...</option>}
            {!categoriesLoading && categories.length === 0 && <option value="">No categories found</option>}
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        {isEditMode ? (
          <label>Product image URL<input name="image_url" value={form.image_url} onChange={change} disabled={productLoading} /></label>
        ) : (
          <label>Product image<input name="file" onChange={change} type="file" accept="image/*" required disabled={productLoading} /></label>
        )}
        <label>Stock<input name="stock" value={form.stock} onChange={change} type="number" min="0" required disabled={productLoading} /></label>
        <label>Rating<input name="rating" value={form.rating} onChange={change} type="number" min="1" max="5" step="0.1" required disabled={productLoading} /></label>
        <button disabled={loading || saving || categories.length === 0} type="submit">{saving ? "Saving..." : isEditMode ? "Update Product" : "Add Product"}</button>
      </form>
    </section>
  );
}

export default AdminAddProduct;

