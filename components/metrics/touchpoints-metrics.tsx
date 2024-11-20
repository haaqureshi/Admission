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
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachMonthOfInterval, 
  subMonths,
  parseISO
} from "date-fns";

interface TouchpointStats {
  range: string;
  count: number;
  conversionRate: number;
}

interface ProgramTouchpoints {
  program: string;
  averageTouchpoints: number;
  conversionRate: number;
}

interface MonthlyTrend {
  month: string;
  averageTouchpoints: number;
  conversionRate: number;
}

interface TouchpointMetrics {
  averageTouchpoints: number;
  conversionRate: number;
  touchpointStats: TouchpointStats[];
  programTouchpoints: ProgramTouchpoints[];
  monthlyTrends: MonthlyTrend[];
  criticalMetrics: {
    fastestConversion: number;
    optimalTouchpoints: number;
    overengagedLeads: number;
    underengagedLeads: number;
  };
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const TOUCHPOINT_RANGES = [
  { min: 1, max: 2, label: "1-2 touchpoints" },
  { min: 3, max: 5, label: "3-5 touchpoints" },
  { min: 6, max: 8, label: "6-8 touchpoints" },
  { min: 9, max: 12, label: "9-12 touchpoints" },
  { min: 13, max: Infinity, label: "13+ touchpoints" }
];

export function TouchpointsMetrics() {
  const [metrics, setMetrics] = useState<TouchpointMetrics>({
    averageTouchpoints: 0,
    conversionRate: 0,
    touchpointStats: [],
    programTouchpoints: [],
    monthlyTrends: [],
    criticalMetrics: {
      fastestConversion: 0,
      optimalTouchpoints: 0,
      overengagedLeads: 0,
      underengagedLeads: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const calculateTouchpoints = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate touchpoints for each lead
      const leadTouchpoints = leads.map(lead => {
        let touchpoints = 0;
        
        // Count different types of interactions
        if (lead.pulse) touchpoints++;
        if (lead.follow_up_date) touchpoints++;
        if (lead.communication) touchpoints++;
        if (lead.status !== "No Contact") touchpoints++;
        
        return {
          ...lead,
          touchpoints,
          converted: lead.status === "Won"
        };
      });

      // Calculate average touchpoints and conversion rate
      const totalTouchpoints = leadTouchpoints.reduce((sum, lead) => sum + lead.touchpoints, 0);
      const averageTouchpoints = totalTouchpoints / leadTouchpoints.length;
      const convertedLeads = leadTouchpoints.filter(lead => lead.converted).length;
      const conversionRate = (convertedLeads / leadTouchpoints.length) * 100;

      // Calculate touchpoint range statistics
      const touchpointStats = TOUCHPOINT_RANGES.map(range => {
        const leadsInRange = leadTouchpoints.filter(
          lead => lead.touchpoints >= range.min && lead.touchpoints <= range.max
        );
        const convertedInRange = leadsInRange.filter(lead => lead.converted).length;
        
        return {
          range: range.label,
          count: leadsInRange.length,
          conversionRate: leadsInRange.length > 0 
            ? (convertedInRange / leadsInRange.length) * 100 
            : 0
        };
      });

      // Calculate program-specific touchpoint metrics
      const programTouchpoints = Object.values(
        leadTouchpoints.reduce((acc: Record<string, any>, lead) => {
          const program = lead.program || 'Not Set';
          
          if (!acc[program]) {
            acc[program] = {
              program,
              totalTouchpoints: 0,
              totalLeads: 0,
              converted: 0
            };
          }

          acc[program].totalTouchpoints += lead.touchpoints;
          acc[program].totalLeads++;
          if (lead.converted) acc[program].converted++;

          return acc;
        }, {})
      ).map((data: any) => ({
        program: data.program,
        averageTouchpoints: data.totalTouchpoints / data.totalLeads,
        conversionRate: (data.converted / data.totalLeads) * 100
      }));

      // Calculate monthly trends
      const last6Months = eachMonthOfInterval({
        start: startOfMonth(subMonths(new Date(), 5)),
        end: endOfMonth(new Date())
      });

      const monthlyTrends = last6Months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthLeads = leadTouchpoints.filter(lead => {
          const leadDate = parseISO(lead.created_at);
          return leadDate >= monthStart && leadDate <= monthEnd;
        });

        const monthTouchpoints = monthLeads.reduce((sum, lead) => sum + lead.touchpoints, 0);
        const monthConverted = monthLeads.filter(lead => lead.converted).length;

        return {
          month: format(month, 'MMM yyyy'),
          averageTouchpoints: monthLeads.length > 0 ? monthTouchpoints / monthLeads.length : 0,
          conversionRate: monthLeads.length > 0 ? (monthConverted / monthLeads.length) * 100 : 0
        };
      });

      // Calculate critical metrics
      const convertedLeadTouchpoints = leadTouchpoints.filter(lead => lead.converted);
      const fastestConversion = convertedLeadTouchpoints.length > 0
        ? Math.min(...convertedLeadTouchpoints.map(lead => lead.touchpoints))
        : 0;

      const optimalTouchpoints = touchpointStats.reduce((optimal, stat) => 
        stat.conversionRate > optimal.conversionRate ? stat : optimal
      ).range;

      const overengagedLeads = leadTouchpoints.filter(
        lead => lead.touchpoints > 12 && !lead.converted
      ).length;

      const underengagedLeads = leadTouchpoints.filter(
        lead => lead.touchpoints < 3 && !lead.converted && 
        new Date(lead.created_at) < subMonths(new Date(), 1)
      ).length;

      setMetrics({
        averageTouchpoints,
        conversionRate,
        touchpointStats,
        programTouchpoints,
        monthlyTrends,
        criticalMetrics: {
          fastestConversion,
          optimalTouchpoints: parseInt(optimalTouchpoints),
          overengagedLeads,
          underengagedLeads
        }
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching touchpoint metrics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateTouchpoints();

    const channel = supabase
      .channel('touchpoint_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateTouchpoints
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div>Loading touchpoint metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Touchpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.averageTouchpoints.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per lead interaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimal Touchpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.criticalMetrics.optimalTouchpoints}
            </div>
            <p className="text-xs text-muted-foreground">
              For highest conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over-engaged Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.criticalMetrics.overengagedLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              Need strategy review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under-engaged Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.criticalMetrics.underengagedLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              Need more follow-up
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Conversion Rate by Touchpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate by Touchpoints</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.touchpointStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion Rate"]}
                />
                <Bar 
                  dataKey="conversionRate" 
                  fill="hsl(var(--primary))"
                  name="Conversion Rate"
                >
                  {metrics.touchpointStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Program Touchpoint Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Program Touchpoint Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.programTouchpoints} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="program" width={100} />
                <Tooltip />
                <Bar 
                  dataKey="averageTouchpoints" 
                  fill="hsl(var(--chart-2))"
                  name="Average Touchpoints"
                >
                  {metrics.programTouchpoints.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Touchpoint Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="averageTouchpoints"
                  stroke={COLORS[0]}
                  name="Avg Touchpoints"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="conversionRate"
                  stroke={COLORS[1]}
                  name="Conversion Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Touchpoint Distribution */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Touchpoint Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.touchpointStats}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {metrics.touchpointStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}