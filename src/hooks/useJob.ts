// Ginkgo Rebuild — Job Polling Hook
// Polls GET /api/analysis/jobs/{jobId} every 1.5s until terminal state.
// Auto-stops on COMPLETE, PARTIAL, or FAILED.

import { useState, useEffect, useCallback, useRef } from 'react';
import { getJobStatus } from '../services/api';
import type { JobStatusResponse } from '../types';

const POLL_INTERVAL = 1500; // ms
const TERMINAL_STATES = new Set(['COMPLETE', 'PARTIAL', 'FAILED']);

interface UseJobResult {
  job: JobStatusResponse | null;
  isPolling: boolean;
  error: string | null;
  stopPolling: () => void;
}

export function useJob(jobId: string | null): UseJobResult {
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const stoppedRef = useRef(false);

  const stopPolling = useCallback(() => {
    stoppedRef.current = true;
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!jobId) return;
    stoppedRef.current = false;
    setIsPolling(true);
    setError(null);

    const poll = async () => {
      if (stoppedRef.current) return;
      try {
        const status = await getJobStatus(jobId);
        setJob(status);
        if (TERMINAL_STATES.has(status.status)) {
          setIsPolling(false);
          return;
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Poll error';
        setError(msg);
      }
      if (!stoppedRef.current) {
        timerRef.current = window.setTimeout(poll, POLL_INTERVAL);
      }
    };

    poll();

    return () => {
      stoppedRef.current = true;
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [jobId]);

  return { job, isPolling, error, stopPolling };
}
