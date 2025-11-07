# Connect to External Harmony 2.0 MCP

Your MCP server is now deployed at: **https://harmony2-gemini-mcp.vercel.app/mcp**

## How to Connect in Cursor

Update your `mcp.json` file to use the external MCP:

```json
{
  "mcpServers": {
    "harmony2-master": {
      "url": "https://harmony2-gemini-mcp.vercel.app/mcp",
      "headers": {
        "User-Agent": "MCP-Client/1.0"
      }
    }
  }
}
```

**Location of mcp.json:**
- **Windows**: `%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`
- **Mac**: `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- **Linux**: `~/.config/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

## Steps

1. **Open your mcp.json file**
2. **Replace the `harmony2-master` entry** with the URL-based configuration above
3. **Remove the `command` and `args`** (those are for local MCP)
4. **Use `url` instead** (like your Figma example)
5. **Restart Cursor completely**

## Test the Connection

After restarting Cursor, you should see:
- Harmony 2.0 tools available in Cursor
- `harmony_chat`, `harmony_analyze_code`, `harmony_generate_code`, `harmony_get_guidance`

## Troubleshooting

### MCP not showing in Cursor
- ✅ Verify the URL is correct: `https://harmony2-gemini-mcp.vercel.app/mcp`
- ✅ Check Vercel deployment is live
- ✅ Restart Cursor completely
- ✅ Check Cursor's console/logs for errors

### Connection errors
- ✅ Test the endpoint: `curl https://harmony2-gemini-mcp.vercel.app/mcp/health`
- ✅ Verify environment variables are set in Vercel
- ✅ Check Vercel logs for errors

### Proxy issues
If you're behind a corporate proxy (like your Figma config shows), you might need to add proxy settings:

```json
{
  "mcpServers": {
    "harmony2-master": {
      "url": "https://harmony2-gemini-mcp.vercel.app/mcp",
      "headers": {
        "User-Agent": "MCP-Client/1.0"
      },
      "env": {
        "HTTP_PROXY": "http://genproxy.corp.amdocs.com:8080/",
        "HTTPS_PROXY": "http://genproxy.corp.amdocs.com:8080/",
        "NO_PROXY": "localhost,127.0.0.1"
      }
    }
  }
}
```

## Benefits of External MCP

- ✅ Accessible from anywhere
- ✅ No need to run local server
- ✅ Share with others easily
- ✅ Always up-to-date (auto-deploys from GitHub)
- ✅ Uses server-side caching (faster responses)

## Note

The external MCP uses the same agent and capabilities as the local one, but:
- Runs on Vercel's servers
- Uses server-side caching
- Accessible to anyone with the URL
- No local environment setup needed

