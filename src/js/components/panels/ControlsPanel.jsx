import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import { getControlComponent } from '../../util/controls';

export default class ControlsPanel extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            displays: [],
            activeIndex: 0
        };

        this.nodes = {};
        this.controls = null;
    }

    updateControl(display) {
        let control = this.controls[display.id];

        if (control) {
            control.setState(display.options);
        }
    }

    focusControl(index) {
        let { displays } = this.state,
            display = displays[index];

        if (display) {
            let node = this.nodes[display.id];

            if (node) {
                this.controls.scrollTop = node.offsetTop;

                this.setState({ activeIndex: index });
            }
        }
    }

    getControls() {
        let { displays, activeIndex } = this.state;

        return displays.map((display, index, arr) => {
            let id = display.id,
                Component = getControlComponent(display),
                classes = {
                    'control-active': index === activeIndex,
                    'control-last': index === arr.length - 1
                };

            return (
                <div
                    key={id}
                    ref={el => this.nodes[id] = el}>
                    <Component
                        display={display}
                        className={classNames(classes)}
                    />
                </div>
            );
        });
    }

    updateState(state) {
        this.setState(state);
    }

    render() {
        let controls = this.getControls();

        return (
            <div className="controls-panel" ref={el => this.controls = el}>
                <div className="controls">
                    {controls}
                </div>
            </div>
        );
    }
}