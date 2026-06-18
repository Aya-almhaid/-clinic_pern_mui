# ClinicCare — Clinic Management System

A full-stack clinic management web application built with the **PERN stack** (PostgreSQL, Express, React, Node.js) and **Material UI v9**.

---

## Overview

ClinicCare supports three user roles with distinct capabilities:

| Role    | Key Capabilities |
|---------|-----------------|
| Patient | Book appointments, view medical records & prescriptions, submit feedback |
| Doctor  | Role-specific dashboard, manage appointments, create records & prescriptions, moderate feedback |
| Admin   | Live stats dashboard, manage all users and doctors, moderate feedback, full system access |

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 19 + Vite 8, React Router v7, Material UI v9, Axios |
| Backend   | Node.js, Express 5, JWT authentication, bcryptjs |
| Database  | PostgreSQL (via `pg` connection pool) |
| Auth      | JWT (7-day tokens), role-based access control |

---

## Project Structure

```
clinic_pern_mui/
├── server/
│   ├── Config/         # PostgreSQL connection pool
│   ├── controllers/    # Business logic (7 modules)
│   ├── middleware/     # JWT auth, role guards, validation, error handler
│   ├── models/         # Parameterized SQL queries (7 modules)
│   ├── routes/         # Express routers (8 modules)
│   ├── db/schema.sql   # Full database schema
│   ├── seed.js         # Demo data seeder
│   └── index.js        # Express entry point
│
└── client/src/
    ├── api/client.js   # Axios instance with auto Bearer token
    ├── components/     # Layout, ProtectedRoute, RequireRole
    ├── context/        # AuthContext (global auth state)
    ├── hooks/          # useFetch, useSubmit
    ├── pages/          # 20 page components
    └── theme.js        # MUI color theme
```

---

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+

---

## Setup

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```env
CONNECTION_STRING=postgresql://postgres:<your_password>@localhost:5432/clinic_pern_mui
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 3. Create the database schema

```bash
psql -U postgres -d clinic_pern_mui -f server/db/schema.sql
```

### 4. Seed demo data

```bash
cd server
node seed.js
```

### 5. Start the application

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:5175)
cd client && npm run dev
```

