import { Link } from "react-router-dom";

const supportEmails = ["monikachebrolu1@gmail.com", "deepthiupadhyayula@gmail.com"];

const helpTopics = [
  { label: "ORD", title: "Orders", text: "Get help tracking orders, checking order details, or reviewing recent purchases." },
  { label: "PAY", title: "Payments", text: "Ask about secure payments, failed transactions, duplicate charges, and payment options." },
  { label: "RET", title: "Returns & Refunds", text: "Find support for return eligibility, return requests, and expected refund timelines." },
  { label: "SHP", title: "Shipping Rates", text: "Understand delivery charges, location-based rates, and checkout shipping details." },
  { label: "ACC", title: "Account Help", text: "Get guidance for login, profile information, cart access, and account settings." },
];

function ContactUs() {
  return (
    <section className="contact-page page-section">
      <div className="contact-hero">
        <div>
          <span>Style Store Support</span>
          <h1>Contact Style Store Support</h1>
          <p>
            Need help with an order, payment, return, delivery question, or account issue?
            Our support team is ready to guide you with clear next steps.
          </p>
        </div>
        <Link className="support-hero-action" to="/orders">View orders</Link>
      </div>

      <div className="contact-email-grid">
        {supportEmails.map((email) => (
          <article className="contact-email-card" key={email}>
            <span className="support-card-mark">MAIL</span>
            <div>
              <h2>Email support</h2>
              <p>Send your order ID, payment method, and issue details so we can help faster.</p>
              <a href={`mailto:${email}`}>{email}</a>
            </div>
          </article>
        ))}
      </div>

      <section className="contact-panel">
        <div className="support-section-heading">
          <span>Help topics</span>
          <h2>Choose the support area that fits your question</h2>
        </div>
        <div className="contact-topic-grid">
          {helpTopics.map((topic) => (
            <article className="contact-topic-card" key={topic.title}>
              <span>{topic.label}</span>
              <h3>{topic.title}</h3>
              <p>{topic.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-panel support-note-panel">
        <div className="support-section-heading">
          <span>Customer support note</span>
          <h2>Helpful details make support faster</h2>
        </div>
        <p>
          When contacting Style Store, include your registered email, order ID if available,
          product name, and a short description of the issue. For payments and refunds,
          include the payment method and transaction status shown during checkout.
        </p>
        <div className="support-link-row">
          <Link className="primary-link" to="/payment-help">Payment Help</Link>
          <Link className="secondary-link" to="/returns">Returns Centre</Link>
          <Link className="secondary-link" to="/shipping-rates">Shipping Rates</Link>
        </div>
      </section>
    </section>
  );
}

export default ContactUs;
