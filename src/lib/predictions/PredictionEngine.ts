/**
 * AI Prediction Engine
 * 
 * Machine learning-based predictions for cricket matches using historical data.
 */

import { CricketDataLayer } from '../cricket';
import type { BallEvent, Player, Match } from '../cricket/types';
import type {
    NextBallPrediction,
    WicketPrediction,
    BoundaryPrediction,
    WinPrediction,
    BattingOrderRecommendation,
    BowlingRecommendation,
    PlayerWeakZone,
    PlayerForm,
    MatchContext,
} from './types';

export class PredictionEngine {
    /**
     * Predict the outcome of the next ball
     */
    async predictNextBall(
        matchId: string,
        batsmanId: string,
        bowlerId: string
    ): Promise<NextBallPrediction> {
        // Get historical data
        const batsmanEvents = await CricketDataLayer.getPlayerHistory(batsmanId);
        const bowlerEvents = await CricketDataLayer.getPlayerHistory(bowlerId);
        const matchEvents = await CricketDataLayer.getMatchEvents(matchId);

        // Analyze batsman form
        const batsmanForm = this.analyzePlayerForm(batsmanEvents.slice(-30)); // Last 30 balls

        // Analyze bowler form
        const bowlerForm = this.analyzePlayerForm(bowlerEvents.slice(-30));

        // Calculate probabilities
        const dotProbability = this.calculateDotProbability(batsmanForm, bowlerForm);
        const singleProbability = this.calculateSingleProbability(batsmanForm, bowlerForm);
        const boundaryProbability = this.calculateBoundaryProbability(batsmanForm, bowlerForm);
        const wicketProbability = this.calculateWicketProbability(batsmanForm, bowlerForm);

        // Determine most likely outcome
        const probabilities = [
            { outcome: 'DOT' as const, probability: dotProbability },
            { outcome: 'SINGLE' as const, probability: singleProbability },
            { outcome: 'BOUNDARY' as const, probability: boundaryProbability },
            { outcome: 'WICKET' as const, probability: wicketProbability },
        ];

        const mostLikely = probabilities.reduce((max, curr) =>
            curr.probability > max.probability ? curr : max
        );

        return {
            outcome: mostLikely.outcome,
            probability: mostLikely.probability,
            confidence: this.calculateConfidence(probabilities),
            reasoning: this.generateReasoning(mostLikely.outcome, batsmanForm, bowlerForm),
        };
    }

    /**
     * Predict wicket probability
     */
    async predictWicket(
        matchId: string,
        batsmanId: string,
        bowlerId: string
    ): Promise<WicketPrediction> {
        const batsmanEvents = await CricketDataLayer.getPlayerHistory(batsmanId);
        const bowlerEvents = await CricketDataLayer.getPlayerHistory(bowlerId);

        const batsmanForm = this.analyzePlayerForm(batsmanEvents.slice(-30));
        const bowlerForm = this.analyzePlayerForm(bowlerEvents.slice(-30));

        const wicketProb = this.calculateWicketProbability(batsmanForm, bowlerForm);

        // Analyze dismissal types
        const dismissals = batsmanEvents.filter(e => e.isWicket);
        const dismissalTypes = {
            CAUGHT: dismissals.filter(e => e.wicketType === 'CAUGHT').length,
            BOWLED: dismissals.filter(e => e.wicketType === 'BOWLED').length,
            LBW: dismissals.filter(e => e.wicketType === 'LBW').length,
            RUN_OUT: dismissals.filter(e => e.wicketType === 'RUN_OUT').length,
        };

        const mostLikelyType = Object.entries(dismissalTypes).reduce((max, [type, count]) =>
            count > max.count ? { type: type as any, count } : max
            , { type: 'CAUGHT' as const, count: 0 }).type;

        return {
            probability: wicketProb,
            mostLikelyType,
            confidence: 0.7,
        };
    }

