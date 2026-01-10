/**
 * Cricket Rule Engine - Integration with Cricket Data Layer
 */

import { CricketDataLayer, EventSource, BallOutcome } from '../cricket';
import type { CricketEvent, ScoringEvent, DismissalEvent } from './types';

/**
 * Log cricket event to Cricket Data Layer
 */
export async function logEventToDataLayer(
    event: CricketEvent,
    matchId: string,
    batsmanId: string,
    bowlerId: string
): Promise<void> {
    if (event.type === 'SCORING') {
        const scoringEvent = event as ScoringEvent;

        await CricketDataLayer.logBallEvent({
            matchId,
            batsmanId,
            bowlerId,
            runs: scoringEvent.runs,
            extras: 0,
            outcome: BallOutcome.RUNS,
            isWicket: false,
            source: EventSource.CAMERA_DETECTION,
            metadata: {
                confidence: event.confidence,
                boundaryType: scoringEvent.boundaryType,
                detectedBy: 'rule-engine',
            },
        });

        // Update player stats
        await CricketDataLayer.updatePlayerStats(batsmanId);
        await CricketDataLayer.updatePlayerStats(bowlerId);
    } else if (event.type === 'DISMISSAL') {
        const dismissalEvent = event as DismissalEvent;

        await CricketDataLayer.logBallEvent({
            matchId,
            batsmanId,
            bowlerId,
            runs: 0,
            extras: 0,
            outcome: BallOutcome.WICKET,
            isWicket: true,
            wicketType: dismissalEvent.dismissalType,
            dismissedPlayerId: batsmanId,
            fielderIds: dismissalEvent.fielderIds,
            source: EventSource.CAMERA_DETECTION,
            metadata: {
                confidence: event.confidence,
                detectedBy: 'rule-engine',
            },
        });

        // Update player stats
        await CricketDataLayer.updatePlayerStats(batsmanId);
        await CricketDataLayer.updatePlayerStats(bowlerId);
    }
}

/**
 * Complete workflow: Detection → Rule Engine → Data Layer
 */
export async function processFrameAndLogEvents(
    detections: any,
    ruleEngine: any,
    matchId: string,
    batsmanId: string,
    bowlerId: string
): Promise<CricketEvent | null> {
    // Process detections through rule engine
    const event = ruleEngine.processDetections(detections);

    // Log to data layer if event detected
    if (event) {
        await logEventToDataLayer(event, matchId, batsmanId, bowlerId);
    }

    return event;
}
