"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

interface ConversionData {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  historicalData: {
    date: string;
    conversionRate: number;
  }[];
}

export function ConversionMetrics() {
  const [metrics, setMetrics] = useState<ConversionData>({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    historicalData: [],
  });

  const calculateMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const totalLeads = leads.length;
      const convertedLeads = leads.filter(lead => lead.status === "Won").length;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      const historicalData = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), i);
        const dateStr = format(date, "yyyy-MM-dd");
        const leadsUntilDate = leads.filter(lead => 
          new Date(lead.created_at) <= date
        );
        const convertedUntilDate = leadsUntilDate.filter(lead => 
          lead.status === "Won"
        ).length;
        const rateUntilDate = leadsUntilDate.length > 0 
          ? (convertedUntilDate / leadsUntilDate.length) * 100 
          : 0;

        return {
          date: dateStr,
          conversionRate: Number(rateUntilDate.toFixed(2)),
        };
      }).reverse();

      setMetrics({
        totalLeads,
        convertedLeads,
        conversionRate: Number(conversionRate.toFixed(2)),
        historicalData,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  useEffect(() => {
    calculateMetrics();

    const channel = supabase
      .channel('conversion_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">Total leads in pipeline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.convertedLeads}</div>
            <p className="text-xs text-muted-foreground">Successfully converted to admissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Overall conversion rate</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>30-Day Conversion Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => format(new Date(date), "MMM d")}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, "Conversion Rate"]}
                labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")}
              />
              <Line 
                type="monotone" 
                dataKey="conversionRate" 
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