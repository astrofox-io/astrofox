'use strict';

const React = require('react');
const Window = require('../../Window.js');
const IO = require('../../IO.js');
const autoBind = require('../../util/autoBind.js');

const BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

class ImageInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.refs.image.onload = function() {
            if (this.props.onChange) {
                this.props.onChange('src', this.refs.image.src);
            }
        }.bind(this);
    }

    componentWillReceiveProps(props) {
        if (typeof props.src !== 'undefined') {
            this.loadImage(props.src);
        }
    }

    handleDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    handleDrop(e){
        e.stopPropagation();
        e.preventDefault();

        this.loadImageFile(e.dataTransfer.files[0]);
    }

    handleClick(e) {
        e.preventDefault();

        Window.showOpenDialog(function(files) {
            if (files) {
                this.loadImageFile(files[0]);
            }
        }.bind(this));
    }

    handleDelete(e) {
        e.stopPropagation();
        e.preventDefault();

        this.loadImage(BLANK_IMAGE);
    }

    loadImage(src) {
        let image = this.refs.image;
        if (image.src !== src) {
            image.src = src;
        }
    }

    loadImageFile(file) {
        if (typeof file === 'string') {
            file = IO.readFileAsBlob(file);
        }

        if (!(/^image/.test(file.type))) return;

        let reader = new FileReader();

        reader.onload = function(fe) {
            let data = fe.target.result;

            this.loadImage(data);
        }.bind(this);

        reader.readAsDataURL(file);
    }

    getImage() {
        return this.refs.image;
    }

    getImageRatio() {
        let image = this.refs.image;
        return (image.src) ?  image.naturalWidth / image.naturalHeight :  0;
    }

    render() {
        let props = this.props,
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
}

ImageInput.defaultProps = {
    name: 'image',
    src: BLANK_IMAGE
};

module.exports = ImageInput;