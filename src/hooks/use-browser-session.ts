import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function useBrowserSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const activeSession = useQuery(api.browserSessions.getActiveSession);
  const sessionStats = useQuery(api.browserSessions.getSessionStats);
  const startSession = useMutation(api.browserSessions.startSession);
  const endSession = useMutation(api.browserSessions.endSession);
  const updateActivity = useMutation(api.browserSessions.updateSessionActivity);
  const refreshSession = useMutation(api.browserSessions.refreshSession);

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

  // Monitor session expiration
  useEffect(() => {
    if (!sessionStats) {
      setHasShownWarning(false);
      return;
    }

    // Session expired
    if (sessionStats.isExpired) {
      toast.error("Your session has expired due to inactivity", {
        description: "Please refresh the page to start a new session",
        duration: 10000,
      });
      setHasShownWarning(false);
      return;
    }

    // Session expiring soon
    if (sessionStats.isExpiringSoon && !hasShownWarning) {
      const minutes = Math.floor(sessionStats.timeUntilExpiration / 60);
      toast.warning(`Your session will expire in ${minutes} minute${minutes !== 1 ? 's' : ''}`, {
        description: "Click here to extend your session",
        duration: 10000,
        action: {
          label: "Extend Session",
          onClick: () => {
            refreshSession()
              .then(() => {
                toast.success("Session extended successfully");
                setHasShownWarning(false);
              })
              .catch(() => {
                toast.error("Failed to extend session");
              });
          },
        },
      });
      setHasShownWarning(true);
    }

    // Reset warning flag when session is no longer expiring soon
    if (!sessionStats.isExpiringSoon && hasShownWarning) {
      setHasShownWarning(false);
    }
  }, [sessionStats, hasShownWarning, refreshSession]);

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

  const extendSession = async () => {
    try {
      await refreshSession();
      toast.success("Session extended successfully");
      setHasShownWarning(false);
    } catch (error) {
      toast.error("Failed to extend session");
    }
  };

  return {
    sessionId,
    sessionStats,
    isActive: !!activeSession,
    trackSiteVisit,
    extendSession,
  };
}