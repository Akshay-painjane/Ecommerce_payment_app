import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { api, getCategoriesWithFallback } from "../services/api.js";

function Home() {
  const [products, setProducts] = useState([]);
  const [homeCategories, setHomeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;

    getCategoriesWithFallback()
      .then((items) => {
        if (active) {
          setHomeCategories(items);
          setCategoriesError("");
        }
      })
      .catch((err) => {
        if (active) {
          setHomeCategories([]);
          setCategoriesError(err.message || "Unable to load categories.");
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

  return (
    <section className="home-page">
      <div className="hero">
        <div>
          <span>Big shopping days</span>
          <h1>Style Store deals across every aisle</h1>
          <p>Shop mobiles, electronics, fashion, home, beauty, and grocery with fast checkout and dummy payments.</p>
          <Link to="/products">Shop deals</Link>
        </div>
      </div>

      {categoriesError && <p className="loading">{categoriesError}</p>}
      <div className="category-grid overlap" aria-busy={categoriesLoading}>
        {categoriesLoading && homeCategories.length === 0 && <p className="loading">Loading categories...</p>}
        {!categoriesLoading && homeCategories.length === 0 && !categoriesError && <p className="loading">No categories found.</p>}
        {homeCategories.slice(0, 6).map((category) => <CategoryCard key={category.id} category={category} />)}
      </div>

      <div className="section-heading">
        <h2>Today's recommendations</h2>
        <Link to="/products">See all products</Link>
      </div>
      {loading ? <p className="loading">Loading products...</p> : (
        <div className="products-grid">
          {products.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </section>
  );
}

export default Home;
