import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../Pages/Services.css";

const services = [
  {
    title: "The Grand Barat",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    desc: "A majestic procession and royal welcome for the groom's family.",
    icon: "🥁",
    features: [
      "Royal Horse/Car Decor",
      "Procession Management",
      "Traditional Drumming Group",
      "Grand Reception Entrance",
      "Security & Valet Detail",
      "Professional Photography"
    ],
    technologies: ["Royal Decor", "Procession", "Reception"],
    pricing: "Starting from $5,000"
  },
  {
    title: "Vibrant Mehndi",
    img: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=800&q=80",
    desc: "A colorful night of music, dance, and intricate henna artistry.",
    icon: "🌿",
    features: [
      "Themed Floral Setup",
      "Intricate Henna Artists",
      "Dance Floor & Sound System",
      "Traditional Seating",
      "Colorful Backdrop Design",
      "Live Folk Music"
    ],
    technologies: ["Floral Design", "Music", "Henna"],
    pricing: "Starting from $3,500"
  },
  {
    title: "Elegant Valima",
    img: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
    desc: "A sophisticated reception to celebrate the new union with grace.",
    icon: "🕯️",
    features: [
      "Sophisticated Stage Design",
      "Fine Dining Catering",
      "Floral Centerpieces",
      "Professional Emcee",
      "Ambient Lighting Control",
      "Guest Seating Management"
    ],
    technologies: ["Catering", "Stage Design", "Lighting"],
    pricing: "Starting from $6,000"
  },
  {
    title: "Royal Nikah",
    img: "https://images.unsplash.com/photo-1714321624458-c6f56b602b80?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    desc: "The sacred ceremony performed with traditional sanctity and beauty.",
    icon: "📜",
    features: [
      "Traditional Backdrop",
      "Floral Separation Curtain",
      "Religious Officiant Setup",
      "Intimate Seating Plan",
      "Photography & Videography",
      "Sacred Ceremony Coordination"
    ],
    technologies: ["Sanctity", "Traditional Decor", "Coordination"],
    pricing: "Starting from $2,500"
  },
  {
    title: "Engagement Soirée",
    img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80",
    desc: "Celebrate the first step towards a lifelong journey together.",
    icon: "💍",
    features: [
      "Ring Exchange Setup",
      "Designer Decor",
      "Signature Mocktails",
      "Boutique Catering",
      "E-Invitation Design",
      "Guest Concierge"
    ],
    technologies: ["Ring Ceremony", "Designer Decor", "Consultancy"],
    pricing: "Starting from $3,000"
  },
  {
    title: "Milestone Birthdays",
    img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
    desc: "Grand celebrations for your special life achievements.",
    icon: "🎂",
    features: [
      "Themed Party Design",
      "Interactive Entertainment",
      "Custom Dessert Stations",
      "Balloon Art Sculptures",
      "Live DJ & Sound System",
      "Photo Booth Hire"
    ],
    technologies: ["Themes", "Dessert Bars", "Entertainment"],
    pricing: "Starting from $2,000"
  }
];

const process = [
  {
    step: "01",
    title: "Concept",
    desc: "We define the theme and vision for your celebration",
    icon: "✨"
  },
  {
    step: "02",
    title: "Curation",
    desc: "Selecting the perfect vendors and artistic elements",
    icon: "📜"
  },
  {
    step: "03",
    title: "Coordination",
    desc: "Flawless management of every moving part",
    icon: "🏛️"
  },
  {
    step: "04",
    title: "Celebration",
    desc: "Witness your dream come to life perfectly",
    icon: "🎉"
  }
];

const faqs = [
  {
    question: "How far in advance should I book?",
    answer: "For grand weddings and Barat, we recommend booking 6-12 months in advance. However, we can often accommodate shorter timelines depending on date availability."
  },
  {
    question: "Do you offer partial event planning?",
    answer: "While we specialize in full-service management, we do offer boutique packages for specific elements like decor curation or day-of coordination."
  },
  {
    question: "What regions do you serve?",
    answer: "We primarily serve Karachi, Lahore, and Islamabad, but our majestic team is available for destination weddings nationwide and overseas."
  },
  {
    question: "Can you handle guest management?",
    answer: "Yes, our concierge service handles everything from digital RSVPs and seating plans to guest transport and hotel hospitality."
  },
  {
    question: "What is the standard of quality?",
    answer: "We partner only with elite caterers, floral artists, and craftsmen who meet our rigorous standards for excellence and cultural integrity."
  }
];

