import { Box, Typography, Button, Card, CardContent, Rating, Skeleton, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: feedbacks, loading } = useFetch('/feedback/approved');
  const displayed = (feedbacks?.feedback || []).slice(0, 3);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Welcome to ClinicCare
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Your health is our priority
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate('/appointments/book')}
        sx={{ my: 2 }}
      >
        Book Appointment
      </Button>

      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
        What Our Patients Say
      </Typography>

      <Grid container spacing={2}>
        {loading
          ? [1, 2, 3].map((n) => (
              <Grid item xs={12} md={4} key={n}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width={120} />
                    <Skeleton variant="text" />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : displayed.length === 0
          ? (
              <Grid item xs={12}>
                <Typography color="text.secondary">No feedback yet.</Typography>
              </Grid>
            )
          : displayed.map((f) => (
              <Grid item xs={12} md={4} key={f.id}>
                <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Rating value={f.rating} readOnly size="small" />
                    <Typography sx={{ mt: 1 }}>{f.comment}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      — {f.name || f.user_name || 'Patient'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
        }
      </Grid>
    </Box>
  );
}