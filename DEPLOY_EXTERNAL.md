# Deploy Harmony 2.0 Master Agent to External System

## Overview

Your agent has two parts:
1. **MCP Server** (stdio) - For Cursor integration (local)
2. **REST API** - For external/public access

For external deployment, you'll deploy the **REST API** server.

## Prerequisites

- GitHub account (for repository)
- Vercel/Render/Railway account (free tier)
- Gemini API key
- GitHub token

## Option 1: Deploy to Vercel (Recommended - Easiest)

### Step 1: Prepare for Deployment

1. **Create `vercel.json`** (already exists, but verify):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. **Update `package.json` scripts** (if needed):
```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

### Step 2: Deploy to Vercel

**Method A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add GEMINI_API_KEY
vercel env add GITHUB_TOKEN
vercel env add NODE_ENV production

# Deploy to production
vercel --prod
```

**Method B: Using GitHub Integration**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty or `npm install`)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`
6. Add Environment Variables:
   - `GEMINI_API_KEY` = your key
   - `GITHUB_TOKEN` = your token
   - `NODE_ENV` = `production`
7. Click "Deploy"

### Step 3: Access Your Deployed API

After deployment, Vercel gives you a URL like:
```
https://harmony2-gemini-mcp.vercel.app
```

Test it:
```bash
curl https://your-app.vercel.app/health
```

## Option 2: Deploy to Render

### Step 1: Prepare Repository

Make sure your code is on GitHub.

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: harmony2-master
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables:
   - `GEMINI_API_KEY` = your key
   - `GITHUB_TOKEN` = your token
   - `NODE_ENV` = `production`
6. Click "Create Web Service"

### Step 3: Access Your Service

Render gives you a URL like:
```
https://harmony2-master.onrender.com
```

**Note:** Free tier services on Render spin down after inactivity. First request may be slow.

## Option 3: Deploy to Railway

### Step 1: Deploy

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Add Environment Variables:
   - `GEMINI_API_KEY`
   - `GITHUB_TOKEN`
   - `NODE_ENV` = `production`
6. Railway auto-detects and deploys

### Step 2: Get URL

Railway automatically provides a public URL.

## Option 4: Deploy to Fly.io

### Step 1: Install Fly CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Create Fly App

```bash
# Login
fly auth login

# Initialize (in your project directory)
fly launch

# Set secrets
fly secrets set GEMINI_API_KEY=your_key
fly secrets set GITHUB_TOKEN=your_token
fly secrets set NODE_ENV=production

# Deploy
fly deploy
```

## Post-Deployment

### 1. Test Your API

```bash
# Health check
curl https://your-deployed-url.com/health

# Chat endpoint
curl -X POST https://your-deployed-url.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is Harmony 2.0?"}'
```

### 2. Share Your API

Your API is now publicly accessible! Share the URL with others.

**API Endpoints:**
- `GET /health` - Health check
- `POST /api/chat` - Chat with agent
- `POST /api/analyze` - Analyze code
- `POST /api/generate` - Generate code
- `POST /api/guidance` - Get guidance

### 3. Cache Considerations

**Important:** The `.cache/` directory won't persist on serverless platforms (Vercel, etc.).

**Solutions:**
- **Option A**: Use external cache (Redis, Upstash - free tier available)
- **Option B**: Accept that cache resets on each deployment
- **Option C**: Use persistent storage (Render, Railway have persistent disks)

For Vercel, consider using Upstash Redis (free tier):
```bash
npm install @upstash/redis
```

## Environment Variables Checklist

Make sure these are set in your hosting platform:

- ✅ `GEMINI_API_KEY` - Your Gemini API key
- ✅ `GITHUB_TOKEN` - Your GitHub token
- ✅ `NODE_ENV` - Set to `production`
- ✅ `PORT` - Usually auto-set by platform (optional)

## Monitoring

### Check Logs

**Vercel:**
```bash
vercel logs
```

**Render:**
- Dashboard → Your Service → Logs

**Railway:**
- Dashboard → Your Service → Deployments → View Logs

### Monitor Usage

- **GitHub API**: Check rate limit usage
- **Gemini API**: Monitor usage in Google AI Studio
- **Platform**: Check resource usage in dashboard

## Troubleshooting

### Build Fails
- ✅ Check Node.js version (needs 18+)
- ✅ Verify all dependencies in package.json
- ✅ Check build logs for errors

### Runtime Errors
- ✅ Verify environment variables are set
- ✅ Check application logs
- ✅ Test locally first

### API Not Responding
- ✅ Check if service is running
- ✅ Verify health endpoint
- ✅ Check firewall/network settings
- ✅ Review platform status page

### Cache Issues
- ✅ Serverless platforms don't persist `.cache/` directory
- ✅ Consider external cache service
- ✅ Or accept cache resets (still works, just slower first requests)

## Cost Management

**Free Tier Limits:**
- **Vercel**: 100GB bandwidth/month, unlimited requests
- **Render**: 750 hours/month, 512MB RAM
- **Railway**: $5 free credit/month
- **Fly.io**: 3 shared VMs, 3GB storage

**API Costs:**
- **Gemini API**: Free tier available
- **GitHub API**: 5,000 requests/hour with token

## Next Steps

1. Deploy to your chosen platform
2. Test all endpoints
3. Share your API URL
4. Monitor usage and costs
5. Consider adding rate limiting for public APIs

---

**Your Harmony 2.0 Master Agent is now ready for external access! 🚀**

