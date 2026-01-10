/**
 * Detection Engine
 * 
 * Main AI detection engine using TensorFlow.js and MediaPipe for cricket object detection.
 */

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import type {
    Detection,
    PlayerDetection,
    BoundaryDetection,
    AllDetections,
    DetectionConfig,
    DetectionStats,
    Pose,
} from './types';
import { DEFAULT_CONFIG } from './types';

export class DetectionEngine {
    private cocoModel: cocoSsd.ObjectDetection | null = null;
    private config: DetectionConfig;
    private totalInferences = 0;
    private totalInferenceTime = 0;
    private lastInferenceTime = 0;

    constructor(config: Partial<DetectionConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config } as DetectionConfig;
    }

    /**
     * Initialize the detection engine and load models
     */
    async initialize(): Promise<void> {
        console.log('Initializing Detection Engine...');

        // Initialize TensorFlow.js
        await tf.ready();
        console.log('TensorFlow.js ready');

        // Load COCO-SSD model
        this.cocoModel = await cocoSsd.load();
        console.log('COCO-SSD model loaded');

        console.log('Detection Engine initialized successfully');
    }

    /**
     * Detect cricket ball in frame
     */
    async detectBall(frame: ImageData | HTMLCanvasElement | HTMLImageElement): Promise<Detection[]> {
        if (!this.cocoModel) {
            throw new Error('Detection engine not initialized');
        }

        const startTime = performance.now();

        const predictions = await this.cocoModel.detect(frame as any);

        // Filter for sports ball
        const balls = predictions
            .filter(p => p.class === 'sports ball')
            .filter(p => p.score >= (this.config.ballConfidence || 0.6))
            .map(p => this.toDetection(p, 'ball'));

        this.updateStats(startTime);

        return balls;
    }

    /**
     * Detect cricket bat in frame
     */
    async detectBat(frame: ImageData | HTMLCanvasElement | HTMLImageElement): Promise<Detection[]> {
        if (!this.cocoModel) {
            throw new Error('Detection engine not initialized');
        }

        const startTime = performance.now();

        const predictions = await this.cocoModel.detect(frame as any);

        // Filter for bat-like objects (baseball bat, tennis racket)
        const bats = predictions
            .filter(p => p.class === 'baseball bat' || p.class === 'tennis racket')
            .filter(p => p.score >= (this.config.batConfidence || 0.5))
            .filter(p => {
                // Filter by aspect ratio (bat is long and thin)
                const [x, y, w, h] = p.bbox;
                const aspectRatio = h / w;
                return aspectRatio > 1.5; // Vertical bat
            })
            .map(p => this.toDetection(p, 'bat'));

        this.updateStats(startTime);

        return bats;
    }

    /**
     * Detect players in frame
     */
    async detectPlayers(frame: ImageData | HTMLCanvasElement | HTMLImageElement): Promise<PlayerDetection[]> {
        if (!this.cocoModel) {
            throw new Error('Detection engine not initialized');
        }

        const startTime = performance.now();

        const predictions = await this.cocoModel.detect(frame as any);

        // Filter for persons
        const players = predictions
            .filter(p => p.class === 'person')
            .filter(p => p.score >= (this.config.playerConfidence || 0.6))
            .map(p => {
                const detection = this.toDetection(p, 'player');
                return {
                    ...detection,
                    isBatsman: this.isBatsmanPosition(detection, frame),
                } as PlayerDetection;
            });

        this.updateStats(startTime);

        return players;
    }

    /**
     * Detect stumps in frame
     */
    async detectStumps(frame: ImageData | HTMLCanvasElement | HTMLImageElement): Promise<Detection[]> {
        if (!this.cocoModel) {
            throw new Error('Detection engine not initialized');
        }

        const startTime = performance.now();

        // COCO-SSD doesn't have stumps, so we look for vertical objects
        // In a real implementation, this would use custom model or edge detection
        const predictions = await this.cocoModel.detect(frame as any);

        // Look for objects that might be stumps (placeholder logic)
        const stumps: Detection[] = [];

        // TODO: Implement proper stumps detection with edge detection or custom model

        this.updateStats(startTime);

        return stumps;
    }

    /**
     * Detect boundary rope in frame
     */
    async detectBoundary(frame: ImageData | HTMLCanvasElement | HTMLImageElement): Promise<BoundaryDetection> {
        const startTime = performance.now();

        // Placeholder implementation
        // In a real implementation, this would use edge detection and line detection
        const boundary: BoundaryDetection = {
            detected: false,
            lines: [],
            confidence: 0,
        };

        // TODO: Implement boundary detection with edge detection

        this.updateStats(startTime);

        return boundary;
    }

    /**
     * Run all detections on a frame
     */
    async detectAll(frame: ImageData | HTMLCanvasElement | HTMLImageElement): Promise<AllDetections> {
        const startTime = performance.now();

        // Run detections in parallel for better performance
        const [ball, bat, players, stumps, boundary] = await Promise.all([
            this.detectBall(frame),
            this.detectBat(frame),
            this.detectPlayers(frame),
            this.detectStumps(frame),
            this.detectBoundary(frame),
        ]);

        this.updateStats(startTime);

        return {
            ball: ball[0] || null,
            bat: bat[0] || null,
            players,
            stumps,
            boundary,
            timestamp: Date.now(),
        };
    }

    /**
     * Get detection statistics
     */
    getStats(): DetectionStats {
        return {
            modelsLoaded: [
                {
                    name: 'COCO-SSD',
                    loaded: this.cocoModel !== null,
                    size: 13000000, // ~13MB
                    version: '2.2.3',
                },
            ],
            totalInferences: this.totalInferences,
            averageInferenceTime: this.totalInferences > 0
                ? this.totalInferenceTime / this.totalInferences
                : 0,
            lastInferenceTime: this.lastInferenceTime,
        };
    }

    /**
     * Check if engine is ready
     */
    isReady(): boolean {
        return this.cocoModel !== null;
    }

    /**
     * Convert COCO-SSD prediction to Detection
     */
    private toDetection(prediction: any, className: string): Detection {
        const [x, y, width, height] = prediction.bbox;
        return {
            class: className,
            confidence: prediction.score,
            bbox: [x, y, width, height],
            center: {
                x: x + width / 2,
                y: y + height / 2,
            },
        };
    }

    /**
     * Determine if player is in batsman position
     * (Simplified heuristic based on position in frame)
     */
    private isBatsmanPosition(detection: Detection, frame: any): boolean {
        // Batsman is typically in center-bottom of frame
        const frameWidth = frame.width || 1280;
        const frameHeight = frame.height || 720;

        const centerX = detection.center.x;
        const centerY = detection.center.y;

        // Check if player is in center-bottom third
        const isInCenterX = centerX > frameWidth * 0.3 && centerX < frameWidth * 0.7;
        const isInBottomHalf = centerY > frameHeight * 0.5;

        return isInCenterX && isInBottomHalf;
    }

    /**
     * Update inference statistics
     */
    private updateStats(startTime: number): void {
        const inferenceTime = performance.now() - startTime;
        this.totalInferences++;
        this.totalInferenceTime += inferenceTime;
        this.lastInferenceTime = inferenceTime;
    }
}

// Export singleton instance for convenience
export const detector = new DetectionEngine();
