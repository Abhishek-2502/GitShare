import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Handle port closed errors
window.addEventListener('error', (event) => {
  if (event.message.includes('The message port closed before a response was received')) {
    event.preventDefault();
  }
});

// Optional: Filter React DevTools message
if (process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (!args[0].includes('Download the React DevTools')) {
      originalConsoleError(...args);
    }
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);