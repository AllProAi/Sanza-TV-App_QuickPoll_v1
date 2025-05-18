# StreamVibe TV App - Deployment Guide

This document outlines the deployment process for the StreamVibe TV App on Vercel.

## Prerequisites

Before deploying the application, ensure you have:

1. A Vercel account
2. The Vercel CLI installed (`npm install -g vercel`)
3. Required environment variables (see [Environment Variables](#environment-variables) section)
4. Node.js version 16+ and pnpm installed

## Environment Variables

The following environment variables must be set in your Vercel project settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | API key for OpenAI services | Yes |
| `VITE_SENZA_API_KEY` | API key for Senza platform | Yes |
| `VITE_OPENAI_MODEL` | OpenAI model to use (default: gpt-4-turbo) | No |
| `VITE_API_BASE_URL` | Base URL for API requests | No |
| `VITE_ENABLE_AI_FEATURES` | Enable/disable AI features | No |
| `VITE_ENABLE_MOOD_RECOMMENDATIONS` | Enable/disable mood-based recommendations | No |
| `VITE_ENABLE_CONTENT_TAGGING` | Enable/disable content tagging | No |
| `VITE_ENABLE_PERSONALIZED_GREETINGS` | Enable/disable personalized greetings | No |
| `VITE_PREFETCH_CONTENT` | Enable/disable content prefetching | No |
| `VITE_CACHE_TTL` | Cache time-to-live in seconds | No |
| `VITE_OFFLINE_SUPPORT` | Enable/disable offline support | No |
| `VITE_ANALYTICS_ENABLED` | Enable/disable analytics | No |
| `VITE_ANALYTICS_ID` | Analytics ID | No |
| `VITE_DEBUG_MODE` | Enable/disable debug mode | No |
| `VITE_LOG_LEVEL` | Logging level | No |

## Deployment Steps

### Option 1: Using Vercel CLI

1. Navigate to the project directory:
   ```bash
   cd StreamVibe
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to production:
   ```bash
   pnpm run vercel-deploy
   ```

   Or for a preview deployment:
   ```bash
   pnpm run vercel-deploy:preview
   ```

### Option 2: Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Login to your Vercel account
3. Click "New Project"
4. Import your repository
5. Configure project settings:
   - Framework Preset: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
6. Configure environment variables
7. Deploy

## Post-Deployment Verification

After deploying, verify:

1. Application loads correctly
2. Navigation works properly
3. Content is displayed correctly
4. AI features function as expected
5. No console errors
6. Performance is acceptable

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check build logs for errors
   - Verify all required environment variables are set
   - Ensure dependencies are installed correctly

2. **Blank Screen After Deployment**
   - Check for JavaScript errors in the console
   - Verify routes are configured correctly
   - Check if API keys are valid

3. **AI Features Not Working**
   - Verify OpenAI API key is correct
   - Check API rate limits
   - Review feature flags

## Monitoring

Monitor your deployment using:

1. Vercel Analytics dashboard
2. Application logs
3. Custom analytics (if enabled)

## Performance Optimization

The following optimizations are applied to the production build:

1. Code splitting for vendor packages
2. Tree shaking
3. Asset minification
4. CSS optimization
5. Caching headers configuration

## Rollback Procedure

If issues are detected after deployment:

1. In Vercel dashboard, navigate to your project
2. Go to "Deployments" tab
3. Find the previous working deployment
4. Click "..." and select "Promote to Production" 