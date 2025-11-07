# Harmony 2.0 Master Agent - Gemini MCP Server

A powerful Gemini-powered agent that serves as the master guide for Harmony 2.0 development, accessible via Model Context Protocol (MCP) for Cursor and other MCP-compatible tools.

## 🌟 Features

- **Harmony 2.0 Expert**: Deep knowledge of Harmony 2.0 architecture, patterns, and best practices
- **MCP Integration**: Full Model Context Protocol support for Cursor and other tools
- **Free Tier Compatible**: Designed to run on free-tier hosting services
- **Multiple Interfaces**: 
  - MCP server for Cursor integration
  - REST API for external access
  - Direct programmatic access

## 📋 Prerequisites

- Node.js 18+ 
- Gemini API key (free tier available at [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your Gemini API key:

```bash
cp .env.example .env
```

Edit `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 3. Local Development

#### Run the REST API Server:
```bash
npm start
```

The API will be available at `http://localhost:3000`

#### Run the MCP Server (for Cursor):
```bash
npm run mcp
```

## 🔧 Cursor Integration

### Option 1: Local MCP Server

1. Add to your Cursor MCP configuration (usually in `~/.cursor/mcp.json` or Cursor settings):

```json
{
  "mcpServers": {
    "harmony2-master": {
      "command": "node",
      "args": ["/absolute/path/to/harmony2-gemini-mcp/src/mcp-server.js"],
      "env": {
        "GEMINI_API_KEY": "your_gemini_api_key_here"
      }
    }
  }
}
```

2. Restart Cursor
3. The Harmony 2.0 tools will appear in Cursor's MCP tools section

### Option 2: External MCP Server (Recommended for Sharing)

Deploy the server (see Deployment section) and configure Cursor to connect to it.

## 🌐 Deployment (Free Tier Options)

### Option 1: Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variable:
```bash
vercel env add GEMINI_API_KEY
```

4. Your API will be available at `https://your-project.vercel.app`

### Option 2: Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add `GEMINI_API_KEY` in Environment Variables
5. Deploy!

### Option 3: Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add `GEMINI_API_KEY` environment variable
4. Deploy!

### Option 4: Fly.io

1. Install Fly CLI:
```bash
curl -L https://fly.io/install.sh | sh
```

2. Initialize:
```bash
fly launch
```

3. Set secrets:
```bash
fly secrets set GEMINI_API_KEY=your_key_here
```

4. Deploy:
```bash
fly deploy
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Chat with Harmony Agent
```
POST /api/chat
Body: {
  "message": "How do I set up a new Harmony 2.0 project?",
  "context": {} // optional
}
```

### Analyze Code
```
POST /api/analyze
Body: {
  "code": "your code here",
  "language": "javascript" // optional
}
```

### Generate Code
```
POST /api/generate
Body: {
  "description": "Create a React component for user authentication",
  "componentType": "component" // optional
}
```

### Get Guidance
```
POST /api/guidance
Body: {
  "topic": "state management"
}
```

## 🛠️ MCP Tools

The MCP server exposes these tools:

1. **harmony_chat** - Chat with the Harmony 2.0 Master Agent
2. **harmony_analyze_code** - Analyze code for Harmony 2.0 compliance
3. **harmony_generate_code** - Generate code following Harmony 2.0 patterns
4. **harmony_get_guidance** - Get comprehensive guidance on Harmony 2.0 topics

## 📚 Harmony 2.0 Resources

- [Official Documentation](https://amdocs-studio.github.io/harmony-2.0/develop-with-harmony)
- [GitHub Repository](https://github.com/Amdocs-Studio/harmony-2.0)

## 🔐 Security Notes

- Never commit your `.env` file
- Keep your Gemini API key secure
- For production, use environment variables provided by your hosting platform
- Consider rate limiting for public APIs

## 🆓 Free Tier Limits

- **Gemini API**: Free tier includes generous usage limits
- **Vercel**: 100GB bandwidth/month, unlimited requests
- **Render**: 750 hours/month, 512MB RAM
- **Railway**: $5 free credit/month
- **Fly.io**: 3 shared VMs, 3GB storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT

## 🆘 Support

For issues or questions:
1. Check the [Harmony 2.0 documentation](https://amdocs-studio.github.io/harmony-2.0/develop-with-harmony)
2. Open an issue on GitHub
3. Contact the Harmony 2.0 community

---

**Built with ❤️ for the Harmony 2.0 community**

