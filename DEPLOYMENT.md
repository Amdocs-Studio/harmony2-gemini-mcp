# Deployment Guide for External Access

## Overview

This project provides two ways to access the Harmony 2.0 Master Agent:

1. **MCP Server (stdio)** - For local Cursor integration
2. **REST API** - For external/public access

## Important Note About MCP External Access

The current MCP implementation uses **stdio transport**, which is designed for local connections between Cursor and the server running on the same machine. 

For **external/public MCP access**, you have two options:

### Option 1: Use the REST API (Recommended for External Access)

The REST API (`src/index.js`) is designed for external access and can be deployed to any hosting platform. Users can interact with it via HTTP requests.

**Deploy the REST API:**
- Follow the deployment steps in SETUP.md
- Share the deployed URL
- Users can make HTTP requests to the endpoints

### Option 2: Implement HTTP MCP Transport (Advanced)

To enable true MCP over HTTP for external access, you would need to:
1. Implement an HTTP transport layer for MCP
2. Use WebSockets or Server-Sent Events for bidirectional communication
3. Handle authentication and rate limiting

This is more complex but provides native MCP protocol support.

## Recommended Deployment Strategy

### For Local Use (You):
- Use the MCP server directly with Cursor (stdio transport)
- Configure as shown in SETUP.md Step 5

### For Public/External Access (Everyone):
- Deploy the REST API to a free hosting service
- Share the API URL
- Users can:
  - Make HTTP requests directly
  - Build their own MCP wrapper if needed
  - Use it in their applications

## Free Tier Hosting Options

### 1. Vercel (Recommended)
- ✅ Easy deployment
- ✅ Automatic HTTPS
- ✅ Generous free tier
- ✅ Serverless functions

**Deploy:**
```bash
npm install -g vercel
vercel
vercel env add GEMINI_API_KEY
vercel --prod
```

### 2. Render
- ✅ Simple setup
- ✅ Free tier available
- ✅ Auto-deploy from GitHub

**Setup:**
1. Connect GitHub repo
2. Set build: `npm install`
3. Set start: `npm start`
4. Add `GEMINI_API_KEY` env var

### 3. Railway
- ✅ $5 free credit/month
- ✅ Easy GitHub integration
- ✅ Auto-deploy

**Setup:**
1. Connect GitHub repo
2. Add `GEMINI_API_KEY` env var
3. Deploy automatically

### 4. Fly.io
- ✅ Free tier available
- ✅ Global edge network
- ✅ Docker-based

**Deploy:**
```bash
fly launch
fly secrets set GEMINI_API_KEY=your_key
fly deploy
```

### 5. Replit
- ✅ Free tier
- ✅ In-browser IDE
- ✅ Easy sharing

**Setup:**
1. Import GitHub repo
2. Add secrets
3. Run

## Environment Variables

Make sure to set these in your hosting platform:

- `GEMINI_API_KEY` - **Required** - Your Gemini API key
- `PORT` - Optional - Server port (usually auto-set by platform)
- `NODE_ENV` - Optional - Set to `production` for production

## Testing Your Deployment

After deployment, test with:

```bash
# Set your deployed URL
export API_URL=https://your-app.vercel.app

# Run tests
npm test
```

Or manually:
```bash
curl https://your-app.vercel.app/health
```

## Sharing Your Deployment

Once deployed, share:
1. The API URL
2. Documentation on available endpoints
3. Example usage

Users can then:
- Use the REST API directly
- Build integrations
- Create their own MCP wrappers if needed

## Security Considerations

1. **API Key Protection**: Never expose your Gemini API key
2. **Rate Limiting**: Consider adding rate limiting for public APIs
3. **CORS**: Already configured for all origins (adjust if needed)
4. **Authentication**: Consider adding API keys/auth for production use

## Monitoring

Monitor your deployment:
- Check logs regularly
- Monitor API usage
- Watch for errors
- Track Gemini API quota usage

## Cost Management

Free tier limits:
- **Gemini API**: Check current free tier limits
- **Hosting**: Monitor usage on your chosen platform
- Set up alerts if available

## Troubleshooting Deployment

### Build Fails
- Check Node.js version (needs 18+)
- Verify all dependencies in package.json
- Check build logs

### Runtime Errors
- Verify environment variables are set
- Check application logs
- Test locally first

### API Not Responding
- Check if service is running
- Verify health endpoint
- Check firewall/network settings
- Review platform status page

---

**Remember**: The REST API is the best option for external/public access. The MCP stdio server is optimized for local Cursor integration.

