import ControlsPanel from "@/lib/view/components/panels/ControlsPanel";
import PanelHeader from "@/lib/view/components/panels/PanelHeader";
import React from "react";

export default function RightPanel() {
  return (
    <div className="flex flex-col w-90 shrink-0 overflow-hidden border-l">
      <PanelHeader title="Controls" />
      <ControlsPanel />
    </div>
  );
}
