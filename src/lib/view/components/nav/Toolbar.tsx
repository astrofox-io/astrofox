// @ts-nocheck
import useApp, { setActiveElementId } from "@/lib/view/actions/app";
import useScenes, { addElement } from "@/lib/view/actions/scenes";
import Menu from "@/lib/view/components/nav/Menu";
import { library } from "@/lib/view/global";
import { Cube, Sun } from "@/lib/view/icons";
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
      className="flex flex-col shrink-0 p-3 px-0.5 gap-1 bg-gray100 items-center"
      aria-label="Tools"
    >
      {TOOLBAR_ITEMS.map((item, index) => {
        const isActive = activeIndex === index;
        const Icon = item.icon;
        const menuItems = getMenuItems(item.type);
        const disabled = !hasScenes;

        return (
          <div key={item.type} className="relative flex justify-center">
            <button
              type="button"
              className={classNames(
                "border-0 p-3 rounded bg-gray200 text-text300 inline-flex items-center justify-center cursor-default",
                {
                  "text-text100 bg-primary100": isActive,
                  "[&:hover]:text-text100 [&:hover]:bg-gray100": !disabled,
                  "[&_svg]:text-gray500": disabled,
                },
              )}
              title={item.title}
              aria-label={item.title}
              onClick={handleButtonClick(index)}
              onMouseOver={handleMouseOver(index)}
            >
              <Icon size={18} />
            </button>
            <Menu
              className="top-0! left-full! ml-1 min-w-44 border border-gray300"
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
