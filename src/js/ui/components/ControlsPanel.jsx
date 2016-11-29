'use strict';

const React = require('react');
const ReactDOM = require('react-dom');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const { getControlComponent } = require('../../util/controls');

class ControlsPanel extends UIComponent {
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

        Application.stage.scenes.nodes.reverse().forEach(scene => {
            controls.push(scene);
            scene.effects.nodes.reverse().forEach(effect => {
                controls.push(effect);
            });
            scene.displays.nodes.reverse().forEach(display => {
                controls.push(display);
            });
        });

        this.setState({ controls: controls }, callback);
    }

    updateControl(layer) {
        let id = layer.id,
            control = this.refs[id];

        if (control) {
            this.refs[id].setState(layer.options);
        }
    }

    focusControl(layer) {
        let id = layer.id,
            node = ReactDOM.findDOMNode(this.refs[id]);

        if (node) {
            this.refs.controls.scrollTop = node.offsetTop;
        }
    }

    render() {
        let controls = this.state.controls.map(display => {
            let id = display.id,
                Control = getControlComponent(display);

            return (
                <Control
                    ref={id}
                    key={id}
                    display={display}
                />
            );
        });

        return (
            <div className="controls-panel" ref="controls">
                <div className="controls">
                    {controls}
                </div>
            </div>
        );
    }
}

module.exports = ControlsPanel;