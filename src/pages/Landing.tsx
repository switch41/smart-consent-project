import { motion } from "framer-motion";
import { Shield, Cookie, Eye, Lock, TrendingUp, Users, Moon, Sun, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { useBrowserSession } from "@/hooks/use-browser-session";
import { Badge } from "@/components/ui/badge";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const { sessionStats, isActive } = useBrowserSession();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="./logo.svg" alt="Logo" className="h-8 w-8 cursor-pointer" onClick={() => navigate("/")} />
            <h1 className="text-xl font-bold tracking-tight">Smart Consent Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && isActive && sessionStats && (
              <Badge variant="outline" className="flex items-center gap-2">
                <Activity className="h-3 w-3 animate-pulse text-green-600" />
                <span className="text-xs">
                  Session: {sessionStats.sitesVisited} sites | {sessionStats.cookiesDetected} cookies | {sessionStats.trackersDetected} trackers
                </span>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="rounded-full"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}>
              {isAuthenticated ? "Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Take Control of Your Privacy
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Smart Consent Manager helps you understand and manage your digital footprint across the web. Track cookies, manage consents, and protect your privacy.
            </p>
            <Button size="lg" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")} className="text-lg px-8 py-6">
              {isAuthenticated ? "Go to Dashboard" : "Start Protecting Your Privacy"}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Powerful Privacy Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Cookie,
                title: "Cookie Tracking",
                description: "Monitor all cookies across websites you visit and understand their purpose.",
                color: "text-orange-600",
              },
              {
                icon: Eye,
                title: "Tracker Detection",
                description: "Identify and block third-party trackers that follow you around the web.",
                color: "text-red-600",
              },
              {
                icon: Lock,
                title: "Consent Management",
                description: "Easily manage your consent preferences for different types of data collection.",
                color: "text-green-600",
              },
              {
                icon: TrendingUp,
                title: "Privacy Score",
                description: "Get a real-time privacy score based on your browsing habits and settings.",
                color: "text-blue-600",
              },
              {
                icon: Shield,
                title: "Risk Assessment",
                description: "AI-powered risk analysis for websites and their data collection practices.",
                color: "text-purple-600",
              },
              {
                icon: Users,
                title: "Gamification",
                description: "Earn points and achievements for maintaining good privacy practices.",
                color: "text-pink-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-lg border-2 bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow"
              >
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-white/80 dark:bg-gray-900/80">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 Smart Consent Manager. Built with privacy in mind.</p>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
    </motion.div>
  );
}