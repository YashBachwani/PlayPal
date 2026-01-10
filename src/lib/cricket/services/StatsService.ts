/**
 * Stats Service
 * 
 * Calculates and aggregates cricket statistics.
 */

import { db } from '../storage/indexedDB';
import type { BattingStats, BowlingStats, MatchStats, MatchSummary, Player } from '../types';
import { BallEventService } from './BallEventService';
import { MatchService } from './MatchService';
import { PlayerService } from './PlayerService';
import { TeamService } from './TeamService';

export class StatsService {
    /**
     * Calculate batting stats for a player
     */
    static async calculateBattingStats(
        playerId: string,
        matchId?: string
    ): Promise<BattingStats> {
        const events = matchId
            ? (await BallEventService.getMatchEvents(matchId)).filter(e => e.batsmanId === playerId)
            : await BallEventService.getBatsmanEvents(playerId);

        const stats: BattingStats = {
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
        };

        if (events.length === 0) return stats;

        // Group by match to count innings
        const matchGroups = new Map<string, typeof events>();
        events.forEach(event => {
            if (!matchGroups.has(event.matchId)) {
                matchGroups.set(event.matchId, []);
            }
            matchGroups.get(event.matchId)!.push(event);
        });

        stats.matchesPlayed = matchGroups.size;
        stats.innings = matchGroups.size; // Simplified - one innings per match

        // Calculate totals
        events.forEach(event => {
            stats.runs += event.runs;
            stats.balls++;
            if (event.runs === 4) stats.fours++;
            if (event.runs === 6) stats.sixes++;
        });

        // Calculate highest score per innings
        matchGroups.forEach(matchEvents => {
            const inningsRuns = matchEvents.reduce((sum, e) => sum + e.runs, 0);
            if (inningsRuns > stats.highestScore) {
                stats.highestScore = inningsRuns;
            }

            // Check if player was not out
            const wasOut = matchEvents.some(e => e.isWicket && e.dismissedPlayerId === playerId);
            if (!wasOut) stats.notOuts++;
        });

        // Calculate derived stats
        stats.strikeRate = stats.balls > 0 ? (stats.runs / stats.balls) * 100 : 0;
        const dismissals = stats.innings - stats.notOuts;
        stats.average = dismissals > 0 ? stats.runs / dismissals : stats.runs;

        return stats;
    }

    /**
     * Calculate bowling stats for a player
     */
    static async calculateBowlingStats(
        playerId: string,
        matchId?: string
    ): Promise<BowlingStats> {
        const events = matchId
            ? (await BallEventService.getMatchEvents(matchId)).filter(e => e.bowlerId === playerId)
            : await BallEventService.getBowlerEvents(playerId);

        const stats: BowlingStats = {
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
        };

        if (events.length === 0) return stats;

        // Group by match
        const matchGroups = new Map<string, typeof events>();
        events.forEach(event => {
            if (!matchGroups.has(event.matchId)) {
                matchGroups.set(event.matchId, []);
            }
            matchGroups.get(event.matchId)!.push(event);
        });

        stats.matchesPlayed = matchGroups.size;
        stats.innings = matchGroups.size;

        // Calculate totals
        events.forEach(event => {
            stats.balls++;
            stats.runs += event.runs + event.extras;
            if (event.isWicket) stats.wickets++;
        });

        stats.overs = Math.floor(stats.balls / 6) + (stats.balls % 6) / 10;

        // Calculate maidens (overs with 0 runs)
        matchGroups.forEach(matchEvents => {
            const overGroups = new Map<number, typeof events>();
            matchEvents.forEach(event => {
                if (!overGroups.has(event.over)) {
                    overGroups.set(event.over, []);
                }
                overGroups.get(event.over)!.push(event);
            });

            overGroups.forEach(overEvents => {
                if (overEvents.length === 6) {
                    const runsInOver = overEvents.reduce((sum, e) => sum + e.runs + e.extras, 0);
                    if (runsInOver === 0) stats.maidens++;
                }
            });
        });

        // Calculate derived stats
        stats.economy = stats.overs > 0 ? stats.runs / stats.overs : 0;
        stats.average = stats.wickets > 0 ? stats.runs / stats.wickets : 0;

        // Find best figures
        let bestWickets = 0;
        let bestRuns = 999;
        matchGroups.forEach(matchEvents => {
            const wickets = matchEvents.filter(e => e.isWicket).length;
            const runs = matchEvents.reduce((sum, e) => sum + e.runs + e.extras, 0);

            if (wickets > bestWickets || (wickets === bestWickets && runs < bestRuns)) {
                bestWickets = wickets;
                bestRuns = runs;
            }
        });
        stats.bestFigures = `${bestWickets}/${bestRuns}`;

        return stats;
    }

