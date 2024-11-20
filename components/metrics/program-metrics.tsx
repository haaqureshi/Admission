"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ProgramData {
  name: string;
  value: number;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ProgramMetrics() {
  const [programData, setProgramData] = useState<ProgramData[]>([]);

  const calculateProgramMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('program, status');

      if (error) throw error;

      const programCounts = leads.reduce((acc: Record<string, number>, lead) => {
        if (lead.program) {
          acc[lead.program] = (acc[lead.program] || 0) + 1;
        }
        return acc;
      }, {});

      const formattedData = Object.entries(programCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      setProgramData(formattedData);
    } catch (error) {
      console.error("Error fetching program metrics:", error);
    }
  };

  useEffect(() => {
    calculateProgramMetrics();

    const channel = supabase
      .channel('program_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateProgramMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Distribution</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={programData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {programData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}