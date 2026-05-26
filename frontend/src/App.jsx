import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Categories from "./pages/Categories.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Payment from "./pages/Payment.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import UserOrders from "./pages/UserOrders.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminAddProduct from "./pages/AdminAddProduct.jsx";
import AdminProducts from "./pages/AdminProducts.jsx";
import AdminCategories from "./pages/AdminCategories.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { auth } from "./services/api.js";

function AdminRoute({ children }) {
  const user = auth.getUser();

  if (!auth.isAuthenticated() || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AuthRoute({ children }) {
  const user = auth.getUser();
  const location = useLocation();

  if (!auth.isAuthenticated() || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ message: location.pathname === "/checkout" ? "Please login to checkout" : "Please login again" }}
      />
    );
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryName" element={<Products />} />
            <Route path="/category/:categoryName" element={<Products />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<AuthRoute><Cart /></AuthRoute>} />
            <Route path="/checkout" element={<AuthRoute><Checkout /></AuthRoute>} />
            <Route path="/payment" element={<AuthRoute><Payment /></AuthRoute>} />
            <Route path="/profile" element={<AuthRoute><UserProfile /></AuthRoute>} />
            <Route path="/account" element={<AuthRoute><UserProfile /></AuthRoute>} />
            <Route path="/orders" element={<AuthRoute><UserOrders /></AuthRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/add-product" element={<AdminRoute><AdminAddProduct /></AdminRoute>} />
            <Route path="/admin/product/add" element={<AdminRoute><AdminAddProduct /></AdminRoute>} />
            <Route path="/admin/products/edit/:id" element={<AdminRoute><AdminAddProduct /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/manage-products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/admin/manage-categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="/manage-categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
