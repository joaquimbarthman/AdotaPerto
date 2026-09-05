"use client";

import type { ReactNode } from "react";

export function AuthBlurredContent({ locked, children }: { locked: boolean; children: ReactNode }) {
  if (!locked) return <>{children}</>;
  return <div className="pointer-events-none select-none blur-[7px]" aria-hidden="true">{children}</div>;
}
