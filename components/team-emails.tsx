"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

interface TeamMember {
  id: string;
  email: string;
  role: string;
}

export function TeamEmails() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from('admission_team')
        .select('*')
        .order('role');

      if (!error && data) {
        setTeamMembers(data);
      }
    };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Admission Team</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{member.role}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{member.email}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}