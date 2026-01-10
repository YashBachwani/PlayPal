/**
 * Match Service
 * 
 * Manages match lifecycle and state.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../storage/indexedDB';
import { saveCurrentMatchId, loadCurrentMatchId } from '../storage/localStorage';
import type { Match, CreateMatchRequest, PartialMatch, MatchStatus, VenueConditions } from '../types';
import { TeamService } from './TeamService';

export class MatchService {
    /**
     * Create a new match
     */
    static async createMatch(data: CreateMatchRequest): Promise<Match> {
        const match: Match = {
            id: uuidv4(),
            teamAId: data.teamAId,
            teamBId: data.teamBId,
            venue: data.venue,
            status: 'NOT_STARTED' as MatchStatus,
            currentInnings: 1,
            battingTeamId: data.teamAId, // Team A bats first by default
            bowlingTeamId: data.teamBId,
            currentBatsmanId: null,
            currentBowlerId: null,
            totalOvers: data.totalOvers || 20,
            currentOver: 0,
            currentBall: 0,
            teamAScore: 0,
            teamBScore: 0,
            teamAWickets: 0,
            teamBWickets: 0,
            startTime: null,
            endTime: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await db.add('matches', match);

        // Add to team histories
        await TeamService.addMatchToHistory(data.teamAId, match.id);
        await TeamService.addMatchToHistory(data.teamBId, match.id);

        // Set as current match
        saveCurrentMatchId(match.id);

        return match;
    }

    /**
     * Get a match by ID
     */
    static async getMatch(id: string): Promise<Match | null> {
        return await db.get('matches', id);
    }

    /**
     * Update a match
     */
    static async updateMatch(id: string, data: PartialMatch): Promise<Match> {
        const existing = await this.getMatch(id);
        if (!existing) {
            throw new Error(`Match with ID ${id} not found`);
        }

        const updated: Match = {
            ...existing,
            ...data,
            id: existing.id,
            updatedAt: Date.now(),
        };

        await db.update('matches', updated);
        return updated;
    }

    /**
     * Update match status
     */
    static async updateMatchStatus(id: string, status: MatchStatus): Promise<void> {
        const updates: PartialMatch = { status };

        if (status === 'IN_PROGRESS' && !(await this.getMatch(id))?.startTime) {
            updates.startTime = Date.now();
        }

        if (status === 'COMPLETED' || status === 'ABANDONED') {
            updates.endTime = Date.now();
            saveCurrentMatchId(null); // Clear current match
        }

        await this.updateMatch(id, updates);
    }

    /**
     * Get current match
     */
    static async getCurrentMatch(): Promise<Match | null> {
        const matchId = loadCurrentMatchId();
        if (!matchId) return null;
        return await this.getMatch(matchId);
    }

    /**
     * Start a match
     */
    static async startMatch(id: string): Promise<void> {
        await this.updateMatchStatus(id, 'IN_PROGRESS');
    }

    /**
     * Finish a match
     */
    static async finishMatch(id: string): Promise<void> {
        await this.updateMatchStatus(id, 'COMPLETED');
    }

    /**
     * Get all matches
     */
    static async getAllMatches(): Promise<Match[]> {
        return await db.getAll('matches');
    }

    /**
     * Get matches by status
     */
    static async getMatchesByStatus(status: MatchStatus): Promise<Match[]> {
        return await db.queryByIndex('matches', 'status', status);
    }

    /**
     * Get team matches
     */
    static async getTeamMatches(teamId: string): Promise<Match[]> {
        const asTeamA = await db.queryByIndex('matches', 'teamAId', teamId);
        const asTeamB = await db.queryByIndex('matches', 'teamBId', teamId);

        const combined = [...asTeamA, ...asTeamB];
        return combined.sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * Update score
     */
    static async updateScore(matchId: string, runs: number, isWicket: boolean = false): Promise<void> {
        const match = await this.getMatch(matchId);
        if (!match) {
            throw new Error(`Match with ID ${matchId} not found`);
        }

        const updates: PartialMatch = {};

        // Update score for batting team
        if (match.battingTeamId === match.teamAId) {
            updates.teamAScore = match.teamAScore + runs;
            if (isWicket) {
                updates.teamAWickets = match.teamAWickets + 1;
            }
        } else {
            updates.teamBScore = match.teamBScore + runs;
            if (isWicket) {
                updates.teamBWickets = match.teamBWickets + 1;
            }
        }

        await this.updateMatch(matchId, updates);
    }

    /**
     * Advance ball count
     */
    static async advanceBall(matchId: string): Promise<void> {
        const match = await this.getMatch(matchId);
        if (!match) {
            throw new Error(`Match with ID ${matchId} not found`);
        }

        let { currentOver, currentBall } = match;
        currentBall++;

        if (currentBall >= 6) {
            currentBall = 0;
            currentOver++;
        }

        await this.updateMatch(matchId, { currentOver, currentBall });
    }
}
