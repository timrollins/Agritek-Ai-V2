# Quick Guide: Getting Your Gemini API Key

## Step-by-Step Instructions

### 1. Visit Google AI Studio
Go to: **https://makersuite.google.com/app/apikey**

### 2. Sign In
- Use your Google account to sign in
- Accept the terms of service if prompted

### 3. Create API Key
- Click the **"Create API Key"** button
- Choose to create a new project or use an existing one
- Your API key will be generated instantly

### 4. Copy Your API Key
- Click the copy button next to your API key
- Keep this key secure and private

### 5. Add to Your Project
Open the `.env` file and replace the placeholder:

```env
VITE_GEMINI_API_KEY=paste_your_actual_key_here
```

### 6. Restart Your Dev Server
After updating the `.env` file:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Important Notes

### Free Tier Limits
- 60 requests per minute
- 1,500 requests per day
- Free for testing and development

### Security Best Practices
✅ **DO:**
- Keep your API key private
- Use environment variables
- Add `.env` to `.gitignore`
- Use `.env.local` for local development

❌ **DON'T:**
- Share your API key publicly
- Commit API keys to Git
- Hardcode keys in your source code
- Use the same key for production and development

### Troubleshooting

**"API key not valid" error:**
- Double-check you copied the entire key
- Ensure no extra spaces before/after the key
- Verify the key is active in Google AI Studio

**"Quota exceeded" error:**
- You've hit the free tier limit
- Wait for the quota to reset (daily)
- Consider upgrading if needed

**"Failed to fetch" error:**
- Check your internet connection
- Verify the API endpoint is accessible
- Check browser console for CORS issues

## Testing Your Setup

After setting up your API key, test it by:
1. Navigate to AI Insights in your app
2. Ask a simple question like "What is tomato blight?"
3. You should receive a detailed response within a few seconds

## Additional Resources

- **Gemini API Documentation**: https://ai.google.dev/docs
- **Google AI Studio**: https://makersuite.google.com/
- **Pricing Information**: https://ai.google.dev/pricing
- **API Reference**: https://ai.google.dev/api/rest

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Verify your `.env` file is in the project root
3. Ensure the dev server was restarted after adding the key
4. Test your API key directly in Google AI Studio

---

**Ready to go? Your AI farming assistant is waiting! 🌱🤖**
