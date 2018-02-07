import React, { PureComponent } from 'react';
import classNames from 'classnames';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import Icon from 'components/interface/Icon';
import {
    NumberInput,
    ImageInput,
    RangeInput
} from 'lib/inputs';
import iconLink from 'svg/icons/link.svg';
import blankImage from 'images/data/blank.gif';
import styles from './ImageControl.less';

export class ImageControl extends PureComponent {
    constructor(props) {
        super(props);

        this.image = document.createElement('img');
    }

    onChange = (name, value) => {
        let obj = {},
            { src, fixed, onChange } = this.props,
            image = this.imageInput.getImage(),
            ratio = image.naturalWidth / image.naturalHeight;

        if (name === 'src') {
            this.image = image;

            // Reset values
            if (value === blankImage) {
                obj.width = 0;
                obj.height = 0;
                obj.x = 0;
                obj.y = 0;
                obj.rotation = 0;
                obj.opacity = 0;
            }

            // Load new image
            if (value !== src) {
                obj.width = image.naturalWidth;
                obj.height = image.naturalHeight;
                obj.opacity = 1.0;
            }
        }
        else if (name === 'width') {
            if (fixed) {
                obj.height = Math.round(value * (1 / ratio)) || 0;
            }
        }
        else if (name === 'height') {
            if (fixed) {
                obj.width = Math.round(value * ratio);
            }
        }

        if (onChange) {
            onChange(name, value, obj);
        }
    };

    onLinkClick = () => {
        this.onChange('fixed', !this.props.fixed);
    };

    render() {
        const {
                active, stageWidth, stageHeight, display, onReactorChange,
                fixed, src, width, height, x, y, rotation, opacity
            } = this.props,
            image = this.image,
            readOnly = !(image && image.src && image.src !== blankImage),
            imageWidth = readOnly ? 0 : image.naturalWidth,
            imageHeight = readOnly ? 0 : image.naturalHeight,
            maxWidth = imageWidth * 2,
            maxHeight = imageHeight * 2,
            xMax = readOnly ? 0 : (imageWidth > stageWidth) ? imageWidth : stageWidth,
            yMax = readOnly ? 0 : (imageHeight > stageHeight) ? imageHeight : stageHeight;

        return (
            <Control label="IMAGE" active={active} display={display}>
                <Option>
                    <Label text="Image" />
                    <ImageInput
                        name="src"
                        ref={e => this.imageInput = e}
                        value={src}
                        onChange={this.onChange}
                    />
                </Option>
                <Option>
                    <Label text="Width">
                        <Icon
                            className={classNames({
                                [styles.linkIcon]: true,
                                [styles.linkIconActive]: fixed
                            })}
                            glyph={iconLink}
                            onClick={this.onLinkClick}
                        />
                    </Label>
                    <NumberInput
                        name="width"
                        width={40}
                        min={0}
                        max={maxWidth}
                        value={width}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="width"
                        min={0}
                        max={maxWidth}
                        value={width}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option>
                    <Label text="Height">
                        <Icon
                            className={classNames({
                                [styles.linkIcon]: true,
                                [styles.linkIconActive]: fixed
                            })}
                            glyph={iconLink}
                            onClick={this.onLinkClick}
                        />
                    </Label>
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={maxHeight}
                        value={height}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="height"
                        min={0}
                        max={maxHeight}
                        value={height}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option>
                    <Label text="X" />
                    <NumberInput
                        name="x"
                        width={40}
                        min={-xMax}
                        max={xMax}
                        value={x}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="x"
                        min={-xMax}
                        max={xMax}
                        value={x}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option>
                    <Label text="Y" />
                    <NumberInput
                        name="y"
                        width={40}
                        min={-yMax}
                        max={yMax}
                        value={y}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="y"
                        min={-yMax}
                        max={yMax}
                        value={y}
                        readOnly={readOnly}
                        onChange={this.onChange}
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
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="rotation"
                        min={0}
                        max={360}
                        value={rotation}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
                <Option
                    reactorName="opacity"
                    onReactorChange={onReactorChange}>
                    <Label text="Opacity" />
                    <NumberInput
                        name="opacity"
                        width={40}
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={readOnly ? 0 : opacity}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="opacity"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={readOnly ? 0 : opacity}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(ImageControl);