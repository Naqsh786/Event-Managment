import React, { useEffect, Suspense, lazy } from 'react'
import './App.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Route, Routes, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loadUser } from './Features/Userslice'

// Components
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import ReviewModal from './Components/ReviewModal'
import FloatingChat from './Components/FloatingChat'

// Lazy loaded Pages
const Home = lazy(() => import('./Pages/Home'))
const About = lazy(() => import('./Pages/About'))
const Services = lazy(() => import('./Pages/Services'))
const Contact = lazy(() => import('./Pages/Contact'))
const Login = lazy(() => import('./Pages/Loginform'))
const Register = lazy(() => import('./Pages/Registerform'))
const VerifyEmail = lazy(() => import('./Pages/VerifyEmail'))
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./Pages/ResetPassword'))
const Profile = lazy(() => import('./Pages/Profile'))
const EditProfile = lazy(() => import('./Pages/EditProfile'))
const ChangePassword = lazy(() => import('./Pages/ChangePassword'))
const UserData = lazy(() => import('./Pages/AdminPages/UserData'))
const Category = lazy(() => import('./Pages/Category'))
const AdminLayout = lazy(() => import('./Pages/AdminPages/AdminLayout'))
const AdminDashboard = lazy(() => import('./Pages/AdminPages/AdminDashboard'))
const AdminSettings = lazy(() => import('./Pages/AdminPages/AdminSettings'))
const AdminProfile = lazy(() => import('./Pages/AdminPages/AdminProfile'))
const VerifyAdmin = lazy(() => import('./Pages/AdminPages/VerifyAdmin'))
const UserMessages = lazy(() => import('./Pages/AdminPages/UserMessages'))
const Notifications = lazy(() => import('./Pages/Notifications'))
const AdminCategory = lazy(() => import('./Pages/AdminPages/AdminCategory'))
const ManageSlides = lazy(() => import('./Pages/AdminPages/ManageSlides'))
const AdminEvents = lazy(() => import('./Pages/AdminPages/AdminEvents'))
const AdminReviews = lazy(() => import('./Pages/AdminPages/AdminReviews'))
const CategoryEvents = lazy(() => import('./Pages/CategoryEvents'))
const EventDetail = lazy(() => import('./Pages/EventDetail'))
const AdminChat = lazy(() => import('./Pages/AdminPages/AdminChat'))

import { GoogleOAuthProvider } from '@react-oauth/google';

// Simple Loading Spinner
const SuspenseLoader = () => (
    <div className="suspense-loader">
        <div className="majestic-spinner"></div>
    </div>
);

const GOOGLE_CLIENT_ID = "274039393968-s4mtvtjnmq1dmfmakkatetpnmk2b6ldn.apps.googleusercontent.com";

export default function App() {
    const dispatch = useDispatch();
    const location = useLocation();
    const [showWebReview, setShowWebReview] = React.useState(false);

    useEffect(() => {
        const sessionStart = localStorage.getItem("sessionStart");
        const hasReviewed = localStorage.getItem("web_reviewed");

        if (!sessionStart) {
            localStorage.setItem("sessionStart", Date.now());
        } else if (!hasReviewed) {
            const thirtyMinutes = 30 * 60 * 1000;
            const elapsed = Date.now() - parseInt(sessionStart);

            if (elapsed >= thirtyMinutes) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setShowWebReview(true);
            } else {
                const remaining = thirtyMinutes - elapsed;
                const timer = setTimeout(() => {
                    setShowWebReview(true);
                }, remaining);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    useEffect(() => {
        const reviewBc = new BroadcastChannel('review_trigger');
        reviewBc.onmessage = (event) => {
            if (event.data === 'OPEN_WEB_REVIEW') {
                setShowWebReview(true);
            }
        };
        return () => reviewBc.close();
    }, []);

    useEffect(() => {
        dispatch(loadUser());
        const bc = new BroadcastChannel('admin_updates');
        bc.onmessage = (event) => {
            const data = event.data;
            if (data === 'REFRESH_DATA' || data.type === 'REFRESH_DATA' || data.type === 'USER_DELETED') {
                dispatch(loadUser());
            }

            if (data && data.type === 'USER_DELETED') {
                const storedUser = JSON.parse(sessionStorage.getItem("user"));
                if (storedUser && String(storedUser._id) === String(data.userId)) {
                    sessionStorage.clear();
                    window.location.href = "/login";
                    toast.error("Your account has been removed by the administrator.", { position: "top-right", autoClose: 3000 });
                }
            }

            if (data && data.type === 'USER_STATUS_CHANGED' && data.isActive === false) {
                const storedUser = JSON.parse(sessionStorage.getItem("user"));
                if (storedUser && String(storedUser._id) === String(data.userId)) {
                    sessionStorage.clear();
                    window.location.href = "/login";
                    toast.error("Your account has been deactivated by the administrator.", { position: "top-right", autoClose: 3000 });
                }
            }
        };
        return () => bc.close();
    }, [dispatch]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, [location.pathname]);

    const isHomePage = location.pathname === '/';
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div id={!isAdminRoute ? "public-wrapper" : ""}>
                {!isAdminRoute && <Navbar />}
                <main className={isAdminRoute ? 'admin-main-reset' : `public-main-content ${isHomePage ? 'is-home' : ''}`}>
                    <Suspense fallback={<SuspenseLoader />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/verify-email" element={<VerifyEmail />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/edit-profile" element={<EditProfile />} />
                            <Route path="/edit-password" element={<ChangePassword />} />
                            <Route path="/category" element={<Category />} />

                            <Route path="/admin" element={<AdminLayout />}>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="settings" element={<AdminSettings />} />
                                <Route path="users" element={<UserData />} />
                                <Route path="category" element={<AdminCategory />} />
                                <Route path="slides" element={<ManageSlides />} />
                                <Route path="events" element={<AdminEvents />} />
                                <Route path="reviews" element={<AdminReviews />} />
                                <Route path="messages" element={<UserMessages />} />
                                <Route path="chat" element={<AdminChat />} />
                                <Route path="profile" element={<AdminProfile />} />
                            </Route>
                            <Route path="/admin/verify" element={<VerifyAdmin />} />
                            <Route path="/category/:categoryId" element={<CategoryEvents />} />
                            <Route path="/event/:eventId" element={<EventDetail />} />
                        </Routes>
                    </Suspense>
                </main >
                {!isAdminRoute && <Footer />}
                {!isAdminRoute && <FloatingChat />}

                {showWebReview && (
                    <ReviewModal
                        target="web"
                        onClose={() => setShowWebReview(false)}
                        onSuccess={() => {
                            localStorage.setItem("web_reviewed", "true");
                            setShowWebReview(false);
                        }}
                    />
                )}
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
            </div>
        </GoogleOAuthProvider>
    )
}


