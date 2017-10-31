import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import ColorInput from 'components/inputs/ColorInput';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import SelectInput from 'components/inputs/SelectInput';
import TextInput from 'components/inputs/TextInput';
import ToggleInput from 'components/inputs/ToggleInput';
import { Control, Option } from 'components/controls/Control';

import fontOptions from 'config/fonts.json';

export default class TextControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
            this.setState(display.options, () => {
                display.text.render();
            });
        }
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    getSelectItems() {
        return fontOptions.map(item => {
            return { name: item, value: item, style: { fontFamily: item } };
        });
    }

    render() {
        const { active, stageWidth, stageHeight } = this.props,
            state = this.state;

        return (
            <Control label="TEXT" active={active}>
                <Option label="Text">
                    <TextInput
                        name="text"
                        width={140}
                        value={state.text}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Font">
                    <SelectInput
                        name="font"
                        width={140}
                        items={this.getSelectItems()}
                        value={state.font}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        min={0}
                        value={state.size}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Bold">
                    <ToggleInput
                        name="bold"
                        value={state.bold}
                        onChange={this.onChange}
                    />
                    <span className="label">Italic</span>
                    <ToggleInput
                        name="italic"
                        value={state.italic}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Color">
                    <ColorInput
                        name="color"
                        value={state.color}
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