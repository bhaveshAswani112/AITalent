import React, { useState, useEffect } from 'react'
import axios from 'axios'
import WeatherDisplay from './components/WeatherDisplay'
import ChatInterface from './components/ChatInterface'
import Sidebar from './components/Sidebar'
import WelcomeScreen from './components/WelcomeScreen'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [language, setLanguage] = useState('en')
  const [sessionId, setSessionId] = useState(null)
  const [weather, setWeather] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [translations, setTranslations] = useState({})

  // Load translations
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/translations/${language}`)
        setTranslations(response.data)
      } catch (error) {
        console.error('Error loading translations:', error)
      }
    }
    loadTranslations()
  }, [language])

  const t = (key) => translations[key] || key

  const handleGetWeather = async (location) => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/weather-with-suggestions`,
        { location },
        { params: { language } }
      )
      setSessionId(response.data.session_id)
      setWeather(response.data.weather)
      setSuggestion(response.data.suggestion)
      setChatHistory([])
    } catch (error) {
      console.error('Error fetching weather:', error)
      alert(error.response?.data?.detail || 'Error fetching weather data')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (query) => {
    if (!sessionId || !query.trim()) return

    // Add user message to chat immediately
    const userMessage = { role: 'user', content: query }
    setChatHistory(prev => [...prev, userMessage])

    try {
      const response = await axios.post(`${API_BASE_URL}/api/suggestions`, {
        session_id: sessionId,
        query,
        language
      })
      
      setSuggestion(response.data.suggestion)
      setChatHistory(response.data.chat_history)
      
      // Update weather if agent automatically fetched it for a different location
      if (response.data.weather_updated && response.data.weather) {
        setWeather(response.data.weather)
        // Show a notification that weather was updated
        console.log('Weather updated automatically for:', response.data.weather.location)
      }
    } catch (error) {
      console.error('Error getting suggestions:', error)
      const errorMessage = {
        role: 'assistant',
        content: error.response?.data?.detail || 'Error getting AI response'
      }
      setChatHistory(prev => [...prev, errorMessage])
    }
  }

  const handleClearChat = () => {
    if (sessionId) {
      axios.delete(`${API_BASE_URL}/api/session/${sessionId}/chat`)
        .then(() => {
          setChatHistory([])
        })
        .catch(error => {
          console.error('Error clearing chat:', error)
        })
    } else {
      setChatHistory([])
    }
  }

  const extractLocationFromTranscript = (transcript) => {
    // Simple location extraction patterns
    const locationPatterns = [
      /(?:in|at|for|to)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i,
      /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)\s+(?:で|の|に|を)/,
    ]
    
    const majorCities = [
      'tokyo', 'new york', 'london', 'paris', 'berlin', 'moscow', 'sydney',
      'melbourne', 'toronto', 'vancouver', 'mumbai', 'delhi', 'bangalore',
      'singapore', 'hong kong', 'seoul', 'beijing', 'shanghai', 'dubai',
      'istanbul', 'cairo', 'rio de janeiro', 'sao paulo', 'mexico city',
      'buenos aires', 'los angeles', 'chicago', 'san francisco', 'miami',
      'boston', 'seattle', 'denver', 'phoenix', 'dallas', 'houston',
      'osaka', 'kyoto', 'yokohama', 'nagoya', 'fukuoka', 'sapporo',
      'sendai', 'hiroshima', 'kobe'
    ]
    
    for (const pattern of locationPatterns) {
      const match = transcript.match(pattern)
      if (match) {
        const location = match[1] ? match[1].trim() : match[0].trim()
        const locationLower = location.toLowerCase()
        // Check if it's a known city or starts with capital letter (likely a city name)
        if (majorCities.includes(locationLower) || (location.length >= 2 && location[0] === location[0].toUpperCase())) {
          return location
        }
      }
    }
    return null
  }

  const handleTranscription = async (transcript) => {
    if (!transcript || !transcript.trim()) return

    // If we have a session, just send the message
    if (sessionId) {
      handleSendMessage(transcript)
      return
    }

    // No session exists - try to extract location from transcript
    const extractedLocation = extractLocationFromTranscript(transcript)
    
    if (extractedLocation) {
      // Location found in transcript - fetch weather for that location first
      setLoading(true)
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/weather-with-suggestions`,
          { location: extractedLocation },
          { params: { language } }
        )
        setSessionId(response.data.session_id)
        setWeather(response.data.weather)
        setSuggestion(response.data.suggestion)
        setChatHistory([])
        
        // Now send the transcribed message
        setTimeout(() => {
          handleSendMessage(transcript)
        }, 100)
      } catch (error) {
        console.error('Error fetching weather:', error)
        alert(error.response?.data?.detail || 'Error fetching weather data')
      } finally {
        setLoading(false)
      }
    } else {
      // No location found - use default location from sidebar or create session with a default
      const defaultLocation = language === 'ja' ? 'Tokyo' : 'New York'
      setLoading(true)
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/weather-with-suggestions`,
          { location: defaultLocation },
          { params: { language } }
        )
        setSessionId(response.data.session_id)
        setWeather(response.data.weather)
        setSuggestion(response.data.suggestion)
        setChatHistory([])
        
        // Now send the transcribed message (agent will handle location extraction)
        setTimeout(() => {
          handleSendMessage(transcript)
        }, 100)
      } catch (error) {
        console.error('Error fetching weather:', error)
        alert(error.response?.data?.detail || 'Error fetching weather data')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="app">
      <div className="header-container">
        <div className="main-header">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
        </div>
        <div className="language-selector">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">🇬🇧 English</option>
            <option value="ja">🇯🇵 日本語</option>
          </select>
        </div>
      </div>

      <div className="main-container">
        <Sidebar
          t={t}
          language={language}
          onGetWeather={handleGetWeather}
          loading={loading}
          onTranscription={handleTranscription}
        />

        <div className="content-area">
          {weather ? (
            <>
              <div className="weather-suggestions-container">
                <WeatherDisplay weather={weather} />
                <div className="suggestions-section">
                  <h3>{t('suggestions')}</h3>
                  <div className="suggestion-card">
                    {suggestion ? (
                      <div dangerouslySetInnerHTML={{ __html: suggestion.replace(/\n/g, '<br>') }} />
                    ) : (
                      <p>Loading suggestions...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="chat-section">
                <div className="chat-header">
                  <h3>💬 {t('chat_history')}</h3>
                  <button onClick={handleClearChat}>{t('clear_chat')}</button>
                </div>
                <ChatInterface
                  chatHistory={chatHistory}
                  onSendMessage={handleSendMessage}
                  placeholder={t('chat_input')}
                  t={t}
                />
              </div>
            </>
          ) : (
            <WelcomeScreen t={t} />
          )}
        </div>
      </div>

      <footer>
        <p>🌤️ Powered by WeatherAPI.com, Groq AI & Deepgram STT | Built with React & FastAPI</p>
        <p className="footer-subtitle">
          This chatbot provides weather-based activity suggestions using AI with Deepgram voice transcription (100+ audio formats supported)<br />
          このチャットボットはAIとDeepgram音声認識を使用して天気ベースのアクティビティ提案を提供します
        </p>
      </footer>
    </div>
  )
}

export default App