    /**
     * Update player stats (both batting and bowling)
     */
    static async updatePlayerStats(playerId: string): Promise<void> {
        const battingStats = await this.calculateBattingStats(playerId);
        const bowlingStats = await this.calculateBowlingStats(playerId);

        await PlayerService.updatePlayer(playerId, {
            battingStats,
            bowlingStats,
        });
    }

    /**
     * Get match statistics for a player
     */
    static async getMatchStats(matchId: string, playerId: string): Promise<MatchStats> {
        const battingStats = await this.calculateBattingStats(playerId, matchId);
        const bowlingStats = await this.calculateBowlingStats(playerId, matchId);

        const events = await BallEventService.getMatchEvents(matchId);
        const batsmanEvents = events.filter(e => e.batsmanId === playerId);
        const isOut = batsmanEvents.some(e => e.isWicket && e.dismissedPlayerId === playerId);
        const dismissal = isOut
            ? batsmanEvents.find(e => e.isWicket && e.dismissedPlayerId === playerId)?.wicketType
            : undefined;

        return {
            matchId,
            playerId,
            batting: batsmanEvents.length > 0 ? {
                runs: battingStats.runs,
                balls: battingStats.balls,
                fours: battingStats.fours,
                sixes: battingStats.sixes,
                strikeRate: battingStats.strikeRate,
                isOut,
                dismissal,
            } : undefined,
            bowling: events.filter(e => e.bowlerId === playerId).length > 0 ? {
                overs: bowlingStats.overs,
                runs: bowlingStats.runs,
                wickets: bowlingStats.wickets,
                economy: bowlingStats.economy,
            } : undefined,
        };
    }

    /**
     * Get match summary
     */
    static async getMatchSummary(matchId: string): Promise<MatchSummary> {
        const match = await MatchService.getMatch(matchId);
        if (!match) {
            throw new Error(`Match with ID ${matchId} not found`);
        }

        const teamAPlayers = await TeamService.getTeamPlayers(match.teamAId);
        const teamBPlayers = await TeamService.getTeamPlayers(match.teamBId);
        const events = await BallEventService.getMatchEvents(matchId);

        const totalBalls = events.length;
        const totalRuns = events.reduce((sum, e) => sum + e.runs + e.extras, 0);
        const totalWickets = events.filter(e => e.isWicket).length;

        // Determine winner
        let winner: 'TEAM_A' | 'TEAM_B' | 'DRAW' | null = null;
        let winMargin: string | undefined;

        if (match.status === 'COMPLETED') {
            if (match.teamAScore > match.teamBScore) {
                winner = 'TEAM_A';
                winMargin = `by ${match.teamAScore - match.teamBScore} runs`;
            } else if (match.teamBScore > match.teamAScore) {
                winner = 'TEAM_B';
                const wicketsRemaining = 10 - match.teamBWickets;
                winMargin = `by ${wicketsRemaining} wickets`;
            } else {
                winner = 'DRAW';
            }
        }

        return {
            match,
            teamAPlayers,
            teamBPlayers,
            totalBalls,
            totalRuns,
            totalWickets,
            winner,
            winMargin,
        };
    }
}
