import { clsx as classNames } from 'cnfast';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Option from '@/app/components/controls/Option';
import useEntity from '@/app/hooks/useEntity';
import { translateControlProps, translateGeneratedName, translateLabel } from '@/i18n/labels';
import type Display from '@/lib/core/Display';
import { resolve } from '@/lib/utils/object';
import { inputValueToProps } from '@/lib/utils/react';

interface ControlProps {
  display: Display & {
    id: string;
    displayName: string;
    properties: Record<string, unknown>;
    constructor: {
      config: {
        label: string;
        controls?: Record<string, Record<string, unknown>>;
      };
    };
  };
  className?: string;
  showHeader?: boolean;
  active?: boolean;
  onChange?: (props: Record<string, unknown>) => void;
  onNameClick?: (id: string) => void;
}

export default function Control({
  display,
  className,
  showHeader = true,
  active = false,
  onChange: onChangeProp,
  onNameClick,
}: ControlProps) {
  const { t } = useTranslation();
  const {
    id,
    displayName,
    constructor: {
      config: { label, controls = {} },
    },
  } = display;

  const internalOnChange = useEntity(display);
  const onChange = onChangeProp ?? internalOnChange;

  function resolveOption(name: string, option: Record<string, unknown>) {
    const props: Record<string, unknown> = {};

    for (const [propName, value] of Object.entries(option)) {
      props[propName] = resolve(value, [display]);
    }

    if (props.hidden) {
      return null;
    }

    const translatedProps = translateControlProps(t, props);

    return {
      name,
      group:
        typeof translatedProps.group === 'string' && translatedProps.group.trim().length > 0
          ? translatedProps.group
          : null,
      props: translatedProps,
    };
  }

  function mapOption(
    resolvedOption: {
      name: string;
      group: string | null;
      props: Record<string, unknown>;
    },
    groupStarted: boolean,
  ) {
    const { name, group, props } = resolvedOption;
    const { group: _group, ...optionProps } = props;

    return (
      <React.Fragment key={name}>
        {group && !groupStarted ? (
          <div className="mx-2.5 mt-3 px-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
            {group}
          </div>
        ) : null}
        <Option
          display={display}
          name={name}
          value={(display.properties as Record<string, unknown>)[name]}
          onChange={inputValueToProps(onChange)}
          {...optionProps}
        />
      </React.Fragment>
    );
  }

  const visibleOptions = Object.keys(controls)
    .map(key => resolveOption(key, controls[key]))
    .filter(
      (
        option,
      ): option is {
        name: string;
        group: string | null;
        props: Record<string, unknown>;
      } => option !== null,
    );

  let activeGroup: string | null = null;

  return (
    <div className={classNames('pb-2', className)}>
      {showHeader && (
        <div className={'relative py-3 px-2.5'}>
          <div
            className={
              'flex items-center justify-between text-xs text-neutral-100 overflow-hidden gap'
            }
          >
            <div className="flex items-center gap-2">
              <div
                className="inline-flex border-b-2 border-b-transparent uppercase"
                style={{
                  borderBottomColor: active ? 'var(--color-primary)' : 'transparent',
                }}
              >
                {translateLabel(t, label)}
              </div>
            </div>
            <button
              type="button"
              className={classNames(
                'min-w-0 max-w-24 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:text-neutral-100',
                {
                  'text-neutral-100': active,
                  'text-neutral-300': !active,
                },
              )}
              onClick={() => onNameClick?.(id)}
            >
              {translateGeneratedName(t, displayName)}
            </button>
          </div>
        </div>
      )}
      {visibleOptions.map(option => {
        const groupStarted = Boolean(option.group && option.group === activeGroup);
        activeGroup = option.group;
        return mapOption(option, groupStarted);
      })}
    </div>
  );
}
