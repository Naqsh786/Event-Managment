import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/apiConfig";
import "./AdminReviews.css";
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, web, event

    const fetchAllReviews = React.useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/review/all${filter !== 'all' ? '?target=' + filter : ''}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Error fetching reviews", err);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchAllReviews();

        // Broadcast Channel for sync
        const bc = new BroadcastChannel("review_updates");
        bc.onmessage = (event) => {
            if (event.data === "REFRESH_REVIEWS") {
                fetchAllReviews();
            }
        };
        return () => bc.close();
    }, [filter, fetchAllReviews]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Review?',
            text: "Are you sure you want to remove this review?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${API_BASE_URL}/review/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReviews(reviews.filter(r => r._id !== id));

            // Notify other tabs
            const bc = new BroadcastChannel("review_updates");
            bc.postMessage("REFRESH_REVIEWS");
            setTimeout(() => bc.close(), 100);
            toast.success("Review deleted successfully!");
        } catch {
            toast.error("Failed to delete review.");
        }
    };

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Slightly fewer items for reviews as cards can be tall

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // Pagination Logic
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    const paginatedReviews = reviews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="admin-reviews-page">
            <div className="userdata-card">
                <div className="admin-header-flex">
                    <div>
                        <h1>Review Management</h1>
                        <p>Oversee all guest feedback and website ratings.</p>
                    </div>
                    <div className="filter-group">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                        <button className={filter === 'web' ? 'active' : ''} onClick={() => setFilter('web')}>Website</button>
                        <button className={filter === 'event' ? 'active' : ''} onClick={() => setFilter('event')}>Events</button>
                    </div>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="admin-reviews-table-wrapper">
                            <table className="userdata-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Target</th>
                                        <th>Rating</th>
                                        <th>Comment</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="paginated-content" key={currentPage + filter}>
                                    {paginatedReviews.length > 0 ? (
                                        paginatedReviews.map((rev) => (
                                            <tr key={rev._id}>
                                                <td data-label="User">
                                                    <div className="td-user">
                                                        <img
                                                          src={rev.user?.profileImage ? (rev.user.profileImage.startsWith('http') ? rev.user.profileImage : `${API_BASE_URL}/${rev.user.profileImage.replace(/\\/g, "/")}`) : "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                                          alt=""
                                                          onError={(e) => {
                                                            e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                                                          }}
                                                        />
                                                        <span>{rev.user?.name || "Deleted User"}</span>
                                                    </div>
                                                </td>
                                                <td data-label="Target">
                                                    <span className={`target-badge ${rev.target}`}>
                                                        {rev.target === 'web' ? '🌐 Website' : `📅 ${rev.event?.name || 'Event'}`}
                                                    </span>
                                                </td>
                                                <td data-label="Rating">
                                                    <div className="admin-rating-number">
                                                        <span className="rating-val">{rev.rating}</span>
                                                        <span className="rating-total">/ 5</span>
                                                        <i className="fa-solid fa-star" style={{ marginLeft: '5px', color: 'var(--accent-primary)', fontSize: '0.8rem' }}></i>
                                                    </div>
                                                </td>
                                                <td data-label="Comment" className="td-comment">
                                                    <div className="comment-truncate" title={rev.comment}>
                                                        {rev.comment}
                                                    </div>
                                                </td>
                                                <td data-label="Date">{new Date(rev.createdAt).toLocaleDateString()}</td>
                                                <td data-label="Actions">
                                                    <button className="delete-row-btn" onClick={() => handleDelete(rev._id)}>
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="no-data" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>No reviews matching your filter.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {reviews.length > 0 && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    Showing <span>{(currentPage - 1) * itemsPerPage + 1}</span> to <span>{Math.min(currentPage * itemsPerPage, reviews.length)}</span> of <span>{reviews.length}</span> reviews
                                </div>
                                <div className="pagination-btns">
                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={loading || currentPage === 1}
                                        title="Previous Page"
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6"></polyline>
                                        </svg>
                                        Prev
                                    </button>

                                    <div className="pagination-numbers">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                            <button
                                                key={pageNum}
                                                className={`pagination-btn page-num ${currentPage === pageNum ? 'active' : ''}`}
                                                onClick={() => setCurrentPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={loading || currentPage === totalPages}
                                        title="Next Page"
                                    >
                                        Next
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
