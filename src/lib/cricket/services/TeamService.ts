/**
 * Team Service
 * 
 * Manages team CRUD operations and player assignments.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../storage/indexedDB';
import type { Team, CreateTeamRequest, PartialTeam } from '../types';
import { PlayerService } from './PlayerService';

export class TeamService {
    /**
     * Create a new team
     */
    static async createTeam(data: CreateTeamRequest): Promise<Team> {
        const team: Team = {
            id: uuidv4(),
            name: data.name,
            playerIds: data.playerIds || [],
            matchHistory: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await db.add('teams', team);

        // Update players' teamId if provided
        if (data.playerIds && data.playerIds.length > 0) {
            for (const playerId of data.playerIds) {
                await PlayerService.updatePlayer(playerId, { teamId: team.id });
            }
        }

        return team;
    }

    /**
     * Get a team by ID
     */
    static async getTeam(id: string): Promise<Team | null> {
        return await db.get('teams', id);
    }

    /**
     * Update a team
     */
    static async updateTeam(id: string, data: PartialTeam): Promise<Team> {
        const existing = await this.getTeam(id);
        if (!existing) {
            throw new Error(`Team with ID ${id} not found`);
        }

        const updated: Team = {
            ...existing,
            ...data,
            id: existing.id,
            updatedAt: Date.now(),
        };

        await db.update('teams', updated);
        return updated;
    }

    /**
     * Delete a team
     */
    static async deleteTeam(id: string): Promise<void> {
        // Remove team reference from all players
        const players = await PlayerService.getPlayersByTeam(id);
        for (const player of players) {
            await PlayerService.updatePlayer(player.id, { teamId: null });
        }

        await db.delete('teams', id);
    }

    /**
     * Get all teams
     */
    static async getAllTeams(): Promise<Team[]> {
        return await db.getAll('teams');
    }

    /**
     * Add a player to a team
     */
    static async addPlayerToTeam(teamId: string, playerId: string): Promise<void> {
        const team = await this.getTeam(teamId);
        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        if (!team.playerIds.includes(playerId)) {
            team.playerIds.push(playerId);
            await this.updateTeam(teamId, { playerIds: team.playerIds });
            await PlayerService.updatePlayer(playerId, { teamId });
        }
    }

    /**
     * Remove a player from a team
     */
    static async removePlayerFromTeam(teamId: string, playerId: string): Promise<void> {
        const team = await this.getTeam(teamId);
        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        const playerIds = team.playerIds.filter(id => id !== playerId);
        await this.updateTeam(teamId, { playerIds });
        await PlayerService.updatePlayer(playerId, { teamId: null });
    }

    /**
     * Get team players with full details
     */
    static async getTeamPlayers(teamId: string): Promise<import('../types').Player[]> {
        return await PlayerService.getPlayersByTeam(teamId);
    }

    /**
     * Add match to team history
     */
    static async addMatchToHistory(teamId: string, matchId: string): Promise<void> {
        const team = await this.getTeam(teamId);
        if (!team) {
            throw new Error(`Team with ID ${teamId} not found`);
        }

        if (!team.matchHistory.includes(matchId)) {
            team.matchHistory.push(matchId);
            await this.updateTeam(teamId, { matchHistory: team.matchHistory });
        }
    }
}