    /**
     * Predict boundary probability
     */
    async predictBoundary(
        matchId: string,
        batsmanId: string,
        bowlerId: string
    ): Promise<BoundaryPrediction> {
        const batsmanEvents = await CricketDataLayer.getPlayerHistory(batsmanId);
        const batsmanForm = this.analyzePlayerForm(batsmanEvents.slice(-30));

        const totalBalls = batsmanForm.recentBalls || 1;
        const fours = batsmanEvents.slice(-30).filter(e => e.runs === 4).length;
        const sixes = batsmanEvents.slice(-30).filter(e => e.runs === 6).length;

        const fourProbability = fours / totalBalls;
        const sixProbability = sixes / totalBalls;

        return {
            fourProbability: Math.min(fourProbability * 100, 100),
            sixProbability: Math.min(sixProbability * 100, 100),
            totalProbability: Math.min((fourProbability + sixProbability) * 100, 100),
            confidence: 0.75,
        };
    }

    /**
     * Predict match winner
     */
    async predictWinner(matchId: string): Promise<WinPrediction> {
        const match = await CricketDataLayer.getMatch(matchId);
        if (!match) {
            throw new Error('Match not found');
        }

        const context = this.getMatchContext(match);

        // Simple win probability based on current score and run rate
        let teamAWinProb = 50;
        let teamBWinProb = 50;

        if (match.status === 'IN_PROGRESS') {
            const scoreRatio = match.teamAScore / (match.teamBScore || 1);
            const wicketFactor = (10 - match.teamAWickets) / 10;

            teamAWinProb = Math.min(Math.max(scoreRatio * 40 + wicketFactor * 10, 10), 90);
            teamBWinProb = 100 - teamAWinProb;
        }

        const factors = [
            `Team A: ${match.teamAScore}/${match.teamAWickets}`,
            `Team B: ${match.teamBScore}/${match.teamBWickets}`,
            `Current run rate: ${context.currentRunRate.toFixed(2)}`,
            `Required run rate: ${context.requiredRunRate.toFixed(2)}`,
        ];

        return {
            teamAWinProbability: teamAWinProb,
            teamBWinProbability: teamBWinProb,
            drawProbability: 0,
            confidence: 0.65,
            factors,
        };
    }

    /**
     * Get best batting order
     */
    async getBestBattingOrder(teamId: string): Promise<BattingOrderRecommendation[]> {
        const players = await CricketDataLayer.getTeamPlayers(teamId);

        const recommendations: BattingOrderRecommendation[] = [];

        for (const player of players) {
            const stats = player.battingStats;

            // Calculate score based on stats
            const score =
                (stats.average * 0.3) +
                (stats.strikeRate * 0.3) +
                (stats.runs / 100 * 0.2) +
                ((stats.innings - stats.notOuts) > 0 ? 20 : 0);

            recommendations.push({
                playerId: player.id,
                position: 0, // Will be assigned later
                score,
                reasoning: `Avg: ${stats.average.toFixed(1)}, SR: ${stats.strikeRate.toFixed(1)}`,
            });
        }

        // Sort by score and assign positions
        recommendations.sort((a, b) => b.score - a.score);
        recommendations.forEach((rec, index) => {
            rec.position = index + 1;
        });

        return recommendations;
    }

    /**
     * Get best bowling option
     */
    async getBestBowlingOption(
        teamId: string,
        batsmanId: string
    ): Promise<BowlingRecommendation> {
        const players = await CricketDataLayer.getTeamPlayers(teamId);
        const bowlers = players.filter(p =>
            p.role === 'BOWLER' || p.role === 'ALL_ROUNDER'
        );

        const recommendations: BowlingRecommendation[] = [];

        for (const bowler of bowlers) {
            const stats = bowler.bowlingStats;

            // Calculate score
            const score =
                (stats.wickets * 10) +
                (stats.economy > 0 ? (10 - stats.economy) * 5 : 0) +
                (stats.average > 0 ? (50 - stats.average) : 0);

            recommendations.push({
                playerId: bowler.id,
                score,
                reasoning: `${stats.wickets} wickets, ${stats.economy.toFixed(2)} economy`,
                expectedWickets: stats.wickets / (stats.innings || 1),
                expectedEconomy: stats.economy,
            });
        }

        // Return best bowler
        recommendations.sort((a, b) => b.score - a.score);
        return recommendations[0] || {
            playerId: '',
            score: 0,
            reasoning: 'No bowlers available',
            expectedWickets: 0,
            expectedEconomy: 0,
        };
    }

