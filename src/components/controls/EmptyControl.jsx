import React from 'react';
import { Control, Option, Label } from 'components/controls/Control';

const EmptyControl = () => {
    return (
        <Control>
            <Option>
                <Label text="Empty" />
            </Option>
        </Control>
    );
};

export default EmptyControl;