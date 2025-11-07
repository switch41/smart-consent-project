import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Shield, X } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    thirdParty: false,
  });

  const websites = useQuery(api.websites.list);
  const grantConsent = useMutation(api.consents.grant);
  const denyConsent = useMutation(api.consents.deny);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = async () => {
    await saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      thirdParty: true,
    });
  };

  const handleRejectAll = async () => {
    await saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      thirdParty: false,
    });
  };

  const handleSavePreferences = async () => {
    await saveConsent(preferences);
  };

  const saveConsent = async (prefs: typeof preferences) => {
    try {
      // Get or create a website entry for the app itself
      let websiteId = websites?.[0]?._id;
      
      if (!websiteId) {
        toast.error("Please log in to save consent preferences");
        return;
      }

      // Save each consent preference
      const categories = Object.entries(prefs) as Array<[string, boolean]>;
      
      for (const [category, enabled] of categories) {
        if (enabled) {
          await grantConsent({
            websiteId,
            category: category as "essential" | "analytics" | "marketing" | "thirdParty",
          });
        } else if (category !== "essential") {
          await denyConsent({
            websiteId,
            category: category as "essential" | "analytics" | "marketing" | "thirdParty",
          });
        }
      }

      // Store consent in localStorage
      localStorage.setItem("cookieConsent", JSON.stringify(prefs));
      localStorage.setItem("cookieConsentDate", new Date().toISOString());
      
      setIsVisible(false);
      toast.success("Cookie preferences saved!");
    } catch (error) {
      console.error("Failed to save consent:", error);
      // Still hide banner and save to localStorage even if backend fails
      localStorage.setItem("cookieConsent", JSON.stringify(prefs));
      localStorage.setItem("cookieConsentDate", new Date().toISOString());
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <Card className="max-w-4xl mx-auto border-2 shadow-2xl bg-white dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Cookie Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      We use cookies to enhance your experience
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVisible(false)}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!showDetails ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    We use cookies to improve your browsing experience, analyze site traffic, and personalize content. 
                    By clicking "Accept All", you consent to our use of cookies.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleAcceptAll} className="flex-1">
                      Accept All
                    </Button>
                    <Button onClick={handleRejectAll} variant="outline" className="flex-1">
                      Reject All
                    </Button>
                    <Button
                      onClick={() => setShowDetails(true)}
                      variant="outline"
                      className="flex-1"
                    >
                      Customize
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-green-600" />
                        <div>
                          <Label className="font-medium">Essential Cookies</Label>
                          <p className="text-xs text-muted-foreground">
                            Required for the site to function
                          </p>
                        </div>
                      </div>
                      <Switch checked={true} disabled />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Cookie className="h-4 w-4 text-blue-600" />
                        <div>
                          <Label className="font-medium">Analytics Cookies</Label>
                          <p className="text-xs text-muted-foreground">
                            Help us understand how you use our site
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.analytics}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, analytics: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Cookie className="h-4 w-4 text-purple-600" />
                        <div>
                          <Label className="font-medium">Marketing Cookies</Label>
                          <p className="text-xs text-muted-foreground">
                            Used to show relevant advertisements
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.marketing}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, marketing: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Cookie className="h-4 w-4 text-orange-600" />
                        <div>
                          <Label className="font-medium">Third-Party Cookies</Label>
                          <p className="text-xs text-muted-foreground">
                            Set by external services
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences.thirdParty}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({ ...prev, thirdParty: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleSavePreferences} className="flex-1">
                      Save Preferences
                    </Button>
                    <Button
                      onClick={() => setShowDetails(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
