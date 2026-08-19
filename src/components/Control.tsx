import { clsx as classNames } from 'cnfast';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useEntity from '@/app/hooks/useEntity';
import ControlGroup from '@/components/ControlGroup';
import Option from '@/components/Option';
import { translateControlProps, translateGeneratedName, translateLabel } from '@/i18n/labels';
import type Display from '@/lib/core/Display';
import { resolve } from '@/lib/utils/object';
import { inputValueToProps } from '@/lib/utils/react';

const TRAILING_GROUPS = ['Appearance', 'Position'];

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
      rawGroup:
        typeof props.group === 'string' && props.group.trim().length > 0
          ? props.group.trim()
          : null,
      group:
        typeof translatedProps.group === 'string' && translatedProps.group.trim().length > 0
          ? translatedProps.group
          : null,
      props: translatedProps,
    };
  }

  function renderOption(name: string, props: Record<string, unknown>) {
    const { group: _group, groupToggle: _groupToggle, ...optionProps } = props;

    return (
      <Option
        key={name}
        display={display}
        name={name}
        value={(display.properties as Record<string, unknown>)[name]}
        onChange={inputValueToProps(onChange)}
        {...optionProps}
      />
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
        rawGroup: string | null;
        props: Record<string, unknown>;
      } => option !== null,
    );

  // Consecutive options sharing a group collapse into one ControlGroup.
  const sections: Array<{
    group: string | null;
    rawGroup: string | null;
    options: typeof visibleOptions;
  }> = [];

  for (const option of visibleOptions) {
    const last = sections[sections.length - 1];
    if (last && last.group === option.group && option.group !== null) {
      last.options.push(option);
    } else if (last && last.group === null && option.group === null) {
      last.options.push(option);
    } else {
      sections.push({ group: option.group, rawGroup: option.rawGroup, options: [option] });
    }
  }

  // Transform groups always render last, below the entity-specific controls.
  const orderedSections = [
    ...sections.filter(section => !section.rawGroup || !TRAILING_GROUPS.includes(section.rawGroup)),
    ...TRAILING_GROUPS.flatMap(group => sections.filter(section => section.rawGroup === group)),
  ];

  return (
    <div className={classNames('flex flex-col gap-3 pb-4', className)}>
      {showHeader && (
        <div className={'relative py-3 px-2.5'}>
          <div className={'flex items-center justify-between gap-2 text-xs text-neutral-100'}>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={classNames(
                  'inline-flex cursor-pointer uppercase underline-offset-2 hover:text-neutral-100',
                  {
                    'underline decoration-primary decoration-2': active,
                  },
                )}
                onClick={() => onNameClick?.(id)}
              >
                {translateLabel(t, label)}
              </button>
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
      {orderedSections.map(section => {
        if (!section.group) {
          return (
            <React.Fragment key={`options-${section.options[0].name}`}>
              {section.options.map(option => renderOption(option.name, option.props))}
            </React.Fragment>
          );
        }

        // A control flagged `groupToggle` becomes the switch in the group header.
        const toggleOption = section.options.find(option => option.props.groupToggle === true);
        const bodyOptions = section.options.filter(option => option !== toggleOption);
        const properties = display.properties as Record<string, unknown>;

        return (
          <ControlGroup
            key={`group-${section.options[0].name}`}
            title={section.group}
            toggle={
              toggleOption
                ? {
                    name: toggleOption.name,
                    value: Boolean(properties[toggleOption.name]),
                    onChange: (name, value) => onChange({ [name]: value }),
                  }
                : undefined
            }
          >
            {bodyOptions.map(option => renderOption(option.name, option.props))}
          </ControlGroup>
        );
      })}
    </div>
  );
}
