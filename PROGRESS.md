# Clinic PERN + MUI — What We Built & How It Works

This file documents every completed step in the project, explaining **what** was
built, **why** it works that way, and **how** the pieces connect.

---

## Part B — Database

### Step 5 — Created the PostgreSQL database

**Command used:**
```sql
CREATE DATABASE clinic_pern_mui;
```

**What it does:**
Creates an empty database named `clinic_pern_mui` inside your PostgreSQL server.
Think of it as an empty folder. No tables exist yet — just a named container that
all your tables will live inside.

---

### Step 6 — Schema (7 tables)

**File:** `server/db/schema.sql`

**Command used:**
```powershell
psql -U postgres -d clinic_pern_mui -f schema.sql
```

The schema creates 7 tables that are all connected to each other through
**foreign keys**. Here is what each table stores:

| Table            | What it stores                                              |
|------------------|-------------------------------------------------------------|
| `users`          | Every person in the system — patient, doctor, or admin      |
| `doctors`        | Extra professional info for users who have the doctor role  |
| `appointments`   | A patient booking a time slot with a doctor                 |
| `medical_records`| A diagnosis written by a doctor during or after a visit     |
| `prescriptions`  | Medication attached to a specific medical record            |
| `record_notes`   | Follow-up notes added to a record over time                 |
| `feedback`       | Ratings and comments submitted by users, need approval      |

**How the foreign keys work:**

- `doctors.user_id` → `users.id` — a doctor IS a user, just with extra info
- `appointments.patient_id` → `users.id` — the patient who booked
- `appointments.doctor_id` → `doctors.id` — the doctor being booked
- `medical_records.appointment_id` → `appointments.id` — optional link to visit
- `prescriptions.record_id` → `medical_records.id` — attached to a record
- `record_notes.record_id` → `medical_records.id` — follow-up on a record
- `feedback.user_id` → `users.id` — who submitted it

`ON DELETE CASCADE` means: if you delete a user, all their appointments,
records, and feedback are automatically deleted too. No orphaned rows.

`CHECK` constraints enforce valid values at the database level:
- `role IN ('patient', 'doctor', 'admin')`
- `status IN ('pending', 'confirmed', 'cancelled', 'completed')`
- `rating BETWEEN 1 AND 5`

---

### Step 7 — Connection config

**Files:** `server/Config/connectPool.js`, `server/.env`

**.env stores secrets (never commit this file):**
```
CONNECTION_STRING=postgresql://postgres:YOUR_PASSWORD@localhost:5432/clinic_pern_mui
PORT=5000
JWT_SECRET=your_long_random_secret
```

**connectPool.js:**
```js
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.CONNECTION_STRING });

export async function connectDB() {
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected');
}
```

**Why a Pool instead of a single Client?**
Opening a new database connection for every HTTP request is slow (it involves
a TCP handshake, authentication, etc.). A Pool keeps several connections open
and reuses them. When a request comes in it borrows a connection, runs the
query, and returns it to the pool.

`dotenv.config()` reads the `.env` file and loads it into `process.env` so your
password never appears directly in source code.

---

## Part C — Backend (Steps 8–16)

The backend follows a strict 3-layer pattern for every resource:

```
Request → Route → Controller → Model → Database
                                         ↓
Response ← Route ← Controller ←  Model ←
```

- **Model** — raw SQL queries, returns data
- **Controller** — receives `req`, calls the model, sends `res`
- **Route** — Express Router, wires URL paths to controllers and applies middleware

---

### Step 8 — Auth Middleware

**File:** `server/middleware/auth.middleware.js`

Two middleware functions that protect routes:

**`verifyToken`**
```
GET /api/users/me
Authorization: Bearer eyJhbGc...
         ↓
verifyToken reads the header
jwt.verify() decodes it using JWT_SECRET
req.user = { id: 5, role: 'patient' }
         ↓
next() — continue to the controller
```
If the token is missing or tampered with, it returns `401 Unauthorized`
immediately and the controller never runs.

**`requireRole('admin')`**
```js
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}
```
Checks `req.user.role` (set by `verifyToken`) against an allowed list.
Returns `403 Forbidden` if the role is not permitted.

---

### Step 9 — Auth: Register & Login

**Files:**
- `server/models/auth.model.js`
- `server/controllers/auth.controller.js`
- `server/routes/auth.routes.js`

**Routes:**
```
POST /api/auth/register
POST /api/auth/login
```

**Register flow:**
1. Check if email already exists → 409 if it does
2. Hash the password: `bcrypt.hash(password, 10)` — the `10` is the salt rounds
3. Insert into `users` with `role='patient'` hardcoded — the client can NEVER
   choose their own role
