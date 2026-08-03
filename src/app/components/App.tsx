import type React from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useAppStore, { initApp } from '@/app/actions/app';
import LeftPanel from '@/app/components/panels/LeftPanel';
import ReactorPanel from '@/app/components/panels/ReactorPanel';
import RightPanel from '@/app/components/panels/RightPanel';
import Player from '@/app/components/player/Player';
import Stage from '@/app/components/stage/Stage';
import Modals from '@/app/components/window/Modals';
import Preload from '@/app/components/window/Preload';
import StatusBar from '@/app/components/window/StatusBar';
import TitleBar from '@/app/components/window/TitleBar';
import { ignoreEvents } from '@/lib/utils/react';

const PANEL_WIDTH = '22.5rem';
const PANEL_TRANSITION = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';

function useCollapsibleHeight<T extends HTMLElement>(isOpen: boolean) {
  const ref = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);
  const isInitialRender = useRef(true);
  const [height, setHeight] = useState<string | undefined>(isOpen ? undefined : '0px');

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (isInitialRender.current) {
      isInitialRender.current = false;
      setHeight(isOpen ? undefined : '0px');
      return;
    }

    const nextHeight = `${element.scrollHeight}px`;

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (isOpen) {
      setHeight('0px');
      frameRef.current = window.requestAnimationFrame(() => {
        setHeight(nextHeight);
        frameRef.current = null;
      });
    } else {
      setHeight(nextHeight);
      frameRef.current = window.requestAnimationFrame(() => {
        setHeight('0px');
        frameRef.current = null;
      });
    }

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isOpen]);

  function onTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== 'height') {
      return;
    }

    if (isOpen) {
      setHeight(undefined);
    }
  }

  return { ref, height, onTransitionEnd };
}

function App() {
  const isLeftPanelVisible = useAppStore(state => state.isLeftPanelVisible);
  const isBottomPanelVisible = useAppStore(state => state.isBottomPanelVisible);
  const isRightPanelVisible = useAppStore(state => state.isRightPanelVisible);
  const bottomPanel = useCollapsibleHeight<HTMLDivElement>(isBottomPanelVisible);

  useEffect(() => {
    initApp();
  }, []);

  return (
    <div
      role="application"
      className="flex flex-col flex-1 overflow-hidden relative w-full h-full"
      onDrop={ignoreEvents}
      onDragOver={ignoreEvents}
    >
      <Preload />
      <TitleBar />
      <div className="flex flex-row flex-1 overflow-hidden relative">
        <div
          aria-hidden={!isLeftPanelVisible}
          className={`flex shrink-0 overflow-hidden transition-[width] ${PANEL_TRANSITION}`}
          style={{ width: isLeftPanelVisible ? PANEL_WIDTH : '0rem' }}
        >
          <div
            className={`flex h-full transition-[transform,opacity] ${PANEL_TRANSITION} ${
              isLeftPanelVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-4 opacity-0 pointer-events-none'
            }`}
          >
            <LeftPanel />
          </div>
        </div>
        <div id="viewport" className="flex flex-col flex-1 overflow-hidden relative">
          <Stage />
          <div
            aria-hidden={!isBottomPanelVisible}
            className={`overflow-hidden transition-[height] ${PANEL_TRANSITION}`}
            style={{ height: bottomPanel.height }}
            onTransitionEnd={bottomPanel.onTransitionEnd}
          >
            <div
              ref={bottomPanel.ref}
              className={`transition-[transform,opacity] ${PANEL_TRANSITION} ${
                isBottomPanelVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0 pointer-events-none'
              }`}
            >
              <ReactorPanel />
              <Player />
            </div>
          </div>
        </div>
        <div
          aria-hidden={!isRightPanelVisible}
          className={`flex shrink-0 overflow-hidden transition-[width] ${PANEL_TRANSITION}`}
          style={{ width: isRightPanelVisible ? PANEL_WIDTH : '0rem' }}
        >
          <div
            className={`flex h-full transition-[transform,opacity] ${PANEL_TRANSITION} ${
              isRightPanelVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-4 opacity-0 pointer-events-none'
            }`}
          >
            <RightPanel />
          </div>
        </div>
      </div>
      <StatusBar />
      <Modals />
    </div>
  );
}

export default App;
