import { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Avatar, IconButton,
  Drawer, List, ListItemButton, ListItemText, Divider, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function go(path) {
    setOpen(false);
    navigate(path);
  }

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {/* Hamburger */}
          <IconButton color="inherit" onClick={() => setOpen(true)} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            ClinicCare
          </Typography>

          {/* Avatar */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {user?.name}
              </Typography>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </Avatar>
            </Box>
          )}

          {!user && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/register">Register</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 240, pt: 2 }}>

          {/* Public links */}
          <List>
            {[
              { label: 'Home', path: '/home' },
              { label: 'About', path: '/about' },
              { label: 'Contact', path: '/contact' },
              { label: 'Feedbacks', path: '/feedbacks' },
            ].map((item) => (
              <ListItemButton key={item.path} onClick={() => go(item.path)}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>

          {user && (
            <>
              <Divider />
              <List>
                <ListItemButton onClick={() => go('/dashboard')}>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton onClick={() => go('/profile')}>
                  <ListItemText primary="My Profile" />
                </ListItemButton>
                <ListItemButton onClick={() => go('/doctors')}>
                  <ListItemText primary="Services" />
                </ListItemButton>
                <ListItemButton onClick={() => go('/appointments')}>
                  <ListItemText primary="Appointments" />
                </ListItemButton>
                <ListItemButton onClick={() => go('/feedback/submit')}>
                  <ListItemText primary="Submit Feedback" />
                </ListItemButton>

                {user.role === 'patient' && (
                  <>
                    <ListItemButton onClick={() => go('/appointments/book')}>
                      <ListItemText primary="Book Appointment" />
                    </ListItemButton>
                    <ListItemButton onClick={() => go('/records')}>
                      <ListItemText primary="My Records" />
                    </ListItemButton>
                    <ListItemButton onClick={() => go('/prescriptions')}>
                      <ListItemText primary="Prescriptions" />
                    </ListItemButton>
                  </>
                )}

                {user.role === 'doctor' && (
                  <>
                    <ListItemButton onClick={() => go('/records/new')}>
                      <ListItemText primary="New Record" />
                    </ListItemButton>
                    <ListItemButton onClick={() => go('/admin/feedback')}>
                      <ListItemText primary="Moderate Feedback" />
                    </ListItemButton>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <ListItemButton onClick={() => go('/admin/feedback')}>
                      <ListItemText primary="Moderate Feedback" />
                    </ListItemButton>
                    <ListItemButton onClick={() => go('/admin/users')}>
                      <ListItemText primary="Manage Users" />
                    </ListItemButton>
                    <ListItemButton onClick={() => go('/admin/doctors')}>
                      <ListItemText primary="Manage Doctors" />
                    </ListItemButton>
                  </>
                )}
              </List>

              <Divider />
              <List>
                <ListItemButton onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </List>
            </>
          )}
        </Box>
      </Drawer>

      <Box component="main" sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </>
  );
}
