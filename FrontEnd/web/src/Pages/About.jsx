import React from "react";
import "../Pages/About.css";

export default function About() {
  return (
    <div className="about-page-wrapper">
      <div className="about-hero">
        <span className="about-badge">Legacy of Excellence</span>
        <h1 className="about-title">About <span>Majestic Events</span></h1>
        <p className="about-subtitle">
          Orchestrating Pakistan's most prestigious celebrations with unmatched elegance since 2012.
        </p>
      </div>

      <div className="about-container">
        <div className="about-content">
          <div className="about-text">
            <p>
              Welcome to <strong>Majestic Events</strong>, where your dreams of a majestic celebration become a reality.
              We are dedicated to providing you the absolute best in event management, specializing in grand Barat, vibrant Mehndi,
              and sophisticated Valima ceremonies with an emphasis on royalty, creativity, and flawless execution.
            </p>
            <p>
              Founded with a passion for traditional sanctity and modern luxury, <strong>Majestic Events</strong> has redefined
              the art of hosting. We don't just plan events; we craft legacies. From intricate stage designs to world-class
              catering, every detail is meticulously managed by our majestic team.
            </p>
            <p>
              We believe that every celebration deserves a royal touch. Our team of master planners and visionary designers
              work tirelessly to ensure that your special moments are nothing short of legendary.
            </p>

            <div className="about-highlights">
              <div className="about-highlight-card">
                <span className="highlight-number">1200+</span>
                <span className="highlight-label">Events Orchestrated</span>
              </div>
              <div className="about-highlight-card">
                <span className="highlight-number">500+</span>
                <span className="highlight-label">Grand Weddings</span>
              </div>
              <div className="about-highlight-card">
                <span className="highlight-number">12+</span>
                <span className="highlight-label">Years of Mastery</span>
              </div>
            </div>
          </div>
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80"
              alt="Majestic Events Gala"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
