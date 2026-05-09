"use client";

import { Separator } from "react-resizable-panels";

export function ResizeHandle() {
  return (
    <Separator className="group relative w-1 cursor-col-resize bg-zinc-800 transition-colors hover:bg-emerald-500/60 focus-visible:bg-emerald-500/60 focus-visible:outline-none active:bg-emerald-500">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100" />
    </Separator>
  );
}
