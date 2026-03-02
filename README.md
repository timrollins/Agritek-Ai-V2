# 🌾 AgriTek AI - Smart Farming Platform

A modern, intelligent farming platform that helps farmers manage their crops, monitor plant health, and get expert AI-powered agricultural advice.

## ✨ Features

### 📊 Dashboard
- Real-time weather information
- Plant health monitoring
- Farm statistics and analytics
- Quick access to all features

### 🌱 My Plants
- Track all your plants and crops
- Monitor growth and health status
- Get care recommendations
- Manage planting schedules

### 🤖 AI Insights (NEW!)
- **Intelligent AI chatbot powered by Google Gemini**
- Expert agricultural knowledge and advice
- Context-aware conversations
- Persistent chat history across sessions
- Beautiful, responsive interface
- Quick question templates

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key (free)

### Installation

1. **Clone and install dependencies**
```bash
cd Agritek-Ai-V2
npm install
```

2. **Get your Gemini API key**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in and create an API key
   - Copy the key

3. **Configure environment**
```bash
# Edit .env file and add your API key:
VITE_GEMINI_API_KEY=your_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:5173
```

## 📚 AI Chatbot Documentation

Complete documentation for the AI Insights chatbot:

- **[AI_CHATBOT_INDEX.md](AI_CHATBOT_INDEX.md)** - Start here! Complete documentation index
- **[QUICK_START.md](QUICK_START.md)** - 3-step setup guide
- **[GEMINI_API_SETUP.md](GEMINI_API_SETUP.md)** - How to get your API key
- **[CHATBOT_FEATURES.md](CHATBOT_FEATURES.md)** - Feature guide and usage tips
- **[AI_INSIGHTS_SETUP.md](AI_INSIGHTS_SETUP.md)** - Complete setup instructions
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Testing and verification
- **[AI_CHATBOT_SUMMARY.md](AI_CHATBOT_SUMMARY.md)** - Technical overview

## 🎯 Key Features of AI Insights

### 🤖 Intelligent Assistant
- Powered by Google Gemini Pro
- Specialized in agriculture and farming
- Context-aware responses
- Natural language conversations

### 💾 Data Persistence
- Automatic session saving
- Chat history management
- Resume previous conversations
- Stores up to 20 sessions

### 🎨 Beautiful UI
- Modern, responsive design
- Smooth animations
- Mobile-friendly
- Professional agricultural theme

### 🚀 User-Friendly
- Quick question templates
- Keyboard shortcuts
- Auto-scroll
- Typing indicators
- Session management

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Build Tool**: Vite
- **AI**: Google Gemini Pro API
- **Storage**: Browser localStorage
- **Styling**: Custom CSS with animations

## 📁 Project Structure

```
Agritek-Ai-V2/
├── src/
│   ├── components/
│   │   ├── AIInsights.jsx       ← AI Chatbot
│   │   ├── Dashboard.jsx
│   │   ├── MyPlants.jsx
│   │   └── Navigation.jsx
│   ├── styles/
│   │   ├── AIInsights.css
│   │   └── ...
│   ├── App.jsx
│   └── main.jsx
├── .env                         ← API configuration
├── package.json
└── Documentation/               ← Complete guides
```

## 🎓 Usage

### Navigate the Platform
1. **Dashboard** - View farm overview and weather
2. **My Plants** - Manage your crops
3. **AI Insights** - Chat with your AI farming assistant

### Using AI Insights
1. Click "🤖 AI Insights" in navigation
2. Try a quick question or ask your own
3. Get expert agricultural advice
4. All conversations auto-saved!

### Example Questions
- "How do I prevent tomato blight?"
- "What's the best irrigation schedule for corn?"
- "How to identify aphids on my plants?"
- "When should I plant peppers?"

## 🔒 Security

- API keys stored in environment variables
- Data stored locally in browser
- No server-side storage
- Secure HTTPS API communication

## 🐛 Troubleshooting

### AI not responding?
1. Check API key in `.env`
2. Restart dev server
3. Verify internet connection
4. See [GEMINI_API_SETUP.md](GEMINI_API_SETUP.md)

### Styling issues?
1. Clear browser cache
2. Check CSS imports
3. Try different browser

### More help?
Check the comprehensive documentation in the project root.

## 📈 Future Enhancements

- [ ] Voice input/output for AI chat
- [ ] Image upload for plant identification
- [ ] Export chat history
- [ ] Multi-language support
- [ ] User authentication
- [ ] Cloud sync for chat history
- [ ] Advanced analytics
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- React team for the amazing framework
- Vite for blazing fast development
- The farming community for inspiration

---

## 🌟 Getting Started with AI Chatbot

**New to the AI chatbot?** Start here:

1. Read [QUICK_START.md](QUICK_START.md) (2 minutes)
2. Get your API key from [GEMINI_API_SETUP.md](GEMINI_API_SETUP.md) (3 minutes)
3. Start chatting! 🎉

**Want to learn more?** Check [AI_CHATBOT_INDEX.md](AI_CHATBOT_INDEX.md) for complete documentation.

---

**Built with ❤️ for farmers everywhere 🌾🚜**

*Happy Farming! 🌱*
