# AI Insights Setup Guide

## Overview
The AI Insights chatbot is an intelligent farming assistant powered by Google's Gemini AI. It provides farmers with expert advice on plants, crops, pest management, irrigation, and all agricultural topics.

## Features

### 🤖 Intelligent AI Assistant
- Powered by Google Gemini Pro API
- Expert knowledge in agriculture and farming
- Context-aware responses based on conversation history
- Friendly and practical advice tailored for farmers

### 💾 Session Storage
- Automatically saves all conversations to browser localStorage
- Maintains up to 20 previous chat sessions
- Resume previous conversations anytime
- Each session has a descriptive title based on the first question

### 🎨 Beautiful User Interface
- Modern, clean design with smooth animations
- Responsive layout for desktop, tablet, and mobile
- Real-time typing indicators
- Message timestamps
- Quick question buttons for common queries
- Collapsible chat history sidebar

### 📱 User-Friendly Features
- Quick question templates for common farming topics
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Auto-scroll to latest messages
- Session management (create new, view history, delete old chats)
- Visual feedback for loading states

## Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables

Open the `.env` file in your project root and replace `your_gemini_api_key_here` with your actual API key:

```env
VITE_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

**Important Security Notes:**
- Never commit your actual API key to version control
- Consider using `.env.local` instead (it's git-ignored by default)
- Keep your API key confidential

### 3. Install Dependencies (if needed)

The chatbot uses only React (already installed). No additional dependencies required!

### 4. Run the Application

```bash
npm run dev
```

### 5. Access AI Insights

1. Open your browser to the local development URL (usually http://localhost:5173)
2. Click on "🤖 AI Insights" in the navigation menu
3. Start chatting with your AI farming assistant!

## Usage Guide

### Starting a Conversation
- Click on any quick question button to get started
- Or type your own question in the input field
- Press Enter to send (Shift+Enter for multi-line)

### Managing Sessions
- **New Chat**: Click "➕ New Chat" to start a fresh conversation
- **History**: Click "📜 History" to view previous conversations
- **Load Session**: Click on any previous session to continue it
- **Delete Session**: Click the 🗑️ icon next to a session to delete it

### Best Practices
- Ask specific questions for better answers
- Provide context about your location, climate, or crop type when relevant
- Use the chat history to reference previous advice
- Start new sessions for different topics to keep conversations organized

## Example Questions

The AI can help with:
- 🌱 Plant care and cultivation techniques
- 🌾 Crop management and rotation strategies
- 🐛 Pest and disease identification and treatment
- 💧 Irrigation schedules and water management
- 🌤️ Weather-related farming advice
- 🌿 Organic and sustainable farming practices
- 🥕 Specific crop growing tips
- 🚜 Farm equipment and tool recommendations

## Troubleshooting

### "Failed to get response from AI" Error
- Check that your API key is correctly set in the `.env` file
- Verify your API key is active at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure you have internet connectivity
- Check if you've exceeded your API quota

### Chat History Not Saving
- Ensure browser localStorage is enabled
- Check browser console for any errors
- Try clearing browser cache and reloading

### Styling Issues
- Make sure `AIInsights.css` is properly imported
- Clear browser cache
- Check for CSS conflicts with other components

## Technical Details

### Data Storage
- Chat sessions are stored in browser localStorage
- Key: `agritek_chat_sessions`
- Current session ID: `agritek_current_session`
- Maximum 20 sessions retained (oldest deleted automatically)

### API Integration
- Uses Google Gemini Pro model
- Temperature: 0.7 (balanced creativity and accuracy)
- Max output tokens: 1024
- Includes last 6 messages as context for continuity

### Component Structure
```
AIInsights.jsx          - Main component logic
AIInsights.css          - Styling and animations
App.jsx                 - Route integration
Navigation.jsx          - Navigation menu
```

## Future Enhancements (Optional)

Consider adding:
- Export chat history as PDF or text
- Voice input/output capabilities
- Image upload for plant disease identification
- Integration with weather data from your existing API
- Multi-language support
- Offline mode with cached responses

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all setup steps were completed
3. Ensure API key is valid and has quota remaining
4. Review the Gemini API documentation: https://ai.google.dev/docs

---

**Happy Farming! 🌾**
