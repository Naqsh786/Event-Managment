// /**
//  * Smart API Base URL Detection
//  */
// const getApiBaseUrl = () => {
//     // 1. Check if production
//     if (import.meta.env.PROD) {
//         // Use production URL from env or fallback to Vercel
//         return import.meta.env.VITE_API_URL || "https://event-back-end-xi.vercel.app";
//     }

//     // 2. Development Mode: Pointing to deployed backend as requested
//     return "https://event-back-end-xi.vercel.app";
// };

// export const API_BASE_URL = getApiBaseUrl();

// // Specific API endpoints for convenience
// export const USER_API_URL = `${API_BASE_URL}/user`;
// export const ADMIN_API_URL = `${API_BASE_URL}/admin`;
// export const CATEGORY_API_URL = `${API_BASE_URL}/category`;
// export const EVENT_API_URL = `${API_BASE_URL}/event`;
// export const SLIDE_API_URL = `${API_BASE_URL}/slide`;
// export const CONTACT_API_URL = `${API_BASE_URL}/contact`;
// export const CHAT_API_URL = `${API_BASE_URL}/chat`;
// export const REVIEW_API_URL = `${API_BASE_URL}/review`;
// export const UPLOADS_URL = `${API_BASE_URL}/uploads`;
// export const SOCKET_URL = API_BASE_URL;





/**
 * Smart API Base URL Detection
 * Yeh code automatically check karega ke aap local pe hain ya live.
 */
const getApiBaseUrl = () => {
    // 1. Pehle check karega ke kya Vercel/Environment variable mein URL set hai?
    if (import.meta.env.VITE_API_URL) {
        // Automatically remove trailing slash if present
        return import.meta.env.VITE_API_URL.replace(/\/$/, "");
    }

    // 2. Agar variable nahi milta (Development mode), toh fallback URL:
    return "https://event-managment-b.vercel.app".replace(/\/$/, "");
};

export const API_BASE_URL = getApiBaseUrl();

// Specific API endpoints - Ab ye automatically update honge
export const USER_API_URL = `${API_BASE_URL}/user`;
export const ADMIN_API_URL = `${API_BASE_URL}/admin`;
export const CATEGORY_API_URL = `${API_BASE_URL}/category`;
export const EVENT_API_URL = `${API_BASE_URL}/event`;
export const SLIDE_API_URL = `${API_BASE_URL}/slide`;
export const CONTACT_API_URL = `${API_BASE_URL}/contact`;
export const CHAT_API_URL = `${API_BASE_URL}/chat`;
export const REVIEW_API_URL = `${API_BASE_URL}/review`;
export const UPLOADS_URL = `${API_BASE_URL}/uploads`;
export const SOCKET_URL = API_BASE_URL;