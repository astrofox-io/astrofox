import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import { NumberInput, ColorInput, RangeInput, ToggleInput } from 'lib/inputs';

export class SoundwaveControl extends PureComponent {
  render() {
    const {
      display,
      active,
      stageWidth,
      stageHeight,
      color,
      wavelength,
      lineWidth,
      width,
      height,
      x,
      y,
      smooth,
      rotation,
      opacity,
      onChange,
    } = this.props;

    return (
      <Control label="Soundwave" active={active} display={display}>
        <Option>
          <Label text="Color" />
          <ColorInput name="color" value={color} onChange={onChange} />
        </Option>
        <Option>
          <Label text="Line Width" />
          <NumberInput
            name="lineWidth"
            width={40}
            value={lineWidth}
            min={0}
            max={10}
            onChange={onChange}
          />
          <RangeInput
            name="lineWidth"
            min={0.01}
            max={10}
            step={0.01}
            value={lineWidth}
            onChange={onChange}
          />
        </Option>
        <Option>
          <Label text="Width" />
          <NumberInput
            name="width"
            width={40}
            value={width}
            min={0}
            max={stageWidth}
            onChange={onChange}
          />
          <RangeInput name="width" min={0} max={stageWidth} value={width} onChange={onChange} />
        </Option>
        <Option>
          <Label text="Height" />
          <NumberInput
            name="height"
            width={40}
            min={0}
            max={stageWidth}
            value={height}
            onChange={onChange}
          />
          <RangeInput name="height" min={0} max={stageWidth} value={height} onChange={onChange} />
        </Option>
        <Option>
          <Label text="X" />
          <NumberInput
            name="x"
            width={40}
            min={-stageWidth}
            max={stageWidth}
            value={x}
            onChange={onChange}
          />
          <RangeInput name="x" min={-stageWidth} max={stageWidth} value={x} onChange={onChange} />
        </Option>
        <Option>
          <Label text="Y" />
          <NumberInput
            name="y"
            width={40}
            min={-stageHeight}
            max={stageHeight}
            value={y}
            onChange={onChange}
          />
          <RangeInput name="y" min={-stageHeight} max={stageHeight} value={y} onChange={onChange} />
        </Option>
        <Option>
          <Label text="Wavelength" />
          <NumberInput
            name="wavelength"
            width={40}
            min={0}
            max={100}
            step={1}
            value={wavelength}
            onChange={onChange}
          />
          <RangeInput
            name="wavelength"
            min={0}
            max={100}
            step={1}
            value={wavelength}
            onChange={onChange}
          />
        </Option>
        <Option>
          <Label text="Smooth" />
          <ToggleInput name="smooth" value={smooth} onChange={onChange} />
        </Option>
        <Option>
          <Label text="Rotation" />
          <NumberInput
            name="rotation"
            width={40}
            min={0}
            max={360}
            value={rotation}
            onChange={onChange}
          />
          <RangeInput name="rotation" min={0} max={360} value={rotation} onChange={onChange} />
        </Option>
        <Option>
          <Label text="Opacity" />
          <NumberInput
            name="opacity"
            width={40}
            min={0}
            max={1.0}
            step={0.01}
            value={opacity}
            onChange={onChange}
          />
          <RangeInput
            name="opacity"
            min={0}
            max={1.0}
            step={0.01}
            value={opacity}
            onChange={onChange}
          />
        </Option>
      </Control>
    );
  }
}

export default DisplayControl(SoundwaveControl);
