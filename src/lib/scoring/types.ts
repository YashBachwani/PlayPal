/**
 * Live Scoring Engine - Type Definitions
 */

import type { Match } from '../cricket/types';

// ==================== Live Score Types ====================

export interface LiveScore {
    matchId: string;
    teamAScore: number;
    teamBScore: number;
    teamAWickets: number;
    teamBWickets: number;
    currentOver: number;
    currentBall: number;
    totalOvers: number;
    battingTeam: 'TEAM_A' | 'TEAM_B';
    currentBatsmanId: string | null;
    currentBowlerId: string | null;
    lastEvent: string | null;
    isLive: boolean;
}

export interface ScoreUpdate {
    type: 'RUNS' | 'WICKET' | 'OVER_COMPLETE' | 'MATCH_END';
    runs?: number;
    wickets?: number;
    dismissalType?: string;
    timestamp: number;
}

// ==================== Event Listeners ====================

export type ScoreListener = (score: LiveScore) => void;
export type UpdateListener = (update: ScoreUpdate) => void;

// ==================== Configuration ====================

export interface ScoringEngineConfig {
    matchId: string;
    teamAId: string;
    teamBId: string;
    totalOvers?: number;
    autoSave?: boolean;
}
