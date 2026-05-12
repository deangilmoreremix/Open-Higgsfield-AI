import React from 'react';
import { createRoot } from 'react-dom/client';
import MarketingStudio from './components/MarketingStudio';

const apiKey = window.location.search.split('apiKey=')[1]?.split('&')[0] || '';

const root = createRoot(document.getElementById('root'));
root.render(<MarketingStudio apiKey={apiKey} />);
