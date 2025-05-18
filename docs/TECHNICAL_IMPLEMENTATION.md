# QuickPoll Technical Implementation Guide

This document provides detailed technical information for developers implementing the QuickPoll feature in the StreamVibe application for the Senza TV platform.

## System Architecture

QuickPoll is built on a microservices architecture with the following components:

![Technical Architecture Diagram](images/quickpoll_architecture.png)

### Core Components

#### 1. Client-Side Components

The client-side implementation consists of:

- **InteractiveService**: Core service that manages all interactive elements
- **PollOverlay**: React component that renders polls during playback
- **useInteractiveVideo**: React hook for integrating polls into video content
- **Navigation Handlers**: Focus management for remote control navigation

#### 2. Server-Side Components

The server-side implementation consists of:

- **Poll Management API**: CRUD operations for poll creation and management
- **Analytics Processing Engine**: Real-time aggregation of poll responses
- **Content Synchronization Service**: Matching polls to content timestamps
- **User Segmentation Service**: Audience targeting capabilities

#### 3. Data Flow

```
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│                 │        │                 │        │                 │
│ Content Provider│        │  Senza Backend  │        │  Client Device  │
│    Dashboard    │        │    Services     │        │   (TV App)      │
│                 │        │                 │        │                 │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ 1. Poll Created │        │ 2. Poll Stored  │        │ 3. Poll Fetched │
│    & Scheduled  │───────►│    & Processed  │───────►│    at Startup   │
└─────────────────┘        └─────────────────┘        └────────┬────────┘
                                                                │
                                                                │
         ┌───────────────────────────────────────────────────┐  │
         │                                                   │  │
         │  ┌─────────────┐        ┌─────────────┐          │  │
         │  │             │        │             │          │  │
         │  │  7. Results │        │  6. Vote    │          │  │
         │  │   Displayed │◄───────┤   Processed │◄────┐    │  │
         │  │             │        │             │     │    │  │
         │  └─────────────┘        └─────────────┘     │    │  │
         │                                              │    │  │
         └──────────────────────────────────────────────┼────┘  │
                                                        │       │
                                                        │       │
                                                 ┌──────┴───────┼──┐
                                                 │              │  │
                                                 │ 5. User Votes│  │
                                                 │              │  │
                                                 └──────────────┘  │
                                                                   │
                                                 ┌─────────────────┼──┐
                                                 │                 │  │
                                                 │ 4. Poll Displayed  │
                                                 │    at Timestamp │  │
                                                 │                 │  │
                                                 └─────────────────┘  │
                                                                      │
                                                      Event Loop ─────┘
```

## Implementation Details

### Client Implementation

#### InteractiveService

The `InteractiveService` is the core service responsible for managing interactive elements during video playback:

```typescript
class InteractiveService {
  private static instance: InteractiveService;
  private listeners: Map<InteractiveEventType, EventListener[]>;
  private polls: Map<string, PollData>;
  private userVotes: Map<string, string>;
  private activeInteractiveElements: {
    poll: PollData | null;
    // other interactive elements...
  };
  private playbackService: PlaybackService;
  private checkInterval: number | null;

  // Singleton getter
  public static getInstance(): InteractiveService {
    if (!InteractiveService.instance) {
      InteractiveService.instance = new InteractiveService();
    }
    return InteractiveService.instance;
  }

  // Initialize service
  public initialize(contentId: string): void {
    // Load polls for this content
    this.loadPolls(contentId);
    
    // Start checking for interactive elements based on playback position
    this.startInteractiveCheck();
  }

  // Submit a vote for a poll
  public submitPollVote(pollId: string, optionId: string): void {
    const poll = this.polls.get(pollId);
    if (!poll) return;
    
    // Don't allow voting twice
    if (this.userVotes.has(pollId)) return;
    
    // Update results
    if (!poll.results) {
      poll.results = {};
    }
    
    poll.results[optionId] = (poll.results[optionId] || 0) + 1;
    this.userVotes.set(pollId, optionId);
    
    // Emit events
    this.emit('poll-voted', { pollId, optionId });
    this.emit('poll-results', poll);
  }

  // Additional methods for event handling, polling checks, etc.
}
```

#### PollOverlay Component

The `PollOverlay` component renders polls during playback:

