"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/columns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { AddLeadDialog } from "@/components/add-lead-dialog";
import { StatusCard } from "@/components/status-card";

export default function Dashboard() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  const statusData = [
    { label: "No Contact", count: 45, color: "bg-gray-500" },
    { label: "Thinking", count: 28, color: "bg-yellow-500" },
    { label: "Interested", count: 32, color: "bg-green-500" },
    { label: "Next Session", count: 15, color: "bg-blue-500" },
    { label: "Won", count: 20, color: "bg-emerald-500" },
    { label: "Not Interested", count: 12, color: "bg-red-500" },
    { label: "Not Affordable", count: 8, color: "bg-purple-500" },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">BSOL Admission Team</h2>
          <p className="text-muted-foreground">
            Manage and track your admission leads effectively
          </p>
        </div>
        <Button onClick={() => setIsAddLeadOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statusData.map((status) => (
          <StatusCard
            key={status.label}
            label={status.label}
            count={status.count}
            color={status.color}
          />
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Lead Management</h3>
        </div>
        <DataTable columns={columns} data={[]} />
      </Card>

      <AddLeadDialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen} />
    </div>
  );
}