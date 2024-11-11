"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/components/columns";

export default function Dashboard() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchLeads = async () => {
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
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchLeads();
  }, [refreshKey]);

  useEffect(() => {
    const channel = supabase
      .channel('leads_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads' 
        }, 
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Lead status updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status",
        variant: "destructive",
      });
    }
  };

  const updateLeadAssignee = async (id: string, assignTo: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ "Assign To": assignTo })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Lead assignee updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead assignee",
        variant: "destructive",
      });
    }
  };

  const updateFollowUpDate = async (id: string, date: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ follow_up_date: date })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Follow-up date updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow-up date",
        variant: "destructive",
      });
    }
  };

  const updateCommunication = async (id: string, communication: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ communication })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Communication type updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update communication type",
        variant: "destructive",
      });
    }
  };

  const updatePulse = async (id: string, pulse: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ pulse })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Lead pulse updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead pulse",
        variant: "destructive",
      });
    }
  };

  const updateEducation = async (id: string, education: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ education })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Education updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update education",
        variant: "destructive",
      });
    }
  };

  const updateSource = async (id: string, source: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ source })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Source updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update source",
        variant: "destructive",
      });
    }
  };

  const updateProgram = async (id: string, program: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ program })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Program updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update program",
        variant: "destructive",
      });
    }
  };

  const updateDob = async (id: string, dob: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ dob })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Date of birth updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update date of birth",
        variant: "destructive",
      });
    }
  };

  const updatePhone = async (id: string, phone: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ phone })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Phone number updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update phone number",
        variant: "destructive",
      });
    }
  };

  const updateName = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ name })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Name updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update name",
        variant: "destructive",
      });
    }
  };

  const updateEmail = async (id: string, email: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ email })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Email updated successfully",
      });
      
      refreshData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    }
  };

  const filteredLeads = selectedStatus
    ? leads.filter(lead => lead.status === selectedStatus)
    : leads;

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
        <Tabs defaultValue="leads" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="leads">Leads Management</TabsTrigger>
              <TabsTrigger value="reporting">Reporting</TabsTrigger>
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
                data={filteredLeads}
                meta={{
                  updateStatus: updateLeadStatus,
                  updateAssignee: updateLeadAssignee,
                  updateFollowUpDate: updateFollowUpDate,
                  updateCommunication: updateCommunication,
                  updatePulse: updatePulse,
                  updateEducation: updateEducation,
                  updateSource: updateSource,
                  updateProgram: updateProgram,
                  updateDob: updateDob,
                  updatePhone: updatePhone,
                  updateName: updateName,
                  updateEmail: updateEmail
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="reporting">
            <Card className="p-6">
              <MetricsDashboard />
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AddLeadDialog 
        open={isAddLeadOpen} 
        onOpenChange={setIsAddLeadOpen}
        onSuccess={() => {
          refreshData();
          setIsAddLeadOpen(false);
        }}
      />
    </div>
  );
}