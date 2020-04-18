import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from 'components/interface/Button';
import { SettingsPanel, Settings, Group, Row, ButtonRow } from 'components/layout/SettingsPanel';
import { ToggleInput } from 'components/inputs';
import { saveConfig } from 'actions/config';
import styles from './AppSettings.less';

export default function AppSettings({ onClose }) {
  const dispatch = useDispatch();
  const appConfig = useSelector(({ config }) => config);
  const [state, setState] = useState(appConfig);
  const { checkForUpdates, autoUpdate, autoPlayAudio } = state;

  function handleChange(name, value) {
    setState({ ...state, [name]: value });
  }

  function handleSave() {
    dispatch(saveConfig(state)).then(onClose);
  }

  function handleCancel() {
    onClose();
  }

  return (
    <SettingsPanel className={styles.panel}>
      <Settings>
        <Group name="General">
          <Row label="Check for updates on start up">
            <ToggleInput name="checkForUpdates" value={checkForUpdates} onChange={handleChange} />
          </Row>
          <Row label="Automatically download and install updates">
            <ToggleInput name="autoUpdate" value={autoUpdate} onChange={handleChange} />
          </Row>
        </Group>
        <Group name="Audio">
          <Row label="Play audio on load">
            <ToggleInput name="autoPlayAudio" value={autoPlayAudio} onChange={handleChange} />
          </Row>
        </Group>
      </Settings>
      <ButtonRow>
        <Button text="Save" onClick={handleSave} />
        <Button text="Cancel" onClick={handleCancel} />
      </ButtonRow>
    </SettingsPanel>
  );
}
