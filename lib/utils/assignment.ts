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

let assignmentState: AssignmentState = {
  "LLB (Hons)": 0,
  "LLM Corporate": 0,
  "LLM Human Rights": 0,
  "Bar Transfer Course": 0
};

export function getNextAssignee(program: string): string {
  const currentIndex = assignmentState[program as keyof AssignmentState] || 0;
  const nextAssignee = teamMembers[currentIndex % teamMembers.length];
  
  assignmentState = {
    ...assignmentState,
    [program]: (currentIndex + 1) % teamMembers.length
  };
  
  return nextAssignee;
}