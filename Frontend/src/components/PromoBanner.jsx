import { Link } from "react-router-dom";

function PromoBanner({ promo }) {
  return (
    <Link className={`promo-banner ${promo.tone || ""}`} to={promo.to || "/products"}>
      <span>{promo.kicker}</span>
      <strong>{promo.title}</strong>
      <small>{promo.text}</small>
    </Link>
  );
}

export default PromoBanner;
