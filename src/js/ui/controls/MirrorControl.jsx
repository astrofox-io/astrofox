'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const autoBind = require('../../util/autoBind.js');

const defaults = {
    side: 1
};

class MirrorControl extends React.Component {
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
                <div className="header">MIRROR</div>
                <div className="row">
                    <label className="label">Side</label>
                    <NumberInput
                        name="side"
                        size="3"
                        value={this.state.side}
                        min={0}
                        max={3}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="side"
                            min={0}
                            max={3}
                            value={this.state.side}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = MirrorControl;