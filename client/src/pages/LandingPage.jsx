import { Box, Typography, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: 'white', textAlign: 'center', p: 4 }}>
      <Typography variant="h2" fontWeight={700} gutterBottom>
        ClinicCare
      </Typography>
      <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
        Your health, our priority. Book appointments and manage your records online.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" color="secondary" size="large" component={Link} to="/register">
          Get Started
        </Button>
        <Button variant="outlined" color="inherit" size="large" component={Link} to="/login">
          Login
        </Button>
      </Stack>
    </Box>
  );
}
