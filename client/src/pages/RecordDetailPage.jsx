import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert,
  Divider, Chip, List, ListItem, ListItemText
} from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';

export default function RecordDetailPage() {
  const { id } = useParams();
  const [record, setRecord]           = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notes, setNotes]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

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
