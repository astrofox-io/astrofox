import React from 'react';

import UIComponent from '../UIComponent';
import ColorInput from '../inputs/ColorInput';
import NumberInput from '../inputs/NumberInput';
import RangeInput from '../inputs/RangeInput';
import SelectInput from '../inputs/SelectInput';
import TextInput from '../inputs/TextInput';
import ToggleInput from '../inputs/ToggleInput';
import { Control, Row } from './Control';

import fontOptions from '../../../config/fonts.json';

export default class TextControl extends UIComponent {
    constructor(props, context) {
        super(props);

        this.state = this.props.display.options;

        this.app = context.app;
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
            return { name: item.name, value: item.name, style: { fontFamily: item.name } };
        });
    }

    render() {
        const { width, height } = this.app.stage.getSize(),
            state = this.state;

        return (
            <Control label="TEXT" className={this.props.className}>
                <Row label="Text">
                    <TextInput
                        name="text"
                        width={140}
                        value={state.text}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Font">
                    <SelectInput
                        name="font"
                        width={140}
                        items={this.getSelectItems()}
                        value={state.font}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        min={0}
                        value={state.size}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Bold">
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
                </Row>
                <Row label="Color">
                    <ColorInput
                        name="color"
                        value={state.color}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-width}
                        max={width}
                        value={state.x}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-width}
                            max={width}
                            value={state.x}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-height}
                        max={height}
                        value={state.y}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-height}
                            max={height}
                            value={state.y}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Rotation">
                    <NumberInput
                        name="rotation"
                        width={40}
                        min={0}
                        max={360}
                        value={state.rotation}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={state.rotation}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Opacity">
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.opacity}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={state.opacity}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}

TextControl.contextTypes = {
    app: React.PropTypes.object
};