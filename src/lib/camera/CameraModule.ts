/**
 * Camera Module
 * 
 * WebRTC-based camera streaming with frame extraction at 30 FPS.
 * Designed for feeding frames to AI detection models.
 */

import type { CameraConfig, CameraError, CameraStats } from './types';

export class CameraModule {
    private videoElement: HTMLVideoElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private stream: MediaStream | null = null;
    private animationFrameId: number | null = null;
    private lastFrameTime: number = 0;
    private framesExtracted: number = 0;
    private currentDeviceId: string | null = null;

    // Configuration
    private readonly FPS = 30;
    private readonly FRAME_INTERVAL = 1000 / 30; // 33.33ms

    /**
     * Start the camera and begin frame extraction
     */
    async startCamera(config: CameraConfig = {}): Promise<void> {
        // Stop existing stream if any
        this.stopCamera();

        const {
            deviceId,
            width = 1280,
            height = 720,
            frameRate = 30,
        } = config;

        try {
            // Request camera access
            const constraints: MediaStreamConstraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: width },
                    height: { ideal: height },
                    frameRate: { ideal: frameRate },
                    facingMode: deviceId ? undefined : 'environment', // Rear camera on mobile
                },
                audio: false,
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.currentDeviceId = deviceId || null;

            // Create video element
            this.videoElement = document.createElement('video');
            this.videoElement.srcObject = this.stream;
            this.videoElement.autoplay = true;
            this.videoElement.playsInline = true;
            this.videoElement.muted = true;

            // Wait for video to be ready
            await new Promise<void>((resolve) => {
                this.videoElement!.onloadedmetadata = () => {
                    this.videoElement!.play();
                    resolve();
                };
            });

            // Create hidden canvas for frame extraction
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.videoElement.videoWidth || width;
            this.canvas.height = this.videoElement.videoHeight || height;
            this.canvas.style.display = 'none';
            document.body.appendChild(this.canvas);

            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

            if (!this.ctx) {
                throw new Error('Failed to get canvas context');
            }

            // Start frame extraction loop
            this.lastFrameTime = performance.now();
            this.startFrameExtraction();

            console.log('Camera started successfully', {
                width: this.canvas.width,
                height: this.canvas.height,
                deviceId: this.currentDeviceId,
            });
        } catch (error: any) {
            const cameraError = this.handleCameraError(error);
            console.error('Failed to start camera:', cameraError);
            this.cleanup();
            throw cameraError;
        }
    }

    /**
     * Stop the camera and cleanup resources
     */
    stopCamera(): void {
        this.cleanup();
        console.log('Camera stopped');
    }

    /**
     * Get the current frame as ImageData
     * Returns null if camera is not active
     */
    getFrame(): ImageData | null {
        if (!this.ctx || !this.canvas || !this.videoElement || !this.isActive()) {
            return null;
        }

        try {
            // Draw current video frame to canvas
            this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);

            // Extract ImageData
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.framesExtracted++;

            return imageData;
        } catch (error) {
            console.error('Failed to extract frame:', error);
            return null;
        }
    }

    /**
     * Check if camera is currently active
     */
    isActive(): boolean {
        return this.stream !== null && this.stream.active;
    }

    /**
     * Get available camera devices
     */
    async getDevices(): Promise<MediaDeviceInfo[]> {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Failed to enumerate devices:', error);
            return [];
        }
    }

    /**
     * Get camera statistics
     */
    getStats(): CameraStats {
        return {
            isActive: this.isActive(),
            currentDeviceId: this.currentDeviceId,
            resolution: this.canvas ? {
                width: this.canvas.width,
                height: this.canvas.height,
            } : null,
            frameRate: this.FPS,
            framesExtracted: this.framesExtracted,
        };
    }

    /**
     * Start the frame extraction loop at 30 FPS
     */
    private startFrameExtraction(): void {
        const extractFrame = () => {
            if (!this.isActive()) {
                return;
            }

            const now = performance.now();
            const elapsed = now - this.lastFrameTime;

            // Throttle to exactly 30 FPS
            if (elapsed >= this.FRAME_INTERVAL) {
                // Frame extraction happens when getFrame() is called
                // This loop just maintains the timing
                this.lastFrameTime = now - (elapsed % this.FRAME_INTERVAL);
            }

            this.animationFrameId = requestAnimationFrame(extractFrame);
        };

        extractFrame();
    }

    /**
     * Cleanup all resources
     */
    private cleanup(): void {
        // Stop animation frame
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        // Stop media stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Remove video element
        if (this.videoElement) {
            this.videoElement.srcObject = null;
            this.videoElement = null;
        }

        // Remove canvas
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
            this.ctx = null;
        }

        // Reset state
        this.currentDeviceId = null;
        this.framesExtracted = 0;
    }

    /**
     * Handle camera errors and convert to CameraError
     */
    private handleCameraError(error: any): CameraError {
        let type: CameraError['type'] = 'UNKNOWN';
        let message = error.message || 'Unknown camera error';

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            type = 'PERMISSION_DENIED';
            message = 'Camera permission denied. Please allow camera access.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            type = 'NOT_FOUND';
            message = 'No camera found. Please connect a camera.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            type = 'NOT_READABLE';
            message = 'Camera is already in use by another application.';
        }

        return {
            name: error.name || 'CameraError',
            message,
            type,
        };
    }
}

// Export singleton instance for convenience
export const camera = new CameraModule();
