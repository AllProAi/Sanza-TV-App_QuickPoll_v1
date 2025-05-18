# StreamVibe: AI-Powered Interactive TV Experience

![StreamVibe Banner](docs/images/banner.png)

A next-generation TV application built for the Senza platform hackathon that leverages AI to provide personalized content recommendations and interactive streaming experiences.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Project Overview

StreamVibe revolutionizes how users discover and engage with video content on their TVs through:

- **AI-Powered Recommendations**: Personalized content discovery based on viewing habits
- **Interactive Video Experiences**: In-video polls, quizzes, and information cards
- **Remote-Friendly Navigation**: Intuitive navigation designed specifically for TV remote controls
- **Visual Appeal**: Fluid animations and dynamic backgrounds optimized for the big screen

## 🎯 Hackathon Focus

For the Synamedia Senza Hackathon, we're focusing on:

1. Creating a visually stunning TV interface at 1920x1080 resolution
2. Implementing intuitive remote control navigation (arrow keys, enter, escape)
3. Demonstrating AI-powered content recommendations
4. Building interactive elements during video playback

## 🛠️ Technology Stack

- **Frontend**: React.js
- **State Management**: React Context API
- **Styling**: CSS Modules
- **Build System**: Webpack
- **Platform SDK**: Senza SDK
- **AI Integration**: OpenAI API

## 📂 Project Structure

```
streamvibe/
├── docs/               # Documentation files
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Main application screens
│   ├── services/       # API and external services
│   ├── styles/         # Global styles and themes
│   ├── utils/          # Utility functions
│   ├── App.js          # Main application component
│   └── index.js        # Application entry point
├── tasks/              # Task definitions for development
├── .env.example        # Example environment variables
├── package.json        # Dependencies and scripts
└── webpack.config.js   # Build configuration
```

## 🧩 Key Features

### Content Discovery
- Browse content by category, genre, mood
- AI-powered recommendations
- "Surprise Me" feature for unexpected content

### Video Playback
- Full integration with Senza remotePlayer
- Interactive elements during playback
- Smooth transitions between browsing and playback

### Remote Navigation
- Intuitive directional controls
- Visual focus indicators
- Shortcut keys for quick access

## 📱 Remote Control Navigation

The application is fully navigable using the following remote controls:
- **Arrow Keys** (←, →, ↑, ↓): Navigate between elements
- **Enter**: Select the focused item
- **Escape/Back**: Return to previous screen
- **Playback Controls**: Play, pause, seek during video playback

## 🚀 Deployment

The application is deployed on Vercel and can be accessed at:
[streamvibe-demo.vercel.app](https://streamvibe-demo.vercel.app)

## 📝 Documentation

- [Product Requirements Document (PRD)](docs/PRD.md)
- [Architecture Design Document (ADD)](docs/ADD.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Task List](TASK-LIST.md)

## 🔧 Recent TypeScript Fixes

The following TypeScript errors have been resolved:

### TYPE-FIX-002: Context API and Hook Related Errors
- Fixed issues with `useNavigation`, `useAnimation`, and `usePlayerContext` hooks
- Corrected exports in context files to ensure proper type safety
- Eliminated circular dependencies in context imports

### TYPE-FIX-004: Enum Syntax Errors
- Converted enum syntax to use const objects with 'as const' assertion
- Fixed syntax errors related to 'erasableSyntaxOnly' in TypeScript configuration
- Updated type definitions for animations, sounds, and event types

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## 📋 Task Management

Development tasks are organized in the [TASK-LIST.md](TASK-LIST.md) file and individual task descriptions can be found in the `tasks/` directory.

## 👥 Contributors

- Team StreamVibe

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 