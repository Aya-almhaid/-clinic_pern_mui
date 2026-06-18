import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Avatar, Chip, Divider,
  CircularProgress, List, ListItem, ListItemText, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FeedbackIcon from '@mui/icons-material/Feedback';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import api from '../api/client.js';

const roleColor = { patient: 'primary', doctor: 'secondary', admin: 'error' };
const roleIcon  = {
  patient: <PersonIcon fontSize="large" />,
  doctor:  <LocalHospitalIcon fontSize="large" />,
  admin:   <AdminPanelSettingsIcon fontSize="large" />,
};
const statusColor = { pending: 'warning', confirmed: 'success', cancelled: 'error', completed: 'default' };

const roleCards = {
  patient: [
    { title: 'Book Appointment',   desc: 'Schedule a visit with one of our doctors.', link: '/appointments/book' },
    { title: 'My Records',         desc: 'View your medical history and diagnoses.',  link: '/records' },
    { title: 'Prescriptions',      desc: 'See your current and past prescriptions.',  link: '/prescriptions' },
    { title: 'Submit Feedback',    desc: 'Share your experience with the clinic.',    link: '/feedback/submit' },
  ],
  doctor: [
    { title: 'Prescriptions',      desc: 'View and manage patient prescriptions.',    link: '/prescriptions' },
    { title: 'New Medical Record', desc: 'Create a medical record for a patient.',    link: '/records/new' },
    { title: 'Appointments',       desc: 'View all your scheduled appointments.',     link: '/appointments' },
    { title: 'Moderate Feedback',  desc: 'Review and approve patient feedback.',      link: '/admin/feedback' },
  ],
  admin: [
    { title: 'Manage Users',       desc: 'View and update all patient and staff accounts.', link: '/admin/users' },
    { title: 'Manage Doctors',     desc: 'Add or remove doctor profiles.',                  link: '/admin/doctors' },
    { title: 'Moderate Feedback',  desc: 'Approve or reject submitted feedback.',           link: '/admin/feedback' },
    { title: 'Appointments',       desc: 'Overview of all clinic appointments.',            link: '/appointments' },
  ],
};

/* ─── Stat Card ─────────────────────────────────────── */
function StatCard({ label, value, color, icon }) {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: color, width: 52, height: 52 }}>{icon}</Avatar>
      <Box>
        <Typography variant="h4" fontWeight={700}>{value ?? '—'}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Paper>
  );
}

