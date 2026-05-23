import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard.jsx";
import { api, categories as fallbackCategories, getCategoriesWithFallback } from "../services/api.js";

const pageSize = 8;

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getProductCategoryName = (product) => {
  if (product.category && typeof product.category === "object") {
    return product.category.name || product.category.title || "";
  }

  return product.category || product.category_name || "";
};

const getProductCategoryId = (product) => {
  if (product.category && typeof product.category === "object") {
    return product.category.id ?? product.category.category_id;
  }

  return product.category_id ?? product.category;
};

function Products() {
  const [searchParams] = useSearchParams();
  const { categoryName: routeCategoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState(fallbackCategories);
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

  useEffect(() => {
    let active = true;

    getCategoriesWithFallback()
      .then((items) => {
        if (active) {
          setCategoryList(items);
        }
      })
      .catch(() => {
        if (active) {
          setCategoryList(fallbackCategories);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = normalizeText(searchParams.get("q") || search);
    const categoryName = searchParams.get("category") || routeCategoryName;
    const normalizedCategoryName = normalizeText(categoryName);
    const category = categoryList.find((item) => normalizeText(item.name) === normalizedCategoryName);

    const result = products.filter((product) => {
      const productName = normalizeText(product.name || product.title);
      const productDescription = normalizeText(product.description);
      const productCategoryName = normalizeText(getProductCategoryName(product));
      const productCategoryId = getProductCategoryId(product);
      const matchesQuery = !query || productName.includes(query) || productDescription.includes(query);
      const matchesCategory = !categoryName
        || String(productCategoryId) === String(category?.id)
        || productCategoryName === normalizedCategoryName;
      return matchesQuery && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sort === "price-low") return Number(a.price) - Number(b.price);
      if (sort === "price-high") return Number(b.price) - Number(a.price);
      if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      return Number(b.id) - Number(a.id);
    });
  }, [products, categoryList, searchParams, routeCategoryName, search, sort]);

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
          {categoryList.map((category) => (
            <Link key={category.id} to={`/products?category=${encodeURIComponent(category.name)}`}>{category.name}</Link>
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
