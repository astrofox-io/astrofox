// @ts-nocheck
import useApp, { setActiveElementId } from "@/lib/view/actions/app";
import useScenes, { addElement } from "@/lib/view/actions/scenes";
import Menu from "@/lib/view/components/nav/Menu";
import { library } from "@/lib/view/global";
import { Cube, Sun } from "@/lib/view/icons";
import Tooltip from "@/lib/view/components/interface/Tooltip";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";

const TOOLBAR_ITEMS = [
  { type: "displays", title: "Add Display", icon: Cube },
  { type: "effects", title: "Add Effect", icon: Sun },
];

export default function Toolbar() {
  const scenes = useScenes((state) => state.scenes);
  const activeElementId = useApp((state) => state.activeElementId);
  const hasScenes = scenes.length > 0;
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    function handleWindowClick() {
      setActiveIndex(-1);
    }

    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  const activeScene = useMemo(() => {
    return scenes.reduce((memo, scene) => {
      if (!memo) {
        if (
          scene?.id === activeElementId ||
          scene?.displays.find((e) => e.id === activeElementId) ||
          scene?.effects.find((e) => e.id === activeElementId)
        ) {
          memo = scene;
        }
      }
      return memo;
    }, undefined);
  }, [scenes, activeElementId]);

  const getMenuItems = useCallback((type) => {
    const items = library.get(type);
    if (!items) return [];
    return Object.keys(items).map((key) => ({
      label: items[key].config.label,
      _entityClass: items[key],
    }));
  }, []);

  function handleAddControl(Entity) {
    const entity = new Entity();
    setActiveElementId(entity?.id);
    addElement(entity, activeScene?.id);
  }

  function handleMenuItemClick(menuItem) {
    setActiveIndex(-1);
    if (menuItem._entityClass) {
      handleAddControl(menuItem._entityClass);
    }
  }

  function handleButtonClick(index) {
    return (event) => {
      event.stopPropagation();
      if (!hasScenes) return;
      setActiveIndex((current) => (current === index ? -1 : index));
    };
  }

  function handleMouseOver(index) {
    return (event) => {
      event.stopPropagation();
      if (!hasScenes) return;
      setActiveIndex((current) => (current > -1 ? index : current));
    };
  }

  return (
    <div
      className="flex flex-row shrink-0 py-2 gap-1 items-center justify-center"
      aria-label="Tools"
    >
      {TOOLBAR_ITEMS.map((item, index) => {
        const isActive = activeIndex === index;
        const Icon = item.icon;
        const menuItems = getMenuItems(item.type);
        const disabled = !hasScenes;

        return (
          <div key={item.type} className="relative flex justify-center">
            <Tooltip text={item.title}>
              <button
                type="button"
                className={classNames(
                  "border-0 p-3 rounded bg-neutral-800 text-neutral-400 inline-flex items-center justify-center cursor-default",
                  {
                    "text-neutral-100 bg-primary": isActive,
                    "[&:hover]:text-neutral-100 [&:hover]:bg-neutral-800":
                      !disabled,
                    "[&_svg]:text-neutral-500": disabled,
                  },
                )}
                aria-label={item.title}
                onClick={handleButtonClick(index)}
                onMouseOver={handleMouseOver(index)}
                onFocus={handleMouseOver(index)}
              >
                <Icon size={18} />
              </button>
            </Tooltip>
            <Menu
              className="top-full! left-0! mt-1 min-w-44 border border-neutral-700"
              items={menuItems}
              visible={isActive}
              onMenuItemClick={handleMenuItemClick}
            />
          </div>
        );
      })}
    </div>
  );
}