/* ─── Quick Access Cards ─────────────────────────────── */
function QuickAccessCards({ cards, mt = 0 }) {
  if (!cards.length) return null;
  return (
    <>
      <Typography variant="h6" fontWeight={700} mt={mt} mb={2}>Quick Access</Typography>
      <Grid container spacing={3}>
        {cards.map(card => (
          <Grid item xs={12} sm={6} key={card.title}>
            <Paper
              variant="outlined"
              component={Link}
              to={card.link}
              sx={{
                p: 3, borderRadius: 2, height: '100%',
                display: 'block', textDecoration: 'none', color: 'inherit',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                '&:hover': { boxShadow: 4, borderColor: 'primary.main' },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>{card.title}</Typography>
              <Typography variant="body2" color="text.secondary">{card.desc}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

/* ─── Doctor Dashboard ───────────────────────────────── */
function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.get('/appointments/me')
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today     = new Date().toDateString();
  const upcoming  = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const todayList = upcoming.filter(a => new Date(a.scheduled_at).toDateString() === today);
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <>
      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Upcoming"  value={upcoming.length}  color="primary.main"  icon={<CalendarMonthIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Today"     value={todayList.length} color="warning.main"  icon={<CalendarMonthIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Completed" value={completed}        color="success.main"  icon={<MedicalServicesIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Cancelled" value={cancelled}        color="error.main"    icon={<CalendarMonthIcon />} />
        </Grid>
      </Grid>

      {/* Today's appointments */}
      <Typography variant="h6" fontWeight={700} mb={2}>Today's Appointments</Typography>
      {loading && <CircularProgress sx={{ mb: 3 }} />}
      {!loading && todayList.length === 0 && (
        <Typography color="text.secondary" mb={3}>No appointments scheduled for today.</Typography>
      )}
      {!loading && todayList.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
          <List disablePadding>
            {todayList.map((a, i) => (
              <ListItem key={a.id} divider={i < todayList.length - 1}
                secondaryAction={<Chip label={a.status} color={statusColor[a.status]} size="small" />}>
                <ListItemText
                  primary={a.patient_name || 'Unknown Patient'}
                  secondary={new Date(a.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    + (a.reason ? ' — ' + a.reason : '')}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Upcoming appointments */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Upcoming Appointments</Typography>
        <Button component={Link} to="/appointments" size="small">View All</Button>
      </Box>
      {!loading && upcoming.length === 0 && (
        <Typography color="text.secondary" mb={3}>No upcoming appointments.</Typography>
      )}
      {!loading && upcoming.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
          <List disablePadding>
            {upcoming.slice(0, 5).map((a, i) => (
              <ListItem key={a.id} divider={i < Math.min(upcoming.length, 5) - 1}
                secondaryAction={<Chip label={a.status} color={statusColor[a.status]} size="small" />}>
                <ListItemText
                  primary={a.patient_name || 'Unknown Patient'}
                  secondary={new Date(a.scheduled_at).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}

/* ─── Admin Dashboard ────────────────────────────────── */
function AdminDashboard() {
  const [stats, setStats]           = useState({ users: null, doctors: null, appointments: null, pendingFeedback: null });
  const [recentAppts, setRecentAppts] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users'),
      api.get('/doctors'),
      api.get('/appointments/me'),
      api.get('/feedback'),
    ]).then(([usersRes, doctorsRes, apptRes, fbRes]) => {
      const users        = Array.isArray(usersRes.data)    ? usersRes.data    : [];
      const doctors      = Array.isArray(doctorsRes.data)  ? doctorsRes.data  : [];
      const appointments = Array.isArray(apptRes.data)     ? apptRes.data     : [];
      const feedback     = Array.isArray(fbRes.data?.feedback) ? fbRes.data.feedback
                         : Array.isArray(fbRes.data)       ? fbRes.data       : [];

      setStats({
        users:          users.filter(u => u.role === 'patient').length,
        doctors:        doctors.length,
        appointments:   appointments.length,
        pendingFeedback: feedback.filter(f => f.status === 'pending').length,
      });
      setRecentAppts(appointments.slice(0, 5));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total Patients"    value={stats.users}           color="primary.main"  icon={<PeopleIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Total Doctors"     value={stats.doctors}         color="secondary.main" icon={<LocalHospitalIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Appointments"      value={stats.appointments}    color="success.main"  icon={<CalendarMonthIcon />} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard label="Pending Feedback"  value={stats.pendingFeedback} color="warning.main"  icon={<FeedbackIcon />} />
        </Grid>
      </Grid>

      {/* Recent appointments table */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Recent Appointments</Typography>
        <Button component={Link} to="/appointments" size="small">View All</Button>
      </Box>
      {loading && <CircularProgress />}
      {!loading && recentAppts.length === 0 && (
        <Typography color="text.secondary" mb={3}>No appointments yet.</Typography>
      )}
      {!loading && recentAppts.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 4 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><b>Patient</b></TableCell>
                <TableCell><b>Doctor</b></TableCell>
                <TableCell><b>Date & Time</b></TableCell>
                <TableCell><b>Status</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentAppts.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell>{a.patient_name || '—'}</TableCell>
                  <TableCell>{a.doctor_name  || '—'}</TableCell>
                  <TableCell>{new Date(a.scheduled_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip label={a.status} color={statusColor[a.status]} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
}

/* ─── Main Dashboard Page ────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const cards = roleCards[user.role] ?? [];

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', py: 4 }}>

      {/* Profile header */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar sx={{ bgcolor: `${roleColor[user.role]}.main`, width: 72, height: 72 }}>
          {roleIcon[user.role]}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>{user.name}</Typography>
          <Typography color="text.secondary" mb={1}>{user.email}</Typography>
          <Chip
            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            color={roleColor[user.role]}
            size="small"
          />
        </Box>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {user.role === 'doctor' && <DoctorDashboard />}
      {user.role === 'admin'  && <AdminDashboard />}

      <QuickAccessCards cards={cards} mt={user.role !== 'patient' ? 2 : 0} />

    </Box>
  );
}
