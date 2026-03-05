# Agritek Backend Server

Backend server for the Agritek AI plant identification system.

## Setup

1. The backend uses the PlantNet API to identify plants from images
2. It proxies requests from the frontend to bypass CORS restrictions

## Running the Backend

```bash
npm run dev:server
```

The server will start on `http://localhost:5000`

## Endpoints

### POST /api/identify-plant

Identifies a plant from a base64 encoded image.

**Request:**

```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Response:**

```json
{
  "results": [
    {
      "species": {
        "commonNames": ["Tomato"],
        "scientificName": "Solanum lycopersicum"
      }
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "message": "Backend server is running"
}
```

## Environment Variables

The backend reads the `VITE_PLANTNET_API_KEY` from the root `.env` file.

Make sure your `.env` file contains:

```
VITE_PLANTNET_API_KEY=your_api_key_here
```

## Dependencies

- express: Web server framework
- cors: Cross-Origin Resource Sharing
- form-data: FormData handling for multipart uploads
- node-fetch: HTTP client
- dotenv: Environment variable loader
