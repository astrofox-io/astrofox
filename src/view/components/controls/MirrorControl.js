import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from '../hooks/useEntity';

const mirrorOptions = [
  { name: 'Left 🠖 Right', value: 0 },
  { name: 'Right 🠖 Left', value: 1 },
  { name: 'Top 🠖 Botom', value: 2 },
  { name: 'Bottom 🠖 Top', value: 3 },
];

export default function MirrorControl({ display, active }) {
  const { side } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="Mirror" active={active} display={display} onChange={onChange}>
      <Option label="Side" type="select" name="side" items={mirrorOptions} value={side} />
    </Control>
  );
}
