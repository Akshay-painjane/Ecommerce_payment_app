import { Link } from "react-router-dom";
import HorizontalScroller from "./HorizontalScroller.jsx";
import OfferCard from "./OfferCard.jsx";

function HomeSection({ title, subtitle, products = [], seeAll = "/products", children }) {
  const visibleProducts = products.filter((item) => item?.id);

  return (
    <section className="home-section">
      <div className="home-section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <Link to={seeAll}>See all</Link>
      </div>

      {children || (
        <HorizontalScroller>
          {visibleProducts.map((item) => <OfferCard item={item} key={`${title}-${item.id}`} />)}
        </HorizontalScroller>
      )}
    </section>
  );
}

export default HomeSection;
