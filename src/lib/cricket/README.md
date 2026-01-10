# Cricket Data Layer

A comprehensive, browser-based cricket data management system for PlayPal.

## Overview

The Cricket Data Layer provides a complete solution for storing and managing cricket match data entirely in the browser using IndexedDB and localStorage. It supports real-time match tracking, player statistics, ball-by-ball event logging, and historical data for AI training.

## Features

- ✅ **Browser-Only Storage** - No backend required
- ✅ **TypeScript-First** - Fully typed APIs
- ✅ **IndexedDB + localStorage** - Efficient data persistence
- ✅ **Real-Time Updates** - Live match tracking
- ✅ **Camera Integration** - Supports CV-detected events
- ✅ **Manual Overrides** - Full control over data
- ✅ **Statistics Engine** - Auto-calculated batting/bowling stats
- ✅ **Historical Records** - Complete event history for AI training

## Quick Start

### 1. Initialize

```typescript
import { CricketDataLayer } from '@/lib/cricket';

// Initialize once on app start
await CricketDataLayer.initialize();
```

### 2. Create Teams & Players

```typescript
const teamA = await CricketDataLayer.createTeam({ name: 'Team A' });
const teamB = await CricketDataLayer.createTeam({ name: 'Team B' });

const player = await CricketDataLayer.createPlayer({
  name: 'Virat Kohli',
  role: PlayerRole.BATSMAN,
  teamId: teamA.id,
});
```

### 3. Start a Match

```typescript
const match = await CricketDataLayer.createMatch({
  teamAId: teamA.id,
  teamBId: teamB.id,
  venue: {
    name: 'Elite Cricket Arena',
    pitchType: 'HARD',
    weather: 'SUNNY',
  },
});

await CricketDataLayer.startMatch(match.id);
```

### 4. Log Ball Events

```typescript
// From camera detection
await CricketDataLayer.logBallEvent({
  matchId: match.id,
  batsmanId: batsman.id,
  bowlerId: bowler.id,
  runs: 6,
  source: EventSource.CAMERA_DETECTION,
  metadata: { confidence: 0.95 },
});

// Manual input
await CricketDataLayer.logBallEvent({
  matchId: match.id,
  batsmanId: batsman.id,
  bowlerId: bowler.id,
  runs: 4,
  source: EventSource.MANUAL_INPUT,
});
```

### 5. Get Statistics

```typescript
// Update player stats
await CricketDataLayer.updatePlayerStats(playerId);

// Get player stats
const player = await CricketDataLayer.getPlayer(playerId);
console.log(player.battingStats); // { runs, balls, fours, sixes, strikeRate, ... }
console.log(player.bowlingStats); // { overs, wickets, economy, ... }
```

### 6. Finish Match

```typescript
await CricketDataLayer.finishMatch(match.id);

const summary = await CricketDataLayer.getMatchSummary(match.id);
console.log(summary.winner); // 'TEAM_A' | 'TEAM_B' | 'DRAW'
```

## API Reference

### Match Management

- `createMatch(data)` - Create a new match
- `getCurrentMatch()` - Get active match
- `startMatch(id)` - Start a match
- `finishMatch(id)` - Finish a match
- `getMatchSummary(id)` - Get match summary with winner

### Event Logging

- `logBallEvent(data)` - Log a ball event
- `updateBallEvent(id, data)` - Manual override
- `getMatchEvents(matchId)` - Get all events
- `getBoundaryEvents(matchId)` - Get 4s and 6s
- `getWicketEvents(matchId)` - Get wickets

### Player Management

- `createPlayer(data)` - Create a player
- `getPlayer(id)` - Get player details
- `updatePlayer(id, data)` - Update player
- `getAllPlayers()` - Get all players
- `searchPlayers(query)` - Search by name

### Team Management

- `createTeam(data)` - Create a team
- `getTeam(id)` - Get team details
- `addPlayerToTeam(teamId, playerId)` - Add player
- `getTeamPlayers(teamId)` - Get team roster

### Statistics

- `calculateBattingStats(playerId, matchId?)` - Calculate batting stats
- `calculateBowlingStats(playerId, matchId?)` - Calculate bowling stats
- `updatePlayerStats(playerId)` - Recalculate all stats
- `getPlayerHistory(playerId)` - Get all ball events

### Utilities

- `exportData()` - Export all data as JSON
- `getDBStats()` - Get database statistics
- `clearAllData()` - Clear all data (use with caution!)

## Architecture

```
src/lib/cricket/
├── types.ts                    # TypeScript type definitions
├── CricketDataLayer.ts         # Main API facade
├── index.ts                    # Public exports
├── examples.ts                 # Usage examples
├── storage/
│   ├── indexedDB.ts           # IndexedDB wrapper
│   ├── localStorage.ts        # localStorage utilities
│   └── index.ts
└── services/
    ├── PlayerService.ts       # Player CRUD
    ├── TeamService.ts         # Team CRUD
    ├── MatchService.ts        # Match lifecycle
    ├── BallEventService.ts    # Event logging
    ├── StatsService.ts        # Statistics calculation
    └── index.ts
```

## Data Schema

### IndexedDB Stores

**players**
- Key: `id`
- Indexes: `teamId`, `name`, `role`

**teams**
- Key: `id`
- Indexes: `name`

**matches**
- Key: `id`
- Indexes: `status`, `teamAId`, `teamBId`, `createdAt`

**ballEvents**
- Key: `id`
- Indexes: `matchId`, `batsmanId`, `bowlerId`, `timestamp`

## Integration Example

See `src/lib/cricket/examples.ts` for complete integration examples.

## Type Definitions

All entities are fully typed. Import types from:

```typescript
import type {
  Player,
  Team,
  Match,
  BallEvent,
  BattingStats,
  BowlingStats,
  MatchSummary,
  // ... and more
} from '@/lib/cricket';
```

## Performance

- **Indexed Queries** - Fast lookups by player, team, match
- **Batch Operations** - Efficient bulk inserts
- **Lazy Loading** - Stats calculated on demand
- **Caching** - Current match in localStorage

## Browser Support

Requires browsers with IndexedDB support:
- Chrome 24+
- Firefox 16+
- Safari 10+
- Edge 12+

## License

Part of the PlayPal project.