Open [http://localhost:5175](http://localhost:5175) in your browser.

---

## Demo Accounts

| Role    | Email             | Password | Name         |
|---------|-------------------|----------|--------------|
| Admin   | admin@clinic.com  | 123456   | Admin User   |
| Doctor  | sara@clinic.com   | 123456   | Doctor Sara  |
| Doctor  | aya@clinic.com    | 123456   | Aya Almhaid  |
| Patient | lolo@gmail.com    | 123456   | lolo         |

---

## Feature Matrix

| Feature                         | Patient | Doctor | Admin |
|--------------------------------|:-------:|:------:|:-----:|
| Role-specific dashboard         | ✓       | ✓      | ✓     |
| View doctors list               | ✓       | ✓      | ✓     |
| Book appointment                | ✓       |        |       |
| Cancel own appointment          | ✓       |        |       |
| Reschedule own appointment      | ✓       |        |       |
| View own appointments           | ✓       | ✓      | ✓     |
| Confirm / complete appointment  |         | ✓      | ✓     |
| Create medical record           |         | ✓      |       |
| Add follow-up notes to record   |         | ✓      | ✓     |
| View own medical records        | ✓       |        |       |
| Add prescription                |         | ✓      |       |
| View prescriptions              | ✓       | ✓      |       |
| Submit feedback                 | ✓       | ✓      | ✓     |
| Moderate feedback               |         | ✓      | ✓     |
| Manage users                    |         |        | ✓     |
| Manage doctors                  |         |        | ✓     |
| View live clinic stats          |         |        | ✓     |

---

## Dashboards

### Patient Dashboard
- Quick access cards linking to: Book Appointment, My Records, Prescriptions, Submit Feedback

### Doctor Dashboard
- **Stats**: Upcoming / Today / Completed / Cancelled appointment counts
- **Today's Appointments**: list of appointments scheduled for today
- **Upcoming Appointments**: next 5 upcoming with patient name and time
- **Quick Access**: Prescriptions, New Medical Record, Appointments, Moderate Feedback

### Admin Dashboard
- **Stats cards**: Total Patients, Total Doctors, Total Appointments, Pending Feedback
- **Recent Appointments**: table of last 5 appointments with patient, doctor, time, and status
- **Quick Access**: Manage Users, Manage Doctors, Moderate Feedback, Appointments

---

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint    | Auth | Description |
|--------|-------------|------|-------------|
| POST   | `/register` | No   | Register a new patient account |
| POST   | `/login`    | No   | Login and receive a JWT token |

### Users — `/api/users`

| Method | Endpoint    | Auth     | Description |
|--------|-------------|----------|-------------|
| GET    | `/me`       | Any role | Get own profile |
| PATCH  | `/me`       | Any role | Update profile or change password |
| GET    | `/patients` | Any role | List all patients |
| GET    | `/`         | Admin    | List all users |
| GET    | `/:id`      | Admin    | Get user by ID |
| DELETE | `/:id`      | Admin    | Delete user |

### Patients — `/api/patients`

| Method | Endpoint | Auth     | Description |
|--------|----------|----------|-------------|
| GET    | `/`      | Any role | List all patients (used for record creation) |

### Doctors — `/api/doctors`

| Method | Endpoint | Auth  | Description |
|--------|----------|-------|-------------|
| GET    | `/`      | No    | List all doctors (`?specialty=` filter) |
| GET    | `/:id`   | No    | Get doctor profile |
| POST   | `/`      | Admin | Promote existing user to doctor |
| PATCH  | `/:id`   | Admin | Update doctor specialty/bio |

### Appointments — `/api/appointments`

| Method | Endpoint          | Auth    | Description |
|--------|-------------------|---------|-------------|
| POST   | `/`               | Patient | Book appointment |
| GET    | `/me`             | Any     | Get own appointments (admin gets all) |
| PATCH  | `/:id/status`     | Any     | Change status (role-restricted) |
| PATCH  | `/:id/reschedule` | Patient | Reschedule to a future date |

### Medical Records — `/api/records`

| Method | Endpoint          | Auth           | Description |
|--------|-------------------|----------------|-------------|
| POST   | `/`               | Doctor         | Create medical record |
| GET    | `/me`             | Patient        | Get own records |
| GET    | `/patient/:id`    | Doctor / Admin | Get any patient's records |
| GET    | `/:id`            | Patient/Doctor | Get record (ownership enforced) |
| GET    | `/:id/notes`      | Patient/Doctor | Get follow-up notes |
| POST   | `/:id/notes`      | Doctor         | Add follow-up note |

### Prescriptions — `/api/prescriptions`

| Method | Endpoint       | Auth           | Description |
|--------|----------------|----------------|-------------|
| POST   | `/`            | Doctor         | Create prescription |
| GET    | `/me`          | Patient/Doctor | Patient: own prescriptions. Doctor: prescriptions they wrote |
| GET    | `/record/:id`  | Patient/Doctor | Get prescriptions for a specific record |

### Feedback — `/api/feedback`

| Method | Endpoint      | Auth           | Description |
|--------|---------------|----------------|-------------|
| GET    | `/approved`   | No             | Get approved feedback (public) |
| POST   | `/`           | Any role       | Submit feedback |
| GET    | `/me`         | Any role       | Get own feedback submissions |
| GET    | `/`           | Doctor / Admin | Get all feedback |
| PATCH  | `/:id/status` | Doctor / Admin | Approve or reject feedback |

---

## Database Schema

```
users           — id, name, email, password_hash, role (patient|doctor|admin), phone, created_at
doctors         — id, user_id (FK→users), specialty, license_number, bio, created_at
appointments    — id, patient_id (FK→users), doctor_id (FK→doctors), scheduled_at,
                  status (pending|confirmed|cancelled|completed), reason, created_at
medical_records — id, appointment_id (FK→appointments, nullable), patient_id, doctor_id,
                  diagnosis, notes, created_at
prescriptions   — id, record_id (FK→medical_records), medication, dosage, instructions,
                  duration, created_at
record_notes    — id, record_id (FK→medical_records), author_id (FK→users), note, created_at
feedback        — id, user_id (FK→users), rating (1-5), comment,
                  status (pending|approved|rejected), moderated_by (FK→users), created_at
```

---

## Pages

| Page               | Route                  | Access          |
|--------------------|------------------------|-----------------|
| Landing            | `/`                    | Public          |
| Home               | `/home`                | Public          |
| About              | `/about`               | Public          |
| Contact            | `/contact`             | Public          |
| Public Feedbacks   | `/feedbacks`           | Public          |
| Login              | `/login`               | Public          |
| Register           | `/register`            | Public          |
| Dashboard          | `/dashboard`           | All roles       |
| Profile            | `/profile`             | All roles       |
| Doctors            | `/doctors`             | All roles       |
| Appointments       | `/appointments`        | All roles       |
| Book Appointment   | `/appointments/book`   | Patient         |
| My Records         | `/records`             | Patient         |
| Record Detail      | `/records/:id`         | Patient / Doctor|
| New Record         | `/records/new`         | Doctor          |
| Prescriptions      | `/prescriptions`       | Patient / Doctor|
| Submit Feedback    | `/feedback/submit`     | All roles       |
| Moderate Feedback  | `/admin/feedback`      | Doctor / Admin  |
| Manage Users       | `/admin/users`         | Admin           |
| Manage Doctors     | `/admin/doctors`       | Admin           |

---

## Demo Walkthrough

### As a Patient (lolo@gmail.com / 123456)
1. Login → Dashboard shows quick-access cards
2. **Book Appointment** → pick a doctor, choose a date and reason
3. **Appointments** → view status, cancel a pending booking
4. **My Records** → view diagnoses created by doctors
5. **Prescriptions** → see all medications prescribed
6. **Submit Feedback** → rate the clinic 1–5 stars

### As a Doctor (sara@clinic.com / 123456)
1. Login → Dashboard shows today's appointments, upcoming list, and stats
2. **Appointments** → confirm pending → mark completed after the visit
3. **New Record** → select a patient from the dropdown, enter diagnosis and notes
4. **Prescriptions** → view all prescriptions you have written (with patient names)
5. **Moderate Feedback** → approve or reject patient submissions

### As an Admin (admin@clinic.com / 123456)
1. Login → Dashboard shows live stats: patients, doctors, appointments, pending feedback
2. **Recent Appointments** table on dashboard
3. **Manage Users** → view all users by role, delete accounts
4. **Manage Doctors** → add an existing patient as a doctor
5. **Moderate Feedback** → approve or reject feedback

---

## Known Limitations

- Contact form does not persist messages to the database (UI-only confirmation)
- No email notifications for appointment changes
- No token refresh (tokens expire after 7 days — users must log in again)
- No pagination on list endpoints
- CORS is open to all origins (restrict in production)

---

## Author

Built as a final project for the Full Stack Development Course.
