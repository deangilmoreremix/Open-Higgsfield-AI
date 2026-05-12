import React from 'react';
import { createRoot } from 'react-dom/client';
import AgentStudio from './components/AgentStudio';

const apiKey = window.location.search.split('apiKey=')[1]?.split('&')[0] || '';

const root = createRoot(document.getElementById('root'));
root.render(<AgentStudio apiKey={apiKey} />);
