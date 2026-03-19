import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent, selectEventLoading } from "../Features/EventSlice";
import { selectLoggedInUser } from "../Features/Userslice";
import axios from "axios";
import ReviewModal from "../Components/ReviewModal";
import { API_BASE_URL } from "../utils/apiConfig";
import "./EventDetail.css";

export default function EventDetail() {
    const { eventId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const event = useSelector(selectSelectedEvent);
    const loading = useSelector(selectEventLoading);
    const user = useSelector(selectLoggedInUser);

    const [reviews, setReviews] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [avgRating, setAvgRating] = useState({ averageRating: 0, totalReviews: 0 });

    const fetchReviews = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/review/all?target=event&eventId=${eventId}`);
            setReviews(res.data);

            const avgRes = await axios.get(`${API_BASE_URL}/review/avg/${eventId}`);
            setAvgRating(avgRes.data);
        } catch (err) {
            console.error("Error fetching reviews", err);
        }
    }, [eventId]);

    useEffect(() => {
        if (eventId) {
            dispatch(fetchEventById(eventId));
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchReviews();

            const bc = new BroadcastChannel("review_updates");
            bc.onmessage = (event) => {
                if (event.data === "REFRESH_REVIEWS") {
                    fetchReviews();
                }
            };
            return () => bc.close();
        }
    }, [dispatch, eventId, fetchReviews]);

    // Handle smooth scroll to reviews if needed
    const scrollToReviews = () => {
        document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
    };

    if (loading || (!event && eventId)) {
        return (
            <div className="event-loading-wrapper">
                <div className="luxury-spinner"></div>
                <p>Preparing your exclusive experience...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="event-error-screen">
                <h2>Experience Unavailable</h2>
                <button onClick={() => navigate(-1)} className="back-btn-gold">Return to Gallery</button>
            </div>
        );
    }

    const imageUrl = event?.image?.startsWith('http')
        ? event.image
        : (event?.image ? `${API_BASE_URL}/${event.image.replace(/\\/g, "/")}` : "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80");

    return (
        <div className="luxury-detail-container">
            {/* Immersive Hero */}
            <header className="premium-event-hero" style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : 'none' }}>
                <div className="hero-vignette"></div>
                <div className="hero-content-inner">
                    <div className="event-badge">Exclusive Experience</div>
                    <h1>{event.name}</h1>
                    <p className="hero-subtitle">{event.category?.name || "Special Event"}</p>

                    {avgRating.totalReviews > 0 && (
                        <div className="hero-rating" onClick={scrollToReviews} style={{ cursor: 'pointer' }}>
                            <div className="stars-gold">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={i < Math.round(avgRating.averageRating) ? "fas fa-star" : "far fa-star"}></i>
                                ))}
                            </div>
                            <span>({avgRating.totalReviews} Royal Reviews)</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Quick Info Bar */}
            <div className="quick-info-strip">
                <div className="info-strip-item">
                    <i className="fas fa-calendar-alt"></i>
                    <div>
                        <label>Date</label>
                        <p>{new Date(event.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="info-strip-item">
                    <i className="fas fa-users"></i>
                    <div>
                        <label>Capacity</label>
                        <p>{event.people} Guests</p>
                    </div>
                </div>
                <div className="info-strip-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                        <label>Venue</label>
                        <p>{event.place}</p>
                    </div>
                </div>
                <button className="reserve-now-btn-gold">Inquire Now</button>
            </div>

            {/* Content Sections */}
            <main className="detail-content-body">
                <section className="detail-section about-event">
                    <div className="section-head">
                        <span>THE DETAILS</span>
                        <h2>About the Experience</h2>
                    </div>
                    <div className="text-content">
                        {event.description}
                    </div>
                </section>

                <section className="detail-section feature-highlights">
                    <div className="section-head">
                        <span>EXCLUSIVE AMENITIES</span>
                        <h2>What to Expect</h2>
                    </div>
                    <div className="features-luxury-grid">
                        <div className="l-feature-card">
                            <i className="fas fa-gem"></i>
                            <h3>Elite Design</h3>
                            <p>Every detail curated by our award-winning design team.</p>
                        </div>
                        <div className="l-feature-card">
                            <i className="fas fa-concierge-bell"></i>
                            <h3>Personal Service</h3>
                            <p>Dedicated staff ensuring your night is flawless.</p>
                        </div>
                        <div className="l-feature-card">
                            <i className="fas fa-wine-glass-alt"></i>
                            <h3>Premium Catering</h3>
                            <p>World-class cuisine tailored to your preferences.</p>
                        </div>
                    </div>
                </section>

                {/* Real Review Section */}
                <section className="detail-section reviews-anchor" id="reviews-section">
                    <div className="section-head">
                        <span>GUEST VOICES</span>
                        <h2>Event Reviews</h2>
                    </div>

                    <div className="reviews-real-container">
                        <div className="reviews-header-flex">
                            <div className="avg-big-score">
                                <h3>{avgRating.averageRating.toFixed(1)}</h3>
                                <div className="stars-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <i key={i} className={i < Math.round(avgRating.averageRating) ? "fas fa-star" : "far fa-star"}></i>
                                    ))}
                                </div>
                                <p>Out of {avgRating.totalReviews} reviews</p>
                            </div>
                            {user ? (
                                <button className="leave-review-btn" onClick={() => setShowReviewModal(true)}>
                                    <i className="fas fa-pen-nib"></i> Write a Review
                                </button>
                            ) : (
                                <p className="login-to-review">Please <span onClick={() => navigate('/login')}>Login</span> to share your experience.</p>
                            )}
                        </div>

                        <div className="reviews-list">
                            {reviews.length > 0 ? (
                                reviews.map((rev) => (
                                    <div key={rev._id} className="review-card-premium">
                                        <div className="rev-user-info">
                                            <img
                                                src={rev.user?.profileImage ? (rev.user.profileImage.startsWith('http') ? rev.user.profileImage : `${API_BASE_URL}/${rev.user.profileImage.replace(/\\/g, "/")}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                                alt={rev.user?.name}
                                                onError={(e) => {
                                                    e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                                }}
                                            />
                                            <div>
                                                <h4>{rev.user?.name}</h4>
                                                <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="rev-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={i < rev.rating ? "fas fa-star" : "far fa-star"}></i>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="rev-comment">"{rev.comment}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="no-reviews-box">
                                    <i className="fas fa-comment-slash"></i>
                                    <p>No reviews yet for this event. Be the first to share your magic!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer Call to Action */}
            <div className="bottom-cta-banner">
                <div className="cta-inner">
                    <h3>Ready to create memories?</h3>
                    <button className="gold-solid-btn">Book Consultation</button>
                </div>
            </div>

            {showReviewModal && (
                <ReviewModal
                    target="event"
                    eventId={eventId}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={() => {
                        fetchReviews();
                        setShowReviewModal(false);
                    }}
                />
            )}
        </div>
    );
}
