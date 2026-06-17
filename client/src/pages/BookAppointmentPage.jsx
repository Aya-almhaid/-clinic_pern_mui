import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  MenuItem, Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors]       = useState([]);
  const [doctorId, setDoctorId]     = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [reason, setReason]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.get('/doctors').then(res => setDoctors(Array.isArray(res.data) ? res.data : []));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!doctorId || !scheduledAt) return setError('Please select a doctor and date/time.');
    setError('');
    setLoading(true);
    try {
      await api.post('/appointments', { doctor_id: doctorId, scheduled_at: scheduledAt, reason });
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 550, mx: 'auto', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Book an Appointment</Typography>
        <Typography color="text.secondary" mb={3}>
          Choose a doctor and pick a date and time.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            select
            label="Doctor"
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
            required
            fullWidth
          >
            {doctors.map(d => (
              <MenuItem key={d.id} value={d.id}>
                Dr. {d.name} — {d.specialty}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date & Time"
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Reason (optional)"
            multiline
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Book Appointment'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
