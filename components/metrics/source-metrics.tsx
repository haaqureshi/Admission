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
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

interface SourceMetrics {
  source: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  qualityScore: number;
}

interface MonthlySourceData {
  date: string;
  [key: string]: number | string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function SourceMetrics() {
  const [metrics, setMetrics] = useState<SourceMetrics[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySourceData[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateSourceMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate metrics for each source
      const sourceStats = leads.reduce((acc: Record<string, any>, lead) => {
        const source = lead.source || 'Unknown';
        
        if (!acc[source]) {
          acc[source] = {
            source,
            totalLeads: 0,
            convertedLeads: 0,
            responseTimes: [],
            qualityPoints: 0,
          };
        }

        acc[source].totalLeads++;

        // Track converted leads
        if (lead.status === "Won") {
          acc[source].convertedLeads++;
        }

        // Calculate response time
        if (lead.pulse) {
          const responseTime = new Date(lead.updated_at).getTime() - new Date(lead.created_at).getTime();
          acc[source].responseTimes.push(responseTime / (1000 * 60)); // Convert to minutes
        }

        // Calculate quality score based on multiple factors
        let qualityPoints = 0;
        if (lead.status === "Won") qualityPoints += 5;
        if (lead.status === "Interested") qualityPoints += 3;
        if (lead.pulse) qualityPoints += 2;
        if (lead.follow_up_date) qualityPoints += 1;
        acc[source].qualityPoints += qualityPoints;

        return acc;
      }, {});

      // Format metrics
      const formattedMetrics = Object.values(sourceStats).map((stats: any) => ({
        source: stats.source,
        totalLeads: stats.totalLeads,
        convertedLeads: stats.convertedLeads,
        conversionRate: (stats.convertedLeads / stats.totalLeads) * 100,
        averageResponseTime: stats.responseTimes.length > 0
          ? stats.responseTimes.reduce((a: number, b: number) => a + b, 0) / stats.responseTimes.length
          : 0,
        qualityScore: (stats.qualityPoints / (stats.totalLeads * 11)) * 100, // Normalize to 100
      }));

      // Calculate monthly trends
      const last6Months = eachMonthOfInterval({
        start: startOfMonth(subMonths(new Date(), 5)),
        end: endOfMonth(new Date()),
      });

      const monthlyStats = last6Months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthData: MonthlySourceData = {
          date: format(month, 'MMM yyyy'),
        };

        Object.keys(sourceStats).forEach(source => {
          const monthLeads = leads.filter(lead => {
            const leadDate = new Date(lead.created_at);
            return (
              lead.source === source &&
              leadDate >= monthStart &&
              leadDate <= monthEnd
            );
          });

          const converted = monthLeads.filter(lead => lead.status === "Won").length;
          const total = monthLeads.length;
          
          monthData[source] = total > 0 ? (converted / total) * 100 : 0;
        });

        return monthData;
      });

      setMetrics(formattedMetrics);
      setMonthlyData(monthlyStats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching source metrics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSourceMetrics();

    const channel = supabase
      .channel('source_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateSourceMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div>Loading source metrics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Conversion Rates by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Source Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion Rate"]}
                />
                <Bar 
                  dataKey="conversionRate" 
                  fill="hsl(var(--primary))"
                  name="Conversion Rate"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Source Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics}
                  dataKey="totalLeads"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {metrics.map((_, index) => (
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

        {/* Monthly Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Source Performance Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion Rate"]}
                />
                <Legend />
                {metrics.map((source, index) => (
                  <Line
                    key={source.source}
                    type="monotone"
                    dataKey={source.source}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Quality Scores */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Source Quality Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="source" width={100} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Quality Score"]}
                />
                <Bar 
                  dataKey="qualityScore" 
                  fill="hsl(var(--chart-2))"
                  name="Quality Score"
                >
                  {metrics.map((_, index) => (
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