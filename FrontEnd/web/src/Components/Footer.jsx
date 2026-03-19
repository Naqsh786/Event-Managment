import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* BRAND / ABOUT */}
        <div className="footer-left footer-section">
          <h3 className="footer-logo">Majestic Events</h3>
          <p className="footer-tagline">
            Crafting legendary celebrations with unmatched elegance and meticulous planning.
          </p>
          <div className="footer-social">
            <span className="social-badge">FB</span>
            <span className="social-badge">IG</span>
            <span className="social-badge">LN</span>
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-center footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/about'>About</Link></li>
            <li><Link to='/services'>Services</Link></li>
            <li><Link to='/contact'>Contact</Link></li>
          </ul>
        </div>

        {/* CONTACT / INFO */}
        <div className="footer-right footer-section">
          <h3>Contact</h3>
          <p>Naqsh – Event Planner</p>
          <p>Phone: <a href="tel:+92321458796">+92 321 458796</a></p>
          <p>Email: <a href="mailto:events@royal.com">events@royal.com</a></p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Majestic Events. All rights reserved.</span>
        <span className="footer-bottom-links">
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
        </span>
      </div>
    </footer>
  );
}
