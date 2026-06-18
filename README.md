# 🩺 MedFinder — Smart Medicine Stock Locator & Reservation Platform

<p align="center">
  <a href="https://medfinder-m.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Demo-medfinder--m.vercel.app-4f46e5?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/prasathr0811/Medfinder">
    <img src="https://img.shields.io/github/stars/prasathr0811/Medfinder?style=social" alt="Stars" />
  </a>
  <a href="https://github.com/prasathr0811/Medfinder/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/prasathr0811/Medfinder?style=flat-square" alt="License" />
  </a>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind" />
</p>

---

## 📖 Introduction

**MedFinder** is a modern, real-time medicine availability search and reservation platform. It bridges the gap between local pharmacies and customers, letting users search for medicines, compare prices, view pharmacy details with realistic local distances, and reserve stocks instantly.

---

## 🗺️ Table of Contents

1. [Key Features](#-key-features)
2. [Tech Stack](#-tech-stack)
3. [System Architecture](#-system-architecture)
4. [Local Installation](#-local-installation)
5. [API Routes](#-api-routes)
6. [Deployment Details](#-deployment-details)

---

## 🌟 Key Features

### 👤 Customer Features
* **🔍 Smart Search Engine:** Instant, case-insensitive search by name, composition, category, or manufacturer.
* **📍 Geolocation Mapping:** Automatically maps realistic local distances (e.g., 50m, 100m, 10m) from the user's location to partner Chennai pharmacies.
* **🛡️ Secure Online Reservations:** Lock in your medicine stock instantly. Shows a success ticket with details inside the modal upon completion.
* **📱 Verification QR Codes:** Displays a secure counter verification QR code for instant pickup.
* **📄 PDF Invoices:** Generate and download structured PDF receipts directly from the web application.

### 💼 Pharmacy Owner Portal
* **📈 Stats Dashboard:** Monitor active orders, inventory levels, and overall sales analytics.
* **📦 Inventory Manager:** Add, edit, or delete items. Features a **File Upload** option to select and display real medicine images.
* **📋 Reservation Handler:** Confirm, set to "ready for pickup", or collect reservation orders in real-time.

---

## 🛠️ Tech Stack

| Frontend | Backend | Database & Deploy |
|---|---|---|
| • React (Vite) | • Node.js | • MongoDB (Atlas) |
| • Tailwind CSS | • Express.js | • Vercel (Frontend) |
| • TanStack Query | • JWT Auth | • Render (Backend) |
| • Framer Motion | • PDFKit & QRCode | |

---

## ⚙️ Local Installation

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed locally.

### 2. Clone the Repository
```bash
git clone https://github.com/prasathr0811/Medfinder.git
cd Medfinder
```

### 3. Backend Setup
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medfinder
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```
Install backend dependencies:
```bash
cd backend
npm install
```

### 4. Frontend Setup
Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 5. Seeding & Running
Go to the root folder and run:
```bash
# Seed initial Chennai pharmacies and medicines
npm run seed

# Run both frontend & backend concurrently
npm run dev
```

---

## 📡 API Routes

### Authentication
* `POST /api/auth/register` - Register a new user (Customer/Owner)
* `POST /api/auth/login` - Authenticate user & get token

### Medicines & Pharmacy
* `GET /api/medicines` - Search and filter medicines with location coordinates
* `GET /api/medicines/:id` - Get single medicine details
* `POST /api/medicines/pharmacy` - Register pharmacy profile (Owner)
* `POST /api/medicines` - Add medicine to inventory (Owner)
* `PUT /api/medicines/:id` - Update inventory listing (Owner)
* `DELETE /api/medicines/:id` - Delete inventory listing (Owner)

### Reservations
* `POST /api/reservations` - Create a medicine reservation (Customer)
* `GET /api/reservations/customer` - Get all reservations for logged-in customer
* `GET /api/reservations/pharmacy` - Get all reservations for pharmacy (Owner)
* `PATCH /api/reservations/:id/status` - Update reservation status (Cancel/Confirm/Ready/Collected)
* `GET /api/reservations/:id/receipt` - Download PDF receipt

---

## 🚀 Deployment Details

### Backend (Render)
* **Root Directory:** `backend`
* **Build Command:** `npm install`
* **Start Command:** `node server.js`
* **Env Variables Required:** `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`

### Frontend (Vercel)
* **Root Directory:** `frontend`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Env Variables Required:** `VITE_API_BASE_URL=https://your-backend.onrender.com/api`