4. Sign a JWT: `jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })`
5. Return `{ token, user }`

**Why bcrypt?**
Bcrypt is a one-way hash — you cannot reverse it to get the original password.
When a user logs in, `bcrypt.compare(plainPassword, storedHash)` re-hashes and
compares. Even if your database is stolen, passwords are not exposed.

**Login flow:**
1. Find user by email
2. `bcrypt.compare(password, user.password_hash)` — returns `401` on mismatch
3. Sign the same JWT shape `{ id, role }`
4. Strip `password_hash` from the response before sending

---

### Step 10 — Users

**Files:**
- `server/models/user.Model.js`
- `server/controllers/user.controller.js`
- `server/routes/user.routes.js`

**Routes:**
```
GET    /api/users/me        — any logged-in user (own profile)
PATCH  /api/users/me        — any logged-in user (edit own profile)
GET    /api/users           — admin only
GET    /api/users/:id       — admin only
DELETE /api/users/:id       — admin only
```

**Key security rule:** `GET /api/users/me` uses `req.user.id` from the JWT — never
a URL param like `/api/users/5`. If it used a URL param, a patient could change
the number and read someone else's profile.

---

### Step 11 — Doctors (Services)

**Files:**
- `server/models/doctors.Model.js`
- `server/controllers/doctor.controller.js`
- `server/routes/doctor.routes.js`

**Routes:**
```
GET    /api/doctors           — PUBLIC, no login needed
GET    /api/doctors/:id       — PUBLIC, no login needed
POST   /api/doctors           — admin only
PATCH  /api/doctors/:id       — admin only
```

`GET /api/doctors` accepts an optional `?specialty=` query param for filtering.

**Important:** When admin creates a doctor (`POST /api/doctors`), two things happen:
1. A row is inserted into the `doctors` table
2. That user's `role` in the `users` table is updated to `'doctor'`

This means their JWT will be outdated (still says `'patient'`) until they log in
again and get a fresh token. This is expected behavior.

---

### Step 12 — Appointments (the Reservation System)

**Files:**
- `server/models/appointment.model.js`
- `server/controllers/appointment.controller.js`
- `server/routes/appointment.routes.js`

**Routes:**
```
POST   /api/appointments              — patient only (book)
GET    /api/appointments/me           — any logged-in role
PATCH  /api/appointments/:id/status   — role-based rules
PATCH  /api/appointments/:id/reschedule
```

**This is the rubric's "request → approval" flow:**

```
Patient books  →  status = 'pending'    ← REQUEST
Doctor confirms → status = 'confirmed'  ← APPROVAL
Patient cancels → status = 'cancelled'
Admin can set any status
```

**Role-branching in `GET /me`:**
- `patient` — sees only their own bookings
- `doctor` — sees appointments where they are the assigned doctor
- `admin` — sees all appointments

**Ownership rules in `PATCH /:id/status`:**
- Patient can only cancel, and only their own appointment
- Doctor can only update appointments assigned to them
- Admin can set any status on any appointment

---

### Step 13 — Medical Records + Follow-up Notes

**Files:**
- `server/models/medicalRecord.model.js`
- `server/controllers/medicalRecord.controller.js`
- `server/routes/medicalRecord.routes.js`

**Routes:**
```
POST  /api/records                        — doctor only
GET   /api/records/me                     — patient only (own records)
GET   /api/records/patient/:patientId     — doctor or admin
GET   /api/records/:id                    — ownership check
GET   /api/records/:id/notes              — any authorized party
POST  /api/records/:id/notes              — any authorized party
```

**Ownership check on `GET /:id`:**
- Patient: can only read if `record.patient_id === req.user.id`
- Doctor: can only read if they authored the record
- Admin: can read anything

---

### Step 14 — Prescriptions

**Files:**
- `server/models/prescription.model.js`
- `server/controllers/prescription.controller.js`
- `server/routes/prescription.routes.js`

**Routes:**
```
POST  /api/prescriptions                   — doctor only
GET   /api/prescriptions/me               — patient only
GET   /api/prescriptions/record/:recordId — authorized parties
```

When a doctor adds a prescription, the controller verifies that the doctor
actually authored the medical record it belongs to. A doctor cannot add
prescriptions to another doctor's records.

---

### Step 15 — Feedback (Approval Workflow)

**Files:**
- `server/models/feedback.model.js`
- `server/controllers/feedback.controller.js`
- `server/routes/feedback.routes.js`

