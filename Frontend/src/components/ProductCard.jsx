function ProductCard({ product, addToCart }) {
  return (
    <div className="product-card">

      <span className="product-tag">
        {product.tag}
      </span>

      <div className="product-img">
        <img
          src={product.img}
          alt={product.name}
        />
      </div>

      <h3>{product.name}</h3>

      <p className="rating">
        ★★★★★
      </p>

      <p className="price">
        ₹{product.price}
      </p>

      <button
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;