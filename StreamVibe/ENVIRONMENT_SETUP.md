# Environment Setup for StreamVibe TV App

This document explains how to set up environment variables for both development and production environments.

## Development Environment

1. Create a `.env.local` file in the StreamVibe root directory
2. Add the following environment variables:

```
# Development environment variables

# API Keys (using fake keys for development)
VITE_OPENAI_API_KEY=sk-development-fake-key
VITE_SENZA_API_KEY=senza-development-fake-key

# Feature flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_MOOD_RECOMMENDATIONS=true
VITE_ENABLE_CONTENT_TAGGING=true
VITE_ENABLE_PERSONALIZED_GREETINGS=true

# Development settings
VITE_PREFETCH_CONTENT=true
VITE_CACHE_TTL=3600
VITE_OFFLINE_SUPPORT=true
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# Optional settings
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_ID=
```

3. For full functionality, replace the fake API keys with real keys if available

## Production Environment

For production deployments, ensure the following variables are set:

1. **Required Variables**:
   - `VITE_OPENAI_API_KEY`: Valid OpenAI API key
   - `VITE_SENZA_API_KEY`: Valid Senza Platform API key

2. **Optional Variables with Defaults**:
   - See the development variables above for optional variables

## Handling Missing Variables

- In development mode, missing variables will use default mock values
- Warnings will be displayed in the console but the app will continue to function
- In production, missing required variables will cause an error

## Troubleshooting Console Warnings

If you see warnings about missing environment variables in development:

1. Create the `.env.local` file as described above
2. Restart the development server
3. If warnings persist, check that the file format is correct

The application includes fallbacks for development, so most features will work with mock data even without real API keys. 