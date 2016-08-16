'use strict';

const React = require('react');

const UIComponent = require('../UIComponent.js');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');

class MirrorControl extends UIComponent {
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
                <div className="header">MIRROR</div>
                <div className="row">
                    <span className="label">Side</span>
                    <NumberInput
                        name="side"
                        size="3"
                        value={this.state.side}
                        min={0}
                        max={3}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="side"
                            min={0}
                            max={3}
                            value={this.state.side}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = MirrorControl;