**Routes:**
```
GET    /api/feedback/approved     — PUBLIC (no login)
POST   /api/feedback              — any logged-in user
GET    /api/feedback/me           — own submissions
GET    /api/feedback              — doctor or admin (moderation queue)
PATCH  /api/feedback/:id/status   — doctor or admin
```

**Flow:**
```
User submits → status = 'pending'
Doctor/Admin reviews queue
Doctor/Admin approves → status = 'approved' → appears on public pages
Doctor/Admin rejects  → status = 'rejected' → hidden from public
```

`GET /api/feedback/approved` is intentionally public so the Landing and Home
pages can show approved feedback to visitors who are not logged in.

---

### Step 16 — index.js (Entry Point)

**File:** `server/index.js`

```js
dotenv.config();
const app = express();
app.use(cors());           // allow requests from React (port 5173)
app.use(express.json());   // parse JSON request bodies

app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/doctors',      doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records',      recordRoutes);
app.use('/api/prescriptions',prescriptionRoutes);
app.use('/api/feedback',     feedbackRoutes);

connectDB().then(() => app.listen(PORT));
```

`connectDB()` must succeed before the server starts listening. If the database
is unreachable, the process exits with code 1 rather than accepting requests
that would all fail anyway.

---

## Part D — Frontend (Steps 17–23)

---

### Step 17 — MUI Theme

**File:** `client/src/theme.js`

```js
const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },    // deep blue
    secondary: { main: '#00897b' },  // teal
  },
});
```

Wrapped in `main.jsx` with `<ThemeProvider theme={theme}>`. Every MUI
component in the entire app now inherits these colors automatically. You
change the color once here and it updates everywhere.

`<CssBaseline />` resets browser default styles (margins, paddings, font) so
the app looks consistent across Chrome, Firefox, Edge etc.

---

### Step 18 — API Client

**File:** `client/src/api/client.js`

```js
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

A **request interceptor** runs before every API call. It reads the JWT from
`localStorage` and attaches it as a header automatically. Without this, every
page would need to manually add the Authorization header — the interceptor
does it once for the whole app.

---

### Step 19 — AuthContext

**File:** `client/src/context/AuthContext.jsx`

React Context shares state across the entire component tree without passing
props through every intermediate component.

```
App
 └── AuthProvider  ← stores { token, user }
      ├── Layout   ← useAuth() to show/hide nav links
      ├── LoginPage  ← useAuth().login()
      └── RegisterPage ← useAuth().register()
```

`token` and `user` are stored in `localStorage` so they survive a page refresh.
On first load, the initial state reads from `localStorage` — so if you were
logged in and refresh the page, you stay logged in.

---

### Step 20 — Layout + Route Guards

**Files:**
- `client/src/components/Layout.jsx`
- `client/src/components/ProtectedRoute.jsx`
- `client/src/components/RequireRole.jsx`

**Layout** uses MUI `AppBar` + `Toolbar`. The nav links are conditional:
```
All users    → Home, About, Contact, Feedbacks
Logged in    → Dashboard, Services, Appointments, Submit Feedback
Patient only → Book Appointment, Records
Doctor only  → (has Moderate link)
Admin only   → Users, Doctors management
```

**ProtectedRoute** — if no token, redirect to `/login`:
```jsx
return token ? children : <Navigate to="/login" replace />;
```

**RequireRole** — if wrong role, redirect to `/dashboard`:
```jsx
return roles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />;
```

---

### Step 21 — Routing Skeleton (App.jsx)

**File:** `client/src/App.jsx`

3 levels of routing:

```
/ (public, no layout)          → LandingPage
/login, /register               → LoginPage, RegisterPage

/home, /about ...               → public WITH Layout (AppBar visible)

/dashboard, /appointments ...   → ProtectedRoute (login required)
/appointments/book              → RequireRole(['patient'])
/records/new                    → RequireRole(['doctor'])
/admin/users                    → RequireRole(['admin'])
```

---

### Step 23 — Login + Register Pages

**Files:**
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/RegisterPage.jsx`

Both follow the same pattern:

```
1. useState for form fields
2. useState for error message
3. useState for loading boolean
4. handleChange updates form state on every keystroke
5. handleSubmit:
   - sets loading = true
   - calls AuthContext.login() or .register()
   - on success → navigate('/dashboard')
   - on error  → setError(err.response.data.message)
   - finally   → loading = false
```

MUI components used:
- `Paper` — the white card container
- `TextField` — styled input with label and validation
- `Button` — submits the form
- `Alert` — shows the red error message from the server
- `CircularProgress` — spinner shown while request is in flight

---

---

---

## JavaScript Basics — What You Need to Know

These are the only 3 JavaScript concepts you need to understand every page in this project.

