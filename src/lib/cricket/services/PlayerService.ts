/**
 * Player Service
 * 
 * Manages player CRUD operations and queries.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../storage/indexedDB';
import type { Player, CreatePlayerRequest, PartialPlayer, BallEvent } from '../types';
import { createEmptyBattingStats, createEmptyBowlingStats } from '../types';

export class PlayerService {
    /**
     * Create a new player
     */
    static async createPlayer(data: CreatePlayerRequest): Promise<Player> {
        const player: Player = {
            id: uuidv4(),
            name: data.name,
            role: data.role,
            teamId: data.teamId || null,
            battingStats: createEmptyBattingStats(),
            bowlingStats: createEmptyBowlingStats(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        await db.add('players', player);
        return player;
    }

    /**
     * Get a player by ID
     */
    static async getPlayer(id: string): Promise<Player | null> {
        return await db.get('players', id);
    }

    /**
     * Update a player
     */
    static async updatePlayer(id: string, data: PartialPlayer): Promise<Player> {
        const existing = await this.getPlayer(id);
        if (!existing) {
            throw new Error(`Player with ID ${id} not found`);
        }

        const updated: Player = {
            ...existing,
            ...data,
            id: existing.id, // Ensure ID doesn't change
            updatedAt: Date.now(),
        };

        await db.update('players', updated);
        return updated;
    }

    /**
     * Delete a player
     */
    static async deletePlayer(id: string): Promise<void> {
        await db.delete('players', id);
    }

    /**
     * Get all players
     */
    static async getAllPlayers(): Promise<Player[]> {
        return await db.getAll('players');
    }

    /**
     * Get players by team
     */
    static async getPlayersByTeam(teamId: string): Promise<Player[]> {
        return await db.queryByIndex('players', 'teamId', teamId);
    }

    /**
     * Get player history (all ball events involving this player)
     */
    static async getPlayerHistory(playerId: string): Promise<BallEvent[]> {
        const asBatsman = await db.queryByIndex('ballEvents', 'batsmanId', playerId);
        const asBowler = await db.queryByIndex('ballEvents', 'bowlerId', playerId);

        // Combine and sort by timestamp
        const combined = [...asBatsman, ...asBowler];
        return combined.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Search players by name
     */
    static async searchPlayersByName(query: string): Promise<Player[]> {
        const allPlayers = await this.getAllPlayers();
        const lowerQuery = query.toLowerCase();
        return allPlayers.filter(p => p.name.toLowerCase().includes(lowerQuery));
    }
}
