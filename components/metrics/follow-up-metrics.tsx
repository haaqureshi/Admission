"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { 
  format, 
  differenceInDays, 
  isAfter, 
  isBefore, 
  parseISO, 
  startOfDay,
  endOfDay,
  addDays
} from "date-fns";

interface FollowUpMetrics {
  totalFollowUps: number;
  completedFollowUps: number;
  pendingFollowUps: number;
  overdueFollowUps: number;
  averageFollowUpTime: number;
  conversionAfterFollowUp: number;
  followUpCompletionRate: number;
  statusTransitions: {
    status: string;
    count: number;
  }[];
  timeToConversion: {
    range: string;
    count: number;
  }[];
  followUpTrends: {
    date: string;
    scheduled: number;
    completed: number;
    conversion: number;
  }[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function FollowUpMetrics() {
  const [metrics, setMetrics] = useState<FollowUpMetrics>({
    totalFollowUps: 0,
    completedFollowUps: 0,
    pendingFollowUps: 0,
    overdueFollowUps: 0,
    averageFollowUpTime: 0,
    conversionAfterFollowUp: 0,
    followUpCompletionRate: 0,
    statusTransitions: [],
    timeToConversion: [],
    followUpTrends: []
  });
  const [loading, setLoading] = useState(true);

  const calculateFollowUpMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const today = startOfDay(new Date());
      let totalFollowUps = 0;
      let completedFollowUps = 0;
      let pendingFollowUps = 0;
      let overdueFollowUps = 0;
      let followUpTimes: number[] = [];
      let conversionsAfterFollowUp = 0;
      
      // Status transition tracking
      const statusChanges: Record<string, number> = {};
      const conversionTimes: number[] = [];

      // Daily tracking for trends
      const dailyStats: Record<string, { scheduled: number; completed: number; conversion: number }> = {};

      leads.forEach(lead => {
        if (lead.follow_up_date) {
          const followUpDate = parseISO(lead.follow_up_date);
          totalFollowUps++;

          // Track daily stats
          const dateKey = format(followUpDate, 'yyyy-MM-dd');
          if (!dailyStats[dateKey]) {
            dailyStats[dateKey] = { scheduled: 0, completed: 0, conversion: 0 };
          }
          dailyStats[dateKey].scheduled++;

          if (lead.pulse) {
            completedFollowUps++;
            dailyStats[dateKey].completed++;
            
            const followUpTime = differenceInDays(
              parseISO(lead.updated_at),
              followUpDate
            );
            followUpTimes.push(Math.abs(followUpTime));

            if (lead.status === "Won") {
              conversionsAfterFollowUp++;
              dailyStats[dateKey].conversion++;
              
              const timeToConversion = differenceInDays(
                parseISO(lead.updated_at),
                parseISO(lead.created_at)
              );
              conversionTimes.push(timeToConversion);
            }
          } else if (isBefore(followUpDate, today)) {
            overdueFollowUps++;
          } else {
            pendingFollowUps++;
          }

          // Track status transitions
          if (lead.status) {
            statusChanges[lead.status] = (statusChanges[lead.status] || 0) + 1;
          }
        }
      });

      // Calculate time to conversion ranges
      const timeToConversionRanges = [
        { range: "1-7 days", count: 0 },
        { range: "8-14 days", count: 0 },
        { range: "15-30 days", count: 0 },
        { range: "30+ days", count: 0 }
      ];

      conversionTimes.forEach(days => {
        if (days <= 7) timeToConversionRanges[0].count++;
        else if (days <= 14) timeToConversionRanges[1].count++;
        else if (days <= 30) timeToConversionRanges[2].count++;
        else timeToConversionRanges[3].count++;
      });

      // Format trend data
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = format(addDays(today, -29 + i), 'yyyy-MM-dd');
        const stats = dailyStats[date] || { scheduled: 0, completed: 0, conversion: 0 };
        return {
          date: format(parseISO(date), 'MMM dd'),
          ...stats
        };
      });

      setMetrics({
        totalFollowUps,
        completedFollowUps,
        pendingFollowUps,
        overdueFollowUps,
        averageFollowUpTime: followUpTimes.length > 0
          ? followUpTimes.reduce((a, b) => a + b, 0) / followUpTimes.length
          : 0,
        conversionAfterFollowUp: totalFollowUps > 0
          ? (conversionsAfterFollowUp / totalFollowUps) * 100
          : 0,
        followUpCompletionRate: totalFollowUps > 0
          ? (completedFollowUps / totalFollowUps) * 100
          : 0,
        statusTransitions: Object.entries(statusChanges).map(([status, count]) => ({
          status,
          count
        })),
        timeToConversion: timeToConversionRanges,
        followUpTrends: last30Days
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching follow-up metrics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateFollowUpMetrics();

    const channel = supabase
      .channel('follow_up_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateFollowUpMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div>Loading follow-up metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-up Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.followUpCompletionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.completedFollowUps} of {metrics.totalFollowUps} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion After Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.conversionAfterFollowUp.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Success rate after follow-ups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Follow-up Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageFollowUpTime.toFixed(1)} days
            </div>
            <p className="text-xs text-muted-foreground">
              Time to complete follow-ups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.overdueFollowUps}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Follow-up Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>30-Day Follow-up Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.followUpTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="scheduled" 
                  stroke={COLORS[0]} 
                  name="Scheduled"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={COLORS[1]} 
                  name="Completed"
                />
                <Line 
                  type="monotone" 
                  dataKey="conversion" 
                  stroke={COLORS[2]} 
                  name="Conversions"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status After Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.statusTransitions}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {metrics.statusTransitions.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time to Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Time to Conversion</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.timeToConversion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  name="Conversions"
                >
                  {metrics.timeToConversion.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}