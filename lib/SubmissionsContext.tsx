'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';

interface Submission {
  status: string;
}

interface SubmissionsContextType {
  submissions: Map<number, Submission>;
  startPolling: (submissionId: number) => void;
}

const SubmissionsContext = createContext<SubmissionsContextType | undefined>(undefined);

export function useSubmissions() {
  const context = useContext(SubmissionsContext);
  if (!context) {
    throw new Error('useSubmissions must be used within a SubmissionsProvider');
  }
  return context;
}

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Map<number, Submission>>(new Map());
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const activePolls = useRef<Set<number>>(new Set());

  const poll = useCallback(async () => {
    if (activePolls.current.size === 0) {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      return;
    }

    const sids = Array.from(activePolls.current).join(',');
    try {
      const response = await fetch(`/api/submissions?sids=${sids}`);
      if (!response.ok) throw new Error('Failed to fetch submission statuses');
      
      const updatedSubmissions: Map<number, Submission> = await response.json();

      setSubmissions(prev => {
        const newSubmissions = new Map(prev);
        Object.entries(updatedSubmissions).forEach(([sid, submission]) => {
            const submissionId = parseInt(sid);
            newSubmissions.set(submissionId, submission as Submission);
            if (submission.status !== 'judging' && submission.status !== 'in queue') {
                activePolls.current.delete(submissionId);
            }
        });
        return newSubmissions;
      });

    } catch (error) {
      console.error("Polling error:", error);
    }
  }, []);

  const startPolling = useCallback((submissionId: number) => {
    activePolls.current.add(submissionId);
    setSubmissions(prev => {
        const newSubmissions = new Map(prev);
        newSubmissions.set(submissionId, { status: 'judging' });
        return newSubmissions;
    });

    if (!pollingInterval.current) {
      pollingInterval.current = setInterval(poll, 10000);
    }
  }, [poll]);

  return (
    <SubmissionsContext.Provider value={{ submissions, startPolling }}>
      {children}
    </SubmissionsContext.Provider>
  );
}