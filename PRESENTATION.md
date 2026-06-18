# ClinicCare — Instructor Presentation Plan

---

## 1. Introduction (2 min)
- State the problem: clinics need a system to manage patients, doctors, appointments, records, and prescriptions
- State your solution: a full-stack multi-role web app
- Briefly mention the tech stack: **PostgreSQL → Express → React → Node.js + Material UI**

---

## 2. Architecture Overview (3 min)

Describe the 3-layer structure:

- **Frontend** — React 19 + Vite + MUI, React Router v7, Axios, AuthContext, custom hooks (`useFetch`, `useSubmit`)
- **Backend** — Express MVC (routes → controllers → models), JWT auth, validation middleware, error handler
- **Database** — 7 PostgreSQL tables with FK relationships (show `schema.sql` briefly)

---

## 3. Live Demo (10–12 min)

Run `node seed.js` first so demo data is ready. Open the app at `http://localhost:5173`.

| Step | Action | What it shows |
|------|--------|---------------|
| 1 | Login as **Patient** (`john@clinic.com` / `Patient123`) | Auth flow, JWT, role-based dashboard |
| 2 | Book an appointment (pick Dr. Sarah, future date) | Patient workflow, form validation |
| 3 | View My Records + Prescriptions | Data relationships (records → prescriptions) |
| 4 | Submit feedback (5 stars) | Feedback flow |
| 5 | Logout → Login as **Doctor** (`dr.sarah@clinic.com` / `Doctor123`) | Role switching |
| 6 | Dashboard shows upcoming appointments stats | Doctor dashboard |
| 7 | Confirm a pending appointment | Status change, role-restricted action |
| 8 | Create a New Record (select patient from dropdown) | Doctor creates medical data |
| 9 | Moderate Feedback (approve the one John submitted) | Moderation flow |
| 10 | Logout → Login as **Admin** (`admin@clinic.com` / `Admin123`) | Admin role |
| 11 | Manage Users (show role filter) | Admin user management |
| 12 | Manage Doctors (show add-doctor form) | Admin promotes a user |

---

## 4. Security & Code Quality Highlights (3 min)

- **JWT auth** with role-based middleware (`requireRole('doctor', 'admin')`)
- **Input validation middleware** on register, login, appointment, and feedback routes
- **Authorization fixes**: reschedule endpoint checks patient ownership; record notes enforce doctor/patient ownership
- **Global error handler** middleware
- **Reusable hooks** (`useFetch`, `useSubmit`) reduce code duplication across 20 pages

---

## 5. Database Design (2 min)

Show `server/db/schema.sql` — highlight:
- 7 tables with cascading foreign keys
- Role enum (`patient`, `doctor`, `admin`) on the `users` table
- `feedback.status` moderation flow (pending → approved → rejected)

---

## 6. Challenges You Solved (2 min)

- Role-based access on both **frontend** (`RequireRole` component) and **backend** (`requireRole` middleware) — defense in depth
- Shared `users` table for all roles with a separate `doctors` profile table extending it
- JWT token stored in localStorage with Axios request interceptor auto-attaching it to every API call

---

## 7. Wrap-Up (1 min)

- Show the `README.md` — setup guide, API reference, demo accounts table
- Mention what you would add next: email notifications, token refresh, pagination, deployment

---

## Before the Presentation — Checklist

- [ ] Run `node server/seed.js` to reset demo data
- [ ] Start backend: `npm run dev` inside `server/`
- [ ] Start frontend: `npm run dev` inside `client/`
- [ ] Confirm all 3 role logins work
- [ ] Have `README.md` open in a second tab as reference
