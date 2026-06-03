import React from 'react'
import ReactDOM from 'react-dom/client'
import OpenAIUGC from './App.jsx'

const root = document.getElementById('ugc-app')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <OpenAIUGC />
    </React.StrictMode>
  )
}