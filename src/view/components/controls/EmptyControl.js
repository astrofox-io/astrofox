import React from 'react';
import { Control, Option } from 'components/editing';

const EmptyControl = ({ display }) => (
  <Control display={display} label={display.constructor.info.label}>
    <Option label="No controls" />
  </Control>
);

export default EmptyControl;
