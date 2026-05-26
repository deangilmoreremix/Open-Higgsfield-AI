import React from 'react';
import MarketingStudio from './components/MarketingStudio';

export default function App() {
  const apiKey = import.meta.env.VITE_MUAPI_API_KEY || null;
  
  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white overflow-hidden">
      <MarketingStudio apiKey={apiKey} />
    </div>
  );
}