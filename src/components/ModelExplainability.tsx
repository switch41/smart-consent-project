import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ExplainabilityProps {
  decision: string;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: "high" | "medium" | "low";
    description: string;
  }>;
  modelVersion?: string;
}

export function ModelExplainability({ decision, confidence, factors, modelVersion }: ExplainabilityProps) {
  const confidencePercent = Math.round(confidence * 100);
  const confidenceColor = confidence > 0.8 ? "text-green-600" : confidence > 0.6 ? "text-yellow-600" : "text-orange-600";

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Model Explanation</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {modelVersion || "ML Model"}
          </Badge>
        </div>
        <CardDescription>Understanding how this decision was made</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Decision Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Decision</span>
            <span className={`text-sm font-semibold ${confidenceColor}`}>
              {confidencePercent}% confident
            </span>
          </div>
          <p className="text-base font-medium">{decision}</p>
          <Progress value={confidencePercent} className="h-2" />
        </div>

        {/* Key Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Key Factors
          </h4>
          <div className="space-y-2">
            {factors.map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="mt-0.5">
                  {factor.impact === "high" ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : factor.impact === "medium" ? (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{factor.factor}</span>
                    <Badge
                      variant={
                        factor.impact === "high"
                          ? "destructive"
                          : factor.impact === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {factor.impact} impact
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Model Info */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          <p>
            This explanation shows how the ML model analyzed the data and made its decision.
            Higher confidence indicates stronger evidence for the classification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
