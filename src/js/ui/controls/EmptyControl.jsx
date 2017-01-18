import React from 'react';
import { Control, Row } from './Control.jsx';

const EmptyControl = () => {
    return (
        <Control label="empty">
            <Row />
        </Control>
    );
};

export default EmptyControl;