---

### 1. Variable — stores a value

```js
let name = 'Sara';   // name holds the text 'Sara'
let age  = 25;       // age holds the number 25
```

A variable is just a box with a label. You put a value in the box,
and whenever you use the label, you get the value back.

---

### 2. Function — does something when you call it

```js
function sayHello() {
  console.log('Hello!');
}

sayHello(); // prints Hello!
```

A function is a set of instructions. It does nothing until you **call** it
by writing its name with `()` at the end.

---

### 3. useState — a React variable that updates the screen

```js
const [text, setText] = useState('');
// text    = the current value (read it)
// setText = the function that changes it (write with it)

setText('New value'); // screen updates automatically
```

`useState` is like a regular variable, but smarter. When you change it
using `setText`, React automatically re-draws the component with the new value.
A normal `let` variable would change the value but NOT update the screen.

---

### 4. onChange — runs every time the user types

```js
onChange={e => setDiagnosis(e.target.value)}
// e            = the keyboard event
// e.target     = the input element the user typed in
// e.target.value = the current text inside the input
```

Every single keystroke fires `onChange`. It keeps the state variable in sync
with what the user sees in the input box.

---

### 5. async / await — waiting for the server

```js
async function handleSubmit(e) {
  await api.post('/records', { ... }); // WAIT for server to finish
  navigate('/dashboard');              // THEN go to dashboard
}
```

API calls take time (network request). Without `await`, JavaScript would
run the next line immediately — before the server responded. `await` pauses
execution at that line until the server replies.

---

### 6. e.preventDefault() — stop page refresh

```js
function handleSubmit(e) {
  e.preventDefault(); // stop browser default behavior
  ...
}
```

By default, submitting an HTML form refreshes the entire page. This clears
all your React state. `e.preventDefault()` blocks that behavior so React
can handle the submission instead.

---

### 7. try / catch / finally — handle errors safely

```js
try {
  await api.post('/records', data); // try this
} catch (err) {
  setError('Something went wrong'); // if it fails, do this
} finally {
  setLoading(false);                // always do this at the end
}
```

- `try` — the code you want to run
- `catch` — what to do if an error happens (server error, no internet, etc.)
- `finally` — always runs, whether it succeeded or failed

---

## Part E — Remaining Pages (Steps 24–30)

---

### Step 24 — Profile Page

**Files changed:**
- `server/models/user.Model.js` — extended `updateUserById` + 2 new functions
- `server/controllers/user.controller.js` — password change logic added
- `client/src/pages/ProfilePage.jsx` — new page
- `client/src/App.jsx` — added `/profile` route
- `client/src/components/Layout.jsx` — added "My Profile" link

**What the page does:**
- Shows the logged-in user's avatar, name, email, and role badge at the top
- **Edit Profile form** — update name, email, phone → calls `PATCH /api/users/me`
- **Change Password form** — requires current password, new password, confirm → validates match + min length before sending

**How the password change works (backend):**

```
User sends: { currentPassword, newPassword }
         ↓
getUserWithHash(id)  → fetches the full row including password_hash
bcrypt.compare(currentPassword, stored_hash)
  → if no match → 400 "Current password is incorrect"
  → if match    → bcrypt.hash(newPassword, 10) → store new hash
```

**Why we check the current password?**
Without this check, anyone who steals your session token could change your
password and lock you out. Requiring the current password means the attacker
also needs to know your current password — which they don't.

**Two new model functions:**
- `getUserWithHash(id)` — fetches the full user row including `password_hash`
  (normally excluded from responses for security)
- `updateUserPassword(id, hash)` — updates only the `password_hash` column

**How `updateUser` in AuthContext keeps the UI in sync:**
After a successful profile update, the page calls `updateUser(res.data)`.
This merges the server's response into the stored user object in both
`localStorage` and React state — so the name in the navbar updates instantly
without a page refresh.

---

---

### Step 25 — Admin Users Page

**File:** `client/src/pages/AdminUsersPage.jsx`

**What the page does:**
- Fetches all users from `GET /api/users` (admin-only route)
- Shows a **table** with: Name, Email, Phone, Role badge, Joined date, Delete button
- **Filter dropdown** — "All Roles / Patient / Doctor / Admin" — filters the list in the browser without a new API call
- **Delete button** — shows a `confirm()` dialog first, then calls `DELETE /api/users/:id`

**How the filter works (frontend-only filtering):**
```js
const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);
```
All users are loaded once when the page mounts. The `filter` state variable holds
the selected role. The `filtered` variable is derived from `users` on every render —
no extra API call needed.

