import React, { Fragment, ReactNode } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Stack } from '@mui/material';
import { IonContent } from '@ionic/react';

import Alert from './Alert';

interface ComponentProps {
  useBindingContainer?: boolean;
  children?: ReactNode;
}

const CustomPage: React.FC<ComponentProps> = ({ useBindingContainer = true, children = [] }: ComponentProps) => {
  
  const theme: any = createTheme({
    palette: {
      primary: {
        main: "#6A11CB",     // purple
        light: "#9D5CFF",
        dark: "#4C0FA3",
      },
      secondary: {
        main: "#E53935",     // red
        light: "#FF6F60",
        dark: "#B71C1C",
      }
    },
    shape: {
      borderRadius: 5,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none'
          }
        }
      }
    }
  });

  const [open, setOpen] = React.useState(false);
  const [apiKey, setApiKey] = React.useState('');

  React.useEffect(() => {
    const handler = () => {
      try {
        const existing = localStorage.getItem('OPENAI_API_KEY') || (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
        setApiKey(existing || '');
      } catch {
        setApiKey('');
      }
      setOpen(true);
    };
    window.addEventListener('open-api-key-dialog', handler);
    return () => window.removeEventListener('open-api-key-dialog', handler);
  }, []);

  const saveKey = () => {
    try {
      if (apiKey && apiKey.trim().length > 0) {
        localStorage.setItem('OPENAI_API_KEY', apiKey.trim());
      }
      setOpen(false);
      // Notify listeners that API key availability changed
      try { window.dispatchEvent(new Event('openai-api-key-updated')); } catch {}
    } catch {
      setOpen(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <IonContent forceOverscroll={false}>
        <Container maxWidth={useBindingContainer ? "lg" : false} disableGutters={!useBindingContainer}>
          <Box sx={{ width: '100%' }}>
            {children}
          </Box>
        </Container>
        <Alert />

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Enable AI Tips & Edits</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="OpenAI API Key"
                placeholder="sk-..."
                fullWidth
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                autoFocus
              />
              <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                Your key is stored locally in your browser (localStorage) and used only from your device.
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button color="warning" onClick={() => { try { localStorage.removeItem('OPENAI_API_KEY'); } catch {} setApiKey(''); try { window.dispatchEvent(new Event('openai-api-key-updated')); } catch {} setOpen(false); }}>Clear</Button>
            <Button variant="contained" onClick={saveKey}>Save</Button>
          </DialogActions>
        </Dialog>
      </IonContent>
    </ThemeProvider>
  );
};

export default CustomPage;