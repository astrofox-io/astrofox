'use strict';

const React = require('react');
const ColorInput = require('./ColorInput.jsx');
const autoBind = require('../../util/autoBind.js');

class ColorRangeInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            startColor: props.startColor,
            endColor: props.endColor
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(nextProps);
    }

    handleChange(name, val) {
        let obj = {};
        obj[name] = val;

        this.setState(obj, function() {
            this.props.onChange(this.props.name, this.getValues());
        }.bind(this));
    }

    getValues() {
        return [this.state.startColor, this.state.endColor];
    }

    render(){
        let colorRangeStyle = {
            backgroundImage: '-webkit-linear-gradient(left, '+this.state.startColor+','+this.state.endColor+')'
        };

        return (
            <div className="input-color-range flex">
                <ColorInput
                    name="startColor"
                    value={this.state.startColor}
                    onChange={this.handleChange}
                />
                <div className="input color-range flex" style={colorRangeStyle} />
                <ColorInput
                    name="endColor"
                    value={this.state.endColor}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}

ColorRangeInput.defaultProps = {
    startColor: '#ffffff',
    endColor: '#ffffff'
};

module.exports = ColorRangeInput;
