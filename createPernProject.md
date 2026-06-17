# Build Your Own PERN + MUI Clinic System — Step-by-Step Guide

This is a guide **for you to follow** to build a brand-new project (separate
from `clinical_System`) that satisfies the Final Project rubric: React +
Node/Express + PostgreSQL, **Material UI only**, 3 roles
(Admin/User/Moderator), a Feedback system with approval workflow, a
Service/Product request-approval ("reservation") system, the required public
pages, and a clean GitHub workflow.

**How to use it:** work through the numbered steps in order. For each step,
open the referenced file(s) in this repo (`clinical_System`) — they're
working, tested implementations of that exact pattern — read them, and
adapt/copy them into your new project. Test each step before moving to the
next.

**Role mapping** (also documented in `ROADMAP.md`): `patient` = **User**,
`doctor` = **Moderator**, `admin` = **Admin**. "Services" = doctors/
specialties, "Reservation" = the appointment booking flow.

---

## Part A — Project setup

### Step 1 — Folder structure
Create a new project directory with:
```
clinic-pern-mui/
  server/
  client/
```

### Step 2 — Backend init
```
cd server
npm init -y
npm install express pg dotenv cors bcryptjs jsonwebtoken
```
Edit `package.json`:
- Add `"type": "module"`.
- Add scripts: `"dev": "node --watch index.js"`, `"start": "node index.js"`.

### Step 3 — Frontend init
```
npm create vite@latest client -- --template react
cd client
npm install
npm install react-router-dom axios
```

### Step 4 — Install MUI
```


---

## Part B — Database

### Step 5 — Create the database
```
psql -U postgres -c "CREATE DATABASE clinic_pern_mui;"
```
### Step 6 — Schema (all 7 tables, including Feedback from day one)
Reference: `server/db/schema.sql`. Copy it into your `server/db/schema.sql`
— it already defines `users`, `doctors`, `appointments`, `medical_records`,
`prescriptions`, `record_notes`, and `feedback` with the correct foreign keys
andHECK` constraints. Apply it:
```
psql -U postgres -d clinic_pern_mui -f server/db/schema.sql
```
Building `feedback` in from the start (rather than bolting it on later)
avoids reworking your role/permission logic twice.

### Step 7 — Connection config
Reference: `server/Config/connectPool.js`, `server/.env`. Create
`server/.env`:
```
cd
```
Create `server/Config/connectPool.js` using the same `pg.Pool` +
`dotenv.config()` pattern, exporting both `pool` and a `connectDB()`
function.

---

## Part C — Backend, one resource at a time

For every resource: **model** (`pool.query` functions) → **controller**
(req/res handlers calling the model) → **routes** (Express `Router`, wires
`verifyToken`/`requireRole`) → mount in `index.js`. Test with curl
(`register` → `login` → call the endpoint with
`Authorization: Bearer <token>`) before moving on.

### Step 8 — Auth middleware
Reference: `server/middleware/auth.middleware.js`.
- `verifyToken` — reads `Authorization: Bearer <jwt>`, verifies with
  `JWT_SECRET`, attaches the payload to `req.user`.
- `requireRole(...roles)` — 403 if `req.user.role` isn't in the list.

### Step 9 — Auth (register/login)
Reference: `server/models/auth.model.js`,
`server/controllers/auth.controller.js`, `server/routes/auth.routes.js`.
- `register` hashes the password with `bcryptjs`, always inserts with
  `role='patient'` (never let the client pick a role), signs a JWT
  `{ id, role }`.
- `login` does `bcrypt.compare`, signs the same JWT shape, `401` on mismatch.
- Mount `POST /api/auth/register`, `POST /api/auth/login`.

### Step 10 — Users (profile + admin management)
Reference: `server/models/user.Model.js`,
`server/controllers/user.controller.js`, `server/routes/user.routes.js`.
- `GET /api/users/me`, `PATCH /api/users/me` — target user comes from
  `req.user.id` (never a URL param), so users can only ever touch their own
  profile.
- `GET /api/users`, `GET /api/users/:id`, `DELETE /api/users/:id` — admin
  only.

### Step 11 — Doctors ("Services")
Reference: `server/models/doctors.Model.js`,
`server/controllers/doctor.controller.js`, `server/routes/doctor.routes.js`.
- `GET /api/doctors` (optional `?specialty=`), `GET /api/doctors/:id` —
  public, no auth.
- `POST /api/doctors`, `PATCH /api/doctors/:id` — admin only; creating a
  doctor profile also promotes that user's `role` to `doctor`
  (`updateUserRole`).
