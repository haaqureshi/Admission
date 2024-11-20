"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className, width = 128, height = 128 }: LogoProps) {
  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      <Image
        src="/bsol-logo.png"
        alt="Blackstone Board Logo"
        fill
        className="object-contain"
        priority
        sizes={`(max-width: ${width}px) 100vw, ${width}px`}
        quality={100}
      />
    </div>
  );
}