import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSlides, selectAllSlides } from "../Features/Slideslice";
import { Link } from "react-router-dom";
import "../Pages/Home.css";

const stats = [
  { number: "1000+", label: "Events Orchestrated", icon: "✨" },
  { number: "500+", label: "Luxury Weddings", icon: "💍" },
  { number: "250+", label: "Corporate Galas", icon: "🏢" },
  { number: "20+", label: "Years of Excellence", icon: "🏆" },
];

const features = [
  {
    title: "Bespoke Planning",
    desc: "Every event is tailored to your unique vision with meticulous attention to detail.",
    icon: "📜",
    gradient: "from-gold-500 to-yellow-600",
  },
  {
    title: "Premier Venues",
    desc: "Exclusive access to the world's most breathtaking and prestigious locations.",
    icon: "🏰",
    gradient: "from-amber-600 to-gold-400",
  },
  {
    title: "Master Concierge",
    desc: "Dedicated personal planning assistant throughout your entire journey.",
    icon: "🎩",
    gradient: "from-yellow-700 to-amber-500",
  },
  {
    title: "Majestic Catering",
    desc: "Exquisite culinary experiences crafted by world-class Michelin-star chefs.",
    icon: "🍽️",
    gradient: "from-gold-600 to-yellow-400",
  },
  {
    title: "State-of-the-Art AV",
    desc: "Immersive audio and visual technology to create unforgettable atmospheres.",
    icon: "🔊",
    gradient: "from-amber-500 to-gold-700",
  },
];

const services = [
  {
    title: "The Grand Barat",
    desc: "A majestic procession and royal welcome for the groom's family.",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
    icon: "🥁",

  },
  {
    title: "Vibrant Mehndi",
    desc: "A colorful night of music, dance, and intricate henna artistry.",
    img: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=500&q=80",
    icon: "🌿",

  },
  {
    title: "Elegant Valima",
    desc: "A sophisticated reception to celebrate the new union with grace.",
    img: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&q=80",
    icon: "🕯️",

  },
  {
    title: "Royal Nikah",
    desc: "The sacred ceremony performed with traditional sanctity and beauty.",
    img: "https://images.unsplash.com/photo-1714321624458-c6f56b602b80?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: "📜",

  },
  {
    title: "Engagement Soirée",
    desc: "Celebrate the first step towards a lifelong journey together.",
    img: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&q=80",
    icon: "💍",

  },
  {
    title: "Milestone Birthdays",
    desc: "Grand celebrations for your special life achievements.",
    img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&q=80",
    icon: "🎂",

  },
];

const testimonials = [
  {
    name: "Zainab Malik",
    role: "Bride",
    text: "Majestic Events made my dream wedding a reality. The attention to detail in the Mehndi decor was breathtaking.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=1",
    company: "Lahore Gala",
  },
  {
    name: "Hamza Ahmed",
    role: "Groom",
    text: "The Valima reception was handled with absolute grace. Our guests were wowed by the royal catering.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=2",
    company: "Karachi Soirée",
  },
  {
    name: "Ayesha Khan",
    role: "Corporate Lead",
    text: "Even for our annual gala, Majestic Events delivered a premium experience that perfectly aligned with our brand.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=3",
    company: "Global Indus",
  },
  {
    name: "Omer Sheikh",
    role: "Father of the Bride",
    text: "Professionalism and elegance combined. They took all the stress away and let us enjoy the festivities.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=4",
    company: "Sheikh Foundations",
  },
];

const technologies = [
  { name: "Floral Design", icon: "🌸" },
  { name: "Royal Catering", icon: "👨‍🍳" },
  { name: "Stage Craft", icon: "🏛️" },
  { name: "Audio-Visuals", icon: "🎶" },
  { name: "Guest Mgmt", icon: "📋" },
  { name: "Luxury Decor", icon: "✨" },
  { name: "Photography", icon: "📸" },
  { name: "Couture Design", icon: "👗" },
];

