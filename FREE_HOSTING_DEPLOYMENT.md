# Free Hosting Deployment Guide

Deploy your SmartLearn Analytics application to the cloud for free using Railway.app and Vercel. This guide provides step-by-step instructions to get your app live with a public URL accessible from any computer.

## 📋 Prerequisites

- [GitHub Account](https://github.com) (free)
- [Railway.app Account](https://railway.app) (free, 500 hours/month)
- [Vercel Account](https://vercel.com) (free)
- Your code pushed to a GitHub repository

## 🚀 Part 1: Prepare GitHub Repository

### Step 1.1: Initialize Git (if not already done)
```powershell
cd c:\Users\HomePC\smartlearn-analytics
git init
git add .
git commit -m "Initial commit: SmartLearn Analytics with weak topics detection"
```

### Step 1.2: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a repository named `smartlearn-analytics`
3. Do NOT initialize with README (you already have one)
4. Click "Create repository"

### Step 1.3: Push to GitHub
```powershell
cd c:\Users\HomePC\smartlearn-analytics
git remote add origin https://github.com/YOUR_USERNAME/smartlearn-analytics.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## 📦 Part 2: Deploy Backend to Railway.app

Railway automatically detects Python/Django and builds your app. The `Procfile` tells it how to run and migrate.

### Step 2.1: Create Railway Account & Connect GitHub
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub (click "Deploy with GitHub")
3. Authorize Railway to access your GitHub account

### Step 2.2: Create New Project
1. Click "Create New Project"
2. Select "Deploy from GitHub repo"
3. Find and select `smartlearn-analytics` repository
4. Click "Deploy Now"

**Railway will automatically:**
- Detect Django app from `manage.py`
- Run migrations via Procfile: `python manage.py migrate`
- Start server: `gunicorn smartlearn_analytics.wsgi`

### Step 2.3: Configure Environment Variables
Once deployment starts, go to **Variables** tab and add:

```
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=*.railway.app,yourdomain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-vercel-url.vercel.app
DATABASE_URL=postgres://...  (auto-generated, don't modify)
```

**To generate SECRET_KEY:**
```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Step 2.4: Get Backend URL
After successful deployment:
1. Go to **Deployments** tab
2. Find the domain (looks like: `smartlearn-analytics.up.railway.app`)
3. Your API will be at: `https://smartlearn-analytics.up.railway.app/api/`
4. Copy this URL - you'll need it for the frontend

**Test the backend:**
```
GET https://smartlearn-analytics.up.railway.app/api/students/
(with authentication token)
```

---

## 🎨 Part 3: Deploy Frontend to Vercel

Vercel automatically detects and builds React/Vite apps with zero configuration.

### Step 3.1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (click "Continue with GitHub")
3. Authorize Vercel to access your GitHub account

### Step 3.2: Deploy Frontend
1. Click "New Project"
2. Find and select `smartlearn-analytics` repository
3. Root Directory: `Frontend` (important!)
4. Click "Deploy"

**Vercel automatically:**
- Detects Vite config
- Installs dependencies from package.json
- Builds with `npm run build`
- Serves on HTTPS with auto-renewal

### Step 3.3: Update Backend API URL
Before or immediately after deployment, update the API endpoint:

**File:** `Frontend/src/utils/api.js`

```javascript
const API = axios.create({
  baseURL: 'https://smartlearn-analytics.up.railway.app/api'  // <- Update this
});
```

Then:
```powershell
cd c:\Users\HomePC\smartlearn-analytics
git add Frontend/src/utils/api.js
git commit -m "Update API URL for Railway backend"
git push
```

Vercel will automatically redeploy when you push to GitHub.

### Step 3.4: Get Frontend URL
After successful deployment:
1. Go to Vercel dashboard → your project
2. Find the domain (looks like: `smartlearn-analytics.vercel.app`)
3. **This is your public app URL!**

---

## ✅ Step 4: Testing Your Deployment

### 4.1: Test Frontend (Initial Load)
1. Open: `https://smartlearn-analytics.vercel.app`
2. You should see the login page
3. Check browser console (F12 → Console) for any errors

### 4.2: Create Superuser for Testing
```powershell
cd c:\Users\HomePC\smartlearn-analytics\backend
railway run python manage.py createsuperuser
# or if using Railway CLI:
# railway shell
# python manage.py createsuperuser
```

Alternatively, use Django admin on production:
```
https://smartlearn-analytics.up.railway.app/admin/
```

### 4.3: Test Weak Topics Feature
1. Log in to app at `https://smartlearn-analytics.vercel.app`
2. Go to "Records" page
3. Add an assignment with:
   - Student: Any
   - Subject: "Math"
   - Topic: "Fractions"
   - Score: 45
4. Go to "Student Insights"
5. Should show "Fractions" under "Weak Topics" with score 45% and source "Assignments"

### 4.4: Test from Different Computer
Access `https://smartlearn-analytics.vercel.app` from another device on the internet to verify it's truly accessible globally.

---

## 🔧 Continuous Deployment (Auto-Deploy on Git Push)

**Both Railway and Vercel are now set up for continuous deployment:**

Every time you push to `main` branch:
```powershell
git add .
git commit -m "Description of changes"
git push
```

✅ Railway automatically:
- Pulls latest code
- Reinstalls dependencies
- Runs migrations
- Restarts your app

✅ Vercel automatically:
- Pulls latest code  
- Rebuilds frontend
- Deploys new version

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError" on Railway
**Solution:** Check `requirements.txt` is up to date
```powershell
cd c:\Users\HomePC\smartlearn-analytics\backend
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements"
git push
```

### Issue: CORS errors in frontend
**Solution:** Update CORS_ALLOWED_ORIGINS in Railway variables
1. Go to Railway dashboard → Variables
2. Update: `CORS_ALLOWED_ORIGINS=https://your-vercel-url.vercel.app`
3. Redeploy: Railway will restart automatically

### Issue: "No such table" error
**Solution:** Database migration didn't run
1. Go to Railway Logs tab
2. Check for migration errors
3. Manually run: `railway run python manage.py migrate`

### Issue: Frontend shows "Cannot find module"
**Solution:** Root Directory might be wrong in Vercel
1. Vercel → Project Settings
2. Root Directory should be: `Frontend`
3. Redeploy from Deployments tab

### Issue: Static files not loading (admin page broken)
**Solution:** Run collectstatic on Railway
```
railway run python manage.py collectstatic --noinput
```

---

## 📊 Monitor Your Deployment

### Railway Dashboard
- **Logs:** See real-time server output
- **Deployments:** View deployment history
- **Metrics:** CPU, memory, bandwidth usage
- **Variables:** Update environment variables

### Vercel Dashboard
- **Deployments:** See build and deployment history
- **Analytics:** Monitor page load performance
- **Functions:** View any serverless functions (if used)

---

## 💰 Cost (Always Free Tier)

- **Railway:** 
  - 500 compute hours/month (enough for ~continuous running)
  - Free PostgreSQL database with 5GB storage
  - 1GB bandwidth/month free
  
- **Vercel:**
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS and CDN

- **GitHub:**
  - Free for public and private repos

**Total monthly cost: $0**

---

## 🎉 Success!

Your app is now live! Share your Vercel URL with others:

```
https://smartlearn-analytics.vercel.app
```

**Features available:**
- ✅ Student login and authentication
- ✅ Assignment submission with topics
- ✅ Weak topics detection from assignments (< 60% performance)
- ✅ Student insights dashboard
- ✅ Admin panel for data management

**Next steps:**
1. Test thoroughly on different devices
2. Add real student data
3. Monitor Railway/Vercel dashboards for any issues
4. Make code changes, push to GitHub, and auto-deploy!

---

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Vercel Documentation](https://vercel.com/docs)
- [Django Deployment Guide](https://docs.djangoproject.com/en/stable/howto/deployment/)
- [React + Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
