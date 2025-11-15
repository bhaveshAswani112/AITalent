import React from 'react'

function WelcomeScreen({ t }) {
  return (
    <div className="welcome-screen">
      <h2>👋 Welcome! / ようこそ！</h2>
      <p>
        Enter a location in the sidebar to get started<br />
        サイドバーに場所を入力して開始してください
      </p>
      <div className="welcome-features">
        <p>🎤 Use Deepgram-powered voice input for hands-free interaction</p>
        <p>🌤️ Get real-time weather information</p>
        <p>🤖 Receive AI-powered activity suggestions</p>
        <p>🌏 Support for English and Japanese</p>
      </div>
    </div>
  )
}

export default WelcomeScreen

