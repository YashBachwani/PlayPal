/**
 * Player Career Engine - Type Definitions
 */

// ==================== Career Stats ====================

export interface CareerStats {
    playerId: string;
    playerName: string;

    // Batting
    totalMatches: number;
    totalRuns: number;
    totalBalls: number;
    strikeRate: number;
    average: number;
    highestScore: number;
    centuries: number;
    halfCenturies: number;
    fours: number;
    sixes: number;

    // Bowling
    totalWickets: number;
    bowlingAverage: number;
    economy: number;
    bestFigures: string;

    // Awards
    mvpAwards: number;
    playerOfMatch: number;

    // AI Rating
    aiRating: number; // 0-1000
    formRating: number; // 0-100

    // Metadata
    lastUpdated: number;
    createdAt: number;
}

// ==================== Leaderboard ====================

export interface LeaderboardEntry {
    rank: number;
    playerId: string;
    playerName: string;
    value: number;
    change: number; // Rank change from last update
}

export interface Leaderboard {
    category: LeaderboardCategory;
    entries: LeaderboardEntry[];
    lastUpdated: number;
}

export type LeaderboardCategory =
    | 'RUNS'
    | 'WICKETS'
    | 'STRIKE_RATE'
    | 'AVERAGE'
    | 'AI_RATING'
    | 'MVP_AWARDS';

// ==================== Rankings ====================

export interface PlayerRanking {
    playerId: string;
    battingRank: number;
    bowlingRank: number;
    allRounderRank: number;
    overallRank: number;
}

// ==================== Achievements ====================

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: number;
}

export interface PlayerAchievements {
    playerId: string;
    achievements: Achievement[];
}
