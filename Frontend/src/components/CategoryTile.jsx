import { useNavigate } from "react-router-dom";

function CategoryTile({ category }) {
  const navigate = useNavigate();
  const target = `/category/${encodeURIComponent(category.name)}`;
  const itemCount = category.product_count ?? category.products_count ?? category.count ?? category.total_products;

  const openCategory = () => {
    navigate(target);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCategory();
    }
  };

  return (
    <article className="category-tile" onClick={openCategory} onKeyDown={onKeyDown} role="link" tabIndex={0}>
      {category.image ? <img src={category.image} alt={category.name} loading="lazy" /> : <span>{category.name.slice(0, 1)}</span>}
      <strong title={category.name}>{category.name}</strong>
      {Number(itemCount) > 0 && <small>{Number(itemCount).toLocaleString("en-IN")} items</small>}
      <button
        onClick={(event) => {
          event.stopPropagation();
          openCategory();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        Shop now
      </button>
    </article>
  );
}

export default CategoryTile;
