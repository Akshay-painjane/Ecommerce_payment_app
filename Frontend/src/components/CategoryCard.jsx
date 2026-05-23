import { useState } from "react";
import { Link } from "react-router-dom";
import { categories as fallbackCategories } from "../services/api.js";

function CategoryCard({ category }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = !imageFailed && category.image ? category.image : fallbackCategories[0].image;

  return (
    <Link className="category-card" to={`/products?category=${encodeURIComponent(category.name)}`}>
      <img src={image} alt={category.name} onError={() => setImageFailed(true)} />
      <strong>{category.name}</strong>
      <span>Shop now</span>
    </Link>
  );
}

export default CategoryCard;

