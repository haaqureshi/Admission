import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 80, height: 80 }
  };

  return (
    <div className={cn("relative", className)} style={dimensions[size]}>
      <Image
        src="/bsol-logo.svg"
        alt="Blackstone Board Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}