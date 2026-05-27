import { Link } from "react-router-dom";

const contactEmails = ["monikachebrolu1@gmail.com", "deepthiupadhyayula@gmail.com"];

const experienceCards = [
  {
    label: "SHOP",
    title: "Our shopping experience",
    text: "Style Store brings fashion, essentials, and lifestyle finds into a clean shopping flow with clear product details, useful categories, and quick cart actions.",
  },
  {
    label: "PAY",
    title: "Secure checkout and trusted payments",
    text: "Checkout is built around clarity, trusted payment choices, and purchase support so customers can complete orders with confidence.",
  },
  {
    label: "FAST",
    title: "Fast delivery and customer support",
    text: "We help customers understand delivery costs, order progress, returns, refunds, and support options from one connected store experience.",
  },
];

const categoryBadges = ["Fashion", "Footwear", "Accessories", "Beauty", "Lifestyle", "Daily essentials"];

function About() {
  return (
    <section className="about-page page-section">
      <div className="about-hero">
        <div>
          <span>About Style Store</span>
          <h1>Style Store</h1>
          <p>
            A modern online store built to make everyday shopping simple, secure, and enjoyable,
            from product discovery to checkout, delivery, and support.
          </p>
          <div className="about-hero-actions">
            <Link className="support-hero-action" to="/products">Shop products</Link>
            <Link className="about-outline-action" to="/contact">Contact support</Link>
          </div>
        </div>
        <aside className="about-hero-card" aria-label="Style Store highlights">
          <strong>Trusted shopping</strong>
          <span>Secure payments</span>
          <span>Fast delivery help</span>
          <span>Returns and refunds support</span>
        </aside>
      </div>

      <section className="about-panel about-intro">
        <div className="support-section-heading">
          <span>Who we are</span>
          <h2>Customer-first commerce with a Style Store touch</h2>
        </div>
        <p>
          Style Store is designed for shoppers who want a dependable place to browse products,
          compare categories, save items to a basket, and complete secure checkout without confusion.
          Our goal is to keep the store polished, practical, and supportive at every step.
        </p>
      </section>

      <div className="about-card-grid">
        {experienceCards.map((card) => (
          <article className="about-card" key={card.title}>
            <span className="support-card-mark">{card.label}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <div className="about-two-column">
        <section className="about-panel">
          <div className="support-section-heading">
            <span>Product categories we support</span>
            <h2>Built for discovery across everyday needs</h2>
          </div>
          <p>
            Customers can explore a growing catalogue across fashion and lifestyle categories,
            with organized browsing paths that make it easier to find the right item quickly.
          </p>
          <div className="about-badge-list">
            {categoryBadges.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
        </section>

        <aside className="about-panel about-mission">
          <div className="support-section-heading">
            <span>Mission and vision</span>
            <h2>Make online shopping feel clear, safe, and personal</h2>
          </div>
          <p>
            Our mission is to combine a trustworthy checkout, helpful support, and a refined store
            experience so customers can shop with less friction and more confidence.
          </p>
        </aside>
      </div>

      <section className="about-panel about-contact-strip">
        <div>
          <div className="support-section-heading">
            <span>Contact Style Store</span>
            <h2>We are here to help</h2>
          </div>
          <p>For store questions, order help, payment support, or return guidance, contact our support team.</p>
        </div>
        <div className="support-email-list">
          {contactEmails.map((email) => (
            <a href={`mailto:${email}`} key={email}>{email}</a>
          ))}
        </div>
      </section>
    </section>
  );
}

export default About;
