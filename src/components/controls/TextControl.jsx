import React, { Component } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    ColorInput,
    NumberInput,
    RangeInput,
    SelectInput,
    TextInput,
    ToggleInput,
} from 'lib/inputs';
import fonts from 'config/fonts.json';

const fontOptions = fonts.map(item => (
    { name: item, value: item, style: { fontFamily: item } }
));

export class TextControl extends Component {
    componentDidMount() {
        const { display } = this.props;

        if (display.initialized) {
            display.text.render();
        }
    }

    render() {
        const {
            active, stageWidth, stageHeight, onChange,
            text, size, font, bold, italic, color, x, y, rotation, opacity
        } = this.props;

        return (
            <Control label="TEXT" active={active}>
                <Option>
                    <Label text="Text" />
                    <TextInput
                        name="text"
                        width={140}
                        value={text}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Font" />
                    <SelectInput
                        name="font"
                        width={140}
                        items={fontOptions}
                        value={font}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Size" />
                    <NumberInput
                        name="size"
                        width={40}
                        min={0}
                        value={size}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Bold" />
                    <ToggleInput
                        name="bold"
                        value={bold}
                        onChange={onChange}
                    />
                    <Label text="Italic" />
                    <ToggleInput
                        name="italic"
                        value={italic}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Color" />
                    <ColorInput
                        name="color"
                        value={color}
                        onChange={onChange}
                    />
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
                    <RangeInput
                        name="x"
                        min={-stageWidth}
                        max={stageWidth}
                        value={x}
                        onChange={onChange}
                    />
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
                    <RangeInput
                        name="y"
                        min={-stageHeight}
                        max={stageHeight}
                        value={y}
                        onChange={onChange}
                    />
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
                    <RangeInput
                        name="rotation"
                        min={0}
                        max={360}
                        value={rotation}
                        onChange={onChange}
                    />
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

export default DisplayControl(TextControl);