import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import NumberInput from 'components/inputs/NumberInput';
import ColorInput from 'components/inputs/ColorInput';
import RangeInput from 'components/inputs/RangeInput';
import ToggleInput from 'components/inputs/ToggleInput';

export class SoundwaveControl extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        const {
            active, stageWidth, stageHeight, onChange,
            color, length, lineWidth, width, height, x, y, smooth, rotation, opacity
        } = this.props;

        return (
            <Control label="SOUNDWAVE" active={active}>
                <Option label="Color">
                    <ColorInput
                        name="color"
                        value={color}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Line Width">
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
                <Option label="Width">
                    <NumberInput
                        name="width"
                        width={40}
                        value={width}
                        min={0}
                        max={stageWidth}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="width"
                        min={0}
                        max={stageWidth}
                        value={width}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Height">
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={stageWidth}
                        value={height}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="height"
                        min={0}
                        max={stageWidth}
                        value={height}
                        onChange={onChange}
                    />
                </Option>
                <Option label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-stageWidth}
                        max={stageWidth}
                        value={x}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-stageWidth}
                        max={stageWidth}
                        value={x}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-stageHeight}
                        max={stageHeight}
                        value={y}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-stageHeight}
                        max={stageHeight}
                        value={y}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Wavelength">
                    <NumberInput
                        name="length"
                        width={40}
                        min={0}
                        max={100}
                        step={1}
                        value={length}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="length"
                        min={0}
                        max={100}
                        step={1}
                        value={length}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Smooth">
                    <ToggleInput
                        name="smooth"
                        value={smooth}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Rotation">
                    <NumberInput
                        name="rotation"
                        width={40}
                        min={0}
                        max={360}
                        value={rotation}
                        onChange={onChange}
                    />
                    <RangeInput
                        name="rotation"
                        min={0}
                        max={360}
                        value={rotation}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Opacity">
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