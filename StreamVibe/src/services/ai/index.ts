/**
 * AI services index file
 * Exports all AI-related services for easier imports
 */

import ContentTagger from './ContentTagger';
import PersonalizedGreeting from './PersonalizedGreeting';
import DescriptionGenerator from './DescriptionGenerator';
import MoodRecommender, { MOOD_CATEGORIES } from './MoodRecommender';

export {
  ContentTagger,
  PersonalizedGreeting,
  DescriptionGenerator,
  MoodRecommender,
  MOOD_CATEGORIES
};

// Also export types
export type { 
  ContentTag, 
  TaggingResponse 
} from './ContentTagger';

export type { 
  GreetingOptions, 
  GreetingResult 
} from './PersonalizedGreeting';

export type { 
  DescriptionOptions, 
  GeneratedDescription 
} from './DescriptionGenerator';

export type { 
  MoodCategory, 
  MoodRecommendation, 
  MoodHistory 
} from './MoodRecommender'; 