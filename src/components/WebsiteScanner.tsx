import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Shield, Cookie, Eye } from "lucide-react";
import { toast } from "sonner";

export function WebsiteScanner() {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ cookiesFound: number; trackersFound: number } | null>(null);
  const scanWebsite = useAction(api.websiteScannerPublic.scanWebsite);

  const handleScan = async () => {
    if (!url) {
      toast.error("Please enter a website URL");
      return;
    }

    setIsScanning(true);
    setResult(null);

    try {
      const scanResult = await scanWebsite({ url });
      setResult(scanResult);
      toast.success("Website scan completed!");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to scan website. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Website Scanner</h2>
        <p className="text-muted-foreground mt-2">
          Scan any website to detect cookies and trackers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Website URL</CardTitle>
          <CardDescription>
            We'll analyze the website for cookies, trackers, and privacy risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isScanning}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isScanning) {
                  handleScan();
                }
              }}
            />
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cookies Detected</CardTitle>
              <Cookie className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{result.cookiesFound}</div>
              <p className="text-xs text-muted-foreground">
                Tracking your browsing activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trackers Found</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{result.trackersFound}</div>
              <p className="text-xs text-muted-foreground">
                Third-party tracking scripts
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}