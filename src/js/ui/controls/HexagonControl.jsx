'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');

class HexagonControl extends UIComponent {
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
                <div className="header">HEXAGON</div>
                <div className="row">
                    <span className="label">Scale</span>
                    <NumberInput
                        name="scale"
                        size="3"
                        value={this.state.scale}
                        min={1}
                        max={200}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="scale"
                            min={1}
                            max={200}
                            value={this.state.scale}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = HexagonControl;