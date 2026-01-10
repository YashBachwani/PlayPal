import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Trophy, Video, Target } from "lucide-react";
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
    const [isPlaying, setIsPlaying] = useState(false);
    const [scores, setScores] = useState({ teamA: 0, teamB: 0 });
    const [timer, setTimer] = useState(0);
    const [cvActive, setCvActive] = useState(false);

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

    // CV Logic State
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const trajectory = useRef<{ x: number, y: number }[]>([]);
    const lastPredictionTime = useRef(0);

    // Initialize Coco-SSD
    useEffect(() => {
        const loadModel = async () => {
            await tf.ready();
            const loadedModel = await cocoSsd.load();
            setModel(loadedModel);
            toast("AI Scorer Ready", { description: "Computer Vision model loaded successfully." });
        };
        loadModel();
    }, []);

    // Detection Loop
    useEffect(() => {
        let animationFrameId: number;

        const detect = async () => {
            if (model && webcamRef.current && webcamRef.current.video && isPlaying) {
                const video = webcamRef.current.video;

                // Ensure video is ready
                if (video.readyState === 4) {
                    const predictions = await model.detect(video);

                    // Filter for 'sports ball'
                    const ball = predictions.find(p => p.class === 'sports ball' && p.score > 0.6);

                    if (ball) {
                        const [x, y, width, height] = ball.bbox;
                        const centerX = x + width / 2;
                        const centerY = y + height / 2;

                        // Add to trajectory
                        trajectory.current.push({ x: centerX, y: centerY });

                        // Keep trajectory manageable
                        if (trajectory.current.length > 20) {
                            trajectory.current.shift();
                        }

                        // Analyze Trajectory for Scoring
                        analyzeTrajectory(trajectory.current, video.videoHeight);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(detect);
        };

        if (cvActive && isPlaying) {
            detect();
        } else {
            trajectory.current = []; // Reset on stop
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [cvActive, isPlaying, model]);

    const analyzeTrajectory = (points: { x: number, y: number }[], screenHeight: number) => {
        if (points.length < 5) return;

        const lastPoint = points[points.length - 1];
        const prevPoint = points[points.length - 5]; // Look back 5 frames

        // Zones
        const boundaryLine = screenHeight * 0.2; // Top 20% is boundary
        const groundLine = screenHeight * 0.7;   // Bottom 30% is ground

        // Logic: Ball moving UP (towards boundary)
        if (lastPoint.y < prevPoint.y) {
            // Check if it crossed boundary line
            if (lastPoint.y < boundaryLine && prevPoint.y > boundaryLine) {

                // Was there a bounce? Check if any point in history was below groundLine
                const hasBounced = points.some(p => p.y > groundLine);

                const now = Date.now();
                if (now - lastPredictionTime.current > 3000) { // Debounce scoring
                    if (hasBounced) {
                        handleScore('teamA'); // Assume Team A batting for demo
                        toast.success("FOUR RUNS! 🏏", { description: "Ball crossed boundary after bouncing." });
                    } else {
                        handleScore('teamA');
                        toast.success("SIX RUNS! 🚀", { description: "Ball crossed boundary directly!" });
                    }
                    lastPredictionTime.current = now;
                    trajectory.current = []; // Reset after score
                }
            }
        }
    };

    // Canvas Visualization (Overlay)
    const drawOverlay = () => {
        // This functionality can be added by drawing on a canvas ref if needed
        // For now we rely on the React debug overlay below
    };

    const handleScore = (team: "teamA" | "teamB") => {
        setScores(prev => ({ ...prev, [team]: prev[team] + 1 }));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const handleDevices = (mediaDevices: MediaDeviceInfo[]) => {
            const videoDevices = mediaDevices.filter(({ kind }) => kind === "videoinput");
            setDevices(videoDevices);
            if (videoDevices.length > 0 && !selectedDeviceId) {
                // Prefer back camera if available (usually 'environment' in label) or just the last one
                const backCamera = videoDevices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
                setSelectedDeviceId(backCamera ? backCamera.deviceId : videoDevices[0].deviceId);
            }
        };

        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/30">
            <div className="absolute top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
                <Navbar />
            </div>

            <div className="pt-20 pb-8 flex flex-col h-[calc(100vh-80px)]">
                {/* Header / Scoreboard */}
                <div className="px-4 mb-4">
                    <div className="bg-card/10 border border-white/10 rounded-2xl p-4 flex justify-between items-center backdrop-blur-md">
                        <div className="text-center">
                            <h3 className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">Team A</h3>
                            <span className="text-4xl font-bold text-primary">{scores.teamA}</span>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] bg-white/5 hover:bg-white/10 mt-1" onClick={() => handleScore('teamA')}>+1</Button>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="bg-black/50 px-4 py-1 rounded-full text-xl font-mono font-bold text-green-400 tracking-wider shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                                {formatTime(timer)}
                            </div>
                            <span className="text-[10px] text-white/50 mt-1 uppercase tracking-widest">Match Time</span>
                        </div>

                        <div className="text-center">
                            <h3 className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">Team B</h3>
                            <span className="text-4xl font-bold text-blue-400">{scores.teamB}</span>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] bg-white/5 hover:bg-white/10 mt-1" onClick={() => handleScore('teamB')}>+1</Button>
                        </div>
                    </div>
                </div>

                {/* Camera Feed Area */}
                <div className="flex-1 relative bg-zinc-900 mx-4 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        videoConstraints={{ deviceId: selectedDeviceId }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Device Selector (Top Right) */}
                    <div className="absolute top-4 right-4 z-20">
                        <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                            <SelectTrigger className="w-[180px] bg-black/50 border-white/10 text-white h-8 text-xs backdrop-blur-md">
                                <SelectValue placeholder="Select Camera" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                {devices.map((device) => (
                                    <SelectItem key={device.deviceId} value={device.deviceId}>
                                        {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* CV Overlay Simulation */}
                    {cvActive && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${model ? 'bg-green-500/80' : 'bg-yellow-500/80'} text-white`}>
                                    <Target className="w-3 h-3" /> {model ? "AI TRACKING ACTIVE" : "LOADING AI..."}
                                </span>
                            </div>
                            {/* Safe Zone Box */}
                            <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-2 border-primary/30 rounded-lg dashed opacity-50"></div>

                            {/* Visual Guide for Zones */}
                            {/* Boundary Line (Top 20%) */}
                            <div className="absolute top-[20%] left-0 right-0 border-t-2 border-red-500/30 border-dashed">
                                <span className="absolute right-2 -top-5 text-red-500/50 text-xs font-bold uppercase">Boundary Line (6 Runs)</span>
                            </div>

                            {/* Ground Line (Bottom 30%) */}
                            <div className="absolute top-[70%] left-0 right-0 border-t-2 border-yellow-500/30 border-dashed">
                                <span className="absolute right-2 -top-5 text-yellow-500/50 text-xs font-bold uppercase">Ground Line (Bounce)</span>
                            </div>

                            {/* Corner Markers */}
                            <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-green-500/50 rounded-tr-xl"></div>
                            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-green-500/50 rounded-bl-xl"></div>
                        </div>
                    )}

                    {/* Controls Overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex justify-center items-end gap-4">
                        <Button
                            size="lg"
                            className={`rounded-full h-16 w-16 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="w-8 h-8 fill-white text-white" /> : <Play className="w-8 h-8 fill-white text-white ml-1" />}
                        </Button>

                        <Button
                            size="icon"
                            variant="secondary"
                            className={`rounded-full w-12 h-12 border-white/5 backdrop-blur-sm transition-colors ${cvActive ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            onClick={() => setCvActive(!cvActive)}
                        >
                            <Video className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="px-4 mt-4 flex justify-between items-center">
                    <Button variant="ghost" className="text-white/50 hover:text-white hover:bg-white/5" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Exit Match
                    </Button>
                    <Button variant="outline" className="border-primary/50 text-white bg-primary/10 hover:bg-primary/20 hover:border-primary">
                        <Trophy className="w-4 h-4 mr-2 text-primary" /> Finish & Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MatchMode;