export default React.memo(function Services() {
  const [selectedService, setSelectedService] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="hero-gradient-bg"></div>
        <div className="services-hero-content">
          <span className="hero-badge">✨ Our Services</span>
          <h1 className="services-hero-title">Artistry in Every Detail</h1>
          <p className="services-hero-subtitle">
            From concept to celebration, we deliver majesty in every orchestrated event
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>1200+</strong>
              <span>Weddings Planned</span>
            </div>
            <div className="hero-stat">
              <strong>100%</strong>
              <span>Royal Approvals</span>
            </div>
            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Concierge Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-main">
        <div className="services-container">
          <div className="services-grid">
            {services.map((service, idx) => (
              <div
                className={`service-card ${selectedService === idx ? 'expanded' : ''}`}
                key={idx}
                onClick={() => setSelectedService(selectedService === idx ? null : idx)}
              >
                <div className="service-card-header">
                  <div className="service-image-wrapper">
                    <img
                      src={service.img}
                      alt={service.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80";
                      }}
                    />
                    <div className="service-icon-badge">{service.icon}</div>
                  </div>
                </div>

                <div className="service-card-body">
                  <h3>{service.title}</h3>
                  <p className="service-desc">{service.desc}</p>

                  <div className={`service-details-wrapper ${selectedService === idx ? 'open' : ''}`}>
                    <div className="service-details">
                      <div className="service-features">
                        <h4>What's Included:</h4>
                        <ul>
                          {service.features.map((feature, i) => (
                            <li key={i}>
                              <span className="check-icon">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="service-technologies">
                        <h4>Event Essentials:</h4>
                        <div className="tech-tags">
                          {service.technologies.map((tech, i) => (
                            <span key={i} className="tech-tag">{tech}</span>
                          ))}
                        </div>
                      </div>

                      <div className="service-pricing">
                        <span className="pricing-label">Investment</span>
                        <span className="pricing-value">{service.pricing}</span>
                      </div>

                      <Link to="/contact" className="service-cta-btn">
                        Get Started →
                      </Link>
                    </div>
                  </div>

                  <button className="expand-btn">
                    {selectedService === idx ? 'Show Less ↑' : 'Learn More ↓'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-separator"></div>

      {/* Process Section */}
      <section className="services-process">
        <div className="section-header">
          <span className="section-badge">Our Process</span>
          <h2 className="section-title">How We Work</h2>
          <p className="section-subtitle">A streamlined approach to deliver exceptional results</p>
        </div>

        <div className="process-grid">
          {process.map((item, idx) => (
            <div className="process-card" key={idx}>
              <div className="process-number">{item.step}</div>
              <div className="process-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <div className="section-header">
          <span className="section-badge">Why Choose Us</span>
          <h2 className="section-title">What Sets Us Apart</h2>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">✨</div>
            <h3>Swift Orchestration</h3>
            <p>Precise planning and flawless execution on your timeline</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">👑</div>
            <h3>Royal Standard</h3>
            <p>Unmatched elegance and attention to every regal detail</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🕯️</div>
            <h3>Bespoke Artistry</h3>
            <p>Custom tailored experiences designed around your vision</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎟️</div>
            <h3>Elite Access</h3>
            <p>Connections with the most prestigious venues and vendors</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="services-faq">
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Everything you need to know about our services</p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, idx) => (
            <div
              className={`faq-item ${openFaq === idx ? 'open' : ''}`}
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-toggle">{openFaq === idx ? '−' : '+'}</span>
              </div>
              <div className="faq-answer-wrapper">
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-separator"></div>

      {/* CTA Section */}
      <section className="services-cta">
        <div className="cta-content">
          <div className="cta-icon">👑</div>
          <h2>Ready to Plan Your Majestic Event?</h2>
          <p>Let's discuss how we can bring your royal vision to life</p>
          <div className="cta-buttons">
            <Link to="/contact" className="cta-btn primary">
              Start Planning Now →
            </Link>
          </div>
          <p className="cta-note">✨ Consultation • 📞 24/7 Concierge Service • 👑 Royal Excellence</p>
        </div>
      </section>
    </div>
  );
});
