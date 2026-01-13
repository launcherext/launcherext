# Railway Backend Deployment Guide

## Quick Deploy via Dashboard

Your Railway project: https://railway.com/project/aa0e6a6d-3dd9-4382-a574-acb5180a1ae5

### Steps:

1. **Open Railway Dashboard**
   - Visit the link above
   - You're already logged in

2. **Create Backend Service**
   - Click "+ New" button
   - Select "Empty Service"
   - Name it: "backend" or "quickbanner"

3. **Deploy from Local Directory**
   
   Option A - Connect GitHub:
   - Push quickbanner to GitHub
   - Connect repo in Railway
   - Auto-deploy on push

   Option B - Manual Deploy via CLI:
   ```bash
   cd C:\Users\offic\Desktop\quickbanner
   railway link
   railway service backend
   railway up
   ```

4. **Environment Variables**
   
   Add these in Railway Dashboard → Service → Variables:
   
   ```
   # Required
   JWT_SECRET=launch-ext-secret-2026-change-me
   PUMPPORTAL_API_KEY=your-pumpportal-key
   
   # Database (auto-set by Railway Postgres)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   POSTGRES_PRISMA_URL=${{Postgres.PRISMA_URL}}
   POSTGRES_URL_NON_POOLING=${{Postgres.URL_NON_POOLING}}
   
   # Optional
   NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   AI_PROVIDER_KEY=your-ai-key-if-needed
   NODE_ENV=production
   ```

5. **Run Database Migrations**
   
   After first deployment:
   ```bash
   railway run npx prisma migrate deploy
   ```

6. **Generate Domain**
   
   ```bash
   cd C:\Users\offic\Desktop\quickbanner
   railway domain
   ```
   
   This will give you a public URL like:
   `https://quickbanner-production.up.railway.app`

7. **Update Extension**
   
   Update the backend URL in your extension:
   - Edit `launch-ext/extension/lib/api-client.ts`
   - Change `DEFAULT_BACKEND_URL` to your Railway domain
   - Rebuild: `npm run build`

## Monitoring

- **Logs:** `railway logs`
- **Status:** `railway status`
- **Deployments:** https://railway.com/project/aa0e6a6d-3dd9-4382-a574-acb5180a1ae5/deployments

## Troubleshooting

**Build fails:**
- Check logs in Railway dashboard
- Verify package.json has correct scripts
- Ensure all dependencies are listed

**Database connection fails:**
- Verify Postgres service is running
- Check DATABASE_URL is set
- Run migrations: `railway run npx prisma migrate deploy`

**Extension can't connect:**
- Verify domain is generated
- Check CORS settings in backend
- Update extension backend URL
- Rebuild extension

## Cost

Railway free tier includes:
- 500 hours/month of service time
- Shared CPU and memory
- Automatic HTTPS
- Free Postgres (500MB)

Upgrade to Hobby ($5/month) for:
- Higher resource limits
- Priority support
- More database storage
