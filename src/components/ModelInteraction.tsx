import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Shield, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ModelExplainability } from "./ModelExplainability";
import { motion } from "framer-motion";

export function ModelInteraction() {
  const [activeTab, setActiveTab] = useState("tracker");
  
  // Tracker Classification
  const [trackerDomain, setTrackerDomain] = useState("");
  const [requestPattern, setRequestPattern] = useState("");
  const [trackerResult, setTrackerResult] = useState<any>(null);
  const [isTrackerLoading, setIsTrackerLoading] = useState(false);
  const predictTracker = useAction(api.mlPredictions.predictTrackerRisk);

  // Privacy Risk
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [cookieCount, setCookieCount] = useState(0);
  const [trackerCount, setTrackerCount] = useState(0);
  const [riskResult, setRiskResult] = useState<any>(null);
  const [isRiskLoading, setIsRiskLoading] = useState(false);
  const predictRisk = useAction(api.mlPredictions.predictPrivacyRisk);

  // Policy Analysis
  const [policyText, setPolicyText] = useState("");
  const [policyResult, setPolicyResult] = useState<any>(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);
  const analyzePolicy = useAction(api.mlPredictions.analyzePolicy);

  const handleTrackerPrediction = async () => {
    if (!trackerDomain || !requestPattern) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsTrackerLoading(true);
    try {
      const result = await predictTracker({ domain: trackerDomain, requestPattern });
      setTrackerResult(result);
      if (result.success) {
        toast.success("Tracker classified successfully!");
      } else {
        toast.warning("Using fallback classification");
      }
    } catch (error) {
      toast.error("Failed to classify tracker");
    } finally {
      setIsTrackerLoading(false);
    }
  };

  const handleRiskPrediction = async () => {
    if (!websiteUrl) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsRiskLoading(true);
    try {
      const result = await predictRisk({ websiteUrl, cookieCount, trackerCount });
      setRiskResult(result);
      if (result.success) {
        toast.success("Risk assessment completed!");
      } else {
        toast.warning("Using fallback risk calculation");
      }
    } catch (error) {
      toast.error("Failed to assess risk");
    } finally {
      setIsRiskLoading(false);
    }
  };

  const handlePolicyAnalysis = async () => {
    if (!policyText.trim()) {
      toast.error("Please enter policy text");
      return;
    }

    setIsPolicyLoading(true);
    try {
      const result = await analyzePolicy({ policyText });
      setPolicyResult(result);
      if (result.success) {
        toast.success("Policy analyzed successfully!");
      } else {
        toast.warning("Using fallback analysis");
      }
    } catch (error) {
      toast.error("Failed to analyze policy");
    } finally {
      setIsPolicyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          ML Model Interaction
        </h2>
        <p className="text-muted-foreground mt-2">
          Test and interact with our machine learning models directly
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracker">Tracker Classification</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="policy">Policy Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Tracker Classification
              </CardTitle>
              <CardDescription>
                Classify a tracker domain and assess its risk level using ML
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tracker-domain">Tracker Domain</Label>
                <Input
                  id="tracker-domain"
                  placeholder="e.g., doubleclick.net"
                  value={trackerDomain}
                  onChange={(e) => setTrackerDomain(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-pattern">Request Pattern</Label>
                <Input
                  id="request-pattern"
                  placeholder="e.g., GET /ads/tracking.js"
                  value={requestPattern}
                  onChange={(e) => setRequestPattern(e.target.value)}
                />
              </div>
              <Button onClick={handleTrackerPrediction} disabled={isTrackerLoading} className="w-full">
                {isTrackerLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Classifying...
                  </>
                ) : (
                  "Classify Tracker"
                )}
              </Button>

              {trackerResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Type:</span>
                      <Badge>{trackerResult.success ? trackerResult.prediction.type : trackerResult.fallback.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Risk Level:</span>
                      <Badge variant={
                        (trackerResult.success ? trackerResult.prediction.riskLevel : trackerResult.fallback.riskLevel) === "high" ? "destructive" : "default"
                      }>
                        {trackerResult.success ? trackerResult.prediction.riskLevel : trackerResult.fallback.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Should Block:</span>
                      <Badge variant={
                        (trackerResult.success ? trackerResult.prediction.shouldBlock : trackerResult.fallback.shouldBlock) ? "destructive" : "secondary"
                      }>
                        {(trackerResult.success ? trackerResult.prediction.shouldBlock : trackerResult.fallback.shouldBlock) ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>

                  {trackerResult.success && trackerResult.explainability && (
                    <ModelExplainability
                      decision={`Classified as ${trackerResult.prediction.type} with ${trackerResult.prediction.riskLevel} risk`}
                      confidence={trackerResult.explainability.confidence / 100}
                      factors={trackerResult.explainability.keyFeatures.map((feature: string) => ({
                        factor: feature,
                        impact: "medium" as const,
                        description: feature,
                      }))}
                      modelVersion={trackerResult.modelInfo?.name}
                    />
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Privacy Risk Assessment
              </CardTitle>
              <CardDescription>
                Calculate personalized privacy risk score for a website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website-url">Website URL</Label>
                <Input
                  id="website-url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cookie-count">Cookie Count</Label>
                  <Input
                    id="cookie-count"
                    type="number"
                    min="0"
                    value={cookieCount}
                    onChange={(e) => setCookieCount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracker-count">Tracker Count</Label>
                  <Input
                    id="tracker-count"
                    type="number"
                    min="0"
                    value={trackerCount}
                    onChange={(e) => setTrackerCount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <Button onClick={handleRiskPrediction} disabled={isRiskLoading} className="w-full">
                {isRiskLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assessing...
                  </>
                ) : (
                  "Assess Risk"
                )}
              </Button>

              {riskResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Risk Score:</span>
                      <span className="text-2xl font-bold">
                        {riskResult.success ? riskResult.prediction.score : riskResult.fallback.score}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Risk Level:</span>
                      <Badge variant={
                        (riskResult.success ? riskResult.prediction.level : riskResult.fallback.level) === "high" ? "destructive" : "default"
                      }>
                        {riskResult.success ? riskResult.prediction.level : riskResult.fallback.level}
                      </Badge>
                    </div>
                  </div>

                  {riskResult.success && riskResult.explainability && (
                    <ModelExplainability
                      decision={`Risk Score: ${riskResult.prediction.score}/100 (${riskResult.prediction.level})`}
                      confidence={riskResult.explainability.confidence / 100}
                      factors={riskResult.prediction.factors.map((factor: string) => ({
                        factor,
                        impact: "medium" as const,
                        description: factor,
                      }))}
                      modelVersion={riskResult.modelInfo?.name}
                    />
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Privacy Policy Analysis
              </CardTitle>
              <CardDescription>
                Analyze privacy policy text using NLP models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="policy-text">Privacy Policy Text</Label>
                <Textarea
                  id="policy-text"
                  placeholder="Paste privacy policy text here..."
                  rows={8}
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                />
              </div>
              <Button onClick={handlePolicyAnalysis} disabled={isPolicyLoading} className="w-full">
                {isPolicyLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Policy"
                )}
              </Button>

              {policyResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Analysis Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">
                          {policyResult.success ? policyResult.analysis : policyResult.fallback.analysis}
                        </p>
                      </div>
                      {policyResult.success && policyResult.explainability && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Analysis Method:</p>
                          <p className="text-sm text-muted-foreground">{policyResult.explainability.method}</p>
                          <p className="text-sm font-medium mt-2 mb-1">Confidence:</p>
                          <p className="text-sm text-muted-foreground">{policyResult.explainability.confidence}%</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
