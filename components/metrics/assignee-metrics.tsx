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
  Legend
} from "recharts";
import { differenceInMinutes, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AssigneeMetrics {
  name: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  averageResponseTime: number;
  activeLeads: number;
}

export function AssigneeMetrics() {
  const [metrics, setMetrics] = useState<AssigneeMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateAssigneeMetrics = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const assigneeStats = leads.reduce((acc: Record<string, any>, lead) => {
        const assignee = lead["Assign To"];
        if (!assignee) return acc;

        if (!acc[assignee]) {
          acc[assignee] = {
            name: assignee,
            totalLeads: 0,
            convertedLeads: 0,
            responseTimes: [],
            activeLeads: 0
          };
        }

        acc[assignee].totalLeads++;

        // Calculate response time if there's a pulse update
        if (lead.pulse) {
          const responseTime = differenceInMinutes(
            parseISO(lead.updated_at),
            parseISO(lead.created_at)
          );
          if (responseTime >= 0) {
            acc[assignee].responseTimes.push(responseTime);
          }
        }

        // Count converted leads
        if (lead.status === "Won") {
          acc[assignee].convertedLeads++;
        }

        // Count active leads (excluding Won, Not Interested, and Not Affordable)
        if (!["Won", "Not Interested", "Not Affordable"].includes(lead.status)) {
          acc[assignee].activeLeads++;
        }

        return acc;
      }, {});

      const formattedMetrics = Object.values(assigneeStats).map((stats: any) => ({
        name: stats.name,
        totalLeads: stats.totalLeads,
        convertedLeads: stats.convertedLeads,
        conversionRate: (stats.convertedLeads / stats.totalLeads) * 100,
        averageResponseTime: stats.responseTimes.length > 0
          ? stats.responseTimes.reduce((a: number, b: number) => a + b, 0) / stats.responseTimes.length
          : 0,
        activeLeads: stats.activeLeads
      }));

      setMetrics(formattedMetrics);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching assignee metrics:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateAssigneeMetrics();

    const channel = supabase
      .channel('assignee_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        calculateAssigneeMetrics
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

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rate >= 60) return <Badge className="bg-blue-500">Good</Badge>;
    if (rate >= 40) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge className="bg-red-500">Needs Improvement</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading metrics...</div>
          ) : (
            <div className="space-y-6">
              {/* Performance Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Member</TableHead>
                      <TableHead className="text-right">Active Leads</TableHead>
                      <TableHead className="text-right">Total Leads</TableHead>
                      <TableHead className="text-right">Conversion Rate</TableHead>
                      <TableHead className="text-right">Avg Response Time</TableHead>
                      <TableHead className="text-right">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((assignee) => (
                      <TableRow key={assignee.name}>
                        <TableCell className="font-medium">{assignee.name}</TableCell>
                        <TableCell className="text-right">{assignee.activeLeads}</TableCell>
                        <TableCell className="text-right">{assignee.totalLeads}</TableCell>
                        <TableCell className="text-right">
                          {assignee.conversionRate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDuration(assignee.averageResponseTime)}
                        </TableCell>
                        <TableCell className="text-right">
                          {getPerformanceBadge(assignee.conversionRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Conversion Rate Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Rates by Team Member</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
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

              {/* Response Time Comparison Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Average Response Times by Team Member</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${(value / 60).toFixed(1)}h`} />
                      <Tooltip 
                        formatter={(value: number) => [formatDuration(value), "Avg Response Time"]}
                      />
                      <Bar 
                        dataKey="averageResponseTime" 
                        fill="hsl(var(--chart-2))"
                        name="Response Time"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}