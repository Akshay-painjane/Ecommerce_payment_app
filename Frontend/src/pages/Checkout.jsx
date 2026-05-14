import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Checkout() {

  const cart =
    JSON.parse(localStorage.getItem("cart")) || [];

  const total = cart.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <div className="checkout-page">

      <Navbar cartCount={cart.length} />

      <div className="checkout-container">

        <div className="checkout-left">
          <h2>Shopping Cart</h2>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cart.map((item, index) => (
              <div
                className="checkout-item"
                key={index}
              >
                <div className="checkout-img">
                  {item.img}
                </div>

                <div>
                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="checkout-right">
          <h2>Order Summary</h2>

          <p>Total Items: {cart.length}</p>

          <h1>₹{total}</h1>

          <button className="payment-btn">
            Proceed to Payment
          </button>

          <div className="payment-icons">
            💳 Card &nbsp; 💰 UPI &nbsp; 🏦 Net Banking
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Checkout;