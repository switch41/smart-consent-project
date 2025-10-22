import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Shield, XCircle } from "lucide-react";

export function ConsentDashboard() {
  const consents = useQuery(api.consents.getUserConsents, {});

  if (!consents) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Consent Preferences</h2>
        <p className="text-muted-foreground mt-2">
          Manage your data privacy and consent settings
        </p>
      </div>

      {consents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No consent records found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {consents.map((consent, index) => (
            <motion.div
              key={consent._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Consent Record</CardTitle>
                      <CardDescription>
                        Version {consent.version} • Created{" "}
                        {new Date(consent._creationTime).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        consent.status === "active"
                          ? "default"
                          : consent.status === "revoked"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {consent.status === "active" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {consent.status === "revoked" && <XCircle className="mr-1 h-3 w-3" />}
                      {consent.status === "expired" && <Clock className="mr-1 h-3 w-3" />}
                      {consent.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ConsentItem
                      label="Essential"
                      enabled={consent.responses.essential}
                    />
                    <ConsentItem
                      label="Analytics"
                      enabled={consent.responses.analytics}
                    />
                    <ConsentItem
                      label="Marketing"
                      enabled={consent.responses.marketing}
                    />
                    <ConsentItem
                      label="Third Party"
                      enabled={consent.responses.thirdParty}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConsentItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );
}
