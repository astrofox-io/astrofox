import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { getControlComponent } from 'utils/controls';
import styles from './ControlsPanel.less';

export default class ControlsPanel extends PureComponent {
    static contextTypes = {
        app: PropTypes.object
    }

    state = {
        displays: [],
        activeIndex: 0,
    }

    constructor(props, context) {
        super(props);

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
                    ref={e => this.nodes[id] = e}
                    className={styles.wrapper}>
                    <Component
                        ref={e => this.controls[id] = e}
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
            <div className={styles.panel} ref={e => this.nodes.panel = e}>
                <div>
                    {controls}
                </div>
            </div>
        );
    }
}