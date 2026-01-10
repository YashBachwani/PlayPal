import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Trophy, Video, Plus, Minus, Activity, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const MatchMode = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const webcamRef = useRef<Webcam>(null);

    // Core state
    const [isPlaying, setIsPlaying] = useState(false);
    const [timer, setTimer] = useState(0);
    const [scores, setScores] = useState({
        teamA: { runs: 0, wickets: 0, overs: 0 },
        teamB: { runs: 0, wickets: 0, overs: 0 },
    });
    const [battingTeam, setBattingTeam] = useState<'teamA' | 'teamB'>('teamA');

    // Camera device selection
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

    // AI Detection state
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [aiActive, setAiActive] = useState(false);
    const trajectory = useRef<{ x: number, y: number, touchedGround: boolean }[]>([]);
    const lastScoringTime = useRef(0);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    // Get camera devices
    useEffect(() => {
        const getDevices = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                try {
                    const deviceList = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
                    setDevices(videoDevices);
                    if (videoDevices.length > 0 && !selectedDeviceId) {
                        setSelectedDeviceId(videoDevices[0].deviceId);
                    }
                } catch (error) {
                    console.error("Error getting devices:", error);
                }
            }
        };
        getDevices();
    }, [selectedDeviceId]);

    // Initialize AI model
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                toast.success("AI Detection Ready", { description: "Ball tracking enabled" });
            } catch (error) {
                console.error("Error loading model:", error);
                toast.error("AI model failed to load");
            }
        };
        loadModel();
    }, []);

    // AI Detection Loop
    useEffect(() => {
        let animationFrameId: number;

        const detect = async () => {
            if (model && webcamRef.current && webcamRef.current.video && isPlaying && aiActive) {
                const video = webcamRef.current.video;

                if (video.readyState === 4) {
                    try {
                        const predictions = await model.detect(video);

                        // Filter for sports ball
                        const ball = predictions.find(p => p.class === 'sports ball' && p.score > 0.6);

                        if (ball) {
                            const [x, y, width, height] = ball.bbox;
                            const centerX = x + width / 2;
                            const centerY = y + height / 2;

                            // Determine if ball touched ground (bottom 30% of frame)
                            const frameHeight = video.videoHeight;
                            const groundLine = frameHeight * 0.7;
                            const touchedGround = centerY > groundLine;

                            // Add to trajectory
                            trajectory.current.push({ x: centerX, y: centerY, touchedGround });

                            // Keep trajectory manageable (last 30 frames = 1 second at 30fps)
                            if (trajectory.current.length > 30) {
                                trajectory.current.shift();
                            }

                            // Analyze for boundary scoring
                            analyzeForBoundary(trajectory.current, video.videoWidth, video.videoHeight);
                        }
                    } catch (error) {
                        console.error("Detection error:", error);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(detect);
        };

        if (aiActive && isPlaying) {
            detect();
        } else {
            trajectory.current = [];
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [aiActive, isPlaying, model, battingTeam]);

    const analyzeForBoundary = (points: { x: number, y: number, touchedGround: boolean }[], frameWidth: number, frameHeight: number) => {
        if (points.length < 5) return;

        const now = Date.now();
        // Prevent duplicate scoring (3 second cooldown)
        if (now - lastScoringTime.current < 3000) return;

        const lastPoint = points[points.length - 1];

        // Define boundary zones (outer 10% of frame)
        const boundaryLeft = frameWidth * 0.1;
        const boundaryRight = frameWidth * 0.9;
        const boundaryTop = frameHeight * 0.2;

        // Check if ball crossed boundary
        const crossedBoundary =
            lastPoint.x < boundaryLeft ||
            lastPoint.x > boundaryRight ||
            lastPoint.y < boundaryTop;

        if (crossedBoundary) {
            // Check if ball touched ground during trajectory
            const touchedGround = points.some(p => p.touchedGround);

            if (touchedGround) {
                // Ball touched ground then crossed boundary = 4 runs
                updateScore(battingTeam, 'runs', 4);
                toast.success("FOUR!", { description: "Ball crossed boundary after touching ground" });
            } else {
                // Ball crossed boundary directly = 6 runs
                updateScore(battingTeam, 'runs', 6);
                toast.success("SIX!", { description: "Ball crossed boundary in the air" });
            }

            lastScoringTime.current = now;
            trajectory.current = []; // Reset trajectory
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleMatch = () => {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            toast.success("Match started!");
        } else {
            toast.info("Match paused");
        }
    };

    const toggleAI = () => {
        setAiActive(!aiActive);
        if (!aiActive) {
            toast.success("AI Detection Activated", { description: "Automatic boundary detection enabled" });
        } else {
            toast.info("AI Detection Deactivated");
        }
    };

    const endMatch = () => {
        setIsPlaying(false);
        setAiActive(false);
        toast.success("Match ended!");
        navigate('/dashboard');
    };

    const updateScore = (team: 'teamA' | 'teamB', type: 'runs' | 'wickets' | 'overs', delta: number) => {
        setScores(prev => ({
            ...prev,
            [team]: {
                ...prev[team],
                [type]: Math.max(0, prev[team][type] + delta)
            }
        }));
    };

    const switchInnings = () => {
        setBattingTeam(prev => prev === 'teamA' ? 'teamB' : 'teamA');
        toast.info(`${battingTeam === 'teamA' ? 'Team B' : 'Team A'} is now batting`);
    };

    const flipCamera = () => {
        if (devices.length < 2) {
            toast.error("No other camera available");
            return;
        }

        const currentIndex = devices.findIndex(d => d.deviceId === selectedDeviceId);
        const nextIndex = (currentIndex + 1) % devices.length;
        setSelectedDeviceId(devices[nextIndex].deviceId);
        toast.success("Camera switched", {
            description: devices[nextIndex].label || `Camera ${nextIndex + 1}`
        });
    };

    const currentBattingScore = scores[battingTeam];

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

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Activity className={`w-5 h-5 ${aiActive ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
                            <span className="text-[#F5F5DC] text-sm">
                                {aiActive ? 'AI Active' : 'AI Inactive'}
                            </span>
                        </div>
                        <div className="text-[#F5F5DC] text-lg font-semibold">
                            Match Time: {formatTime(timer)}
                        </div>
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
                                    <span className="text-sm text-[#F5F5DC]/70">
                                        {isPlaying ? 'Recording' : 'Ready'}
                                    </span>
                                </div>
                            </div>

                            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    videoConstraints={{
                                        deviceId: selectedDeviceId,
                                        width: 1280,
                                        height: 720,
                                    }}
                                    className="w-full h-full object-cover"
                                />

                                {/* Boundary Zone Indicators */}
                                {aiActive && (
                                    <>
                                        <div className="absolute top-0 left-0 right-0 h-[20%] border-2 border-red-500/30 pointer-events-none">
                                            <span className="absolute top-2 left-2 text-red-500 text-xs bg-black/50 px-2 py-1 rounded">
                                                Boundary Zone (6)
                                            </span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-[30%] border-2 border-yellow-500/30 pointer-events-none">
                                            <span className="absolute bottom-2 left-2 text-yellow-500 text-xs bg-black/50 px-2 py-1 rounded">
                                                Ground Zone (4)
                                            </span>
                                        </div>
                                        <div className="absolute top-0 left-0 bottom-0 w-[10%] border-2 border-red-500/30 pointer-events-none" />
                                        <div className="absolute top-0 right-0 bottom-0 w-[10%] border-2 border-red-500/30 pointer-events-none" />
                                    </>
                                )}

                                {/* Camera Controls */}
                                <div className="absolute top-4 right-4 z-10 flex gap-2">
                                    {/* Flip Camera Button */}
                                    <Button
                                        size="sm"
                                        onClick={flipCamera}
                                        disabled={devices.length < 2}
                                        className="bg-gray-900/80 hover:bg-gray-800/90 text-[#F5F5DC] border border-[#8B0000]"
                                        title="Flip Camera"
                                    >
                                        <SwitchCamera className="w-4 h-4" />
                                    </Button>

                                    {/* Camera Selection Dropdown */}
                                    {devices.length > 1 && (
                                        <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                                            <SelectTrigger className="w-[200px] bg-gray-900/80 text-[#F5F5DC] border-[#8B0000]">
                                                <SelectValue placeholder="Select Camera" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {devices.map((device) => (
                                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                                        {device.label || `Camera ${devices.indexOf(device) + 1}`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>

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
                                    onClick={toggleAI}
                                    disabled={!model}
                                    className={`flex-1 ${aiActive ? 'bg-green-600' : 'bg-gray-600'} text-[#F5F5DC]`}
                                >
                                    <Activity className="w-5 h-5 mr-2" />
                                    {aiActive ? 'AI On' : 'AI Off'}
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

                    {/* Scoreboard & Controls */}
                    <div className="space-y-6">
                        {/* Live Score */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] rounded-2xl p-6"
                        >
                            <h3 className="text-xl font-bold text-[#F5F5DC] mb-4">Live Score</h3>
                            <div className="text-center mb-4">
                                <div className="text-5xl font-bold text-[#F5F5DC]">
                                    {currentBattingScore.runs}/{currentBattingScore.wickets}
                                </div>
                                <div className="text-[#F5F5DC]/80 mt-2">
                                    {currentBattingScore.overs.toFixed(1)} overs
                                </div>
                                <div className="text-sm text-[#F5F5DC]/60 mt-1">
                                    {battingTeam === 'teamA' ? 'Team A' : 'Team B'} Batting
                                </div>
                            </div>
                            {aiActive && (
                                <div className="bg-white/10 rounded-lg p-2 text-center">
                                    <p className="text-[#F5F5DC] text-xs">
                                        🤖 AI Auto-Scoring Active
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Manual Controls */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                        >
                            <h3 className="text-lg font-bold text-[#F5F5DC] mb-4">Manual Controls</h3>

                            {/* Batting Team Controls */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#F5F5DC]">Runs</span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateScore(battingTeam, 'runs', -1)}
                                            className="border-[#8B0000] text-[#F5F5DC]"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateScore(battingTeam, 'runs', 1)}
                                            className="bg-[#8B0000] text-[#F5F5DC]"
                                        >
                                            +1
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateScore(battingTeam, 'runs', 4)}
                                            className="bg-[#8B0000] text-[#F5F5DC]"
                                        >
                                            +4
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateScore(battingTeam, 'runs', 6)}
                                            className="bg-[#8B0000] text-[#F5F5DC]"
                                        >
                                            +6
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[#F5F5DC]">Wickets</span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateScore(battingTeam, 'wickets', -1)}
                                            className="border-[#8B0000] text-[#F5F5DC]"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateScore(battingTeam, 'wickets', 1)}
                                            className="bg-[#8B0000] text-[#F5F5DC]"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-[#F5F5DC]">Overs</span>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateScore(battingTeam, 'overs', -0.1)}
                                            className="border-[#8B0000] text-[#F5F5DC]"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateScore(battingTeam, 'overs', 0.1)}
                                            className="bg-[#8B0000] text-[#F5F5DC]"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    onClick={switchInnings}
                                    className="w-full bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-[#F5F5DC] mt-4"
                                >
                                    Switch Innings
                                </Button>
                            </div>
                        </motion.div>

                        {/* Team Scores */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-[#8B0000]/30"
                        >
                            <h3 className="text-lg font-bold text-[#F5F5DC] mb-4">Teams</h3>
                            <div className="space-y-3">
                                <div className={`p-3 rounded-lg ${battingTeam === 'teamA' ? 'bg-[#8B0000]/20 border border-[#8B0000]' : 'bg-gray-700/30'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#F5F5DC] font-semibold">Team A</span>
                                        <span className="text-[#F5F5DC] text-xl font-bold">
                                            {scores.teamA.runs}/{scores.teamA.wickets}
                                        </span>
                                    </div>
                                    <div className="text-sm text-[#F5F5DC]/60 mt-1">
                                        {scores.teamA.overs.toFixed(1)} overs
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg ${battingTeam === 'teamB' ? 'bg-[#8B0000]/20 border border-[#8B0000]' : 'bg-gray-700/30'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#F5F5DC] font-semibold">Team B</span>
                                        <span className="text-[#F5F5DC] text-xl font-bold">
                                            {scores.teamB.runs}/{scores.teamB.wickets}
                                        </span>
                                    </div>
                                    <div className="text-sm text-[#F5F5DC]/60 mt-1">
                                        {scores.teamB.overs.toFixed(1)} overs
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchMode;
