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

/**
 * Returns the next assignee for a given program using round-robin assignment.
 * Each program maintains its own assignment counter.
 * 
 * @param program The program for which to get the next assignee
 * @returns The next team member to be assigned
 */
export function getNextAssignee(program: string): string {
  // Validate program
  if (!programs.includes(program as any)) {
    throw new Error(`Invalid program: ${program}. Must be one of: ${programs.join(', ')}`);
  }

  // Get current index for this program
  const currentIndex = assignmentState[program as keyof AssignmentState];
  
  // Get next assignee using the current index
  const nextAssignee = teamMembers[currentIndex % teamMembers.length];
  
  // Update state for this specific program
  assignmentState = {
    ...assignmentState,
    [program]: (currentIndex + 1) % teamMembers.length
  };

  // Persist state to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('assignmentState', JSON.stringify(assignmentState));
  }
  
  return nextAssignee;
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