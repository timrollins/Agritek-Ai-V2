import { useState, useEffect } from 'react'
import '../styles/Dashboard.css'
import { useLocation } from '../hooks/useLocation'
import { useWeather } from '../hooks/useWeather'

export default function Dashboard({ onNavigate }) {
  // Fetch user location based on GPS
  const { userLocation, coordinates } = useLocation()
  
  // Fetch weather data based on coordinates and location
  const weather = useWeather(coordinates, userLocation)

  // Load actual plants from localStorage
  const [plants, setPlants] = useState([])
  
  // Load plants on component mount
  useEffect(() => {
    const stored = localStorage.getItem('agritek_plants')
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((p) => ({
          ...p,
          dateAdded: p.dateAdded ? new Date(p.dateAdded) : new Date()
        }))
        setPlants(parsed)
      } catch (err) {
        console.error('Failed to parse stored plants', err)
        setPlants([])
      }
    }
  }, [])



  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🌳 Agritek Dashboard</h1>
          <p>Manage your garden efficiently with AI-powered insights</p>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Weather Section */}
        <section className="section weather-section">
          <h2>🌤️ Weather Forecast</h2>
          <div className="weather-main">
            <div className="weather-info">
              <h3>{weather.location}</h3>
              <p className="temperature">{weather.temperature}°C</p>
              <p className="condition">{weather.condition}</p>
              <p className="humidity">💧 Humidity: {weather.humidity}%</p>
            </div>
          </div>
          <div className="weather-forecast">
            {weather.forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <p className="day">{day.day}</p>
                {day.date && <p className="date" style={{ fontSize: '12px', color: '#666' }}>{day.date}</p>}
                <p className="emoji">{day.condition}</p>
                <p className="temp">{day.temp}°C</p>
                {day.description && <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0 0' }}>{day.description}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Plants Section */}
        <section className="section plants-section">
          <h2>Your Plants Summary</h2>
          {plants.length === 0 ? (
            <div className="empty-message">
              <p>No plants added yet. Start adding plants to see them here!</p>
              <button 
                className="btn-add-plant"
                onClick={() => onNavigate('my-plants')}
              >
                Add Your First Plant
              </button>
            </div>
          ) : (
            <div className="plants-grid">
            {plants.map(plant => (
                <div 
                  key={plant.id} 
                  className="plant-card clickable"
                  onClick={() => onNavigate('my-plants', plant.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="plant-icon">{plant.icon}</div>
                  <h3>{plant.name}</h3>
                  <p className="plant-type">{plant.type}</p>
                  <div className="plant-details">
                    <div className="detail">
                      <span className="label">� Days Since Added:</span>
                      <span className="value">{Math.floor((Date.now() - plant.dateAdded) / (24 * 60 * 60 * 1000))} days</span>
                    </div>
                    <div className="detail">
                      <span className="label">💚 Health:</span>
                      <span className={`value health-${(plant.healthStatus || plant.health || 'Good').toLowerCase()}`}>{plant.healthStatus || plant.health || 'Good'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
