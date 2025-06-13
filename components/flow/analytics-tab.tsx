"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Users,
  CheckCircle,
  Target,
  Clock,
  Calendar,
  BarChart3,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  getFlowAnalytics,
  getFlowRecentSessions,
  type FlowAnalyticsSummary,
  type FlowSession,
} from "@/actions/flow-analytics";

interface AnalyticsTabProps {
  flowId: string;
  flowName: string;
}

export function AnalyticsTab({ flowId, flowName }: AnalyticsTabProps) {
  const [analytics, setAnalytics] = useState<FlowAnalyticsSummary | null>(null);
  const [recentSessions, setRecentSessions] = useState<FlowSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      const [analyticsResult, sessionsResult] = await Promise.all([
        getFlowAnalytics(flowId),
        getFlowRecentSessions(flowId, 20),
      ]);

      if (analyticsResult.success && analyticsResult.data) {
        setAnalytics(analyticsResult.data);
      }

      if (sessionsResult.success && sessionsResult.data) {
        setRecentSessions(sessionsResult.data);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadAnalytics();
    setIsRefreshing(false);
    toast.success("Analytics data refreshed");
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadAnalytics();
      setIsLoading(false);
    };

    loadData();
  }, [flowId, loadAnalytics]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto size-8 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No analytics data available
          </p>
        </div>
      </div>
    );
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Usage statistics and insights for {flowName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshData}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_sessions}</div>
            <p className="text-xs text-muted-foreground">
              Times flow was accessed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.completion_rate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.completed_sessions} of {analytics.total_sessions}{" "}
              completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Finalization Rate
            </CardTitle>
            <Target className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.finalization_rate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.finalized_sessions} sessions finalized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Nodes Visited
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.average_nodes_visited}
            </div>
            <p className="text-xs text-muted-foreground">Per session average</p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Timeline */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {analytics.last_used
                  ? formatDistanceToNow(analytics.last_used, {
                      addSuffix: true,
                    })
                  : "Never used"}
              </span>
            </div>
            {analytics.last_used && (
              <p className="mt-1 text-xs text-muted-foreground">
                {analytics.last_used.toLocaleDateString()}{" "}
                {analytics.last_used.toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Last Finalized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm">
                {analytics.last_finalized
                  ? formatDistanceToNow(analytics.last_finalized, {
                      addSuffix: true,
                    })
                  : "Never finalized"}
              </span>
            </div>
            {analytics.last_finalized && (
              <p className="mt-1 text-xs text-muted-foreground">
                {analytics.last_finalized.toLocaleDateString()}{" "}
                {analytics.last_finalized.toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Sessions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest 20 sessions for this flow
          </p>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No sessions recorded yet
              </p>
            </div>
          ) : (
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {recentSessions.map((session, index) => (
                  <div key={session.id}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">
                          Session {session.session_id.slice(-8)}
                        </div>
                        <div className="flex space-x-1">
                          {session.completed_at && (
                            <Badge variant="secondary" className="text-xs">
                              Completed
                            </Badge>
                          )}
                          {session.is_finalized && (
                            <Badge variant="default" className="text-xs">
                              Finalized
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {formatDistanceToNow(session.started_at, {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.total_nodes_visited} nodes
                          {session.duration_minutes &&
                            ` • ${session.duration_minutes}m`}
                        </div>
                      </div>
                    </div>
                    {index < recentSessions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
