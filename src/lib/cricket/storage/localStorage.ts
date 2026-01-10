/**
 * localStorage Utilities for Cricket Data Layer
 * 
 * Provides type-safe localStorage operations for quick access data.
 */

import type { Match } from '../types';

const STORAGE_KEYS = {
    CURRENT_MATCH_ID: 'cricket_current_match_id',
    PREFERENCES: 'cricket_preferences',
} as const;

export interface CricketPreferences {
    defaultOvers: number;
    autoSaveInterval: number; // in milliseconds
    enableCameraDetection: boolean;
    confidenceThreshold: number; // for CV detections
}

const DEFAULT_PREFERENCES: CricketPreferences = {
    defaultOvers: 20,
    autoSaveInterval: 5000,
    enableCameraDetection: true,
    confidenceThreshold: 0.7,
};

/**
 * Save current match ID to localStorage
 */
export const saveCurrentMatchId = (matchId: string | null): void => {
    try {
        if (matchId === null) {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_MATCH_ID);
        } else {
            localStorage.setItem(STORAGE_KEYS.CURRENT_MATCH_ID, matchId);
        }
    } catch (error) {
        console.error('Failed to save current match ID:', error);
    }
};

/**
 * Load current match ID from localStorage
 */
export const loadCurrentMatchId = (): string | null => {
    try {
        return localStorage.getItem(STORAGE_KEYS.CURRENT_MATCH_ID);
    } catch (error) {
        console.error('Failed to load current match ID:', error);
        return null;
    }
};

/**
 * Save preferences to localStorage
 */
export const savePreferences = (preferences: Partial<CricketPreferences>): void => {
    try {
        const current = loadPreferences();
        const updated = { ...current, ...preferences };
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save preferences:', error);
    }
};

/**
 * Load preferences from localStorage
 */
export const loadPreferences = (): CricketPreferences => {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
        if (stored) {
            return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        }
        return DEFAULT_PREFERENCES;
    } catch (error) {
        console.error('Failed to load preferences:', error);
        return DEFAULT_PREFERENCES;
    }
};

/**
 * Clear all cricket data from localStorage
 */
export const clearStorage = (): void => {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    } catch (error) {
        console.error('Failed to clear storage:', error);
    }
};

/**
 * Generic typed localStorage getter
 */
export const getItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Failed to get item ${key}:`, error);
        return defaultValue;
    }
};

/**
 * Generic typed localStorage setter
 */
export const setItem = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to set item ${key}:`, error);
    }
};
