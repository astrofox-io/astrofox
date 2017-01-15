'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const { getControlComponent } = require('../../util/controls');

class ControlsPanel extends UIComponent {
    constructor(props) {
        super(props);
        
        this.state = {
            controls: [],
            activeIndex: 0
        };

        this.nodes = {};
    }

    componentWillMount() {
        this.updateControls();
    }

    updateControls(callback) {
        let controls = [];

        Application.stage.getScenes().reverse().forEach(scene => {
            controls.push(scene);
            scene.getEffects().reverse().forEach(effect => {
                controls.push(effect);
            });
            scene.getDisplays().reverse().forEach(display => {
                controls.push(display);
            });
        });

        this.setState({ controls: controls }, callback);
    }

    updateControl(layer) {
        let id = layer.id,
            control = this.refs[id];

        if (control) {
            control.setState(layer.options);
        }
    }

    focusControl(layer, index) {
        let id = layer.id,
            node = this.nodes[id];

        if (node) {
            this.refs.controls.scrollTop = node.offsetTop;
            this.setState({ activeIndex: index });
        }
    }

    render() {
        let controls = this.state.controls.map((display, index, arr) => {
            let id = display.id,
                Control = getControlComponent(display),
                wrapperClass = { 'control-active': index === this.state.activeIndex },
                controlClass = { 'control-last': index == arr.length - 1 };

            return (
                <div
                    key={id}
                    ref={el => this.nodes[id] = el}
                    className={classNames(wrapperClass)}>
                    <Control
                        ref={id}
                        display={display}
                        className={classNames(controlClass)}
                    />
                </div>
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