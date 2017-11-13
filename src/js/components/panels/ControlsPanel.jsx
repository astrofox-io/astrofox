import React from 'react';
import propTypes from 'prop-types';

import { getControlComponent } from 'util/controls';

export default class ControlsPanel extends React.PureComponent {
    constructor(props, context) {
        super(props);

        this.state = {
            displays: [],
            activeIndex: 0
        };

        this.nodes = {};
        this.controls = {};

        this.app = context.app;
    }

    componentDidUpdate() {
        this.focusControl(this.state.activeIndex);
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
                this.nodes.panel.scrollTop = node.offsetTop;

                this.setState({ activeIndex: index });
            }
        }
    }

    getControls() {
        let { displays, activeIndex } = this.state,
            { width, height } = this.app.stage.getSize();

        return displays.map((display, index) => {
            let id = display.id,
                Component = getControlComponent(display);

            return (
                <div
                    key={id}
                    ref={el => this.nodes[id] = el}
                    className="control-wrapper">
                    <Component
                        ref={el => this.controls[id] = el}
                        display={display}
                        active={index === activeIndex}
                        stageWidth={width}
                        stageHeight={height}
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
            <div className="controls-panel" ref={el => this.nodes.panel = el}>
                <div className="controls">
                    {controls}
                </div>
            </div>
        );
    }
}

ControlsPanel.contextTypes = {
    app: propTypes.object
};