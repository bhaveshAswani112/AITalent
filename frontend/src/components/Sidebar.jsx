import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Sidebar({ t, language, onGetWeather, loading, onTranscription }) {
  const [location, setLocation] = useState(language === 'ja' ? 'Tokyo' : 'New York')
  const [audioBlob, setAudioBlob] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [transcribedText, setTranscribedText] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const [examples, setExamples] = useState([])

  useEffect(() => {
    const loadExamples = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/examples/${language}`)
        setExamples(response.data.examples)
      } catch (error) {
        console.error('Error loading examples:', error)
      }
    }
    loadExamples()
  }, [language])

  const handleGetWeather = () => {
    if (location.trim()) {
      onGetWeather(location)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Error accessing microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob, format = 'wav') => {
    setTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, `audio.${format}`)
      formData.append('language', language)

      const response = await axios.post(
        `${API_BASE_URL}/api/transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (response.data.success && response.data.transcript) {
        setTranscribedText(response.data.transcript)
        return response.data.transcript
      } else {
        alert('No speech detected in the audio.')
        return null
      }
    } catch (error) {
      console.error('Error transcribing audio:', error)
      alert(error.response?.data?.detail || 'Error transcribing audio')
      return null
    } finally {
      setTranscribing(false)
    }
  }

  const handleTranscribeRecorded = async () => {
    if (audioBlob) {
      const transcript = await transcribeAudio(audioBlob, 'wav')
      if (transcript) {
        onTranscription(transcript)
        setTranscribedText('')
        setAudioBlob(null)
      }
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const format = file.name.split('.').pop().toLowerCase()
      const transcript = await transcribeAudio(file, format)
      if (transcript) {
        onTranscription(transcript)
        setTranscribedText('')
      }
      e.target.value = '' // Reset input
    }
  }

  const handleUseTranscription = () => {
    if (transcribedText) {
      onTranscription(transcribedText)
      setTranscribedText('')
    }
  }

  const handleExampleClick = (example) => {
    onTranscription(example)
  }

  return (
    <div className="sidebar">
      <h2>⚙️ {t('weather_info')}</h2>

      <div className="sidebar-section">
        <input
          type="text"
          className="location-input"
          placeholder={t('location_placeholder')}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleGetWeather()}
        />
        <button
          className="get-weather-btn"
          onClick={handleGetWeather}
          disabled={loading || !location.trim()}
        >
          {loading ? 'Loading...' : t('get_weather')}
        </button>
      </div>

      <div className="sidebar-section">
        <h3>{t('voice_input')}</h3>
        <div className="voice-input-section">
          <p>🎤 Record audio and it will be transcribed using Deepgram AI.</p>
          <p className="subtitle">音声を録音するとDeepgram AIで自動的に文字起こしされます</p>
        </div>

        <div className="audio-recorder">
          <p><strong>Option 1: Built-in Recorder (Recommended)</strong></p>
          {!isRecording ? (
            <button onClick={startRecording}>
              🎤 Click to record / クリックして録音
            </button>
          ) : (
            <button onClick={stopRecording} style={{ background: '#dc3545' }}>
              ⏹️ Stop Recording
            </button>
          )}

          {audioBlob && (
            <div className="audio-player">
              <audio controls src={URL.createObjectURL(audioBlob)} />
              <button
                onClick={handleTranscribeRecorded}
                disabled={transcribing}
                style={{ marginTop: '0.5rem' }}
              >
                {transcribing ? 'Transcribing...' : '🔄 Transcribe Recorded Audio / 録音を文字起こし'}
              </button>
            </div>
          )}
        </div>

        <div className="file-upload">
          <p><strong>Option 2: Upload Audio File</strong></p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            Supports: MP3, WAV, FLAC, M4A, OGG, OPUS, WEBM, and 100+ more formats
          </p>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={transcribing}
          />
        </div>

        {transcribedText && (
          <div className="transcribed-text">
            <p><strong>📝 Transcribed text:</strong> {transcribedText}</p>
            <button onClick={handleUseTranscription} style={{ marginTop: '0.5rem' }}>
              ✅ Use this query / このクエリを使用
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <h3>{t('example_prompts')}</h3>
        <div className="example-prompts">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar

