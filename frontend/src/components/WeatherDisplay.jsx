import React from 'react'

function WeatherDisplay({ weather }) {
  if (!weather) return null

  return (
    <div className="weather-display">
      <h3>🌡️ {weather.location}</h3>
      <p><strong>{weather.condition}</strong></p>
      {weather.icon && (
        <div className="weather-icon">
          <img src={`https:${weather.icon}`} alt={weather.condition} width="100" />
        </div>
      )}
      <div className="weather-details">
        <p><strong>Temperature:</strong> {weather.temperature}</p>
        <p><strong>Feels like:</strong> {weather.feels_like}</p>
        <p><strong>Humidity:</strong> {weather.humidity}</p>
        <p><strong>Wind:</strong> {weather.wind}</p>
        <p><strong>UV Index:</strong> {weather.uv_index}</p>
        <p><strong>Precipitation:</strong> {weather.precipitation}</p>
        <p><strong>Visibility:</strong> {weather.visibility}</p>
        <p><strong>Local Time:</strong> {weather.local_time}</p>
      </div>
    </div>
  )
}

export default WeatherDisplay

