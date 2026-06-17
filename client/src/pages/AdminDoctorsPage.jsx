import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress,
  Alert, TextField, Button, Divider, MenuItem
} from '@mui/material';
import api from '../api/client.js';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  // Add doctor form state
  const [form, setForm] = useState({
    user_id: '', specialty: '', license_number: '', bio: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [docRes, userRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/users'),
      ]);
      setDoctors(Array.isArray(docRes.data) ? docRes.data : []);
      // only show patients (not already doctors or admins) in the dropdown
      const patients = Array.isArray(userRes.data)
        ? userRes.data.filter(u => u.role === 'patient')
        : [];
      setUsers(patients);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDoctor(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      await api.post('/doctors', {
        user_id:        Number(form.user_id),
        specialty:      form.specialty,
        license_number: form.license_number,
        bio:            form.bio,
      });
      setSuccess('Doctor added successfully. They must log out and log in again to get the doctor role.');
      setForm({ user_id: '', specialty: '', license_number: '', bio: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add doctor.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Manage Doctors</Typography>
      <Typography color="text.secondary" mb={3}>
        View all doctors and promote a patient to doctor.
      </Typography>

      {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Add Doctor Form */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Add New Doctor</Typography>
        <Box component="form" onSubmit={handleAddDoctor}
             sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          <TextField
            select
            label="Select Patient"
            value={form.user_id}
            onChange={e => setForm({ ...form, user_id: e.target.value })}
            required fullWidth
          >
            {users.length === 0
              ? <MenuItem disabled>No patients available</MenuItem>
              : users.map(u => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </MenuItem>
              ))
            }
          </TextField>

          <TextField
            label="Specialty"
            value={form.specialty}
            onChange={e => setForm({ ...form, specialty: e.target.value })}
            required fullWidth
            placeholder="e.g. Cardiology"
          />

          <TextField
            label="License Number"
            value={form.license_number}
            onChange={e => setForm({ ...form, license_number: e.target.value })}
            required fullWidth
            placeholder="e.g. LIC-002"
          />

          <TextField
            label="Bio (optional)"
            multiline rows={2}
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={22} color="inherit" /> : 'Add Doctor'}
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* Doctors Table */}
      <Typography variant="h6" fontWeight={700} mb={2}>Current Doctors</Typography>
      {loading && <CircularProgress />}

      {!loading && doctors.length === 0 && (
        <Typography color="text.secondary">No doctors found.</Typography>
      )}

      {!loading && doctors.length > 0 && (
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
      )}
    </Box>
  );
}
