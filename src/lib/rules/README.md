# Cricket Rule Engine

Rule-based event detection system for cricket using ball trajectory and bounding box analysis.

## Features

- ✅ **Scoring Detection**: 4 runs, 6 runs
- ✅ **Dismissal Detection**: Caught, Bowled, LBW
- ✅ **Trajectory Tracking**: 30-frame history
- ✅ **Zone-Based Detection**: Boundary, ground line
- ✅ **Event Debouncing**: 3-second cooldown
- ✅ **Cricket Data Layer Integration**: Automatic event logging

## Quick Start

### Basic Usage

```typescript
import { RuleEngine } from '@/lib/rules';
import { DetectionEngine } from '@/lib/detection';

const detector = new DetectionEngine();
const ruleEngine = new RuleEngine();

await detector.initialize();

const detect = async () => {
  const frame = camera.getFrame();
  const detections = await detector.detectAll(frame);
  
  // Process through rule engine
  const event = ruleEngine.processDetections(detections);
  
  if (event) {
    console.log('Event detected:', event);
    // { type: 'SCORING', runs: 6, boundaryType: 'SIX', ... }
  }
};
```

### With Cricket Data Layer

```typescript
import { RuleEngine } from '@/lib/rules';
import { logEventToDataLayer } from '@/lib/rules/integration';

const ruleEngine = new RuleEngine();

const detect = async () => {
  const detections = await detector.detectAll(frame);
  const event = ruleEngine.processDetections(detections);
  
  if (event) {
    // Automatically log to Cricket Data Layer
    await logEventToDataLayer(
      event,
      matchId,
      batsmanId,
      bowlerId
    );
    
    // Show toast notification
    if (event.type === 'SCORING') {
      toast.success(`${event.runs} runs!`);
    } else {
      toast.error(`Wicket! ${event.dismissalType}`);
    }
  }
};
```

## API Reference

### `RuleEngine`

#### Constructor

```typescript
new RuleEngine(config?: RuleEngineConfig)
```

**Config Options:**
- `frameWidth` - Frame width (default: 1280)
- `frameHeight` - Frame height (default: 720)
- `boundaryTopPercent` - Boundary zone top (default: 0.2)
- `groundLinePercent` - Ground line (default: 0.7)
- `catchDistance` - Catch detection distance (default: 100px)
- `cooldownMs` - Event cooldown (default: 3000ms)

#### Methods

**`processDetections(detections: AllDetections): CricketEvent | null`**

Process AI detections and return cricket event if detected.

**`getTrajectory(): BallPosition[]`**

Get current ball trajectory history.

**`clearTrajectory(): void`**

Clear trajectory history.

**`getLastEvent(): CricketEvent | null`**

Get last detected event.

## Event Types

### ScoringEvent

```typescript
{
  type: 'SCORING',
  runs: 4 | 6,
  boundaryType: 'FOUR' | 'SIX',
  timestamp: number,
  confidence: number
}
```

### DismissalEvent

```typescript
{
  type: 'DISMISSAL',
  dismissalType: 'CAUGHT' | 'BOWLED' | 'LBW' | 'RUN_OUT' | 'STUMPED',
  fielderIds?: string[],
  timestamp: number,
  confidence: number
}
```

## Detection Rules

### 4 Runs

**Rule:** Ball touches ground, then crosses boundary

**Logic:**
1. Track ball trajectory
2. Detect ground contact (Y > 70% of frame)
3. Detect boundary crossing (Y < 20% or X at edges)
4. Require both conditions

### 6 Runs

**Rule:** Ball crosses boundary without touching ground

**Logic:**
1. Track ball trajectory
2. Detect boundary crossing
3. Ensure no ground contact before boundary

### Caught Out

**Rule:** Fielder intercepts ball before ground contact

**Logic:**
1. Detect ball-fielder proximity (< 100px)
2. Ensure ball hasn't touched ground
3. Trigger when both conditions met

### Bowled

**Rule:** Ball hits stumps

**Logic:**
1. Detect ball-stumps collision
2. Check bounding box intersection
3. Trigger on contact

### LBW (Leg Before Wicket)

**Rule:** Ball hits batsman's pad and projected path would hit stumps

**Logic:**
1. Detect ball-batsman contact (< 80px)
2. Project ball trajectory forward
3. Check if projection intersects stumps
4. Trigger if both conditions met

## Zone Definitions

```typescript
// Default zones (1280x720 frame)
const zones = {
  boundaryTop: 144,      // Top 20%
  groundLine: 504,       // Bottom 30%
  boundaryLeft: 128,     // Left 10%
  boundaryRight: 1152,   // Right 10%
};
```

## Trajectory Tracking

- **History Size**: 30 frames (1 second at 30 FPS)
- **Data Stored**: x, y, timestamp, touchedGround
- **Auto-Clear**: After event detection

## Debouncing

- **Cooldown**: 3 seconds between events
- **Purpose**: Prevent duplicate detections
- **Reset**: After cooldown expires

## Integration Example

### Complete Workflow

```typescript
import { CameraModule } from '@/lib/camera';
import { DetectionEngine } from '@/lib/detection';
import { RuleEngine } from '@/lib/rules';
import { logEventToDataLayer } from '@/lib/rules/integration';

const camera = new CameraModule();
const detector = new DetectionEngine();
const ruleEngine = new RuleEngine();

// Initialize
await camera.startCamera();
await detector.initialize();

// Detection loop
const detect = async () => {
  // 1. Get frame
  const frame = camera.getFrame();
  
  if (frame) {
    // 2. Run AI detection
    const detections = await detector.detectAll(frame);
    
    // 3. Process through rule engine
    const event = ruleEngine.processDetections(detections);
    
    // 4. Log to Cricket Data Layer
    if (event) {
      await logEventToDataLayer(event, matchId, batsmanId, bowlerId);
      
      // 5. Update UI
      if (event.type === 'SCORING') {
        console.log(`${event.runs} runs scored!`);
      } else {
        console.log(`Wicket! ${event.dismissalType}`);
      }
    }
  }
  
  requestAnimationFrame(detect);
};

detect();
```

## Performance

- **Processing Time**: ~1-5ms per frame
- **Memory**: ~1KB for trajectory history
- **Debouncing**: Prevents excessive event logging

## Limitations

- **Stumps Detection**: Requires custom model (placeholder)
- **Run Out**: Not implemented (requires crease detection)
- **LBW Accuracy**: Lower confidence (0.65) due to complexity
- **Trajectory Projection**: Simple linear projection

## Future Enhancements

1. **Advanced Trajectory**
   - Parabolic trajectory modeling
   - Ball speed calculation
   - Spin/swing detection

2. **More Dismissals**
   - Stumped (wicket keeper)
   - Hit wicket
   - Run out (with crease detection)

3. **Shot Recognition**
   - Identify shot types
   - Analyze batting technique
   - Predict shot outcome

## License

Part of the PlayPal project.
