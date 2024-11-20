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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachMonthOfInterval, 
  subMonths,
  parseISO,
  differenceInMinutes
} from "date-fns";

interface ChannelStats {
  channel: string;
  totalLeads: number;
  successfulLeads: number;
  successRate: number;
}

interface MonthlyStats {
  month: string;
  [key: string]: string | number;
}

interface ResponseRate {
  channel: string;
  averageResponseTime: number;
  responseRate: number;
}

interface CommunicationMetrics {
  channelStats: ChannelStats[];
  monthlyStats: MonthlyStats[];
  responseRates: ResponseRate[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function CommunicationMetrics() {
  const [metrics, setMetrics] = useState<CommunicationMetrics>({
    channelStats: [],
    monthlyStats: [],
    responseRates: []
  });
  const [loading, setLoading] = useState(true);

  const calculateMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate channel statistics
      const channelData = leads.reduce((acc: Record<string, any>, lead) => {
        const channel = lead.communication || 'Not Set';
        
        if (!acc[channel]) {
          acc[channel] = {
            channel,
            totalLeads: 0,
            successfulLeads: 0,
            responseTimes: []
          };
        }

        acc[channel].totalLeads++;

        if (lead.status === "Won") {
          acc[channel].successfulLeads++;
        }

        if (lead.pulse) {
          const responseTime = differenceInMinutes(
            parseISO(lead.updated_at),
            parseISO(lead.created_at)
          );
          acc[channel].responseTimes.push(responseTime);
        }

        return acc;
      }, {});

      const channelStats = Object.values(channelData).map((data: any) => ({
        channel: data.channel,
        totalLeads: data.totalLeads,
        successfulLeads: data.successfulLeads,
        successRate: (data.successfulLeads / data.totalLeads) * 100
      }));

      // Calculate monthly trends
      const last6Months = eachMonthOfInterval({
        start: startOfMonth(subMonths(new Date(), 5)),
        end: endOfMonth(new Date())
      });

      const monthlyStats = last6Months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthData: MonthlyStats = {
          month: format(month, 'MMM yyyy')
        };

        Object.keys(channelData).forEach(channel => {
          const monthLeads = leads.filter(lead => {
            const leadDate = parseISO(lead.created_at);
            return (
              lead.communication === channel &&
              leadDate >= monthStart &&
              leadDate <= monthEnd &&
              lead.status === "Won"
            );
          });

          monthData[channel] = monthLeads.length;
        });

        return monthData;
      });

      // Calculate response rates
      const responseRates = Object.values(channelData).map((data: any) => ({
        channel: data.channel,
        averageResponseTime: data.responseTimes.length > 0
          ? data.responseTimes.reduce((a: number, b: number) => a + b, 0) / data.responseTimes.length
          : 0,
        responseRate: (data.responseTimes.length / data.totalLeads) * 100
      }));

      setMetrics({
        channelStats,
        monthlyStats,
        responseRates
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching communication metrics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateMetrics();

    const channel = supabase
      .channel('communication_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} mins`;
    }
    return `${(minutes / 60).toFixed(1)} hrs`;
  };

  if (loading) {
    return <div>Loading communication metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Success Rates by Channel */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Success Rates</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.channelStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Success Rate"]}
                />
                <Bar 
                  dataKey="successRate" 
                  fill="hsl(var(--primary))"
                  name="Success Rate"
                >
                  {metrics.channelStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.channelStats}
                  dataKey="totalLeads"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {metrics.channelStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Success Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Channel Performance Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {metrics.channelStats.map((stat, index) => (
                  <Line
                    key={stat.channel}
                    type="monotone"
                    dataKey={stat.channel}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Times */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Channel Response Times</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.responseRates} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="channel" width={100} />
                <Tooltip 
                  formatter={(value: number) => [formatDuration(value), "Avg Response Time"]}
                />
                <Bar 
                  dataKey="averageResponseTime" 
                  fill="hsl(var(--chart-2))"
                  name="Response Time"
                >
                  {metrics.responseRates.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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