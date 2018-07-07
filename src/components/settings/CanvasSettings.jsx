import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/interface/Button';
import {
    SettingsPanel,
    Settings,
    Row,
    ButtonRow,
} from 'components/layout/SettingsPanel';
import {
    ColorInput,
    NumberInput,
} from 'lib/inputs';
import styles from './CanvasSettings.less';

export default class CanvasSettings extends Component {
    static contextTypes = {
        app: PropTypes.object,
    }

    static defaultProps = {
        onClose: () => {},
    }

    constructor(props, context) {
        super(props);

        this.app = context.app;
        this.state = this.app.stage.options;
    }

    onChange = (name, value) => {
        this.setState({ [name]: value });
    }

    onCancel = () => {
        this.props.onClose();
    }

    onSave = () => {
        this.app.stage.update(this.state);

        this.props.onClose();
    }

    render() {
        const {
            width,
            height,
            backgroundColor,
        } = this.state;

        return (
            <SettingsPanel className={styles.panel}>
                <Settings>
                    <Row label="Width">
                        <NumberInput
                            name="width"
                            width={40}
                            min={240}
                            max={1920}
                            step={2}
                            value={width}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Height">
                        <NumberInput
                            name="height"
                            width={40}
                            min={240}
                            max={1080}
                            step={2}
                            value={height}
                            onChange={this.onChange}
                        />
                    </Row>
                    <Row label="Background Color">
                        <ColorInput
                            name="backgroundColor"
                            value={backgroundColor}
                            onChange={this.onChange}
                        />
                    </Row>
                </Settings>
                <ButtonRow>
                    <Button onClick={this.onSave} text="OK" />
                    <Button onClick={this.onCancel} text="Cancel" />
                </ButtonRow>
            </SettingsPanel>
        );
    }
}
