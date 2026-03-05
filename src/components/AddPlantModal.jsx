import { useState, useRef } from 'react'
import '../styles/AddPlantModal.css'

export default function AddPlantModal({ isOpen, onClose, onAddPlant }) {
  const [plantName, setPlantName] = useState('')
  const [plantDetails, setPlantDetails] = useState(null)
  const [growthStage, setGrowthStage] = useState('seedling')
  const [isScanning, setIsScanning] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [scanError, setScanError] = useState(null)
  const fileInputRef = useRef(null)

  const identifyPlantWithAPI = async (file) => {
    try {
      if (!file) {
        throw new Error('No file provided')
      }

      // Convert file to base64
      const reader = new FileReader()
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const imageBase64 = reader.result
            
            const response = await fetch(
              'http://localhost:5000/api/identify-plant',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64 })
              }
            )

            const responseText = await response.text()
            console.log('API Response Status:', response.status)
            console.log('API Response Text:', responseText)

            if (!response.ok) {
              reject(new Error(`API error: Status ${response.status} - ${responseText}`))
              return
            }

            const data = JSON.parse(responseText)
            
            console.log('API Response:', data)

            if (data.results && data.results.length > 0) {
              const topResult = data.results[0]
              const commonNames = topResult.species?.commonNames || []
              const scientificName = topResult.species?.scientificNameWithoutAuthor || topResult.species?.scientificName || 'Unknown Plant'
              const commonName = commonNames.length > 0 ? commonNames[0] : scientificName
              
              // Store plant details for preview
              setPlantDetails({
                commonName: commonName,
                scientificName: scientificName,
                commonNames: commonNames,
                score: topResult.score || 0,
                gbifID: topResult.gbifID || null,
                nbesID: topResult.nbesID || null,
                sensitivity: topResult.sensitivity || null
              })
              
              setPlantName(commonName)
              setScanError(null)
              resolve(commonName)
            } else {
              reject(new Error('No plant identified. Please try another image.'))
            }
          } catch (error) {
            console.error('Error identifying plant:', error)
            setScanError(error.message)
            setPlantName('')
            reject(error)
          }
        }

        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Error identifying plant:', error)
      setScanError(error.message)
      setPlantName('')
      throw error
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result)
    }
    reader.readAsDataURL(file)
    setSelectedFile(file)

    // Call PlantNet API to identify plant
    setIsScanning(true)
    setScanError(null)
    try {
      await identifyPlantWithAPI(file)
    } catch (error) {
      console.error('Error scanning image:', error)
      // Plant name will be empty, user can enter manually
    } finally {
      setIsScanning(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!plantName || !growthStage || !selectedFile) {
      alert('Please fill in all fields and select an image')
      return
    }

    if (scanError) {
      alert('Cannot add plant due to identification error. Please try another image.')
      return
    }

    const newPlant = {
      id: Date.now(),
      name: plantName,
      type: 'Custom Plant',
      location: 'To be determined',
      daysOld: 0,
      health: 'Good',
      icon: '🌱',
      waterFrequency: 'To be determined',
      soilType: 'To be determined',
      sunlight: 'To be determined',
      temperature: 'To be determined',
      humidity: 'To be determined',
      description: `New ${plantName} plant. Growth stage: ${growthStage}`,
      lastWatered: 'Today',
      nextWatering: 'Tomorrow',
      growthStage: growthStage,
      imageData: imagePreview
    }

    onAddPlant(newPlant)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setPlantName('')
    setPlantDetails(null)
    setGrowthStage('seedling')
    setImagePreview(null)
    setSelectedFile(null)
    setIsScanning(false)
    setScanError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleRetryScanning = async () => {
    if (selectedFile) {
      setIsScanning(true)
      setScanError(null)
      try {
        await identifyPlantWithAPI(selectedFile)
      } catch (error) {
        console.error('Error scanning image:', error)
      } finally {
        setIsScanning(false)
      }
    }
  }

  const handleChangeImage = () => {
    setPlantName('')
    setPlantDetails(null)
    setScanError(null)
    fileInputRef.current?.click()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>
        
        <h2>🌱 Add New Plant</h2>
        
        <form onSubmit={handleSubmit} className="add-plant-form">
          {/* Image Upload Section */}
          <div className="form-group">
            <label htmlFor="image-upload">📸 Plant Image</label>
            <div className="image-upload-area">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Plant preview" />
                  <button
                    type="button"
                    className="change-image-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div
                  className="upload-placeholder"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="upload-icon">📤</span>
                  <p>Click to upload plant image</p>
                  <small>Scan and identify your plant</small>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isScanning}
                style={{ display: 'none' }}
              />
            </div>

            {/* Scanning Indicator */}
            {isScanning && (
              <div className="scanning-indicator">
                <div className="spinner"></div>
                <p>Scanning and identifying plant...</p>
              </div>
            )}

            {/* Error Message with Actions */}
            {scanError && !isScanning && (
              <div className="scan-error">
                <p>⚠️ {scanError}</p>
                <div className="error-actions">
                  <button
                    type="button"
                    className="error-btn btn-retry"
                    onClick={handleRetryScanning}
                  >
                    🔄 Try Again
                  </button>
                  <button
                    type="button"
                    className="error-btn btn-change"
                    onClick={handleChangeImage}
                  >
                    📸 Change Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Plant Name */}
          <div className="form-group">
            <label htmlFor="plant-name">🌿 Plant Name</label>
            <input
              id="plant-name"
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="Scanning will identify your plant"
              disabled={true}
              required
            />
          </div>

          {/* Plant Details Preview */}
          {plantDetails && !scanError && (
            <div className="plant-details-preview">
              <h3>📋 Plant Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Common Name:</span>
                  <span className="detail-value">{plantDetails.commonName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Scientific Name:</span>
                  <span className="detail-value">{plantDetails.scientificName}</span>
                </div>
                {plantDetails.commonNames.length > 1 && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Also known as:</span>
                    <span className="detail-value">{plantDetails.commonNames.slice(1).join(', ')}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Match Score:</span>
                  <span className="detail-value">{(plantDetails.score * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Growth Stage */}
          <div className="form-group">
            <label htmlFor="growth-stage">📈 Growth Stage</label>
            <select
              id="growth-stage"
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              disabled={isScanning}
              required
            >
              <option value="seedling">Seedling</option>
              <option value="young">Young Plant</option>
              <option value="mature">Mature</option>
              <option value="flowering">Flowering</option>
              <option value="fruiting">Fruiting</option>
              <option value="harvest">Ready to Harvest</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleClose}
              disabled={isScanning}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-submit"
              disabled={isScanning || !plantName || scanError}
            >
              {isScanning ? 'Scanning...' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