```typescript
interface PollOverlayProps {
  poll: PollData;
  visible: boolean;
  onClose: () => void;
  onVote: (pollId: string, optionId: string) => void;
  userVote?: string;
  groupId?: string;
}

const PollOverlay: React.FC<PollOverlayProps> = ({
  poll,
  visible,
  onClose,
  onVote,
  userVote,
  groupId = 'poll-overlay'
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(userVote || null);
  const [showResults, setShowResults] = useState<boolean>(!!userVote);
  
  // Calculate percentages for results
  const calculatePercentage = (optionId: string): number => {
    if (!poll.results || !showResults) return 0;
    
    // Calculate total votes
    const totalVotes = Object.values(poll.results).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    
    // Calculate percentage for this option
    const optionVotes = poll.results[optionId] || 0;
    return Math.round((optionVotes / totalVotes) * 100);
  };
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    if (!userVote) {
      setSelectedOption(optionId);
      // Submit vote
      onVote(poll.id, optionId);
      setShowResults(true);
    }
  };
  
  // Render component...
};
```

#### useInteractiveVideo Hook

The `useInteractiveVideo` hook connects video playback with interactive elements:

```typescript
const useInteractiveVideo = (contentId: string) => {
  const [activePoll, setActivePoll] = useState<PollData | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  
  const interactiveService = useMemo(() => InteractiveService.getInstance(), []);
  
  // Initialize interactive service
  useEffect(() => {
    interactiveService.initialize(contentId);
    
    // Set up event listeners
    interactiveService.on('poll-show', setActivePoll);
    interactiveService.on('poll-hide', () => setActivePoll(null));
    
    // Load any existing user votes
    const storedVotes = interactiveService.getUserVotes();
    if (storedVotes) {
      setUserVotes(storedVotes);
    }
    
    return () => {
      interactiveService.cleanup();
    };
  }, [contentId, interactiveService]);
  
  // Handle poll vote
  const handlePollVote = useCallback((pollId: string, optionId: string) => {
    interactiveService.submitPollVote(pollId, optionId);
    setUserVotes(prev => ({
      ...prev,
      [pollId]: optionId
    }));
  }, [interactiveService]);
  
  // Return data and handlers
  return {
    activePoll,
    userVotes,
    handlePollVote,
    hideActivePoll: useCallback(() => {
      if (activePoll) {
        interactiveService.off('poll-hide', () => setActivePoll(null));
        setActivePoll(null);
      }
    }, [activePoll, interactiveService])
  };
};
```

### Server API Implementation

The server API provides several endpoints for poll management and analytics:

#### Poll Management Endpoints

```
POST /api/polls
GET /api/polls
GET /api/polls/:id
PUT /api/polls/:id
DELETE /api/polls/:id
```

#### Poll Analytics Endpoints

```
GET /api/polls/:id/results
GET /api/polls/:id/results/live
GET /api/polls/:id/analytics
GET /api/analytics/content/:contentId
GET /api/analytics/dashboard
```

#### API Schema Examples

**Poll Creation Request:**

```json
{
  "contentId": "movie123",
  "question": "Who do you think is the villain?",
  "options": [
    {
      "id": "option1",
      "text": "Character A"
    },
    {
      "id": "option2",
      "text": "Character B"
    },
    {
      "id": "option3",
      "text": "Character C"
    }
  ],
  "timeToShow": 1200,
  "duration": 30,
  "styling": {
    "theme": "dark",
    "position": "bottom-right"
  },
  "targeting": {
    "regions": ["US", "EU"],
    "devices": ["tv", "mobile"],
    "ageGroups": ["18-24", "25-34"]
  }
}
```

**Poll Results Response:**

```json
{
  "id": "poll123",
  "contentId": "movie123",
  "totalVotes": 15420,
  "results": {
    "option1": 5840,
    "option2": 3221,
    "option3": 6359
  },
  "demographics": {
    "regions": {
      "US": {
        "option1": 3245,
        "option2": 1876,
        "option3": 4212
      },
      "EU": {
        "option1": 2595,
        "option2": 1345,
        "option3": 2147
      }
    },
    "devices": {
      "tv": {
        "option1": 4876,
        "option2": 2654,
        "option3": 5321
      },
      "mobile": {
        "option1": 964,
        "option2": 567,
        "option3": 1038
      }
    }
  },
  "engagementRate": 0.78,
  "completionTime": {
    "average": 3.4,
    "min": 1.2,
    "max": 18.6
  }
}
```

## Data Models

### PollData

