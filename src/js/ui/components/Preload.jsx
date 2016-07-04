'use strict';

const React = require('react');
const fontOptions = require('../../../conf/fonts.json');

const Fonts = (props) => {
    let fonts = fontOptions.map((item, index) => {
        return <div key={index} style={{fontFamily: item}}>{item}</div>;
    });

    return (
        <div className="off-screen">
            {fonts}
        </div>
    );
};

module.exports = Fonts;