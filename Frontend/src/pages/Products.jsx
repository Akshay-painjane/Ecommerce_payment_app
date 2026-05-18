import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { api, categories } from "../services/api.js";

function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = (searchParams.get("q") || "").toLowerCase();
    const categoryName = searchParams.get("category");
    const category = categories.find((item) => item.name === categoryName);

    return products.filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query);
      const matchesCategory = !category || product.category_id === category.id;
      return matchesQuery && matchesCategory;
    });
  }, [products, searchParams]);

  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>{searchParams.get("category") || "All products"}</h1>
        <p>{filtered.length} products available</p>
      </div>
      {error && <p className="alert">{error}</p>}
      {loading ? <p className="loading">Loading products...</p> : (
        <div className="products-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      )}
    </section>
  );
}

export default Products;

