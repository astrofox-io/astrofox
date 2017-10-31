import React from 'react';
import { Control, Option } from 'components/controls/Control';

const EmptyControl = () => {
    return (
        <Control label="empty">
            <Option />
        </Control>
    );
};

export default EmptyControl;