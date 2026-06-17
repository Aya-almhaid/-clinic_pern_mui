import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import api from '../api/client.js';

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const res = await api.get('/feedback/approved');
        setFeedbacks(res.data.feedback);
      } catch (err) {
        setError('Failed to load feedback. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []); // ← empty array = run once on mount

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Patient Feedback
      </Typography>
      <Typography color="text.secondary" mb={3}>
        What our patients say about us
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* States */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && feedbacks.length === 0 && (
        <Typography color="text.secondary" textAlign="center" mt={6}>
          No approved feedback yet.
        </Typography>
      )}

      {/* Feedback Cards */}
      {!loading && !error && feedbacks.length > 0 && (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
          gap={3}
        >
          {feedbacks.map((fb) => (
            <Card key={fb.id} elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent>
                {/* Quote icon */}
                <FormatQuoteIcon color="primary" sx={{ mb: 1 }} />

                {/* Feedback text */}
                <Typography variant="body1" mb={2} fontStyle="italic">
                  "{fb.comment}"
                </Typography>

                {/* Rating (optional field) */}
                {fb.rating && (
                  <Rating value={fb.rating} readOnly size="small" sx={{ mb: 1 }} />
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Patient info */}
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                    {fb.name?.[0] ?? 'P'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {fb.name ?? 'Anonymous'}
                    </Typography>
                    {fb.created_at && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(fb.created_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label="Approved"
                    color="success"
                    size="small"
                    sx={{ ml: 'auto' }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}