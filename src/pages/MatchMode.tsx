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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const processingCanvasRef = useRef<HTMLCanvasElement>(null);

    // Hybrid Tracking State
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [targetHsl, setTargetHsl] = useState<{ h: number, s: number, l: number } | null>(null);
    const [colorTolerance, setColorTolerance] = useState(15);
    const roiRef = useRef<{ x: number, y: number, width: number, height: number } | null>(null);
    const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
    const aiBallRef = useRef<any>(null);
    const lastTimeRef = useRef<number>(0);

    const BALL_PRESETS = {
        'red': { label: 'Red Ball', hsl: { h: 0, s: 70, l: 50 }, tol: 20, color: 'bg-red-500' },
        'green': { label: 'Tennis Ball', hsl: { h: 80, s: 70, l: 50 }, tol: 25, color: 'bg-yellow-400' },
        'white': { label: 'White / Paper Ball', hsl: { h: 0, s: 0, l: 90 }, tol: 35, color: 'bg-white border' },
    };




    // Fullscreen state
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isCameraFullscreen, setIsCameraFullscreen] = useState(false);
    const [showMatchSummary, setShowMatchSummary] = useState(false);
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

    // Color Tracking Helpers
    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    };

    const isHslMatch = (h: number, s: number, l: number, target: { h: number, s: number, l: number }, tolerance: number) => {
        // Universal Mode Path: Priority is shape/motion, not color
        if (tolerance === 360) {
            return l > 10 && l < 98; // Just ignore extreme black/white noise
        }

        // Robust Noise Gates: 
        // We normally filter out low-saturation (grey/white) to avoid motion noise.
        // But if the target itself is white (s < 20), we must relax the gate.
        const isWhiteTarget = target.s < 20;

        const minSaturation = isWhiteTarget ? 0 : 20; // Allow grey/white if it's the target
        const maxLightness = isWhiteTarget ? 98 : 90; // Allow brighter pixels for white balls

        if (s < minSaturation) return false;
        if (l < 15 || l > maxLightness) return false;

        const hueDiff = Math.abs(h - target.h);
        const actualHueDiff = Math.min(hueDiff, 360 - hueDiff);

        // For white targets, Hue doesn't matter much, so we rely more on Saturation/Lightness
        const hueMatch = isWhiteTarget ? true : actualHueDiff <= tolerance;

        return hueMatch &&
            Math.abs(s - target.s) <= 40 && // Broader saturation match
            Math.abs(l - target.l) <= 50;   // Broader lightness match
    };

    const selectPreset = (key: keyof typeof BALL_PRESETS) => {
        const preset = BALL_PRESETS[key];
        setTargetHsl(preset.hsl);
        setColorTolerance(preset.tol);
        setSelectedPreset(key);
        roiRef.current = null;
        prevFrameRef.current = null; // Reset motion buffer
        toast.success(`Tracking ${preset.label}`, {
            description: "Motion detection initialized"
        });
    };

    const updateScore = (team: 'teamA' | 'teamB', type: 'runs' | 'wickets' | 'overs', delta: number) => {
        setScores(prev => {
            const currentStats = prev[team];
            let newVal = currentStats[type] + delta;

            if (type === 'overs') {
                // Cricket Over Logic: 0.5 + 0.1 = 1.0, not 0.6
                const currentBalls = Math.floor(currentStats.overs) * 6 + Math.round((currentStats.overs % 1) * 10);
                const newBalls = currentBalls + 1; // Assuming delta is always 1 ball for now or logic handles it
                // Actually, let's treat delta as "number of balls to add" usually 1
                // But existing code might pass something else? Current code passes nothing for overs yet.
                // Let's standardise: for 'overs', delta is in BALLS (e.g. 1)
                const totalBalls = Math.floor(currentStats.overs) * 6 + Math.round((currentStats.overs % 1) * 10) + delta;
                newVal = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;
            }

            return {
                ...prev,
                [team]: {
                    ...currentStats,
                    [type]: Math.max(0, newVal)
                }
            };
        });
    };

    const analyzeForBoundary = (points: { x: number, y: number, touchedGround: boolean }[], frameWidth: number, frameHeight: number) => {
        if (points.length < 2) return;

        const now = Date.now();
        // Prevent duplicate scoring (2 second cooldown for fast paced action)
        if (now - lastScoringTime.current < 2000) return;

        const lastPoint = points[points.length - 1];

        // Define boundary zones
        const boundaryLeft = frameWidth * 0.1;
        const boundaryRight = frameWidth * 0.9;
        const boundaryTop = frameHeight * 0.2;
        const boundaryBottom = frameHeight * 0.7;

        // Check if ball crossed any boundary
        const crossedBoundary =
            lastPoint.x < boundaryLeft ||
            lastPoint.x > boundaryRight ||
            lastPoint.y < boundaryTop ||
            lastPoint.y > boundaryBottom;

        if (crossedBoundary) {
            // Priority: hits bottom zone (Yellow) = 4, else hits sides/top (Red) = 6
            if (lastPoint.y > boundaryBottom) {
                // Yellow Zone (4 Runs)
                updateScore(battingTeam, 'runs', 4);
                updateScore(battingTeam, 'overs', 1);
                toast.success("FOUR!", { description: "Yellow Boundary Hit" });
            } else {
                // Red Zones (6 Runs)
                updateScore(battingTeam, 'runs', 6);
                updateScore(battingTeam, 'overs', 1);
                toast.success("SIX!", { description: "Red Boundary Hit" });
            }

            lastScoringTime.current = now;
            trajectory.current = []; // Reset trajectory for next ball
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
        setShowMatchSummary(true);
        toast.success("Match ended!");
    };



    // 1. Decoupled Slow AI Loop (Background "Brain")
    useEffect(() => {
        if (!model || !aiActive || !isPlaying) return;

        const aiInterval = setInterval(async () => {
            if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
                try {
                    const predictions = await model.detect(webcamRef.current.video, 3, 0.4);
                    aiBallRef.current = predictions.find(p =>
                        ['sports ball', 'apple', 'orange', 'baseball'].includes(p.class)
                    );
                } catch (e) {
                    // Silent fail
                }
            }
        }, 500); // Check 2 times/sec

        return () => clearInterval(aiInterval);
    }, [model, aiActive, isPlaying]);

    // Hybrid Detection Loop (Max FPS "Eyes")
    useEffect(() => {
        let animationFrameId: number;

        const detect = () => {
            if (webcamRef.current && webcamRef.current.video && isPlaying) {
                const video = webcamRef.current.video;

                if (video.readyState === 4) {
                    // 1. Prepare Visual Overlay
                    if (canvasRef.current) {
                        const ctx = canvasRef.current.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                            ctx.canvas.width = video.videoWidth;
                            ctx.canvas.height = video.videoHeight;

                            const w = video.videoWidth;
                            const h = video.videoHeight;

                            // Draw Boundary Lines
                            // Ground/Bottom Zone (Yellow - 4 Runs)
                            ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(0, h * 0.7);
                            ctx.lineTo(w, h * 0.7);
                            ctx.stroke();
                            ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
                            ctx.fillText("4 Runs Zone", 10, h * 0.7 + 20);

                            // Boundary Sides (Red - 6 Runs)
                            ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
                            ctx.beginPath();
                            ctx.moveTo(w * 0.1, 0);
                            ctx.lineTo(w * 0.1, h);
                            ctx.moveTo(w * 0.9, 0);
                            ctx.lineTo(w * 0.9, h);
                            ctx.stroke();
                            ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
                            ctx.fillText("6 Runs Boundary", 10, 30);

                            // Draw ROI if locked
                            if (roiRef.current) {
                                ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
                                ctx.lineWidth = 1;
                                ctx.strokeRect(roiRef.current.x, roiRef.current.y, roiRef.current.width, roiRef.current.height);
                                ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
                                ctx.fillText("ROI Lock", roiRef.current.x, roiRef.current.y - 5);
                            }

                            // Draw Crosshair if no ball detected
                            if (!aiBallRef.current && isPlaying) {
                                const crossSize = 40;
                                const centerX = w / 2;
                                const centerY = h / 2;

                                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                                ctx.lineWidth = 2;

                                // Vertical line
                                ctx.beginPath();
                                ctx.moveTo(centerX, centerY - crossSize);
                                ctx.lineTo(centerX, centerY + crossSize);
                                ctx.stroke();

                                // Horizontal line
                                ctx.beginPath();
                                ctx.moveTo(centerX - crossSize, centerY);
                                ctx.lineTo(centerX + crossSize, centerY);
                                ctx.stroke();

                                // Center circle
                                ctx.beginPath();
                                ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
                                ctx.stroke();

                                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                                ctx.font = '14px sans-serif';
                                ctx.textAlign = 'center';
                                ctx.fillText("Ready to Detect Ball", centerX, centerY + crossSize + 20);
                                ctx.textAlign = 'start'; // Reset
                            }
                        }
                    }

                    // 2. Perform Detection
                    let detectedBall = null;
                    let detectionSource = 'none';

                    // AI Detection
                    if (aiActive && aiBallRef.current) {
                        detectedBall = aiBallRef.current;
                        detectionSource = 'AI';
                    }

                    // Color Tracking (HSL + ROI + Clustering + Motion)
                    if (!detectedBall && targetHsl) {
                        const pCanvas = processingCanvasRef.current || document.createElement('canvas');
                        if (!processingCanvasRef.current) processingCanvasRef.current = pCanvas;

                        const scanWidth = roiRef.current ? roiRef.current.width : 160;
                        const scanHeight = roiRef.current ? roiRef.current.height : 90;
                        const scanX = roiRef.current ? roiRef.current.x : 0;
                        const scanY = roiRef.current ? roiRef.current.y : 0;

                        const safeX = Math.max(0, scanX);
                        const safeY = Math.max(0, scanY);
                        const safeW = Math.min(scanWidth, video.videoWidth - safeX);
                        const safeH = Math.min(scanHeight, video.videoHeight - safeY);

                        pCanvas.width = 160;
                        pCanvas.height = 90;
                        const pCtx = pCanvas.getContext('2d', { willReadFrequently: true });

                        if (pCtx && safeW > 0 && safeH > 0) {
                            pCtx.drawImage(video, safeX, safeY, safeW, safeH, 0, 0, 160, 90);
                            const imageData = pCtx.getImageData(0, 0, 160, 90);
                            const data = imageData.data;

                            // Motion Detection: Compare with previous frame
                            let prevData = prevFrameRef.current;
                            // If ROI changed size/pos significantly or first frame, reset buffer
                            if (prevData && prevData.length !== data.length) {
                                prevData = null;
                            }

                            // Grid-based clustering (16x9 grid)
                            const gridCols = 16;
                            const gridRows = 9;
                            const grid = new Array(gridRows * gridCols).fill(0);
                            const cellW = 160 / gridCols;
                            const cellH = 90 / gridRows;

                            const matchingPixels: { x: number, y: number }[] = [];

                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i];
                                const g = data[i + 1];
                                const b = data[i + 2];

                                // Motion Check (Diff > threshold)
                                let isMoving = true;
                                if (prevData) {
                                    const dr = Math.abs(r - prevData[i]);
                                    const dg = Math.abs(g - prevData[i + 1]);
                                    const db = Math.abs(b - prevData[i + 2]);
                                    if (dr + dg + db < 30) { // Motion threshold
                                        isMoving = false;
                                    }
                                }

                                if (isMoving) {
                                    // Color Check
                                    const { h, s, l } = rgbToHsl(r, g, b);
                                    if (isHslMatch(h, s, l, targetHsl, colorTolerance)) {
                                        const pixelIdx = i / 4;
                                        const x = pixelIdx % 160;
                                        const y = Math.floor(pixelIdx / 160);

                                        matchingPixels.push({ x, y });

                                        // Map to grid cell
                                        const col = Math.floor(x / cellW);
                                        const row = Math.floor(y / cellH);
                                        if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
                                            grid[row * gridCols + col]++;
                                        }
                                    }
                                }
                            }

                            // Save current frame as previous for next loop
                            // Copy data to avoid reference change
                            prevFrameRef.current = new Uint8ClampedArray(data);

                            // Find densest cell
                            let maxDensity = 0;
                            let bestCell = -1;
                            for (let i = 0; i < grid.length; i++) {
                                if (grid[i] > maxDensity) {
                                    maxDensity = grid[i];
                                    bestCell = i;
                                }
                            }

                            // Filter pixels: Only use pixels in or near the best cell
                            // Threshold: Cell must have significant density (e.g. > 5 pixels)
                            if (bestCell !== -1 && maxDensity > 5) {
                                const bestRow = Math.floor(bestCell / gridCols);
                                const bestCol = bestCell % gridCols;

                                // Calculate centroid and bounding box of the cluster
                                let xSum = 0, ySum = 0, count = 0;
                                let minX = 160, maxX = 0, minY = 90, maxY = 0;

                                matchingPixels.forEach(p => {
                                    const col = Math.floor(p.x / cellW);
                                    const row = Math.floor(p.y / cellH);
                                    // Check if pixel is in best cell or immediate neighbors
                                    if (Math.abs(col - bestCol) <= 1 && Math.abs(row - bestRow) <= 1) {
                                        xSum += p.x;
                                        ySum += p.y;
                                        // Update Bounding Box
                                        if (p.x < minX) minX = p.x;
                                        if (p.x > maxX) maxX = p.x;
                                        if (p.y < minY) minY = p.y;
                                        if (p.y > maxY) maxY = p.y;
                                        count++;
                                    }
                                });

                                // Shape Analysis: Filter out noise (eyes, hands)
                                const blobW = maxX - minX + 1;
                                const blobH = maxY - minY + 1;
                                const aspectRatio = blobW / blobH;

                                // Estimate Velocity from previous points
                                let velocity = 0;
                                if (trajectory.current.length > 1) {
                                    const last = trajectory.current[trajectory.current.length - 1];
                                    const prev = trajectory.current[trajectory.current.length - 2];
                                    velocity = Math.hypot(last.x - prev.x, last.y - prev.y);
                                }

                                const isFast = velocity > 20; // >20px per frame is fast
                                const minRatio = isFast ? 0.2 : 0.5; // Allow streaks if fast
                                const maxRatio = isFast ? 4.0 : 1.8;
                                const fillRatio = count / (blobW * blobH); // How much of the box is filled

                                if (count > 8 && blobW > 3 && blobH > 3 &&
                                    aspectRatio > minRatio && aspectRatio < maxRatio &&
                                    fillRatio > 0.3 && fillRatio < 0.95) {

                                    const scaleX = safeW / 160;
                                    const scaleY = safeH / 90;
                                    const localCx = (xSum / count) * scaleX;
                                    const localCy = (ySum / count) * scaleY;
                                    const globalCx = safeX + localCx;
                                    const globalCy = safeY + localCy;

                                    detectedBall = {
                                        bbox: [globalCx - 25, globalCy - 25, 50, 50],
                                        class: 'color_blob',
                                        score: Math.min(1, count / 50)
                                    };
                                    detectionSource = isFast ? 'Streak' : (colorTolerance === 360 ? 'Shape' : 'Color');

                                    roiRef.current = {
                                        x: globalCx - 150,
                                        y: globalCy - 150,
                                        width: 300,
                                        height: 300
                                    };
                                } else {
                                    // Rejected by Shape Filter
                                    roiRef.current = null;
                                }
                            } else {
                                // Noise or object lost
                                roiRef.current = null;
                            }
                        }
                    }

                    // 3. Process Result
                    if (detectedBall) {
                        const [x, y, width, height] = detectedBall.bbox;
                        const centerX = x + width / 2;
                        const centerY = y + height / 2;

                        if (canvasRef.current) {
                            const ctx = canvasRef.current.getContext('2d');
                            if (ctx) {
                                ctx.strokeStyle = detectionSource === 'AI' ? '#00FF00' : '#3B82F6';
                                ctx.lineWidth = 4;
                                ctx.strokeRect(x, y, width, height);
                                ctx.fillStyle = detectionSource === 'AI' ? '#00FF00' : '#3B82F6';
                                ctx.font = 'bold 18px Arial';
                                ctx.fillText(`${detectionSource} ${Math.round(detectedBall.score * 100)}%`, x, y - 10);
                            }
                        }

                        const frameHeight = video.videoHeight;
                        const groundLine = frameHeight * 0.7;
                        const touchedGround = centerY > groundLine;

                        trajectory.current.push({ x: centerX, y: centerY, touchedGround });
                        if (trajectory.current.length > 30) trajectory.current.shift();

                        analyzeForBoundary(trajectory.current, video.videoWidth, video.videoHeight);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(detect);
        };

        if (isPlaying) {
            detect();
        } else {
            trajectory.current = [];
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [aiActive, isPlaying, model, battingTeam, targetHsl, colorTolerance]);




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

                                <div ref={cameraContainerRef} className="relative bg-black rounded-lg overflow-hidden aspect-video">
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
                                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

                                    {/* Score Overlay for Fullscreen Mode */}
                                    {isCameraFullscreen && (
                                        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
                                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 h-full">
                                                {/* Score Display Group */}
                                                <div className="flex flex-wrap items-center gap-2 md:gap-6 w-full md:w-auto">
                                                    <div className="bg-primary/90 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-lg flex-shrink-0 shadow-lg">
                                                        <div className="text-white text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 opacity-90">
                                                            {battingTeam === 'teamA' ? 'Team A' : 'Team B'}
                                                        </div>
                                                        <div className="text-white text-xl md:text-3xl font-bold leading-none">
                                                            {currentBattingScore.runs}/{currentBattingScore.wickets}
                                                        </div>
                                                        <div className="text-white/80 text-[10px] md:text-sm leading-none mt-0.5">
                                                            {currentBattingScore.overs.toFixed(1)} ov
                                                        </div>
                                                    </div>

                                                    {/* Match Timer */}
                                                    <div className="bg-black/60 backdrop-blur-sm px-2 py-1 md:px-4 md:py-2 rounded-lg flex-shrink-0 shadow-lg border border-white/10">
                                                        <div className="text-white/70 text-[10px] md:text-xs mb-0.5 md:mb-1">Time</div>
                                                        <div className="text-white text-sm md:text-xl font-bold leading-none">{formatTime(timer)}</div>
                                                    </div>

                                                    {/* AI Status */}
                                                    {aiActive && (
                                                        <div className="flex bg-green-500/90 backdrop-blur-sm px-2 py-1 md:px-3 md:py-2 rounded-lg items-center gap-1 md:gap-2 shadow-lg">
                                                            <Activity className="w-3 h-3 md:w-4 md:h-4 text-white animate-pulse" />
                                                            <span className="text-white text-[10px] md:text-sm font-medium">AI On</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Fullscreen Controls - Positioned absolutely on mobile for easier reach */}
                                                <div className="flex items-center gap-2 absolute top-4 right-4 md:static">
                                                    <Button
                                                        size="sm"
                                                        onClick={toggleMatch}
                                                        variant={isPlaying ? "secondary" : "default"}
                                                        className="bg-white/90 hover:bg-white text-black h-7 md:h-9 text-[10px] md:text-sm px-2 md:px-4 shadow-xl"
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
                                                        className="bg-white/90 hover:bg-white text-black h-7 w-7 md:h-9 md:w-auto md:px-3 shadow-xl p-0 md:p-2"
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

                                    {/* Ball Presets */}
                                    <div className="flex gap-2">
                                        {(Object.keys(BALL_PRESETS) as Array<keyof typeof BALL_PRESETS>).map(key => (
                                            <Button
                                                key={key}
                                                size="sm"
                                                variant={selectedPreset === key ? "default" : "outline"}
                                                onClick={() => selectPreset(key)}
                                                className="flex-1"
                                            >
                                                <div className={`w-3 h-3 rounded-full mr-2 ${BALL_PRESETS[key].color}`} />
                                                {BALL_PRESETS[key].label}
                                            </Button>
                                        ))}
                                    </div>
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

            {/* Match Summary Modal */}
            {showMatchSummary && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-card border-2 border-primary/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent" />

                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold mb-2">Match Ends</h2>
                            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xl font-bold animate-pulse">
                                {scores.teamA.runs > scores.teamB.runs ? "🏆 Team A Wins! 🏆" :
                                    scores.teamB.runs > scores.teamA.runs ? "🏆 Team B Wins! 🏆" : "🤝 It's a Tie! 🤝"}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 items-center gap-4 mb-8">
                            <div className="text-center p-6 rounded-2xl bg-secondary/50 border border-border">
                                <div className="text-xl font-bold mb-2 text-primary">Team A</div>
                                <div className="text-5xl font-black mb-2">{scores.teamA.runs}/{scores.teamA.wickets}</div>
                                <div className="text-sm text-muted-foreground font-medium">{scores.teamA.overs.toFixed(1)} Overs</div>
                            </div>

                            <div className="text-center">
                                <div className="text-4xl font-black text-muted-foreground/20">VS</div>
                            </div>

                            <div className="text-center p-6 rounded-2xl bg-secondary/50 border border-border">
                                <div className="text-xl font-bold mb-2 text-blue-500">Team B</div>
                                <div className="text-5xl font-black mb-2">{scores.teamB.runs}/{scores.teamB.wickets}</div>
                                <div className="text-sm text-muted-foreground font-medium">{scores.teamB.overs.toFixed(1)} Overs</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={() => setShowMatchSummary(false)}
                                variant="outline"
                                className="flex-1 h-12"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 text-lg font-bold h-12"
                            >
                                Return to Dashboard
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MatchMode;
