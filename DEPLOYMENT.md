# 🚀 Deploy to Vercel

## Quick Deploy (Recommended)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Repository**:
   - Click "Add New..."
   - Select "Project"
   - Import Git Repository: `https://github.com/mixifys33/vettcodecli`

3. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Environment Variables** (Optional):
   - Add any environment variables if needed
   - None required for basic deployment

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your site will be live at: `https://vettcodecli.vercel.app`

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Automatic Deployments

Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every pull request

## 📊 Reports Integration

To display uploaded CLI reports:

1. Reports from `vettcode scan --upload` should be in:
   - `../Vettcode-engine-cli/docs/reports/`

2. Copy reports to this project:

   ```bash
   cp -r ../Vettcode-engine-cli/docs/reports ./public/
   ```

3. Commit and push:

   ```bash
   git add public/reports
   git commit -m "Add reports"
   git push
   ```

4. Vercel will auto-deploy and reports will be accessible

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_SITE_URL`: Your site URL (e.g., https://vettcodecli.vercel.app)
- `NEXT_PUBLIC_GITHUB_REPO`: GitHub repo URL

## Troubleshooting

**Build fails?**

- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Run `npm install && npm run build` locally first

**Site not updating?**

- Check Vercel deployments dashboard
- Ensure push went to correct branch
- Redeploy from Vercel dashboard if needed

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎉 That's it!

Your VettCode CLI landing page should now be live at:
**https://vettcodecli.vercel.app**

Visit the URL to see your beautiful landing page! 🚀
