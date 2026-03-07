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
      console.log('Health result received from backend:', JSON.stringify(data, null, 2))
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
              {/* Debug: Show raw data structure */}
              {process.env.NODE_ENV === 'development' && (
                <details style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#666' }}>
                  <summary style={{ cursor: 'pointer' }}>🔍 Debug: Raw Response</summary>
                  <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', overflow: 'auto', maxHeight: '200px' }}>
                    {JSON.stringify(healthResult, null, 2)}
                  </pre>
                </details>
              )}
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Health Score</span>
                  <span className="detail-value">
                    {(() => {
                      // Try multiple possible paths for health_score
                      const rawScore =
                        healthResult?.health_score ??
                        healthResult?.healthScore ??
                        healthResult?.score ??
                        healthResult?.data?.health_score ??
                        healthResult?.data?.healthScore ??
                        healthResult?.data?.score
                      
                      console.log('Attempting to extract health score from:', { rawScore, healthResult })
                      
                      const num = Number(rawScore)
                      if (Number.isNaN(num) || rawScore === undefined || rawScore === null) {
                        console.warn('Could not find health_score in:', Object.keys(healthResult || {}))
                        return 'N/A'
                      }
                      // If score is 0–1, treat as ratio; if >1, assume already percentage-like
                      const pct = num <= 1 ? num * 100 : num
                      return `${pct.toFixed(1)}%`
                    })()}
                  </span>
                </div>
                {(() => {
                  const primaryDisease = healthResult?.primary_disease ?? healthResult?.data?.primary_disease
                  return primaryDisease && (
                    <>
                      <div className="detail-item">
                        <span className="detail-label">Primary Disease</span>
                        <span className="detail-value">
                          {primaryDisease.name || 'Unknown'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Severity</span>
                        <span className="detail-value">
                          {primaryDisease.severity || 'N/A'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Primary Confidence</span>
                        <span className="detail-value">
                          {typeof primaryDisease.confidence === 'number'
                            ? `${(primaryDisease.confidence * 100).toFixed(1)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </>
                  )
                })()}
                {(() => {
                  const diseases = healthResult?.diseases_detected ?? healthResult?.data?.diseases_detected
                  return Array.isArray(diseases) && diseases.length > 0 && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Detected Diseases</span>
                      <span className="detail-value">
                        {diseases
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
                  )
                })()}
                {(() => {
                  const recommendations = healthResult?.recommendations ?? healthResult?.data?.recommendations
                  return Array.isArray(recommendations) && recommendations.length > 0 && (
                    <div className="detail-item full-width">
                      <span className="detail-label">Recommendations</span>
                      <span className="detail-value">
                        {recommendations.join(' • ')}
                      </span>
                    </div>
                  )
                })()}
                {(() => {
                  const processingTime = healthResult?.processing_time ?? healthResult?.data?.processing_time
                  return typeof processingTime === 'number' && (
                    <div className="detail-item">
                      <span className="detail-label">Processing Time</span>
                      <span className="detail-value">
                        {processingTime.toFixed(2)}s
                      </span>
                    </div>
                  )
                })()}
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


