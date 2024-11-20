"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StatusData {
  status: string;
  count: number;
}

export function StatusMetrics() {
  const [statusData, setStatusData] = useState<StatusData[]>([]);

  const calculateStatusMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status');

      if (error) throw error;

      const statusCounts = leads.reduce((acc: Record<string, number>, lead) => {
        if (lead.status) {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
        }
        return acc;
      }, {});

      const formattedData = Object.entries(statusCounts)
        .map(([status, count]) => ({ status, count }))
        .sort((a, b) => b.count - a.count);

      setStatusData(formattedData);
    } catch (error) {
      console.error("Error fetching status metrics:", error);
    }
  };

  useEffect(() => {
    calculateStatusMetrics();

    const channel = supabase
      .channel('status_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateStatusMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusData} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="status" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}