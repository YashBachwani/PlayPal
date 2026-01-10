/**
 * Cricket Rule Engine - Zone Utilities
 */

import type { Zones, RuleEngineConfig } from './types';
import { DEFAULT_RULE_CONFIG } from './types';

/**
 * Create zone definitions from config
 */
export function createZones(config: RuleEngineConfig = {}): Zones {
    const cfg = { ...DEFAULT_RULE_CONFIG, ...config };

    return {
        frameWidth: cfg.frameWidth,
        frameHeight: cfg.frameHeight,
        boundaryTop: cfg.frameHeight * cfg.boundaryTopPercent,
        groundLine: cfg.frameHeight * cfg.groundLinePercent,
        boundaryLeft: cfg.frameWidth * cfg.boundarySidePercent,
        boundaryRight: cfg.frameWidth * (1 - cfg.boundarySidePercent),
    };
}

/**
 * Check if position is in boundary zone
 */
export function isBoundary(position: { x: number; y: number }, zones: Zones): boolean {
    return (
        position.y < zones.boundaryTop ||
        position.x < zones.boundaryLeft ||
        position.x > zones.boundaryRight
    );
}

/**
 * Check if position is on ground
 */
export function isOnGround(position: { x: number; y: number }, zones: Zones): boolean {
    return position.y > zones.groundLine;
}

/**
 * Calculate distance between two points
 */
export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two bounding boxes intersect
 */
export function bboxIntersect(
    bbox1: [number, number, number, number],
    bbox2: [number, number, number, number]
): boolean {
    const [x1, y1, w1, h1] = bbox1;
    const [x2, y2, w2, h2] = bbox2;

    return !(
        x1 + w1 < x2 ||
        x2 + w2 < x1 ||
        y1 + h1 < y2 ||
        y2 + h2 < y1
    );
}

/**
 * Project trajectory forward
 */
export function projectTrajectory(
    trajectory: Array<{ x: number; y: number }>,
    steps: number = 10
): Array<{ x: number; y: number }> {
    if (trajectory.length < 2) return [];

    // Get velocity from last two points
    const last = trajectory[trajectory.length - 1];
    const secondLast = trajectory[trajectory.length - 2];

    const vx = last.x - secondLast.x;
    const vy = last.y - secondLast.y;

    // Project forward
    const projected: Array<{ x: number; y: number }> = [];
    for (let i = 1; i <= steps; i++) {
        projected.push({
            x: last.x + vx * i,
            y: last.y + vy * i,
        });
    }

    return projected;
}

/**
 * Check if trajectory intersects with bounding box
 */
export function trajectoryIntersects(
    trajectory: Array<{ x: number; y: number }>,
    bbox: [number, number, number, number]
): boolean {
    const [x, y, w, h] = bbox;

    return trajectory.some(point =>
        point.x >= x &&
        point.x <= x + w &&
        point.y >= y &&
        point.y <= y + h
    );
}
