/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Admin from './components/Admin';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const isAiStudio = 
  typeof window !== 'undefined' && 
  (window.location.hostname.includes('ais-dev-') || 
   window.location.hostname.includes('localhost') || 
   window.location.hostname.includes('127.0.0.1'));

const isAdmin = window.location.pathname.startsWith('/admin') && isAiStudio;

root.render(
  <React.StrictMode>
    {isAdmin ? <Admin /> : <App />}
  </React.StrictMode>
);