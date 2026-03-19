import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchAllUsers, selectAdminUserData, selectAdminLoading, promoteUserToAdmin, toggleUserStatus } from "../../Features/Adminslice";
import { selectLoggedInUser } from "../../Features/Userslice";
import CustomDropdown from "../../Components/CustomDropdown";
import "./UserData.css";
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
export default function UserData() {
    const dispatch = useDispatch();
    const users = useSelector(selectAdminUserData);
    const loading = useSelector(selectAdminLoading);
    const currentUser = useSelector(selectLoggedInUser);


    useEffect(() => {
        // Initial fetch
        dispatch(fetchAllUsers());

        // Listen for updates from other tabs (e.g., registrations)
        const bc = new BroadcastChannel('admin_updates');
        bc.onmessage = (event) => {
            if (event.data === 'REFRESH_DATA' || event.data.type === 'REFRESH_DATA' || event.data.type === 'USER_DELETED') {
                dispatch(fetchAllUsers({ isSilent: true }));
            }
        };

        return () => bc.close();
    }, [dispatch]);

    const handlePromote = async (id) => {
        const result = await Swal.fire({
            title: 'Promote User?',
            text: "Are you sure you want to promote this user to Admin?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#d1d5db',
            confirmButtonText: 'Yes, promote!'
        });

        if (result.isConfirmed) {
            try {
                await dispatch(promoteUserToAdmin(id)).unwrap();
                const bc = new BroadcastChannel('admin_updates');
                bc.postMessage('REFRESH_DATA');
                bc.close();
                toast.success("User promoted to Admin successfully!");
            } catch (err) {
                toast.error("Promotion failed: " + err);
            }
        }
    };

    const handleToggleStatus = async (user) => {
        const action = user.isActive ? "deactivate" : "activate";
        
        const result = await Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} User?`,
            text: `Are you sure you want to ${action} this user?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: user.isActive ? '#d33' : '#10b981',
            cancelButtonColor: '#d1d5db',
            confirmButtonText: `Yes, ${action}!`
        });

        if (result.isConfirmed) {
            try {
                const updated = await dispatch(toggleUserStatus(user._id)).unwrap();

                const bc = new BroadcastChannel('admin_updates');
                // Refresh admin lists
                bc.postMessage('REFRESH_DATA');
                // Notify all tabs if a user has been deactivated
                if (updated && updated.isActive === false) {
                    bc.postMessage({
                        type: 'USER_STATUS_CHANGED',
                        userId: updated._id,
                        isActive: false
                    });
                }
                bc.close();
                toast.success(`User ${action}d successfully`);
            } catch (err) {
                toast.error(`Failed to ${action} user: ` + err);
            }
        }
    };

    // State for Search, Filter, Sort
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterRole, setFilterRole] = React.useState("All");
    const [filterStatus, setFilterStatus] = React.useState("All");
    const [sortOption, setSortOption] = React.useState("active-first");

    // Pagination State
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole, filterStatus, sortOption]);

    // Process Users with usage of useMemo for performance
    const processedUsers = React.useMemo(() => {
        let result = users ? [...users] : [];

        // 1. Filter by Logged In User Logic (Standard)
        const isMainAdmin = currentUser?.isMainAdmin;
        result = result.filter(u => {
            if (isMainAdmin) return true;
            if (u._id === currentUser?._id) return true;
            return u.role !== "Admin";
        });

        // 2. Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(lowerTerm) ||
                u.email.toLowerCase().includes(lowerTerm) ||
                u.phone.includes(lowerTerm)
            );
        }

        // 3. Role Filter
        if (filterRole !== "All") {
            result = result.filter(u =>
                filterRole === "Admin" ? u.role === "Admin" : u.role !== "Admin"
            );
        }

        // 4. Status Filter
        if (filterStatus !== "All") {
            const isActive = filterStatus === "Active";
            result = result.filter(u => u.isActive === isActive);
        }

        // 5. Sorting
        result.sort((a, b) => {
            if (sortOption === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            if (sortOption === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            if (sortOption === "a-z") {
                return a.name.localeCompare(b.name);
            }
            if (sortOption === "z-a") {
                return b.name.localeCompare(a.name);
            }
            // Default: Admins first, then Newest
            if (a.role === 'Admin' && b.role !== 'Admin') return -1;
            if (a.role !== 'Admin' && b.role === 'Admin') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return result;
    }, [users, currentUser, searchTerm, filterRole, filterStatus, sortOption]);

    // Pagination Logic
    const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
    const paginatedUsers = processedUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="userdata-container">
            <div className="userdata-card">
                <div className="header-flex">
                    <div>
                        <h1>Member Directory</h1>
                        <p>Manage and monitor all registered users in the system.</p>
                    </div>
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
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <CustomDropdown
                            options={[
                                { value: "All", label: "All Roles" },
                                { value: "User", label: "User" },
                                { value: "Admin", label: "Admin" }
                            ]}
                            value={filterRole}
                            onChange={(val) => setFilterRole(val)}
                            placeholder="Filter Role"
                        />

                        <CustomDropdown
                            options={[
                                { value: "All", label: "All Status" },
                                { value: "Active", label: "Active" },
                                { value: "Inactive", label: "Inactive" }
                            ]}
                            value={filterStatus}
                            onChange={(val) => setFilterStatus(val)}
                            placeholder="Filter Status"
                        />

                        <CustomDropdown
                            options={[
                                { value: "active-first", label: "Default Sorting" },
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


                {loading ? (
                    <div className="loading">Loading user data...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="userdata-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    {currentUser?.isMainAdmin && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody className={!loading ? 'paginated-content' : ''} key={currentPage}>
                                {paginatedUsers.length > 0 ? (
                                    paginatedUsers.map((item) => (
                                        <tr key={item._id}>
                                            <td data-label="Name">
                                                <div className="name-wrapper">
                                                    {item.name}
                                                    {item.isMainAdmin && <span className="main-admin-tag">Main</span>}
                                                </div>
                                            </td>
                                            <td data-label="Email">{item.email}</td>
                                            <td data-label="Phone">{item.phone}</td>
                                            <td data-label="Role">
                                                <span className={`role-badge ${item.role === 'Admin' ? 'admin-badge' : 'user-badge'}`}>
                                                    {item.role || "N/A"}
                                                </span>
                                            </td>
                                            <td data-label="Status">
                                                <div className="status-container">
                                                    {item.isActive ? (
                                                        <span className="status-badge active">Active</span>
                                                    ) : (
                                                        <span className="status-badge inactive">Inactive</span>
                                                    )}
                                                </div>
                                            </td>
                                            {currentUser?.isMainAdmin && (
                                                <td data-label="Actions">
                                                    <div className="action-btns-flex">
                                                        {item.role !== "Admin" && (
                                                            <button
                                                                className="approve-btn small"
                                                                onClick={() => handlePromote(item._id)}
                                                                disabled={!item.verifyuser}
                                                                title={!item.verifyuser ? "User must verify email first" : ""}
                                                                style={{ opacity: !item.verifyuser ? 0.5 : 1 }}
                                                            >
                                                                Make Admin
                                                            </button>
                                                        )}
                                                        <button
                                                            className={`status-toggle-btn ${item.isActive ? 'deactivate-btn' : 'activate-btn'}`}
                                                            disabled={(currentUser && currentUser._id === item._id) || item.isMainAdmin}
                                                            onClick={() => handleToggleStatus(item)}
                                                            title={item.isActive ? "Deactivate User" : "Activate User"}
                                                        >
                                                            {item.isActive ? "Deactivate" : "Activate"}
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={currentUser?.isMainAdmin ? 6 : 5}>
                                            <div className="empty-state">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-icon shadow-sm">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="9" cy="7" r="4"></circle>
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                </svg>
                                                <h3>No Users Found</h3>
                                                <p>There are no regular users registered in the system yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {processedUsers.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing <span>{(currentPage - 1) * itemsPerPage + 1}</span> to <span>{Math.min(currentPage * itemsPerPage, processedUsers.length)}</span> of <span>{processedUsers.length}</span> members
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

        </div>
    );
}
