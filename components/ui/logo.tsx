import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-20 h-20"
};

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <div className={cn(sizeClasses[size], className)}>
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <rect width="800" height="800" rx="150" fill="#F5F7FF" />
        <path
          d="M600 400C600 510.457 510.457 600 400 600C289.543 600 200 510.457 200 400C200 289.543 289.543 200 400 200C510.457 200 600 289.543 600 400Z"
          fill="#FEFCE8"
          stroke="#E2E8F0"
          strokeWidth="4"
        />
        <path
          d="M400 250V400H525"
          stroke="#1E40AF"
          strokeWidth="80"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M400 250V550"
          stroke="#1E40AF"
          strokeWidth="80"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}