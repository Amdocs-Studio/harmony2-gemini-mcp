# Testing Your MCP Server

## Step 1: Test Locally with Cursor

### Find Cursor's MCP Configuration

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**Mac:**
```
~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

**Linux:**
```
~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json
```

### Add MCP Configuration

Open the file (create if it doesn't exist) and add:

```json
{
  "mcpServers": {
    "harmony2-master": {
      "command": "node",
      "args": ["C:\\Users\\yehudah\\OneDrive - AMDOCS\\Desktop\\CodingIsLife\\harmony2-gemini-mcp\\src\\mcp-server.js"],
      "env": {
        "GEMINI_API_KEY": "your_gemini_api_key_here",
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

**Important:** 
- Use **absolute path** to `mcp-server.js`
- Replace `your_gemini_api_key_here` and `your_github_token_here` with actual values
- On Mac/Linux, use forward slashes: `/path/to/harmony2-gemini-mcp/src/mcp-server.js`

### Restart Cursor

1. Completely close Cursor
2. Reopen Cursor
3. Check if MCP tools are available

### Verify MCP is Working

In Cursor, you should see Harmony 2.0 tools available:
- `harmony_chat` - Chat with Harmony 2.0 Master Agent
- `harmony_analyze_code` - Analyze code
- `harmony_generate_code` - Generate code
- `harmony_get_guidance` - Get guidance

## Step 2: Test MCP Server Directly (Debugging)

### Test with stdio

```bash
# Make sure .env has your keys
npm run mcp
```

You should see:
```
Harmony 2.0 MCP Server running on stdio
```

### Test with MCP Inspector (Optional)

Install MCP Inspector:
```bash
npm install -g @modelcontextprotocol/inspector
```

Run:
```bash
npx @modelcontextprotocol/inspector node src/mcp-server.js
```

This opens a web UI to test your MCP server.

## Step 3: Test API Endpoints

Start the API server:
```bash
npm start
```

Test endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Harmony 2.0?"}'

# Analyze code
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"code": "function test() {}", "language": "javascript"}'
```

## Troubleshooting

### MCP tools not showing in Cursor
- ✅ Check path is absolute and correct
- ✅ Verify Node.js is in PATH
- ✅ Restart Cursor completely
- ✅ Check Cursor's console/logs for errors
- ✅ Verify environment variables are set

### MCP server errors
- ✅ Check `.env` file has all required keys
- ✅ Verify Node.js version is 18+
- ✅ Check console output for specific errors

### API not responding
- ✅ Check server is running (`npm start`)
- ✅ Verify PORT in `.env` matches
- ✅ Check firewall settings

