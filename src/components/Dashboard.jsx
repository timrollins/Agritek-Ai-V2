import { useState } from 'react'
import '../styles/Dashboard.css'
import { useLocation } from '../hooks/useLocation'
import { useWeather } from '../hooks/useWeather'

export default function Dashboard({ onNavigate }) {
  // Fetch user location based on GPS
  const { userLocation, coordinates } = useLocation()
  
  // Fetch weather data based on coordinates and location
  const weather = useWeather(coordinates, userLocation)

  // Pseudo data for plants
  const [plants] = useState([
    {
      id: 1,
      name: 'Tomato',
      type: 'Vegetable',
      dateAdded: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      health: 'Excellent',
      icon: '🍅'
    },
    {
      id: 2,
      name: 'Basil',
      type: 'Herb',
      dateAdded: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      health: 'Good',
      icon: '🌿'
    },
    {
      id: 3,
      name: 'Lettuce',
      type: 'Vegetable',
      dateAdded: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      health: 'Good',
      icon: '🥬'
    },
    {
      id: 4,
      name: 'Mint',
      type: 'Herb',
      dateAdded: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      health: 'Excellent',
      icon: '🌱'
    }
  ])

  // Pseudo Gemini recommendations
  const recommendations = [
    {
      id: 1,
      plant: 'Tomato',
      recommendation: 'Water deeply in the morning. Ensure soil stays moist but not waterlogged.',
      priority: 'high',
      icon: '💧'
    },
    {
      id: 2,
      plant: 'Lettuce',
      recommendation: 'Provide shade during afternoon hours to prevent bolting in warm weather.',
      priority: 'medium',
      icon: '🌞'
    },
    {
      id: 3,
      plant: 'Basil',
      recommendation: 'Pinch off flower buds to encourage leaf growth and extend harvest season.',
      priority: 'low',
      icon: '✂️'
    },
    {
      id: 4,
      plant: 'Mint',
      recommendation: 'Harvest leaves regularly to promote bushier growth and prevent flowering.',
      priority: 'medium',
      icon: '🌿'
    }
  ]

  // Helper function to get recommendation for a plant
  const getRecommendation = (plantName) => {
    return recommendations.find(rec => rec.plant === plantName)
  }

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
          <h2>🌾 Your Plants</h2>
          <div className="plants-grid">
            {plants.map(plant => {
              const rec = getRecommendation(plant.name)
              return (
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
                      <span className={`value health-${plant.health.toLowerCase()}`}>{plant.health}</span>
                    </div>
                  </div>
                  {rec && (
                    <div className={`plant-recommendation priority-${rec.priority}`}>
                      <div className="rec-header-card">
                        <span className="rec-icon">{rec.icon}</span>
                        <span className={`priority-badge-card ${rec.priority}`}>{rec.priority}</span>
                      </div>
                      <p className="rec-text-card">{rec.recommendation}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
