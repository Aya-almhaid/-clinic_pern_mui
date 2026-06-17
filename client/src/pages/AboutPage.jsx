import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GroupsIcon from '@mui/icons-material/Groups';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const stats = [
  { icon: <LocalHospitalIcon fontSize="large" color="primary" />, value: '15+', label: 'Years of Service' },
  { icon: <GroupsIcon fontSize="large" color="primary" />, value: '120+', label: 'Doctors & Staff' },
  { icon: <VerifiedIcon fontSize="large" color="primary" />, value: '50,000+', label: 'Patients Treated' },
  { icon: <AccessTimeIcon fontSize="large" color="primary" />, value: '24/7', label: 'Available Support' },
];

const specialties = [
  'General Medicine', 'Cardiology', 'Dermatology',
  'Pediatrics', 'Orthopedics', 'Neurology',
  'Gynecology', 'Ophthalmology', 'Dentistry',
];

export default function AboutPage() {
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>

      {/* Mission */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        About ClinicCare
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
        ClinicCare was founded in 2010 with a single mission: to make quality healthcare
        accessible to everyone. We believe that every patient deserves timely, compassionate,
        and professional medical care. Our platform connects patients with experienced doctors,
        streamlines appointment booking, and keeps your medical records organized and secure
        in one place.
      </Typography>

      <Divider sx={{ mb: 4 }} />

      {/* Stats */}
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Our Numbers
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {stats.map((s) => (
          <Grid item xs={6} sm={3} key={s.label}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
              {s.icon}
              <Typography variant="h5" fontWeight={700} mt={1}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Specialties */}
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Our Specialties
      </Typography>
      <Grid container spacing={2}>
        {specialties.map((s) => (
          <Grid item xs={12} sm={4} key={s}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body1" fontWeight={500}>{s}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

    </Box>
  );
}
