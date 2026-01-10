/**
 * AI Prediction Engine - Type Definitions
 */

// ==================== Prediction Types ====================

export interface NextBallPrediction {
    outcome: 'DOT' | 'SINGLE' | 'BOUNDARY' | 'WICKET';
    probability: number;
    confidence: number;
    reasoning: string;
}

export interface WicketPrediction {
    probability: number;
    mostLikelyType: 'CAUGHT' | 'BOWLED' | 'LBW' | 'RUN_OUT';
    confidence: number;
}

export interface BoundaryPrediction {
    fourProbability: number;
    sixProbability: number;
    totalProbability: number;
    confidence: number;
}

export interface WinPrediction {
    teamAWinProbability: number;
    teamBWinProbability: number;
    drawProbability: number;
    confidence: number;
    factors: string[];
}

export interface BattingOrderRecommendation {
    playerId: string;
    position: number;
    score: number;
    reasoning: string;
}

export interface BowlingRecommendation {
    playerId: string;
    score: number;
    reasoning: string;
    expectedWickets: number;
    expectedEconomy: number;
}

export interface PlayerWeakZone {
    playerId: string;
    zones: {
        area: 'OFF_SIDE' | 'LEG_SIDE' | 'STRAIGHT' | 'SHORT' | 'FULL';
        weakness: number; // 0-1, higher = weaker
        dismissalRate: number;
    }[];
}

// ==================== Analysis Types ====================

export interface PlayerForm {
    playerId: string;
    recentRuns: number;
    recentBalls: number;
    strikeRate: number;
    recentWickets: number;
    formScore: number; // 0-100
}

export interface MatchContext {
    currentScore: number;
    currentWickets: number;
    oversRemaining: number;
    requiredRunRate: number;
    currentRunRate: number;
}
