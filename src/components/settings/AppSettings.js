import React, { PureComponent } from 'react';
import Button from 'components/interface/Button';
import withAppContext from 'components/hocs/withAppContext';
import { SettingsPanel, Settings, Group, Row, ButtonRow } from 'components/layout/SettingsPanel';
import { ToggleInput } from 'lib/inputs';
import styles from './AppSettings.less';

class AppSettings extends PureComponent {
  static defaultProps = {
    onClose: () => {},
  };

  state = {
    ...this.props.app.config,
  };

  handleChange = (name, value) => {
    this.setState({ [name]: value });
  };

  handleSave = () => {
    const { app, onClose } = this.props;

    app.saveConfig(this.state).then(onClose);
  };

  handleCancel = () => {
    this.props.onClose();
  };

  render() {
    const { checkForUpdates, autoUpdate, autoPlayAudio } = this.state;

    return (
      <SettingsPanel className={styles.panel}>
        <Settings>
          <Group name="General">
            <Row label="Check for updates on start up">
              <ToggleInput
                name="checkForUpdates"
                value={checkForUpdates}
                onChange={this.handleChange}
              />
            </Row>
            <Row label="Automatically download and install updates">
              <ToggleInput name="autoUpdate" value={autoUpdate} onChange={this.handleChange} />
            </Row>
          </Group>
          <Group name="Audio">
            <Row label="Play audio on load">
              <ToggleInput
                name="autoPlayAudio"
                value={autoPlayAudio}
                onChange={this.handleChange}
              />
            </Row>
          </Group>
        </Settings>
        <ButtonRow>
          <Button text="Save" onClick={this.handleSave} />
          <Button text="Cancel" onClick={this.handleCancel} />
        </ButtonRow>
      </SettingsPanel>
    );
  }
}

export default withAppContext(AppSettings);
