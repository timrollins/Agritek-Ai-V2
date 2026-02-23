import { useState } from 'react'
import './styles/App.css'
import Navigation from './components/Navigation'
import Dashboard from './components/Dashboard'
import MyPlants from './components/MyPlants'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedPlantId, setSelectedPlantId] = useState(null)

  const handleNavigate = (page, plantId = null) => {
    setCurrentPage(page)
    if (plantId) {
      setSelectedPlantId(plantId)
    }
  }

  return (
    <div className="app-wrapper">
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'my-plants' && <MyPlants selectedPlantId={selectedPlantId} />}
    </div>
  )
}

export default App
