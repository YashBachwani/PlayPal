/**
 * Cricket Data Layer - Example Integration
 * 
 * This file demonstrates how to use the Cricket Data Layer in your application.
 * Copy this code into your components as needed.
 */

import { CricketDataLayer, PlayerRole, EventSource, BallOutcome } from '@/lib/cricket';

/**
 * Example 1: Initialize the data layer (call once on app start)
 */
export async function initializeCricketData() {
    try {
        await CricketDataLayer.initialize();
        console.log('Cricket Data Layer ready!');
    } catch (error) {
        console.error('Failed to initialize Cricket Data Layer:', error);
    }
}

/**
 * Example 2: Create teams and players
 */
export async function setupTeamsAndPlayers() {
    // Create Team A
    const teamA = await CricketDataLayer.createTeam({
        name: 'Team A',
    });

    // Create Team B
    const teamB = await CricketDataLayer.createTeam({
        name: 'Team B',
    });

    // Create players for Team A
    const playerA1 = await CricketDataLayer.createPlayer({
        name: 'Player A1',
        role: PlayerRole.BATSMAN,
        teamId: teamA.id,
    });

    const playerA2 = await CricketDataLayer.createPlayer({
        name: 'Player A2',
        role: PlayerRole.BOWLER,
        teamId: teamA.id,
    });

    // Create players for Team B
    const playerB1 = await CricketDataLayer.createPlayer({
        name: 'Player B1',
        role: PlayerRole.ALL_ROUNDER,
        teamId: teamB.id,
    });

    const playerB2 = await CricketDataLayer.createPlayer({
        name: 'Player B2',
        role: PlayerRole.WICKET_KEEPER,
        teamId: teamB.id,
    });

    return { teamA, teamB, playerA1, playerA2, playerB1, playerB2 };
}

/**
 * Example 3: Create and start a match
 */
export async function createAndStartMatch(teamAId: string, teamBId: string) {
    // Create match
    const match = await CricketDataLayer.createMatch({
        teamAId,
        teamBId,
        venue: {
            name: 'Elite Cricket Arena',
            location: 'Mumbai',
            pitchType: 'HARD',
            weather: 'SUNNY',
            boundaryDistance: 70,
        },
        totalOvers: 20,
    });

    // Start the match
    await CricketDataLayer.startMatch(match.id);

    return match;
}

/**
 * Example 4: Log ball events (from camera detection)
 */
export async function logCameraDetectedBoundary(
    matchId: string,
    batsmanId: string,
    bowlerId: string,
    runs: 4 | 6,
    confidence: number
) {
    const event = await CricketDataLayer.logBallEvent({
        matchId,
        batsmanId,
        bowlerId,
        runs,
        extras: 0,
        outcome: BallOutcome.RUNS,
        isWicket: false,
        source: EventSource.CAMERA_DETECTION,
        metadata: {
            confidence,
            detectedBy: 'coco-ssd',
        },
    });

    // Update player stats after each ball
    await CricketDataLayer.updatePlayerStats(batsmanId);
    await CricketDataLayer.updatePlayerStats(bowlerId);

    return event;
}

/**
 * Example 5: Log manual ball event
 */
export async function logManualBallEvent(
    matchId: string,
    batsmanId: string,
    bowlerId: string,
    runs: number
) {
    const event = await CricketDataLayer.logBallEvent({
        matchId,
        batsmanId,
        bowlerId,
        runs,
        extras: 0,
        outcome: BallOutcome.RUNS,
        isWicket: false,
        source: EventSource.MANUAL_INPUT,
    });

    await CricketDataLayer.updatePlayerStats(batsmanId);
    await CricketDataLayer.updatePlayerStats(bowlerId);

    return event;
}

/**
 * Example 6: Finish match and get summary
 */
export async function finishMatchAndGetSummary(matchId: string) {
    // Finish the match
    await CricketDataLayer.finishMatch(matchId);

    // Get full match summary
    const summary = await CricketDataLayer.getMatchSummary(matchId);

    console.log('Match Summary:', {
        winner: summary.winner,
        winMargin: summary.winMargin,
        teamAScore: summary.match.teamAScore,
        teamBScore: summary.match.teamBScore,
        totalBalls: summary.totalBalls,
    });

    return summary;
}

/**
 * Example 7: Get player statistics
 */
export async function getPlayerStats(playerId: string) {
    const player = await CricketDataLayer.getPlayer(playerId);
    if (!player) return null;

    console.log('Player Stats:', {
        name: player.name,
        batting: player.battingStats,
        bowling: player.bowlingStats,
    });

    return player;
}

/**
 * Example 8: Export all data for AI training
 */
export async function exportDataForAI() {
    const data = await CricketDataLayer.exportData();

    // Convert to JSON and download
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `cricket-data-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * Example 9: Get database statistics
 */
export async function getDatabaseStats() {
    const stats = await CricketDataLayer.getDBStats();
    console.log('Database Stats:', stats);
    return stats;
}

/**
 * Example 10: Complete workflow for a match
 */
export async function completeMatchWorkflow() {
    // 1. Initialize
    await initializeCricketData();

    // 2. Setup teams and players
    const { teamA, teamB, playerA1, playerB1 } = await setupTeamsAndPlayers();

    // 3. Create and start match
    const match = await createAndStartMatch(teamA.id, teamB.id);

    // 4. Log some ball events
    await logCameraDetectedBoundary(match.id, playerA1.id, playerB1.id, 6, 0.95);
    await logManualBallEvent(match.id, playerA1.id, playerB1.id, 1);
    await logCameraDetectedBoundary(match.id, playerA1.id, playerB1.id, 4, 0.88);

    // 5. Finish match and get summary
    const summary = await finishMatchAndGetSummary(match.id);

    // 6. Get player stats
    await getPlayerStats(playerA1.id);

    // 7. Export data
    await exportDataForAI();

    return summary;
}
