'use strict';

var React = require('react');
var fontOptions = require('../../../conf/fonts.json');

var Fonts = React.createClass({
    shouldComponentUpdate: function() {
        return false;
    },

    render: function() {
        var fonts = fontOptions.map(function(item, index) {
            return <div key={index} style={{fontFamily: item}}>{item}</div>;
        });

        return (
            <div className="off-screen">
                {fonts}
            </div>
        );
    }
});

module.exports = Fonts;