**Why confirm() before delete?**
`DELETE` is irreversible — it cascades to all the user's appointments, records,
and feedback because of `ON DELETE CASCADE` in the schema. The `window.confirm()`
dialog is a simple guard to prevent accidental clicks.

**MUI Table structure:**
```
TableContainer → Paper wrapper with border
  Table
    TableHead → column labels row
    TableBody → one TableRow per user
      TableCell → each column value
```
`hover` prop on `TableRow` adds a subtle highlight when the mouse moves over a row.

**Tooltip** wraps the delete icon — shows "Delete user" text on hover, making
the icon's purpose clear without needing a text label.

---

---

### Step 26 — Admin Doctors Page (How to Build a Data Page)

**File:** `client/src/pages/AdminDoctorsPage.jsx`

Every page that fetches and displays data follows the **same 4-step pattern:**

```
1. useState  → create variables to hold the data
2. useEffect → fetch data when the page loads
3. API call  → send request to the backend
4. JSX       → display the data
```

---

#### Step 1 — Imports

```jsx
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert
} from '@mui/material';
import api from '../api/client.js';
```

---

#### Step 2 — State variables

```jsx
const [doctors, setDoctors] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError]     = useState('');
```

| Variable | Type | Purpose |
|---|---|---|
| `doctors` | array | holds the list fetched from the server |
| `loading` | boolean | true while waiting for the response |
| `error` | string | stores any error message to show the user |

---

#### Step 3 — Fetch data on page load (useEffect)

```jsx
useEffect(() => {
  api.get('/doctors')
    .then(res => setDoctors(Array.isArray(res.data) ? res.data : []))
    .catch(() => setError('Failed to load doctors.'))
    .finally(() => setLoading(false));
}, []);
```

**Why `[]` at the end of useEffect?**
The `[]` is the **dependency array**. It tells React "run this effect only once —
when the component first appears on screen." Without it, the effect would run
after every re-render, causing an infinite loop of API calls.

**Why `Array.isArray(res.data) ? res.data : []`?**
If the server returns something unexpected (like `null` or an error object),
calling `.map()` on it would crash the app. This check guarantees `doctors`
is always an array, even if the API behaves unexpectedly.

---

#### Step 4 — The table (JSX)

Columns: Name, Specialty, License Number, Bio

```jsx
<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
  <Table>
    <TableHead>
      <TableRow sx={{ bgcolor: 'grey.50' }}>
        <TableCell><b>Name</b></TableCell>
        <TableCell><b>Specialty</b></TableCell>
        <TableCell><b>License</b></TableCell>
        <TableCell><b>Bio</b></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {doctors.map(d => (
        <TableRow key={d.id} hover>
          <TableCell>{d.name}</TableCell>
          <TableCell>{d.specialty}</TableCell>
          <TableCell>{d.license_number}</TableCell>
          <TableCell>{d.bio || '—'}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

**MUI Table structure explained:**
```
TableContainer  → the outer Paper wrapper (gives border/shadow)
  Table         → the actual <table> element
    TableHead   → the header row (column labels)
    TableBody   → all the data rows
      TableRow  → one row per doctor
        TableCell → one cell per column
