# Step-by-Step Setup Guide

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (you'll need it in Step 3)

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure Environment

1. Create a `.env` file in the root directory:
```bash
# Windows PowerShell
New-Item .env

# Linux/Mac
touch .env
```

2. Add your configuration:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
NODE_ENV=development
MCP_SERVER_NAME=harmony2-master
MCP_SERVER_VERSION=1.0.0
```

Replace `your_actual_api_key_here` with the key you got from Step 1.

## Step 4: Test Locally

### Test the REST API:
```bash
npm start
```

In another terminal, test it:
```bash
# Health check
curl http://localhost:3000/health

# Chat test
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Harmony 2.0?"}'
```

### Test the MCP Server:
```bash
npm run mcp
```

This will run the MCP server on stdio (for Cursor integration).

## Step 5: Configure Cursor (Local)

1. Open Cursor Settings
2. Find "MCP Servers" or "Model Context Protocol" settings
3. Add this configuration:

**For Windows:**
```json
{
  "mcpServers": {
    "harmony2-master": {
      "command": "node",
      "args": ["C:\\Users\\yehudah\\OneDrive - AMDOCS\\Desktop\\CodingIsLife\\harmony2-gemini-mcp\\src\\mcp-server.js"],
      "env": {
        "GEMINI_API_KEY": "your_gemini_api_key_here"
      }
    }
  }
}
```

**For Mac/Linux:**
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

4. Restart Cursor
5. You should see "Harmony 2.0" tools available in Cursor!

## Step 6: Deploy to Make It Publicly Accessible

### Option A: Deploy to Vercel (Easiest)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variable:
```bash
vercel env add GEMINI_API_KEY
```
   - Enter your Gemini API key when prompted
   - Select "Production" environment

5. Redeploy:
```bash
vercel --prod
```

6. Your API is now live! Share the URL with others.

### Option B: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: harmony2-master
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your API key
6. Click "Create Web Service"
7. Wait for deployment (2-3 minutes)
8. Your service will be available at `https://harmony2-master.onrender.com`

### Option C: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select this repository
5. Add Environment Variable:
   - `GEMINI_API_KEY` = your key
6. Railway will auto-deploy
7. Your service will get a public URL automatically

## Step 7: Share Your MCP Server

Once deployed, others can use your MCP server by configuring Cursor with:

```json
{
  "mcpServers": {
    "harmony2-master": {
      "url": "https://your-deployed-url.com"
    }
  }
}
```

**Note**: For MCP over HTTP, you may need to implement an HTTP transport layer. The current implementation uses stdio. For external access, consider:

1. Using the REST API endpoints directly
2. Implementing an HTTP MCP transport
3. Using a service like ngrok for local development sharing

## Troubleshooting

### "GEMINI_API_KEY is required" error
- Make sure your `.env` file exists and has the correct key
- Check that the key doesn't have extra spaces or quotes

### MCP server not showing in Cursor
- Verify the path in Cursor config is correct (use absolute path)
- Check that Node.js is in your PATH
- Restart Cursor completely
- Check Cursor's logs/console for errors

### API not responding
- Check that the server is running (`npm start`)
- Verify the PORT in `.env` matches what you're accessing
- Check firewall settings

### Deployment issues
- Ensure all environment variables are set in your hosting platform
- Check build logs for errors
- Verify Node.js version compatibility (18+)

## Next Steps

- Customize the Harmony knowledge base in `src/harmony-agent.js`
- Add more MCP tools as needed
- Enhance the agent's capabilities
- Share your deployed URL with the community!

