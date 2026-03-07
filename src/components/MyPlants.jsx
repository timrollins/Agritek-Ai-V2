import { useState, useEffect, useRef } from 'react'
import '../styles/MyPlants.css'
import AddPlantModal from './AddPlantModal'

export default function MyPlants({ selectedPlantId }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [plants, setPlants] = useState([])

  // Load plants from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem('agritek_plants')
    if (!stored) return

    try {
      const parsed = JSON.parse(stored).map((p) => ({
        ...p,
        // Ensure dateAdded is a Date object again for calculations
        dateAdded: p.dateAdded ? new Date(p.dateAdded) : new Date()
      }))
      setPlants(parsed)
    } catch (err) {
      console.error('Failed to parse stored plants', err)
    }
  }, [])

  // Persist plants to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('agritek_plants', JSON.stringify(plants))
  }, [plants])

  const plantRefs = useRef({})

  const handleDeletePlant = (plantId) => {
    if (confirm('Are you sure you want to remove this plant?')) {
      setPlants(plants.filter(plant => plant.id !== plantId))
    }
  }

  useEffect(() => {
    if (selectedPlantId && plantRefs.current[selectedPlantId]) {
      plantRefs.current[selectedPlantId].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedPlantId])

  return (
    <div className="my-plants">
      <header className="plants-header">
        <h1>🌾 My Plants</h1>
        <p>Detailed view of all your plants</p>
      </header>

      <div className="plants-container">
        {plants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-content">
              <h2>🌱 No plants yet</h2>
              <p>Start by adding your first plant to track and manage it.</p>
              <div className="example-plant-template">
                <h3>📋 Example Plant Format:</h3>
                <div className="template-card">
                  <p><strong>Name:</strong> Tomato</p>
                  <p><strong>Type:</strong> Vegetable</p>
                  <p><strong>Icon:</strong> 🍅</p>
                  <p><strong>Water Frequency:</strong> Daily</p>
                  <p><strong>Soil Type:</strong> Loamy</p>
                  <p><strong>Sunlight:</strong> 6-8 hours</p>
                  <p><strong>Temperature:</strong> 70-85°F</p>
                  <p><strong>Humidity:</strong> 60-70%</p>
                </div>
              </div>
              <button
                className="fab-button inline"
                onClick={() => setIsModalOpen(true)}
                title="Add first plant"
              >
                add plant
              </button>
            </div>
          </div>
        ) : (
          plants.map(plant => (
          <div
            key={plant.id}
            ref={el => plantRefs.current[plant.id] = el}
            className={`plant-detail-card ${selectedPlantId === plant.id ? 'highlighted' : ''}`}
          >
            <div className="plant-header">
              <div className="plant-icon-large">{plant.icon}</div>
              <div className="plant-info-header">
                <h2>{plant.name}</h2>
                <p className="plant-type-label">{plant.type}</p>
                <span className={`health-badge health-${(plant.healthStatus || plant.health || 'Good').toLowerCase()}`}>
                  ♥ {plant.healthStatus || plant.health}
                </span>
              </div>
              <button
                className="delete-plant-btn"
                onClick={() => handleDeletePlant(plant.id)}
                title="Remove plant"
              >
                🗑️
              </button>
            </div>

            <div className="plant-stats">
              <div className="stat">
                <span className="stat-icon">�</span>
                <div className="stat-content">
                  <p className="stat-label">Days Since Added</p>
                  <p className="stat-value">{Math.floor((Date.now() - plant.dateAdded) / (24 * 60 * 60 * 1000))} days</p>
                </div>
              </div>
              <div className="stat">
                <span className="stat-icon">💧</span>
                <div className="stat-content">
                  <p className="stat-label">Watering</p>
                  <p className="stat-value">{plant.waterFrequency}</p>
                </div>
              </div>
              <div className="stat">
                <span className="stat-icon">☀️</span>
                <div className="stat-content">
                  <p className="stat-label">Sunlight</p>
                  <p className="stat-value">{plant.sunlight}</p>
                </div>
              </div>
            </div>

            <div className="plant-details-section">
              <h3>Growing Conditions</h3>
              <div className="conditions-grid">
                <div className="condition-item">
                  <p className="condition-label">Soil Type</p>
                  <p className="condition-value">{plant.soilType}</p>
                </div>
                <div className="condition-item">
                  <p className="condition-label">Temperature</p>
                  <p className="condition-value">{plant.temperature}</p>
                </div>
                <div className="condition-item">
                  <p className="condition-label">Humidity</p>
                  <p className="condition-value">{plant.humidity}</p>
                </div>
              </div>
            </div>

            <div className="plant-details-section">
              <h3>Watering Schedule</h3>
              <div className="watering-info">
                <div className="watering-item">
                  <p className="watering-label">Last Watered</p>
                  <p className="watering-value">{plant.lastWatered}</p>
                </div>
                <div className="watering-item">
                  <p className="watering-label">Next Watering</p>
                  <p className="watering-value">{plant.nextWatering}</p>
                </div>
              </div>
            </div>

            <div className="plant-description">
              <h3>🤖 AI Recommendations & Notes</h3>
              <p>{plant.description}</p>
            </div>

            <div className="plant-actions-row">
              <button
                type="button"
                className="check-health-btn"
                disabled
                title="Health check unavailable"
              >
                🩺 Check Health Status
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      <button className="fab-button" title="Add new plant" onClick={() => setIsModalOpen(true)}>
        add plant
      </button>

      <AddPlantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPlant={(newPlant) => setPlants([...plants, newPlant])}
      />


    </div>
  )
}
