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
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line
} from "recharts";
import { 
  differenceInDays, 
  parseISO, 
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths
} from "date-fns";
import { Badge } from "@/components/ui/badge";

interface AgingMetrics {
  byStatus: {
    status: string;
    averageAge: number;
    count: number;
  }[];
  byAgeGroup: {
    range: string;
    count: number;
    percentage: number;
  }[];
  oldestLeads: {
    id: string;
    name: string;
    status: string;
    age: number;
    program: string;
  }[];
  monthlyAging: {
    month: string;
    averageAge: number;
  }[];
  criticalMetrics: {
    totalLeads: number;
    averageAge: number;
    criticalLeads: number;
    healthScore: number;
  };
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const AGE_RANGES = [
  { min: 0, max: 7, label: "1 week or less" },
  { min: 8, max: 14, label: "1-2 weeks" },
  { min: 15, max: 30, label: "15-30 days" },
  { min: 31, max: 60, label: "1-2 months" },
  { min: 61, max: 90, label: "2-3 months" },
  { min: 91, max: Infinity, label: "Over 3 months" }
];

const getAgeRange = (age: number) => {
  const range = AGE_RANGES.find(r => age >= r.min && age <= r.max);
  return range?.label || "Over 3 months";
};

const getHealthScore = (averageAge: number, criticalPercentage: number) => {
  const ageScore = Math.max(0, 100 - (averageAge / 30) * 25);
  const criticalScore = Math.max(0, 100 - criticalPercentage * 2);
  return Math.round((ageScore + criticalScore) / 2);
};

export function LeadAgingMetrics() {
  const [metrics, setMetrics] = useState<AgingMetrics>({
    byStatus: [],
    byAgeGroup: [],
    oldestLeads: [],
    monthlyAging: [],
    criticalMetrics: {
      totalLeads: 0,
      averageAge: 0,
      criticalLeads: 0,
      healthScore: 0
    }
  });
  const [loading, setLoading] = useState(true);

  const calculateAgingMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const today = new Date();
      const leadAges = leads.map(lead => ({
        ...lead,
        age: differenceInDays(today, parseISO(lead.created_at))
      }));

      // Calculate metrics by status
      const statusGroups = leadAges.reduce((acc: Record<string, any[]>, lead) => {
        if (!acc[lead.status]) acc[lead.status] = [];
        acc[lead.status].push(lead.age);
        return acc;
      }, {});

      const byStatus = Object.entries(statusGroups).map(([status, ages]) => ({
        status,
        averageAge: Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length),
        count: ages.length
      }));

      // Calculate age group distribution
      const ageGroups = leadAges.reduce((acc: Record<string, number>, lead) => {
        const range = getAgeRange(lead.age);
        acc[range] = (acc[range] || 0) + 1;
        return acc;
      }, {});

      const byAgeGroup = Object.entries(ageGroups).map(([range, count]) => ({
        range,
        count,
        percentage: (count / leadAges.length) * 100
      }));

      // Get oldest leads
      const oldestLeads = leadAges
        .sort((a, b) => b.age - a.age)
        .slice(0, 5)
        .map(lead => ({
          id: lead.id,
          name: lead.name,
          status: lead.status,
          age: lead.age,
          program: lead.program
        }));

      // Calculate monthly aging trends
      const last6Months = eachMonthOfInterval({
        start: startOfMonth(subMonths(today, 5)),
        end: endOfMonth(today)
      });

      const monthlyAging = last6Months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthLeads = leadAges.filter(lead => {
          const createdDate = parseISO(lead.created_at);
          return createdDate >= monthStart && createdDate <= monthEnd;
        });

        const averageAge = monthLeads.length > 0
          ? Math.round(monthLeads.reduce((sum, lead) => sum + lead.age, 0) / monthLeads.length)
          : 0;

        return {
          month: format(month, 'MMM yyyy'),
          averageAge
        };
      });

      // Calculate critical metrics
      const totalLeads = leadAges.length;
      const averageAge = Math.round(
        leadAges.reduce((sum, lead) => sum + lead.age, 0) / totalLeads
      );
      const criticalLeads = leadAges.filter(lead => 
        lead.age > 30 && !["Won", "Not Interested", "Not Affordable"].includes(lead.status)
      ).length;
      const criticalPercentage = (criticalLeads / totalLeads) * 100;
      const healthScore = getHealthScore(averageAge, criticalPercentage);

      setMetrics({
        byStatus,
        byAgeGroup,
        oldestLeads,
        monthlyAging,
        criticalMetrics: {
          totalLeads,
          averageAge,
          criticalLeads,
          healthScore
        }
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching aging metrics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateAgingMetrics();

    const channel = supabase
      .channel('aging_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateAgingMetrics
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div>Loading aging metrics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.criticalMetrics.healthScore}/100
            </div>
            <p className="text-xs text-muted-foreground">
              Overall pipeline health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lead Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.criticalMetrics.averageAge} days
            </div>
            <p className="text-xs text-muted-foreground">
              Across all active leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.criticalMetrics.criticalLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              Leads requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.criticalMetrics.totalLeads}
            </div>
            <p className="text-xs text-muted-foreground">
              In current pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Age Distribution by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Average Age by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit=" days" />
                <YAxis dataKey="status" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="averageAge" name="Average Age">
                  {metrics.byStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Age Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.byAgeGroup}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {metrics.byAgeGroup.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Aging Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Average Lead Age Trend (6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlyAging}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis unit=" days" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="averageAge" 
                  stroke={COLORS[0]} 
                  strokeWidth={2}
                  name="Average Age"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Oldest Leads Table */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Oldest Leads Requiring Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.oldestLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{lead.name}</h4>
                    <p className="text-sm text-muted-foreground">{lead.program}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {lead.status}
                    </Badge>
                    <Badge variant="destructive">
                      {lead.age} days old
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}