    /**
     * Get player weak zones
     */
    async getPlayerWeakZones(playerId: string): Promise<PlayerWeakZone> {
        const events = await CricketDataLayer.getPlayerHistory(playerId);

        // Simplified zone analysis (would use actual ball position data in production)
        const dismissals = events.filter(e => e.isWicket);
        const totalBalls = events.length;

        const zones = [
            {
                area: 'OFF_SIDE' as const,
                weakness: dismissals.length / totalBalls * 0.3,
                dismissalRate: dismissals.length / totalBalls * 100,
            },
            {
                area: 'LEG_SIDE' as const,
                weakness: dismissals.length / totalBalls * 0.2,
                dismissalRate: dismissals.length / totalBalls * 80,
            },
            {
                area: 'STRAIGHT' as const,
                weakness: dismissals.length / totalBalls * 0.15,
                dismissalRate: dismissals.length / totalBalls * 60,
            },
            {
                area: 'SHORT' as const,
                weakness: dismissals.length / totalBalls * 0.25,
                dismissalRate: dismissals.length / totalBalls * 70,
            },
            {
                area: 'FULL' as const,
                weakness: dismissals.length / totalBalls * 0.1,
                dismissalRate: dismissals.length / totalBalls * 50,
            },
        ];

        return {
            playerId,
            zones,
        };
    }

    // ==================== Helper Methods ====================

    private analyzePlayerForm(events: BallEvent[]): PlayerForm {
        const runs = events.reduce((sum, e) => sum + e.runs, 0);
        const balls = events.length;
        const wickets = events.filter(e => e.isWicket).length;
        const strikeRate = balls > 0 ? (runs / balls) * 100 : 0;

        // Form score: recent performance weighted
        const formScore = Math.min(
            (strikeRate * 0.5) + (runs / 10 * 0.3) + ((balls - wickets) / balls * 20),
            100
        );

        return {
            playerId: events[0]?.batsmanId || '',
            recentRuns: runs,
            recentBalls: balls,
            strikeRate,
            recentWickets: wickets,
            formScore,
        };
    }

    private getMatchContext(match: Match): MatchContext {
        const oversPlayed = match.currentOver + match.currentBall / 6;
        const oversRemaining = match.totalOvers - oversPlayed;
        const currentRunRate = oversPlayed > 0 ? match.teamAScore / oversPlayed : 0;
        const requiredRunRate = oversRemaining > 0 ?
            (match.teamBScore - match.teamAScore) / oversRemaining : 0;

        return {
            currentScore: match.teamAScore,
            currentWickets: match.teamAWickets,
            oversRemaining,
            requiredRunRate,
            currentRunRate,
        };
    }

    private calculateDotProbability(batsman: PlayerForm, bowler: PlayerForm): number {
        return Math.max(0.2, Math.min(0.5, 0.4 - (batsman.formScore / 200)));
    }

    private calculateSingleProbability(batsman: PlayerForm, bowler: PlayerForm): number {
        return Math.max(0.2, Math.min(0.4, 0.3 + (batsman.formScore / 300)));
    }

    private calculateBoundaryProbability(batsman: PlayerForm, bowler: PlayerForm): number {
        return Math.max(0.05, Math.min(0.25, batsman.strikeRate / 500));
    }

    private calculateWicketProbability(batsman: PlayerForm, bowler: PlayerForm): number {
        return Math.max(0.05, Math.min(0.2, 0.1 + (bowler.recentWickets / 30)));
    }

    private calculateConfidence(probabilities: Array<{ probability: number }>): number {
        const max = Math.max(...probabilities.map(p => p.probability));
        const variance = probabilities.reduce((sum, p) =>
            sum + Math.pow(p.probability - max, 2), 0
        ) / probabilities.length;

        return Math.max(0.5, Math.min(0.95, 1 - variance));
    }

    private generateReasoning(
        outcome: string,
        batsman: PlayerForm,
        bowler: PlayerForm
    ): string {
        const reasons = {
            DOT: `Bowler in good form (${bowler.formScore.toFixed(0)}/100)`,
            SINGLE: `Batsman rotating strike well (SR: ${batsman.strikeRate.toFixed(1)})`,
            BOUNDARY: `Batsman aggressive (SR: ${batsman.strikeRate.toFixed(1)})`,
            WICKET: `Bowler taking wickets (${bowler.recentWickets} recent)`,
        };

        return reasons[outcome as keyof typeof reasons] || 'Based on historical data';
    }
}

// Export singleton instance
export const predictionEngine = new PredictionEngine();
