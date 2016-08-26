'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');

class LEDControl extends UIComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
        this.shouldUpdate = false;
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
        return (
            <div className="control">
                <div className="header">LED</div>
                <div className="row">
                    <span className="label">Spacing</span>
                    <NumberInput
                        name="spacing"
                        size="3"
                        value={this.state.spacing}
                        min={1}
                        max={100}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="spacing"
                            min={1}
                            max={100}
                            value={this.state.spacing}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Size</span>
                    <NumberInput
                        name="size"
                        size="3"
                        value={this.state.size}
                        min={0}
                        max={100}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={0}
                            max={100}
                            value={this.state.size}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Blur</span>
                    <NumberInput
                        name="blur"
                        size="3"
                        value={this.state.blur}
                        min={0}
                        max={100}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="blur"
                            min={0}
                            max={100}
                            value={this.state.blur}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = LEDControl;