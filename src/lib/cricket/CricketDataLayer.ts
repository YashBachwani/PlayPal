/**
 * Cricket Data Layer - Main API Facade
 * 
 * Unified interface for all cricket data operations.
 */

import { db } from './storage/indexedDB';
import {
    PlayerService,
    TeamService,
    MatchService,
    BallEventService,
    StatsService,
} from './services';

import type {
    Player,
    Team,
    Match,
    BallEvent,
    MatchSummary,
    MatchStats,
    BattingStats,
    BowlingStats,
    CreatePlayerRequest,
    CreateTeamRequest,
    CreateMatchRequest,
    LogBallEventRequest,
} from './types';

/**
 * Main Cricket Data Layer API
 * 
 * Provides a unified interface for all cricket data operations.
 * All methods are static and can be called directly.
 */
export class CricketDataLayer {
    // ==================== Initialization ====================

    /**
     * Initialize the cricket data layer
     * Must be called before any other operations
     */
    static async initialize(): Promise<void> {
        await db.init();
        console.log('Cricket Data Layer initialized');
    }

    // ==================== Match Management ====================

    /**
     * Create a new match
     */
    static async createMatch(data: CreateMatchRequest): Promise<Match> {
        return await MatchService.createMatch(data);
    }

    /**
     * Get current active match
     */
    static async getCurrentMatch(): Promise<Match | null> {
        return await MatchService.getCurrentMatch();
    }

    /**
     * Get a match by ID
     */
    static async getMatch(id: string): Promise<Match | null> {
        return await MatchService.getMatch(id);
    }

    /**
     * Start a match
     */
    static async startMatch(id: string): Promise<void> {
        return await MatchService.startMatch(id);
    }

    /**
     * Finish a match
     */
    static async finishMatch(id: string): Promise<void> {
        return await MatchService.finishMatch(id);
    }

    /**
     * Get all matches
     */
    static async getAllMatches(): Promise<Match[]> {
        return await MatchService.getAllMatches();
    }

    /**
     * Get match summary with full details
     */
    static async getMatchSummary(matchId: string): Promise<MatchSummary> {
        return await StatsService.getMatchSummary(matchId);
    }

    // ==================== Event Logging ====================

    /**
     * Log a ball event (from camera detection or manual input)
     */
    static async logBallEvent(data: LogBallEventRequest): Promise<BallEvent> {
        return await BallEventService.logBallEvent(data);
    }

    /**
     * Update a ball event (manual override)
     */
    static async updateBallEvent(id: string, data: Partial<BallEvent>): Promise<BallEvent> {
        return await BallEventService.updateBallEvent(id, data);
    }

    /**
     * Get all events for a match
     */
    static async getMatchEvents(matchId: string): Promise<BallEvent[]> {
        return await BallEventService.getMatchEvents(matchId);
    }

    /**
     * Get boundary events (4s and 6s) for a match
     */
    static async getBoundaryEvents(matchId: string): Promise<BallEvent[]> {
        return await BallEventService.getBoundaryEvents(matchId);
    }

    /**
     * Get wicket events for a match
     */
    static async getWicketEvents(matchId: string): Promise<BallEvent[]> {
        return await BallEventService.getWicketEvents(matchId);
    }

    // ==================== Player Management ====================

    /**
     * Create a new player
     */
    static async createPlayer(data: CreatePlayerRequest): Promise<Player> {
        return await PlayerService.createPlayer(data);
    }

    /**
     * Get a player by ID
     */
    static async getPlayer(id: string): Promise<Player | null> {
        return await PlayerService.getPlayer(id);
    }

    /**
     * Update a player
     */
    static async updatePlayer(id: string, data: Partial<Player>): Promise<Player> {
        return await PlayerService.updatePlayer(id, data);
    }

    /**
     * Get all players
     */
    static async getAllPlayers(): Promise<Player[]> {
        return await PlayerService.getAllPlayers();
    }

    /**
     * Search players by name
     */
    static async searchPlayers(query: string): Promise<Player[]> {
        return await PlayerService.searchPlayersByName(query);
    }

    // ==================== Team Management ====================

    /**
     * Create a new team
     */
    static async createTeam(data: CreateTeamRequest): Promise<Team> {
        return await TeamService.createTeam(data);
    }

    /**
     * Get a team by ID
     */
    static async getTeam(id: string): Promise<Team | null> {
        return await TeamService.getTeam(id);
    }

    /**
     * Update a team
     */
    static async updateTeam(id: string, data: Partial<Team>): Promise<Team> {
        return await TeamService.updateTeam(id, data);
    }

    /**
     * Get all teams
     */
    static async getAllTeams(): Promise<Team[]> {
        return await TeamService.getAllTeams();
    }

    /**
     * Add a player to a team
     */
    static async addPlayerToTeam(teamId: string, playerId: string): Promise<void> {
        return await TeamService.addPlayerToTeam(teamId, playerId);
    }

    /**
     * Get team players
     */
    static async getTeamPlayers(teamId: string): Promise<Player[]> {
        return await TeamService.getTeamPlayers(teamId);
    }

    // ==================== Statistics ====================

    /**
     * Calculate batting stats for a player
     */
    static async calculateBattingStats(playerId: string, matchId?: string): Promise<BattingStats> {
        return await StatsService.calculateBattingStats(playerId, matchId);
    }

    /**
     * Calculate bowling stats for a player
     */
    static async calculateBowlingStats(playerId: string, matchId?: string): Promise<BowlingStats> {
        return await StatsService.calculateBowlingStats(playerId, matchId);
    }

    /**
     * Update player stats (recalculate from all events)
     */
    static async updatePlayerStats(playerId: string): Promise<void> {
        return await StatsService.updatePlayerStats(playerId);
    }

    /**
     * Get match stats for a specific player
     */
    static async getMatchStats(matchId: string, playerId: string): Promise<MatchStats> {
        return await StatsService.getMatchStats(matchId, playerId);
    }

    /**
     * Get player history (all ball events)
     */
    static async getPlayerHistory(playerId: string): Promise<BallEvent[]> {
        return await PlayerService.getPlayerHistory(playerId);
    }

    // ==================== Utility Methods ====================

    /**
     * Clear all cricket data (use with caution!)
     */
    static async clearAllData(): Promise<void> {
        await db.clear('players');
        await db.clear('teams');
        await db.clear('matches');
        await db.clear('ballEvents');
        console.log('All cricket data cleared');
    }

    /**
     * Export all data as JSON (for backup/AI training)
     */
    static async exportData(): Promise<{
        players: Player[];
        teams: Team[];
        matches: Match[];
        ballEvents: BallEvent[];
    }> {
        const [players, teams, matches, ballEvents] = await Promise.all([
            db.getAll('players'),
            db.getAll('teams'),
            db.getAll('matches'),
            db.getAll('ballEvents'),
        ]);

        return { players, teams, matches, ballEvents };
    }

    /**
     * Get database statistics
     */
    static async getDBStats(): Promise<{
        playerCount: number;
        teamCount: number;
        matchCount: number;
        eventCount: number;
    }> {
        const [playerCount, teamCount, matchCount, eventCount] = await Promise.all([
            db.count('players'),
            db.count('teams'),
            db.count('matches'),
            db.count('ballEvents'),
        ]);

        return { playerCount, teamCount, matchCount, eventCount };
    }
}

// Export everything for convenience
export * from './types';
export * from './storage';
export * from './services';
