'use strict';

const React = require('react');
const fontOptions = require('../../../config/fonts.json');

const Preload = () => {
    let fonts = fontOptions.map((item, index) => {
        return <div key={index} style={{fontFamily: item.name}}>{item.name}</div>;
    });

    return (
        <div className="hidden">
            {fonts}
        </div>
    );
};

module.exports = Preload;