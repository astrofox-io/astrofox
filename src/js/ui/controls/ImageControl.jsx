'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');
const NumberInput = require('../inputs/NumberInput.jsx');
const ImageInput = require('../inputs/ImageInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');

const BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

class ImageControl extends UIComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
        this.shouldUpdate = false;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
            this.shouldUpdate = true;

            this.setState(display.options);
        }

        this.image = this.refs.image.getImage();
    }

    componentDidUpdate() {
        this.shouldUpdate = false;
    }

    shouldComponentUpdate() {
        return this.shouldUpdate;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display,
            state = this.state,
            image = this.refs.image.getImage(),
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
                if (val !== state.src) {
                    obj.width = image.naturalWidth;
                    obj.height = image.naturalHeight;
                    obj.opacity = 1.0;
                }
                // Restore values from state
                else {
                    Object.assign(obj, state);
                }
            }
        }
        else if (name === 'width') {
            if (state.fixed) {
                obj.height = Math.round(val * (1 / ratio)) || 0;
            }
        }
        else if (name === 'height') {
            if (state.fixed) {
                obj.width = Math.round(val * ratio);
            }
        }
        else if (name === 'opacity') {
        }

        this.shouldUpdate = true;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    onLinkClick() {
        this.onChange.bind(this)('fixed', !this.state.fixed);
    }

    render() {
        let state = this.state,
            image = this.image,
            readOnly = !(image && image.src && image.src !== BLANK_IMAGE),
            width = (readOnly) ? 0 : image.naturalWidth,
            height = (readOnly) ? 0 : image.naturalHeight,
            linkClasses = classNames(
                'icon-link input-link',
                {
                    'input-link-on': state.fixed
                }
            );

        return (
            <div className="control">
                <div className="header">IMAGE</div>
                <div className="row">
                    <span className="label">Image</span>
                    <ImageInput
                        name="image"
                        ref="image"
                        src={state.src}
                        onChange={this.onChange}
                    />
                </div>
                <div className="row">
                    <span className="label">
                        Width
                        <span className={linkClasses}
                           onClick={this.onLinkClick}
                        />
                    </span>
                    <NumberInput
                        name="width"
                        size="3"
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
                </div>
                <div className="row">
                    <span className="label">
                        Height
                        <span className={linkClasses}
                           onClick={this.onLinkClick}
                        />
                    </span>
                    <NumberInput
                        name="height"
                        size="3"
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
                </div>
                <div className="row">
                    <span className="label">X</span>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-width*2}
                        max={width*2}
                        value={state.x}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-width*2}
                            max={width*2}
                            value={state.x}
                            readOnly={readOnly}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Y</span>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-height*2}
                        max={height*2}
                        value={state.y}
                        readOnly={readOnly}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-height*2}
                            max={height*2}
                            value={state.y}
                            readOnly={readOnly}
                            onChange={this.onChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Rotation</span>
                    <NumberInput
                        name="rotation"
                        size="3"
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
                </div>
                <div className="row">
                    <span className="label">Opacity</span>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.01}
                        value={state.opacity}
                        readOnly={readOnly}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={state.opacity}
                            readOnly={readOnly}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = ImageControl;