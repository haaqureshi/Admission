interface AssignmentState {
  "Bar Transfer Course": number;
  "LLM Human Rights": number;
  "LLB (Hons)": number;
  "LLM Corporate": number;
}

const teamMembers = [
  "Faizan Ullah",
  "Shahzaib Shams",
  "Aneeza Komal",
  "Alvina Sami",
  "Abubakr Mahmood"
];

const programs = [
  "Bar Transfer Course",
  "LLM Human Rights",
  "LLB (Hons)",
  "LLM Corporate"
] as const;

// Initialize state with localStorage if available, otherwise use default state
const getInitialState = (): AssignmentState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('assignmentState');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return {
    "Bar Transfer Course": 0,
    "LLM Human Rights": 0,
    "LLB (Hons)": 0,
    "LLM Corporate": 0
  };
};

let assignmentState: AssignmentState = getInitialState();

import { createClient } from '@supabase/supabase-js'

// Define types for the lead count result
interface LeadCount {
  "Assign To": string;
  lead_count: number;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Returns the next assignee using round-robin with load balancing
 * @param program The program for which to get the next assignee
 * @returns The next team member to be assigned
 */
export async function getNextAssignee(program: string): Promise<string> {
  // Validate program
  if (!programs.includes(program as any)) {
    throw new Error(`Invalid program: ${program}. Must be one of: ${programs.join(', ')}`);
  }

  // Get next assignee using round-robin
  const currentIndex = assignmentState[program as keyof AssignmentState];
  let nextAssignee = teamMembers[currentIndex % teamMembers.length];

  try {
    // Get all leads with their assignments
    const { data: leads, error } = await supabase
      .from('leads')
      .select('"Assign To"');

    if (error) throw error;

    // Count leads for each team member
    const workloadMap = new Map<string, number>();
    teamMembers.forEach(member => workloadMap.set(member, 0));
    
    leads?.forEach(lead => {
      if (lead['Assign To']) {
        const currentCount = workloadMap.get(lead['Assign To']) || 0;
        workloadMap.set(lead['Assign To'], currentCount + 1);
      }
    });

    // Get the count for the round-robin selected member
    const selectedCount = workloadMap.get(nextAssignee) || 0;

    // Find the minimum lead count
    let minLeads = Math.min(...Array.from(workloadMap.values()));
    
    // Find the maximum lead count
    let maxLeads = Math.max(...Array.from(workloadMap.values()));

    // If all counts are equal, stick to round-robin
    if (minLeads === maxLeads) {
      // Everyone has the same number of leads, continue with round-robin
    } else if (selectedCount >= minLeads + 2) {
      // Get all members with minimum leads
      const membersWithMinLeads = teamMembers.filter(
        member => (workloadMap.get(member) || 0) === minLeads
      );

      if (membersWithMinLeads.length > 0) {
        // If multiple members have minimum leads, 
        // pick the next one in round-robin order after the current index
        let found = false;
        let startIndex = currentIndex;
        
        // Look for the next team member with minimum leads
        for (let i = 0; i < teamMembers.length; i++) {
          const checkIndex = (startIndex + i) % teamMembers.length;
          const member = teamMembers[checkIndex];
          
          if (membersWithMinLeads.includes(member)) {
            nextAssignee = member;
            // Update the assignment state to continue from this member
            assignmentState = {
              ...assignmentState,
              [program]: (checkIndex + 1) % teamMembers.length
            };
            found = true;
            break;
          }
        }

        // If somehow we didn't find anyone (shouldn't happen), stick to original round-robin
        if (!found) {
          console.warn('No minimum lead member found in round-robin order, using default');
        }
      }
    }
  } catch (error) {
    console.error('Error checking lead distribution:', error);
    // Continue with round-robin if there's an error
  }

  // Update state for next round-robin assignment if it wasn't updated above
  if (!assignmentState[program as keyof AssignmentState]) {
    assignmentState = {
      ...assignmentState,
      [program]: (currentIndex + 1) % teamMembers.length
    };
  }

  // Persist state to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('assignmentState', JSON.stringify(assignmentState));
  }

  return nextAssignee;
}

/**
 * Get current lead distribution for all team members
 */
export async function getLeadDistribution() {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('"Assign To"');

    if (error) throw error;

    // Count leads for each team member
    const workloadMap = new Map<string, number>();
    teamMembers.forEach(member => workloadMap.set(member, 0));
    
    leads?.forEach(lead => {
      if (lead['Assign To']) {
        const currentCount = workloadMap.get(lead['Assign To']) || 0;
        workloadMap.set(lead['Assign To'], currentCount + 1);
      }
    });

    return Object.fromEntries(workloadMap);
  } catch (error) {
    console.error('Error getting lead distribution:', error);
    return null;
  }
}

/**
 * Get current assignment statistics for each program
 */
export function getAssignmentStats(): Record<string, Record<string, number>> {
  const stats: Record<string, Record<string, number>> = {};
  
  programs.forEach(program => {
    stats[program] = {};
    teamMembers.forEach(member => {
      stats[program][member] = 0;
    });
  });

  return stats;
}

/**
 * Reset the assignment state for all programs
 */
export function resetAssignmentState(): void {
  assignmentState = {
    "Bar Transfer Course": 0,
    "LLM Human Rights": 0,
    "LLB (Hons)": 0,
    "LLM Corporate": 0
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('assignmentState', JSON.stringify(assignmentState));
  }
}

/**
 * Get the list of team members
 */
export function getTeamMembers(): string[] {
  return [...teamMembers];
}

/**
 * Get the list of available programs
 */
export function getPrograms(): readonly string[] {
  return programs;
}