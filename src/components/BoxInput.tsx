import type React from 'react';
import { useRef } from 'react';
import useMouseDrag from '@/app/hooks/useMouseDrag';
import { Button } from '@/components/ui/button';
import { clamp } from '@/lib/utils/math';

interface BoxValue {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragStartValues {
  position: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startLeft: number;
  startTop: number;
}

interface BoxInputProps {
  name?: string;
  value: BoxValue;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onChange?: (name: string, value: BoxValue) => void;
}

export default function BoxInput({
  name = 'box',
  value,
  minWidth = 1,
  minHeight = 1,
  maxWidth = 100,
  maxHeight = 100,
  onChange,
}: BoxInputProps) {
  const startDrag = useMouseDrag();
  const { x, y, width, height } = value;
  const startValues = useRef<DragStartValues | null>(null);

  function handleDrag(e: MouseEvent) {
    const { startWidth, startHeight, startX, startY, position, startTop, startLeft } =
      startValues.current!;
    const deltaX = e.pageX - startX;
    const deltaY = e.pageY - startY;
    const next: BoxValue = { x, y, width, height };

    switch (position) {
      case 'top':
        next.y = clamp(startTop + deltaY, 0, startTop + startHeight - minHeight);
        next.height = clamp(startHeight - deltaY, minHeight, startTop + startHeight);
        break;
      case 'right':
        next.width = clamp(startWidth + deltaX, minWidth, maxWidth - startLeft);
        break;
      case 'bottom':
        next.height = clamp(startHeight + deltaY, minHeight, maxHeight - startTop);
        break;
      case 'left':
        next.x = clamp(startLeft + deltaX, 0, startLeft + startWidth - minWidth);
        next.width = clamp(startWidth - deltaX, minWidth, startLeft + startWidth);
        break;
      case 'center':
        next.x = clamp(startLeft + deltaX, 0, maxWidth - startWidth);
        next.y = clamp(startTop + deltaY, 0, maxHeight - startHeight);
        break;
    }

    onChange?.(name, next);
  }

  const handleDragStart = (position: string) => (e: React.MouseEvent) => {
    startValues.current = {
      position,
      startX: e.pageX,
      startY: e.pageY,
      startWidth: width,
      startHeight: height,
      startLeft: x,
      startTop: y,
    };
    startDrag(e, {
      onDrag: handleDrag,
    });
  };

  return (
    <div
      className="absolute top-0 left-0 border border-primary"
      style={{
        width,
        height,
        top: y,
        left: x,
      }}
    >
      <Button
        type="button"
        variant="ghost"
        aria-label="Move selection"
        className="absolute h-full w-full cursor-move rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
        onMouseDown={handleDragStart('center')}
      />
      <Button
        type="button"
        variant="ghost"
        aria-label="Resize selection from top"
        className="absolute -top-1 h-2.5 w-full cursor-ns-resize rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
        onMouseDown={handleDragStart('top')}
      />
      <Button
        type="button"
        variant="ghost"
        aria-label="Resize selection from right"
        className="absolute -right-1 h-full w-2.5 cursor-ew-resize rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
        onMouseDown={handleDragStart('right')}
      />
      <Button
        type="button"
        variant="ghost"
        aria-label="Resize selection from bottom"
        className="absolute -bottom-1 h-2.5 w-full cursor-ns-resize rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
        onMouseDown={handleDragStart('bottom')}
      />
      <Button
        type="button"
        variant="ghost"
        aria-label="Resize selection from left"
        className="absolute -left-1 h-full w-2.5 cursor-ew-resize rounded-none border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
        onMouseDown={handleDragStart('left')}
      />
    </div>
  );
}
