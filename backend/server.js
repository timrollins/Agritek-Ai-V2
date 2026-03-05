import express from 'express'
import cors from 'cors'
import FormData from 'form-data'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { Readable } from 'stream'
import { Client } from '@gradio/client'
import { Blob } from 'buffer'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Load backend-specific environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.VITE_BACKEND_PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' })
})

// Plant identification endpoint
app.post('/api/identify-plant', async (req, res) => {
  try {
    const { imageBase64 } = req.body
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' })
    }

    const apiKey = process.env.VITE_PLANTNET_API_KEY
    
    if (!apiKey) {
      return res.status(500).json({ error: 'PlantNet API key not configured' })
    }

    console.log('Received plant identification request')

    // Convert base64 to buffer
    let base64Data = imageBase64
    if (imageBase64.includes(',')) {
      base64Data = imageBase64.split(',')[1]
    }
    
    const imageBuffer = Buffer.from(base64Data, 'base64')
    console.log('Image buffer size:', imageBuffer.length, 'bytes')

    // Create FormData
    const formData = new FormData()
    
    // Create a readable stream from the buffer
    const stream = Readable.from(imageBuffer)
    formData.append('images', stream, { filename: 'plant.jpg', contentType: 'image/jpeg' })
    formData.append('organs', 'auto')

    console.log('Sending request to PlantNet API...')
    
    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${apiKey}`,
      {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders()
      }
    )

    const responseText = await response.text()
    console.log('PlantNet Response Status:', response.status)
    
    if (response.status !== 200) {
      console.log('PlantNet Error Response:', responseText)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response:', e)
      return res.status(response.status).json({ error: 'Invalid response from PlantNet API', details: responseText })
    }

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    console.log('Successfully identified plant')
    res.json(data)
  } catch (error) {
    console.error('Server Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Plant health analysis endpoint (uses external disease detection model via Gradio client)
app.post('/api/analyze-health', async (req, res) => {
  try {
    const { imageBase64, model = 'vit_base_224' } = req.body

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' })
    }

    const spaceId = process.env.FARM_HEALTH_SPACE_ID || 'Dhiryashil/farm-disease-detection'

    console.log('Received plant health analysis request')
    console.log('Using Gradio Space:', spaceId)

    // Strip any data URL prefix if present
    let base64Data = imageBase64
    if (imageBase64.includes(',')) {
      base64Data = imageBase64.split(',')[1]
    }

    // Convert base64 image into a Blob for Gradio client
    const imageBuffer = Buffer.from(base64Data, 'base64')
    const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' })

    // Connect to the Gradio Space and call the predict endpoint
    const app = await Client.connect(spaceId)

    // Adjust the endpoint name and arguments if your Space uses different labels
    const result = await app.predict('/predict_disease', [
      imageBlob,      // 'Upload Plant Image' component
      'plant_disease' // 'Select Model' dropdown
    ])

    console.log('Raw health analysis result from Gradio:', result)

    // Gradio returns { data: [ ... ] }, forward the first element if present
    const payload = Array.isArray(result?.data) && result.data.length > 0 ? result.data[0] : result

    console.log('Successfully analyzed plant health')
    res.json(payload)
  } catch (error) {
    console.error('Health analysis server error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`\n🌿 Agritek Backend Server running on http://localhost:${PORT}`)
  console.log(`✓ CORS enabled`)
  console.log(`✓ Health check: http://localhost:${PORT}/health\n`)
})
