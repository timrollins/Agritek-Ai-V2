import { useState } from 'react'
import './styles/App.css'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import MyPlants from './components/MyPlants'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <div className="app-wrapper">
      <Navigation onNavigate={setCurrentPage} currentPage={currentPage} />
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'my-plants' && <MyPlants />}
    </div>
  )
}

export default App
