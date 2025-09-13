import React, { ReactNode } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Container, Box } from '@mui/material';
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

  return (
    <ThemeProvider theme={theme}>
      <IonContent forceOverscroll={false}>
        <Container maxWidth={useBindingContainer ? "lg" : false} disableGutters={!useBindingContainer}>
          <Box sx={{ width: '100%' }}>
            {children}
          </Box>
        </Container>
        <Alert />
      </IonContent>
    </ThemeProvider>
  );
};

export default CustomPage;