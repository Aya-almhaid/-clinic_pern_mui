import { useState } from 'react';
import { Box, Grid, Paper, Typography, TextField, Button, Alert, Divider } from '@mui/material';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Contact Us</Typography>
      <Typography color="text.secondary" mb={4}>
        We'd love to hear from you. Fill out the form and we'll get back to you shortly.
      </Typography>

      <Grid container spacing={4}>

        {/* Left — form */}
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <Box component="form" onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {sent && <Alert severity="success">Message sent successfully!</Alert>}

              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Message"
                name="message"
                multiline
                rows={4}
                value={form.message}
                onChange={handleChange}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" size="large">
                Send Message
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right — clinic info */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Clinic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography>📍 123 Health Street, Medical City</Typography>
              <Typography>📞 +1 (555) 123-4567</Typography>
              <Typography>✉️  contact@cliniccare.com</Typography>
              <Typography>🕐 Mon Sunday: 8am – 6pm</Typography>
              <Typography>🕐 Saturday: 9am – 2pm</Typography>
              <Typography>🚫 Friday: Closed</Typography>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
