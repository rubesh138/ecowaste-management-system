# Smart Waste Collection and Recycling Management System (EcoWaste)

A modern, production-quality full-stack digital waste management and recycling platform connecting **Citizens** and **Municipal Administrators**.

---

## 🌿 Project Overview

The Smart Waste Collection and Recycling Management System automates residential recyclable waste pickups, transparently tracks municipal collection workflows, handles citizen complaints, and records industrial recycling outputs to generate real-time sustainability analytics.

### Core Workflow:
```
Citizen submits request 
  ➔ Saved in MongoDB 
  ➔ Admin receives real-time DB notification 
  ➔ Admin accepts / schedules pickup 
  ➔ Citizen receives notification 
  ➔ Municipal fleet collects waste 
  ➔ Status marked Completed 
  ➔ Admin records recycling conversion record 
  ➔ Analytics & recovery charts updated
```

---

## 🚀 Technology Stack

### Frontend:
- **React.js 18** (Vite + TypeScript)
- **Tailwind CSS** (Custom Emerald & Forest Green sustainability design system)
- **React Router DOM v7**
- **Axios** (With JWT interceptor & error handling)
- **Lucide React** (Consistent modern icon set)
- **Recharts** (Interactive data charts & velocity trends)

### Backend:
- **Node.js** & **Express.js** (REST API architecture)
- **MongoDB** & **Mongoose**
- **JWT (JSON Web Tokens)** for role-based authentication
- **bcryptjs** for secure password hashing
- **CORS**, **dotenv**, **morgan**

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@smartwaste.gov` | `admin123` | Master control, dispatch, analytics, recycling, users |
| **Citizen (Alex)** | `citizen@gmail.com` | `citizen123` | Booking requests, complaints, notifications, guide |
| **Citizen (Sarah)** | `sarah.green@gmail.com` | `citizen123` | Booking requests, complaints, notifications, guide |

> **Tip**: The login page includes convenient **1-Click Quick Demo Login** buttons to easily switch between Citizen and Admin roles during testing!

---

## 📁 Repository Structure

```
smart waste management/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js       # Auth, registration, profile & password
│   │   ├── requestController.js    # Waste collection CRUD & workflow status
│   │   ├── complaintController.js  # Citizen grievance management
│   │   ├── recyclingController.js  # Industrial recycling logs & calculations
│   │   ├── notificationController.js # Real-time DB notification system
│   │   ├── userController.js       # Citizen directory & access controls
│   │   ├── categoryController.js   # Waste stream categories
│   │   └── analyticsController.js  # Recharts summary aggregations
│   ├── models/
│   │   ├── User.js
│   │   ├── WasteCategory.js
│   │   ├── WasteRequest.js
│   │   ├── Complaint.js
│   │   ├── RecyclingRecord.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── recyclingRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── analyticsRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT validation
│   │   ├── roleMiddleware.js       # Admin / Citizen role guards
│   │   └── errorMiddleware.js      # Global error and 404 handler
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── notificationHelper.js
│   ├── seed.js                     # Complete database seeder
│   ├── server.js                   # Express server entry point
│   ├── package.json
│   └── .env
└── frontend/
    ├── public/
    │   └── favicon.svg
    ├── src/
    │   ├── components/
    │   │   ├── common/             # Navbar, Sidebar, StatusBadge, Timeline, Modal, etc.
    │   │   ├── layout/             # Responsive AppLayout with sidebar
    │   │   └── ProtectedRoute.tsx  # Route guard for Citizen & Admin
    │   ├── context/
    │   │   └── AuthContext.tsx     # Session management & user state
    │   ├── pages/
    │   │   ├── Landing.tsx         # Modern sustainability landing page
    │   │   ├── Login.tsx           # Login with 1-click demo filler
    │   │   ├── Register.tsx        # Citizen registration form
    │   │   ├── Unauthorized.tsx    # 403 Access Denied page
    │   │   ├── NotFound.tsx        # 404 Not Found page
    │   │   ├── citizen/            # Citizen portal (Dashboard, CreateRequest, MyRequests, RequestDetails, Complaints, RecyclingInfo, Notifications, Profile)
    │   │   └── admin/              # Admin portal (Dashboard, Requests, Complaints, Recycling, Users, Categories, Analytics, Notifications, Profile)
    │   ├── services/               # Modular Axios API services
    │   ├── types/                  # TypeScript data interfaces
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css               # Tailwind & glassmorphism utilities
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── .env
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local MongoDB server or MongoDB Atlas URI (Default: `mongodb://127.0.0.1:27017/smart_waste_db`)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo admin, citizens, requests, complaints, recycling records
npm run dev      # Starts API server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite React on http://localhost:5173
```

---

## 📡 REST API Documentation

### Auth:
- `POST /api/auth/register` - Citizen registration
- `POST /api/auth/login` - User login & JWT issuance
- `GET /api/auth/me` - Current authenticated user
- `PUT /api/auth/profile` - Update name, phone, address
- `PUT /api/auth/change-password` - Change password

### Requests:
- `POST /api/requests` - Submit waste collection request (triggers admin notification)
- `GET /api/requests` - List requests (filtered by status/search)
- `GET /api/requests/:id` - Get request details & timeline
- `PUT /api/requests/:id` - Update pending request
- `DELETE /api/requests/:id` - Cancel pending request
- `PUT /api/requests/:id/accept` - Admin accepts request
- `PUT /api/requests/:id/reject` - Admin rejects request with reason
- `PUT /api/requests/:id/schedule` - Admin schedules pickup date
- `PUT /api/requests/:id/status` - Admin updates lifecycle status

### Complaints:
- `POST /api/complaints` - Citizen files service grievance
- `GET /api/complaints` - List complaints
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Admin updates status & resolution note

### Recycling:
- `GET /api/recycling` - List batches and calculate recovery rate
- `POST /api/recycling` - Log industrial recycling batch
- `PUT /api/recycling/:id` - Edit recycling record
- `DELETE /api/recycling/:id` - Delete record

### Analytics:
- `GET /api/analytics/dashboard` - Summary KPIs for dashboard cards
- `GET /api/analytics/requests` - Status breakdown & daily velocity
- `GET /api/analytics/waste` - Waste by category & monthly volume
- `GET /api/analytics/recycling` - Recycling method breakdown

### Users & Categories:
- `GET /api/users` - Admin user directory
- `PUT /api/users/:id/status` - Toggle active/inactive account
- `GET /api/categories` - List active waste categories
- `POST /api/categories` - Admin creates new category

---

## 🌐 Complete Verified User Journey

1. **Visit Landing Page** at `http://localhost:5173/`
2. **Citizen Registration / Login**: Click "Sign In" or "Demo Citizen"
3. **Submit Request**: Navigate to "Create Request", choose Plastic (15 kg), select preferred collection date, and submit.
4. **Instant Admin Alert**: Log in as Admin (`admin@smartwaste.gov`), check Notification dropdown, click new request.
5. **Accept & Schedule**: Admin clicks "Accept", schedules pickup date, and adds admin note.
6. **Citizen Status Update**: Citizen receives real-time alert and views updated visual lifecycle timeline.
7. **Complete Collection**: Admin marks request as "Collected" then "Completed".
8. **Record Recycling**: Admin logs a recycling batch (15 kg Plastic converted into rPET pellets).
9. **Real-time Analytics**: Admin opens Analytics to view updated charts and recycling percentage.
10. **Grievance Resolution**: Citizen reports missed collection ➔ Admin updates status to "Resolved" with response.

---

## 🔒 Security
- Bcrypt password hashing (10 salt rounds)
- Stateless JWT verification with expiration
- Role-based authorization middleware (`adminOnly`, `citizenOnly`)
- Passwords stripped in database queries
- Strict CORS protection
