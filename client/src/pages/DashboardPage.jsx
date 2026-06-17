import { useAuth } from '../context/AuthContext.jsx';
import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Avatar, Chip, Divider,
  CircularProgress, List, ListItem, ListItemText
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
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
    { title: 'Book Appointment',   desc: 'Schedule a visit with one of our doctors.' },
    { title: 'My Records',         desc: 'View your medical history and diagnoses.' },
    { title: 'Prescriptions',      desc: 'See your current and past prescriptions.' },
    { title: 'Submit Feedback',    desc: 'Share your experience with the clinic.' },
  ],
  admin: [
    { title: 'Manage Users',       desc: 'View and update all patient and staff accounts.' },
    { title: 'Manage Doctors',     desc: 'Add or remove doctor profiles.' },
    { title: 'Moderate Feedback',  desc: 'Approve or reject submitted feedback.' },
    { title: 'Appointments',       desc: 'Overview of all clinic appointments.' },
  ],
};

function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.get('/appointments/me')
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming  = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const completed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <>
      {/* Stats row */}
      <Grid container spacing={3} mb={4}>
        {[
          { label: 'Upcoming',  value: upcoming.length,  color: 'primary.main' },
          { label: 'Completed', value: completed,         color: 'success.main' },
          { label: 'Cancelled', value: cancelled,         color: 'error.main'   },
        ].map(s => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Upcoming appointments list */}
      <Typography variant="h6" fontWeight={700} mb={2}>Upcoming Appointments</Typography>
      {loading && <CircularProgress />}
      {!loading && upcoming.length === 0 && (
        <Typography color="text.secondary">No upcoming appointments.</Typography>
      )}
      {!loading && upcoming.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <List disablePadding>
            {upcoming.map((a, i) => (
              <ListItem
                key={a.id}
                divider={i < upcoming.length - 1}
                secondaryAction={
                  <Chip label={a.status} color={statusColor[a.status]} size="small" />
                }
              >
                <ListItemText
                  primary={`Patient: ${a.patient_name || 'Unknown'}`}
                  secondary={`${new Date(a.scheduled_at).toLocaleString()}${a.reason ? ' — ' + a.reason : ''}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const cards = roleCards[user.role] ?? [];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>

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

      {/* Doctor gets live appointment data */}
      {user.role === 'doctor' && <DoctorDashboard user={user} />}

      {/* Patient and Admin get quick access cards */}
      {user.role !== 'doctor' && (
        <>
          <Typography variant="h6" fontWeight={700} mb={2}>Quick Access</Typography>
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} sm={6} key={card.title}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      )}

    </Box>
  );
}
