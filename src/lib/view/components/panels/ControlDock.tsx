import ControlsPanel from "@/lib/view/components/panels/ControlsPanel";
import React from "react";

export default function ControlDock() {
  return (
    <div className="flex flex-col w-90 shrink-0 overflow-hidden border-l">
      <div className="flex shrink-0 items-start py-3">
        <div className="ml-2.5 cursor-default text-sm uppercase text-neutral-300 leading-none">
          Controls
        </div>
      </div>
      <ControlsPanel />
    </div>
  );
}
