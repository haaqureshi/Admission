interface AssignmentState {
  "LLB (Hons)": number;
  "LLM Corporate": number;
  "LLM Human Rights": number;
  "Bar Transfer Course": number;
}

const teamMembers = [
  "Alvina Sami",
  "Shahzaib Shams",
  "Faiza Ullah",
  "Aneeza Komal"
];

// Initialize state with localStorage if available, otherwise use default state
const getInitialState = (): AssignmentState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('assignmentState');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  return {
    "LLB (Hons)": 0,
    "LLM Corporate": 0,
    "LLM Human Rights": 0,
    "Bar Transfer Course": 0
  };
};

let assignmentState: AssignmentState = getInitialState();

export function getNextAssignee(program: string): string {
  // Ensure program exists in state
  if (!(program in assignmentState)) {
    assignmentState[program as keyof AssignmentState] = 0;
  }

  const currentIndex = assignmentState[program as keyof AssignmentState];
  const nextAssignee = teamMembers[currentIndex % teamMembers.length];
  
  // Update state for this specific program
  assignmentState = {
    ...assignmentState,
    [program]: (currentIndex + 1) % teamMembers.length
  };

  // Persist state if localStorage is available
  if (typeof window !== 'undefined') {
    localStorage.setItem('assignmentState', JSON.stringify(assignmentState));
  }
  
  return nextAssignee;
}

export function getAssignmentStats(): Record<string, Record<string, number>> {
  const stats: Record<string, Record<string, number>> = {};
  
  Object.keys(assignmentState).forEach(program => {
    stats[program] = {};
    teamMembers.forEach(member => {
      stats[program][member] = 0;
    });
  });

  return stats;
}

export function resetAssignmentState(): void {
  assignmentState = {
    "LLB (Hons)": 0,
    "LLM Corporate": 0,
    "LLM Human Rights": 0,
    "Bar Transfer Course": 0
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('assignmentState', JSON.stringify(assignmentState));
  }
}

export function getTeamMembers(): string[] {
  return [...teamMembers];
}