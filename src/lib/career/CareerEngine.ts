/**
 * Player Career Engine
 * 
 * Track player statistics, rankings, and achievements across sessions.
 */

import { CricketDataLayer } from '../cricket';
import type { Player } from '../cricket/types';
import type {
    CareerStats,
    Leaderboard,
    LeaderboardEntry,
    LeaderboardCategory,
    PlayerRanking,
    Achievement,
    PlayerAchievements,
} from './types';

const CAREER_STORAGE_KEY = 'playpal_career_stats';
const LEADERBOARD_STORAGE_KEY = 'playpal_leaderboards';

export class CareerEngine {
    private careerStats: Map<string, CareerStats> = new Map();
    private leaderboards: Map<LeaderboardCategory, Leaderboard> = new Map();

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Update player career stats after a match
     */
    async updatePlayerCareer(playerId: string): Promise<CareerStats> {
        const player = await CricketDataLayer.getPlayer(playerId);
        if (!player) {
            throw new Error('Player not found');
        }

        const stats = player.battingStats;
        const bowlingStats = player.bowlingStats;

        // Calculate AI rating
        const aiRating = this.calculateAIRating(player);
        const formRating = this.calculateFormRating(player);

        const careerStats: CareerStats = {
            playerId: player.id,
            playerName: player.name,

            // Batting
            totalMatches: stats.innings,
            totalRuns: stats.runs,
            totalBalls: stats.balls,
            strikeRate: stats.strikeRate,
            average: stats.average,
            highestScore: stats.highestScore,
            centuries: Math.floor(stats.highestScore / 100),
            halfCenturies: Math.floor(stats.highestScore / 50) - Math.floor(stats.highestScore / 100),
            fours: stats.fours,
            sixes: stats.sixes,

            // Bowling
            totalWickets: bowlingStats.wickets,
            bowlingAverage: bowlingStats.average,
            economy: bowlingStats.economy,
            bestFigures: `${bowlingStats.bestFigures.wickets}/${bowlingStats.bestFigures.runs}`,

            // Awards (would be tracked separately in production)
            mvpAwards: 0,
            playerOfMatch: 0,

            // AI Rating
            aiRating,
            formRating,

            // Metadata
            lastUpdated: Date.now(),
            createdAt: this.careerStats.get(playerId)?.createdAt || Date.now(),
        };

        this.careerStats.set(playerId, careerStats);
        this.saveToStorage();

        return careerStats;
    }

    /**
     * Get player career stats
     */
    getPlayerCareer(playerId: string): CareerStats | null {
        return this.careerStats.get(playerId) || null;
    }

    /**
     * Get leaderboard for a category
     */
    getLeaderboard(category: LeaderboardCategory): Leaderboard {
        // Update leaderboard
        this.updateLeaderboard(category);

        return this.leaderboards.get(category) || {
            category,
            entries: [],
            lastUpdated: Date.now(),
        };
    }

    /**
     * Get all leaderboards
     */
    getAllLeaderboards(): Leaderboard[] {
        const categories: LeaderboardCategory[] = [
            'RUNS',
            'WICKETS',
            'STRIKE_RATE',
            'AVERAGE',
            'AI_RATING',
            'MVP_AWARDS',
        ];

        return categories.map(category => this.getLeaderboard(category));
    }

    /**
     * Get player rankings
     */
    getPlayerRanking(playerId: string): PlayerRanking {
        const allPlayers = Array.from(this.careerStats.values());

        // Batting rank
        const battingRanked = [...allPlayers].sort((a, b) => b.totalRuns - a.totalRuns);
        const battingRank = battingRanked.findIndex(p => p.playerId === playerId) + 1;

        // Bowling rank
        const bowlingRanked = [...allPlayers].sort((a, b) => b.totalWickets - a.totalWickets);
        const bowlingRank = bowlingRanked.findIndex(p => p.playerId === playerId) + 1;

        // All-rounder rank (combined batting + bowling)
        const allRounderRanked = [...allPlayers].sort((a, b) => {
            const aScore = a.totalRuns + (a.totalWickets * 50);
            const bScore = b.totalRuns + (b.totalWickets * 50);
            return bScore - aScore;
        });
        const allRounderRank = allRounderRanked.findIndex(p => p.playerId === playerId) + 1;

        // Overall rank (AI rating)
        const overallRanked = [...allPlayers].sort((a, b) => b.aiRating - a.aiRating);
        const overallRank = overallRanked.findIndex(p => p.playerId === playerId) + 1;

        return {
            playerId,
            battingRank,
            bowlingRank,
            allRounderRank,
            overallRank,
        };
    }

