import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, auth } from "../services/api.js";

const getCategoryName = (product) => {
  if (typeof product?.category === "string") {
    return product.category;
  }

  return product?.category?.name || product?.category_name || product?.categoryName || "";
};

const getStock = (product) => Number(product?.stock ?? product?.stock_quantity ?? product?.quantity ?? 0);

const getOldPrice = (product) => Number(product?.old_price || product?.oldPrice || product?.mrp || product?.original_price || 0);

const getDiscountValue = (product) => {
  const rawDiscount = product?.discount || product?.discount_percent || product?.discountPercentage || "";
  const numericDiscount = Number(String(rawDiscount).replace(/[^\d.]/g, ""));

  if (Number.isFinite(numericDiscount) && numericDiscount > 0) {
    return numericDiscount;
  }

  const price = Number(product?.price || 0);
  const oldPrice = getOldPrice(product);

  return oldPrice > price && price > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
};

const findProductById = (products, id) => products.find((item) => String(item.id) === String(id));

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        let singleProduct = null;
        let products = [];

        try {
          singleProduct = await api.getProduct(id);
        } catch {
          singleProduct = null;
        }

        try {
          products = await api.getProducts();
        } catch {
          products = [];
        }

        const resolvedProduct = singleProduct || findProductById(products, id);

        if (!active) {
          return;
        }

        if (!resolvedProduct) {
          setProduct(null);
          setRelated([]);
          setError("Product not found");
          return;
        }

        const categoryName = getCategoryName(resolvedProduct).toLowerCase();
        const categoryId = resolvedProduct.category_id ?? resolvedProduct.category?.id;

        setProduct(resolvedProduct);
        setRelated(
          products
            .filter((item) => {
              if (String(item.id) === String(resolvedProduct.id)) {
                return false;
              }

              const sameCategoryId = categoryId && String(item.category_id ?? item.category?.id) === String(categoryId);
              const sameCategoryName = categoryName && getCategoryName(item).toLowerCase() === categoryName;

              return sameCategoryId || sameCategoryName;
            })
            .slice(0, 4)
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const addToCart = async () => {
    if (!auth.isAuthenticated()) {
      navigate("/login");
      return;
    }

    setMessage("");
    setError("");

    try {
      await api.addToCart({
        product_id: product.id,
        quantity,
      });
      setMessage("Added to cart");
    } catch (err) {
      setError(err.message || "Unable to add to cart");
    }
  };

  const buyNow = () => {
    if (!auth.isAuthenticated()) {
      navigate("/login");
      return;
    }

    navigate(`/checkout?product=${id}`);
  };

  if (loading) return <p className="loading page-section">Loading product...</p>;

  if (!product) {
    return (
      <section className="page-section">
        <div className="empty-state catalog-empty-state">
          <h2>{error || "Product not found"}</h2>
          <p>The product may have been removed or the link is no longer valid.</p>
          <Link className="primary-link" to="/products">View all products</Link>
        </div>
      </section>
    );
  }

  const categoryName = getCategoryName(product);
  const stock = getStock(product);
  const oldPrice = getOldPrice(product);
  const discount = getDiscountValue(product);
  const price = Number(product.price || 0);
  const rating = product.rating ? Number(product.rating).toFixed(1) : "";

  return (
    <section className="page-section">
      <div className="product-detail premium-detail">
        <div className="detail-gallery">
          <div className="gallery-thumbs">
            {[1, 2, 3].map((item) => (
              product.image_url
                ? <img key={item} src={product.image_url} alt={`${product.name} view ${item}`} />
                : <span key={item} className="gallery-thumb-placeholder">No image</span>
            ))}
          </div>
          <div className="detail-image">
            {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span className="product-image-placeholder">No image</span>}
            {discount > 0 && <span className="discount-badge detail-discount">{discount}% OFF</span>}
          </div>
        </div>

        <div className="detail-info">
          {categoryName && <span className="detail-category">{categoryName}</span>}
          <h1>{product.name}</h1>
          {rating && <p className="rating">Rating {rating} / 5 from verified customers</p>}
          <div className="detail-price-row">
            <strong className="detail-price">Rs. {price.toLocaleString("en-IN")}</strong>
            {oldPrice > price && <s>Rs. {oldPrice.toLocaleString("en-IN")}</s>}
          </div>
          <p className="stock">{stock > 0 ? `In stock (${stock} available)` : "Out of stock"}</p>
          <div className="spec-box">
            <h2>Product description</h2>
            <p>{product.description || "No description available."}</p>
          </div>
          <div className="spec-box">
            <h2>Product details</h2>
            {categoryName && <p>Category: {categoryName}</p>}
            <p>Product ID: {product.id}</p>
            <p>Delivery: Free standard delivery on eligible orders</p>
          </div>
        </div>

        <aside className="buy-box">
          <strong>Rs. {price.toLocaleString("en-IN")}</strong>
          {oldPrice > price && <s>Rs. {oldPrice.toLocaleString("en-IN")}</s>}
          <span>FREE delivery on eligible orders</span>
          <span className={stock > 0 ? "stock" : "alert"}>{stock > 0 ? "Ready to ship" : "Currently unavailable"}</span>
          <label>Quantity<input value={quantity} min="1" max={stock || 1} onChange={(e) => setQuantity(Number(e.target.value))} type="number" /></label>
          {message && <p className="success">{message}</p>}
          {error && <p className="alert">{error}</p>}
          <button disabled={stock <= 0} onClick={addToCart} type="button">Add to Cart</button>
          <button className="orange-button" disabled={stock <= 0} onClick={buyNow} type="button">Buy Now</button>
        </aside>
      </div>

      {related.length > 0 && (
        <>
          <div className="section-heading">
            <h2>Related products</h2>
            <Link to="/products">View all</Link>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <Link key={item.id} to={`/products/${item.id}`} className="related-card">
                {item.image_url ? <img src={item.image_url} alt={item.name} /> : <span className="product-image-placeholder">No image</span>}
                <strong>{item.name}</strong>
                <span>Rs. {Number(item.price).toLocaleString("en-IN")}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default ProductDetails;
