"use client";

import dynamic from 'next/dynamic';

const ConversionMetrics = dynamic(() => import("./metrics/conversion-metrics").then(mod => mod.ConversionMetrics), { ssr: false });
const ProgramMetrics = dynamic(() => import("./metrics/program-metrics").then(mod => mod.ProgramMetrics), { ssr: false });
const StatusMetrics = dynamic(() => import("./metrics/status-metrics").then(mod => mod.StatusMetrics), { ssr: false });

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

export default MetricsDashboard;