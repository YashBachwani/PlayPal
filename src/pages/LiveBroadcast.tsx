import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Zap, Target, Activity } from "lucide-react";
import { LiveScoringEngine } from "@/lib/scoring";
import type { LiveScore } from "@/lib/scoring";

const LiveBroadcast = () => {
    const [score, setScore] = useState<LiveScore | null>(null);
    const [ballSpeed, setBallSpeed] = useState(0);
    const [shotPower, setShotPower] = useState(0);
    const [winProbability, setWinProbability] = useState({ teamA: 50, teamB: 50 });
    const [prediction, setPrediction] = useState("Analyzing...");

    useEffect(() => {
        // Initialize scoring engine
        const engine = new LiveScoringEngine({
            matchId: "live-match",
            teamAId: "team-a",
            teamBId: "team-b",
        });

        // Load saved match or create new
        const saved = engine.loadFromLocalStorage();
        if (saved) {
            setScore(saved);
        }

        // Subscribe to score updates
        const unsubscribe = engine.onScoreUpdate((newScore) => {
            setScore(newScore);
            updateMetrics(newScore);
        });

        // Subscribe to event updates
        engine.onEventUpdate((update) => {
            if (update.type === "RUNS") {
                // Simulate ball speed and shot power
                setBallSpeed(Math.floor(Math.random() * 30) + 120); // 120-150 km/h
                setShotPower(Math.floor(Math.random() * 50) + 50); // 50-100%
                setPrediction(update.runs === 6 ? "Maximum!" : "Boundary!");
            } else if (update.type === "WICKET") {
                setPrediction(`Wicket! ${update.dismissalType}`);
            }
        });

        return unsubscribe;
    }, []);

    const updateMetrics = (newScore: LiveScore) => {
        // Calculate win probability (simplified)
        const totalScore = newScore.teamAScore + newScore.teamBScore;
        if (totalScore > 0) {
            const teamAProb = Math.round((newScore.teamAScore / totalScore) * 100);
            setWinProbability({
                teamA: teamAProb,
                teamB: 100 - teamAProb,
            });
        }
    };

    if (!score) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Activity className="w-16 h-16 text-[#8B0000] mx-auto mb-4 animate-pulse" />
                    <p className="text-2xl text-[#F5F5DC]">Waiting for match to start...</p>
                </div>
            </div>
        );
    }

    const currentBattingTeam = score.battingTeam === "TEAM_A" ? "Team A" : "Team B";
    const currentScore = score.battingTeam === "TEAM_A" ? score.teamAScore : score.teamBScore;
    const currentWickets = score.battingTeam === "TEAM_A" ? score.teamAWickets : score.teamBWickets;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            {/* Main Score Display */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] rounded-3xl p-8 mb-8 shadow-2xl"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-6xl font-bold text-[#F5F5DC] mb-2">
                            {currentScore}/{currentWickets}
                        </h1>
                        <p className="text-2xl text-[#F5F5DC]/80">
                            {currentBattingTeam} • {score.currentOver}.{score.currentBall} overs
                        </p>
                    </div>
                    <Trophy className="w-24 h-24 text-[#F5F5DC]/30" />
                </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Batsman Stats */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="w-6 h-6 text-[#8B0000]" />
                        <h2 className="text-xl font-semibold text-[#F5F5DC]">Batsman</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-[#F5F5DC]/60">Current Batsman</p>
                            <p className="text-2xl font-bold text-[#F5F5DC]">Player 1</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[#F5F5DC]/60">Runs</p>
                                <p className="text-xl font-bold text-[#8B0000]">{currentScore}</p>
                            </div>
                            <div>
                                <p className="text-sm text-[#F5F5DC]/60">Balls</p>
                                <p className="text-xl font-bold text-[#8B0000]">
                                    {score.currentOver * 6 + score.currentBall}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-[#F5F5DC]/60">Strike Rate</p>
                            <p className="text-xl font-bold text-[#8B0000]">
                                {((currentScore / (score.currentOver * 6 + score.currentBall || 1)) * 100).toFixed(1)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Bowler Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Zap className="w-6 h-6 text-[#8B0000]" />
                        <h2 className="text-xl font-semibold text-[#F5F5DC]">Bowler</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-[#F5F5DC]/60">Current Bowler</p>
                            <p className="text-2xl font-bold text-[#F5F5DC]">Player 2</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-[#F5F5DC]/60">Overs</p>
                                <p className="text-xl font-bold text-[#8B0000]">
                                    {score.currentOver}.{score.currentBall}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-[#F5F5DC]/60">Wickets</p>
                                <p className="text-xl font-bold text-[#8B0000]">{currentWickets}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-[#F5F5DC]/60">Economy</p>
                            <p className="text-xl font-bold text-[#8B0000]">
                                {(currentScore / (score.currentOver || 1)).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Live Metrics */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Activity className="w-6 h-6 text-[#8B0000]" />
                        <h2 className="text-xl font-semibold text-[#F5F5DC]">Live Metrics</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-[#F5F5DC]/60 mb-2">Ball Speed</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-700 rounded-full h-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(ballSpeed / 150) * 100}%` }}
                                        className="bg-gradient-to-r from-[#8B0000] to-[#FF4500] h-full rounded-full"
                                    />
                                </div>
                                <span className="text-xl font-bold text-[#8B0000] min-w-[80px]">
                                    {ballSpeed} km/h
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-[#F5F5DC]/60 mb-2">Shot Power</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-700 rounded-full h-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${shotPower}%` }}
                                        className="bg-gradient-to-r from-[#8B0000] to-[#FFD700] h-full rounded-full"
                                    />
                                </div>
                                <span className="text-xl font-bold text-[#8B0000] min-w-[80px]">
                                    {shotPower}%
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* AI Prediction */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-6 h-6 text-[#8B0000]" />
                        <h2 className="text-xl font-semibold text-[#F5F5DC]">AI Prediction</h2>
                    </div>
                    <motion.p
                        key={prediction}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold text-[#8B0000]"
                    >
                        {prediction}
                    </motion.p>
                    {score.lastEvent && (
                        <p className="text-lg text-[#F5F5DC]/70 mt-2">{score.lastEvent}</p>
                    )}
                </motion.div>

                {/* Win Probability */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Trophy className="w-6 h-6 text-[#8B0000]" />
                        <h2 className="text-xl font-semibold text-[#F5F5DC]">Win Probability</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-[#F5F5DC]">Team A</span>
                                <span className="text-xl font-bold text-[#8B0000]">{winProbability.teamA}%</span>
                            </div>
                            <div className="bg-gray-700 rounded-full h-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${winProbability.teamA}%` }}
                                    className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] h-full rounded-full"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-[#F5F5DC]">Team B</span>
                                <span className="text-xl font-bold text-[#8B0000]">{winProbability.teamB}%</span>
                            </div>
                            <div className="bg-gray-700 rounded-full h-4">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${winProbability.teamB}%` }}
                                    className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] h-full rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Live Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="fixed top-8 right-8 flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full"
            >
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-3 h-3 bg-white rounded-full"
                />
                <span className="text-white font-semibold">LIVE</span>
            </motion.div>
        </div>
    );
};

export default LiveBroadcast;
