import { Box, Typography, Button, Card, CardContent, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    // Replace this with your real API call, e.g.:
    // fetch('/api/feedback/approved').then(res => res.json()).then(setFeedback);

    // Mock data for now:
    setFeedback([
      { id: 1, rating: 5, comment: 'Excellent service!', name: 'Sara M.' },
      { id: 2, rating: 4, comment: 'Very professional staff.', name: 'Ahmad K.' },
    ]);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to ClinicCare
      </Typography>

      <Typography variant="h6" gutterBottom>
        Your health is our priority
      </Typography>

      <Typography color="text.secondary" gutterBottom>
        Clinic overview and approved feedback will appear here.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate('/appointments/book')}
        sx={{ my: 2 }}
      >
        Book Appointment
      </Button>

      <Box component="section" sx={{ mt: 3 }}>
        {feedback.length === 0 ? (
          <Typography color="text.secondary">No feedback yet.</Typography>
        ) : (
          feedback.map((f) => (
            <Card key={f.id} sx={{ mb: 2 }}>
              <CardContent>
                <Rating value={f.rating} readOnly />
                <Typography>{f.comment}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.name}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}