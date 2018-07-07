import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/interface/Button';
import { SettingsPanel, Settings, Group, Row, ButtonRow } from 'components/layout/SettingsPanel';
import { ToggleInput } from 'lib/inputs';
import styles from './AppSettings.less';

export default class AppSettings extends PureComponent {
    static contextTypes = {
        app: PropTypes.object,
    }

    static defaultProps = {
        onClose: () => {},
    }

    constructor(props, context) {
        super(props);

        this.app = context.app;
        this.state = { ...this.app.config };
    }

    onChange = (name, value) => {
        this.setState({ [name]: value });
    }

    onSave = () => {
        this.app.saveConfigFile(this.state)
            .then(() => {
                this.props.onClose();
            });
    }

    onCancel = () => {
        this.props.onClose();
    }

    render() {
        const {
            checkForUpdates,
            autoUpdate,
            showWatermark,
            autoPlayAudio,
        } = this.state;

        return (
            <SettingsPanel className={styles.panel}>
                <Settings>
                    <Group name="General">
                        <Row label="Check for updates on start up">
                            <ToggleInput
                                name="checkForUpdates"
                                value={checkForUpdates}
                                onChange={this.onChange}
                            />
                        </Row>
                        <Row label="Automatically download and install updates">
                            <ToggleInput
                                name="autoUpdate"
                                value={autoUpdate}
                                onChange={this.onChange}
                            />
                        </Row>
                        <Row label="Show watermark" description="Watermark will still appear in videos">
                            <ToggleInput
                                name="showWatermark"
                                value={showWatermark}
                                onChange={this.onChange}
                            />
                        </Row>
                    </Group>
                    <Group name="Audio">
                        <Row label="Play audio on load">
                            <ToggleInput
                                name="autoPlayAudio"
                                value={autoPlayAudio}
                                onChange={this.onChange}
                            />
                        </Row>
                    </Group>
                </Settings>
                <ButtonRow>
                    <Button text="Save" onClick={this.onSave} />
                    <Button text="Cancel" onClick={this.onCancel} />
                </ButtonRow>
            </SettingsPanel>
        );
    }
}