```

**`key={d.id}`** — React requires a unique `key` on every item in a list.
It uses this to track which rows changed when the data updates, making
re-renders efficient.

**`hover`** — MUI prop that adds a subtle background highlight when the
mouse moves over that row. Makes the table feel interactive.

**`d.bio || '—'`** — if `bio` is null or empty, show a dash instead of
a blank cell.

---

#### Full component structure

```jsx
export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load doctors.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Manage Doctors
      </Typography>

      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}
      {!loading && /* table goes here */}
    </Box>
  );
}
```

---

---

### Step 27 — Records Page (Patient)

**File:** `client/src/pages/RecordsPage.jsx`
**API:** `GET /api/records/me` — returns the logged-in patient's records

Shows a clickable list of medical records. Each card shows the date and a 2-line
preview of the diagnosis. Clicking navigates to `/records/:id`.

**New CSS technique — line clamping:**
```jsx
sx={{
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}}
```
This limits the diagnosis text to 2 lines and adds `...` if it is longer.
It is a CSS trick using the WebKit box model — works in all modern browsers.

**Hover effect on a Paper:**
```jsx
'&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
```
The `&` refers to the element itself. On hover, the border turns blue and the
background gets a very light blue tint — giving the card a "clickable" feel.

---

### Step 28 — Record Detail Page

**File:** `client/src/pages/RecordDetailPage.jsx`
**Route:** `/records/:id` — the `:id` comes from `useParams()`

Fetches 3 things at the same time using `Promise.all`:
```js
Promise.all([
  api.get(`/records/${id}`),
  api.get(`/prescriptions/record/${id}`),
  api.get(`/records/${id}/notes`),
])
```

**Why Promise.all?**
Without it you would fetch them one by one, each waiting for the previous to finish.
`Promise.all` sends all 3 requests simultaneously and waits for all to complete —
faster, and the page loads everything at once.

Shows: diagnosis text, notes, prescriptions list (with dosage chip), follow-up notes timeline.

---

### Step 29 — Prescriptions Page (Patient)

**File:** `client/src/pages/PrescriptionsPage.jsx`
**API:** `GET /api/prescriptions/me`

A table showing all medications ever prescribed to the patient across all records.
Columns: Medication (bold), Dosage (chip), Instructions, Duration, Date.

---

---

### Step 30 — New Record Page (Doctor)

**File:** `client/src/pages/NewRecordPage.jsx`
**Route:** `/records/new` — doctor only
**API:** `POST /api/records`

The doctor fills in 3 fields: Patient ID, Diagnosis, Notes. On submit it sends
the data to the backend and navigates to `/dashboard` on success.

**3 JavaScript concepts used in every form:**

**1. useState — a variable that updates the screen:**
```js
const [diagnosis, setDiagnosis] = useState('');
// diagnosis = the current text in the field
// setDiagnosis('new text') = updates the field AND re-renders the screen
```

**2. onChange — runs every time the user types:**
```js
onChange={e => setDiagnosis(e.target.value)}
// e = the event (the keystroke)
// e.target = the input element
// e.target.value = the current text inside the input
```
Every keystroke calls `setDiagnosis` with the new text, keeping the state in sync.

**3. async/await — waiting for the API response:**
```js
async function handleSubmit(e) {
  await api.post('/records', { ... }); // wait for server to respond
  navigate('/dashboard');              // then go to dashboard
}
```
Without `await`, the code would jump to `navigate()` before the server finished
saving — the record would not exist yet.

**`e.preventDefault()`** stops the browser's default form behavior (page reload).
Without it, submitting the form refreshes the page and loses all the data.

**`Number(patientId)`** converts the text from the input (`"5"`) to a real number
(`5`). The backend expects a number, not a string.

---

---

### Step 31 — Admin Doctors Page: Add Doctor Form

**File:** `client/src/pages/AdminDoctorsPage.jsx`

Added an **Add New Doctor** form above the doctors table. The admin selects
a patient from a dropdown, enters specialty, license number, and bio, then
submits to `POST /api/doctors`.

**How the dropdown is populated:**
```js
const [docRes, userRes] = await Promise.all([
  api.get('/doctors'),
  api.get('/users'),
]);
// only show patients in the dropdown — not admins or existing doctors
const patients = userRes.data.filter(u => u.role === 'patient');
```

`Promise.all` fetches both lists simultaneously. We filter to show only
patients — it makes no sense to promote someone who is already a doctor or admin.

**What happens when you add a doctor:**
1. `POST /api/doctors` inserts a row in the `doctors` table
2. The backend also runs `UPDATE users SET role = 'doctor'` for that user
3. The new doctor must **log out and log in again** to get a fresh JWT with `role='doctor'`
4. The doctors table and patient dropdown refresh automatically via `fetchAll()`

**`setForm({ ...form, user_id: e.target.value })`**
The `...form` spread copies all existing form fields first, then only updates
the one that changed. Without the spread, all other fields would be erased.

---

### Step 32 — Doctors Page: Search & Filter

**File:** `client/src/pages/DoctorsPage.jsx`

Added a search bar at the top. Typing filters doctors by **name or specialty**
instantly — no extra API call needed.

**How filtering works:**
```js
const filtered = doctors.filter(d =>
  d.name.toLowerCase().includes(search.toLowerCase()) ||
  d.specialty.toLowerCase().includes(search.toLowerCase())
);
```

- `doctors` = the full list from the API (loaded once)
- `filtered` = a smaller list derived from `doctors` every render
- `.toLowerCase()` on both sides makes the search case-insensitive
  ("cardio" matches "Cardiology")
- `||` means OR — matches if name OR specialty contains the search text

**Search icon inside the TextField:**
```jsx
InputProps={{
  startAdornment: (
    <InputAdornment position="start">
      <SearchIcon color="action" />
    </InputAdornment>
  ),
}}
```
`InputAdornment` is a MUI component that places content inside an input.
`position="start"` puts the icon on the left side of the text field.

---

---

### Step 33 — README File

**File:** `README.md` (at the root of the project)

The README is the first thing anyone sees when they open your GitHub repository.
It must explain what the project does and how to run it.

**Required sections (per instructor rubric):**
- Project description
- Technologies used
- Setup instructions
- Features list

**Why a README matters:**
- 5% of your grade is GitHub usage — a missing README loses marks
- Any developer who clones your repo must be able to run it without asking you questions
- It shows professionalism

---

### Step 34 — GitHub Setup (Branches + Commits)

**Why branches?**
The instructor requires "multiple branches (feature-based workflow)".
In real companies, every feature is developed on its own branch so it
does not break the main working version.

**Branch naming convention:**
```
main          ← always working, production-ready code
feature/auth  ← login + register
feature/appointments
feature/records
feature/admin
```

**Commands to set up GitHub:**
```bash
# 1. Initialize git (if not done)
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "Initial commit: full stack clinic management system"

