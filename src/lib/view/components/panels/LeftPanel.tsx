import LayersPanel from "@/lib/view/components/panels/LayersPanel";
import ReactorsPanel from "@/lib/view/components/panels/ReactorsPanel";
import Icon from "@/lib/view/components/interface/Icon";
import { DotsHorizontal } from "@/lib/view/icons";
import { Group, Panel, Separator } from "react-resizable-panels";
import React from "react";

export default function LeftPanel() {
  return (
    <div
      className="flex flex-col shrink-0 relative overflow-hidden border-r"
      style={{ width: 260 }}
    >
      <Group orientation="vertical">
        <Panel defaultSize={60} minSize={20}>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex shrink-0 items-start py-3">
              <div className="ml-2.5 cursor-default text-sm uppercase text-neutral-300 leading-none">
                Layers
              </div>
            </div>
            <LayersPanel />
          </div>
        </Panel>
        <Separator className="flex items-center justify-center h-3 shrink-0 cursor-row-resize bg-neutral-800 outline-none">
          <Icon className="w-3 h-3 text-neutral-500" glyph={DotsHorizontal} />
        </Separator>
        <Panel defaultSize={40} minSize={15}>
          <div className="flex flex-col h-full overflow-hidden bg-neutral-900">
            <div className="flex shrink-0 items-start py-3">
              <div className="ml-2.5 cursor-default text-sm uppercase text-neutral-300 leading-none">
                Reactors
              </div>
            </div>
            <ReactorsPanel />
          </div>
        </Panel>
      </Group>
    </div>
  );
}
