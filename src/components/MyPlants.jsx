import { useState, useEffect, useRef } from 'react'
import '../styles/MyPlants.css'
import AddPlantModal from './AddPlantModal'

export default function MyPlants({ selectedPlantId }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [plants, setPlants] = useState([
    {
      id: 1,
      name: 'Tomato',
      type: 'Vegetable',
      dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      health: 'Excellent',
      icon: '🍅',
      waterFrequency: 'Daily',
      soilType: 'Loamy',
      sunlight: '6-8 hours',
      temperature: '70-85°F',
      humidity: '60-70%',
      description: 'Thriving tomato plant with excellent growth. Producing fruits consistently.',
      lastWatered: '2 hours ago',
      nextWatering: 'Tomorrow morning'
    },
    {
      id: 2,
      name: 'Basil',
      type: 'Herb',
      dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      health: 'Good',
      icon: '🌿',
      waterFrequency: '3-4 times per week',
      soilType: 'Well-draining',
      sunlight: '6-8 hours',
      temperature: '65-75°F',
      humidity: '50-60%',
      description: 'Healthy basil plant, perfect for culinary use. Regular pruning recommended.',
      lastWatered: '1 day ago',
      nextWatering: 'In 2 days'
    },
    {
      id: 3,
      name: 'Lettuce',
      type: 'Vegetable',
      dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      health: 'Good',
      icon: '🥬',
      waterFrequency: 'Every 2-3 days',
      soilType: 'Rich loam',
      sunlight: '4-6 hours',
      temperature: '60-70°F',
      humidity: '65-75%',
      description: 'Young lettuce plant growing steadily. Ready for partial harvest in 1-2 weeks.',
      lastWatered: '12 hours ago',
      nextWatering: 'In 1 day'
    },
    {
      id: 4,
      name: 'Mint',
      type: 'Herb',
      dateAdded: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      health: 'Excellent',
      icon: '🌱',
      waterFrequency: '2-3 times per week',
      soilType: 'Well-draining',
      sunlight: '4-6 hours',
      temperature: '60-75°F',
      humidity: '50-60%',
      description: 'Mature mint plant with vigorous growth. Excellent for tea and recipes.',
      lastWatered: '3 hours ago',
      nextWatering: 'In 2 days'
    }
  ])

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
        {plants.map(plant => (
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
                <span className={`health-badge health-${plant.health.toLowerCase()}`}>
                  ♥ {plant.health}
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
          </div>
        ))}
      </div>

      <button className="fab-button" title="Add new plant" onClick={() => setIsModalOpen(true)}>
        ➕
      </button>

      <AddPlantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPlant={(newPlant) => setPlants([...plants, newPlant])}
      />
    </div>
  )
}
