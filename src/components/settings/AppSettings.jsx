import React, { PureComponent } from 'react';
import Button from 'components/interface/Button';
import withAppContext from 'components/hocs/withAppContext';
import { SettingsPanel, Settings, Group, Row, ButtonRow } from 'components/layout/SettingsPanel';
import { ToggleInput } from 'lib/inputs';
import styles from './AppSettings.less';

class AppSettings extends PureComponent {
    static defaultProps = {
        onClose: () => {},
    }

    state = {
        ...this.props.app.config,
    }

    onChange = (name, value) => {
        this.setState({ [name]: value });
    }

    onSave = () => {
        const { app, onClose } = this.props;

        app.saveConfig(this.state)
            .then(onClose);
    }

    onCancel = () => {
        this.props.onClose();
    }

    render() {
        const { app: { license } } = this.props;
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
                        {
                            license.valid && (
                                <Row label="Show watermark">
                                    <ToggleInput
                                        name="showWatermark"
                                        value={showWatermark}
                                        onChange={this.onChange}
                                    />
                                </Row>
                            )
                        }
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

export default withAppContext(AppSettings);
