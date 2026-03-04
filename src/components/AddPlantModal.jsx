import { useState, useRef } from 'react'
import { useLocation } from '../hooks/useLocation'
import { useWeather } from '../hooks/useWeather'
import '../styles/AddPlantModal.css'

export default function AddPlantModal({ isOpen, onClose, onAddPlant }) {
  const [plantName, setPlantName] = useState('')
  const [growthStage, setGrowthStage] = useState('seedling')
  const [isScanning, setIsScanning] = useState(false)
  const [identificationResults, setIdentificationResults] = useState([])
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef(null)

  const { userLocation, coordinates } = useLocation()
  const weather = useWeather(coordinates, userLocation)

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

    setIsScanning(true)
    setIdentificationResults([])
    try {
      const apiKey = import.meta.env.VITE_PLANTNET_API_KEY;
      if (!apiKey || apiKey === 'YOUR_PLANTNET_API_KEY') {
        console.warn("Pl@ntNet API key is missing or not configured");
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPlantName('Detected Plant');
        setIsScanning(false);
        return;
      }

      const formData = new FormData();
      formData.append('images', file);
      formData.append('organs', 'auto');

      const response = await fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to identify plant');
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const topResults = data.results.slice(0, 3);
        setIdentificationResults(topResults);

        const bestMatch = topResults[0];
        const name = bestMatch.species.commonNames?.[0] || bestMatch.species.scientificNameWithoutAuthor;
        setPlantName(name || 'Unknown Plant');
      } else {
        setPlantName('Plant not identified');
      }

    } catch (error) {
      console.error('Error scanning image:', error)
      setPlantName('Detection Failed')
    } finally {
      setIsScanning(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!plantName || !growthStage || !selectedFile) {
      alert('Please fill in all fields and select an image')
      return
    }

    setIsGenerating(true)

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY

      const prompt = `You are an expert agricultural AI assistant. Generating specific growing recommendations for a "${plantName}" at the "${growthStage}" stage.
The current location is ${weather.location || 'Unknown'} with weather ${weather.temperature !== '--' ? weather.temperature + '°C' : 'Unknown'}, ${weather.humidity !== '--' ? weather.humidity + '%' : 'Unknown'}, ${weather.condition || 'Unknown'}.
Based on this location and weather, return a valid JSON object with these exact keys:
{
  "type": "Herb/Vegetable/Fruit/Flower/etc",
  "waterFrequency": "e.g. Every 2 days",
  "soilType": "e.g. Well-draining",
  "sunlight": "e.g. 6-8 hours",
  "temperature": "e.g. 65-75°F",
  "humidity": "e.g. 50-60%",
  "description": "A descriptive AI recommendation note incorporating the current weather and plant needs...",
  "nextWatering": "e.g. In 2 days"
}
Ensure the output is ONLY this JSON object and nothing else. Ensure the formatting is strictly JSON.`;

      let aiData = {};

      if (apiKey) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json"
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            aiData = JSON.parse(aiText);
          }
        } else {
          console.error("Gemini API failed:", await response.text());
        }
      }

      const newPlant = {
        id: Date.now(),
        name: plantName,
        type: aiData.type || 'Custom Plant',
        location: weather.location || 'To be determined',
        daysOld: 1,
        health: 'Good',
        icon: '🌱',
        waterFrequency: aiData.waterFrequency || 'To be determined',
        soilType: aiData.soilType || 'To be determined',
        sunlight: aiData.sunlight || 'To be determined',
        temperature: aiData.temperature || 'To be determined',
        humidity: aiData.humidity || 'To be determined',
        description: aiData.description || `New ${plantName} plant. Growth stage: ${growthStage}`,
        lastWatered: 'Today',
        nextWatering: aiData.nextWatering || 'Tomorrow',
        growthStage: growthStage,
        imageData: imagePreview
      }

      onAddPlant(newPlant)
      resetForm()
      onClose()

    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      alert('Failed to generate recommendations via AI. Please try again.');
    } finally {
      setIsGenerating(false)
    }
  }

  const resetForm = () => {
    setPlantName('')
    setGrowthStage('seedling')
    setImagePreview(null)
    setSelectedFile(null)
    setIsScanning(false)
    setIdentificationResults([])
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

          {/* Identification Results */}
          {identificationResults.length > 0 && (
            <div className="form-group identification-results">
              <label>🔍 Scan Results (Select one)</label>
              <div className="results-list">
                {identificationResults.map((result, index) => {
                  const commonName = result.species.commonNames?.[0];
                  const scientificName = result.species.scientificNameWithoutAuthor;
                  const displayName = commonName || scientificName;
                  const probability = (result.score * 100).toFixed(1);

                  return (
                    <div
                      key={index}
                      className={`result-item ${plantName === displayName ? 'selected' : ''}`}
                      onClick={() => setPlantName(displayName)}
                    >
                      <div className="result-info">
                        <strong>{displayName}</strong>
                        {commonName && <small>{scientificName}</small>}
                      </div>
                      <span className="result-probability">{probability}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
              disabled={isScanning || isGenerating || !plantName}
            >
              {isGenerating ? 'Generating AI Profile...' : isScanning ? 'Scanning...' : 'Add Plant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
