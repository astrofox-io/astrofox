'use strict';

const React = require('react');
const autoBind = require('../../util/autoBind.js');

const ColorInput = require('../inputs/ColorInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');

const defaults = {
    aspectRatio: '16:9',
    width: 854,
    height: 480,
    backgroundColor: '#000000'
};

const canvasSizes = {
    '16:9': { width: 854, height: 480 },
    '4:3': { width: 640, height: 480 },
    '1:1': { width: 480, height: 480 }
};

class CanvasSettings extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = Object.assign({}, defaults, this.props.values);
    }

    onChange(name, val) {
        let obj = {};

        obj[name] = val;

        if (name === 'aspectRatio') {
            Object.assign(obj, canvasSizes[val]);
        }

        this.setState(obj);
    }

    onCancel() {
        this.props.onClose();
    }

    getSettings() {
        return this.state;
    }

    render() {
        const state = this.state;

        return (
            <div className="group">
                <div className="header">Canvas</div>
                <div className="row">
                    <span className="label">Aspect Ratio</span>
                    <SelectInput
                        name="aspectRatio"
                        size="20"
                        items={Object.keys(canvasSizes)}
                        value={state.aspectRatio}
                        onChange={this.onChange}
                    />
                </div>
                <div className="row">
                    <span className="label">Background Color</span>
                    <ColorInput
                        name="backgroundColor"
                        value={state.backgroundColor}
                        onChange={this.onChange}
                    />
                </div>
            </div>
        );
    }
}

CanvasSettings.defaultProps = {
    values: {}
};

module.exports = CanvasSettings;