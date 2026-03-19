import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiConfig";
import "./ReviewModal.css";

export default function ReviewModal({ target = "web", eventId = null, onClose, onSuccess }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return setError("Please select a rating.");
        if (!comment.trim()) return setError("Please write a small comment.");

        setLoading(true);
        setError("");

        try {
            const token = sessionStorage.getItem("token");
            await axios.post(`${API_BASE_URL}/review/add`, {
                target,
                eventId,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (onSuccess) onSuccess();

            // Notify other tabs/admin pages
            const bc = new BroadcastChannel("review_updates");
            bc.postMessage("REFRESH_REVIEWS");
            setTimeout(() => bc.close(), 100);

            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-card">
                <button className="close-modal-btn" onClick={onClose}>&times;</button>
                <div className="modal-header">
                    <div className="gold-icon-circle">
                        <i className="fas fa-magic"></i>
                    </div>
                    <h2>{target === "web" ? "Rate Your Experience" : "Review This Event"}</h2>
                    <p>Share your thoughts with the Majestic community.</p>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                    <div className="star-rating-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                className={star <= (hover || rating) ? "star-btn active" : "star-btn"}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <i className="fas fa-star"></i>
                            </button>
                        ))}
                    </div>

                    <textarea
                        placeholder="Tell us about the atmosphere, the service, or your favorite moments..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                    ></textarea>

                    {error && <p className="review-error-msg">{error}</p>}

                    <button type="submit" className="submit-review-btn" disabled={loading}>
                        {loading ? "Majestically Saving..." : "Publish Review"}
                    </button>
                </form>
            </div>
        </div>
    );
}
