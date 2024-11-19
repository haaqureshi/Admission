"use client";

import { DataTable } from "@/components/data-table";
import { columns } from "@/components/columns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Search } from "lucide-react";
import { AddLeadDialog } from "@/components/add-lead-dialog";
import { StatusCard } from "@/components/status-card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsDashboard } from "@/components/metrics-dashboard";
import { TeamEmails } from "@/components/team-emails";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/components/columns";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";

export default function Dashboard() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isTeamLead, setIsTeamLead] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLeads(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const checkTeamLeadRole = async () => {
      if (user?.email) {
        const { data } = await supabase
          .from('admission_team')
          .select('role')
          .eq('email', user.email)
          .single();
        
        setIsTeamLead(data?.role === 'team lead');
      }
    };

    checkTeamLeadRole();
  }, [user?.email]);

  useEffect(() => {
    fetchLeads();

    const channel = supabase.channel('leads-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to leads changes');
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [fetchLeads]);

  const statusData = [
    { label: "No Contact", count: leads.filter(l => l.status === "No Contact").length, color: "bg-gray-500" },
    { label: "Thinking", count: leads.filter(l => l.status === "Thinking").length, color: "bg-yellow-500" },
    { label: "Interested", count: leads.filter(l => l.status === "Interested").length, color: "bg-green-500" },
    { label: "Next Session", count: leads.filter(l => l.status === "Next Session").length, color: "bg-blue-500" },
    { label: "Won", count: leads.filter(l => l.status === "Won").length, color: "bg-emerald-500" },
    { label: "Not Interested", count: leads.filter(l => l.status === "Not Interested").length, color: "bg-red-500" },
    { label: "Not Affordable", count: leads.filter(l => l.status === "Not Affordable").length, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/bsol-logo.png"
                  alt="Blackstone Board Logo"
                  width={40}
                  height={40}
                  priority
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Blackstone Board</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user?.email}</p>
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
        <Tabs defaultValue="leads" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="leads">Leads Management</TabsTrigger>
              {isTeamLead && <TabsTrigger value="reporting">Reporting</TabsTrigger>}
              {isTeamLead && <TabsTrigger value="team">Team</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="leads">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {statusData.map((status) => (
                <StatusCard
                  key={status.label}
                  label={status.label}
                  count={status.count}
                  color={status.color}
                  isSelected={selectedStatus === status.label}
                  onClick={() => setSelectedStatus(selectedStatus === status.label ? null : status.label)}
                />
              ))}
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Lead Management</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedStatus ? `Showing ${selectedStatus} leads` : 'Manage and track all your admission leads'}
                    </p>
                  </div>
                </div>
                {selectedStatus && (
                  <Button variant="ghost" onClick={() => setSelectedStatus(null)}>
                    Clear Filter
                  </Button>
                )}
              </div>
              <DataTable 
                columns={columns} 
                data={selectedStatus ? leads.filter(lead => lead.status === selectedStatus) : leads}
                meta={{
                  updateStatus: async (id: string, status: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ status })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updatePulse: async (id: string, pulse: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ pulse })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updateName: async (id: string, name: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ name })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updatePhone: async (id: string, phone: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ phone })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updateEmail: async (id: string, email: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ email })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updateDob: async (id: string, dob: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ dob })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updateEducation: async (id: string, education: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ education })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updateSource: async (id: string, source: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ source })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updateProgram: async (id: string, program: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ program })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updateFollowUpDate: async (id: string, follow_up_date: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ follow_up_date })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  },
                  updateCommunication: async (id: string, communication: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ communication })
                      .eq('id', id);
                    if (!error) fetchLeads();
                  }
                }}
              />
            </Card>
          </TabsContent>

          {isTeamLead && (
            <TabsContent value="reporting">
              <Card className="p-6">
                <MetricsDashboard />
              </Card>
            </TabsContent>
          )}

          {isTeamLead && (
            <TabsContent value="team">
              <Card className="p-6">
                <TeamEmails />
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <AddLeadDialog 
        open={isAddLeadOpen} 
        onOpenChange={setIsAddLeadOpen}
        onSuccess={() => {
          fetchLeads();
          setIsAddLeadOpen(false);
        }}
      />
    </div>
  );
}