const process = [
  {
    step: "01",
    title: "Consulation",
    desc: "We dive deep into your cultural traditions and personal vision to craft a unique concept.",
    icon: "🤝",
  },
  {
    step: "02",
    title: "Planning",
    desc: "Our master planners meticulously map out every vendor, timeline, and artistic detail.",
    icon: "📑",
  },
  {
    step: "03",
    title: "Curation",
    desc: "We hand-select the finest florals, venues, and cuisines to match your royal standards.",
    icon: "✨",
  },
  {
    step: "04",
    title: "Execution",
    desc: "Witness your legacy unfold as we orchestrate a flawless, magical celebration.",
    icon: "🎉",
  },
];

const portfolio = [
  {
    title: "Emerald Coast Wedding",
    category: "Wedding",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    tags: ["Outdoor", "Floral", "Coastal"],
  },
  {
    title: "The Zenith Tech Gala",
    category: "Corporate",
    img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80",
    tags: ["Minimalist", "Tech", "Networking"],
  },
  {
    title: "Midnight Masquerade",
    category: "Private Event",
    img: "https://images.unsplash.com/photo-1496333039118-211162f4ec9a?auto=format&fit=crop&w=800&q=80",
    tags: ["Themed", "Lighting", "Artistic"],
  },
  {
    title: "Global Leadership Summit",
    category: "Summit",
    img: "https://images.unsplash.com/photo-1540575861501-7c911a28a042?auto=format&fit=crop&w=800&q=80",
    tags: ["Professional", "Conference", "VIP"],
  },
];

// Memoized Sub-components for better performance
const StatCard = React.memo(({ stat }) => (
  <div className="stat-card">
    <div className="stat-icon">{stat.icon}</div>
    <div className="stat-number">{stat.number}</div>
    <div className="stat-label">{stat.label}</div>
    <div className="stat-bar"></div>
  </div>
));

const FeatureCard = React.memo(({ feature }) => (
  <div className="feature-card">
    <div className="feature-icon-wrapper">
      <div className="feature-icon">{feature.icon}</div>
    </div>
    <h3>{feature.title}</h3>
    <p>{feature.desc}</p>
    <div className="feature-arrow">→</div>
  </div>
));

const ServiceCard = React.memo(({ service }) => (
  <div className="service-card">
    <div className="service-image-wrapper">
      <img
        src={service.img}
        alt={service.title}
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500&q=80";
        }}
      />
      <div className="service-icon-float">{service.icon}</div>
      <div className="service-overlay">
        <Link to="/services" className="service-btn">
          Explore Service →
        </Link>
      </div>
    </div>
    <div className="service-content">
      <h3>{service.title}</h3>
      <p>{service.desc}</p>
    </div>
  </div>
));

const TechCard = React.memo(({ tech }) => (
  <div className="tech-card">
    <div className="tech-icon">{tech.icon}</div>
    <span>{tech.name}</span>
  </div>
));

