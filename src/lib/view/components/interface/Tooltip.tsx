import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import React from "react";

interface TooltipProps {
  text?: string;
  children: React.ReactElement<Record<string, unknown>>;
}

export default function Tooltip({ text, children }: TooltipProps) {
  if (!text) {
    return children;
  }

  return (
    <BaseTooltip.Provider>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger render={children} />
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner sideOffset={6}>
            <BaseTooltip.Popup className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100">
              {text}
            </BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
