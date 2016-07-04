'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const ColorInput = require('../inputs/ColorInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const ToggleInput = require('../inputs/ToggleInput.jsx');
const autoBind = require('../../util/autoBind.js');

const defaults = {
    color: '#ffffff',
    height: 240,
    width: 854,
    x: 0,
    y: 0,
    lineWidth: 1.0,
    scrolling: false,
    scrollSpeed: 0.15,
    rotation: 0,
    opacity: 1.0
};

class SoundwaveControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = defaults;
    }

    componentWillMount() {
        this.shouldUpdate = false;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
            this.shouldUpdate = true;
            this.setState(display.options);
        }
        else {
            display.update(this.state);
        }
    }

    componentDidUpdate() {
        this.shouldUpdate = false;
    }

    shouldComponentUpdate() {
        return this.shouldUpdate;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.shouldUpdate = true;
        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        let maxHeight = 480;
        let maxWidth = 854;

        return (
            <div className="control">
                <div className="header">SOUNDWAVE</div>
                <div className="row">
                    <label className="label">Color</label>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">Line Width</label>
                    <NumberInput
                        name="lineWidth"
                        size="3"
                        value={this.state.lineWidth}
                        min={0}
                        max={10}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="lineWidth"
                            min={0.01}
                            max={10}
                            step={0.01}
                            value={this.state.lineWidth}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Width</label>
                    <NumberInput
                        name="width"
                        size="3"
                        value={this.state.width}
                        min={0}
                        max={maxWidth}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={maxWidth}
                            value={this.state.width}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Height</label>
                    <NumberInput
                        name="height"
                        size="3"
                        min={0}
                        max={maxWidth}
                        value={this.state.height}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={maxWidth}
                            value={this.state.height}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
                <div className="row">
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxWidth}
                        max={maxWidth}
                        value={this.state.x}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxWidth}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxHeight}
                        max={maxHeight}
                        value={this.state.y}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxHeight}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Scrolling</label>
                    <ToggleInput
                        name="scrolling"
                        value={this.state.scrolling}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <label className="label">Scroll Speed</label>
                    <NumberInput
                        name="scrollSpeed"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.01}
                        readOnly={!this.state.scrolling}
                        value={this.state.scrollSpeed}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="scrollSpeed"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.scrollSpeed}
                            readOnly={!this.state.scrolling}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Rotation</label>
                    <NumberInput
                        name="rotation"
                        size="3"
                        min={0}
                        max={360}
                        value={this.state.rotation}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={this.state.rotation}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={this.state.opacity}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.opacity}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = SoundwaveControl;