# 🚀 Vercel Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account**
   - Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a new cluster
   - Get your connection string

2. **Vercel Account**
   - Create a free account at [vercel.com](https://vercel.com)
   - Install Vercel CLI: `npm i -g vercel`

3. **GitHub Repository**
   - Push your code to GitHub

## Step 1: Configure MongoDB Atlas

1. Go to your MongoDB Atlas dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Replace `<password>` with your actual password
6. Replace `myFirstDatabase` with `ai-sketch-studio`

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty
   - **Output Directory**: `frontend`

4. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A long random string (generate with: `openssl rand -base64 32`)
   - `CLIENT_URL`: Will be your Vercel URL (e.g., `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`

5. Click "Deploy"

### Option B: Via Vercel CLI

1. Login to Vercel:
```bash
vercel login
```

2. Navigate to your project:
```bash
cd ai-sketch-studio
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project? **No**
   - Project name: **ai-sketch-studio**
   - Directory: **./`**
   - Override settings? **No**

5. Add environment variables:
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add CLIENT_URL
vercel env add NODE_ENV
```

6. Deploy to production:
```bash
vercel --prod
```

## Step 3: Update CLIENT_URL

After first deployment:

1. Copy your Vercel URL (e.g., `https://ai-sketch-studio.vercel.app`)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Update `CLIENT_URL` to your Vercel URL
4. Redeploy: Click "Deployments" → "..." → "Redeploy"

## Step 4: Configure MongoDB Atlas Network Access

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - This is safe because your connection is protected by username/password
4. Click "Confirm"

## Environment Variables Reference

```env
# Required Environment Variables for Vercel

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-sketch-studio?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
PORT=5000
```

## Troubleshooting

### WebSocket Connection Issues

Vercel Serverless functions have a 10-second timeout. For real-time collaboration:

**Option 1**: Use a separate WebSocket server
- Deploy backend to Railway, Render, or Heroku
- Update `SOCKET_URL` in frontend config

**Option 2**: Use Vercel Edge Functions (Beta)
- Enable Edge Functions in vercel.json
- Note: Some limitations apply

### Database Connection Errors

1. Check MongoDB Atlas network access allows Vercel IPs
2. Verify connection string is correct
3. Ensure password doesn't contain special characters (or URL encode them)

### Build Failures

1. Check all dependencies are in package.json
2. Verify Node.js version (Vercel uses Node 18 by default)
3. Check build logs in Vercel dashboard

## Alternative: Deploy Backend Separately

For better WebSocket support, consider:

### Backend on Railway/Render:
```bash
# Deploy backend separately
git subtree push --prefix backend railway main
```

### Frontend on Vercel:
```bash
# Deploy only frontend
cd frontend
vercel
```

Update `config.js` with your backend URL.

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Environment variables set in Vercel
- [ ] CLIENT_URL updated after first deployment
- [ ] MongoDB Network Access configured
- [ ] Test authentication (register/login)
- [ ] Test project creation and saving
- [ ] Test sharing functionality
- [ ] Test real-time collaboration (if using separate WebSocket server)

## Monitoring

- **Vercel Analytics**: Enable in Vercel Dashboard → Analytics
- **MongoDB Atlas**: Monitor in Atlas Dashboard → Metrics
- **Logs**: Check Vercel Dashboard → Deployments → View Function Logs

## Security Notes

1. Never commit `.env` file to Git
2. Use strong JWT_SECRET (minimum 32 characters)
3. Enable MongoDB Atlas IP whitelist in production
4. Regularly update dependencies
5. Enable Vercel's Security Headers

## Support

For issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Review browser console for frontend errors
4. Check Network tab for API request failures

## Costs

- **MongoDB Atlas**: Free tier (512 MB)
- **Vercel**: Free tier with limits:
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Serverless function execution time limits

For production apps with heavy traffic, consider paid plans.
