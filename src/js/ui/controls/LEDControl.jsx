'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const autoBind = require('../../util/autoBind.js');

const defaults = {
    spacing: 10,
    size: 4,
    blur: 4
};

class LEDControl extends React.Component {
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

    handleChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, function() {
            display.update(obj);
        });
    }

    render() {
        return (
            <div className="control">
                <div className="header">LED</div>
                <div className="row">
                    <label className="label">Spacing</label>
                    <NumberInput
                        name="spacing"
                        size="3"
                        value={this.state.spacing}
                        min={1}
                        max={100}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="spacing"
                            min={1}
                            max={100}
                            value={this.state.spacing}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Size</label>
                    <NumberInput
                        name="size"
                        size="3"
                        value={this.state.size}
                        min={0}
                        max={100}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={0}
                            max={100}
                            value={this.state.size}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Blur</label>
                    <NumberInput
                        name="blur"
                        size="3"
                        value={this.state.blur}
                        min={0}
                        max={100}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="blur"
                            min={0}
                            max={100}
                            value={this.state.blur}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = LEDControl;