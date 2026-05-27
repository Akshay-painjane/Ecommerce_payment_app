import { Link } from "react-router-dom";

const supportEmails = ["monikachebrolu1@gmail.com", "deepthi@gmail.com"];

const protectionCards = [
  {
    label: "100%",
    title: "100% Purchase Protection",
    text: "Shop confidently with support for eligible orders, payments, refunds, and returns from checkout to delivery.",
  },
  {
    label: "SEC",
    title: "Secure Payments and Safe Ordering",
    text: "Choose card, UPI, or Cash on Delivery with a checkout flow designed to keep your order experience clear and secure.",
  },
  {
    label: "GEN",
    title: "Genuine Products",
    text: "Style Store focuses on authentic listings, clear pricing, and dependable order details before you pay.",
  },
  {
    label: "RET",
    title: "Easy Returns",
    text: "Return eligible items from your orders and follow refund progress from the Returns Centre.",
  },
];

const faqs = [
  {
    question: "What does purchase protection cover?",
    answer: "It helps with eligible payment issues, refund questions, item concerns, and return support after you place an order.",
  },
  {
    question: "Which payment methods can I use?",
    answer: "You can choose from Card, UPI, or Cash on Delivery during checkout, based on the options shown for your order.",
  },
  {
    question: "How do I get refund help?",
    answer: "Open the Returns Centre or email support with your order ID, payment method, and issue details.",
  },
  {
    question: "Can support help with failed payments?",
    answer: "Yes. Share the order details and payment method so the support team can guide you through the next step.",
  },
];

function PaymentHelp() {
  return (
    <section className="support-page page-section">
      <div className="support-hero payment-help-hero">
        <div>
          <span>Style Store payments</span>
          <h1>100% Purchase Protection</h1>
          <p>Shop confidently with Style Store. We help protect your payments, support eligible refunds and returns, and keep every order experience simple, secure, and transparent.</p>
        </div>
        <Link className="support-hero-action" to="/checkout">Go to checkout</Link>
      </div>

      <div className="support-card-grid">
        {protectionCards.map((card) => (
          <article className="support-card" key={card.title}>
            <span className="support-card-mark">{card.label}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <div className="support-two-column">
        <section className="support-panel">
          <div className="support-section-heading">
            <span>Refund and payment support</span>
            <h2>We are here after checkout too</h2>
          </div>
          <p>For refund status, failed payment questions, duplicate charges, or payment method help, contact support with your order ID and the email used at checkout.</p>
          <div className="support-link-row">
            <Link className="primary-link" to="/orders">View orders</Link>
            <Link className="secondary-link" to="/returns">Returns Centre</Link>
          </div>
        </section>

        <aside className="support-panel contact-panel">
          <div className="support-section-heading">
            <span>Contact support</span>
            <h2>Payment help emails</h2>
          </div>
          <div className="support-email-list">
            {supportEmails.map((email) => (
              <a href={`mailto:${email}`} key={email}>{email}</a>
            ))}
          </div>
        </aside>
      </div>

      <section className="support-panel">
        <div className="support-section-heading">
          <span>FAQ</span>
          <h2>Common payment questions</h2>
        </div>
        <div className="support-faq-grid">
          {faqs.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default PaymentHelp;
