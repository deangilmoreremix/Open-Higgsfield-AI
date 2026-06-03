import React from 'react'
import ReactDOM from 'react-dom/client'
import VidecoAIPlatform from './App.jsx'

const root = document.getElementById('videco-app')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <VidecoAIPlatform />
    </React.StrictMode>
  )
}