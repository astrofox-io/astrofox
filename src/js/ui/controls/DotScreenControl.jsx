'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const autoBind = require('../../util/autoBind.js');

class DotScreenControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = Object.assign({}, this.props.display.constructor.defaults);
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
            display.update(this.state);
        });
    }

    render() {
        return (
            <div className="control">
                <div className="header">DOT SCREEN</div>
                <div className="row">
                    <span className="label">Amount</span>
                    <NumberInput
                        name="scale"
                        size="3"
                        value={this.state.scale}
                        min={0}
                        max={2.0}
                        step={0.01}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="scale"
                            min={0.0}
                            max={2.0}
                            step={0.01}
                            value={this.state.scale}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Angle</span>
                    <NumberInput
                        name="angle"
                        size="3"
                        value={this.state.angle}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                        />
                    <div className="input flex">
                        <RangeInput
                            name="angle"
                            min={0}
                            max={360}
                            value={this.state.angle}
                            onChange={this.onChange}
                            />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = DotScreenControl;