import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
    SelectInput,
    ToggleInput,
    ReactorInput,
} from 'lib/inputs';

const blendOptions = [
    'None',
    'Normal',
    { separator: true },
    'Darken',
    'Multiply',
    'Color Burn',
    'Linear Burn',
    { separator: true },
    'Lighten',
    'Screen',
    'Color Dodge',
    'Linear Dodge',
    { separator: true },
    'Overlay',
    'Soft Light',
    'Hard Light',
    'Vivid Light',
    'Linear Light',
    'Pin Light',
    'Hard Mix',
    { separator: true },
    'Difference',
    'Exclusion',
    'Subtract',
    'Divide',
    { separator: true },
    'Negation',
    'Phoenix',
    'Glow',
    'Reflect',
];

export class SceneControl extends PureComponent {
    onChange = (name, value) => {
        const { onChange } = this.props;

        // Ignore separators
        if (name === 'blendMode' && typeof value !== 'string') {
            return;
        }

        onChange(name, value);
    }

    render() {
        const {
            active, display, blendMode, opacity,
            lightIntensity, lightDistance, cameraZoom, mask, inverse,
            onReactorChange,
        } = this.props;

        return (
            <Control
                label="SCENE"
                active={active}
                display={display}
            >
                <Option>
                    <Label text="Blending" />
                    <SelectInput
                        name="blendMode"
                        width={140}
                        items={blendOptions}
                        value={blendMode}
                        onChange={this.onChange}
                    />
                </Option>
                <Option>
                    <Label text="Opacity" />
                    <ReactorInput
                        name="opacity"
                        onReactorChange={onReactorChange}
                    >
                        <NumberInput
                            name="opacity"
                            width={40}
                            value={opacity}
                            min={0}
                            max={1.0}
                            step={0.01}
                            onChange={this.onChange}
                        />
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={opacity}
                            onChange={this.onChange}
                        />
                    </ReactorInput>
                </Option>
                <Option>
                    <Label text="Light Intensity" />
                    <NumberInput
                        name="lightIntensity"
                        width={40}
                        min={0.0}
                        max={10.0}
                        step={0.1}
                        value={lightIntensity}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="lightIntensity"
                        min={0.0}
                        max={10.0}
                        step={0.1}
                        value={lightIntensity}
                        onChange={this.onChange}
                    />
                </Option>
                <Option>
                    <Label text="Light Distance" />
                    <NumberInput
                        name="lightDistance"
                        width={40}
                        min={-500}
                        max={500}
                        value={lightDistance}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="lightDistance"
                        min={-500}
                        max={500}
                        value={lightDistance}
                        onChange={this.onChange}
                    />
                </Option>
                <Option>
                    <Label text="Camera Zoom" />
                    <NumberInput
                        name="cameraZoom"
                        width={40}
                        min={0}
                        max={1000}
                        value={cameraZoom}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="cameraZoom"
                        min={0}
                        max={1000}
                        value={cameraZoom}
                        onChange={this.onChange}
                    />
                </Option>
                <Option>
                    <Label text="Mask" />
                    <ToggleInput
                        name="mask"
                        value={mask}
                        onChange={this.onChange}
                    />
                    <Label text="Inverse" />
                    <ToggleInput
                        name="inverse"
                        value={inverse}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(SceneControl);
