import type React from "react";

interface PanelHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export default function PanelHeader({ title, actions }: PanelHeaderProps) {
  return (
    <div className="flex shrink-0 items-center h-12">
      <div className="ml-2.5 cursor-default text-sm uppercase text-neutral-400 leading-none">
        {title}
      </div>
      {actions && <div className="ml-auto mr-1 flex gap-1">{actions}</div>}
    </div>
  );
}
