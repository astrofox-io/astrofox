import TextInput from "@/app/components/inputs/TextInput";
import { Eye, TrashEmpty } from "@/app/icons";
import classNames from "classnames";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface LayerProps {
  id: string;
  name?: string;
  icon?: LucideIcon | null;
  className?: string;
  active?: boolean;
  enabled?: boolean;
  onLayerClick?: (id: string) => void;
  onLayerUpdate?: (id: string, prop: string, value: unknown) => void;
  onLayerDelete?: ((id: string) => void) | null;
}

export default function Layer({
  id,
  name = "",
  icon = null,
  className,
  active = false,
  enabled = true,
  onLayerClick,
  onLayerUpdate,
  onLayerDelete = null,
}: LayerProps) {
  const [edit, setEdit] = useState(false);
  const LayerIcon = icon;

  function handleLayerClick() {
    onLayerClick?.(id);
  }

  function handleEnableClick() {
    onLayerUpdate?.(id, "enabled", !enabled);
  }

  function handleNameChange(name: string, val: string) {
    if (val.length > 0) {
      onLayerUpdate?.(id, name, val);
    }
    setEdit(false);
  }

  function handleEnableEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setEdit(true);
  }

  function handleCancelEdit() {
    setEdit(false);
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (onLayerDelete) {
      onLayerDelete(id);
    }
  }

  return (
    <div
      className={classNames(
        "group flex flex-row items-center text-sm text-neutral-200 hover:text-neutral-100 bg-neutral-800 rounded px-2 py-1 mx-1 relative cursor-default [&>*]:mr-2 [&>*:last-child]:mr-0 [&:after]:content-['\\00a0']",
        className,
        {
          "bg-neutral-800": edit,
          "bg-primary": active && !edit,
        },
      )}
      onClick={handleLayerClick}
    >
      {LayerIcon && <LayerIcon className={"w-4 h-4"} />}
      <div className={"flex-1 min-w-0 py-0.5"} onDoubleClick={handleEnableEdit}>
        {edit ? (
          <TextInput
            name="displayName"
            value={name}
            width={undefined as unknown as number}
            className={
              "h-7 !px-2 !leading-7 !rounded !bg-neutral-800 !border-primary"
            }
            buffered
            autoFocus
            autoSelect
            onChange={handleNameChange}
          />
        ) : (
          name
        )}
      </div>
      {onLayerDelete && (
        <TrashEmpty
          className="w-4 h-4 opacity-0 group-hover:opacity-50 group-hover:hover:opacity-100"
          onClick={handleDeleteClick}
        />
      )}
      <Eye
        className={classNames("w-4 h-4", {
          "opacity-30": !enabled,
        })}
        onClick={handleEnableClick}
      />
    </div>
  );
}
