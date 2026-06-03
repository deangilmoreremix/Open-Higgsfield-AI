import React from 'react'
import ReactDOM from 'react-dom/client'
import AIInfluencerGenerator from './App.jsx'

const root = document.getElementById('influencer-app')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AIInfluencerGenerator />
    </React.StrictMode>
  )
}