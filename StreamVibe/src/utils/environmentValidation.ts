/**
 * Environment variable validation utility for StreamVibe TV App
 */

export type EnvVariable = {
  key: string;
  required: boolean;
  defaultValue?: string;
  validator?: (value: string) => boolean;
};

const ENV_VARIABLES: EnvVariable[] = [
  { key: 'VITE_OPENAI_API_KEY', required: true },
  { key: 'VITE_SENZA_API_KEY', required: true },
  { key: 'VITE_OPENAI_MODEL', required: false, defaultValue: 'gpt-4-turbo' },
  { key: 'VITE_API_BASE_URL', required: false, defaultValue: 'https://api.streamvibe.example.com' },
  { key: 'VITE_ENABLE_AI_FEATURES', required: false, defaultValue: 'true' },
  { key: 'VITE_ENABLE_MOOD_RECOMMENDATIONS', required: false, defaultValue: 'true' },
  { key: 'VITE_ENABLE_CONTENT_TAGGING', required: false, defaultValue: 'true' },
  { key: 'VITE_ENABLE_PERSONALIZED_GREETINGS', required: false, defaultValue: 'true' },
  { key: 'VITE_PREFETCH_CONTENT', required: false, defaultValue: 'true' },
  { key: 'VITE_CACHE_TTL', required: false, defaultValue: '3600' },
  { key: 'VITE_OFFLINE_SUPPORT', required: false, defaultValue: 'true' },
  { key: 'VITE_ANALYTICS_ENABLED', required: false, defaultValue: 'false' },
  { key: 'VITE_ANALYTICS_ID', required: false, defaultValue: '' },
  { key: 'VITE_DEBUG_MODE', required: false, defaultValue: 'false' },
  { key: 'VITE_LOG_LEVEL', required: false, defaultValue: 'error' },
];

/**
 * Validates all environment variables and provides defaults
 * @returns Object with validation results and missing required variables
 */
export const validateEnvironment = (): { 
  isValid: boolean; 
  missingVariables: string[];
} => {
  const missingVariables: string[] = [];

  // Check each variable
  ENV_VARIABLES.forEach((envVar) => {
    const value = import.meta.env[envVar.key];
    
    if (envVar.required && (!value || value === '')) {
      missingVariables.push(envVar.key);
    }
    
    // Apply validator if provided
    if (value && envVar.validator && !envVar.validator(value)) {
      console.warn(`Environment variable ${envVar.key} failed validation`);
    }
  });

  return {
    isValid: missingVariables.length === 0,
    missingVariables,
  };
};

/**
 * Gets an environment variable with fallback to default
 * @param key Environment variable key
 * @returns The value or default value
 */
export const getEnvVariable = (key: string): string => {
  const envVar = ENV_VARIABLES.find((variable) => variable.key === key);
  const value = import.meta.env[key];

  if (!value && envVar?.defaultValue) {
    return envVar.defaultValue;
  }

  return value || '';
};

/**
 * Initialize environment validation on app start
 */
export const initEnvironment = (): void => {
  const { isValid, missingVariables } = validateEnvironment();

  if (!isValid) {
    console.error(
      'Missing required environment variables:',
      missingVariables.join(', ')
    );
    
    if (import.meta.env.PROD) {
      // Only show warnings in production, allow development to continue
      console.warn('Application may not function correctly without required environment variables');
    }
  }
};

export default {
  validateEnvironment,
  getEnvVariable,
  initEnvironment,
}; 