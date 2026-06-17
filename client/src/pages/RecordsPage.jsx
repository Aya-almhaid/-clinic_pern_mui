import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function RecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/records/me')
      .then(res => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load records.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ maxWidth: 750, mx: 'auto', py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>My Medical Records</Typography>
      <Typography color="text.secondary" mb={3}>
        Click any record to see the full diagnosis and prescriptions.
      </Typography>

      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {!loading && records.length === 0 && !error && (
        <Typography color="text.secondary">No medical records found.</Typography>
      )}

      {records.map(r => (
        <Paper
          key={r.id}
          variant="outlined"
          onClick={() => navigate(`/records/${r.id}`)}
          sx={{
            p: 3, mb: 2, borderRadius: 2,
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' }
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            {new Date(r.created_at).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {r.diagnosis}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
