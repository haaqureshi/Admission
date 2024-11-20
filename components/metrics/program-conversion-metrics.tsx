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
import { Badge } from "@/components/ui/badge";

interface ProgramStats {
  program: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageTimeToConversion: number;
  dropoutRate: number;
}

interface MonthlyTrend {
  month: string;
  [key: string]: string | number;
}

interface ProgramMetrics {
  programStats: ProgramStats[];
  monthlyTrends: MonthlyTrend[];
  topPerformers: {
    program: string;
    metric: string;
    value: number;
  }[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ProgramConversionMetrics() {
  const [metrics, setMetrics] = useState<ProgramMetrics>({
    programStats: [],
    monthlyTrends: [],
    topPerformers: []
  });
  const [loading, setLoading] = useState(true);

  const calculateMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate program statistics
      const programData = leads.reduce((acc: Record<string, any>, lead) => {
        const program = lead.program || 'Not Set';
        
        if (!acc[program]) {
          acc[program] = {
            program,
            totalLeads: 0,
            convertedLeads: 0,
            conversionTimes: [],
            dropouts: 0
          };
        }

        acc[program].totalLeads++;

        if (lead.status === "Won") {
          acc[program].convertedLeads++;
          const conversionTime = new Date(lead.updated_at).getTime() - new Date(lead.created_at).getTime();
          acc[program].conversionTimes.push(conversionTime / (1000 * 60 * 60 * 24)); // Convert to days
        }

        if (["Not Interested", "Not Affordable"].includes(lead.status)) {
          acc[program].dropouts++;
        }

        return acc;
      }, {});

      const programStats = Object.values(programData).map((data: any) => ({
        program: data.program,
        totalLeads: data.totalLeads,
        convertedLeads: data.convertedLeads,
        conversionRate: (data.convertedLeads / data.totalLeads) * 100,
        averageTimeToConversion: data.conversionTimes.length > 0
          ? data.conversionTimes.reduce((a: number, b: number) => a + b, 0) / data.conversionTimes.length
          : 0,
        dropoutRate: (data.dropouts / data.totalLeads) * 100
      }));

      // Calculate monthly trends
      const last6Months = eachMonthOfInterval({
        start: startOfMonth(subMonths(new Date(), 5)),
        end: endOfMonth(new Date())
      });

      const monthlyTrends = last6Months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthData: MonthlyTrend = {
          month: format(month, 'MMM yyyy')
        };

        Object.keys(programData).forEach(program => {
          const monthLeads = leads.filter(lead => {
            const leadDate = parseISO(lead.created_at);
            return (
              lead.program === program &&
              leadDate >= monthStart &&
              leadDate <= monthEnd &&
              lead.status === "Won"
            );
          });

          const totalMonthLeads = leads.filter(lead => {
            const leadDate = parseISO(lead.created_at);
            return (
              lead.program === program &&
              leadDate >= monthStart &&
              leadDate <= monthEnd
            );
          }).length;

          monthData[program] = totalMonthLeads > 0 
            ? (monthLeads.length / totalMonthLeads) * 100 
            : 0;
        });

        return monthData;
      });

      // Identify top performers
      const topPerformers = [
        {
          program: programStats.reduce((a, b) => a.conversionRate > b.conversionRate ? a : b).program,
          metric: "Highest Conversion Rate",
          value: programStats.reduce((a, b) => a.conversionRate > b.conversionRate ? a : b).conversionRate
        },
        {
          program: programStats.reduce((a, b) => a.totalLeads > b.totalLeads ? a : b).program,
          metric: "Most Popular",
          value: programStats.reduce((a, b) => a.totalLeads > b.totalLeads ? a : b).totalLeads
        },
        {
          program: programStats.reduce((a, b) => 
            (a.averageTimeToConversion > 0 && a.averageTimeToConversion < b.averageTimeToConversion) ? a : b
          ).program,
          metric: "Fastest Conversion",
          value: programStats.reduce((a, b) => 
            (a.averageTimeToConversion > 0 && a.averageTimeToConversion < b.averageTimeToConversion) ? a : b
          ).averageTimeToConversion
        }
      ];

      setMetrics({
        programStats,
        monthlyTrends,
        topPerformers
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching program metrics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateMetrics();

    const channel = supabase
      .channel('program_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div>Loading program metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Performers Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.topPerformers.map((performer, index) => (
          <Card key={performer.metric}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{performer.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performer.program}</div>
              <p className="text-xs text-muted-foreground">
                {performer.metric === "Highest Conversion Rate" && `${performer.value.toFixed(1)}%`}
                {performer.metric === "Most Popular" && `${performer.value} leads`}
                {performer.metric === "Fastest Conversion" && `${performer.value.toFixed(1)} days`}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Conversion Rates by Program */}
        <Card>
          <CardHeader>
            <CardTitle>Program Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.programStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="program" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion Rate"]}
                />
                <Bar 
                  dataKey="conversionRate" 
                  fill="hsl(var(--primary))"
                  name="Conversion Rate"
                >
                  {metrics.programStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time to Conversion */}
        <Card>
          <CardHeader>
            <CardTitle>Average Time to Conversion</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.programStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit=" days" />
                <YAxis type="category" dataKey="program" width={100} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)} days`, "Time to Conversion"]}
                />
                <Bar 
                  dataKey="averageTimeToConversion" 
                  fill="hsl(var(--chart-2))"
                  name="Time to Conversion"
                >
                  {metrics.programStats.map((_, index) => (
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
            <CardTitle>Program Performance Trends (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion Rate"]}
                />
                <Legend />
                {metrics.programStats.map((stat, index) => (
                  <Line
                    key={stat.program}
                    type="monotone"
                    dataKey={stat.program}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dropout Rates */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Program Dropout Analysis</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.programStats}
                  dataKey="dropoutRate"
                  nameKey="program"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {metrics.programStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, "Dropout Rate"]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}