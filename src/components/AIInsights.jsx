import { useState, useEffect, useRef } from 'react'
import '../styles/AIInsights.css'
import { useLocation } from '../hooks/useLocation'
import { useWeather } from '../hooks/useWeather'

export default function AIInsights() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionHistory, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Fetch weather data
  const { userLocation, coordinates } = useLocation()
  const weather = useWeather(coordinates, userLocation)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('agritek_chat_sessions')
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions)
      setSessions(parsed)
    }

    // Start a new session or continue the last one
    const lastSessionId = localStorage.getItem('agritek_current_session')
    if (lastSessionId) {
      const session = JSON.parse(savedSessions || '[]').find(s => s.id === lastSessionId)
      if (session) {
        setMessages(session.messages)
        setCurrentSessionId(lastSessionId)
      } else {
        startNewSession()
      }
    } else {
      startNewSession()
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startNewSession = () => {
    const newSessionId = `session_${Date.now()}`
    setCurrentSessionId(newSessionId)

    const welcomeMessage = '👋 Hello! I\'m your AgriTek AI assistant. I\'m here to help you with all your farming and plant-related questions. Ask me about:\n\n🌱 Plant care and cultivation\n🌾 Crop management\n🐛 Pest and disease identification\n💧 Irrigation and water management\n🌤️ Weather and seasonal advice\n🌿 Organic farming practices\n\nWhat would you like to know today?'

    setMessages([{
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date().toISOString()
    }])
    localStorage.setItem('agritek_current_session', newSessionId)
  }

  const saveSession = (updatedMessages) => {
    const session = {
      id: currentSessionId,
      title: generateSessionTitle(updatedMessages),
      messages: updatedMessages,
      lastUpdated: new Date().toISOString()
    }

    const allSessions = sessionHistory.filter(s => s.id !== currentSessionId)
    allSessions.unshift(session)

    // Keep only last 20 sessions
    const limitedSessions = allSessions.slice(0, 20)

    setSessions(limitedSessions)
    localStorage.setItem('agritek_chat_sessions', JSON.stringify(limitedSessions))

    console.log('Session saved:', session.title)
    console.log('Total sessions:', limitedSessions.length)
  }

  const generateSessionTitle = (msgs) => {
    const userMessages = msgs.filter(m => m.role === 'user')
    if (userMessages.length > 0) {
      const firstMsg = userMessages[0].content
      return firstMsg.length > 40 ? firstMsg.substring(0, 40) + '...' : firstMsg
    }
    return 'New Conversation'
  }

  const loadSession = (sessionId) => {
    const session = sessionHistory.find(s => s.id === sessionId)
    if (session) {
      setMessages(session.messages)
      setCurrentSessionId(sessionId)
      localStorage.setItem('agritek_current_session', sessionId)
      setShowHistory(false)
    }
  }

  const deleteSession = (sessionId, e) => {
    e.stopPropagation()
    const updatedSessions = sessionHistory.filter(s => s.id !== sessionId)
    setSessions(updatedSessions)
    localStorage.setItem('agritek_chat_sessions', JSON.stringify(updatedSessions))

    if (sessionId === currentSessionId) {
      startNewSession()
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    console.log('API Key exists:', !!apiKey)
    console.log('API Key length:', apiKey?.length)

    if (!apiKey) {
      const errorMessage = {
        role: 'assistant',
        content: '❌ API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file and restart the dev server.',
        timestamp: new Date().toISOString()
      }
      setMessages([...messages, errorMessage])
      return
    }

    // Test: List available models
    try {
      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
      const listData = await listResponse.json()
      console.log('Available models:', listData)
      if (listData.models) {
        console.log('Model names:', listData.models.map(m => m.name))
        const generateContentModels = listData.models.filter(m =>
          m.supportedGenerationMethods?.includes('generateContent')
        )
        console.log('Models supporting generateContent:', generateContentModels.map(m => m.name))
        // Use the first available model
        if (generateContentModels.length > 0) {
          const firstModel = generateContentModels[0].name
          console.log('Using first available model:', firstModel)
        }
      }
    } catch (e) {
      console.log('Could not list models:', e)
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputMessage('')
    setIsLoading(true)

    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
      console.log('Calling API:', apiUrl.replace(apiKey, 'API_KEY_HIDDEN'))

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert, highly precise agricultural AI assistant helping a farmer using the AgriTek platform. 
You must directly answer the farmer's question with precise measurements (e.g., exact water quantities like "500ml", "1.5 liters per week", "2 inches over 1 square foot") and actionable recommendations.
Keep a natural conversational flow without repetitive intro text. Be highly structured and easy to read.

Context: 
- Current Location: ${weather.location || 'Unknown'}
- Temperature: ${weather.temperature !== '--' ? weather.temperature + '°C' : 'Unknown'}
- Humidity: ${weather.humidity !== '--' ? weather.humidity + '%' : 'Unknown'}
- Condition: ${weather.condition || 'Unknown'}
${weather.forecast && weather.forecast.length > 0 ? `- Forecast: ${weather.forecast.slice(0, 3).map(d => `${d.day}: ${d.temp}°C ${d.description}`).join(', ')}` : ''}

Rules:
1. Provide extremely precise, numeric answers when possible (e.g., specific water measurements, exact temperature ranges).
2. Use clear spacing and formatting.
3. Incorporate the weather forecast logic automatically without explicitly stating "According to the weather...", just give the direct advice.
4. If a question is entirely unrelated to agriculture or plants, gently redirect to farming.

Previous conversation history:
${messages.slice(-6).map(m => `${m.role === 'user' ? 'Farmer' : 'Assistant'}: ${m.content}`).join('\n')}

Farmer's question: ${inputMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      console.log('API Response:', data)

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response structure from API')
      }

      const aiResponse = data.candidates[0].content.parts[0].text

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)
      saveSession(finalMessages)

    } catch (error) {
      console.error('Error calling Gemini API:', error)
      console.error('Error details:', error.message)
      const errorMessage = {
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.message}\n\nPlease check your API key and try again.`,
        timestamp: new Date().toISOString()
      }
      const errorMessages = [...updatedMessages, errorMessage]
      setMessages(errorMessages)
      saveSession(errorMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatSessionDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const quickQuestions = [
    '🌱 How do I prevent tomato blight?',
    '💧 What is the best irrigation schedule for corn?',
    '🐛 How to identify and treat aphids?',
    '🌾 When is the best time to plant wheat?',
    '🥕 Tips for growing healthy carrots',
    '🌤️ How does weather affect crop yield?'
  ]

  const handleQuickQuestion = (question) => {
    setInputMessage(question.substring(2)) // Remove emoji
  }

  return (
    <div className="ai-insights-container">
      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-content">
          <div className="ai-title">
            <span className="ai-icon">🤖</span>
            <div>
              <h1>AI Insights</h1>
              <p>Your intelligent farming assistant</p>
            </div>
          </div>
          <div className="ai-actions">
            <button
              className="btn-secondary"
              onClick={() => setShowHistory(!showHistory)}
              title="Chat History"
            >
              📜 History
            </button>
            <button
              className="btn-primary"
              onClick={startNewSession}
              title="Start New Chat"
            >
              ➕ New Chat
            </button>
          </div>
        </div>
      </div>

      <div className="ai-main-content">
        {/* Sidebar - Chat History */}
        {showHistory && (
          <div className="chat-history-sidebar">
            <div className="sidebar-header">
              <h3>💬 Previous Chats</h3>
              <button
                className="close-sidebar"
                onClick={() => setShowHistory(false)}
              >
                ✕
              </button>
            </div>
            <div className="sessions-list">
              {sessionHistory.length === 0 ? (
                <p className="no-sessions">No previous conversations</p>
              ) : (
                sessionHistory.map(session => (
                  <div
                    key={session.id}
                    className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
                    onClick={() => loadSession(session.id)}
                  >
                    <div className="session-info">
                      <p className="session-title">{session.title}</p>
                      <p className="session-date">{formatSessionDate(session.lastUpdated)}</p>
                    </div>
                    <button
                      className="delete-session"
                      onClick={(e) => deleteSession(session.id, e)}
                      title="Delete conversation"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.length === 1 && (
              <div className="quick-questions">
                <h3>Quick Questions</h3>
                <div className="quick-questions-grid">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="quick-question-btn"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">{formatTimestamp(message.timestamp)}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message assistant">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                className="chat-input"
                placeholder="Ask me anything about farming, plants, or agriculture..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="1"
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
            <p className="input-hint">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
