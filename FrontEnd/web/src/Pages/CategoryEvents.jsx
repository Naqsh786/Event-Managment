import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventsByCategory, selectCategoryEvents, selectEventLoading } from "../Features/EventSlice";
import { API_BASE_URL } from "../utils/apiConfig";
import "./CategoryEvents.css";

export default function CategoryEvents() {
    const { categoryId } = useParams();
    const dispatch = useDispatch();
    const events = useSelector(selectCategoryEvents);
    const loading = useSelector(selectEventLoading);

    // Fetch events when categoryId changes
    useEffect(() => {
        if (categoryId) {
            dispatch(fetchEventsByCategory(categoryId));
        }
    }, [dispatch, categoryId]);

    if (loading) {
        return (
            <div className="event-loading">
                <div className="premium-spinner"></div>
                <p>Curating majestic events...</p>
            </div>
        );
    }

    return (
        <div className="category-events-container">
            <header className="events-hero">
                <h1>Majestic Collections</h1>
                <p>Discover our exclusive packages tailored for you.</p>
                <div className="hero-divider"></div>
            </header>

            <div className="events-grid">
                {events && events.length > 0 ? (
                    events.map((event) => (
                        <div key={event._id} className="event-card">
                            <div className="event-image-wrapper">
                                <img
                                    src={event.image.startsWith('http') ? event.image : `${API_BASE_URL}/${event.image}`}
                                    alt={event.name}
                                    onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"; // Luxury placeholder
                                    }}
                                />
                                <div className="event-overlay">
                                    <span className="capacity-badge">{event.people} Guests</span>
                                    <span className="place-badge">{event.place}</span>
                                </div>
                            </div>
                            <div className="event-details">
                                <span className="majestic-tag">✨ Majestic</span>
                                <h3>{event.name}</h3>
                                <p>{event.description}</p>
                                <Link to={`/event/${event._id}`}>
                                    <button className="book-btn">View Details</button>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-events">
                        <h3>No events found for this category.</h3>
                        <p>Our curators are adding new experiences soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
