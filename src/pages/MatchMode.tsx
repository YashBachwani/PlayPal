import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Trophy, Video, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { CameraModule } from "@/lib/camera";
import { DetectionEngine } from "@/lib/detection";
import { RuleEngine } from "@/lib/rules";
import { LiveScoringEngine } from "@/lib/scoring";
import { predictionEngine } from "@/lib/predictions";
import { careerEngine } from "@/lib/career";
import { CricketDataLayer } from "@/lib/cricket";
import type { LiveScore } from "@/lib/scoring";
import type { NextBallPrediction } from "@/lib/predictions";

const MatchMode = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    // Core state
    const [isPlaying, setIsPlaying] = useState(false);
    const [liveScore, setLiveScore] = useState<LiveScore | null>(null);
    const [prediction, setPrediction] = useState<NextBallPrediction | null>(null);
    const [systemStatus, setSystemStatus] = useState("Initializing...");

    // Module instances
    const cameraRef = useRef<CameraModule | null>(null);
    const detectorRef = useRef<DetectionEngine | null>(null);
    const ruleEngineRef = useRef<RuleEngine | null>(null);
    const scoringEngineRef = useRef<LiveScoringEngine | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectionLoopRef = useRef<number>(0);

    // Initialize all systems
    useEffect(() => {
        const initializeSystems = async () => {
            try {
                setSystemStatus("Initializing Cricket Data Layer...");
                await CricketDataLayer.initialize();

                setSystemStatus("Loading AI models...");
                const detector = new DetectionEngine();
                await detector.initialize();
                detectorRef.current = detector;

                setSystemStatus("Initializing camera...");
                const camera = new CameraModule();
                cameraRef.current = camera;

                setSystemStatus("Setting up rule engine...");
                const ruleEngine = new RuleEngine();
                ruleEngineRef.current = ruleEngine;

                setSystemStatus("Initializing scoring engine...");
                const scoringEngine = new LiveScoringEngine({
                    matchId: bookingId || 'match-1',
                    teamAId: 'team-a',
                    teamBId: 'team-b',
                });

                // Create teams if they don't exist
                try {
                    await CricketDataLayer.createTeam({
                        name: 'Team A',
                        playerIds: [],
                    });
                } catch (error) {
                    // Team might already exist, ignore error
                    console.log('Team A already exists or error creating:', error);
                }

                try {
                    await CricketDataLayer.createTeam({
                        name: 'Team B',
                        playerIds: [],
                    });
                } catch (error) {
                    // Team might already exist, ignore error
                    console.log('Team B already exists or error creating:', error);
                }

                // Load saved match or start new
                const saved = scoringEngine.loadFromLocalStorage();
                if (saved && saved.isLive) {
                    setLiveScore(saved);
                    toast.success("Resumed live match");
                } else {
                    await scoringEngine.startMatch('Team A', 'Team B', 20);
                    setLiveScore(scoringEngine.getLiveScore());
                }

                // Subscribe to score updates
                scoringEngine.onScoreUpdate((score) => {
                    setLiveScore(score);
                });

                scoringEngineRef.current = scoringEngine;

                setSystemStatus("All systems ready!");
                toast.success("Match systems initialized");

            } catch (error) {
                console.error("System initialization error:", error);
                setSystemStatus("Error initializing systems");
                toast.error("Failed to initialize match systems");
            }
        };

        initializeSystems();

        return () => {
            // Cleanup
            if (cameraRef.current) {
                cameraRef.current.stopCamera();
            }
        };
    }, [bookingId]);

    // Start/Stop match
    const toggleMatch = async () => {
        if (!isPlaying) {
            // Start match
            try {
                if (cameraRef.current && videoRef.current) {
                    await cameraRef.current.startCamera(videoRef.current);
                    startDetectionLoop();
                    setIsPlaying(true);
                    toast.success("Match started! AI detection active");
                }
            } catch (error) {
                console.error("Failed to start camera:", error);
                toast.error("Failed to start camera. Please check permissions.");
            }
        } else {
            // Pause match
            if (cameraRef.current) {
                cameraRef.current.stopCamera();
            }
            stopDetectionLoop();
            setIsPlaying(false);
            toast.info("Match paused");
        }
    };

    // Detection loop
    const startDetectionLoop = () => {
        const detect = async () => {
            if (!cameraRef.current || !detectorRef.current || !ruleEngineRef.current || !scoringEngineRef.current) {
                detectionLoopRef.current = requestAnimationFrame(detect);
                return;
            }

            try {
                // Get frame from camera
                const frame = cameraRef.current.getFrame();

                if (frame) {
                    // Run AI detection
                    const detections = await detectorRef.current.detectAll(frame);

                    // Draw detections on canvas
                    drawDetections(detections);

                    // Process through rule engine
                    const event = ruleEngineRef.current.processDetections(detections);

                    // If event detected, update score
                    if (event) {
                        await scoringEngineRef.current.processEvent(
                            event,
                            'batsman-1',
                            'bowler-1'
                        );

                        // Show toast for event
                        if (event.type === 'SCORING') {
                            const scoringEvent = event as unknown as { runs: number; boundaryType?: string };
                            toast.success(`${scoringEvent.runs} runs!`, {
                                description: scoringEvent.boundaryType || 'Runs scored',
                            });
                        } else if (event.type === 'DISMISSAL') {
                            const dismissalEvent = event as unknown as { dismissalType: string };
                            toast.error(`Wicket!`, {
                                description: dismissalEvent.dismissalType,
                            });
                        }
                    }

                    // Get AI prediction every 5 seconds
                    const now = Date.now();
                    if (now - lastPredictionTime.current > 5000) {
                        try {
                            const pred = await predictionEngine.predictNextBall(
                                bookingId || 'match-1',
                                'batsman-1',
                                'bowler-1'
                            );
                            setPrediction(pred);
                            lastPredictionTime.current = now;
                        } catch (error) {
                            // Prediction failed, continue
                        }
                    }
                }
            } catch (error) {
                console.error("Detection error:", error);
            }

            detectionLoopRef.current = requestAnimationFrame(detect);
        };

        detect();
    };

    const lastPredictionTime = useRef(0);

    const stopDetectionLoop = () => {
        if (detectionLoopRef.current) {
            cancelAnimationFrame(detectionLoopRef.current);
        }
    };

    // Draw detections on canvas
    const drawDetections = (detections: any) => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw ball
        if (detections.ball.length > 0) {
            detections.ball.forEach((ball: any) => {
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 3;
                ctx.strokeRect(ball.bbox[0], ball.bbox[1], ball.bbox[2], ball.bbox[3]);
                ctx.fillStyle = '#FF0000';
                ctx.font = '16px Arial';
                ctx.fillText('Ball', ball.bbox[0], ball.bbox[1] - 5);
            });
        }

        // Draw players
        if (detections.players.length > 0) {
            detections.players.forEach((player: any) => {
                ctx.strokeStyle = player.isBatsman ? '#00FF00' : '#0000FF';
                ctx.lineWidth = 2;
                ctx.strokeRect(player.bbox[0], player.bbox[1], player.bbox[2], player.bbox[3]);
                ctx.fillStyle = player.isBatsman ? '#00FF00' : '#0000FF';
                ctx.font = '14px Arial';
                ctx.fillText(player.isBatsman ? 'Batsman' : 'Fielder', player.bbox[0], player.bbox[1] - 5);
            });
        }
    };

    // End match
    const endMatch = async () => {
        if (scoringEngineRef.current) {
            await scoringEngineRef.current.endMatch();

            // Update career stats
            await careerEngine.updatePlayerCareer('batsman-1');
            await careerEngine.updatePlayerCareer('bowler-1');

            toast.success("Match ended! Stats updated.");
            navigate('/dashboard');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <Navbar />

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/dashboard')}
                        className="text-[#F5F5DC]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="flex items-center gap-2">
                        <Activity className={`w-5 h-5 ${isPlaying ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
                        <span className="text-[#F5F5DC] text-sm">{systemStatus}</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Camera Feed */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-[#F5F5DC]">Live Camera Feed</h2>
                                <div className="flex items-center gap-2">
                                    <Video className="w-5 h-5 text-[#8B0000]" />
                                    <span className="text-sm text-[#F5F5DC]/70">AI Detection Active</span>
                                </div>
                            </div>

                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <canvas
                                    ref={canvasRef}
                                    width={1280}
                                    height={720}
                                    className="absolute top-0 left-0 w-full h-full"
                                />

                                {!isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <div className="text-center">
                                            <Play className="w-16 h-16 text-[#F5F5DC] mx-auto mb-4" />
                                            <p className="text-[#F5F5DC] text-lg">Press Start to begin match</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex gap-4 mt-4">
                                <Button
                                    onClick={toggleMatch}
                                    className="flex-1 bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-[#F5F5DC]"
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause className="w-5 h-5 mr-2" />
                                            Pause Match
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 mr-2" />
                                            Start Match
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={endMatch}
                                    variant="outline"
                                    className="border-[#8B0000] text-[#F5F5DC]"
                                >
                                    <Trophy className="w-5 h-5 mr-2" />
                                    End Match
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scoreboard & Stats */}
                    <div className="space-y-6">
                        {/* Live Score */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-[#F5F5DC] mb-4">Live Score</h3>
                            {liveScore ? (
                                <>
                                    <div className="text-center mb-4">
                                        <div className="text-5xl font-bold text-[#F5F5DC]">
                                            {liveScore.battingTeam === 'TEAM_A' ? liveScore.teamAScore : liveScore.teamBScore}/
                                            {liveScore.battingTeam === 'TEAM_A' ? liveScore.teamAWickets : liveScore.teamBWickets}
                                        </div>
                                        <div className="text-[#F5F5DC]/80 mt-2">
                                            {liveScore.currentOver}.{liveScore.currentBall} overs
                                        </div>
                                    </div>

                                    {liveScore.lastEvent && (
                                        <div className="bg-white/10 rounded-lg p-3 text-center">
                                            <p className="text-[#F5F5DC] text-sm">{liveScore.lastEvent}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-[#F5F5DC]/70">
                                    Waiting for match to start...
                                </div>
                            )}
                        </motion.div>

                        {/* AI Prediction */}
                        {prediction && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5 text-[#8B0000]" />
                                    <h3 className="text-lg font-bold text-[#F5F5DC]">AI Prediction</h3>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-2xl font-bold text-[#8B0000]">
                                        {prediction.outcome}
                                    </div>
                                    <div className="text-sm text-[#F5F5DC]/70">
                                        Probability: {(prediction.probability * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-[#F5F5DC]/70">
                                        {prediction.reasoning}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Team Scores */}
                        {liveScore && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                            >
                                <h3 className="text-lg font-bold text-[#F5F5DC] mb-4">Teams</h3>
                                <div className="space-y-3">
                                    <div className={`p-3 rounded-lg ${liveScore.battingTeam === 'TEAM_A' ? 'bg-[#8B0000]/20 border border-[#8B0000]' : 'bg-gray-700/30'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#F5F5DC] font-semibold">Team A</span>
                                            <span className="text-[#F5F5DC] text-xl font-bold">
                                                {liveScore.teamAScore}/{liveScore.teamAWickets}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${liveScore.battingTeam === 'TEAM_B' ? 'bg-[#8B0000]/20 border border-[#8B0000]' : 'bg-gray-700/30'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[#F5F5DC] font-semibold">Team B</span>
                                            <span className="text-[#F5F5DC] text-xl font-bold">
                                                {liveScore.teamBScore}/{liveScore.teamBWickets}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchMode;
