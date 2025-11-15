import React, { useState, useRef, useEffect } from 'react'

function ChatInterface({ chatHistory, onSendMessage, placeholder, t }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {chatHistory.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.role === 'user' ? 'user-message' : 'assistant-message'
            }`}
          >
            <strong>{message.role === 'user' ? '👤 You:' : '🤖 Assistant:'}</strong>{' '}
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}

export default ChatInterface

