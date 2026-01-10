/**
 * Camera Module - Type Definitions
 */

export interface CameraConfig {
    deviceId?: string;
    width?: number;
    height?: number;
    frameRate?: number;
}

export interface CameraError {
    name: string;
    message: string;
    type: 'PERMISSION_DENIED' | 'NOT_FOUND' | 'NOT_READABLE' | 'UNKNOWN';
}

export interface CameraStats {
    isActive: boolean;
    currentDeviceId: string | null;
    resolution: { width: number; height: number } | null;
    frameRate: number;
    framesExtracted: number;
}
