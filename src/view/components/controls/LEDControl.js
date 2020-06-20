import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from '../hooks/useEntity';

export default function LEDControl({ display, active }) {
  const { spacing, size, blur } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="LED" active={active} display={display} onChange={onChange}>
      <Option
        label="Spacing"
        type="number"
        name="spacing"
        value={spacing}
        min={1}
        max={100}
        withRange
        withReactor
      />
      <Option
        label="Size"
        type="number"
        name="size"
        value={size}
        min={0}
        max={100}
        withRange
        withReactor
      />
      <Option
        label="Blur"
        type="number"
        name="blur"
        value={blur}
        min={0}
        max={100}
        withRange
        withReactor
      />
    </Control>
  );
}
