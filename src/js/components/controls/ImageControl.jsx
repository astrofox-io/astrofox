import React from 'react';
import classNames from 'classnames';

import UIPureComponent from '../UIPureComponent';
import NumberInput from '../inputs/NumberInput';
import ImageInput from '../inputs/ImageInput';
import RangeInput from '../inputs/RangeInput';
import { Control, Row } from './Control';

import BLANK_IMAGE from '../../../images/data/blankGif.json';

export default class ImageControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
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

    onLinkClick() {
        this.onChange('fixed', !this.state.fixed);
    }

    render() {
        let { active, stageWidth, stageHeight } = this.props,
            state = this.state,
            image = this.image,
            readOnly = !(image && image.src && image.src !== BLANK_IMAGE),
            width = readOnly ? 0 : image.naturalWidth,
            height = readOnly ? 0 : image.naturalHeight,
            xMax = readOnly ? 0 : (width > stageWidth) ? width : stageWidth,
            yMax = readOnly ? 0 : (height > stageHeight) ? height : stageHeight,
            linkClasses = {
                'icon-link': true,
                'input-link': true,
                'input-link-on': state.fixed
            },
            linkIcon = <span key={0} className={classNames(linkClasses)} onClick={this.onLinkClick} />;

        return (
            <Control label="IMAGE" active={active}>
                <Row label="Image">
                    <ImageInput
                        name="src"
                        ref={el => this.imageInput = el}
                        src={state.src}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label={['Width', linkIcon]}>
                    <NumberInput
                        name="width"
                        width={40}
                        min={0}
                        max={width*2}
                        value={state.width}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={width*2}
                            value={state.width}
                            readOnly={readOnly}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label={['Height', linkIcon]}>
                    <NumberInput
                        name="height"
                        width={40}
                        min={0}
                        max={height*2}
                        value={state.height}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={height*2}
                            value={state.height}
                            readOnly={readOnly}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="X">
                    <NumberInput
                        name="x"
                        width={40}
                        min={-xMax}
                        max={xMax}
                        value={state.x}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-xMax}
                            max={xMax}
                            value={state.x}
                            readOnly={readOnly}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
                <Row label="Y">
                    <NumberInput
                        name="y"
                        width={40}
                        min={-yMax}
                        max={yMax}
                        value={state.y}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-yMax}
                            max={yMax}
                            value={state.y}
                            readOnly={readOnly}
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
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={state.rotation}
                            readOnly={readOnly}
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
                        value={readOnly ? 0 : state.opacity}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={readOnly ? 0 : state.opacity}
                            readOnly={readOnly}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}