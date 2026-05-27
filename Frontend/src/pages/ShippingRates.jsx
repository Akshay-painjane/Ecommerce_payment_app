const supportEmails = ["monikachebrolu1@gmail.com", "deepthi@gmail.com"];

const rateFactors = [
  {
    label: "WGT",
    title: "Weight and volume",
    text: "Larger or heavier packages may cost more to deliver because they use extra handling and courier capacity.",
  },
  {
    label: "LOC",
    title: "Distance and location",
    text: "Delivery charges can change by city, pincode coverage, and distance from the fulfilment location.",
  },
  {
    label: "SPD",
    title: "Delivery speed",
    text: "Standard delivery keeps charges lower, while faster delivery options may include an additional fee.",
  },
  {
    label: "COD",
    title: "COD or extra services",
    text: "Cash on Delivery or special handling may add a small service charge when available for your order.",
  },
];

const sampleRates = [
  { location: "Bengaluru", charge: "Free", speed: "Standard delivery" },
  { location: "Hyderabad", charge: "Rs. 50", speed: "Standard delivery" },
  { location: "Mumbai", charge: "Rs. 80", speed: "Standard delivery" },
  { location: "Delhi", charge: "Rs. 100", speed: "Standard delivery" },
  { location: "Other locations", charge: "Rs. 120", speed: "Based on serviceability" },
];

const faqs = [
  {
    question: "Where can I see the exact delivery charge?",
    answer: "The checkout page shows the delivery charge after you select your delivery location.",
  },
  {
    question: "Does shipping apply to every order?",
    answer: "Some locations or offers may include free delivery. The order summary shows the final charge before payment.",
  },
  {
    question: "Can delivery speed change the charge?",
    answer: "Yes. Faster or special delivery options may cost more when offered for an order.",
  },
  {
    question: "Who can help with shipping questions?",
    answer: "Contact Style Store support with your order ID, city, and delivery concern.",
  },
];

function ShippingRates() {
  return (
    <section className="support-page page-section">
      <div className="support-hero shipping-hero">
        <div>
          <span>Style Store delivery</span>
          <h1>Shipping Rates</h1>
          <p>Delivery charges are shown clearly before payment, based on location and order delivery needs.</p>
        </div>
      </div>

      <section className="support-panel shipping-overview">
        <div className="support-section-heading">
          <span>Shipping rates overview</span>
          <h2>How shipping charges are calculated</h2>
        </div>
        <p>Delivery charges are calculated based on your selected city, order value, delivery speed, and service availability. The final delivery fee is shown clearly at checkout before payment.</p>
      </section>

      <div className="support-card-grid">
        {rateFactors.map((factor) => (
          <article className="support-card" key={factor.title}>
            <span className="support-card-mark">{factor.label}</span>
            <h2>{factor.title}</h2>
            <p>{factor.text}</p>
          </article>
        ))}
      </div>

      <section className="support-panel">
        <div className="support-section-heading">
          <span>Sample shipping rate table</span>
          <h2>Estimated delivery charges</h2>
        </div>
        <div className="support-table-wrap">
          <table className="support-table">
            <thead>
              <tr>
                <th>Delivery location</th>
                <th>Shipping charge</th>
                <th>Delivery option</th>
              </tr>
            </thead>
            <tbody>
              {sampleRates.map((rate) => (
                <tr key={rate.location}>
                  <td>{rate.location}</td>
                  <td>{rate.charge}</td>
                  <td>{rate.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="support-two-column">
        <section className="support-panel">
          <div className="support-section-heading">
            <span>FAQ</span>
            <h2>Common shipping questions</h2>
          </div>
          <div className="support-faq-grid single">
            {faqs.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="support-panel contact-panel">
          <div className="support-section-heading">
            <span>Contact support</span>
            <h2>Shipping help emails</h2>
          </div>
          <div className="support-email-list">
            {supportEmails.map((email) => (
              <a href={`mailto:${email}`} key={email}>{email}</a>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default ShippingRates;
