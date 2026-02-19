import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Shield, TrendingUp, Cookie, Eye, Globe, AlertTriangle, Info, Brain, Download, Table as TableIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PrivacyReport() {
  const stats = useQuery(api.analytics.getDashboardStats);
  const reportData = useQuery(api.reports.getReportData, {});
  
  if (!stats) {
    return <div>Loading...</div>;
  }

  const privacyScore = stats.privacyScore || 0;
  const scoreColor =
    privacyScore >= 70 ? "text-green-600" : privacyScore >= 40 ? "text-yellow-600" : "text-red-600";

  // Calculate cookie stats from report data
  const cookieStats = reportData?.reduce(
    (acc, data) => {
      data.cookies.forEach((c) => {
        if (c.isThirdParty) acc.thirdParty++;
      });
      return acc;
    },
    { thirdParty: 0 }
  );

  const handleExportCSV = () => {
    if (!reportData) return;

    const headers = ["Website", "Type", "Name/Domain", "Category/Type", "Status/Risk", "Details"];
    const rows: string[][] = [];

    reportData.forEach((data) => {
      // Add Cookies
      data.cookies.forEach((cookie) => {
        rows.push([
          data.website.url,
          "Cookie",
          cookie.name,
          cookie.category,
          "Detected",
          cookie.purpose || "N/A"
        ]);
      });

      // Add Trackers
      data.trackers.forEach((tracker) => {
        rows.push([
          data.website.url,
          "Tracker",
          tracker.domain,
          tracker.type,
          tracker.blocked ? "Blocked" : "Allowed",
          tracker.riskLevel || "N/A"
        ]);
      });
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "privacy_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Privacy Report</h2>
        <Button onClick={handleExportCSV} disabled={!reportData || reportData.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Detailed Findings
          </CardTitle>
          <CardDescription>
            Comprehensive list of all detected cookies and trackers across scanned websites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trackers" className="w-full">
            <TabsList>
              <TabsTrigger value="trackers">Trackers Detected</TabsTrigger>
              <TabsTrigger value="cookies">Cookies Found</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trackers">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Website</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData?.flatMap((data) =>
                      data.trackers.map((tracker, i) => (
                        <TableRow key={`${data.website._id}-tracker-${i}`}>
                          <TableCell className="font-medium">{data.website.url}</TableCell>
                          <TableCell>{tracker.domain}</TableCell>
                          <TableCell>{tracker.type}</TableCell>
                          <TableCell>
                            <Badge variant={tracker.blocked ? "destructive" : "outline"}>
                              {tracker.blocked ? "Blocked" : "Allowed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{tracker.riskLevel || "Unknown"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {(!reportData || reportData.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No trackers detected yet. Scan a website to see results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="cookies">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Website</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Purpose</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData?.flatMap((data) =>
                      data.cookies.map((cookie, i) => (
                        <TableRow key={`${data.website._id}-cookie-${i}`}>
                          <TableCell className="font-medium">{data.website.url}</TableCell>
                          <TableCell className="font-mono text-xs">{cookie.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{cookie.category}</Badge>
                          </TableCell>
                          <TableCell>{cookie.domain}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {cookie.purpose || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {(!reportData || reportData.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No cookies detected yet. Scan a website to see results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}