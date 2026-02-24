import { useState, useEffect } from 'react'

/**
 * Custom hook to fetch user's location based on GPS coordinates
 * and reverse geocode to get city and country name
 * @returns {Object} { userLocation, coordinates }
 */
export function useLocation() {
  const [userLocation, setUserLocation] = useState('Loading location...')
  const [coordinates, setCoordinates] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setCoordinates({ latitude, longitude })

          try {
            // Use OpenStreetMap Nominatim for reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.county ||
              'Unknown Location'
            const country = data.address?.country || ''
            setUserLocation(`${city}, ${country}`.replace(', ', ' ').trim())
          } catch (error) {
            console.error('Error fetching location:', error)
            setUserLocation('Location unavailable')
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setUserLocation('Location access denied')
        }
      )
    } else {
      setUserLocation('Geolocation not supported')
    }
  }, [])

  return { userLocation, coordinates }
}
