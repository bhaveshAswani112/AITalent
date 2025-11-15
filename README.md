# Weather Activity Advisor

A bilingual (English/Japanese) weather-based activity advisor application built with FastAPI backend and React frontend. Get personalized activity suggestions based on real-time weather conditions, with voice input support using Deepgram AI.

## Features

- 🌤️ Real-time weather information from WeatherAPI.com
- 🤖 AI-powered activity suggestions using Groq (Llama 3.3 70B)
- 🎤 Voice input with Deepgram transcription (supports 100+ audio formats)
- 💬 Interactive chat interface
- 🌏 Bilingual support (English/Japanese)
- 📱 Responsive design

## Tech Stack

### Backend
- FastAPI
- Groq API (for AI suggestions)
- Deepgram API (for speech-to-text)
- WeatherAPI.com

### Frontend
- React
- Vite
- Axios

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- API Keys:
  - GROQ_API_KEY
  - WEATHER_API_KEY
  - DEEPGRAM_API_KEY

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (optional but recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
GROQ_API_KEY=your_groq_api_key
WEATHER_API_KEY=your_weather_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

5. Run the FastAPI server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### GET `/`
Health check endpoint

### GET `/api/translations/{language}`
Get translations for a specific language (en/ja)

### POST `/api/weather`
Fetch weather data for a location
```json
{
  "location": "Tokyo"
}
```

### POST `/api/weather-with-suggestions`
Fetch weather and get initial AI suggestions
```json
{
  "location": "Tokyo"
}
```
Query params: `language` (en/ja), `session_id` (optional)

### POST `/api/suggestions`
Get AI suggestions based on weather and query
```json
{
  "session_id": "uuid",
  "query": "What should I wear today?",
  "language": "en"
}
```

### POST `/api/transcribe`
Transcribe uploaded audio file
- Form data: `file` (audio file), `language` (en/ja), `session_id` (optional)

### GET `/api/session/{session_id}`
Get session data

### DELETE `/api/session/{session_id}/chat`
Clear chat history for a session

### GET `/api/examples/{language}`
Get example prompts for a language

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── WeatherDisplay.jsx
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── WelcomeScreen.jsx
│   │   ├── App.jsx         # Main app component
│   │   ├── App.css         # App styles
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Usage

1. Start the backend server (port 8000)
2. Start the frontend development server (port 3000)
3. Open `http://localhost:3000` in your browser
4. Enter a location in the sidebar and click "Get Weather & Suggestions"
5. Use the chat interface or voice input to ask questions about activities, fashion, or plans
6. Switch between English and Japanese using the language selector

## Voice Input

The app supports two methods of voice input:

1. **Built-in Recorder**: Click the record button to record audio directly in the browser
2. **File Upload**: Upload audio files in various formats (MP3, WAV, FLAC, M4A, OGG, OPUS, WEBM, etc.)

Both methods use Deepgram AI for transcription, which supports 100+ audio formats.

## Development

### Backend Development
- The FastAPI server runs with auto-reload enabled
- API documentation available at `http://localhost:8000/docs`

### Frontend Development
- Hot module replacement enabled
- Proxy configured to forward `/api` requests to backend

## Production Deployment

### Backend
- Use a production ASGI server like Gunicorn with Uvicorn workers
- Set up proper CORS origins for your frontend domain
- Use environment variables for API keys
- Consider using Redis or a database for session storage instead of in-memory

### Frontend
- Build the production bundle: `npm run build`
- Serve the `dist` folder with a web server (Nginx, Apache, etc.)
- Update `VITE_API_URL` to point to your production API

## License

MIT