- In your frontend this becomes the **Services** page.

### Step 12 — Appointments (the "Reservation"/request-approval system)
Reference: `server/models/appointment.model.js`,
`server/controllers/appointment.controller.js`,
`server/routes/appointment.routes.js`.
- `POST /api/appointments` (patient/User) — inserts with `status='pending'`.
  This is the **request**.
- `GET /api/appointments/me` — role-branches: a patient's own bookings, a
  doctor's schedule, or every appointment for an admin.
- `PATCH /api/appointments/:id/status` — admin or the assigned
  doctor/Moderator can set any status; the booking patient/User may only
  cancel. This is the **approval**.
- `PATCH /api/appointments/:id/reschedule`.

This flow *is* the rubric's "system to request a service, which then needs
to be approved" — once it's built, you don't need a separate
products/reservation system.

### Step 13 — Medical records + follow-up notes
Reference: `server/models/medicalRecord.model.js`,
`server/controllers/medicalRecord.controller.js`,
`server/routes/medicalRecord.routes.js`.
- `POST /api/records` (doctor/Moderator), `GET /api/records/me` (patient/
  User), `GET /api/records/patient/:patientId` (doctor/admin), `GET
  /api/records/:id` — ownership check inline (owning patient, authoring
  doctor, or admin).
- Follow-up notes: `GET /api/records/:id/notes`, `POST
  /api/records/:id/notes`.

