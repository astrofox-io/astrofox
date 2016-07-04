'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const autoBind = require('../../util/autoBind.js');

const defaults = {
    scale: 10.0
};

class HexagonControl extends React.Component {
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
        return (
            <div className="control">
                <div className="header">HEXAGON</div>
                <div className="row">
                    <label className="label">Scale</label>
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