'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Application = require('../../core/Application.js');
const ControlLoader = require('../../util/ControlLoader.js');

class ControlsPanel extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            controls: [],
            activeIndex: -1
        };
    }

    componentWillMount() {
        this.updateControls();
    }

    updateControls(callback) {
        let controls = [];

        Application.stage.scenes.nodes.reverse().forEach(function(scene) {
            controls.push(scene);
            scene.effects.nodes.reverse().forEach(function(effect) {
                controls.push(effect);
            }, this);
            scene.displays.nodes.reverse().forEach(function(display) {
                controls.push(display);
            }, this);
        }, this);

        this.setState({ controls: controls }, callback);
    }

    updateControl(layer) {
        let id = layer.toString(),
            control = this.refs[id];

        if (control) {
            this.refs[id].setState(layer.options);
        }
    }

    focusControl(layer) {
        let id = layer.toString(),
            node = ReactDOM.findDOMNode(this.refs[id]);

        if (node) {
            this.refs.controls.scrollTop = node.offsetTop;
        }
    }

    render() {
        let controls = this.state.controls.map(function(display) {
            let id = display.toString(),
                Control = ControlLoader.getControl(display) || 'div';

            return (
                <Control
                    ref={id}
                    key={id}
                    display={display}
                />
            );
        }, this);

        return (
            <div className="controls-panel" ref="controls">
                {controls}
            </div>
        );
    }
}

module.exports = ControlsPanel;