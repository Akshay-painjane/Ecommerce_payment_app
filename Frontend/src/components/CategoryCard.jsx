import { Link } from "react-router-dom";

function CategoryCard({ category }) {
  return (
    <Link className="category-card" to={`/products?category=${encodeURIComponent(category.name)}`}>
      <img src={category.image} alt={category.name} />
      <strong>{category.name}</strong>
      <span>Shop now</span>
    </Link>
  );
}

export default CategoryCard;

