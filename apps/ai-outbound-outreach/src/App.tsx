import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import CampaignBuilder from './pages/CampaignBuilder'
import Contacts from './pages/Contacts'
import Scripts from './pages/Scripts'
import Videos from './pages/Videos'
import Analytics from './pages/Analytics'
import Leads from './pages/Leads'
import BrandKit from './pages/BrandKit'
import Integrations from './pages/Integrations'
import Settings from './pages/Settings'
import Team from './pages/Team'
import PublicVideoPage from './pages/PublicVideoPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/campaigns/new" element={<CampaignBuilder />} />
      <Route path="/campaigns/:id" element={<CampaignBuilder />} />
      <Route path="/campaigns/:id/contacts" element={<Contacts />} />
      <Route path="/campaigns/:id/scripts" element={<Scripts />} />
      <Route path="/campaigns/:id/videos" element={<Videos />} />
      <Route path="/videos" element={<Videos />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/settings/brand" element={<BrandKit />} />
      <Route path="/settings/integrations" element={<Integrations />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/settings/team" element={<Team />} />
      <Route path="/v/:slug" element={<PublicVideoPage />} />
    </Routes>
  )
}

export default App
