"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DEXGEN_CONFIG } from '@/lib/token-config';

interface LaunchState {
  launchTime: number | null;
  isFreePeriod: boolean;
  timeRemaining: number;
  isLoading: boolean;
}

interface LaunchContextType extends LaunchState {
  startLaunch: () => void;
}

const LaunchContext = createContext<LaunchContextType | undefined>(undefined);

const LAUNCH_STORAGE_KEY = 'dexgen_launch_time';

// OPEN ACCESS MODE: App is open to everyone while launch is rescheduled
// Set this to false when ready to enforce token gating
const OPEN_ACCESS = true;

export function LaunchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LaunchState>({
    launchTime: null,
    isFreePeriod: OPEN_ACCESS,
    timeRemaining: 0,
    isLoading: !OPEN_ACCESS,
  });

  // Initialize on mount
  useEffect(() => {
    // OPEN ACCESS MODE: Skip all checks and keep free period active
    if (OPEN_ACCESS) {
      setState({
        launchTime: null,
        isFreePeriod: true,
        timeRemaining: 0,
        isLoading: false,
      });
      return;
    }

    // Priority 1: Use env variable if set
    const envLaunchTime = process.env.NEXT_PUBLIC_DEXGEN_LAUNCH_TIME;

    if (envLaunchTime && envLaunchTime !== 'undefined') {
      const launchTime = parseInt(envLaunchTime, 10);
      const now = Date.now();
      const endTime = launchTime + DEXGEN_CONFIG.launchDuration;
      const remaining = Math.max(0, endTime - now);

      // Free period is active if we're between launchTime and endTime
      const isFreePeriod = now >= launchTime && now < endTime;

      setState({
        launchTime,
        isFreePeriod,
        timeRemaining: remaining,
        isLoading: false,
      });
      return;
    }

    // Priority 2: Fall back to localStorage (for testing without env)
    const stored = localStorage.getItem(LAUNCH_STORAGE_KEY);

    if (stored) {
      const launchTime = parseInt(stored, 10);
      const now = Date.now();
      const elapsed = now - launchTime;
      const remaining = Math.max(0, DEXGEN_CONFIG.launchDuration - elapsed);

      setState({
        launchTime,
        isFreePeriod: remaining > 0,
        timeRemaining: remaining,
        isLoading: false,
      });
    } else {
      // No launch time set - start now (dev mode)
      const launchTime = Date.now();
      localStorage.setItem(LAUNCH_STORAGE_KEY, launchTime.toString());

      setState({
        launchTime,
        isFreePeriod: true,
        timeRemaining: DEXGEN_CONFIG.launchDuration,
        isLoading: false,
      });
    }
  }, []);

  // Update countdown every second
  useEffect(() => {
    // Skip countdown in OPEN ACCESS mode
    if (OPEN_ACCESS) return;
    if (!state.launchTime || state.isLoading) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const endTime = state.launchTime! + DEXGEN_CONFIG.launchDuration;
      const remaining = Math.max(0, endTime - now);

      // Free period is active if we're between launchTime and endTime
      const isFreePeriod = now >= state.launchTime! && now < endTime;

      setState(prev => ({
        ...prev,
        timeRemaining: remaining,
        isFreePeriod,
      }));

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.launchTime, state.isLoading]);

  // Start a new launch period (admin/dev function)
  const startLaunch = useCallback(() => {
    const launchTime = Date.now();
    localStorage.setItem(LAUNCH_STORAGE_KEY, launchTime.toString());

    setState({
      launchTime,
      isFreePeriod: true,
      timeRemaining: DEXGEN_CONFIG.launchDuration,
      isLoading: false,
    });
  }, []);

  return (
    <LaunchContext.Provider value={{ ...state, startLaunch }}>
      {children}
    </LaunchContext.Provider>
  );
}

export function useLaunch(): LaunchContextType {
  const context = useContext(LaunchContext);
  if (context === undefined) {
    throw new Error('useLaunch must be used within a LaunchProvider');
  }
  return context;
}

/**
 * Format time remaining as HH:MM:SS
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
