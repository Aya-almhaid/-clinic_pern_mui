import { useState, useEffect } from 'react';
import {
  Box, Typography, Rating, TextField, Button,
  Alert, Paper, Divider, Chip, CircularProgress
} from '@mui/material';
import api from '../api/client.js';

export default function SubmitFeedbackPage() {
  const [rating, setRating]       = useState(0);
  const [comment, setComment]     = useState('');
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [myList, setMyList]       = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    api.get('/feedback/me')
      .then(res => setMyList(Array.isArray(res.data) ? res.data : []))
      .catch(() => setMyList([]))
      .finally(() => setListLoading(false));
  }, [success]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) return setError('Please select a star rating.');
    setError('');
    setLoading(true);
    try {
      await api.post('/feedback', { rating, comment });
      setSuccess(true);
      setRating(0);
      setComment('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  }

  const statusColor = { pending: 'warning', approved: 'success', rejected: 'error' };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>

      {/* Form */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Submit Feedback
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Share your experience with us.
        </Typography>

        {success && <Alert severity="success" sx={{ mb: 2 }}>Feedback submitted! Awaiting approval.</Alert>}
        {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}
             sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          <Box>
            <Typography component="legend" fontWeight={600} mb={1}>
              Your Rating
            </Typography>
            <Rating
              value={rating}
              onChange={(_, val) => setRating(val)}
              size="large"
            />
          </Box>

          <TextField
            label="Comment"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {/* My past submissions */}
      <Typography variant="h6" fontWeight={700} mb={2}>
        My Previous Submissions
      </Typography>

      {listLoading && <CircularProgress size={24} />}

      {!listLoading && myList.length === 0 && (
        <Typography color="text.secondary">You haven't submitted any feedback yet.</Typography>
      )}

      {myList.map(f => (
        <Paper key={f.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Rating value={f.rating} readOnly size="small" />
            <Chip
              label={f.status}
              color={statusColor[f.status]}
              size="small"
            />
          </Box>
          <Typography variant="body2">{f.comment}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(f.created_at).toLocaleDateString()}
          </Typography>
        </Paper>
      ))}

    </Box>
  );
}
