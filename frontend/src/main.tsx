import React from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './style.css';
import { App } from './App';
const theme = createTheme({
  primaryColor: 'forest',
  colors: {
    forest: [
      '#edf7f0',
      '#d7ecdf',
      '#afd8be',
      '#83c29a',
      '#60b07b',
      '#499c65',
      '#367d50',
      '#24623e',
      '#174c3c',
      '#123e31',
    ],
  },
  fontFamily: 'Segoe UI, Arial, sans-serif',
  defaultRadius: 'md',
  headings: { fontFamily: 'Segoe UI, Arial, sans-serif' },
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
