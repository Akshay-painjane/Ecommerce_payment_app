import { NavLink } from "react-router-dom";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <h2>Admin</h2>
      <NavLink to="/admin">Overview</NavLink>
      <NavLink to="/admin/add-product">Add Product</NavLink>
      <NavLink to="/admin/products">Manage Products</NavLink>
      <NavLink to="/products">Storefront</NavLink>
    </aside>
  );
}

export default AdminSidebar;

