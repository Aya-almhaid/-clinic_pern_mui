import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Button,
  CircularProgress, Alert, Stack, Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

const statusColor = {
  pending:   'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'default',
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await api.get('/appointments/me');
      setList(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id, status) {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      fetchAll();
    } catch {
      setError('Failed to update appointment.');
    }
  }

  return (
    <Box sx={{ maxWidth: 750, mx: 'auto', py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Appointments</Typography>
      <Typography color="text.secondary" mb={3}>
        {user?.role === 'patient' ? 'Your upcoming and past appointments.' : 'Appointments assigned to you.'}
      </Typography>

      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {!loading && list.length === 0 && (
        <Typography color="text.secondary">No appointments found.</Typography>
      )}

      {list.map(a => (
        <Paper key={a.id} variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {user?.role === 'patient'
                ? `Dr. ${a.doctor_name} — ${a.specialty}`
                : `Patient: ${a.patient_name}`}
            </Typography>
            <Chip label={a.status} color={statusColor[a.status]} size="small" />
          </Box>

          <Typography variant="body2" color="text.secondary" mb={1}>
            {new Date(a.scheduled_at).toLocaleString()}
          </Typography>

          {a.reason && (
            <Typography variant="body2" mb={1}>Reason: {a.reason}</Typography>
          )}

          <Divider sx={{ my: 1 }} />

          <Stack direction="row" spacing={1}>
            {user?.role === 'patient' && a.status === 'pending' && (
              <Button size="small" variant="outlined" color="error"
                onClick={() => changeStatus(a.id, 'cancelled')}>
                Cancel
              </Button>
            )}
            {user?.role === 'doctor' && a.status === 'pending' && (
              <Button size="small" variant="contained" color="success"
                onClick={() => changeStatus(a.id, 'confirmed')}>
                Confirm
              </Button>
            )}
            {user?.role === 'doctor' && a.status === 'confirmed' && (
              <Button size="small" variant="outlined"
                onClick={() => changeStatus(a.id, 'completed')}>
                Mark Completed
              </Button>
            )}
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
