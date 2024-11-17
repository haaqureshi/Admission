"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Mail, UserCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export function TeamEmails() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admission_team')
        .select('*')
        .order('role');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();

    const channel = supabase
      .channel('team_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'admission_team' }, 
        fetchTeamMembers
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredMembers = teamMembers.filter(member =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admission Team</h2>
          <p className="text-sm text-muted-foreground">
            Manage and view team member information
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Loading team members...
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow 
                      key={member.id}
                      className={cn(
                        member.email === user?.email && "bg-muted/50"
                      )}
                    >
                      <TableCell className="font-medium">{member.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className={cn(
                            member.email === user?.email && "font-medium"
                          )}>
                            {member.email}
                            {member.email === user?.email && " (You)"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.status === 'active' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}