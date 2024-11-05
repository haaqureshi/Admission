"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table";
import { columns } from "@/components/columns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, GraduationCap, Search } from "lucide-react";
import { AddLeadDialog } from "@/components/add-lead-dialog";
import { StatusCard } from "@/components/status-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">BSOL Admission Team</h1>
                <p className="text-sm text-muted-foreground">Manage your admission pipeline</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8" />
              </div>
              <Button onClick={() => setIsAddLeadOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
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

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all">All Leads</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="converted">Converted</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Lead Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage and track all your admission leads
                  </p>
                </div>
              </div>
              <DataTable columns={columns} data={[]} />
            </Card>
          </TabsContent>

          <TabsContent value="today">
            <Card className="p-6">
              <DataTable columns={columns} data={[]} />
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="p-6">
              <DataTable columns={columns} data={[]} />
            </Card>
          </TabsContent>

          <TabsContent value="converted">
            <Card className="p-6">
              <DataTable columns={columns} data={[]} />
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AddLeadDialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen} />
    </div>
  );
}