```typescript
interface PollData {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId?: string; // For quiz questions
  timeToShow: number; // Time in seconds when the poll should appear
  duration: number; // How long the poll should be displayed for (in seconds)
  results?: Record<string, number>; // Option ID to vote count
}
```

### AnalyticsData

```typescript
type AnalyticsData = Record<string, string | number | boolean | null | undefined>;
```

### PollVoteData

```typescript
type PollVoteData = { 
  pollId: string; 
  optionId: string;
  timestamp: number;
  viewerId: string;
  contentPosition: number;
};
```

## Performance Considerations

### Client-Side Optimization

1. **Local Caching**
   - Poll data is cached locally to reduce network requests
   - Results are updated via WebSocket for real-time displays
   - Offline mode gracefully handles connection issues

2. **Render Optimization**
   - Poll components use React.memo to prevent unnecessary re-renders
   - Animations are optimized for TV hardware capabilities
   - Transitions are debounced during heavy interaction periods

3. **Resource Management**
   - Polls are pre-loaded during content initialization
   - Assets are sized appropriately for TV display
   - Memory usage is monitored and managed to prevent leaks

### Server-Side Scaling

1. **Real-Time Processing**
   - Event-driven architecture using message queues
   - Sharded database for high-volume vote storage
   - In-memory caching layer for frequent analytics queries

2. **Load Distribution**
   - Geographic distribution based on content delivery networks
   - Auto-scaling based on concurrent viewer metrics
   - Rate limiting for API access

3. **Redundancy**
   - Multiple availability zones for high availability
   - Data replication across regions
   - Graceful degradation during partial outages

## Testing Strategy

### Client Testing

1. **Unit Tests**
   - Component testing with React Testing Library
   - Service logic testing with Jest
   - Navigation testing with simulated remote events

2. **Integration Tests**
   - End-to-end testing with Cypress
   - Focus management across different device types
   - Real-time updates across multiple clients

3. **Performance Tests**
   - Memory profiling during extended viewing sessions
   - Frame rate monitoring during poll animations
   - Load time measurements with various poll configurations

### Server Testing

1. **Load Testing**
   - Simulated vote bursts with up to 100,000 concurrent users
   - Database performance under sustained high write loads
   - WebSocket connection stability tests

2. **Security Testing**
   - Input validation and sanitization
   - Rate limiting effectiveness
   - Authentication and authorization tests

3. **Integration Testing**
   - End-to-end API workflow testing
   - Cross-service communication testing
   - Third-party integration testing

## Deployment Pipeline

### Client Deployment

1. **Build Process**
   - Transpile TypeScript to optimized JavaScript
   - Bundle optimization for TV platforms
   - Asset optimization for bandwidth constraints

2. **Distribution**
   - Channel-based deployment to Senza platform
   - Version management through Senza SDK
   - Staged rollout to different regions

3. **Monitoring**
   - Client-side error tracking
   - Usage analytics
   - Performance metrics collection

### Server Deployment

1. **Infrastructure as Code**
   - Terraform templates for environment provisioning
   - Kubernetes manifests for service orchestration
   - CI/CD pipelines for automated deployment

2. **Database Migration**
   - Schema migration management
   - Data transformation scripts
   - Backup and rollback procedures

3. **Monitoring and Alerting**
   - Prometheus metrics collection
   - Grafana dashboards for visualization
   - PagerDuty integration for critical alerts

## Security Considerations

1. **Data Privacy**
   - Anonymous aggregation of voting data
   - Compliance with regional data privacy regulations
   - Data retention policies and enforcement

2. **API Security**
   - JWT-based authentication
   - Rate limiting to prevent abuse
   - Input validation and sanitization

3. **Content Protection**
   - Poll data encrypted during transmission
   - Access controls for sensitive analytics
   - Audit logging for administrative actions

## Future Extensions

1. **Advanced Interactive Types**
   - Multi-step polls
   - Branching narrative based on audience votes
   - Mixed media polls with image/video options

2. **Enhanced Analytics**
   - Predictive modeling for audience behavior
   - Machine learning for engagement optimization
   - Cross-content analysis for trend identification

3. **Expanded Integration**
   - Social media sharing capabilities
   - Second-screen experiences
   - Merchandise and e-commerce tie-ins

---

## Document Version

Version: 1.0  
Last Updated: 2025-04-15  
Author: Senza Platform Team

---

© 2025 AllPro.Enterprises Novus | Nexum Labs. All rights reserved. 