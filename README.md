# 🩺 MedFinder — Smart Medicine Stock Locator

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

MedFinder is a premium, real-time medicine availability search and reservation platform. It bridges the gap between local pharmacies and customers, letting users search for medicines, see exact local distances (e.g., 50m, 100m, 10m), and reserve stocks instantly.

---

## 🌟 Key Features

### 👤 Customer Experience
* **🔍 Smart Search Engine:** Instantly search medicines by name, chemical composition, category, or manufacturer.
* **📍 Geolocation Mapping:** Automatically detects user coordinates to display pharmacies near Chennai (Adyar, Tambaram, etc.) with real distances.
* **🛡️ Secure Online Reservations:** Lock in your medicine stock instantly. Shows a success ticket inside the modal upon completion.
* **📱 Verification QR Codes:** Displays a secure counter verification QR code for instant pickup.
* **📄 PDF Receipt Downloads:** Download structured PDF invoices directly from the browser.

### 💼 Pharmacy Owner Portal
* **📈 Stats Dashboard:** Monitor active orders, inventory levels, and overall sales analytics.
* **📦 Stock Control Manager:** Add, edit, or delete items. Features a **File Upload** option to select and display real medicine images.
* **📋 Reservation Handler:** Confirm, set to "ready for pickup", or collect reservation orders in real-time.

---

## 🛠️ Tech Stack

* **Frontend:** React, Tailwind CSS, Vite, TanStack Query, Framer Motion, Lucide Icons, React Hook Form
* **Backend:** Node.js, Express.js, JWT Auth, QRCode generator, PDFKit
* **Database:** MongoDB, Mongoose ODM

---

## ⚙️ Local Setup Instructions

### 1. Backend Configuration
Navigate to the `backend` folder, create a `.env` file, and configure the variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_jwt_key
NODE_ENV=development
```

### 2. Frontend Configuration
Navigate to the `frontend` folder, create a `.env` file, and add:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Run Development Servers
In the root directory, run:
```bash
# Install dependencies for all directories
npm run install:all

# Seed initial database records
npm run seed

# Start both frontend and backend concurrently
npm run dev
```

---

## 🚀 Deployment

* **Backend:** Deploy `backend` root on **Render.com** (as a Web Service) with env variables `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`.
* **Frontend:** Deploy `frontend` root on **Vercel** with env variable `VITE_API_BASE_URL` pointing to your Render backend API.
