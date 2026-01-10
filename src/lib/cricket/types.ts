/**
 * Cricket Data Layer - Type Definitions
 * 
 * Comprehensive TypeScript types for cricket match data, players, teams, and statistics.
 */

// ==================== Enums ====================

export enum PlayerRole {
    BATSMAN = 'BATSMAN',
    BOWLER = 'BOWLER',
    ALL_ROUNDER = 'ALL_ROUNDER',
    WICKET_KEEPER = 'WICKET_KEEPER',
}

export enum MatchStatus {
    NOT_STARTED = 'NOT_STARTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ABANDONED = 'ABANDONED',
}

export enum BallOutcome {
    RUNS = 'RUNS',
    WICKET = 'WICKET',
    NO_BALL = 'NO_BALL',
    WIDE = 'WIDE',
    BYE = 'BYE',
    LEG_BYE = 'LEG_BYE',
}

export enum WicketType {
    BOWLED = 'BOWLED',
    CAUGHT = 'CAUGHT',
    LBW = 'LBW',
    RUN_OUT = 'RUN_OUT',
    STUMPED = 'STUMPED',
    HIT_WICKET = 'HIT_WICKET',
}

export enum EventSource {
    CAMERA_DETECTION = 'CAMERA_DETECTION',
    MANUAL_INPUT = 'MANUAL_INPUT',
}

// ==================== Core Entities ====================

export interface Player {
    id: string;
    name: string;
    role: PlayerRole;
    teamId: string | null;
    battingStats: BattingStats;
    bowlingStats: BowlingStats;
    createdAt: number;
    updatedAt: number;
}

export interface Team {
    id: string;
    name: string;
    playerIds: string[];
    matchHistory: string[]; // Array of match IDs
    createdAt: number;
    updatedAt: number;
}

export interface Match {
    id: string;
    teamAId: string;
    teamBId: string;
    venue: VenueConditions;
    status: MatchStatus;
    currentInnings: number;
    battingTeamId: string;
    bowlingTeamId: string;
    currentBatsmanId: string | null;
    currentBowlerId: string | null;
    totalOvers: number;
    currentOver: number;
    currentBall: number;
    teamAScore: number;
    teamBScore: number;
    teamAWickets: number;
    teamBWickets: number;
    startTime: number | null;
    endTime: number | null;
    createdAt: number;
    updatedAt: number;
}

export interface BallEvent {
    id: string;
    matchId: string;
    innings: number;
    over: number;
    ball: number;
    batsmanId: string;
    bowlerId: string;
    runs: number;
    extras: number;
    outcome: BallOutcome;
    isWicket: boolean;
    wicketType?: WicketType;
    dismissedPlayerId?: string;
    fielderIds?: string[];
    source: EventSource;
    timestamp: number;
    metadata?: Record<string, any>; // For CV confidence scores, etc.
}

// ==================== Statistics ====================

export interface BattingStats {
    matchesPlayed: number;
    innings: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    highestScore: number;
    notOuts: number;
    strikeRate: number;
    average: number;
}

export interface BowlingStats {
    matchesPlayed: number;
    innings: number;
    overs: number;
    balls: number;
    runs: number;
    wickets: number;
    maidens: number;
    economy: number;
    average: number;
    bestFigures: string; // e.g., "5/23"
}

export interface MatchStats {
    matchId: string;
    playerId: string;
    batting?: {
        runs: number;
        balls: number;
        fours: number;
        sixes: number;
        strikeRate: number;
        isOut: boolean;
        dismissal?: string;
    };
    bowling?: {
        overs: number;
        runs: number;
        wickets: number;
        economy: number;
    };
}

// ==================== Venue & Conditions ====================

export interface VenueConditions {
    name: string;
    location?: string;
    pitchType?: 'HARD' | 'SOFT' | 'GRASSY' | 'DUSTY';
    weather?: 'SUNNY' | 'CLOUDY' | 'RAINY' | 'WINDY';
    boundaryDistance?: number; // in meters
    temperature?: number; // in Celsius
}

// ==================== Match Summary ====================

export interface MatchSummary {
    match: Match;
    teamAPlayers: Player[];
    teamBPlayers: Player[];
    totalBalls: number;
    totalRuns: number;
    totalWickets: number;
    winner: 'TEAM_A' | 'TEAM_B' | 'DRAW' | null;
    winMargin?: string; // e.g., "by 5 wickets", "by 23 runs"
    playerOfTheMatch?: string; // Player ID
}

// ==================== API Request/Response Types ====================

export interface CreatePlayerRequest {
    name: string;
    role: PlayerRole;
    teamId?: string;
}

export interface CreateTeamRequest {
    name: string;
    playerIds?: string[];
}

export interface CreateMatchRequest {
    teamAId: string;
    teamBId: string;
    venue: VenueConditions;
    totalOvers?: number;
}

export interface LogBallEventRequest {
    matchId: string;
    batsmanId: string;
    bowlerId: string;
    runs: number;
    extras?: number;
    outcome?: BallOutcome;
    isWicket?: boolean;
    wicketType?: WicketType;
    dismissedPlayerId?: string;
    fielderIds?: string[];
    source?: EventSource;
    metadata?: Record<string, any>;
}

// ==================== Utility Types ====================

export type PartialPlayer = Partial<Omit<Player, 'id' | 'createdAt' | 'updatedAt'>>;
export type PartialTeam = Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>;
export type PartialMatch = Partial<Omit<Match, 'id' | 'createdAt' | 'updatedAt'>>;

// ==================== Database Schema ====================

export interface DBSchema {
    players: Player;
    teams: Team;
    matches: Match;
    ballEvents: BallEvent;
}

export type DBStoreName = keyof DBSchema;

// ==================== Helper Functions ====================

export const createEmptyBattingStats = (): BattingStats => ({
    matchesPlayed: 0,
    innings: 0,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    highestScore: 0,
    notOuts: 0,
    strikeRate: 0,
    average: 0,
});

export const createEmptyBowlingStats = (): BowlingStats => ({
    matchesPlayed: 0,
    innings: 0,
    overs: 0,
    balls: 0,
    runs: 0,
    wickets: 0,
    maidens: 0,
    economy: 0,
    average: 0,
    bestFigures: '0/0',
});
