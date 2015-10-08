'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

var ImageInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: 'image',
            src: BLANK_IMAGE
        };
    },

    componentDidMount: function() {
        this.image = ReactDOM.findDOMNode(this.refs.image);
        this.file = ReactDOM.findDOMNode(this.refs.file);
        this.form = ReactDOM.findDOMNode(this.refs.form);
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.src !== 'undefined') {
            this.image.src = props.src;
        }
    },

    handleDragOver: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleDrop: function(e){
        e.stopPropagation();
        e.preventDefault();

        this.loadFile(e.dataTransfer.files[0]);
    },

    handleClick: function(e) {
        e.preventDefault();

        this.form.reset();
        this.file.click();
    },

    handleDelete: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.loadImage(BLANK_IMAGE);
    },

    handleFileOpen: function(e) {
        e.preventDefault();

        if (e.target.files.length > 0) {
            this.loadFile(e.target.files[0]);
        }
    },

    loadImage: function(src) {
        this.image.src = src;

        if (this.props.onChange) {
            this.props.onChange('src', src);
        }
    },

    loadFile: function(file) {
        if (!(/^image/.test(file.type))) return;

        var reader = new FileReader();

        reader.onload = function(fe) {
            var data = fe.target.result;

            this.loadImage(data);
        }.bind(this);

        reader.readAsDataURL(file);
    },

    getImage: function() {
        return this.image;
    },

    getImageRatio: function() {
        var image = this.image;
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
            <div>
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
                <form
                    ref="form"
                    className="input-file">
                    <input
                        ref="file"
                        type="file"
                        onChange={this.handleFileOpen}
                    />
                </form>
            </div>
        );
    }
});

module.exports = ImageInput;