import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert, Chip
} from '@mui/material';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/prescriptions/me')
      .then(res => setList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load prescriptions.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {isDoctor ? 'Prescriptions I Wrote' : 'My Prescriptions'}
      </Typography>
      <Typography color="text.secondary" mb={3}>
        {isDoctor
          ? 'All prescriptions you have issued to your patients.'
          : 'All medications prescribed to you by your doctors.'}
      </Typography>

      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {!loading && list.length === 0 && !error && (
        <Typography color="text.secondary">No prescriptions found.</Typography>
      )}

      {!loading && list.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                {isDoctor && <TableCell><b>Patient</b></TableCell>}
                <TableCell><b>Medication</b></TableCell>
                <TableCell><b>Dosage</b></TableCell>
                <TableCell><b>Instructions</b></TableCell>
                <TableCell><b>Duration</b></TableCell>
                <TableCell><b>Date</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.map(p => (
                <TableRow key={p.id} hover>
                  {isDoctor && <TableCell>{p.patient_name || '—'}</TableCell>}
                  <TableCell>
                    <Typography fontWeight={600}>{p.medication}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={p.dosage || '—'} size="small" />
                  </TableCell>
                  <TableCell>{p.instructions || '—'}</TableCell>
                  <TableCell>{p.duration     || '—'}</TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
