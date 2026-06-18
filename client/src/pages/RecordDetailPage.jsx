import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Divider, Chip, List, ListItem, ListItemText,
  TextField, Button
} from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RecordDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [record, setRecord]               = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notes, setNotes]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const [rxForm, setRxForm]   = useState({ medication: '', dosage: '', instructions: '', duration: '' });
  const [rxLoading, setRxLoading] = useState(false);
  const [rxError, setRxError]     = useState('');
  const [rxSuccess, setRxSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/records/${id}`),
      api.get(`/prescriptions/record/${id}`),
      api.get(`/records/${id}/notes`),
    ])
      .then(([recRes, preRes, noteRes]) => {
        setRecord(recRes.data);
        setPrescriptions(Array.isArray(preRes.data) ? preRes.data : []);
        setNotes(Array.isArray(noteRes.data) ? noteRes.data : []);
      })
      .catch(() => setError('Failed to load record.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddPrescription(e) {
    e.preventDefault();
    setRxError(''); setRxSuccess('');
    setRxLoading(true);
    try {
      const res = await api.post('/prescriptions', { record_id: Number(id), ...rxForm });
      setPrescriptions(prev => [...prev, res.data]);
      setRxForm({ medication: '', dosage: '', instructions: '', duration: '' });
      setRxSuccess('Prescription added.');
    } catch (err) {
      setRxError(err.response?.data?.message || 'Failed to add prescription.');
    } finally {
      setRxLoading(false);
    }
  }

  if (loading) return <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error)   return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
  if (!record) return null;

  return (
    <Box sx={{ maxWidth: 750, mx: 'auto', py: 4 }}>

      {/* Diagnosis */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>Medical Record</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(record.created_at).toLocaleString()}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>DIAGNOSIS</Typography>
        <Typography variant="body1" mb={2}>{record.diagnosis}</Typography>
        {record.notes && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>NOTES</Typography>
            <Typography variant="body2">{record.notes}</Typography>
          </>
        )}
      </Paper>

      {/* Prescriptions */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Prescriptions</Typography>
        {prescriptions.length === 0
          ? <Typography color="text.secondary">No prescriptions for this record.</Typography>
          : prescriptions.map(p => (
            <Box key={p.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography fontWeight={700}>{p.medication}
                <Chip label={p.dosage} size="small" sx={{ ml: 1 }} />
              </Typography>
              {p.instructions && <Typography variant="body2">{p.instructions}</Typography>}
              {p.duration     && <Typography variant="caption" color="text.secondary">Duration: {p.duration}</Typography>}
            </Box>
          ))
        }
      </Paper>

      {/* Add Prescription — doctors only */}
      {user?.role === 'doctor' && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Add Prescription</Typography>
          {rxError   && <Alert severity="error"   sx={{ mb: 2 }}>{rxError}</Alert>}
          {rxSuccess && <Alert severity="success" sx={{ mb: 2 }}>{rxSuccess}</Alert>}
          <Box component="form" onSubmit={handleAddPrescription}
               sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Medication" value={rxForm.medication} required fullWidth
                onChange={e => setRxForm(f => ({ ...f, medication: e.target.value }))}
              />
              <TextField
                label="Dosage" value={rxForm.dosage} required fullWidth
                onChange={e => setRxForm(f => ({ ...f, dosage: e.target.value }))}
                placeholder="e.g. 500mg"
              />
            </Box>
            <TextField
              label="Instructions" value={rxForm.instructions} fullWidth multiline rows={2}
              onChange={e => setRxForm(f => ({ ...f, instructions: e.target.value }))}
              placeholder="e.g. Take twice daily with food"
            />
            <TextField
              label="Duration" value={rxForm.duration} fullWidth
              onChange={e => setRxForm(f => ({ ...f, duration: e.target.value }))}
              placeholder="e.g. 7 days"
            />
            <Button type="submit" variant="contained" disabled={rxLoading} sx={{ alignSelf: 'flex-start' }}>
              {rxLoading ? 'Adding…' : 'Add Prescription'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Follow-up notes */}
      {notes.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>Follow-up Notes</Typography>
          <List disablePadding>
            {notes.map((n, i) => (
              <ListItem key={n.id} divider={i < notes.length - 1} alignItems="flex-start">
                <ListItemText
                  primary={n.note}
                  secondary={new Date(n.created_at).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
