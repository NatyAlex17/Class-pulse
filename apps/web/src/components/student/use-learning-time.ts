'use client';

import * as React from 'react';
import { io, type Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const HEARTBEAT_MS = 5_000;

export interface LearningTimeState {
  moduleId: string;
  sessionSeconds: number;
  requiredSessionSeconds: number;
  lessonSeconds: Record<string, number>;
  learningSeconds: number;
  learningSessionActive: boolean;
  examUnlocked: boolean;
}

interface UseLearningTimeOptions {
  accessToken?: string;
  /** Whether time should currently be accruing (session running, exam not yet unlocked). */
  enabled: boolean;
  /** Lesson the elapsed time should be credited against. */
  lessonId?: string;
}

/**
 * Second-accurate learning timer backed by the learning-time socket.
 *
 * The server measures elapsed time between heartbeats with its own clock and
 * persists on every flush, so the totals survive tab closes and reconnects.
 * Between server states the hook ticks locally each second for a smooth
 * display, then snaps to the authoritative value on the next state message.
 */
export function useLearningTime({ accessToken, enabled, lessonId }: UseLearningTimeOptions) {
  const socketRef = React.useRef<Socket | null>(null);
  const [state, setState] = React.useState<LearningTimeState | null>(null);
  const [connected, setConnected] = React.useState(false);
  const stateReceivedAtRef = React.useRef(0);
  const [, setClock] = React.useState(0);

  React.useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = io(`${API_BASE_URL}/learning-time`, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('learning:state', (next: LearningTimeState) => {
      stateReceivedAtRef.current = Date.now();
      setState(next);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [accessToken]);

  React.useEffect(() => {
    if (!enabled || !connected) {
      return;
    }

    const socket = socketRef.current;

    if (!socket) {
      return;
    }

    socket.emit('learning:start', { lessonId });

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        socket.emit('learning:heartbeat');
      }
    }, HEARTBEAT_MS);

    const onVisibilityChange = () => {
      socket.emit(document.visibilityState === 'visible' ? 'learning:resume' : 'learning:pause');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      socket.emit('learning:pause');
    };
  }, [enabled, connected, lessonId]);

  // Local 1-second tick so the display counts smoothly between server states.
  React.useEffect(() => {
    if (!enabled || !connected) {
      return;
    }

    const interval = window.setInterval(() => setClock((value) => value + 1), 1_000);
    return () => window.clearInterval(interval);
  }, [enabled, connected]);

  const running = enabled && connected && state !== null;
  // Seconds elapsed locally since the last authoritative state. Capped near the
  // heartbeat window — anything larger means the clock is paused server-side.
  const localExtraSeconds =
    running && typeof document !== 'undefined' && document.visibilityState === 'visible'
      ? Math.min(Math.floor((Date.now() - stateReceivedAtRef.current) / 1000), HEARTBEAT_MS / 1000 + 2)
      : 0;

  const sessionSeconds =
    state !== null
      ? Math.min(state.sessionSeconds + localExtraSeconds, state.requiredSessionSeconds)
      : null;

  const lessonSecondsOf = React.useCallback(
    (targetLessonId?: string) => {
      if (state === null || !targetLessonId) {
        return null;
      }

      const base = state.lessonSeconds[targetLessonId] ?? 0;
      return targetLessonId === lessonId ? base + localExtraSeconds : base;
    },
    [state, lessonId, localExtraSeconds],
  );

  return {
    state,
    connected,
    sessionSeconds,
    requiredSessionSeconds: state?.requiredSessionSeconds ?? null,
    lessonSecondsOf,
    examUnlocked: state?.examUnlocked ?? false,
  };
}
