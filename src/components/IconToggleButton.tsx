import type { ComponentProps } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type IconToggleButtonProps = ComponentProps<'button'> & {
  label: string;
  pressed: boolean;
};

export default function IconToggleButton({
  label,
  pressed,
  className,
  children,
  ...props
}: IconToggleButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              {...props}
              type="button"
              aria-label={label}
              aria-pressed={pressed}
              className={cn(
                'inline-flex items-center justify-center rounded bg-transparent cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-400 disabled:opacity-50',
                pressed
                  ? 'text-neutral-200 hover:text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-400',
                className,
              )}
            />
          }
        >
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="rounded bg-neutral-950 px-3 py-2 text-sm text-neutral-200 shadow-lg z-100"
        >
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
