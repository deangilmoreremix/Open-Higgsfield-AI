import React from 'react'
import ReactDOM from 'react-dom/client'
import AIShortsGenerator from './App.jsx'

const root = document.getElementById('shorts-app')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AIShortsGenerator />
    </React.StrictMode>
  )
}