    /**
     * Award MVP to a player
     */
    awardMVP(playerId: string): void {
        const stats = this.careerStats.get(playerId);
        if (stats) {
            stats.mvpAwards++;
            stats.playerOfMatch++;
            stats.lastUpdated = Date.now();
            this.careerStats.set(playerId, stats);
            this.saveToStorage();
        }
    }

    /**
     * Get top players
     */
    getTopPlayers(limit: number = 10): CareerStats[] {
        return Array.from(this.careerStats.values())
            .sort((a, b) => b.aiRating - a.aiRating)
            .slice(0, limit);
    }

    /**
     * Clear all career data
     */
    clearAllData(): void {
        this.careerStats.clear();
        this.leaderboards.clear();
        localStorage.removeItem(CAREER_STORAGE_KEY);
        localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
    }

    // ==================== Private Methods ====================

    /**
     * Calculate AI rating (0-1000)
     */
    private calculateAIRating(player: Player): number {
        const batting = player.battingStats;
        const bowling = player.bowlingStats;

        // Batting score (0-500)
        const battingScore = Math.min(
            (batting.average * 2) +
            (batting.strikeRate * 1.5) +
            (batting.runs / 10),
            500
        );

        // Bowling score (0-500)
        const bowlingScore = Math.min(
            (bowling.wickets * 20) +
            (bowling.economy > 0 ? (10 - bowling.economy) * 10 : 0) +
            (bowling.average > 0 ? (50 - bowling.average) * 2 : 0),
            500
        );

        return Math.round(battingScore + bowlingScore);
    }

    /**
     * Calculate form rating (0-100)
     */
    private calculateFormRating(player: Player): number {
        const batting = player.battingStats;

        // Recent performance (simplified)
        const formScore = Math.min(
            (batting.strikeRate / 2) +
            (batting.average / 2),
            100
        );

        return Math.round(formScore);
    }

    /**
     * Update leaderboard for a category
     */
    private updateLeaderboard(category: LeaderboardCategory): void {
        const allPlayers = Array.from(this.careerStats.values());

        // Sort by category
        let sorted: CareerStats[];
        switch (category) {
            case 'RUNS':
                sorted = [...allPlayers].sort((a, b) => b.totalRuns - a.totalRuns);
                break;
            case 'WICKETS':
                sorted = [...allPlayers].sort((a, b) => b.totalWickets - a.totalWickets);
                break;
            case 'STRIKE_RATE':
                sorted = [...allPlayers].sort((a, b) => b.strikeRate - a.strikeRate);
                break;
            case 'AVERAGE':
                sorted = [...allPlayers].sort((a, b) => b.average - a.average);
                break;
            case 'AI_RATING':
                sorted = [...allPlayers].sort((a, b) => b.aiRating - a.aiRating);
                break;
            case 'MVP_AWARDS':
                sorted = [...allPlayers].sort((a, b) => b.mvpAwards - a.mvpAwards);
                break;
            default:
                sorted = allPlayers;
        }

        // Create entries
        const entries: LeaderboardEntry[] = sorted.map((player, index) => {
            let value: number;
            switch (category) {
                case 'RUNS':
                    value = player.totalRuns;
                    break;
                case 'WICKETS':
                    value = player.totalWickets;
                    break;
                case 'STRIKE_RATE':
                    value = player.strikeRate;
                    break;
                case 'AVERAGE':
                    value = player.average;
                    break;
                case 'AI_RATING':
                    value = player.aiRating;
                    break;
                case 'MVP_AWARDS':
                    value = player.mvpAwards;
                    break;
                default:
                    value = 0;
            }

            return {
                rank: index + 1,
                playerId: player.playerId,
                playerName: player.playerName,
                value,
                change: 0, // Would track from previous leaderboard
            };
        });

        const leaderboard: Leaderboard = {
            category,
            entries: entries.slice(0, 50), // Top 50
            lastUpdated: Date.now(),
        };

        this.leaderboards.set(category, leaderboard);
        this.saveLeaderboards();
    }

    /**
     * Save to localStorage
     */
    private saveToStorage(): void {
        const data = Array.from(this.careerStats.entries());
        localStorage.setItem(CAREER_STORAGE_KEY, JSON.stringify(data));
    }

    /**
     * Load from localStorage
     */
    private loadFromStorage(): void {
        const saved = localStorage.getItem(CAREER_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            this.careerStats = new Map(data);
        }
    }

    /**
     * Save leaderboards to localStorage
     */
    private saveLeaderboards(): void {
        const data = Array.from(this.leaderboards.entries());
        localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(data));
    }

    /**
     * Load leaderboards from localStorage
     */
    private loadLeaderboards(): void {
        const saved = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            this.leaderboards = new Map(data);
        }
    }
}

// Export singleton instance
export const careerEngine = new CareerEngine();
