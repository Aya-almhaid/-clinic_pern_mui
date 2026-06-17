import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Rating, Chip, Button,
  CircularProgress, Alert, Divider, Stack
} from '@mui/material';
import api from '../api/client.js';

export default function ModerateFeedbackPage() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      setList(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/feedback/${id}/status`, { status });
      fetchAll();
    } catch {
      setError('Failed to update status.');
    }
  }

  const statusColor = { pending: 'warning', approved: 'success', rejected: 'error' };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Moderate Feedback
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Review and approve or reject patient feedback.
      </Typography>

      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {!loading && list.length === 0 && (
        <Typography color="text.secondary">No feedback submitted yet.</Typography>
      )}

      {list.map(f => (
        <Paper key={f.id} variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Rating value={f.rating} readOnly size="small" />
            <Chip label={f.status} color={statusColor[f.status]} size="small" />
          </Box>

          <Typography variant="body1" mb={1}>"{f.comment}"</Typography>
          <Typography variant="caption" color="text.secondary">
            By {f.name} · {new Date(f.created_at).toLocaleDateString()}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="success"
              size="small"
              disabled={f.status === 'approved'}
              onClick={() => updateStatus(f.id, 'approved')}
            >
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              disabled={f.status === 'rejected'}
              onClick={() => updateStatus(f.id, 'rejected')}
            >
              Reject
            </Button>
          </Stack>
        </Paper>
      ))}
    </Box>
  );
}
