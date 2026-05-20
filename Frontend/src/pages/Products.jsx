import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { api, categories } from "../services/api.js";

const pageSize = 8;

function Products() {
  const [searchParams] = useSearchParams();
  const { categoryName: routeCategoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = (searchParams.get("q") || search).toLowerCase();
    const categoryName = searchParams.get("category") || routeCategoryName;
    const category = categories.find((item) => item.name === categoryName);

    const result = products.filter((product) => {
      const matchesQuery = !query || product.name.toLowerCase().includes(query) || product.description?.toLowerCase().includes(query);
      const matchesCategory = !category || product.category_id === category.id;
      return matchesQuery && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      return Number(b.id) - Number(a.id);
    });
  }, [products, searchParams, routeCategoryName, search, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <h1>{searchParams.get("category") || routeCategoryName || "All products"}</h1>
          <p>{filtered.length} products available</p>
        </div>
      </div>

      <div className="catalog-tools">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search in this category"
        />
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
        </select>
        <div className="category-pills">
          {categories.map((category) => (
            <a key={category.id} href={`/products?category=${category.name}`}>{category.name}</a>
          ))}
        </div>
      </div>

      {error && <p className="alert">{error}</p>}
      {loading ? <p className="loading">Loading products...</p> : (
        <>
          <div className="products-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)} type="button">Previous</button>
            <span>Page {currentPage} of {pageCount}</span>
            <button disabled={currentPage === pageCount} onClick={() => setPage((value) => value + 1)} type="button">Next</button>
          </div>
        </>
      )}
    </section>
  );
}

export default Products;
