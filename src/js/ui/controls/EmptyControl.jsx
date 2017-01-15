'use strict';

const React = require('react');
const { Control, Row } = require('./Control.jsx');

const EmptyControl = () => {
    return (
        <Control label="empty">
            <Row />
        </Control>
    );
};

module.exports = EmptyControl;