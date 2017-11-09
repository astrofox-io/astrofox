import React from 'react';
import classNames from 'classnames';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import ImageInput from 'components/inputs/ImageInput';
import RangeInput from 'components/inputs/RangeInput';
import { Control, Option } from 'components/controls/Control';
import Icon from 'components/interface/Icon';

import iconLink from 'svg/icons/link.svg';
import BLANK_IMAGE from 'images/data/blank.gif';

export default class ImageControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = props.display.options;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
            this.setState(display.options);
        }

        this.image = this.imageInput.getImage();
    }

    onChange(name, val) {
        let obj = {},
            { display } = this.props,
            { src, fixed } = this.state,
            image = this.imageInput.getImage(),
            ratio = image.naturalWidth / image.naturalHeight;

        obj[name] = val;

        if (name === 'src') {
            // Reset values
            obj.width = 0;
            obj.height = 0;
            obj.x = 0;
            obj.y = 0;
            obj.rotation = 0;
            obj.opacity = 0;

            if (val !== BLANK_IMAGE) {
                // Load new image
                if (val !== src) {
                    obj.width = image.naturalWidth;
                    obj.height = image.naturalHeight;
                    obj.opacity = 1.0;
                }
                // Restore values from state
                else {
                    Object.assign(obj, this.state);
                }
            }
        }
        else if (name === 'width') {
            if (fixed) {
                obj.height = Math.round(val * (1 / ratio)) || 0;
            }
        }
        else if (name === 'height') {
            if (fixed) {
                obj.width = Math.round(val * ratio);
            }
        }

        this.setState(obj, () => {
            display.update(obj);

            if (name === 'src') {
                this.image = image;
                this.forceUpdate();
            }
        });
    }

    onReactorChange(name, options) {
        this.props.display.setReactor(name, options);
        this.forceUpdate();
    }

    onLinkClick() {
        this.onChange('fixed', !this.state.fixed);
    }

    render() {
        let { active, stageWidth, stageHeight, display } = this.props,
            state = this.state,
            image = this.image,
            readOnly = !(image && image.src && image.src !== BLANK_IMAGE),
            imageWidth = readOnly ? 0 : image.naturalWidth,
            imageHeight = readOnly ? 0 : image.naturalHeight,
            xMax = readOnly ? 0 : (imageWidth > stageWidth) ? imageWidth : stageWidth,
            yMax = readOnly ? 0 : (imageHeight > stageHeight) ? imageHeight : stageHeight,
            linkClasses = {
                'input-link': true,
                'input-link-on': state.fixed
            },
            linkIcon = <Icon key={0} className={classNames(linkClasses)} glyph={iconLink} onClick={this.onLinkClick} />;

        return (
            <Control label="IMAGE" active={active} display={display}>
                <Option label="Image">
                    <ImageInput
                        name="src"
                        ref={el => this.imageInput = el}
                        src={state.src}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label={['Width', linkIcon]}>
                    <NumberInput
                        name="width"
                        width={40}
                        min={0}
                        max={imageWidth*2}
                        value={state.width}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="width"
                        min={0}
                        max={imageWidth*2}
                        value={state.width}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label={['Height', linkIcon]}>
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={imageHeight*2}
                        value={state.height}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="height"
                        min={0}
                        max={imageHeight*2}
                        value={state.height}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-xMax}
                        max={xMax}
                        value={state.x}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-xMax}
                        max={xMax}
                        value={state.x}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-yMax}
                        max={yMax}
                        value={state.y}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-yMax}
                        max={yMax}
                        value={state.y}
                        readOnly={readOnly}
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
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="rotation"
                        min={0}
                        max={360}
                        value={state.rotation}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option
                    label="Opacity"
                    reactorName="opacity"
                    onReactorChange={this.onReactorChange}>
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={readOnly ? 0 : state.opacity}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="opacity"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={readOnly ? 0 : state.opacity}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}