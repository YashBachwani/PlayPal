/**
 * Cricket Rule Engine
 * 
 * Analyzes ball trajectory and bounding boxes to detect cricket events.
 */

import type { AllDetections, Detection } from '../detection';
import type {
    CricketEvent,
    ScoringEvent,
    DismissalEvent,
    BallPosition,
    RuleEngineConfig,
    Zones,
} from './types';
import { DEFAULT_RULE_CONFIG } from './types';
import {
    createZones,
    isBoundary,
    isOnGround,
    distance,
    bboxIntersect,
    projectTrajectory,
    trajectoryIntersects,
} from './zones';
import { WicketType } from '../cricket/types';

export class RuleEngine {
    private ballTrajectory: BallPosition[] = [];
    private lastEvent: CricketEvent | null = null;
    private lastEventTime = 0;
    private zones: Zones;
    private config: Required<RuleEngineConfig>;

    constructor(config: RuleEngineConfig = {}) {
        this.config = { ...DEFAULT_RULE_CONFIG, ...config };
        this.zones = createZones(this.config);
    }

    /**
     * Process detections and return cricket event if detected
     */
    processDetections(detections: AllDetections): CricketEvent | null {
        // Prevent duplicate events (debouncing)
        if (Date.now() - this.lastEventTime < this.config.cooldownMs) {
            return null;
        }

        // Track ball trajectory
        if (detections.ball) {
            this.trackBall(detections.ball);
        }

        // Detect events
        const event = this.detectEvent(detections);

        if (event) {
            this.lastEvent = event;
            this.lastEventTime = Date.now();

            // Clear trajectory after event
            this.ballTrajectory = [];
        }

        return event;
    }

    /**
     * Detect cricket event from current state
     */
    private detectEvent(detections: AllDetections): CricketEvent | null {
        // Check dismissals first (higher priority)
        const dismissal = this.detectDismissal(detections);
        if (dismissal) return dismissal;

        // Check scoring
        const scoring = this.detectScoring(detections);
        if (scoring) return scoring;

        return null;
    }

    /**
     * Detect scoring events (4s, 6s)
     */
    private detectScoring(detections: AllDetections): ScoringEvent | null {
        if (this.ballTrajectory.length < 5) return null;

        // Check for 6 runs (direct boundary)
        const crossedBoundary = this.ballTrajectory.some(pos =>
            isBoundary(pos, this.zones)
        );

        if (crossedBoundary) {
            const touchedGround = this.ballTrajectory.some(pos => pos.touchedGround);

            if (!touchedGround) {
                // 6 runs - direct boundary
                return {
                    type: 'SCORING',
                    runs: 6,
                    boundaryType: 'SIX',
                    timestamp: Date.now(),
                    confidence: 0.85,
                };
            } else {
                // 4 runs - boundary after bounce
                return {
                    type: 'SCORING',
                    runs: 4,
                    boundaryType: 'FOUR',
                    timestamp: Date.now(),
                    confidence: 0.85,
                };
            }
        }

        return null;
    }

    /**
     * Detect dismissal events
     */
    private detectDismissal(detections: AllDetections): DismissalEvent | null {
        if (!detections.ball) return null;

        // Check for bowled
        const bowled = this.detectBowled(detections);
        if (bowled) return bowled;

        // Check for caught
        const caught = this.detectCaught(detections);
        if (caught) return caught;

        // Check for LBW
        const lbw = this.detectLBW(detections);
        if (lbw) return lbw;

        return null;
    }

    /**
     * Detect bowled (ball hits stumps)
     */
    private detectBowled(detections: AllDetections): DismissalEvent | null {
        if (!detections.ball || detections.stumps.length === 0) return null;

        const hitStumps = detections.stumps.some(stump =>
            bboxIntersect(detections.ball!.bbox, stump.bbox)
        );

        if (hitStumps) {
            return {
                type: 'DISMISSAL',
                dismissalType: WicketType.BOWLED,
                timestamp: Date.now(),
                confidence: 0.9,
            };
        }

        return null;
    }

    /**
     * Detect caught (fielder intercepts ball before ground)
     */
    private detectCaught(detections: AllDetections): DismissalEvent | null {
        if (!detections.ball) return null;

        const fielders = detections.players.filter(p => !p.isBatsman);
        if (fielders.length === 0) return null;

        // Check if ball is near fielder
        const nearFielder = fielders.find(fielder =>
            distance(detections.ball!.center, fielder.center) < this.config.catchDistance
        );

        if (!nearFielder) return null;

        // Check if ball hasn't touched ground
        const touchedGround = this.ballTrajectory.some(pos => pos.touchedGround);

        if (!touchedGround) {
            return {
                type: 'DISMISSAL',
                dismissalType: WicketType.CAUGHT,
                fielderIds: [nearFielder.class], // Would be actual player ID in real implementation
                timestamp: Date.now(),
                confidence: 0.75,
            };
        }

        return null;
    }

    /**
     * Detect LBW (ball hits pad and would hit stumps)
     */
    private detectLBW(detections: AllDetections): DismissalEvent | null {
        if (!detections.ball || detections.stumps.length === 0) return null;

        const batsman = detections.players.find(p => p.isBatsman);
        if (!batsman) return null;

        // Check if ball hit batsman (proximity)
        const hitBatsman = distance(detections.ball.center, batsman.center) < this.config.hitDistance;

        if (!hitBatsman) return null;

        // Project ball trajectory
        const trajectoryPoints = this.ballTrajectory.map(p => ({ x: p.x, y: p.y }));
        const projected = projectTrajectory(trajectoryPoints, 10);

        // Check if trajectory would hit stumps
        const wouldHitStumps = detections.stumps.some(stump =>
            trajectoryIntersects(projected, stump.bbox)
        );

        if (wouldHitStumps) {
            return {
                type: 'DISMISSAL',
                dismissalType: WicketType.LBW,
                timestamp: Date.now(),
                confidence: 0.65, // Lower confidence for LBW
            };
        }

        return null;
    }

    /**
     * Track ball position in trajectory
     */
    private trackBall(ball: Detection): void {
        const position: BallPosition = {
            x: ball.center.x,
            y: ball.center.y,
            timestamp: Date.now(),
            touchedGround: isOnGround(ball.center, this.zones),
        };

        this.ballTrajectory.push(position);

        // Keep only recent history
        if (this.ballTrajectory.length > this.config.maxTrajectoryHistory) {
            this.ballTrajectory.shift();
        }
    }

    /**
     * Get current trajectory
     */
    getTrajectory(): BallPosition[] {
        return [...this.ballTrajectory];
    }

    /**
     * Clear trajectory history
     */
    clearTrajectory(): void {
        this.ballTrajectory = [];
    }

    /**
     * Get last detected event
     */
    getLastEvent(): CricketEvent | null {
        return this.lastEvent;
    }
}

// Export singleton instance for convenience
export const ruleEngine = new RuleEngine();
