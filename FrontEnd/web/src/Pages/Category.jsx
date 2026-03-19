import React from "react";
import { useSelector } from "react-redux";
import { selectAllCategories, selectCategoryLoading } from "../Features/Categoryslice";
import { Link } from "react-router-dom";
import "./Category.css";

export default function Category() {

    const categories = useSelector(selectAllCategories);
    const loading = useSelector(selectCategoryLoading);

    // Sorting Logic is removed as per user request to remove controls
    // Using natural order from backend

    return (
        <div className="category-page-container">
            <header className="category-hero">
                <span className="premium-badge">Exclusive Collections</span>
                <h1 className="hero-title">Majestic <span>Event</span> Catalog</h1>
                <p className="hero-subtitle">Meticulously curated themes for all your majestic celebrations.</p>
                <div className="hero-divider"></div>
            </header>

            {loading ? (
                <div className="loading-container">
                    <div className="premium-spinner"></div>
                    <p>Orchestrating your experience...</p>
                </div>
            ) : (
                <div className="category-grid-premium">
                    {categories.length === 0 ? (
                        <div className="empty-catalog">
                            <h3>No matches found in our royal archives</h3>
                            <p>We are curating new experiences.</p>
                        </div>
                    ) : (
                        categories.map((cat) => (
                            <Link key={cat._id} to={`/category/${cat._id}`} className="cat-card-premium text-only-card" style={{ textDecoration: 'none' }}>
                                <div className="cat-card-inner">
                                    <div className="cat-content-box">
                                        <h3>{cat.name}</h3>
                                        <div className="cat-card-footer">
                                            <button className="premium-explore-btn">
                                                Explore
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                                    <polyline points="7 7 17 7 17 17"></polyline>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
