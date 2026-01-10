/**
 * Cricket Rule Engine - Type Definitions
 */

import type { WicketType } from '../cricket/types';

// ==================== Event Types ====================

export interface CricketEvent {
    type: 'SCORING' | 'DISMISSAL';
    timestamp: number;
    confidence: number;
}

export interface ScoringEvent extends CricketEvent {
    type: 'SCORING';
    runs: 1 | 2 | 3 | 4 | 6;
    boundaryType?: 'FOUR' | 'SIX';
}

export interface DismissalEvent extends CricketEvent {
    type: 'DISMISSAL';
    dismissalType: WicketType;
    fielderIds?: string[];
}

// ==================== Trajectory Types ====================

export interface BallPosition {
    x: number;
    y: number;
    timestamp: number;
    touchedGround: boolean;
}

export interface TrajectoryPoint {
    x: number;
    y: number;
}

// ==================== Zone Definitions ====================

export interface Zones {
    boundaryTop: number;
    groundLine: number;
    boundaryLeft: number;
    boundaryRight: number;
    frameWidth: number;
    frameHeight: number;
}

// ==================== Configuration ====================

export interface RuleEngineConfig {
    frameWidth?: number;
    frameHeight?: number;
    boundaryTopPercent?: number;
    groundLinePercent?: number;
    boundarySidePercent?: number;
    catchDistance?: number;
    hitDistance?: number;
    cooldownMs?: number;
    maxTrajectoryHistory?: number;
}

export const DEFAULT_RULE_CONFIG: Required<RuleEngineConfig> = {
    frameWidth: 1280,
    frameHeight: 720,
    boundaryTopPercent: 0.2,    // Top 20%
    groundLinePercent: 0.7,     // Bottom 30%
    boundarySidePercent: 0.1,   // Left/Right 10%
    catchDistance: 100,         // pixels
    hitDistance: 80,            // pixels
    cooldownMs: 3000,           // 3 seconds
    maxTrajectoryHistory: 30,   // 1 second at 30 FPS
};
