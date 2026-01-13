import React from 'react';
import { createRoot } from 'react-dom/client';
import DocsPage from './DocsPage';
import './index.css'; // Ensure styles are applied if not already handling in DocsPage

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DocsPage />
  </React.StrictMode>
);
