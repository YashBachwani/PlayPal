/**
 * Detection Module - Type Definitions
 */

// ==================== Core Detection Types ====================

export interface Detection {
    class: string;
    confidence: number;
    bbox: [x: number, y: number, width: number, height: number];
    center: { x: number; y: number };
}

export interface PlayerDetection extends Detection {
    pose?: Pose;
    keypoints?: Keypoint[];
    isBatsman?: boolean;
}

export interface BoundaryDetection {
    detected: boolean;
    lines: Line[];
    confidence: number;
}

export interface AllDetections {
    ball: Detection | null;
    bat: Detection | null;
    players: PlayerDetection[];
    stumps: Detection[];
    boundary: BoundaryDetection;
    timestamp: number;
}

// ==================== MediaPipe Types ====================

export interface Keypoint {
    x: number;
    y: number;
    z?: number;
    score?: number;
    name?: string;
}

export interface Pose {
    keypoints: Keypoint[];
    score: number;
}

export interface Line {
    start: { x: number; y: number };
    end: { x: number; y: number };
    angle: number;
}

// ==================== Configuration ====================

export interface DetectionConfig {
    ballConfidence?: number;
    batConfidence?: number;
    playerConfidence?: number;
    stumpsConfidence?: number;
    boundaryConfidence?: number;
    enablePose?: boolean;
    downscale?: number;
}

export const DEFAULT_CONFIG: DetectionConfig = {
    ballConfidence: 0.6,
    batConfidence: 0.5,
    playerConfidence: 0.6,
    stumpsConfidence: 0.4,
    boundaryConfidence: 0.5,
    enablePose: true,
    downscale: 1.0,
};

// ==================== Model Types ====================

export interface ModelInfo {
    name: string;
    loaded: boolean;
    size: number;
    version: string;
}

export interface DetectionStats {
    modelsLoaded: ModelInfo[];
    totalInferences: number;
    averageInferenceTime: number;
    lastInferenceTime: number;
}
