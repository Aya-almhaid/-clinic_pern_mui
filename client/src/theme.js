import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0' },
    secondary: { main: '#00897b' },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, sans-serif',
  },
});

export default theme;
