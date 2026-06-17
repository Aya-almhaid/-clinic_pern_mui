import { useState } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Alert, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

export default function NewRecordPage() {
  // useState: each line creates one form field variable
  const [patientId, setPatientId] = useState('');   // patient's ID number
  const [diagnosis, setDiagnosis] = useState('');   // what the doctor diagnosed
  const [notes, setNotes]         = useState('');   // extra notes (optional)
  const [loading, setLoading]     = useState(false);// true while saving
  const [error, setError]         = useState('');   // error message if save fails

  const navigate = useNavigate(); // used to go to another page after saving

  // This function runs when the doctor clicks Submit
  async function handleSubmit(e) {
    e.preventDefault();          // stop the page from refreshing
    setError('');                // clear any old error
    setLoading(true);            // show the spinner

    try {
      // Send the data to the backend
      await api.post('/records', {
        patient_id: Number(patientId), // convert text to number
        diagnosis,
        notes,
      });

      // If it worked, go to the dashboard
      navigate('/dashboard');
    } catch (err) {
      // If it failed, show the error message
      setError(err.response?.data?.message || 'Failed to save record.');
    } finally {
      setLoading(false); // hide the spinner
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          New Medical Record
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Fill in the patient's diagnosis and notes.
        </Typography>

        {/* Show error if something went wrong */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* The form */}
        <Box component="form" onSubmit={handleSubmit}
             sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Patient ID field */}
          <TextField
            label="Patient ID"
            type="number"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            required
            fullWidth
            helperText="Enter the patient's user ID number"
          />

          {/* Diagnosis field */}
          <TextField
            label="Diagnosis"
            multiline
            rows={4}
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            required
            fullWidth
          />

          {/* Notes field */}
          <TextField
            label="Notes (optional)"
            multiline
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
          />

          {/* Submit button */}
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Record'}
          </Button>

        </Box>
      </Paper>
    </Box>
  );
}
