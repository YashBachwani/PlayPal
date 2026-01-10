# Camera Module

WebRTC-based camera streaming module with frame extraction at 30 FPS for AI detection.

## Features

- ✅ WebRTC video stream initialization
- ✅ Hidden canvas for frame extraction
- ✅ 30 FPS throttling
- ✅ Device selection support
- ✅ Chrome + Android compatibility
- ✅ Comprehensive error handling
- ✅ Automatic cleanup

## Quick Start

### Basic Usage

```typescript
import { CameraModule } from '@/lib/camera';

const camera = new CameraModule();

// Start camera
await camera.startCamera();

// Get current frame
const frame = camera.getFrame(); // Returns ImageData

// Stop camera
camera.stopCamera();
```

### With Device Selection

```typescript
// Get available cameras
const devices = await camera.getDevices();
console.log(devices); // Array of MediaDeviceInfo

// Start specific camera
await camera.startCamera({ deviceId: devices[0].deviceId });
```

### Custom Configuration

```typescript
await camera.startCamera({
  deviceId: 'camera-id',
  width: 1920,
  height: 1080,
  frameRate: 30,
});
```

## API Reference

### `startCamera(config?: CameraConfig): Promise<void>`

Start the camera and begin frame extraction.

**Parameters:**
- `config.deviceId` - Specific camera device ID
- `config.width` - Desired width (default: 1280)
- `config.height` - Desired height (default: 720)
- `config.frameRate` - Desired frame rate (default: 30)

**Throws:** `CameraError` if camera access fails

### `stopCamera(): void`

Stop the camera and cleanup all resources.

### `getFrame(): ImageData | null`

Get the current video frame as ImageData.

**Returns:** ImageData object or null if camera is inactive

### `isActive(): boolean`

Check if camera is currently active.

### `getDevices(): Promise<MediaDeviceInfo[]>`

Get list of available camera devices.

### `getStats(): CameraStats`

Get camera statistics (resolution, frame rate, frames extracted, etc.)

## Integration with AI Detection

### TensorFlow.js Example

```typescript
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { CameraModule } from '@/lib/camera';

const camera = new CameraModule();
let model: cocoSsd.ObjectDetection;

// Initialize
await tf.ready();
model = await cocoSsd.load();
await camera.startCamera();

// Detection loop
const detect = async () => {
  const frame = camera.getFrame();
  
  if (frame) {
    // Convert ImageData to tensor
    const tensor = tf.browser.fromPixels(frame);
    
    // Run detection
    const predictions = await model.detect(tensor);
    
    // Process predictions
    predictions.forEach(pred => {
      if (pred.class === 'sports ball' && pred.score > 0.7) {
        console.log('Ball detected!', pred);
      }
    });
    
    // Cleanup tensor
    tensor.dispose();
  }
  
  requestAnimationFrame(detect);
};

detect();
```

### Integration with MatchMode

```typescript
import { useRef, useEffect } from 'react';
import { CameraModule } from '@/lib/camera';

const MatchMode = () => {
  const cameraRef = useRef(new CameraModule());
  
  useEffect(() => {
    const startCamera = async () => {
      try {
        await cameraRef.current.startCamera();
      } catch (error) {
        console.error('Camera error:', error);
      }
    };
    
    startCamera();
    
    return () => {
      cameraRef.current.stopCamera();
    };
  }, []);
  
  // Use camera.getFrame() in your detection loop
};
```

## Error Handling

```typescript
try {
  await camera.startCamera();
} catch (error) {
  const cameraError = error as CameraError;
  
  switch (cameraError.type) {
    case 'PERMISSION_DENIED':
      console.log('User denied camera permission');
      break;
    case 'NOT_FOUND':
      console.log('No camera found');
      break;
    case 'NOT_READABLE':
      console.log('Camera in use by another app');
      break;
    default:
      console.log('Unknown error');
  }
}
```

## Browser Compatibility

### Desktop Chrome
- ✅ Full support
- ✅ All features work

### Chrome Android
- ✅ Full support
- ⚠️ Requires HTTPS or localhost
- ⚠️ Permission prompts

### Fallback Detection

```typescript
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.error('WebRTC not supported');
  // Show error message to user
}
```

## Performance

- **Frame Rate**: Exactly 30 FPS (33.33ms intervals)
- **Memory**: Canvas and ImageData reused
- **CPU**: Optimized with requestAnimationFrame
- **Cleanup**: Automatic resource cleanup on stop

## Security

- Requires HTTPS or localhost
- User must grant camera permission
- Graceful error handling for denials

## TypeScript Types

```typescript
interface CameraConfig {
  deviceId?: string;
  width?: number;
  height?: number;
  frameRate?: number;
}

interface CameraError {
  name: string;
  message: string;
  type: 'PERMISSION_DENIED' | 'NOT_FOUND' | 'NOT_READABLE' | 'UNKNOWN';
}

interface CameraStats {
  isActive: boolean;
  currentDeviceId: string | null;
  resolution: { width: number; height: number } | null;
  frameRate: number;
  framesExtracted: number;
}
```

## Example: Complete Workflow

```typescript
import { CameraModule } from '@/lib/camera';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

class BallDetector {
  private camera: CameraModule;
  private model: cocoSsd.ObjectDetection | null = null;
  private detecting = false;
  
  constructor() {
    this.camera = new CameraModule();
  }
  
  async start() {
    // Initialize TensorFlow
    await tf.ready();
    this.model = await cocoSsd.load();
    
    // Start camera
    await this.camera.startCamera();
    
    // Start detection loop
    this.detecting = true;
    this.detect();
  }
  
  stop() {
    this.detecting = false;
    this.camera.stopCamera();
  }
  
  private async detect() {
    if (!this.detecting || !this.model) return;
    
    const frame = this.camera.getFrame();
    
    if (frame) {
      const tensor = tf.browser.fromPixels(frame);
      const predictions = await this.model.detect(tensor);
      
      // Process ball detections
      const ball = predictions.find(p => p.class === 'sports ball');
      if (ball && ball.score > 0.7) {
        this.onBallDetected(ball);
      }
      
      tensor.dispose();
    }
    
    requestAnimationFrame(() => this.detect());
  }
  
  private onBallDetected(ball: any) {
    console.log('Ball detected:', ball);
    // Trigger scoring logic
  }
}

// Usage
const detector = new BallDetector();
await detector.start();
```

## Troubleshooting

**Camera not starting:**
- Check browser console for errors
- Ensure HTTPS or localhost
- Check camera permissions in browser settings

**Low frame rate:**
- Check `getStats()` for actual FPS
- Reduce resolution if needed
- Close other apps using camera

**Memory leaks:**
- Always call `stopCamera()` when done
- Dispose TensorFlow tensors after use
- Check for proper cleanup in DevTools

## License

Part of the PlayPal project.
