import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSlide, updateSlide, fetchSlides, deleteSlide, selectAllSlides, selectSlideLoading, selectSlideAddSuccess, selectSlideError, clearSlideErrors } from "../../Features/Slideslice";
import CustomDropdown from "../../Components/CustomDropdown";
import "./ManageSlides.css";
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
export default function ManageSlides() {
    const dispatch = useDispatch();
    const slides = useSelector(selectAllSlides);
    const loading = useSelector(selectSlideLoading);
    const addSuccess = useSelector(selectSlideAddSuccess);
    const error = useSelector(selectSlideError);

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);

    // State for Search and Sort
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("newest");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const handleCloseModal = React.useCallback(() => {
        setShowModal(false);
        setEditMode(false);
        setEditingSlide(null);
        setTitle("");
        setDescription("");
        setImage(null);
    }, []);

    useEffect(() => {
        dispatch(fetchSlides());

        // Sync with other tabs
        const bc = new BroadcastChannel('slide_updates');
        bc.onmessage = (event) => {
            if (event.data === 'REFRESH_SLIDES') {
                dispatch(fetchSlides());
            }
        };

        return () => {
            dispatch(clearSlideErrors());
            bc.close();
        };
    }, [dispatch]);

    useEffect(() => {
        if (addSuccess) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            handleCloseModal();
            setCurrentPage(1);
            toast.success(editMode ? "Slide updated successfully!" : "Slide created successfully!");

            // Notify other tabs
            const bc = new BroadcastChannel('slide_updates');
            bc.postMessage('REFRESH_SLIDES');
            bc.close();

            dispatch(clearSlideErrors());
        }
    }, [addSuccess, dispatch, editMode, handleCloseModal]);

    useEffect(() => {
        if (error) {
            toast.error(`Error: ${error}`);
            dispatch(clearSlideErrors());
        }
    }, [error, dispatch]);

    // Reset to page 1 when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [searchTerm, sortOption]);


    const handleEdit = (slide) => {
        setEditMode(true);
        setEditingSlide(slide);
        setTitle(slide.title);
        setDescription(slide.description);
        setImage(null);
        setShowModal(true);
    };

    const handleSaveSlide = (e) => {
        e.preventDefault();

        if (editMode) {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            if (image) formData.append("image", image);

            dispatch(updateSlide({ id: editingSlide._id, formData }));
        } else {
            if (!title || !description || !image) {
                toast.warning("All fields are required!");
                return;
            }

            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("image", image);

            dispatch(addSlide(formData));
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to delete this slide?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await dispatch(deleteSlide(id)).unwrap();

                // Notify other tabs
                const bc = new BroadcastChannel('slide_updates');
                bc.postMessage('REFRESH_SLIDES');
                bc.close();

                // Adjust current page if last item on page is deleted
                if (paginatedSlides.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                
                toast.success("Slide deleted successfully!");
            } catch (err) {
                toast.error("Delete Slide failed");
                console.error("Delete Slide failed", err);
            }
        }
    };

    // Calculate Processed Data (Search & Sort)
    const processedSlides = React.useMemo(() => {
        let result = slides ? [...slides] : [];

        // 1. Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(slide =>
                slide.title.toLowerCase().includes(lowerTerm) ||
                slide.description.toLowerCase().includes(lowerTerm)
            );
        }

        // 2. Sort
        result.sort((a, b) => {
            if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortOption === "a-z") return a.title.localeCompare(b.title);
            if (sortOption === "z-a") return b.title.localeCompare(a.title);
            return 0;
        });

        return result;
    }, [slides, searchTerm, sortOption]);

    const totalPages = Math.ceil(processedSlides.length / itemsPerPage);

    // Calculate Paginated Data
    const paginatedSlides = processedSlides.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="manage-slides-container admin-category-container">
            <div className="category-content-card">
                <div className="header-flex">
                    <div className="header-title">
                        <h1>Hero Slider Management</h1>
                        <p>Manage the slides featured on your home page hero section</p>
                    </div>
                    <button className="add-category-btn" onClick={() => setShowModal(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Slide
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
                            placeholder="Search slides by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <CustomDropdown
                            options={[
                                { value: "newest", label: "Newest First" },
                                { value: "oldest", label: "Oldest First" },
                                { value: "a-z", label: "Title (A-Z)" },
                                { value: "z-a", label: "Title (Z-A)" }
                            ]}
                            value={sortOption}
                            onChange={(val) => setSortOption(val)}
                            placeholder="Sort By"
                        />
                    </div>
                </div>

                <div className={`category-list-view ${!loading ? 'paginated-content' : ''}`} key={currentPage}>
                    {loading && !showModal ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Fetching slides...</p>
                        </div>
                    ) : processedSlides.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🖼️</div>
                            <h3>{searchTerm ? "No Match Found" : "No Slides Yet"}</h3>
                            <p>{searchTerm ? `We couldn't find any slides matching "${searchTerm}"` : "Get started by creating your first hero slide."}</p>
                        </div>
                    ) : (
                        <div className="admin-category-rows">
                            <div className="category-row-header">
                                <div className="col-info">Slide Info</div>
                                <div className="col-description">Description</div>
                                <div className="col-actions">Actions</div>
                            </div>
                            {paginatedSlides.map((slide) => (
                                <div key={slide._id} className="admin-category-row">
                                    <div className="col-info">
                                        <div className="admin-cat-image-mini">
                                            <img
                                              src={slide.image}
                                              alt={slide.title}
                                              onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80";
                                              }}
                                            />
                                        </div>
                                        <div className="admin-cat-details">
                                            <h3>{slide.title}</h3>
                                            <span>Added on {new Date(slide.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="col-description">
                                        <p>{slide.description}</p>
                                    </div>
                                    <div className="col-actions">
                                        <button className="row-edit-btn" onClick={() => handleEdit(slide)}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                            Edit
                                        </button>
                                        <button className="row-delete-btn" onClick={() => handleDelete(slide._id)}>
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

                {processedSlides.length > 0 && (
                    <div className="pagination-container admin-card-pagination">
                        <div className="pagination-info">
                            Showing <span>{(currentPage - 1) * itemsPerPage + 1}</span> to <span>{Math.min(currentPage * itemsPerPage, processedSlides.length)}</span> of <span>{processedSlides.length}</span> slides
                        </div>
                        <div className="pagination-btns">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={loading || currentPage === 1}
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

            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editMode ? "Edit Slide" : "New Hero Slide"}</h3>
                            <button className="close-modal" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSaveSlide}>
                            <div className="form-group">
                                <label>Slide Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Premium Digital Assets"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Catchy tagline or description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Background Image {editMode && "(Optional)"}</label>
                                <label htmlFor="file-upload-slide" className={`file-upload-area ${image ? 'has-file' : ''}`}>
                                    {image ? (
                                        <div className="file-preview-mini">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                            </svg>
                                            <span style={{ color: '#10b981', fontWeight: '600' }}>{image.name}</span>
                                        </div>
                                    ) : editMode && editingSlide?.image ? (
                                        <div className="file-preview-mini">
                                            <img
                                              src={editingSlide.image}
                                              alt="Current"
                                              onError={(e) => {
                                                e.target.src = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80";
                                              }}
                                            />
                                            <p>Click to Change Background</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏞️</div>
                                            <p>Click to Upload Background</p>
                                            <span>PNG, JPG or WEBP (Wide Aspect Ratio recommended)</span>
                                        </>
                                    )}
                                </label>
                                <input
                                    id="file-upload-slide"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    required={!editMode}
                                    style={{ display: "none" }}
                                />
                            </div>
                            <button type="submit" className="modal-submit-btn" disabled={loading}>
                                {loading ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Slide" : "Create Slide")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
