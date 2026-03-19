import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory, updateCategory, fetchCategories, deleteCategory, selectAllCategories, selectCategoryLoading, selectAddSuccess, selectCategoryError, clearCategoryErrors } from "../../Features/Categoryslice";
import CustomDropdown from "../../Components/CustomDropdown";
import "./AdminCategory.css";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function AdminCategory() {
    const dispatch = useDispatch();
    const categories = useSelector(selectAllCategories);
    const loading = useSelector(selectCategoryLoading);
    const addSuccess = useSelector(selectAddSuccess);
    const error = useSelector(selectCategoryError);

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [name, setName] = useState("");

    // State for Search and Sort
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("newest");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const handleCloseModal = React.useCallback(() => {
        setShowModal(false);
        setEditMode(false);
        setEditingCategory(null);
        setName("");
    }, []);

    useEffect(() => {
        dispatch(fetchCategories());

        // Sync with other tabs
        const bc = new BroadcastChannel('category_updates');
        bc.onmessage = (event) => {
            if (event.data === 'REFRESH_CATEGORIES') {
                dispatch(fetchCategories());
            }
        };

        return () => {
            dispatch(clearCategoryErrors());
            bc.close();
        };
    }, [dispatch]);

    useEffect(() => {
        if (addSuccess) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            handleCloseModal();
            setCurrentPage(1);
            toast.success("Category saved successfully!");

            // Notify other tabs
            const bc = new BroadcastChannel('category_updates');
            bc.postMessage('REFRESH_CATEGORIES');
            bc.close();

            dispatch(clearCategoryErrors());
        }
    }, [addSuccess, dispatch, handleCloseModal]);

    useEffect(() => {
        if (error) {
            toast.error(`Error: ${error}`);
            dispatch(clearCategoryErrors());
        }
    }, [error, dispatch]);

    // Reset to page 1 when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentPage(1);
    }, [searchTerm, sortOption]);



    const handleEdit = (cat) => {
        setEditMode(true);
        setEditingCategory(cat);
        setName(cat.name);
        setShowModal(true);
    };

    const handleSaveCategory = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.warning("Category name is required!");
            return;
        }

        if (editMode) {
            dispatch(updateCategory({ id: editingCategory._id, name }));
        } else {
            dispatch(addCategory({ name }));
        }
    };

    const handleDelete = async (id) => {
        console.log("DEBUG: handleDelete triggered for ID:", id);
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
                await dispatch(deleteCategory(id)).unwrap();

                // Notify other tabs
                const bc = new BroadcastChannel('category_updates');
                bc.postMessage('REFRESH_CATEGORIES');
                bc.close();

                // Adjust current page if last item on page is deleted
                if (paginatedCategories.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                }
                
                toast.success("Category deleted successfully!");
            } catch (err) {
                toast.error("Delete Category failed");
                console.error("Delete Category failed", err);
            }
        }
    };

    // Calculate Processed Data (Search & Sort)
    const processedCategories = React.useMemo(() => {
        let result = categories ? [...categories] : [];

        // 1. Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(cat =>
                cat.name.toLowerCase().includes(lowerTerm)
            );
        }

        // 2. Sort
        result.sort((a, b) => {
            if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortOption === "a-z") return a.name.localeCompare(b.name);
            if (sortOption === "z-a") return b.name.localeCompare(a.name);
            return 0;
        });

        return result;
    }, [categories, searchTerm, sortOption]);

    const totalPages = Math.ceil(processedCategories.length / itemsPerPage);

    // Calculate Paginated Data
    const paginatedCategories = processedCategories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="admin-category-container">
            {/* Unified Page Card (The "Page" with borders) */}
            <div className="category-content-card">
                <div className="header-flex">
                    <div className="header-title">
                        <h1>Category Management</h1>
                        <p>Organize and manage your digital products</p>
                    </div>
                    <button className="add-category-btn" onClick={() => setShowModal(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Category
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
                            placeholder="Search categories by name..."
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
                    {loading && !showModal ? (
                        <div className="loading-state">
                            <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                            <p>Fetching categories...</p>
                        </div>
                    ) : processedCategories.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📁</div>
                            <h3>{searchTerm ? "No Match Found" : "No Categories Yet"}</h3>
                            <p>{searchTerm ? `We couldn't find any categories matching "${searchTerm}"` : "Get started by creating your first category."}</p>
                        </div>
                    ) : (
                        <div className="admin-category-rows">
                            <div className="category-row-header">
                                <div className="col-info">Category Name</div>
                                <div className="col-actions">Actions</div>
                            </div>
                            {paginatedCategories.map((cat) => (
                                <div key={cat._id} className="admin-category-row">
                                    <div className="col-info">
                                        <div className="admin-cat-details">
                                            <h3>{cat.name}</h3>
                                            <span>Added on {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="col-actions">
                                        <button className="row-edit-btn" onClick={() => handleEdit(cat)}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                            Edit
                                        </button>
                                        <button className="row-delete-btn" onClick={() => handleDelete(cat._id)}>
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

                {/* Pagination Controls (Always visible when data exists) */}
                {processedCategories.length > 0 && (
                    <div className="pagination-container admin-card-pagination">
                        <div className="pagination-info">
                            Showing <span>{(currentPage - 1) * itemsPerPage + 1}</span> to <span>{Math.min(currentPage * itemsPerPage, processedCategories.length)}</span> of <span>{processedCategories.length}</span> categories
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
            </div>

            {/* Modal remains separate */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editMode ? "Edit Category" : "New Category"}</h3>
                            <button className="close-modal" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSaveCategory}>
                            <div className="form-group">
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Wedding"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading} className="save-btn">
                                {loading ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Category" : "Create Category")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
