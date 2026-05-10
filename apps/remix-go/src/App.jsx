import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { observer } from 'mobx-react'
import Index from './pages/Index'
import Edit from './pages/Edit'
import Publish from './pages/Publish'
import Settings from './pages/Settings'
import { ModalProvider } from './components/ModalProvider'
import { StoreProvider, useStore } from './stores/StoreProvider'
import './App.css'

const AppContent = observer(() => {
  const store = useStore()

  useEffect(() => {
    store.initialize()
  }, [store])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/publish" element={<Publish />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  )
})

function App() {
  return (
    <StoreProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </StoreProvider>
  )
}

export default App
