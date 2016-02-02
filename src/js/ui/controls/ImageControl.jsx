'use strict';

var React = require('react');
var Application = require('../../core/Application.js');

var NumberInput = require('../inputs/NumberInput.jsx');
var ImageInput = require('../inputs/ImageInput.jsx');
var RangeInput = require('../inputs/RangeInput.jsx');

var BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

var defaults = {
    src: '',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fixed: true,
    rotation: 0,
    opacity: 0
};

var ImageControl = React.createClass({
    getInitialState: function() {
        return defaults;
    },

    componentWillMount: function() {
        this.image = new Image();
        this.shouldUpdate = false;
    },

    componentDidMount: function() {
        var display = this.props.display;

        if (display.initialized) {
            display.render();

            this.shouldUpdate = true;
            this.image.src = display.options.src;
            this.setState(display.options);
        }
        else {
            display.update(this.state);
        }
    },

    componentDidUpdate: function() {
        this.shouldUpdate = false;
    },

    shouldComponentUpdate: function() {
        return this.shouldUpdate;
    },

    handleChange: function(name, val) {
        var obj = {},
            state = this.state,
            image = this.image,
            ratio = (image.src) ? image.naturalWidth / image.naturalHeight : 0,
            render = false;

        obj[name] = val;

        if (name === 'src') {
            obj.src = image.src = val;

            // Reset values
            obj.width = 0;
            obj.height = 0;
            obj.x = 0;
            obj.y = 0;
            obj.rotation = 0;
            obj.opacity = 0;

            if (val !== BLANK_IMAGE) {
                obj.opacity = 1.0;
                obj.width = image.naturalWidth;
                obj.height = image.naturalHeight;
            }

            render = true;
        }
        else if (name === 'width' && state.src) {
            if (state.fixed) {
                obj.height = Math.round(val * (1 / ratio));
            }
            render = true;
        }
        else if (name === 'height' && state.src) {
            if (state.fixed) {
                obj.width = Math.round(val * ratio);
            }
            render = true;
        }
        else if (name === 'opacity') {
            render = true;
        }

        this.shouldUpdate = true;

        this.setState(obj, function() {
            var display = this.props.display;

            display.update(obj);

            if (render) {
                display.render();
            }
        }.bind(this));
    },

    handleLinkClick: function() {
        this.handleChange('fixed', !this.state.fixed);
    },

    render: function() {
        var state = this.state,
            img = this.image,
            readOnly = !(state.src && state.src !== BLANK_IMAGE),
            imageWidth = (readOnly) ? 0 : img.width,
            imageHeight = (readOnly) ? 0 : img.height,
            maxSize = ((!readOnly) ? ((img.height > img.width) ? img.height : img.width) : 0) * 2,
            linkClasses = 'icon-link input-link';

        if (state.fixed) linkClasses += ' input-link-on';

        return (
            <div className="control">
                <div className="header">IMAGE</div>
                <div className="row">
                    <label className="label">Image</label>
                    <ImageInput
                        name="image"
                        ref="image"
                        src={state.src}
                        onChange={this.handleChange}
                    />
                </div>
                <div className="row">
                    <label className="label">
                        Width
                        <i
                            className={linkClasses}
                            onClick={this.handleLinkClick}
                        />
                    </label>
                    <NumberInput
                        name="width"
                        size="3"
                        min={0}
                        max={imageWidth*2}
                        value={state.width}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="width"
                            min={0}
                            max={imageWidth*2}
                            value={state.width}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">
                        Height
                        <i
                            className={linkClasses}
                            onClick={this.handleLinkClick}
                        />
                    </label>
                    <NumberInput
                        name="height"
                        size="3"
                        min={0}
                        max={imageHeight*2}
                        value={state.height}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="height"
                            min={0}
                            max={imageHeight*2}
                            value={state.height}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        min={-maxSize}
                        max={maxSize}
                        value={state.x}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={-maxSize}
                            max={maxSize}
                            value={state.x}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        min={-maxSize}
                        max={maxSize}
                        value={state.y}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={-maxSize}
                            max={maxSize}
                            value={state.y}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Rotation</label>
                    <NumberInput
                        name="rotation"
                        size="3"
                        min={0}
                        max={360}
                        value={state.rotation}
                        readOnly={readOnly}
                        onChange={this.handleChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="rotation"
                            min={0}
                            max={360}
                            value={state.rotation}
                            readOnly={readOnly}
                            onChange={this.handleChange}
                        />
                    </div>
                </div>
                <div className="row">
                    <label className="label">Opacity</label>
                    <NumberInput
                        name="opacity"
                        size="3"
                        min={0}
                        max={1.0}
                        step={0.1}
                        value={state.opacity}
                        readOnly={readOnly}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="opacity"
                            min={0}
                            max={1.0}
                            step={0.1}
                            value={state.opacity}
                            readOnly={readOnly}
                            onChange={this.handleChange} />
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ImageControl;