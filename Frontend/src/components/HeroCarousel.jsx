import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    eyebrow: "Big Summer Sale",
    title: "Up to 70% Off",
    text: "Fashion favorites, festive styles, and everyday essentials at fresh prices.",
    cta: "Shop fashion",
    to: "/category/Fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1800&q=80",
    accent: "#ffb703",
  },
  {
    eyebrow: "Limited Time Deals",
    title: "Electronics Offers",
    text: "Headphones, laptops, speakers, and smart devices with blockbuster savings.",
    cta: "Explore electronics",
    to: "/category/Electronics",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1800&q=80",
    accent: "#22c55e",
  },
  {
    eyebrow: "Fresh Daily",
    title: "Grocery Discounts",
    text: "Stock the pantry with fruits, snacks, staples, beverages, and more.",
    cta: "Shop grocery",
    to: "/category/Grocery",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80",
    accent: "#f97316",
  },
  {
    eyebrow: "Beauty Bonanza",
    title: "Glow Deals",
    text: "Skincare, makeup, fragrances, and wellness picks for less.",
    cta: "Shop beauty",
    to: "/category/Beauty",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1800&q=80",
    accent: "#ec4899",
  },
  {
    eyebrow: "Mobile Must Haves",
    title: "Accessories From Rs. 199",
    text: "Cases, chargers, earbuds, stands, and daily tech companions.",
    cta: "Shop accessories",
    to: "/products?q=accessories",
    image: "https://images.unsplash.com/photo-1604671368394-2240d0b1bb6c?auto=format&fit=crop&w=1800&q=80",
    accent: "#38bdf8",
  },
];

function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  const showSlide = (nextIndex) => {
    setActiveSlide((nextIndex + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero-carousel" aria-label="Featured offers">
      <div className="hero-carousel-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
        {slides.map((slide) => (
          <article
            className="hero-slide"
            key={slide.title}
            style={{ backgroundImage: `linear-gradient(90deg, rgba(6, 18, 38, .9), rgba(6, 18, 38, .42), rgba(6, 18, 38, .08)), url(${slide.image})` }}
          >
            <div className="hero-slide-copy">
              <span style={{ color: slide.accent }}>{slide.eyebrow}</span>
              <h1>{slide.title}</h1>
              <p>{slide.text}</p>
              <Link to={slide.to}>{slide.cta}</Link>
            </div>
          </article>
        ))}
      </div>

      <button className="hero-arrow hero-arrow-left" onClick={() => showSlide(activeSlide - 1)} type="button" aria-label="Previous banner">‹</button>
      <button className="hero-arrow hero-arrow-right" onClick={() => showSlide(activeSlide + 1)} type="button" aria-label="Next banner">›</button>

      <div className="hero-dots" aria-label="Banner navigation">
        {slides.map((slide, index) => (
          <button
            aria-label={`Show ${slide.title}`}
            className={index === activeSlide ? "active" : ""}
            key={slide.title}
            onClick={() => showSlide(index)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;
