"use client";

import type { ComponentProps } from "react";
import { track } from "@vercel/analytics";

type Props = ComponentProps<"a"> & { event: string; data?: Record<string, string> };

export function TrackedLink({ event, data, onClick, ...props }: Props) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event, data);
        onClick?.(e);
      }}
    />
  );
}
