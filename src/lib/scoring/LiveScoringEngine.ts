/**
 * Live Scoring Engine
 * 
 * Manages real-time cricket match scoring with Cricket Rule Engine integration.
 */

import { CricketDataLayer, MatchService } from '../cricket';
import type { CricketEvent, ScoringEvent, DismissalEvent } from '../rules/types';
import type { Match } from '../cricket/types';
import type {
    LiveScore,
    ScoreUpdate,
    ScoreListener,
    UpdateListener,
    ScoringEngineConfig,
} from './types';

export class LiveScoringEngine {
    private matchId: string;
    private liveScore: LiveScore | null = null;
    private scoreListeners: Set<ScoreListener> = new Set();
    private updateListeners: Set<UpdateListener> = new Set();
    private autoSave: boolean;

    constructor(config: ScoringEngineConfig) {
        this.matchId = config.matchId;
        this.autoSave = config.autoSave ?? true;
    }

    /**
     * Start a new match
     */
    async startMatch(
        teamAId: string,
        teamBId: string,
        totalOvers: number = 20
    ): Promise<void> {
        // Create match in Cricket Data Layer
        const match = await CricketDataLayer.createMatch({
            teamAId,
            teamBId,
            totalOvers,
            venue: {
                name: 'Live Match',
            },
        });

        this.matchId = match.id;

        // Start the match
        await CricketDataLayer.startMatch(match.id);

        // Initialize live score
        this.liveScore = {
            matchId: match.id,
            teamAScore: 0,
            teamBScore: 0,
            teamAWickets: 0,
            teamBWickets: 0,
            currentOver: 0,
            currentBall: 0,
            totalOvers,
            battingTeam: 'TEAM_A',
            currentBatsmanId: null,
            currentBowlerId: null,
            lastEvent: null,
            isLive: true,
        };

        // Save to localStorage
        if (this.autoSave) {
            this.saveToLocalStorage();
        }

        // Notify listeners
        this.notifyScoreListeners();
    }

    /**
     * End the current match
     */
    async endMatch(): Promise<void> {
        if (!this.liveScore) {
            throw new Error('No active match');
        }

        // Finish match in Cricket Data Layer
        await CricketDataLayer.finishMatch(this.matchId);

        // Update live score
        this.liveScore.isLive = false;

        // Notify listeners
        const update: ScoreUpdate = {
            type: 'MATCH_END',
            timestamp: Date.now(),
        };
        this.notifyUpdateListeners(update);
        this.notifyScoreListeners();

        // Save final state
        if (this.autoSave) {
            this.saveToLocalStorage();
        }
    }

    /**
     * Process cricket event from Rule Engine
     */
    async processEvent(
        event: CricketEvent,
        batsmanId: string,
        bowlerId: string
    ): Promise<void> {
        if (!this.liveScore || !this.liveScore.isLive) {
            throw new Error('No active match');
        }

        if (event.type === 'SCORING') {
            await this.processScoringEvent(event as ScoringEvent, batsmanId, bowlerId);
        } else if (event.type === 'DISMISSAL') {
            await this.processDismissalEvent(event as DismissalEvent, batsmanId, bowlerId);
        }

        // Advance ball count
        this.advanceBall();

        // Save state
        if (this.autoSave) {
            this.saveToLocalStorage();
        }

        // Notify listeners
        this.notifyScoreListeners();
    }

    /**
     * Process scoring event (4s, 6s)
     */
    private async processScoringEvent(
        event: ScoringEvent,
        batsmanId: string,
        bowlerId: string
    ): Promise<void> {
        // Update score
        if (this.liveScore!.battingTeam === 'TEAM_A') {
            this.liveScore!.teamAScore += event.runs;
        } else {
            this.liveScore!.teamBScore += event.runs;
        }

        // Update last event
        this.liveScore!.lastEvent = `${event.runs} runs (${event.boundaryType})`;

        // Notify update listeners
        const update: ScoreUpdate = {
            type: 'RUNS',
            runs: event.runs,
            timestamp: Date.now(),
        };
        this.notifyUpdateListeners(update);
    }

    /**
     * Process dismissal event (caught, bowled, LBW)
     */
    private async processDismissalEvent(
        event: DismissalEvent,
        batsmanId: string,
        bowlerId: string
    ): Promise<void> {
        // Update wickets
        if (this.liveScore!.battingTeam === 'TEAM_A') {
            this.liveScore!.teamAWickets++;
        } else {
            this.liveScore!.teamBWickets++;
        }

        // Update last event
        this.liveScore!.lastEvent = `Wicket! ${event.dismissalType}`;

        // Notify update listeners
        const update: ScoreUpdate = {
            type: 'WICKET',
            wickets: 1,
            dismissalType: event.dismissalType,
            timestamp: Date.now(),
        };
        this.notifyUpdateListeners(update);
    }

    /**
     * Advance ball count
     */
    private advanceBall(): void {
        if (!this.liveScore) return;

        this.liveScore.currentBall++;

        // Check if over is complete (6 balls)
        if (this.liveScore.currentBall >= 6) {
            this.liveScore.currentBall = 0;
            this.liveScore.currentOver++;

            // Notify over complete
            const update: ScoreUpdate = {
                type: 'OVER_COMPLETE',
                timestamp: Date.now(),
            };
            this.notifyUpdateListeners(update);

            // Check if innings is complete
            if (this.liveScore.currentOver >= this.liveScore.totalOvers) {
                this.switchInnings();
            }
        }
    }

    /**
     * Switch innings (Team A to Team B)
     */
    private switchInnings(): void {
        if (!this.liveScore) return;

        if (this.liveScore.battingTeam === 'TEAM_A') {
            this.liveScore.battingTeam = 'TEAM_B';
            this.liveScore.currentOver = 0;
            this.liveScore.currentBall = 0;
            this.liveScore.lastEvent = 'Innings complete - Team B batting';
        } else {
            // Match complete
            this.endMatch();
        }
    }

    /**
     * Get current live score
     */
    getLiveScore(): LiveScore | null {
        return this.liveScore ? { ...this.liveScore } : null;
    }

    /**
     * Subscribe to score updates
     */
    onScoreUpdate(listener: ScoreListener): () => void {
        this.scoreListeners.add(listener);
        return () => this.scoreListeners.delete(listener);
    }

    /**
     * Subscribe to event updates
     */
    onEventUpdate(listener: UpdateListener): () => void {
        this.updateListeners.add(listener);
        return () => this.updateListeners.delete(listener);
    }

    /**
     * Notify score listeners
     */
    private notifyScoreListeners(): void {
        if (this.liveScore) {
            this.scoreListeners.forEach(listener => listener(this.liveScore!));
        }
    }

    /**
     * Notify update listeners
     */
    private notifyUpdateListeners(update: ScoreUpdate): void {
        this.updateListeners.forEach(listener => listener(update));
    }

    /**
     * Save to localStorage
     */
    private saveToLocalStorage(): void {
        if (this.liveScore) {
            localStorage.setItem('liveScore', JSON.stringify(this.liveScore));
        }
    }

    /**
     * Load from localStorage
     */
    loadFromLocalStorage(): LiveScore | null {
        const saved = localStorage.getItem('liveScore');
        if (saved) {
            this.liveScore = JSON.parse(saved);
            return this.liveScore;
        }
        return null;
    }

    /**
     * Clear localStorage
     */
    clearLocalStorage(): void {
        localStorage.removeItem('liveScore');
    }
}

// Export singleton instance for convenience
export const scoringEngine = new LiveScoringEngine({
    matchId: '',
    teamAId: '',
    teamBId: '',
});
