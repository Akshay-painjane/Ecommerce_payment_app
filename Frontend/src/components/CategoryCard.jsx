import { useState } from "react";
import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = !imageFailed && category.image ? category.image : "";

  return (
    <Link className="category-card" to={`/category/${encodeURIComponent(category.name)}`}>
      {image ? (
        <img src={image} alt={category.name} onError={() => setImageFailed(true)} />
      ) : (
        <span className="category-card-placeholder" aria-hidden="true">{category.name?.slice(0, 1) || "C"}</span>
      )}
      <strong>{category.name}</strong>
      <span>Shop now</span>
    </Link>
  );
}

export default CategoryCard;

