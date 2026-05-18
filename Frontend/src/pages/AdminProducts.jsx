import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { api, categories } from "../services/api.js";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = () => api.getProducts().then(setProducts);

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    await api.deleteProduct(id);
    load();
  };

  const save = async (event) => {
    event.preventDefault();
    await api.updateProduct(editing.id, {
      ...editing,
      price: Number(editing.price),
      stock: Number(editing.stock),
      category_id: Number(editing.category_id),
      rating: Number(editing.rating),
    });
    setEditing(null);
    load();
  };

  return (
    <section className="admin-layout page-section">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Manage products</h1>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><img src={product.image_url} alt={product.name} />{product.name}</td>
                  <td>{categories.find((item) => item.id === product.category_id)?.name}</td>
                  <td>Rs. {Number(product.price).toLocaleString("en-IN")}</td>
                  <td>{product.stock}</td>
                  <td>{Number(product.rating || 4.5).toFixed(1)}</td>
                  <td><button onClick={() => setEditing(product)} type="button">Edit</button><button className="danger" onClick={() => remove(product.id)} type="button">Delete</button></td>
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
            <div><button type="submit">Save</button><button onClick={() => setEditing(null)} type="button">Cancel</button></div>
          </form>
        )}
      </div>
    </section>
  );
}

export default AdminProducts;

