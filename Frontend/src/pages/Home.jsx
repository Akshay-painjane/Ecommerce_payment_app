import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getCategoriesWithFallback } from "../services/api.js";
import HeroCarousel from "../components/HeroCarousel.jsx";
import CategoryTile from "../components/CategoryTile.jsx";
import HomeSection from "../components/HomeSection.jsx";
import HorizontalScroller from "../components/HorizontalScroller.jsx";
import PromoBanner from "../components/PromoBanner.jsx";

const promoBanners = [
  { kicker: "Bank offer", title: "10% instant discount", text: "On selected cards and checkout deals", to: "/products", tone: "green" },
  { kicker: "Prime-style perks", title: "Fast dummy checkout", text: "Smooth cart, orders, and payment flow", to: "/cart", tone: "blue" },
  { kicker: "New arrivals", title: "Browse live catalog", text: "Only products from your store database", to: "/products", tone: "pink" },
];

const getCategoryName = (product) => {
  if (typeof product.category === "string") {
    return product.category;
  }

  return product.category?.name || product.category_name || product.categoryName || "";
};

const getProductTimestamp = (product) => (
  Date.parse(product.created_at || product.createdAt || product.updated_at || product.updatedAt || "") || 0
);

const getDiscountValue = (product) => {
  const rawDiscount = product.discount || product.discount_percent || product.discountPercentage || "";
  const numericDiscount = Number(String(rawDiscount).replace(/[^\d.]/g, ""));

  return Number.isFinite(numericDiscount) ? numericDiscount : 0;
};

const getOldPrice = (product) => Number(product.old_price || product.oldPrice || product.mrp || product.original_price || 0);

const getOfferText = (product) => {
  const offerText = product.offer_text || product.offerText || product.offer || product.deal_label || product.dealLabel || product.badge_text || product.badgeText || "";

  return typeof offerText === "string" ? offerText.trim() : "";
};

const getDiscountPercent = (product) => {
  const explicitDiscount = getDiscountValue(product);

  if (explicitDiscount > 0) {
    return explicitDiscount;
  }

  const price = Number(product.price || 0);
  const oldPrice = getOldPrice(product);

  if (oldPrice > price && price > 0) {
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  return 0;
};

const toOfferProduct = (product) => {
  const price = Number(product.price || 0);
  const oldPrice = getOldPrice(product);
  const discount = getDiscountPercent(product);

  return {
    id: product.id,
    category: getCategoryName(product),
    name: product.name,
    price,
    oldPrice: oldPrice > price ? oldPrice : 0,
    discount: discount > 0 ? `${discount}% OFF` : "",
    offerText: getOfferText(product),
    rating: product.rating,
    image: product.image_url,
    to: `/products/${product.id}`,
  };
};

const sortByDealStrength = (items) => (
  [...items].sort((a, b) => {
    const discountDelta = getDiscountPercent(b) - getDiscountPercent(a);

    if (discountDelta !== 0) {
      return discountDelta;
    }

    return Number(b.rating || 0) - Number(a.rating || 0);
  })
);

const filterByCategory = (items, categoryName) => (
  items.filter((product) => getCategoryName(product).toLowerCase() === categoryName.toLowerCase())
);

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

  const categoryProducts = {
    electronics: filterByCategory(products, "Electronics"),
    fashion: filterByCategory(products, "Fashion"),
    grocery: filterByCategory(products, "Grocery"),
    beauty: filterByCategory(products, "Beauty"),
  };
  const bestDeals = sortByDealStrength(products);
  const recommendations = [...products].sort((a, b) => getProductTimestamp(b) - getProductTimestamp(a));
  const hasProducts = products.length > 0;

  return (
    <section className="home-page">
      <HeroCarousel />

      {categoriesError && <p className="loading">{categoriesError}</p>}
      <div className="floating-shortcuts" aria-busy={categoriesLoading}>
        {homeCategories.slice(0, 6).map((category) => (
          <Link className="shortcut-card" key={category.id} to={`/category/${encodeURIComponent(category.name)}`}>
            {category.image && <img src={category.image} alt={category.name} />}
            <span>{category.name}</span>
            <strong>Shop now</strong>
          </Link>
        ))}
        {categoriesLoading && homeCategories.length === 0 && <p className="loading">Loading categories...</p>}
        {!categoriesLoading && homeCategories.length === 0 && !categoriesError && <p className="loading">No categories available yet.</p>}
      </div>

      <div className="mini-offer-grid">
        {promoBanners.map((promo) => <PromoBanner key={promo.title} promo={promo} />)}
      </div>

      {homeCategories.length > 0 && (
        <HomeSection title="Trending Categories" subtitle="Swipe through today's busiest aisles" seeAll="/categories">
          <HorizontalScroller>
            {homeCategories.map((category) => (
              <CategoryTile category={category} key={category.id} />
            ))}
          </HorizontalScroller>
        </HomeSection>
      )}

      {loading && <p className="loading">Loading products...</p>}
      {!loading && !hasProducts && <div className="empty-state home-empty-state"><h2>No products available yet.</h2></div>}

      {hasProducts && <HomeSection title="Best Deals" subtitle="Live offers from your store catalog" products={bestDeals.map(toOfferProduct)} />}
      {categoryProducts.electronics.length > 0 && (
        <HomeSection title="Top Electronics" subtitle="Real electronics products from your catalog" products={categoryProducts.electronics.map(toOfferProduct)} seeAll="/category/Electronics" />
      )}

      <div className="wide-promo">
        <div>
          <span>Style Store Bazaar</span>
          <h2>Fresh drops, festive prices, and checkout-ready deals</h2>
        </div>
        <Link to="/products">Explore all deals</Link>
      </div>

      {categoryProducts.fashion.length > 0 && (
        <HomeSection title="Fashion Picks" subtitle="Real fashion products from your catalog" products={categoryProducts.fashion.map(toOfferProduct)} seeAll="/category/Fashion" />
      )}
      {categoryProducts.grocery.length > 0 && (
        <HomeSection title="Grocery Offers" subtitle="Real grocery products from your catalog" products={categoryProducts.grocery.map(toOfferProduct)} seeAll="/category/Grocery" />
      )}
      {categoryProducts.beauty.length > 0 && (
        <HomeSection title="Beauty & Wellness" subtitle="Real beauty products from your catalog" products={categoryProducts.beauty.map(toOfferProduct)} seeAll="/category/Beauty" />
      )}
      {hasProducts && (
        <HomeSection
          title="Recommended Products"
          subtitle="Latest products from your store catalog"
          products={recommendations.slice(0, 10).map(toOfferProduct)}
        />
      )}
    </section>
  );
}

export default Home;
