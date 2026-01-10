/**
 * Detection Module - Integration Examples
 * 
 * Examples of how to use the DetectionEngine in your application.
 */

import { useRef, useEffect, useState } from 'react';
import { DetectionEngine, type AllDetections } from '@/lib/detection';
import { CameraModule } from '@/lib/camera';

/**
 * Example 1: Basic detection hook
 */
export function useDetectionEngine() {
    const detectorRef = useRef(new DetectionEngine());
    const [isReady, setIsReady] = useState(false);
    const [stats, setStats] = useState(detectorRef.current.getStats());

    useEffect(() => {
        const init = async () => {
            await detectorRef.current.initialize();
            setIsReady(true);
            setStats(detectorRef.current.getStats());
        };
        init();
    }, []);

    return {
        detector: detectorRef.current,
        isReady,
        stats,
    };
}

/**
 * Example 2: Ball tracking hook
 */
export function useBallTracking(camera: CameraModule) {
    const { detector, isReady } = useDetectionEngine();
    const [ballPosition, setBallPosition] = useState<{ x: number; y: number } | null>(null);
    const [ballTrajectory, setBallTrajectory] = useState<Array<{ x: number; y: number }>>([]);

    useEffect(() => {
        if (!isReady || !camera.isActive()) return;

        let animationId: number;

        const track = async () => {
            const frame = camera.getFrame();

            if (frame) {
                const balls = await detector.detectBall(frame);

                if (balls.length > 0) {
                    const ball = balls[0];
                    setBallPosition(ball.center);
                    setBallTrajectory(prev => [...prev.slice(-20), ball.center]); // Keep last 20 positions
                } else {
                    setBallPosition(null);
                }
            }

            animationId = requestAnimationFrame(track);
        };

        track();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isReady, camera, detector]);

    return {
        ballPosition,
        ballTrajectory,
    };
}

/**
 * Example 3: Complete match detection hook
 */
export function useMatchDetection(camera: CameraModule) {
    const { detector, isReady } = useDetectionEngine();
    const [detections, setDetections] = useState<AllDetections | null>(null);
    const [isDetecting, setIsDetecting] = useState(false);

    const startDetection = () => {
        setIsDetecting(true);
    };

    const stopDetection = () => {
        setIsDetecting(false);
    };

    useEffect(() => {
        if (!isReady || !camera.isActive() || !isDetecting) return;

        let animationId: number;

        const detect = async () => {
            const frame = camera.getFrame();

            if (frame) {
                const allDetections = await detector.detectAll(frame);
                setDetections(allDetections);
            }

            animationId = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isReady, camera, detector, isDetecting]);

    return {
        detections,
        isDetecting,
        startDetection,
        stopDetection,
    };
}

/**
 * Example 4: MatchMode integration
 */
export function MatchModeWithDetection() {
    const cameraRef = useRef(new CameraModule());
    const { detector, isReady } = useDetectionEngine();
    const [detections, setDetections] = useState<AllDetections | null>(null);

    useEffect(() => {
        const init = async () => {
            await cameraRef.current.startCamera();
        };
        init();

        return () => {
            cameraRef.current.stopCamera();
        };
    }, []);

    useEffect(() => {
        if (!isReady || !cameraRef.current.isActive()) return;

        let animationId: number;

        const detect = async () => {
            const frame = cameraRef.current.getFrame();

            if (frame) {
                const allDetections = await detector.detectAll(frame);
                setDetections(allDetections);

                // Handle ball detection
                if (allDetections.ball) {
                    console.log('Ball detected at:', allDetections.ball.center);
                    // Trigger scoring logic
                }

                // Handle player detection
                const batsman = allDetections.players.find(p => p.isBatsman);
                if (batsman) {
                    console.log('Batsman at:', batsman.center);
                }
            }

            animationId = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isReady, detector]);

    return {
        camera: cameraRef.current,
        detector,
        detections,
        isReady,
    };
}

/**
 * Example 5: Scoring detection
 */
export function useScoringDetection(camera: CameraModule, onScore: (runs: number) => void) {
    const { detector, isReady } = useDetectionEngine();
    const lastBallPositionRef = useRef<{ x: number; y: number } | null>(null);
    const scoringCooldownRef = useRef(false);

    useEffect(() => {
        if (!isReady || !camera.isActive()) return;

        let animationId: number;

        const detect = async () => {
            const frame = camera.getFrame();

            if (frame && !scoringCooldownRef.current) {
                const balls = await detector.detectBall(frame);

                if (balls.length > 0) {
                    const ball = balls[0];
                    const currentPos = ball.center;

                    // Check if ball crossed boundary (top 20% of frame)
                    const frameHeight = 720; // Assuming 720p
                    const boundaryLine = frameHeight * 0.2;

                    if (currentPos.y < boundaryLine) {
                        // Check if ball bounced (had previous position in bottom half)
                        if (lastBallPositionRef.current && lastBallPositionRef.current.y > frameHeight * 0.7) {
                            onScore(4); // 4 runs (bounced)
                        } else {
                            onScore(6); // 6 runs (direct)
                        }

                        // Cooldown to prevent duplicate scoring
                        scoringCooldownRef.current = true;
                        setTimeout(() => {
                            scoringCooldownRef.current = false;
                        }, 3000);
                    }

                    lastBallPositionRef.current = currentPos;
                }
            }

            animationId = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isReady, camera, detector, onScore]);
}
