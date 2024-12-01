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
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Lead } from "@/components/columns";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function Dashboard() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>("developer");
  const [activeTab, setActiveTab] = useState("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("all");

  const fetchLeads = useCallback(async (filters?: {
    searchQuery?: string;
    programFilter?: string;
    assigneeFilter?: string;
    followUpFilter?: string;
  }) => {
    try {
      console.log('Fetching leads with filters:', filters);
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters to the query
      if (filters) {
        // Program Filter
        if (filters.programFilter) {
          if (filters.programFilter === 'default') {
            console.log('Using default program filter - showing all programs');
            // Don't apply any program filter
          } else if (filters.programFilter === 'all') {
            console.log('Resetting program filter - showing all programs');
            // Don't apply any program filter
          } else {
            console.log('Filtering by program:', filters.programFilter);
            query = query.eq('program', filters.programFilter.trim());
          }
        }

        // Assignee Filter
        if (filters.assigneeFilter === 'all') {
          console.log('Resetting assignee filter');
        } else if (filters.assigneeFilter) {
          console.log('Applying assignee filter:', filters.assigneeFilter);
          query = query.eq('Assign To', filters.assigneeFilter);
        }

        // Search Query
        if (filters.searchQuery) {
          const searchTerm = filters.searchQuery.toLowerCase().trim();
          console.log('Applying search filter:', searchTerm);
          query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
        }
      }

      // Execute query and log the SQL (if available)
      console.log('Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leads:', error);
        toast({
          title: "Error",
          description: "Failed to fetch leads: " + error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Query successful!');
      console.log('Leads fetched:', data?.length || 0);
      console.log('Current filters:', {
        program: filters?.programFilter,
        assignee: filters?.assigneeFilter,
        search: filters?.searchQuery
      });

      setLeads(data || []);
    } catch (error) {
      console.error('Error in fetchLeads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leads. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleFilterChange = useCallback((filters: {
    searchQuery?: string;
    programFilter?: string;
    assigneeFilter?: string;
    followUpFilter?: string;
  }) => {
    console.log('Filter change triggered:', filters);
    fetchLeads(filters);
  }, [fetchLeads]);

  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
  }, [fetchLeads, searchQuery, programFilter, assigneeFilter, followUpFilter]);

  // Initial fetch and real-time updates setup
  useEffect(() => {
    fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });

    const channel = supabase
      .channel('leads_db_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leads',
          filter: `id.gt.0` 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up Supabase subscription...');
      supabase.removeChannel(channel);
    };
  }, [fetchLeads, searchQuery, programFilter, assigneeFilter, followUpFilter]);

  // Auto-refresh setup
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshData();
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [refreshData]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.email) {
        const { data } = await supabase
          .from('admission_team')
          .select('role')
          .eq('email', user.email)
          .single();
        
        setUserRole(data?.role || "developer");
      }
    };

    checkUserRole();
  }, [user?.email]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    refreshData(); // Refresh data when tab changes
  };

  const statusData = [
    { label: "All", count: leads.length, color: "bg-gray-300" },
    { label: "No Contact", count: leads.filter(l => l.status === "No Contact").length, color: "bg-gray-500" },
    { label: "Thinking", count: leads.filter(l => l.status === "Thinking").length, color: "bg-yellow-500" },
    { label: "Interested", count: leads.filter(l => l.status === "Interested").length, color: "bg-green-500" },
    { label: "Next Session", count: leads.filter(l => l.status === "Next Session").length, color: "bg-blue-500" },
    { label: "Won", count: leads.filter(l => l.status === "Won").length, color: "bg-emerald-500" },
    { label: "Not Interested", count: leads.filter(l => l.status === "Not Interested").length, color: "bg-red-500" },
    { label: "Not Affordable", count: leads.filter(l => l.status === "Not Affordable").length, color: "bg-purple-500" },
  ];

  const filteredLeads = selectedStatus && selectedStatus !== "All"
    ? leads.filter(lead => lead.status === selectedStatus)
    : leads;

  const handleUpdate = async (id: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ [field]: value })
        .eq('id', id);

      if (error) {
        throw error;
      }

      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter }); // Re-fetch data after update
    } catch (error) {
      toast({
        title: "Update Error",
        description: "Failed to update lead.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Logo width={48} height={48} />
              <div>
                <h1 className="text-2xl font-bold text-primary">Blackstone Board</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-8" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                />
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="leads">Leads Management</TabsTrigger>
              <TabsTrigger value="reporting">Reporting</TabsTrigger>
              {userRole === "developer" && <TabsTrigger value="team">Team</TabsTrigger>}
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
                  updateStatus: async (id: string, status: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ status })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updatePulse: async (id: string, pulse: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ pulse })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updateName: async (id: string, name: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ name })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updatePhone: async (id: string, phone: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ phone })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updateEmail: async (id: string, email: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ email })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updateDob: async (id: string, dob: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ dob })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updateEducation: async (id: string, education: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ education })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updateSource: async (id: string, source: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ source })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updateProgram: async (id: string, program: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ program })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updateFollowUpDate: async (id: string, follow_up_date: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ follow_up_date })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  },
                  updateCommunication: async (id: string, communication: string) => {
                    const { error } = await supabase
                      .from('leads')
                      .update({ communication })
                      .eq('id', id);
                    if (!error) {
                      fetchLeads({ searchQuery, programFilter, assigneeFilter, followUpFilter });
                    }
                  }
                }}
                onFilterChange={handleFilterChange}
              />
            </Card>
          </TabsContent>

          <TabsContent value="reporting">
            <Card className="p-6">
              <MetricsDashboard key={refreshKey} />
            </Card>
          </TabsContent>

          {userRole === "developer" && (
            <TabsContent value="team">
              <Card className="p-6">
                <TeamEmails key={refreshKey} />
              </Card>
            </TabsContent>
          )}
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