### Step 14 — Prescriptions
Reference: `server/models/prescription.model.js`,
`server/controllers/prescription.controller.js`,
`server/routes/prescription.routes.js`.
- `POST /api/prescriptions` (doctor, must be the record's authoring doctor),
  `GET /api/prescriptions/me` (patient), `GET
  /api/prescriptions/record/:recordId` (same ownership check as records).

### Step 15 — Feedback (approval workflow)
Reference: `server/models/feedback.model.js`,
`server/controllers/feedback.controller.js`,
`server/routes/feedback.routes.js` — built fresh this session, copy as-is.
- `POST /api/feedback` (any logged-in role, `{ rating: 1-5, comment }`,
  always starts `status='pending'`).
- `GET /api/feedback/approved` — public, no auth. Used by Home/Feedbacks
  pages.
- `GET /api/feedback/me` — caller's own submissions + status.
- `GET /api/feedback` + `PATCH /api/feedback/:id/status` — doctor/Moderator
  or admin moderation queue (`status` → `approved`/`rejected`).

### Step 16 — index.js
Reference: `server/index.js`. `express()`, `cors()`, `express.json()`, mount
every router under `/api/...`, then `connectDB().then(() =>
app.listen(PORT))`.

**Checkpoint:** your backend now covers the rubric's Architecture, Backend
security (JWT + role + ownership checks), and DB design (7 related tables
with FKs/CHECK constraints) criteria.

---

## Part D — Frontend (MUI from the start)

### Step 17 — Theme + ThemeProvider
Create `client/src/theme.js`:
```js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#00897b' },
  },
});

export default theme;
```
In `client/src/main.jsx`, wrap `<App />`:
```jsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

<ThemeProvider theme={theme}>
  <CssBaseline />
  <App />
</ThemeProvider>
```

### Step 18 — API client
Reference: `Clients/src/api/client.js`. A single axios instance with a
request interceptor that attaches `Authorization: Bearer <token>` from
`localStorage` to every request.

### Step 19 — AuthContext
Reference: `Clients/src/context/AuthContext.jsx`. `token`/`user` state
persisted to `localStorage`; exposes `login`, `register`, `logout`,
`updateUser`, calling the `/api/auth/*` endpoints from Step 9.

### Step 20 — Layout, ProtectedRoute, RequireRole
Reference: `Clients/src/components/Layout.jsx`, `ProtectedRoute.jsx`,
`RequireRole.jsx`.
- `Layout` — rebuild with MUI `AppBar` + `Toolbar` + `Button` nav links
  (instead of a Tailwind `<nav>`), keeping the same role-aware conditional
  blocks (different links for User/Moderator/Admin).
- `ProtectedRoute` (redirects to `/login` if no token) and `RequireRole`
  (redirects if `user.role` isn't allowed) — this logic is framework-agnostic,
  copy as-is.

### Step 21 — Routing skeleton
In `App.jsx`:
- **Public routes**: `/` (Landing), `/home`, `/about`, `/contact`,
  `/feedbacks`, `/login`, `/register`.
- **Protected routes** (under `ProtectedRoute` + `Layout`): `/dashboard`,
  `/doctors` (Services), `/appointments`, `/records`, `/records/:id`, etc.
- **Role-restricted routes** (under `RequireRole roles={[...]}`):
  `/appointments/book` (User), `/records/new` (Moderator),
  `/admin/feedback` (Moderator/Admin), `/admin/users`, `/admin/doctors`
  (Admin).

### Step 22 — Public pages
- `LandingPage` — hero section (`Box`, `Typography`, `Button` CTAs to
  `/login`/`/register`).
- `HomePage` — clinic overview + a preview of `GET /api/feedback/approved`
  (MUI `Card`/`Grid`), linking to `/feedbacks`.
- `AboutPage`, `ContactPage` — static MUI content/contact form.
- `FeedbacksPage` — full `GET /api/feedback/approved` list (MUI
  `List`/`Card`, `Rating` displayed read-only).

### Step 23 — Login/Register
Reference: `Clients/src/pages/LoginPage.jsx`, `RegisterPage.jsx` for the
`AuthContext.login`/`.register` call + redirect-on-success + inline error
display. Rebuild the form itself with MUI `TextField`/`Button`/`Paper`/
`Alert`.

### Step 24 — Dashboard (Profile)
Reference: `Clients/src/pages/DashboardPage.jsx` (`GET`/`PATCH
/api/users/me`). Rebuild with MUI `Card`/`TextField`/`Button`. Optionally
split into role-specific sections — e.g. User sees upcoming reservations +
their feedback status; Moderator sees their appointment queue; Admin sees
counts + a pending-feedback shortcut.

### Step 25 — Services / Reservation / Appointments
Reference: `Clients/src/pages/DoctorsPage.jsx`, `BookAppointmentPage.jsx`,
`AppointmentsPage.jsx`. Rebuild with MUI `Table`, `Card`, `Select`, `Button`.
Relabel "Doctors" → "Services" and "Book Appointment" → "Reservation" in the
nav and page titles.

### Step 26 — Records / Prescriptions
Reference: `Clients/src/pages/RecordsPage.jsx`, `RecordDetailPage.jsx`,
`NewRecordPage.jsx`, `PrescriptionsPage.jsx`. Same MUI rebuild approach:
`Table` for lists, `TextField`/`Select` for forms, `Card` for detail
sections (including the follow-up notes list).

### Step 27 — Feedback pages
- `SubmitFeedbackPage` — MUI `Rating` (1-5) + `TextField` comment →
  `POST /api/feedback`. Below the form, list the user's own submissions +
  status via `GET /api/feedback/me`.
- `ModerateFeedbackPage` — MUI `Table` from `GET /api/feedback`,
  Approve/Reject `Button`s → `PATCH /api/feedback/:id/status`. Wrap the route
  in `RequireRole roles={['doctor','admin']}`.

### Step 28 — Admin pages
Reference: `Clients/src/pages/AdminUsersPage.jsx`, `AdminDoctorsPage.jsx`.
MUI `Table` + `Select` dropdown pickers (the patient/doctor picker pattern
already built in `clinical_System` — same data-loading logic, swap the raw
`<select>` for MUI's `Select`/`MenuItem`).

---

## Part E — Docs & GitHub workflow

### Step 29 — README
Write `README.md`: stack overview, setup/run instructions, and the
role-mapping table from `clinical_System/ROADMAP.md` (User=patient,
Moderator=doctor, Admin=admin), plus a checklist mapping each rubric
requirement to the page/endpoint that satisfies it.

### Step 30 — Git workflow
`git init`, then commit in logical chunks — roughly one commit per step or
part above (e.g. "Add auth backend", "Add appointments/reservation flow",
"Add feedback module", "MUI layout + public pages"). Use feature branches
(e.g. `feature/backend-core`, `feature/feedback`, `feature/mui-frontend`)
merged via PRs into `main` — this satisfies the "multiple branches, clean
history" GitHub criterion.

---

## Verification checklist

- [ ] Each backend endpoint tested with curl: register → login → call with
      `Authorization: Bearer <token>`.
- [ ] `GET /api/feedback/approved` returns `200 { feedback: [] }` with **no**
      token.
- [ ] Each frontend page checked in the browser via `npm run dev`.
- [ ] End-to-end: register as a User → submit feedback → log in as
      Moderator/Admin → approve it → it now appears on `/home` and
      `/feedbacks`.
- [ ] End-to-end: User creates a reservation (appointment) → Moderator
      confirms it → status updates visible to both sides.
