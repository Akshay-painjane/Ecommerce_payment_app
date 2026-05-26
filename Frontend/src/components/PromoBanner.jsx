import { Link } from "react-router-dom";

function PromoBanner({ promo }) {
  return (
    <Link className={`promo-banner ${promo.tone || ""}`} to={promo.to || "/products"}>
      <span className="promo-icon" aria-hidden="true">{promo.icon || "Deal"}</span>
      <span className="promo-kicker">{promo.kicker}</span>
      <strong>{promo.title}</strong>
      <small>{promo.text}</small>
    </Link>
  );
}

export default PromoBanner;
