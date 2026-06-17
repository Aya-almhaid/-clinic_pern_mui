import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Alert, CircularProgress, Chip, Divider, Avatar
} from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

const roleColor = { patient: 'primary', doctor: 'secondary', admin: 'error' };

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [form, setForm]       = useState({ name: '', email: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/users/me').then(res => {
      setForm({
        name:  res.data.name  || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
      });
    });
  }, []);

  async function handleProfile(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await api.patch('/users/me', form);
      updateUser(res.data);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (passwords.newPassword !== passwords.confirm)
      return setError('New passwords do not match.');
    if (passwords.newPassword.length < 6)
      return setError('New password must be at least 6 characters.');
    setPwLoading(true);
    try {
      await api.patch('/users/me', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      setSuccess('Password changed successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed.');
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>

      {/* Header */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar sx={{ bgcolor: `${roleColor[user?.role] ?? 'primary'}.main`, width: 64, height: 64, fontSize: 28 }}>
          {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>{user?.name}</Typography>
          <Typography color="text.secondary" mb={1}>{user?.email}</Typography>
          <Chip
            label={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            color={roleColor[user?.role] ?? 'default'}
            size="small"
          />
        </Box>
      </Paper>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}

      {/* Edit profile info */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>Edit Profile</Typography>
        <Box component="form" onSubmit={handleProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required fullWidth
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      <Divider sx={{ mb: 4 }} />

      {/* Change password */}
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={3}>Change Password</Typography>
        <Box component="form" onSubmit={handlePassword} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            value={passwords.currentPassword}
            onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
            required fullWidth
          />
          <TextField
            label="New Password"
            type="password"
            value={passwords.newPassword}
            onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
            required fullWidth
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={passwords.confirm}
            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
            required fullWidth
          />
          <Button type="submit" variant="outlined" disabled={pwLoading}>
            {pwLoading ? <CircularProgress size={22} color="inherit" /> : 'Change Password'}
          </Button>
        </Box>
      </Paper>

    </Box>
  );
}
