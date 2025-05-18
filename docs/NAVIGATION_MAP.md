# StreamVibe and QuickPoll Navigation Map

This document provides a comprehensive list of all navigation endpoints in the StreamVibe application, including both page routes and API endpoints.

## Page Navigation Routes

| Route | Component | Description | Authentication |
|-------|-----------|-------------|----------------|
| `/` | HomePage | Main landing page | No |
| `/browse` | BrowsePage | Browse all content | No |
| `/browse/:category` | BrowsePage | Browse content by category | No |
| `/details/:id` | DetailPage | View content details | No |
| `/search` | SearchPage | Search for content | No |
| `/profile` | ProfilePage | User profile | Yes |
| `/settings` | SettingsPage | User settings | No |
| `/player/:contentId` | PlayerPage | Video player | No |

## Main Navigation Order

The main navigation menu displays items in the following order:
1. Home
2. Browse
3. Search
4. Profile
5. Settings

## QuickPoll API Endpoints

### Poll Management API

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/polls` | GET | List polls with filtering options | Yes |
| `/api/polls` | POST | Create a new poll | Yes |
| `/api/polls/:id` | GET | Get poll details | Yes |
| `/api/polls/:id` | PUT | Update poll | Yes |
| `/api/polls/:id` | DELETE | Delete poll | Yes |
| `/api/polls/:id/results` | GET | Get poll results | Yes |

### Client Interactive API

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/interactive/content/:contentId/polls` | GET | Get polls for specific content | No |
| `/api/interactive/polls/:id/vote` | POST | Submit a vote | No |
| `/api/interactive/user/:userId/votes` | GET | Get user's voting history | Yes |

### Analytics API

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/analytics/polls/:id` | GET | Get analytics for a specific poll | Yes |
| `/api/analytics/content/:contentId` | GET | Get analytics for specific content | Yes |
| `/api/analytics/dashboard` | GET | Get aggregated analytics for dashboard | Yes |
| `/api/analytics/export` | POST | Generate and download analytics report | Yes |

## Content API Endpoints

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/api/content` | GET | List all content | No |
| `/api/content/:id` | GET | Get content details | No |
| `/api/content/featured` | GET | Get featured content | No |
| `/api/content/categories` | GET | Get content categories | No |
| `/api/content/categories/:id` | GET | Get content in a category | No |
| `/api/content/search` | GET | Search for content | No |
| `/api/content/recommendations` | GET | Get personalized recommendations | Yes |

## Page-to-API Mapping

This section shows which API endpoints are used by each page:

### Home Page
- `/api/content/featured`
- `/api/content/recommendations`

### Browse Page
- `/api/content/categories`
- `/api/content/categories/:id`
- `/api/content`

### Detail Page
- `/api/content/:id`
- `/api/interactive/content/:contentId/polls` (for related polls)

### Player Page
- `/api/content/:id`
- `/api/interactive/content/:contentId/polls`
- `/api/interactive/polls/:id/vote`

### Search Page
- `/api/content/search`

### Profile Page
- `/api/interactive/user/:userId/votes`

## Navigation Implementation

The application uses React Router for client-side routing and implements a focus management system for TV remote control navigation. Each route can be accessed by:

1. Direct URL navigation
2. Navigation menu selection
3. Content card selection (for detail and player pages)
4. Remote control navigation (up/down/left/right + enter)

---

© 2025 Daniel Hill / AllPro.Enterprises Novus | Nexum Labs CR. All rights reserved. 