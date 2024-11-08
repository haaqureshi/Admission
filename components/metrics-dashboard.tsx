"use client";

import { ConversionMetrics } from "@/components/metrics/conversion-metrics";
import { ProgramMetrics } from "@/components/metrics/program-metrics";
import { StatusMetrics } from "@/components/metrics/status-metrics";

export function MetricsDashboard() {
  return (
    <div className="space-y-8">
      <ConversionMetrics />
      <div className="grid gap-8 md:grid-cols-2">
        <ProgramMetrics />
        <StatusMetrics />
      </div>
    </div>
  );
}