const PortfolioCard = React.memo(({ project }) => (
  <div className="portfolio-card">
    <div className="portfolio-image">
      <img
        src={project.img}
        alt={project.title}
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80";
        }}
      />
      <div className="portfolio-overlay">
        <button className="portfolio-btn">View Project</button>
      </div>
    </div>
    <div className="portfolio-info">
      <span className="portfolio-category">{project.category}</span>
      <h3>{project.title}</h3>
      <div className="portfolio-tags">
        {project.tags.map((tag, i) => (
          <span key={i} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  </div>
));

const TestimonialCard = React.memo(({ testimonial }) => (
  <div className="testimonial-card">
    <div className="quote-icon">"</div>
    <div className="testimonial-stars">
      {[...Array(testimonial.rating)].map((_, i) => (
        <span key={i}>⭐</span>
      ))}
    </div>
    <p className="testimonial-text">{testimonial.text}</p>
    <div className="testimonial-author">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        loading="lazy"
        onError={(e) => {
          e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
        }}
      />
      <div className="author-info">
        <h4>{testimonial.name}</h4>
        <p>{testimonial.role}</p>
        <span className="company">{testimonial.company}</span>
      </div>
    </div>
  </div>
));

export default React.memo(function Home() {
  const dispatch = useDispatch();
  const slides = useSelector(selectAllSlides);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    dispatch(fetchSlides());

    const bc = new BroadcastChannel('slide_updates');
    bc.onmessage = (event) => {
      if (event.data === 'REFRESH_SLIDES') {
        dispatch(fetchSlides());
      }
    };

    return () => bc.close();
  }, [dispatch]);

  useEffect(() => {
    if (slides && slides.length > 1) {
      const interval = setInterval(() => {
        setTransitionEnabled(true);
        setCurrentIdx((prev) => prev + 1);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  // Handle seamless snap-back
  useEffect(() => {
    if (slides.length > 0 && currentIdx === slides.length) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIdx(0);
      }, 1200); // This duration matches the CSS transition time
      return () => clearTimeout(timer);
    }
  }, [currentIdx, slides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      {/* Hero Slider */}
      <section className="hero-slider-wrapper">
        <div className="hero-particles"></div>
        <div className="hero-gradient-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div
          className="hero-slider-inner"
          style={{
            transform: `translate3d(-${currentIdx * 100}%, 0, 0)`,
            transition: transitionEnabled ? 'transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)' : 'none'
          }}
        >
          {slides?.length > 0 ? (
            <>
              {(slides || []).map((slide, idx) => (
                <div
                  key={slide._id}
                  className={`hero-slide-item ${idx === currentIdx ? 'active' : ''}`}
                >
                  <div
                    className="hero-slide-bg"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(5, 5, 5, 0.6), rgba(20, 20, 20, 0.4)), url(${slide.image})`
                    }}
                  ></div>
                  <div className="hero-content">
                    <div className="hero-badge">✨ Welcome to Excellence</div>
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-subtitle">{slide.description}</p>
                    <div className="hero-buttons">
                      <Link to="/register" className="hero-btn primary">
                        <span>Get Started</span>
                        <span className="btn-arrow">→</span>
                      </Link>
                      <Link to="/about" className="hero-btn secondary">
                        <span>Learn More</span>
                        <span className="btn-play">▶</span>
                      </Link>
                    </div>
                    <div className="hero-stats-mini">
                      <div className="mini-stat">
                        <strong>500+</strong>
                        <span>Projects</span>
                      </div>
                      <div className="mini-stat">
                        <strong>250+</strong>
                        <span>Clients</span>
                      </div>
                      <div className="mini-stat">
                        <strong>15+</strong>
                        <span>Years</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* Clone of the first slide for seamless loop */}
              {slides?.length > 0 && (
                <div
                  key="clone"
                  className={`hero-slide-item ${currentIdx === slides.length ? 'active' : ''}`}
                >
                  <div
                    className="hero-slide-bg"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(5, 5, 5, 0.6), rgba(20, 20, 20, 0.4)), url(${slides[0].image})`
                    }}
                  ></div>
                  <div className="hero-content">
                    <div className="hero-badge">✨ Welcome to Excellence</div>
                    <h1 className="hero-title">{slides[0].title}</h1>
                    <p className="hero-subtitle">{slides[0].description}</p>
                    <div className="hero-buttons">
                      <Link to="/register" className="hero-btn primary">
                        <span>Get Started</span>
                        <span className="btn-arrow">→</span>
                      </Link>
                      <button className="hero-btn secondary">
                        <span>Learn More</span>
                        <span className="btn-play">▶</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="hero-slide-item default-hero active">
              <div className="hero-slide-bg default-bg"></div>
              <div className="hero-content">
                <div className="hero-badge">✨ Majestic Events</div>
                <h1 className="hero-title">Crafting Your Perfect Legacy</h1>
                <p className="hero-subtitle">Bespoke management for Barat, Mehndi, Valima & more</p>
                <div className="hero-buttons">
                  <Link to="/register" className="hero-btn primary">
                    <span>Inquire Now</span>
                    <span className="btn-arrow">→</span>
                  </Link>
                  <Link to="/about" className="hero-btn secondary">
                    <span>Our Gallery</span>
                    <span className="btn-play">▶</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {
          slides?.length > 1 && (
            <div className="slide-indicators">
              {(slides || []).map((_, idx) => (
                <span
                  key={idx}
                  className={`indicator ${idx === (currentIdx % (slides?.length || 1)) ? 'active' : ''}`}
                  onClick={() => {
                    setTransitionEnabled(true);
                    setCurrentIdx(idx);
                  }}
                ></span>
              ))}
            </div>
          )
        }

        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <p>Scroll to explore</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-badge">Why Choose Us</span>
          <h2 className="section-title">Powerful Features for Your Success</h2>
          <p className="section-subtitle">Discover what makes us stand out from the competition</p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} />
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <span className="section-badge">Our Services</span>
          <h2 className="section-title">Comprehensive Digital Solutions</h2>
          <p className="section-subtitle">End-to-end services for all your digital needs</p>
        </div>
        <div className="services-grid">
          {services.map((service, idx) => (
            <ServiceCard key={idx} service={service} />
          ))}
        </div>
        <div className="services-cta">
          <Link to="/services" className="view-all-btn">
            View All Services
            <span className="btn-shine"></span>
          </Link>
        </div>
      </section>

      {/* Process Section */}
      <section className="process-section">
        <div className="section-header">
          <span className="section-badge">Our Process</span>
          <h2 className="section-title">How We Work</h2>
          <p className="section-subtitle">A proven methodology for delivering excellence</p>
        </div>
        <div className="process-timeline">
          {process.map((item, idx) => (
            <div className="process-item" key={idx}>
              <div className="process-number">{item.step}</div>
              <div className="process-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              {idx < process.length - 1 && <div className="process-connector"></div>}
            </div>
          ))}
        </div>
      </section>

      {/* Technologies Section */}
      <section className="tech-section">
        <div className="section-header">
          <span className="section-badge">Majestic Planning</span>
          <h2 className="section-title">Royal Event Essentials</h2>
          <p className="section-subtitle">We curate with the finest elements and artistic vision</p>
        </div>
        <div className="tech-grid">
          {technologies.map((tech, idx) => (
            <TechCard key={idx} tech={tech} />
          ))}
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="portfolio-section">
        <div className="section-header">
          <span className="section-badge">Portfolio</span>
          <h2 className="section-title">Our Recent Work</h2>
          <p className="section-subtitle">Showcasing our best projects and success stories</p>
        </div>
        <div className="portfolio-grid">
          {portfolio.map((project, idx) => (
            <PortfolioCard key={idx} project={project} />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-badge">Testimonials</span>
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">Don't just take our word for it</p>
        </div>
        <div className="testimonials-slider">
          <div
            className="testimonials-track"
            style={{ transform: `translateX(-${testimonialIdx * 100}%)` }}
          >
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </div>
        </div>
        <div className="testimonial-dots">
          {testimonials.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === testimonialIdx ? 'active' : ''}`}
              onClick={() => setTestimonialIdx(idx)}
            ></span>
          ))}
        </div>
      </section>

      {/* Newsletter Section Removed */}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-icon">🚀</div>
          <h2>Ready to Start Your Project?</h2>
          <p>Let's work together to bring your vision to life</p>
          <div className="cta-buttons">
            <Link to="/contact" className="cta-btn primary">
              <span>Get in Touch</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/category" className="cta-btn secondary">
              <span>View Catalog</span>
              <span className="btn-icon">📁</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
});
