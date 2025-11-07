import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Shield, TrendingUp, Cookie, Eye, Globe, AlertTriangle, Info, Brain } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function PrivacyReport() {
  const stats = useQuery(api.analytics.getDashboardStats);
  const websites = useQuery(api.websites.list);
  const cookieStats = useQuery(api.cookies.getStats, {});

  if (!stats) {
    return <div>Loading...</div>;
  }

  const privacyScore = stats.privacyScore || 0;
  const scoreColor =
    privacyScore >= 70 ? "text-green-600" : privacyScore >= 40 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-6 w-6 ${scoreColor}`} />
            Privacy Score
            <Badge variant="outline" className="ml-auto">
              <Brain className="h-3 w-3 mr-1" />
              ML-Powered
            </Badge>
          </CardTitle>
          <CardDescription>Your overall privacy health rating with AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">{privacyScore}/100</span>
              <span className={`text-lg font-medium ${scoreColor}`}>
                {privacyScore >= 70 ? "Excellent" : privacyScore >= 40 ? "Good" : "Needs Improvement"}
              </span>
            </div>
            <Progress value={privacyScore} className="h-3" />
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="explainability">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    How is this score calculated?
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium mb-2">Score Components:</p>
                      <ul className="space-y-1 ml-4">
                        <li>• Denied consents: +5 points each</li>
                        <li>• Blocked trackers: +3 points each</li>
                        <li>• Active consent management: +10 bonus</li>
                        <li>• High-risk sites: -10 points each</li>
                        <li>• Unblocked trackers: -2 points each</li>
                      </ul>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="font-medium mb-1">ML Enhancement:</p>
                      <p className="text-muted-foreground">
                        Our AI models analyze your browsing patterns and provide personalized risk assessments
                        based on tracker behavior, cookie usage, and historical data.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Websites Tracked</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWebsites}</div>
              <p className="text-xs text-muted-foreground mt-1">Total sites visited</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cookies Detected</CardTitle>
              <Cookie className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCookies}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {cookieStats?.thirdParty || 0} third-party
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Trackers Blocked</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trackersBlocked}</div>
              <p className="text-xs text-muted-foreground mt-1">
                of {stats.totalTrackers} detected
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Consents Granted</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.consentsGranted}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.consentsDenied} denied
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gamification Points</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.gamificationPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">Keep protecting your privacy!</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}