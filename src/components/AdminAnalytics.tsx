import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, TrendingUp, Users, XCircle } from "lucide-react";

export function AdminAnalytics() {
  const stats = useQuery(api.analytics.getStats, {});
  const trends = useQuery(api.analytics.getTrends, { days: 30 });

  if (!stats) {
    return <div>Loading...</div>;
  }

  const statCards = [
    {
      title: "Total Consents",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-green-600",
    },
    {
      title: "Revoked",
      value: stats.revoked,
      icon: XCircle,
      color: "text-red-600",
    },
    {
      title: "Acceptance Rate",
      value: `${stats.acceptanceRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Monitor consent trends and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Consent preferences by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {trends && trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consent Trends (Last 30 Days)</CardTitle>
            <CardDescription>Daily consent submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {trends.map((trend) => (
                <div
                  key={trend.date}
                  className="flex-1 bg-primary rounded-t"
                  style={{
                    height: `${(trend.count / Math.max(...trends.map(t => t.count))) * 100}%`,
                    minHeight: "4px",
                  }}
                  title={`${trend.date}: ${trend.count} consents`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
