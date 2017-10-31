import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import ColorInput from 'components/inputs/ColorInput';
import RangeInput from 'components/inputs/RangeInput';
import ToggleInput from 'components/inputs/ToggleInput';
import { Control, Option } from 'components/controls/Control';

export default class SoundwaveControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        const { active, stageWidth, stageHeight } = this.props,
            state = this.state;

        return (
            <Control label="SOUNDWAVE" active={active}>
                <Option label="Color">
                    <ColorInput
                        name="color"
                        value={state.color}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Line Width">
                    <NumberInput
                        name="lineWidth"
                        width={40}
                        value={state.lineWidth}
                        min={0}
                        max={10}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="lineWidth"
                        min={0.01}
                        max={10}
                        step={0.01}
                        value={state.lineWidth}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Width">
                    <NumberInput
                        name="width"
                        width={40}
                        value={state.width}
                        min={0}
                        max={stageWidth}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="width"
                        min={0}
                        max={stageWidth}
                        value={state.width}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Height">
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={stageWidth}
                        value={state.height}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="height"
                        min={0}
                        max={stageWidth}
                        value={state.height}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-stageWidth}
                        max={stageWidth}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-stageWidth}
                        max={stageWidth}
                        value={state.x}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-stageHeight}
                        max={stageHeight}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-stageHeight}
                        max={stageHeight}
                        value={state.y}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Wavelength">
                    <NumberInput
                        name="length"
                        width={40}
                        min={0}
                        max={100}
                        step={1}
                        value={state.length}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="length"
                        min={0}
                        max={100}
                        step={1}
                        value={state.length}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Smooth">
                    <ToggleInput
                        name="smooth"
                        value={state.smooth}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Rotation">
                    <NumberInput
                        name="rotation"
                        width={40}
                        min={0}
                        max={360}
                        value={state.rotation}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="rotation"
                        min={0}
                        max={360}
                        value={state.rotation}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Opacity">
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="opacity"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}