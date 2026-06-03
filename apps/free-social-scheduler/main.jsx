import React from 'react'
import ReactDOM from 'react-dom/client'
import FreeSocialScheduler from './App.jsx'

const root = document.getElementById('scheduler-app')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <FreeSocialScheduler />
    </React.StrictMode>
  )
}