# 4. Create GitHub repo and connect it
git remote add origin https://github.com/YOUR_USERNAME/clinic_pern_mui.git

# 5. Push to GitHub
git push -u origin main
```

**Important — add a .gitignore file** to avoid pushing secrets:
```
node_modules/
.env
```

---

## What's Next

| Step | What to build |
|------|--------------|
| 22   | Public pages — LandingPage, HomePage, AboutPage, ContactPage, FeedbacksPage |
| 24   | Dashboard — profile view/edit + role-specific summary |
| 25   | Services, Book Appointment, Appointments list |
| 26   | Records list, Record detail, New record, Prescriptions |
| 27   | Submit Feedback, Moderate Feedback |
| 28   | Admin Users, Admin Doctors |
| 29   | README |
| 30   | Git workflow — feature branches + PRs |

---

## Page Ideas — What to Build on Each Page

### Public Pages (no login needed)

#### `/` — Landing Page
- Big hero section with clinic name + tagline
- "Get Started" and "Login" buttons
- 3 feature cards (Book appointments, View records, Trusted doctors)

#### `/home` — Home Page

**1. Welcome Banner**
A colored box with the clinic name, a short tagline like *"Your health is our priority"*,
and a "Book Appointment" button that links to `/appointments/book`.

**2. Approved Feedback Section**
Fetch from `GET /api/feedback/approved` and display each one as a card showing:
- Star rating (MUI `Rating` component, read-only)
- The comment text
- Patient name
- Date submitted

**3. Quick Links / CTA Section**
3 cards side by side linking to:
- "Browse our Doctors" → `/doctors`
- "Book an Appointment" → `/appointments/book`
- "Submit Feedback" → `/feedback/submit`

**MUI components to use:**
- `Box` — banner background
- `Typography` — headings and text
- `Grid` — card layouts
- `Card`, `CardContent` — each feedback item
- `Rating` — star display (read-only)
- `Button` — CTA buttons
- `useEffect` + `useState` — fetch approved feedback on page load
- `api.get('/feedback/approved')` — from your axios client

#### `/about` — About Page
- Clinic story/mission paragraph
- Team stats (years open, doctors, patients served)
- List of specialties offered

#### `/contact` — Contact Page

You started with plain HTML (`<form>`, `<input>`, `<label>`, `<textarea>`).
The MUI way replaces each of those with a MUI component. Here is the mapping:

| Plain HTML         | MUI equivalent                  |
|--------------------|---------------------------------|
| `<input />`        | `<TextField />`                 |
| `<textarea />`     | `<TextField multiline rows={4}>`|
| `<label>`          | built into `TextField` as `label` prop |
| `<button>`         | `<Button variant="contained">`  |
| `<form>`           | `<Box component="form">`        |

**Step 1 — imports:**
```jsx
import { useState } from 'react';
import {
  Box, Grid, Paper, Typography,
  TextField, Button, Alert
} from '@mui/material';
```

**Step 2 — state:**
```jsx
const [form, setForm] = useState({ name: '', email: '', message: '' });
const [sent, setSent] = useState(false);

function handleChange(e) {
  setForm({ ...form, [e.target.name]: e.target.value });
}

function handleSubmit(e) {
  e.preventDefault();
  setSent(true);        // no backend needed, just show success
  setForm({ name: '', email: '', message: '' });
}
```

**Step 3 — two-column layout:**
```jsx
<Grid container spacing={4}>

  {/* Left — form */}
  <Grid item xs={12} md={7}>
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit}
           sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

        {sent && <Alert severity="success">Message sent!</Alert>}

        <TextField label="Name"    name="name"
                   value={form.name}    onChange={handleChange} required />
        <TextField label="Email"   name="email"   type="email"
                   value={form.email}   onChange={handleChange} required />
        <TextField label="Message" name="message" multiline rows={4}
                   value={form.message} onChange={handleChange} required />

        <Button type="submit" variant="contained">Send</Button>
      </Box>
    </Paper>
  </Grid>

  {/* Right — clinic info */}
  <Grid item xs={12} md={5}>
    <Paper sx={{ p: 3 }}>
      <Typography>📍 123 Health Street, Medical City</Typography>
      <Typography>📞 +1 (555) 123-4567</Typography>
      <Typography>✉️  contact@cliniccare.com</Typography>
      <Typography>🕐 Mon–Fri 8am–6pm, Sat 9am–2pm</Typography>
    </Paper>
  </Grid>

