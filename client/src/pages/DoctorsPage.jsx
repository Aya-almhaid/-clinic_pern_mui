import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Avatar, Chip,
  CircularProgress, Alert, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import api from '../api/client.js';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/doctors')
      .then(res => setDoctors(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load doctors.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter doctors by name or specialty — runs in the browser, no extra API call
  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Our Doctors</Typography>
      <Typography color="text.secondary" mb={3}>
        Meet our experienced medical team.
      </Typography>

      {/* Search bar */}
      <TextField
        placeholder="Search by name or specialty..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {error   && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {!loading && filtered.length === 0 && !error && (
        <Typography color="text.secondary">No doctors found.</Typography>
      )}

      <Grid container spacing={3}>
        {filtered.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
              <Avatar
                sx={{ bgcolor: 'secondary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}
              >
                <LocalHospitalIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{doc.name}</Typography>
              <Chip label={doc.specialty} color="primary" size="small" sx={{ mt: 1, mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {doc.bio || 'No bio available.'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
