# 🎉 Majestic Event Management System

A comprehensive MERN stack application designed to manage events efficiently. This project includes features for event planning, real-time communication, media management, and more.

## 🌟 Features
- **User Authentication:** Secure login and registration with JWT and Google OAuth integration.
- **Event Management:** Create, view, and manage various types of events.
- **Real-Time Communication:** Integrated real-time features using Socket.io.
- **Media Uploads:** Seamless image uploads powered by Cloudinary.
- **Email Notifications:** Automated email services using Nodemailer.

## 🛠️ Technology Stack

### Frontend (Client)
- **React.js** (v19)
- **Redux Toolkit** (State Management)
- **React Router Dom** (Routing)
- **Socket.io-client** (Real-time features)
- **Google OAuth** (`@react-oauth/google`)
- **Vite** (Build Tool)

### Backend (Server)
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **Socket.io** (WebSockets)
- **JWT** (Authentication)
- **Cloudinary & Multer** (Image Uploads)
- **Nodemailer** (Emails)

## 🚀 Installation & Setup

Follow these instructions to get the project running locally.

### Prerequisites
- Node.js (v14+)
- MongoDB connection string
- Cloudinary Account
- Google OAuth Client ID & Secret

### 1. Clone the Repository
```bash
git clone https://github.com/Naqsh786/Event-Managment.git
cd Event-Managment
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd Backend
npm install
```
Create your environment variables file by copying the example:
```bash
copy .env.example .env
```
Fill in the required variables in the newly created `.env` file. Then, start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd FrontEnd/web
npm install
```
Create your environment variables file by copying the example:
```bash
copy .env.example .env
```
Start the frontend development server:
```bash
npm run dev
```

## 📁 Project Structure
- `/FrontEnd/web`: Contains the React.js client application.
- `/Backend`: Contains the Node.js/Express server and MongoDB models.

## 📄 License
This project is licensed under the ISC License.
