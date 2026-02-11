// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './App.css';

// Importação de bibliotecas externas
import '@fortawesome/fontawesome-free/css/all.min.css';
import '@govbr-ds/core/dist/core.min.css';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Tipagem do rootElement como HTMLElement | null
const rootElement = document.getElementById('root') as HTMLElement | null;

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}
      scriptProps={{
        async: false,
        defer: false,
        appendTo: 'head',
        nonce: undefined,
      }}
    >

      <React.StrictMode>
        <App />
      </React.StrictMode>

    </GoogleReCaptchaProvider>
  );
} else {
  console.error('Elemento root não encontrado no HTML.');
}
