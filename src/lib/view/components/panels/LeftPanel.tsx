import Panel from "@/lib/view/components/layout/Panel";
import LayersPanel from "@/lib/view/components/panels/LayersPanel";
import React from "react";

export default function LeftPanel() {
  return (
    <div
      className="flex flex-col shrink-0 relative overflow-hidden bg-neutral-800 border-r"
      style={{ width: 260 }}
    >
      <Panel title="Layers" stretch>
        <LayersPanel />
      </Panel>
    </div>
  );
}
