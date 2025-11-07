import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useBrowserSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const activeSession = useQuery(api.browserSessions.getActiveSession);
  const sessionStats = useQuery(api.browserSessions.getSessionStats);
  const startSession = useMutation(api.browserSessions.startSession);
  const endSession = useMutation(api.browserSessions.endSession);
  const updateActivity = useMutation(api.browserSessions.updateSessionActivity);

  useEffect(() => {
    // Start session on mount if not already active
    if (!activeSession && !sessionId) {
      startSession().then((result) => {
        setSessionId(result.sessionId);
      }).catch(console.error);
    } else if (activeSession) {
      setSessionId(activeSession.sessionId);
    }

    // End session on unmount
    return () => {
      if (sessionId) {
        endSession({ sessionId }).catch(console.error);
      }
    };
  }, [activeSession]);

  const trackSiteVisit = async (url: string, cookies: number, trackers: number) => {
    if (sessionId) {
      await updateActivity({
        sessionId,
        siteUrl: url,
        cookiesCount: cookies,
        trackersCount: trackers,
      });
    }
  };

  return {
    sessionId,
    sessionStats,
    isActive: !!activeSession,
    trackSiteVisit,
  };
}
