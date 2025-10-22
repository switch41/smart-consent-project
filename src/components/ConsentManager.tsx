import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Shield, Cookie, BarChart3, Megaphone, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

export function ConsentManager({ websiteId }: { websiteId?: Id<"websites"> }) {
  const websites = useQuery(api.websites.list);
  const [selectedWebsite, setSelectedWebsite] = useState<Id<"websites"> | undefined>(websiteId);
  const grantConsent = useMutation(api.consents.grant);
  const denyConsent = useMutation(api.consents.deny);

  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    thirdParty: false,
  });

  const handleSavePreferences = async () => {
    if (!selectedWebsite) {
      toast.error("Please select a website first");
      return;
    }

    try {
      const categories = Object.entries(preferences) as Array<[string, boolean]>;
      
      for (const [category, enabled] of categories) {
        if (enabled) {
          await grantConsent({
            websiteId: selectedWebsite,
            category: category as "essential" | "analytics" | "marketing" | "thirdParty",
          });
        } else if (category !== "essential") {
          await denyConsent({
            websiteId: selectedWebsite,
            category: category as "essential" | "analytics" | "marketing" | "thirdParty",
          });
        }
      }

      toast.success("Consent preferences saved!", {
        description: "Your privacy settings have been updated",
      });
    } catch (error) {
      toast.error("Failed to save preferences", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const consentOptions = [
    {
      id: "essential",
      label: "Essential Cookies",
      description: "Required for the website to function properly",
      icon: Shield,
      color: "text-green-600",
      disabled: true,
    },
    {
      id: "analytics",
      label: "Analytics Cookies",
      description: "Help us understand how you use the website",
      icon: BarChart3,
      color: "text-blue-600",
      disabled: false,
    },
    {
      id: "marketing",
      label: "Marketing Cookies",
      description: "Used to show you relevant advertisements",
      icon: Megaphone,
      color: "text-purple-600",
      disabled: false,
    },
    {
      id: "thirdParty",
      label: "Third-Party Cookies",
      description: "Set by external services and partners",
      icon: Users,
      color: "text-orange-600",
      disabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Manage Consent Preferences
          </CardTitle>
          <CardDescription>
            Control what data you share with websites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {websites && websites.length > 0 && (
            <div>
              <Label>Select Website</Label>
              <select
                className="w-full mt-2 p-2 border rounded-md"
                value={selectedWebsite || ""}
                onChange={(e) => setSelectedWebsite(e.target.value as Id<"websites">)}
              >
                <option value="">Choose a website...</option>
                {websites.map((site) => (
                  <option key={site._id} value={site._id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            {consentOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3 flex-1">
                  <option.icon className={`h-5 w-5 mt-1 ${option.color}`} />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={option.id}
                  checked={preferences[option.id as keyof typeof preferences]}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, [option.id]: checked }))
                  }
                  disabled={option.disabled}
                />
              </motion.div>
            ))}
          </div>

          <Button onClick={handleSavePreferences} className="w-full" size="lg">
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
