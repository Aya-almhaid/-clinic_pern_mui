import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Alert, CircularProgress, TextField, MenuItem, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/client.js';

const roleColor = { patient: 'primary', doctor: 'secondary', admin: 'error' };

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      setError('Failed to delete user.');
    }
  }

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: 4 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>Manage Users</Typography>
      <Typography color="text.secondary" mb={3}>
        View, filter, and delete user accounts.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filter */}
      <TextField
        select
        label="Filter by role"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        size="small"
        sx={{ mb: 3, width: 200 }}
      >
        <MenuItem value="all">All Roles</MenuItem>
        <MenuItem value="patient">Patient</MenuItem>
        <MenuItem value="doctor">Doctor</MenuItem>
        <MenuItem value="admin">Admin</MenuItem>
      </TextField>

      {loading && <CircularProgress />}

      {!loading && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Phone</b></TableCell>
                <TableCell><b>Role</b></TableCell>
                <TableCell><b>Joined</b></TableCell>
                <TableCell align="center"><b>Delete</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No users found.</TableCell>
                </TableRow>
              )}
              {filtered.map(u => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      color={roleColor[u.role]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Delete user">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(u.id, u.name)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
