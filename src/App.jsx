import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import ExecutiveDashboard from './components/Dashboard/ExecutiveDashboard'
import IncidentList from './components/Register/IncidentList'
import IncidentDetails from './components/Register/IncidentDetails'
import ActionList from './components/Actions/ActionList'
import CostTracker from './components/CostLegal/CostTracker'
import LegalItems from './components/CostLegal/LegalItems'

const pageTitles = {
  '/': 'Executive Dashboard',
  '/incidents': 'Incident Register',
  '/actions': 'Action Items',
  '/costs': 'Cost Tracking',
  '/legal': 'Legal Items'
}

export default function App() {
  const location = useLocation()
  const basePath = '/' + location.pathname.split('/')[1]
  const title = pageTitles[basePath] || 'Incident Response'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<ExecutiveDashboard />} />
            <Route path="/incidents" element={<IncidentList />} />
            <Route path="/incidents/:id" element={<IncidentDetails />} />
            <Route path="/actions" element={<ActionList />} />
            <Route path="/costs" element={<CostTracker />} />
            <Route path="/legal" element={<LegalItems />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
