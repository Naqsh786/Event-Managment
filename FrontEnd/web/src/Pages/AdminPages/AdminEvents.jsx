import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents, addEvent, deleteEvent, selectAllEvents, selectEventLoading } from "../../Features/EventSlice";
import { fetchCategories, selectAllCategories } from "../../Features/Categoryslice";
import CustomDropdown from "../../Components/CustomDropdown";
import { API_BASE_URL } from "../../utils/apiConfig";
import "./AdminEvents.css";
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
export default function AdminEvents() {
    const dispatch = useDispatch();
    const events = useSelector(selectAllEvents);
    const categories = useSelector(selectAllCategories);
    const loading = useSelector(selectEventLoading);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [people, setPeople] = useState("");
    const [place, setPlace] = useState("");
    const [image, setImage] = useState(null);

    // Search & Sort State
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        dispatch(fetchEvents());
        dispatch(fetchCategories());

        // Listen for category updates from AdminCategory page
        const bc = new BroadcastChannel('category_updates');
        bc.onmessage = (event) => {
            if (event.data === 'REFRESH_CATEGORIES') {
                dispatch(fetchCategories());
            }
        };

        return () => {
            bc.close();
        };
    }, [dispatch]);

    // Reset page on search/sort
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [searchTerm, sortOption]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("people", people);
        formData.append("place", place);
        if (image) formData.append("image", image);

        await dispatch(addEvent(formData));
        // Reset form
        setName("");
        setDescription("");
        setCategory("");
        setPeople("");
        setPlace("");
        setImage(null);
        setIsModalOpen(false);
        dispatch(fetchEvents());
    };

    const handleDelete = async (id) => {
        console.log("DEBUG: handleDelete (Event) triggered for ID:", id);
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await dispatch(deleteEvent(id));
                toast.success('Event deleted successfully');
            } catch {
                toast.error('Failed to delete event');
            }
        }
    };

    // Processed Events (Search + Sort)
    const processedEvents = React.useMemo(() => {
        let result = events ? [...events] : [];

        // Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(e =>
                e.name.toLowerCase().includes(lowerTerm) ||
                e.description.toLowerCase().includes(lowerTerm)
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortOption === "a-z") return a.name.localeCompare(b.name);
            if (sortOption === "z-a") return b.name.localeCompare(a.name);
            return 0;
        });

        return result;
    }, [events, searchTerm, sortOption]);

    const totalPages = Math.ceil(processedEvents.length / itemsPerPage);
    const paginatedEvents = processedEvents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="admin-category-container">
            {/* Main Content Card */}
            <div className="category-content-card">
                <div className="header-flex">
                    <div className="header-title">
                        <h1>Event Management</h1>
                        <p>Create and curate majestic events for your categories</p>
                    </div>
                    <button className="add-category-btn" onClick={() => setIsModalOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Event
                    </button>
                </div>

                <div className="controls-container">
                    <div className="search-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search events by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <CustomDropdown
                            options={[
                                { value: "newest", label: "Newest First" },
                                { value: "oldest", label: "Oldest First" },
                                { value: "a-z", label: "Name (A-Z)" },
                                { value: "z-a", label: "Name (Z-A)" }
                            ]}
                            value={sortOption}
                            onChange={(val) => setSortOption(val)}
                            placeholder="Sort By"
                        />
                    </div>
                </div>

                <div className={`category-list-view ${!loading ? 'paginated-content' : ''}`} key={currentPage}>
                    {loading && !isModalOpen ? (
                        <div className="loading-state">
                            <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                            <p>Fetching events...</p>
                        </div>
                    ) : processedEvents.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📅</div>
                            <h3>{searchTerm ? "No Match Found" : "No Events Yet"}</h3>
                            <p>{searchTerm ? `We couldn't find any events matching "${searchTerm}"` : "Get started by creating your first event."}</p>
                        </div>
                    ) : (
                        <div className="admin-category-rows">
                            <div className="category-row-header">
                                <div className="col-info">Event Details</div>
                                <div className="col-description">Place & Capacity</div>
                                <div className="col-actions">Actions</div>
                            </div>
                            {paginatedEvents.map((event) => (
                                <div key={event._id} className="admin-category-row">
                                    <div className="col-info">
                                        <div className="event-image-mini">
                                            <img
                                                src={event.image.startsWith('http') ? event.image : `${API_BASE_URL}/${event.image}`}
                                                alt={event.name}
                                                onError={(e) => {
                                                    e.target.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&q=80";
                                                }}
                                            />
                                        </div>
                                        <div className="admin-cat-details">
                                            <h3>{event.name}</h3>
                                            <span>Added on {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="col-description">
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                                                {event.category?.name || "Uncategorized"}
                                            </span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                • {event.place} | {event.people} Guests
                                            </span>
                                        </div>
                                        <p style={{ marginTop: '5px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                            {event.description.length > 60 ? event.description.substring(0, 60) + "..." : event.description}
                                        </p>
                                    </div>
                                    <div className="col-actions">
                                        <button className="row-delete-btn" onClick={() => handleDelete(event._id)}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {processedEvents.length > 0 && (
                    <div className="pagination-container admin-card-pagination">
                        <div className="pagination-info">
                            Showing <span>{(currentPage - 1) * itemsPerPage + 1}</span> to <span>{Math.min(currentPage * itemsPerPage, processedEvents.length)}</span> of <span>{processedEvents.length}</span> events
                        </div>
                        <div className="pagination-btns">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
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
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Event</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Event Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Royal Barat"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the majesty of this event..."
                                    required
                                    rows="4"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <CustomDropdown
                                        options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                                        value={category}
                                        onChange={setCategory}
                                        placeholder="Select Category"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Guest Capacity</label>
                                    <CustomDropdown
                                        options={[
                                            { value: "100", label: "100 Guests" },
                                            { value: "200", label: "200 Guests" },
                                            { value: "300", label: "300 Guests" },
                                            { value: "400", label: "400 Guests" },
                                            { value: "500", label: "500 Guests" },
                                            { value: "600", label: "600 Guests" }
                                        ]}
                                        value={people}
                                        onChange={setPeople}
                                        placeholder="Select Capacity"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Event Location / Place</label>
                                <input
                                    type="text"
                                    value={place}
                                    onChange={(e) => setPlace(e.target.value)}
                                    placeholder="e.g., Grand Palace Hotel, Lahore"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Event Image</label>
                                <label htmlFor="file-upload-event" className={`file-upload-area ${image ? 'has-file' : ''}`}>
                                    {image ? (
                                        <div className="file-preview-mini">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                            </svg>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>{image.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📷</div>
                                            <p>Click to Upload Image</p>
                                        </>
                                    )}
                                </label>
                                <input
                                    id="file-upload-event"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    required
                                    style={{ display: "none" }}
                                />
                            </div>

                            <button type="submit" className="modal-submit-btn">
                                {loading ? "Creating..." : "Create Event"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
