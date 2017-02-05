import React from 'react';
import { Control, Row } from './Control';

const EmptyControl = () => {
    return (
        <Control label="empty">
            <Row />
        </Control>
    );
};

export default EmptyControl;