</Grid>
```

**Key things to understand:**
- `component="form"` on a `Box` makes it behave like a `<form>` but styled with MUI
- `e.preventDefault()` stops the page from refreshing on submit
- `multiline rows={4}` on `TextField` replaces `<textarea>`
- `name` prop on each `TextField` must match the key in your state object
  so that one `handleChange` function works for all fields
- `sent` state toggles the green success `Alert` — no backend call needed

#### `/feedbacks` — Feedbacks Page
- Full list of approved feedback from all patients
- Each card shows: star rating, comment, patient name, date

---

### Auth Pages

#### `/login` ✅ Done
#### `/register` ✅ Done

---

### Protected Pages (login required)

#### `/dashboard` — Profile Page
- Show logged-in user's name, email, phone, role badge
- Edit form (name, phone) with save button
- **Patient** → summary cards: upcoming appointments count, pending feedback count
- **Doctor** → upcoming appointments count, records written count
- **Admin** → total users count, pending feedback count, total appointments count

#### `/doctors` — Services Page
- Grid of doctor cards (name, specialty, bio)
- Filter by specialty dropdown
- Each card has a "Book" button → `/appointments/book`

---

### Patient Pages

#### `/appointments/book` — Book Reservation
- Dropdown to pick a doctor
- Date + time picker
- Reason text field
- Submit button → creates appointment with `status='pending'`

#### `/appointments` — My Appointments
- Table of all appointments (doctor name, date, status, reason)
- Status badge with color: pending=yellow, confirmed=green, cancelled=red
- Cancel button on pending appointments

#### `/records` — My Medical Records
- Table of records (date, doctor name, diagnosis preview)
- Click a row → navigates to `/records/:id`

#### `/records/:id` — Record Detail
- Diagnosis and notes displayed
- List of prescriptions (medication, dosage, instructions, duration)
- Timeline of follow-up notes at the bottom

#### `/prescriptions` — My Prescriptions
- Table of all prescriptions (medication, dosage, instructions, duration, date)

#### `/feedback/submit` — Submit Feedback
- Star rating input (1–5)
- Comment text field
- Submit button
- Below the form: list of own past submissions with status badges

---

### Doctor Pages

#### `/records/new` — Create Medical Record
- Pick patient (dropdown or ID input)
- Link to appointment (optional dropdown)
- Diagnosis text field
- Notes text field
- Submit → creates the record

#### `/admin/feedback` — Moderate Feedback *(shared with admin)*
- Table of all pending feedback
- Each row: patient name, star rating, comment, Approve / Reject buttons

---

### Admin Pages

#### `/admin/users` — Manage Users
- Table of all users (name, email, role badge, joined date)
- Delete button per row
- Filter by role (patient / doctor / admin)

#### `/admin/doctors` — Manage Doctors
- Table of all doctors (name, specialty, license number)
- "Add Doctor" form: pick a user, enter specialty + license number + bio
- Edit specialty / bio inline

---

### Summary Table

| Page | Who can see it | Key action |
|---|---|---|
| `/` Landing | Public | Navigate to login/register |
| `/home` Home | Public | See approved feedback |
| `/about` About | Public | Learn about the clinic |
| `/contact` Contact | Public | Send a message |
| `/feedbacks` | Public | Read all approved reviews |
| `/dashboard` | All roles | Edit profile, see summary |
| `/doctors` | All roles | Browse doctors/services |
| `/appointments/book` | Patient | Create an appointment |
| `/appointments` | All roles | View/cancel appointments |
| `/records` | Patient | View medical history |
| `/records/:id` | Patient/Doctor | See diagnosis + notes |
| `/records/new` | Doctor | Write a diagnosis |
| `/prescriptions` | Patient | View medications |
| `/feedback/submit` | All roles | Rate the clinic |
| `/admin/feedback` | Doctor/Admin | Approve or reject reviews |
| `/admin/users` | Admin | Delete users, filter by role |
| `/admin/doctors` | Admin | Add/edit doctor profiles |
