import React from 'react';
import { Control, Option } from 'components/editing';

const EmptyControl = () => (
  <Control display={{ properties: {} }}>
    <Option label="Empty" />
  </Control>
);

export default EmptyControl;
