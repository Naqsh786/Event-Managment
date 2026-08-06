<div align="center">

# 🎉 Majestic Event Management System

### A Premium, Full-Stack Platform for Event Planning & Management

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/identity)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

<br/>

**Google OAuth Authentication** · **Real-Time Communication** · **Cloudinary Media** · **Automated Emails**

<br/>

[🐛 Report Bug](https://github.com/Naqsh786/Event-Managment/issues) · [✨ Request Feature](https://github.com/Naqsh786/Event-Managment/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About The Project

**Majestic Event Management System** is a comprehensive MERN stack application designed to manage events efficiently. This platform provides a seamless experience for planning, organizing, and interacting with events, featuring real-time communication, robust media management, and secure social authentication.

---

## 🌟 Key Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | Secure login & registration using JWT and **Google OAuth** integration |
| 📅 **Event Management** | Create, view, edit, and manage various types of events easily |
| 💬 **Real-Time Communication** | Instant updates and real-time features powered by **Socket.io** |
| 🖼️ **Media Uploads** | Seamless and fast image uploads integrated with **Cloudinary** |
| 📧 **Email Notifications** | Automated email services (booking confirmations, alerts) using **Nodemailer** |
| 🎨 **Modern UI/UX** | Responsive and attractive frontend built with React |

---

## 🚀 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### 🖥️ Frontend (Client)
- **React.js 19** + **Vite**
- **Redux Toolkit** (State Management)
- **React Router Dom** (Routing)
- **Socket.io-client** (Real-time Features)
- **@react-oauth/google** (Google Authentication)

</td>
<td valign="top" width="50%">

### ⚙️ Backend (Server)
- **Node.js** & **Express.js** (API Framework)
- **MongoDB** & **Mongoose** (Database)
- **Socket.io** (WebSockets for Real-time chat)
- **JWT** (Authentication)
- **Cloudinary** & **Multer** (Image Uploads)
- **Nodemailer** (Automated Emails)

</td>
</tr>
</table>

---

## 🏁 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) connection string
- Cloudinary Account
- Google Cloud Console Project (for OAuth Client ID & Secret)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Naqsh786/Event-Managment.git
cd Event-Managment
```

### 2️⃣ Backend Setup

```bash
# Navigate to the backend directory
cd Backend

# Install dependencies
npm install

# Create .env file from example (Windows)
copy .env.example .env
# For Mac/Linux use: cp .env.example .env

# Open .env and fill in your actual values (see Environment Variables section below)

# Start the backend server
npm start
```

### 3️⃣ Frontend Setup

```bash
# Open a new terminal and navigate to the frontend directory
cd FrontEnd/web

# Install dependencies
npm install

# Create .env file from example (Windows)
copy .env.example .env
# For Mac/Linux use: cp .env.example .env

# Start the frontend dev server
npm run dev
```

> 💡 **Tip:** The frontend runs on `http://localhost:5173` and the backend on `http://localhost:7000` by default.

---

## 🔐 Environment Variables

### Backend (`Backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `7000` |
| `DATABASE` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/eventsdb` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_jwt_secret` |
| `Gmail_user` | Email for Nodemailer | `your_email@gmail.com` |
| `Gmail_password` | Email App Password | `your_email_app_password` |
| `Cloudinary_name` | Cloudinary cloud name | `your_cloudinary_name` |
| `Cloudinary_key` | Cloudinary API key | `your_cloudinary_key` |
| `Cloudinary_secret` | Cloudinary API secret | `your_cloudinary_secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your_google_client_id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret| `your_google_client_secret` |

### Frontend (`FrontEnd/web/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:7000` |

---

## 📁 Project Structure

```
Event-Managment/
├── Backend/
│   ├── controllers/     # Route handlers logic
│   ├── models/          # MongoDB schemas (Mongoose)
│   ├── routes/          # API route endpoints
│   ├── middleware/      # Auth & file upload middlewares
│   ├── index.js         # Entry point for backend server
│   └── .env.example     # Backend environment variables template
│
├── FrontEnd/
│   └── web/
│       ├── src/         # React source code
│       │   ├── components/  # Reusable UI components
│       │   ├── pages/       # React pages (Home, Events, Auth)
│       │   └── redux/       # State management files
│       ├── index.html   # Main HTML file
│       └── .env.example # Frontend environment variables template
│
├── .gitignore
└── README.md
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Feel free to check the [Issues Page](https://github.com/Naqsh786/Event-Managment/issues).

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">

**⭐ If you found this project helpful, please give it a star! ⭐**

Made with ❤️ by [Naqsh786](https://github.com/Naqsh786)

</div>
