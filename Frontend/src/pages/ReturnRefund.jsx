import { Link } from "react-router-dom";

const supportEmails = ["monikachebrolu1@gmail.com", "deepthiupadhyayula@gmail.com", "deepthi@gmail.com"];

const faqItems = [
  {
    question: "How do I return an item?",
    answer: "Open your orders, choose the item you want to return, and follow the return instructions. Keep the product unused and in its original packaging where possible.",
  },
  {
    question: "Which items are eligible for return?",
    answer: "Most fashion, accessories, and lifestyle products can be returned within the eligible return window shown on the product or order page.",
  },
  {
    question: "When will I receive my refund?",
    answer: "Refunds are started after pickup and quality check. The final credit time depends on your payment method and bank processing time.",
  },
  {
    question: "Can I return a gift?",
    answer: "Yes. Use the gift returns search below with the order ID or tracking details, then contact support if you need help locating the order.",
  },
];

const refundRows = [
  { method: "UPI", time: "2 to 4 business days", note: "Credited to the original UPI account." },
  { method: "Card", time: "5 to 7 business days", note: "Bank timelines may vary after refund approval." },
  { method: "Cash on Delivery", time: "3 to 5 business days", note: "Refunded after support confirms payout details." },
  { method: "Store credit", time: "Within 24 hours", note: "Available for eligible quick refunds." },
];

function ReturnRefund() {
  const searchGiftReturn = (event) => {
    event.preventDefault();
  };

  return (
    <section className="returns-page page-section">
      <div className="returns-hero">
        <div>
          <span>Style Store Support</span>
          <h1>Return & Refund Centre</h1>
          <p>Start a return, manage an existing request, or check how long your refund will take.</p>
        </div>
        <Link className="returns-hero-action" to="/orders">View your orders</Link>
      </div>

      <div className="returns-action-grid">
        <article className="returns-action-card">
          <span className="returns-icon">RET</span>
          <h2>Return Items You Ordered</h2>
          <p>Select an order, choose the item, and tell us why you want to return it.</p>
          <Link className="primary-link" to="/orders">Start a return</Link>
        </article>

        <article className="returns-action-card">
          <span className="returns-icon">MNG</span>
          <h2>Manage Returns</h2>
          <p>Track pickup status, print return labels, or review refund progress for active returns.</p>
          <Link className="secondary-link" to="/orders">Manage requests</Link>
        </article>

        <article className="returns-action-card gift-return-card">
          <span className="returns-icon">GFT</span>
          <h2>Gift Returns</h2>
          <p>Enter an order ID or tracking number to find gift return options.</p>
          <form className="gift-search" onSubmit={searchGiftReturn}>
            <input aria-label="Gift order search" placeholder="Order ID or tracking number" />
            <button type="submit">Search</button>
          </form>
        </article>
      </div>

      <div className="returns-content-grid">
        <section className="returns-panel">
          <div className="returns-section-heading">
            <span>Frequently Asked Questions</span>
            <h2>Return help</h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="returns-panel contact-panel">
          <div className="returns-section-heading">
            <span>Contact Support</span>
            <h2>Need more help?</h2>
          </div>
          <p>Our support team can help with return eligibility, refund status, and gift return questions.</p>
          <div className="support-email-list">
            {supportEmails.map((email) => (
              <a key={email} href={`mailto:${email}`}>{email}</a>
            ))}
          </div>
        </aside>
      </div>

      <section className="returns-panel refund-table-panel">
        <div className="returns-section-heading">
          <span>Refund Time-frame</span>
          <h2>Expected refund timing</h2>
        </div>
        <div className="returns-table-wrap">
          <table className="refund-table">
            <thead>
              <tr>
                <th>Payment method</th>
                <th>Refund time-frame</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {refundRows.map((row) => (
                <tr key={row.method}>
                  <td>{row.method}</td>
                  <td>{row.time}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export default ReturnRefund;
