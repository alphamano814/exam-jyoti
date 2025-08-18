# GitHub Pages Deployment Guide

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

## Setup Steps

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy your app when you push to the main branch

### 2. Repository Settings

Make sure your repository name matches the base path in `vite.config.ts`. Currently set to:
- Repository name should be: `exam-jyoti`
- Or update the base path in `vite.config.ts` to match your repository name

### 3. Environment Variables (if using Supabase)

If your app uses Supabase or other environment variables:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following secrets:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - Any other environment variables your app needs

### 4. Domain Configuration

Your app will be available at:
- `https://yourusername.github.io/exam-jyoti/`

Or if using a custom domain:
1. Go to **Settings** → **Pages**
2. Add your custom domain
3. Update the base path in `vite.config.ts` if needed

## How It Works

- **Routing**: Uses React Router with proper basename configuration
- **404 Handling**: Includes `404.html` for client-side routing support
- **Build**: Vite builds the app with the correct base path
- **Deploy**: GitHub Actions automatically builds and deploys on every push

## Troubleshooting

### White Page Issues
- Check browser console for errors
- Ensure the base path in `vite.config.ts` matches your repository name
- Verify GitHub Pages is enabled and source is set to "GitHub Actions"

### Routing Issues
- The app includes SPA routing support for GitHub Pages
- All routes should work properly after deployment

### Build Failures
- Check the Actions tab for build logs
- Ensure all dependencies are properly listed in package.json
- Verify environment variables are set if needed

## Manual Deployment

If you prefer manual deployment:

```bash
npm run build
# Then upload the `dist` folder contents to your web server
```

The app is now properly configured for GitHub Pages deployment!