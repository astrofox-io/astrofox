'use strict';

const React = require('react');
const { Control, Row } = require('./Control.jsx');

const EmptyControl = (props) => {
    return (
        <Control title="empty">
            <Row />
        </Control>
    );
};

module.exports = EmptyControl;