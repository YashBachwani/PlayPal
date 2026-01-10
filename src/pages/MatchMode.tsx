import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Trophy, Video, Plus, Minus, Activity, SwitchCamera, Maximize, Minimize } from "lucide-react";
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

    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCameraFullscreen, setIsCameraFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const cameraContainerRef = useRef<HTMLDivElement>(null);

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

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            try {
                if (containerRef.current) {
                    await containerRef.current.requestFullscreen();
                    setIsFullscreen(true);
                    toast.success("Fullscreen mode activated");
                }
            } catch (error) {
                console.error("Error entering fullscreen:", error);
                toast.error("Fullscreen not supported");
            }
        } else {
            // Exit fullscreen
            try {
                await document.exitFullscreen();
                setIsFullscreen(false);
                toast.info("Exited fullscreen");
            } catch (error) {
                console.error("Error exiting fullscreen:", error);
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            // Check if camera container is in fullscreen
            if (document.fullscreenElement === cameraContainerRef.current) {
                setIsCameraFullscreen(true);
            } else {
                setIsCameraFullscreen(false);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleCameraFullscreen = async () => {
        if (!document.fullscreenElement) {
            // Enter camera fullscreen
            try {
                if (cameraContainerRef.current) {
                    await cameraContainerRef.current.requestFullscreen();
                    setIsCameraFullscreen(true);
                    toast.success("Camera fullscreen activated");
                }
            } catch (error) {
                console.error("Error entering camera fullscreen:", error);
                toast.error("Fullscreen not supported");
            }
        } else {
            // Exit fullscreen
            try {
                await document.exitFullscreen();
                setIsCameraFullscreen(false);
                toast.info("Exited camera fullscreen");
            } catch (error) {
                console.error("Error exiting fullscreen:", error);
            }
        }
    };

    const currentBattingScore = scores[battingTeam];

    return (
        <div ref={containerRef} className="min-h-screen bg-background">
            <Navbar />

            <main className="pt-20 pb-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Activity className={`w-5 h-5 ${aiActive ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
                                <span className="text-sm font-medium">
                                    {aiActive ? 'AI Active' : 'AI Inactive'}
                                </span>
                            </div>
                            <div className="text-lg font-semibold">
                                Match Time: {formatTime(timer)}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Camera Feed */}
                        <div className="lg:col-span-2">
                            <motion.div
                                ref={cameraContainerRef}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card border rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold">Live Camera Feed</h2>
                                    <div className="flex items-center gap-2">
                                        <Video className="w-5 h-5 text-primary" />
                                        <span className="text-sm text-muted-foreground">
                                            {isPlaying ? 'Recording' : 'Ready'}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleCameraFullscreen}
                                            title={isCameraFullscreen ? "Exit Camera Fullscreen" : "Maximize Camera"}
                                            className="ml-2"
                                        >
                                            {isCameraFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                        </Button>
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

                                    {/* Score Overlay for Fullscreen Mode */}
                                    {isCameraFullscreen && (
                                        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                                {/* Score Display Group */}
                                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-6 w-full md:w-auto">
                                                    <div className="bg-primary/90 backdrop-blur-sm px-3 py-2 md:px-4 rounded-lg flex-shrink-0">
                                                        <div className="text-white text-xs md:text-sm font-medium mb-1">
                                                            {battingTeam === 'teamA' ? 'Team A' : 'Team B'}
                                                        </div>
                                                        <div className="text-white text-2xl md:text-3xl font-bold leading-none">
                                                            {currentBattingScore.runs}/{currentBattingScore.wickets}
                                                        </div>
                                                        <div className="text-white/80 text-xs md:text-sm">
                                                            {currentBattingScore.overs.toFixed(1)} ov
                                                        </div>
                                                    </div>

                                                    {/* Match Timer */}
                                                    <div className="bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg flex-shrink-0">
                                                        <div className="text-white/70 text-[10px] md:text-xs mb-1">Time</div>
                                                        <div className="text-white text-lg md:text-xl font-bold leading-none">{formatTime(timer)}</div>
                                                    </div>

                                                    {/* AI Status (Hidden on very small screens if needed) */}
                                                    {aiActive && (
                                                        <div className="hidden sm:flex bg-green-500/90 backdrop-blur-sm px-3 py-2 rounded-lg items-center gap-2">
                                                            <Activity className="w-3 h-3 md:w-4 md:h-4 text-white animate-pulse" />
                                                            <span className="text-white text-xs md:text-sm font-medium">AI On</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Fullscreen Controls */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        size="sm"
                                                        onClick={toggleMatch}
                                                        variant={isPlaying ? "secondary" : "default"}
                                                        className="bg-white/90 hover:bg-white text-black h-8 md:h-9 text-xs md:text-sm"
                                                    >
                                                        {isPlaying ? (
                                                            <>
                                                                <Pause className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                                                Pause
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Play className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                                                Resume
                                                            </>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        onClick={toggleCameraFullscreen}
                                                        variant="secondary"
                                                        className="bg-white/90 hover:bg-white text-black h-8 md:h-9"
                                                    >
                                                        <Minimize className="w-3 h-3 md:w-4 md:h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

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
                                            variant="secondary"
                                            title="Flip Camera"
                                        >
                                            <SwitchCamera className="w-4 h-4" />
                                        </Button>

                                        {/* Camera Selection Dropdown */}
                                        {devices.length > 1 && (
                                            <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                                                <SelectTrigger className="w-[200px]">
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
                                                <Play className="w-16 h-16 text-white mx-auto mb-4" />
                                                <p className="text-white text-lg">Press Start to begin match</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                                    <Button
                                        onClick={toggleMatch}
                                        className="flex-1"
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
                                        variant={aiActive ? "default" : "secondary"}
                                        className="flex-1"
                                    >
                                        <Activity className="w-5 h-5 mr-2" />
                                        {aiActive ? 'AI On' : 'AI Off'}
                                    </Button>

                                    <Button
                                        onClick={endMatch}
                                        variant="outline"
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
                                className="bg-primary text-primary-foreground rounded-2xl p-6"
                            >
                                <h3 className="text-xl font-bold mb-4">Live Score</h3>
                                <div className="text-center mb-4">
                                    <div className="text-4xl md:text-5xl font-bold">
                                        {currentBattingScore.runs}/{currentBattingScore.wickets}
                                    </div>
                                    <div className="opacity-80 mt-2">
                                        {currentBattingScore.overs.toFixed(1)} overs
                                    </div>
                                    <div className="text-sm opacity-60 mt-1">
                                        {battingTeam === 'teamA' ? 'Team A' : 'Team B'} Batting
                                    </div>
                                </div>
                                {aiActive && (
                                    <div className="bg-white/10 rounded-lg p-2 text-center">
                                        <p className="text-xs">
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
                                className="bg-card border rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-bold mb-4">Manual Controls</h3>

                                {/* Batting Team Controls */}
                                <div className="space-y-4">
                                    <div className="flex bg-card/50 p-2 rounded-lg items-center justify-between flex-wrap gap-2">
                                        <span className="font-medium text-sm">Runs</span>
                                        <div className="flex gap-2 flex-wrap justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => updateScore(battingTeam, 'runs', -1)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 min-w-[3rem]"
                                                onClick={() => updateScore(battingTeam, 'runs', 1)}
                                            >
                                                +1
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 min-w-[3rem]"
                                                onClick={() => updateScore(battingTeam, 'runs', 4)}
                                            >
                                                +4
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 min-w-[3rem]"
                                                onClick={() => updateScore(battingTeam, 'runs', 6)}
                                            >
                                                +6
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex bg-card/50 p-2 rounded-lg items-center justify-between flex-wrap gap-2">
                                        <span className="font-medium text-sm">Wickets</span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => updateScore(battingTeam, 'wickets', -1)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => updateScore(battingTeam, 'wickets', 1)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex bg-card/50 p-2 rounded-lg items-center justify-between flex-wrap gap-2">
                                        <span className="font-medium text-sm">Overs</span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => updateScore(battingTeam, 'overs', -0.1)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => updateScore(battingTeam, 'overs', 0.1)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={switchInnings}
                                        className="w-full mt-4"
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
                                className="bg-card border rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-bold mb-4">Teams</h3>
                                <div className="space-y-3">
                                    <div className={`p-3 rounded-lg ${battingTeam === 'teamA' ? 'bg-primary/10 border border-primary' : 'bg-secondary'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Team A</span>
                                            <span className="text-xl font-bold">
                                                {scores.teamA.runs}/{scores.teamA.wickets}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {scores.teamA.overs.toFixed(1)} overs
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${battingTeam === 'teamB' ? 'bg-primary/10 border border-primary' : 'bg-secondary'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Team B</span>
                                            <span className="text-xl font-bold">
                                                {scores.teamB.runs}/{scores.teamB.wickets}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {scores.teamB.overs.toFixed(1)} overs
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MatchMode;
