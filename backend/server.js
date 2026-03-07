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

    console.log('Raw health analysis result from Gradio:', JSON.stringify(result, null, 2))

    // Gradio typically returns { data: [ ... ] }
    // The first element might be a string (JSON) or an object
    let payload = result
    
    if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
      const firstElement = result.data[0]
      
      // If it's a string, try to parse it as JSON
      if (typeof firstElement === 'string') {
        try {
          payload = JSON.parse(firstElement)
          console.log('Parsed JSON string from Gradio:', JSON.stringify(payload, null, 2))
        } catch (e) {
          console.log('First element is a string but not JSON, using as-is:', firstElement)
          payload = firstElement
        }
      } else if (typeof firstElement === 'object') {
        // If it's already an object, use it directly
        payload = firstElement
        console.log('Using object from Gradio data array:', JSON.stringify(payload, null, 2))
      } else {
        // Fallback: use the whole result
        payload = result
      }
    }

    // If the space returned a FileData object (uploaded file metadata), try fetching it
    // Example FileData: { path, url, orig_name, meta: { _type: 'gradio.FileData' } }
    if (payload && typeof payload === 'object' && (payload.url || payload?.meta?._type === 'gradio.FileData')) {
      try {
        console.log('Gradio returned a file reference - attempting to fetch its URL:', payload.url)
        const fileResp = await fetch(payload.url)
        const contentType = fileResp.headers.get('content-type') || ''

        if (contentType.includes('application/json') || contentType.includes('text/json')) {
          const jsonPayload = await fileResp.json()
          console.log('Fetched JSON from file URL, using as payload:', JSON.stringify(jsonPayload, null, 2))
          payload = jsonPayload
        } else {
          console.warn('File URL did not return JSON. Content-Type:', contentType)
          // Return a helpful message so frontend can show appropriate UI
          return res.status(502).json({
            error: 'Unexpected response from health model space',
            details: 'The remote Gradio space returned a file (image) instead of JSON analysis. Check the Space configuration.'
          })
        }
      } catch (fetchErr) {
        console.error('Failed to fetch file URL returned by Gradio space:', fetchErr)
        return res.status(502).json({ error: 'Failed to retrieve data from Gradio space', details: fetchErr.message })
      }
    }

    console.log('Final payload being sent to frontend:', JSON.stringify(payload, null, 2))
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
