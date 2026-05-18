import CategoryCard from "../components/CategoryCard.jsx";
import { categories } from "../services/api.js";

function Categories() {
  return (
    <section className="page-section">
      <div className="section-heading">
        <h1>Shop by category</h1>
        <p>Browse departments curated for quick everyday shopping.</p>
      </div>
      <div className="category-grid wide">
        {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
      </div>
    </section>
  );
}

export default Categories;

