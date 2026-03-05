import { useState, useRef } from 'react'
import '../styles/AddPlantModal.css'

export default function CheckHealthModal({ isOpen, plant, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [healthResult, setHealthResult] = useState(null)
  const fileInputRef = useRef(null)

  if (!isOpen || !plant) return null

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result)
    }
    reader.readAsDataURL(file)
  }

  const handleClose = () => {
    setSelectedFile(null)
    setImagePreview(null)
    setHealthResult(null)
    if (typeof onClose === 'function') {
      onClose()
    }
  }

  const handleSaveAndClose = () => {
    if (healthResult && typeof onClose === 'function') {
      onClose(healthResult)
    } else if (typeof onClose === 'function') {
      onClose()
    }
    setSelectedFile(null)
    setImagePreview(null)
    setHealthResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile || !imagePreview) {
      alert('Please upload a plant image to check health status.')
      return
    }

    try {
      setIsChecking(true)

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

      const response = await fetch(`${backendUrl}/api/analyze-health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          model: 'vit_base_224'
        })
      })

      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (parseErr) {
        console.error('Non-JSON response from health API:', text)
        alert('Backend did not return JSON. Is the /api/analyze-health endpoint running?')
        return
      }

      if (!response.ok) {
        console.error('Health analysis failed:', data)
        alert(data.error || 'Failed to analyze plant health. Please try again.')
        return
      }

      // Store result locally so user can review it before closing
      setHealthResult(data)
    } catch (error) {
      console.error('Error checking plant health:', error)
      alert('An error occurred while checking plant health. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>✕</button>

        <h2>🩺 Check Health Status</h2>
        <p style={{ textAlign: 'center', marginTop: '-0.75rem', marginBottom: '1.5rem', color: '#555' }}>
          {plant.icon} <strong>{plant.name}</strong>
        </p>

        <form onSubmit={handleSubmit} className="add-plant-form">
          <div className="form-group">
            <label htmlFor="health-image-upload">📸 Upload Plant Image</label>
            <div className="image-upload-area">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Plant health preview" />
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
                  <span className="upload-icon">🔍</span>
                  <p>Click to upload a current image of your plant</p>
                  <small>We’ll use this to analyze its health</small>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="health-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {healthResult && (
            <div className="plant-details-preview">
              <h3>📊 Health Analysis Result</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Health Score</span>
                  <span className="detail-value">
                    {(() => {
                      const rawScore =
                        healthResult.health_score ??
                        healthResult.healthScore ??
                        healthResult.score
                      const num = Number(rawScore)
                      if (Number.isNaN(num)) return 'N/A'
                      // If score is 0–1, treat as ratio; if >1, assume already percentage-like
                      const pct = num <= 1 ? num * 100 : num
                      return `${pct.toFixed(1)}%`
                    })()}
                  </span>
                </div>
                {healthResult.primary_disease && (
                  <>
                    <div className="detail-item">
                      <span className="detail-label">Primary Disease</span>
                      <span className="detail-value">
                        {healthResult.primary_disease.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Severity</span>
                      <span className="detail-value">
                        {healthResult.primary_disease.severity || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Primary Confidence</span>
                      <span className="detail-value">
                        {typeof healthResult.primary_disease.confidence === 'number'
                          ? `${(healthResult.primary_disease.confidence * 100).toFixed(1)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </>
                )}
                {Array.isArray(healthResult.diseases_detected) &&
                  healthResult.diseases_detected.length > 0 && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Detected Diseases</span>
                      <span className="detail-value">
                        {healthResult.diseases_detected
                          .map(d => {
                            const conf =
                              typeof d.confidence === 'number'
                                ? `${Math.round(d.confidence * 100)}%`
                                : 'N/A'
                            const treatment = d.treatment ? ` – ${d.treatment}` : ''
                            return `${d.disease || 'Unknown'} (${conf})${treatment}`
                          })
                          .join(' • ')}
                      </span>
                    </div>
                  )}
                {Array.isArray(healthResult.recommendations) &&
                  healthResult.recommendations.length > 0 && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Recommendations</span>
                      <span className="detail-value">
                        {healthResult.recommendations.join(' • ')}
                      </span>
                    </div>
                  )}
                {typeof healthResult.processing_time === 'number' && (
                  <div className="detail-item">
                    <span className="detail-label">Processing Time</span>
                    <span className="detail-value">
                      {healthResult.processing_time.toFixed(2)}s
                    </span>
                  </div>
                  )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            {healthResult ? (
              <button
                type="button"
                className="btn btn-submit"
                onClick={handleSaveAndClose}
              >
                Save Result & Close
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-submit"
                disabled={!selectedFile || isChecking}
              >
                {isChecking ? 'Checking Health...' : 'Check Health'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}


