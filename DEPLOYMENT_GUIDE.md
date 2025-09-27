# 🚀 EthicCheck Deployment Guide

## Quick Deployment to Production

### Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free)

### Step 1: Deploy Backend to Railway

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your EthicCheck repository
   - Choose the `backend` folder as root directory
   - Railway will automatically detect Node.js and deploy

3. **Set Environment Variables in Railway:**
   - Go to your Railway project settings
   - Add these environment variables:
     ```
     DATABASE_URL=your_supabase_database_url
     FMP_API_KEY=your_fmp_api_key
     PORT=3001
     ```

4. **Get Railway URL:**
   - Railway will give you a URL like: `https://ethiccheck-api.railway.app`
   - Copy this URL for the frontend configuration

### Step 2: Deploy Frontend to Vercel

1. **Update API URL:**
   - In `src/services/api.ts`, the API_BASE_URL is already configured to use environment variables
   - Vercel will automatically use the production URL

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → "Import Git Repository"
   - Select your EthicCheck repository
   - Vercel will automatically detect React and deploy

3. **Set Environment Variables in Vercel:**
   - Go to your Vercel project settings
   - Add this environment variable:
     ```
     REACT_APP_API_URL=https://ethiccheck-api.railway.app
     ```

4. **Redeploy:**
   - After setting environment variables, trigger a new deployment

### Step 3: Test Production

1. **Test Backend:**
   ```bash
   curl https://ethiccheck-api.railway.app/health
   ```

2. **Test Frontend:**
   - Visit your Vercel URL
   - Try screening some stocks
   - Verify all features work

### Step 4: Custom Domain (Optional)

1. **Vercel Domain:**
   - Go to Vercel project settings
   - Add your custom domain
   - Vercel will handle SSL automatically

2. **Railway Domain:**
   - Railway provides a free subdomain
   - Or add your own custom domain

## Expected URLs

- **Frontend:** `https://ethiccheck.vercel.app` (or your custom domain)
- **Backend:** `https://ethiccheck-api.railway.app`

## Monitoring

- **Vercel:** Built-in analytics and performance monitoring
- **Railway:** Built-in logs and metrics
- **Database:** Supabase dashboard for data monitoring

## Troubleshooting

### Backend Issues
- Check Railway logs for errors
- Verify environment variables are set
- Ensure database connection is working

### Frontend Issues
- Check Vercel deployment logs
- Verify API_URL environment variable
- Test API endpoints directly

### Database Issues
- Check Supabase dashboard
- Verify DATABASE_URL is correct
- Run data quality checks

## Cost

- **Vercel:** Free tier (generous limits)
- **Railway:** Free tier (500 hours/month)
- **Supabase:** Free tier (500MB database)

Total cost: **$0/month** for MVP!



