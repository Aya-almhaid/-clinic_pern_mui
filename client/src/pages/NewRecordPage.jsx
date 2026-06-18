import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Alert, CircularProgress, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';

export default function NewRecordPage() {
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const navigate = useNavigate();
  const { data: patients, loading: usersLoading, error: patientsError } = useFetch('/users/patients');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/records', {
        patient_id: Number(patientId),
        diagnosis,
        notes,
      });
      navigate(`/records/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          New Medical Record
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Fill in the patient's diagnosis and notes.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {patientsError && <Alert severity="warning" sx={{ mb: 2 }}>Could not load patients: {patientsError}</Alert>}

        <Box component="form" onSubmit={handleSubmit}
             sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          <TextField
            select
            label="Patient"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            required
            fullWidth
            disabled={usersLoading || (patients || []).length === 0}
            helperText={
              usersLoading ? 'Loading patients…'
              : patientsError ? 'Failed to load — restart the server and refresh'
              : (patients || []).length === 0 ? 'No patients found in the system'
              : 'Select the patient for this record'
            }
          >
            {(patients || []).map(p => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} — {p.email}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Diagnosis"
            multiline
            rows={4}
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Notes (optional)"
            multiline
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Record'}
          </Button>

        </Box>
      </Paper>
    </Box>
  );
}
