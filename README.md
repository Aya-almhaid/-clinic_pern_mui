# ClinicCare — Full Stack Clinic Management System

A full-stack web application for managing a medical clinic. Built with the PERN stack (PostgreSQL, Express, React, Node.js) and Material UI.

---

## Features

- **3 Roles:** Patient, Doctor, Admin — each with their own dashboard and permissions
- **JWT Authentication** — secure login and register with password hashing (bcrypt)
- **Appointment Booking** — patients book appointments, doctors confirm or complete them
- **Medical Records** — doctors create records, patients view their history
- **Prescriptions** — attached to medical records, viewable by the patient
- **Feedback System** — patients submit feedback, doctors/admins approve or reject it
- **Profile Management** — any user can update their name, email, phone, and password
- **Admin Controls** — manage all users, promote patients to doctors
- **Search & Filter** — search doctors by name or specialty, filter users by role

---

## Technologies Used

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| UI Library | Material UI (MUI) v9 |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 16 |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| HTTP Client | Axios |
| DB Driver | node-postgres (pg) |

---

## Project Structure

```
clinic_pern_mui/
├── server/
│   ├── Config/         # Database connection pool
│   ├── controllers/    # Request handlers (business logic)
│   ├── middleware/      # JWT auth + role guards
│   ├── models/         # SQL queries
│   ├── routes/         # Express routers
│   ├── db/             # schema.sql
│   ├── seed.js         # Seed test data
│   └── index.js        # Entry point
│
└── client/
    └── src/
        ├── api/        # Axios client with auto Bearer token
        ├── components/ # Layout, ProtectedRoute, RequireRole
        ├── context/    # AuthContext (global auth state)
        ├── pages/      # One file per page/route
        └── theme.js    # MUI color theme
```

---

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd clinic_pern_mui
```

### 2. Set up the database
- Open pgAdmin and create a database named `clinic_pern_mui`
- Run the schema:
```bash
psql -U postgres -d clinic_pern_mui -f server/db/schema.sql
```

### 3. Configure environment variables
Create `server/.env`:
```
CONNECTION_STRING=postgresql://postgres:YOUR_PASSWORD@localhost:5432/clinic_pern_mui
PORT=5000
JWT_SECRET=your_secret_key
```

### 4. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 5. Seed the database (test users)
```bash
cd server
node seed.js
```
This creates 3 test accounts (password for all: `123456`):
| Email | Role |
|---|---|
| admin@clinic.com | Admin |
| sara@clinic.com | Doctor |
| omar@clinic.com | Patient |

### 6. Run the application
**Terminal 1 — Backend:**
```bash
cd server
node index.js
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/users/me | Any logged-in user |
| PATCH | /api/users/me | Any logged-in user |
| GET | /api/users | Admin only |
| DELETE | /api/users/:id | Admin only |
| GET | /api/doctors | Public |
| POST | /api/doctors | Admin only |
| POST | /api/appointments | Patient only |
| GET | /api/appointments/me | Any logged-in user |
| PATCH | /api/appointments/:id/status | Role-based |
| POST | /api/records | Doctor only |
| GET | /api/records/me | Patient only |
| GET | /api/prescriptions/me | Patient only |
| GET | /api/feedback/approved | Public |
| POST | /api/feedback | Any logged-in user |
| PATCH | /api/feedback/:id/status | Doctor or Admin |

---

## Pages

| Page | Route | Who can access |
|---|---|---|
| Landing | / | Public |
| Home | /home | Public |
| About | /about | Public |
| Contact | /contact | Public |
| Feedbacks | /feedbacks | Public |
| Login | /login | Public |
| Register | /register | Public |
| Dashboard | /dashboard | All roles |
| Profile | /profile | All roles |
| Services/Doctors | /doctors | All roles |
| Appointments | /appointments | All roles |
| Book Appointment | /appointments/book | Patient |
| My Records | /records | Patient |
| Record Detail | /records/:id | Patient |
| Prescriptions | /prescriptions | Patient |
| Submit Feedback | /feedback/submit | All roles |
| New Record | /records/new | Doctor |
| Moderate Feedback | /admin/feedback | Doctor, Admin |
| Manage Users | /admin/users | Admin |
| Manage Doctors | /admin/doctors | Admin |

---

## Author

Built as a final project for the Full Stack Development Course.
