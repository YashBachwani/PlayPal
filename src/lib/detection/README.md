# AI Detection Module

Client-side AI detection for cricket objects using TensorFlow.js and MediaPipe.

## Features

- ✅ Ball detection (sports ball)
- ✅ Bat detection (baseball bat/racket)
- ✅ Player detection (person + pose)
- ✅ Stumps detection (placeholder)
- ✅ Boundary detection (placeholder)
- ✅ Bounding boxes + coordinates
- ✅ Confidence scores
- ✅ Client-side inference

## Quick Start

### Basic Usage

```typescript
import { DetectionEngine } from '@/lib/detection';

const detector = new DetectionEngine();

// Initialize (load models)
await detector.initialize();

// Detect ball
const balls = await detector.detectBall(frame);
console.log(balls); // [{ class: 'ball', confidence: 0.85, bbox: [...], center: {...} }]

// Detect all objects
const detections = await detector.detectAll(frame);
console.log(detections.ball); // Ball detection
console.log(detections.players); // Player detections
```

### With Camera Module

```typescript
import { CameraModule } from '@/lib/camera';
import { DetectionEngine } from '@/lib/detection';

const camera = new CameraModule();
const detector = new DetectionEngine();

await camera.startCamera();
await detector.initialize();

const detect = async () => {
  const frame = camera.getFrame();
  
  if (frame) {
    const detections = await detector.detectAll(frame);
    
    if (detections.ball) {
      console.log('Ball at:', detections.ball.center);
    }
    
    detections.players.forEach(player => {
      console.log('Player:', player.isBatsman ? 'Batsman' : 'Fielder');
    });
  }
  
  requestAnimationFrame(detect);
};

detect();
```

## API Reference

### `initialize(): Promise<void>`

Initialize the detection engine and load models.

**Models Loaded:**
- COCO-SSD (~13MB) - Object detection

### `detectBall(frame): Promise<Detection[]>`

Detect cricket balls in the frame.

**Returns:** Array of ball detections with bounding boxes

### `detectBat(frame): Promise<Detection[]>`

Detect cricket bats in the frame.

**Returns:** Array of bat detections with bounding boxes

### `detectPlayers(frame): Promise<PlayerDetection[]>`

Detect players in the frame.

**Returns:** Array of player detections with pose information

### `detectStumps(frame): Promise<Detection[]>`

Detect stumps in the frame (placeholder).

**Returns:** Array of stumps detections

### `detectBoundary(frame): Promise<BoundaryDetection>`

Detect boundary rope in the frame (placeholder).

**Returns:** Boundary detection with lines

### `detectAll(frame): Promise<AllDetections>`

Run all detections on a frame.

**Returns:** Object with all detections

### `getStats(): DetectionStats`

Get detection statistics (models loaded, inference times).

### `isReady(): boolean`

Check if detection engine is ready.

## Detection Output Format

### Detection

```typescript
interface Detection {
  class: string;              // 'ball', 'bat', 'player', etc.
  confidence: number;         // 0.0 to 1.0
  bbox: [x, y, width, height]; // Bounding box
  center: { x, y };           // Center coordinates
}
```

### PlayerDetection

```typescript
interface PlayerDetection extends Detection {
  pose?: Pose;                // MediaPipe pose (if available)
  keypoints?: Keypoint[];     // Body keypoints
  isBatsman?: boolean;        // True if player is batsman
}
```

### AllDetections

```typescript
interface AllDetections {
  ball: Detection | null;
  bat: Detection | null;
  players: PlayerDetection[];
  stumps: Detection[];
  boundary: BoundaryDetection;
  timestamp: number;
}
```

## Configuration

```typescript
const detector = new DetectionEngine({
  ballConfidence: 0.6,      // Ball detection threshold
  batConfidence: 0.5,       // Bat detection threshold
  playerConfidence: 0.6,    // Player detection threshold
  stumpsConfidence: 0.4,    // Stumps detection threshold
  boundaryConfidence: 0.5,  // Boundary detection threshold
  enablePose: true,         // Enable pose estimation
  downscale: 1.0,           // Frame downscaling (1.0 = no scaling)
});
```

## Performance

### Inference Times (Typical)

- Ball detection: ~30-50ms
- Bat detection: ~30-50ms
- Player detection: ~30-50ms
- All detections (parallel): ~50-80ms

### Optimization Tips

1. **Downscale frames** for faster inference
2. **Run detections in parallel** with `detectAll()`
3. **Skip frames** if needed (detect every 2nd frame)
4. **Use confidence thresholds** to filter results

## Integration Examples

### Example 1: Ball Tracking

```typescript
import { DetectionEngine } from '@/lib/detection';

const detector = new DetectionEngine({ ballConfidence: 0.7 });
await detector.initialize();

let ballTrajectory: Array<{x: number, y: number}> = [];

const trackBall = async (frame: ImageData) => {
  const balls = await detector.detectBall(frame);
  
  if (balls.length > 0) {
    const ball = balls[0];
    ballTrajectory.push(ball.center);
    
    // Detect boundary crossing
    if (ball.center.y < 100) {
      console.log('Ball crossed boundary! 6 runs!');
    }
  }
};
```

### Example 2: Batsman Detection

```typescript
const detectBatsman = async (frame: ImageData) => {
  const players = await detector.detectPlayers(frame);
  
  const batsman = players.find(p => p.isBatsman);
  
  if (batsman) {
    console.log('Batsman detected at:', batsman.center);
    
    // Check if batsman is holding bat
    const bats = await detector.detectBat(frame);
    const hasBat = bats.some(bat => 
      Math.abs(bat.center.x - batsman.center.x) < 50
    );
    
    console.log('Batsman has bat:', hasBat);
  }
};
```

### Example 3: Complete Match Detection

```typescript
const detectMatchState = async (frame: ImageData) => {
  const detections = await detector.detectAll(frame);
  
  const state = {
    ballInPlay: detections.ball !== null,
    batsmanReady: detections.players.some(p => p.isBatsman),
    fielders: detections.players.filter(p => !p.isBatsman).length,
    batVisible: detections.bat !== null,
  };
  
  console.log('Match state:', state);
  
  return state;
};
```

## Limitations

### COCO-SSD Limitations

- **No cricket-specific objects** - Uses generic classes
- **"Sports ball"** includes all balls (cricket, tennis, etc.)
- **"Baseball bat"** is closest match to cricket bat

**Workarounds:**
- Filter by size, shape, position
- Use confidence thresholds
- Track across frames for context

### Future Improvements

1. **Custom Models**
   - Train cricket ball detector
   - Train bat detector
   - Train stumps detector

2. **MediaPipe Pose**
   - Add pose estimation for players
   - Detect batting stance
   - Detect bowling action

3. **Trajectory Prediction**
   - Predict ball path
   - Estimate landing point
   - Calculate speed

## Browser Compatibility

- ✅ Chrome Desktop
- ✅ Chrome Android (HTTPS required)
- ✅ Firefox
- ✅ Safari (limited)

## Dependencies

- `@tensorflow/tfjs` - TensorFlow.js core
- `@tensorflow-models/coco-ssd` - Object detection model
- `@mediapipe/pose` - Pose estimation (optional)
- `@mediapipe/tasks-vision` - Vision tasks (optional)

## License

Part of the PlayPal project.
