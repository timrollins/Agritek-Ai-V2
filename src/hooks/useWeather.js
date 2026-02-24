import { useState, useEffect } from 'react'

/**
 * Map weather condition codes to emoji representations
 */
const getWeatherEmoji = (condition) => {
  const weatherMap = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Smoke: '💨',
    Haze: '🌫️',
    Dust: '🌪️',
    Fog: '🌫️',
    Sand: '🌪️',
    Ash: '🌫️',
    Squall: '🌪️',
    Tornado: '🌪️'
  }
  return weatherMap[condition] || '⛅'
}

/**
 * Custom hook to fetch weather data from OpenWeatherMap API
 * Includes current weather and 5-day forecast
 * @param {Object} coordinates - { latitude, longitude }
 * @param {string} userLocation - User's location name
 * @returns {Object} weather data with forecast
 */
export function useWeather(coordinates, userLocation) {
  const [weather, setWeather] = useState({
    location: 'Loading...',
    temperature: '--',
    humidity: '--',
    condition: 'Loading...',
    forecast: []
  })

  useEffect(() => {
    if (!coordinates) return

    const fetchWeather = async () => {
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY
        const baseUrl = import.meta.env.VITE_WEATHER_API_BASE_URL

        if (!apiKey || !baseUrl) {
          console.warn('Weather API credentials not configured')
          setWeather((prev) => ({
            ...prev,
            location: userLocation,
            condition: 'API not configured'
          }))
          return
        }

        // Fetch current weather
        const response = await fetch(
          `${baseUrl}/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${apiKey}&units=metric`
        )
        const data = await response.json()

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
          `${baseUrl}/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${apiKey}&units=metric`
        )
        const forecastData = await forecastResponse.json()

        if (data.main && data.weather) {
          // Use temperature in Celsius
          const temp = Math.round(data.main.temp)
          const weatherEmoji = getWeatherEmoji(data.weather[0].main)

          // Process forecast data - group by day
          const forecastByDay = {}
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (forecastData.list) {
            forecastData.list.forEach((item) => {
              const date = new Date(item.dt * 1000)
              const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

              // Store forecast if it's the first of the day or at noon (12:00)
              if (
                !forecastByDay[dateKey] ||
                Math.abs(date.getHours() - 12) < Math.abs(new Date(forecastByDay[dateKey].dt * 1000).getHours() - 12)
              ) {
                forecastByDay[dateKey] = item
              }
            })
          }

          // Convert to array and limit to 5 days
          const forecast = Object.entries(forecastByDay)
            .slice(0, 5)
            .map((entry) => {
              const [dateStr, item] = entry
              const forecastDate = new Date(item.dt * 1000)
              forecastDate.setHours(0, 0, 0, 0)

              // Calculate day label dynamically
              let dayLabel = ''
              const daysFromToday = Math.floor((forecastDate - today) / (1000 * 60 * 60 * 24))

              if (daysFromToday === 0) {
                dayLabel = 'Today'
              } else if (daysFromToday === 1) {
                dayLabel = 'Tomorrow'
              } else {
                dayLabel = forecastDate.toLocaleDateString('en-US', { weekday: 'long' })
              }

              return {
                day: dayLabel,
                date: dateStr,
                temp: Math.round(item.main.temp),
                condition: getWeatherEmoji(item.weather[0].main),
                description: item.weather[0].main
              }
            })

          setWeather({
            location: userLocation,
            temperature: temp,
            humidity: data.main.humidity,
            condition: data.weather[0].main,
            forecast: forecast
          })
        }
      } catch (error) {
        console.error('Error fetching weather:', error)
        setWeather((prev) => ({
          ...prev,
          location: userLocation,
          condition: 'Unable to load'
        }))
      }
    }

    fetchWeather()
  }, [coordinates, userLocation])

  return weather
}
