import { useState, useRef } from 'react'
import '../styles/AddPlantModal.css'

export default function AddPlantModal({ isOpen, onClose, onAddPlant }) {
  const [plantName, setPlantName] = useState('')
  const [growthStage, setGrowthStage] = useState('seedling')
  const [isScanning, setIsScanning] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

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

    // Simulate image scanning/identification
    setIsScanning(true)
    try {
      // Simulate API call to identify plant
      await new Promise(resolve => setTimeout(resolve, 2000))
      // In a real app, this would call an ML model or API to identify the plant
      // For now, we'll just set a placeholder
      setPlantName('Detected Plant')
    } catch (error) {
      console.error('Error scanning image:', error)
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
    setGrowthStage('seedling')
    setImagePreview(null)
    setSelectedFile(null)
    setIsScanning(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
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
          </div>

          {/* Plant Name */}
          <div className="form-group">
            <label htmlFor="plant-name">🌿 Plant Name</label>
            <input
              id="plant-name"
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="Enter plant name (from scan)"
              disabled={isScanning}
              required
            />
          </div>

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
              disabled={isScanning || !plantName}
            >
              {isScanning ? 'Scanning...' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
