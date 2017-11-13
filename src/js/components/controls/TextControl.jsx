import React from 'react';

import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option } from 'components/controls/Control';

import ColorInput from 'components/inputs/ColorInput';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import TextInput from 'components/inputs/TextInput';
import ToggleInput from 'components/inputs/ToggleInput';

import fontOptions from 'config/fonts.json';

export class TextControl extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { display } = this.props;

        if (display.initialized) {
            display.text.render();
        }
    }

    getSelectItems() {
        return fontOptions.map(item => {
            return { name: item, value: item, style: { fontFamily: item } };
        });
    }

    render() {
        const {
            active, stageWidth, stageHeight, onChange,
            text, size, font, bold, italic, color, x, y, rotation, opacity
        } = this.props;

        return (
            <Control label="TEXT" active={active}>
                <Option label="Text">
                    <TextInput
                        name="text"
                        width={140}
                        value={text}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Font">
                    <SelectInput
                        name="font"
                        width={140}
                        items={this.getSelectItems()}
                        value={font}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        min={0}
                        value={size}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Bold">
                    <ToggleInput
                        name="bold"
                        value={bold}
                        onChange={onChange}
                    />
                    <span className="label">Italic</span>
                    <ToggleInput
                        name="italic"
                        value={italic}
                        onChange={onChange}
                    />
                </Option>
                <Option label="Color">
                    <ColorInput
                        name="color"
                        value={color}
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

export default DisplayControl(TextControl);