'use strict';

var React = require('react');

var Window = require('../../Window.js');
var IO = require('../../IO.js');

var BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

var ImageInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: 'image',
            src: BLANK_IMAGE
        };
    },

    componentDidMount: function() {
        this.refs.image.onload = function() {
            if (this.props.onChange) {
                this.props.onChange('src', this.refs.image.src);
            }
        }.bind(this);
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.src !== 'undefined') {
            this.loadImage(props.src);
        }
    },

    handleDragOver: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleDrop: function(e){
        e.stopPropagation();
        e.preventDefault();

        this.loadImageFile(e.dataTransfer.files[0]);
    },

    handleClick: function(e) {
        e.preventDefault();

        Window.showOpenDialog(function(files) {
            if (files) {
                this.loadImageFile(files[0]);
            }
        }.bind(this));
    },

    handleDelete: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.loadImage(BLANK_IMAGE);
    },

    loadImage: function(src) {
        var image = this.refs.image;
        if (image.src !== src) {
            image.src = src;
        }
    },

    loadImageFile: function(file) {
        if (typeof file === 'string') {
            file = IO.readFileAsBlob(file);
        }

        if (!(/^image/.test(file.type))) return;

        var reader = new FileReader();

        reader.onload = function(fe) {
            var data = fe.target.result;

            this.loadImage(data);
        }.bind(this);

        reader.readAsDataURL(file);
    },

    getImage: function() {
        return this.refs.image;
    },

    getImageRatio: function() {
        var image = this.refs.image;
        return (image.src) ?  image.naturalWidth / image.naturalHeight :  0;
    },

    render: function() {
        var props = this.props,
            hasImage = (props.src && props.src !== BLANK_IMAGE),
            style = { display: (hasImage) ? 'inline-block' : 'none' },
            classes = 'input-image-icon ',
            handleClick = (hasImage) ? this.handleDelete : this.handleClick;

        classes += (hasImage) ? 'icon-circle-with-cross' : 'icon-folder-open-empty';

        return (
            <div
                className="input input-image"
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}
                onClick={handleClick}>
                <img
                    ref="image"
                    className="image"
                    style={style}
                />
                <div className={classes} />
            </div>
        );
    }
});

module.exports = ImageInput;