import { useEffect, useState } from "react";
import CategoryCard from "../components/CategoryCard.jsx";
import { getCategoriesWithFallback } from "../services/api.js";

function Categories() {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getCategoriesWithFallback()
      .then((items) => {
        if (active) {
          setCategoryList(items);
          setError("");
        }
      })
      .catch((err) => {
        if (active) {
          setCategoryList([]);
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

  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>Shop by category</h1>
        <p>Browse departments curated for quick everyday shopping.</p>
      </div>
      {error && <p className="loading">{error}</p>}
      {loading && categoryList.length === 0 && <p className="loading">Loading categories...</p>}
      {!loading && categoryList.length === 0 && !error && <p className="loading">No categories found.</p>}
      <div className="category-grid wide" aria-busy={loading}>
        {categoryList.map((category) => <CategoryCard key={category.id} category={category} />)}
      </div>
    </section>
  );
}

export default Categories;

