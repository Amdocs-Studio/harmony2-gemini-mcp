# 🚀 Quick Start Guide

Get your Harmony 2.0 Master Agent up and running in 5 minutes!

## Prerequisites Check
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 1. Setup (2 minutes)

```bash
# Install dependencies
npm install

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env
echo "PORT=3000" >> .env
```

**Replace `your_key_here` with your actual Gemini API key!**

## 2. Test Locally (1 minute)
how
```bash
# Start the server
npm start

# In another terminal, test it
npm test
```

You should see ✅ for all tests!

## 3. Connect to Cursor (2 minutes)

### Find Cursor's MCP Config Location:
- **Windows**: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- **Mac**: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- **Linux**: `~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

### Add This Config:

**Windows:**
```json
{
  "mcpServers": {
    "harmony2-master": {
      "command": "node",
      "args": ["C:\\Users\\yehudah\\OneDrive - AMDOCS\\Desktop\\CodingIsLife\\harmony2-gemini-mcp\\src\\mcp-server.js"],
      "env": {
        "GEMINI_API_KEY": "your_key_here"
      }
    }
  }
}
```

**Mac/Linux:**
```json
{
  "mcpServers": {
    "harmony2-master": {
      "command": "node",
      "args": ["/absolute/path/to/harmony2-gemini-mcp/src/mcp-server.js"],
      "env": {
        "GEMINI_API_KEY": "your_key_here"
      }
    }
  }
}
```

### Restart Cursor
Close and reopen Cursor completely.

### Verify
In Cursor, you should now see Harmony 2.0 tools available!

## 4. Deploy for Public Access (Optional)

### Vercel (Easiest):
```bash
npm install -g vercel
vercel
vercel env add GEMINI_API_KEY
vercel --prod
```

Done! Share your URL with others.

## 🎯 What You Can Do Now

### In Cursor:
- Ask: "How do I set up Harmony 2.0?"
- Analyze code: Use `harmony_analyze_code` tool
- Generate code: Use `harmony_generate_code` tool
- Get guidance: Use `harmony_get_guidance` tool

### Via API:
```bash
# Chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Harmony 2.0?"}'

# Analyze code
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "function test() {}", "language": "javascript"}'
```

## 🆘 Troubleshooting

**"GEMINI_API_KEY is required"**
→ Check your `.env` file exists and has the correct key

**MCP tools not showing in Cursor**
→ Verify the path is absolute and correct
→ Make sure Node.js is in PATH
→ Restart Cursor completely

**API not responding**
→ Check server is running: `npm start`
→ Verify port 3000 is available

## 📚 Next Steps

- Read [SETUP.md](SETUP.md) for detailed setup
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options
- Read [README.md](README.md) for full documentation

---

**That's it! You're ready to use Harmony 2.0 Master Agent! 🎉**

