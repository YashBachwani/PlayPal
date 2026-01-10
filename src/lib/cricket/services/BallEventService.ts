/**
 * Ball Event Service
 * 
 * Manages ball-by-ball event logging and queries.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../storage/indexedDB';
import type { BallEvent, LogBallEventRequest, BallOutcome, EventSource } from '../types';
import { MatchService } from './MatchService';

export class BallEventService {
    /**
     * Log a ball event
     */
    static async logBallEvent(data: LogBallEventRequest): Promise<BallEvent> {
        const match = await MatchService.getMatch(data.matchId);
        if (!match) {
            throw new Error(`Match with ID ${data.matchId} not found`);
        }

        const event: BallEvent = {
            id: uuidv4(),
            matchId: data.matchId,
            innings: match.currentInnings,
            over: match.currentOver,
            ball: match.currentBall,
            batsmanId: data.batsmanId,
            bowlerId: data.bowlerId,
            runs: data.runs,
            extras: data.extras || 0,
            outcome: data.outcome || 'RUNS',
            isWicket: data.isWicket || false,
            wicketType: data.wicketType,
            dismissedPlayerId: data.dismissedPlayerId,
            fielderIds: data.fielderIds,
            source: data.source || 'MANUAL_INPUT',
            timestamp: Date.now(),
            metadata: data.metadata,
        };

        await db.add('ballEvents', event);

        // Update match score and ball count
        const totalRuns = event.runs + event.extras;
        await MatchService.updateScore(data.matchId, totalRuns, event.isWicket);

        // Only advance ball if it's a legal delivery (not no-ball or wide)
        if (event.outcome !== 'NO_BALL' && event.outcome !== 'WIDE') {
            await MatchService.advanceBall(data.matchId);
        }

        return event;
    }

    /**
     * Get a ball event by ID
     */
    static async getBallEvent(id: string): Promise<BallEvent | null> {
        return await db.get('ballEvents', id);
    }

    /**
     * Update a ball event (for manual overrides)
     */
    static async updateBallEvent(id: string, data: Partial<BallEvent>): Promise<BallEvent> {
        const existing = await this.getBallEvent(id);
        if (!existing) {
            throw new Error(`Ball event with ID ${id} not found`);
        }

        const updated: BallEvent = {
            ...existing,
            ...data,
            id: existing.id,
            timestamp: existing.timestamp, // Keep original timestamp
        };

        await db.update('ballEvents', updated);

        // Recalculate match score if runs changed
        if (data.runs !== undefined || data.extras !== undefined || data.isWicket !== undefined) {
            // This would require recalculating all events - simplified for now
            console.warn('Manual event update may require score recalculation');
        }

        return updated;
    }

    /**
     * Delete a ball event
     */
    static async deleteBallEvent(id: string): Promise<void> {
        await db.delete('ballEvents', id);
        // Note: This would require score recalculation
        console.warn('Event deletion requires score recalculation');
    }

    /**
     * Get all events for a match
     */
    static async getMatchEvents(matchId: string): Promise<BallEvent[]> {
        const events = await db.queryByIndex('ballEvents', 'matchId', matchId);
        return events.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get events for a specific player (as batsman)
     */
    static async getBatsmanEvents(playerId: string): Promise<BallEvent[]> {
        return await db.queryByIndex('ballEvents', 'batsmanId', playerId);
    }

    /**
     * Get events for a specific player (as bowler)
     */
    static async getBowlerEvents(playerId: string): Promise<BallEvent[]> {
        return await db.queryByIndex('ballEvents', 'bowlerId', playerId);
    }

    /**
     * Get events by source (camera vs manual)
     */
    static async getEventsBySource(matchId: string, source: EventSource): Promise<BallEvent[]> {
        const allEvents = await this.getMatchEvents(matchId);
        return allEvents.filter(e => e.source === source);
    }

    /**
     * Get wicket events for a match
     */
    static async getWicketEvents(matchId: string): Promise<BallEvent[]> {
        const allEvents = await this.getMatchEvents(matchId);
        return allEvents.filter(e => e.isWicket);
    }

    /**
     * Get boundary events (4s and 6s) for a match
     */
    static async getBoundaryEvents(matchId: string): Promise<BallEvent[]> {
        const allEvents = await this.getMatchEvents(matchId);
        return allEvents.filter(e => e.runs === 4 || e.runs === 6);
    }

    /**
     * Get events for a specific over
     */
    static async getOverEvents(matchId: string, over: number): Promise<BallEvent[]> {
        const allEvents = await this.getMatchEvents(matchId);
        return allEvents.filter(e => e.over === over);
    }
}
