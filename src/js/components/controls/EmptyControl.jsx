import React from 'react';
import { Control, Row } from 'components/controls/Control';

const EmptyControl = () => {
    return (
        <Control label="empty">
            <Row />
        </Control>
    );
};

export default EmptyControl;