import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllMessages, selectMessages, selectContactLoading, updateMessageStatusAction } from "../../Features/Contactslice";
import CustomDropdown from "../../Components/CustomDropdown";
import "./UserMessages.css";

export default function UserMessages() {
    const dispatch = useDispatch();
    const messages = useSelector(selectMessages);
    const loading = useSelector(selectContactLoading);

    // State for Search, Filter, Sort
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("All");
    const [filterDate, setFilterDate] = React.useState("All"); // New Date Filter
    const [sortOption, setSortOption] = React.useState("newest");

    // Pagination State
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterDate, sortOption]);

    const processedMessages = React.useMemo(() => {
        let result = messages ? [...messages] : [];

        // 1. Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(m =>
                m.name.toLowerCase().includes(lowerTerm) ||
                m.email.toLowerCase().includes(lowerTerm) ||
                m.message.toLowerCase().includes(lowerTerm)
            );
        }

        // 2. Status Filter
        if (filterStatus !== "All") {
            result = result.filter(m => m.status === filterStatus.toLowerCase()); // status in DB is lowercase
        }

        // 3. Date Filter
        if (filterDate !== "All") {
            const now = new Date();
            const todayStart = new Date(now.setHours(0, 0, 0, 0));

            result = result.filter(m => {
                const msgDate = new Date(m.createdAt);
                if (filterDate === "Today") {
                    return msgDate >= todayStart;
                }
                if (filterDate === "Last 7 Days") {
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(now.getDate() - 7);
                    return msgDate >= sevenDaysAgo;
                }
                if (filterDate === "Last 30 Days") {
                    const thirtyDaysAgo = new Date(now);
                    thirtyDaysAgo.setDate(now.getDate() - 30);
                    return msgDate >= thirtyDaysAgo;
                }
                return true;
            });
        }

        // 4. Sorting
        result.sort((a, b) => {
            if (sortOption === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            if (sortOption === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt);
            }
            return 0;
        });

        return result;
    }, [messages, searchTerm, filterStatus, filterDate, sortOption]);

    // Pagination Logic
    const totalPages = Math.ceil(processedMessages.length / itemsPerPage);
    const paginatedMessages = processedMessages.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        // Initial fetch
        dispatch(fetchAllMessages());

        // Listen for updates from other tabs
        const bc = new BroadcastChannel('admin_updates');
        bc.onmessage = (event) => {
            if (event.data === 'REFRESH_DATA' || event.data.type === 'REFRESH_DATA' || event.data.type === 'USER_DELETED') {
                dispatch(fetchAllMessages());
            }
        };

        return () => bc.close();
    }, [dispatch]);

    return (
        <div className="userdata-container">
            <div className="userdata-card">
                <div className="header-flex">
                    <div>
                        <h1>User Messages</h1>
                        <p>View and manage messages sent by users through the contact form.</p>
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
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <CustomDropdown
                            options={[
                                { value: "All", label: "All Dates" },
                                { value: "Today", label: "Today" },
                                { value: "Last 7 Days", label: "Last 7 Days" },
                                { value: "Last 30 Days", label: "Last 30 Days" }
                            ]}
                            value={filterDate}
                            onChange={(val) => setFilterDate(val)}
                            placeholder="Filter Date"
                        />

                        <CustomDropdown
                            options={[
                                { value: "All", label: "All Status" },
                                { value: "Pending", label: "Pending" },
                                { value: "Approved", label: "Approved" },
                                { value: "Rejected", label: "Rejected" }
                            ]}
                            value={filterStatus}
                            onChange={(val) => setFilterStatus(val)}
                            placeholder="Filter Status"
                        />

                        <CustomDropdown
                            options={[
                                { value: "newest", label: "Newest First" },
                                { value: "oldest", label: "Oldest First" }
                            ]}
                            value={sortOption}
                            onChange={(val) => setSortOption(val)}
                            placeholder="Sort By"
                        />
                    </div>
                </div>


                {loading ? (
                    <div className="loading">Loading messages...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="userdata-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Message</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={!loading ? 'paginated-content' : ''} key={currentPage}>
                                {paginatedMessages.length > 0 ? (
                                    paginatedMessages.map((item) => (
                                        <tr key={item._id}>
                                            <td data-label="Name">
                                                <div className="name-wrapper">
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td data-label="Email">{item.email}</td>
                                            <td data-label="Phone">{item.phone}</td>
                                            <td data-label="Message">
                                                <div className="message-content">
                                                    {item.message}
                                                </div>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="message-actions">
                                                    <button
                                                        className="approve-btn"
                                                        onClick={() => dispatch(updateMessageStatusAction({ id: item._id, status: 'approved' }))}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="reject-btn"
                                                        onClick={() => dispatch(updateMessageStatusAction({ id: item._id, status: 'rejected' }))}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">
                                            <div className="empty-state">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-icon shadow-sm">
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                    <polyline points="22,6 12,13 2,6"></polyline>
                                                </svg>
                                                <h3>No Messages Found</h3>
                                                <p>There are no user messages in the system yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                {processedMessages.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            Showing <span>{(currentPage - 1) * itemsPerPage + 1}</span> to <span>{Math.min(currentPage * itemsPerPage, processedMessages.length)}</span> of <span>{processedMessages.length}</span> messages
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
