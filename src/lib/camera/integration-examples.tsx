/**
 * Camera Module - Integration Example for MatchMode
 * 
 * This file shows how to integrate the CameraModule with MatchMode.
 * Copy this code into MatchMode.tsx when ready to replace react-webcam.
 */

import { useRef, useEffect, useState } from 'react';
import { CameraModule } from '@/lib/camera';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

/**
 * Example 1: Basic camera integration
 */
export function useCameraModule() {
    const cameraRef = useRef(new CameraModule());
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startCamera = async (deviceId?: string) => {
        try {
            await cameraRef.current.startCamera({ deviceId });
            setIsActive(true);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            setIsActive(false);
        }
    };

    const stopCamera = () => {
        cameraRef.current.stopCamera();
        setIsActive(false);
    };

    const getFrame = () => {
        return cameraRef.current.getFrame();
    };

    useEffect(() => {
        return () => {
            cameraRef.current.stopCamera();
        };
    }, []);

    return {
        camera: cameraRef.current,
        isActive,
        error,
        startCamera,
        stopCamera,
        getFrame,
    };
}

/**
 * Example 2: Ball detection with camera module
 */
export function useBallDetection() {
    const { camera, startCamera, stopCamera, getFrame } = useCameraModule();
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [detecting, setDetecting] = useState(false);
    const detectionLoopRef = useRef<number | null>(null);

    // Initialize TensorFlow and model
    useEffect(() => {
        const initModel = async () => {
            await tf.ready();
            const loadedModel = await cocoSsd.load();
            setModel(loadedModel);
        };
        initModel();
    }, []);

    // Detection loop
    const startDetection = async (deviceId?: string) => {
        await startCamera(deviceId);
        setDetecting(true);

        const detect = async () => {
            if (!detecting || !model) return;

            const frame = getFrame();
            if (frame) {
                const tensor = tf.browser.fromPixels(frame);
                const predictions = await model.detect(tensor);

                // Find ball
                const ball = predictions.find(p => p.class === 'sports ball');
                if (ball && ball.score > 0.7) {
                    onBallDetected(ball);
                }

                tensor.dispose();
            }

            detectionLoopRef.current = requestAnimationFrame(detect);
        };

        detect();
    };

    const stopDetection = () => {
        setDetecting(false);
        if (detectionLoopRef.current) {
            cancelAnimationFrame(detectionLoopRef.current);
        }
        stopCamera();
    };

    const onBallDetected = (ball: any) => {
        console.log('Ball detected:', ball);
        // Add your scoring logic here
    };

    return {
        startDetection,
        stopDetection,
        isDetecting: detecting,
    };
}

/**
 * Example 3: Complete MatchMode integration
 */
export function MatchModeWithCamera() {
    const { camera, startCamera, stopCamera, isActive, error } = useCameraModule();
    const [cvActive, setCvActive] = useState(false);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    // Load available devices
    useEffect(() => {
        const loadDevices = async () => {
            const deviceList = await camera.getDevices();
            setDevices(deviceList);
        };
        loadDevices();
    }, []);

    // Start/stop camera based on CV toggle
    useEffect(() => {
        if (cvActive) {
            startCamera(selectedDeviceId);
        } else {
            stopCamera();
        }
    }, [cvActive, selectedDeviceId]);

    // Ball detection loop (if using CV)
    useEffect(() => {
        if (!cvActive || !isActive) return;

        let animationId: number;
        const detect = async () => {
            const frame = camera.getFrame();
            if (frame) {
                // Your detection logic here
                // const tensor = tf.browser.fromPixels(frame);
                // const predictions = await model.detect(tensor);
                // ...
            }
            animationId = requestAnimationFrame(detect);
        };

        detect();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [cvActive, isActive]);

    return {
        camera,
        isActive,
        error,
        cvActive,
        setCvActive,
        devices,
        selectedDeviceId,
        setSelectedDeviceId,
    };
}

/**
 * Example 4: Replace react-webcam in MatchMode
 * 
 * Steps to integrate:
 * 1. Remove: import Webcam from "react-webcam";
 * 2. Remove: const webcamRef = useRef<Webcam>(null);
 * 3. Add: const { camera, startCamera, stopCamera, getFrame } = useCameraModule();
 * 4. Replace Webcam component with a div (camera renders to hidden canvas)
 * 5. Use getFrame() instead of webcamRef.current.getScreenshot()
 */
