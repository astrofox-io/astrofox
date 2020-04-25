import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from 'components/interface/Button';
import { SettingsPanel, Settings, Row } from 'components/layout/SettingsPanel';
import ButtonRow from 'components/layout/ButtonRow';
import { ColorInput, NumberInput } from 'components/inputs';
import { updateCanvas } from 'actions/stage';
import styles from './CanvasSettings.less';

export default function CanvasSettings({ onClose }) {
  const dispatch = useDispatch();
  const stageConfig = useSelector(({ stage }) => stage);
  const [state, setState] = useState(stageConfig);
  const { width, height, backgroundColor } = state;

  function handleChange(name, value) {
    setState({ ...state, [name]: value });
  }

  function handleCancel() {
    onClose();
  }

  async function handleSave() {
    await dispatch(updateCanvas(width, height, backgroundColor));
    onClose();
  }

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
            onChange={handleChange}
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
            onChange={handleChange}
          />
        </Row>
        <Row label="Background Color">
          <ColorInput name="backgroundColor" value={backgroundColor} onChange={handleChange} />
        </Row>
      </Settings>
      <ButtonRow>
        <Button onClick={handleSave} text="OK" />
        <Button onClick={handleCancel} text="Cancel" />
      </ButtonRow>
    </SettingsPanel>
  );
}
