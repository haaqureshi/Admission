"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from "recharts";
import { format, differenceInHours, differenceInMinutes, parseISO } from "date-fns";

interface ResponseTimeData {
  averageResponseTime: number;
  responseWithin1Hour: number;
  responseWithin24Hours: number;
  totalLeads: number;
  dailyAverages: {
    date: string;
    averageTime: number;
  }[];
}

export function ResponseTimeMetrics() {
  const [metrics, setMetrics] = useState<ResponseTimeData>({
    averageResponseTime: 0,
    responseWithin1Hour: 0,
    responseWithin24Hours: 0,
    totalLeads: 0,
    dailyAverages: [],
  });

  const calculateResponseMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const responseTimes = leads
        .filter(lead => lead.pulse) // Only consider leads with updates
        .map(lead => {
          const createdAt = parseISO(lead.created_at);
          const firstResponse = parseISO(lead.updated_at);
          return differenceInMinutes(firstResponse, createdAt);
        })
        .filter(time => time >= 0); // Filter out invalid times

      const totalLeads = responseTimes.length;
      const averageTime = totalLeads > 0 
        ? responseTimes.reduce((acc, time) => acc + time, 0) / totalLeads 
        : 0;

      const within1Hour = responseTimes.filter(time => time <= 60).length;
      const within24Hours = responseTimes.filter(time => time <= 1440).length;

      // Calculate daily averages for the last 30 days
      const dailyData = leads.reduce((acc: Record<string, number[]>, lead) => {
        if (lead.pulse) {
          const date = format(parseISO(lead.created_at), 'yyyy-MM-dd');
          const responseTime = differenceInMinutes(
            parseISO(lead.updated_at),
            parseISO(lead.created_at)
          );
          
          if (responseTime >= 0) {
            if (!acc[date]) acc[date] = [];
            acc[date].push(responseTime);
          }
        }
        return acc;
      }, {});

      const dailyAverages = Object.entries(dailyData)
        .map(([date, times]) => ({
          date,
          averageTime: times.reduce((acc, time) => acc + time, 0) / times.length,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

      setMetrics({
        averageResponseTime: Number((averageTime / 60).toFixed(1)), // Convert to hours
        responseWithin1Hour: totalLeads > 0 ? (within1Hour / totalLeads) * 100 : 0,
        responseWithin24Hours: totalLeads > 0 ? (within24Hours / totalLeads) * 100 : 0,
        totalLeads,
        dailyAverages,
      });
    } catch (error) {
      console.error("Error fetching response time metrics:", error);
    }
  };

  useEffect(() => {
    calculateResponseMetrics();

    const channel = supabase
      .channel('response_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateResponseMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} mins`;
    }
    return `${hours.toFixed(1)} hrs`;
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.averageResponseTime)}</div>
            <p className="text-xs text-muted-foreground">Time to first contact</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">1-Hour Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseWithin1Hour.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Leads contacted within 1 hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24-Hour Response Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseWithin24Hours.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Leads contacted within 24 hours</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Response Time Trend (30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.dailyAverages}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), "MMM d")}
              />
              <YAxis 
                tickFormatter={(value) => `${(value / 60).toFixed(1)}h`}
              />
              <Tooltip 
                formatter={(value: number) => [formatDuration(value / 60), "Avg Response Time"]}
                labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")}
              />
              <ReferenceLine 
                y={60} 
                stroke="rgba(255, 100, 100, 0.5)" 
                strokeDasharray="3 3"
                label={{ value: "1 hour target", position: "insideTopLeft" }}
              />
              <Line 
                type="monotone" 
                dataKey="averageTime" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}