'use strict';

const React = require('react');
const classNames = require('classnames');

const Window = require('../../core/Window.js');
const IO = require('../../core/IO.js');
const autoBind = require('../../util/autoBind.js');

const BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

class ImageInput extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);
    }

    componentDidMount() {
        this.refs.image.onload = () => {
            this.props.onChange('src', this.refs.image.src);
        };
    }

    componentWillReceiveProps(props) {
        if (typeof props.src !== 'undefined') {
            this.loadImage(props.src);
        }
    }

    onDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    onDrop(e){
        e.stopPropagation();
        e.preventDefault();

        this.loadImageFile(e.dataTransfer.files[0]);
    }

    onClick(e) {
        e.preventDefault();

        Window.showOpenDialog(files => {
            if (files) {
                this.loadImageFile(files[0]);
            }
        });
    }

    onDelete(e) {
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

        reader.onload = (e) => {
            this.loadImage(e.target.result);
        };

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
            classes = classNames({
                'input-image-icon': true,
                'icon-circle-with-cross': hasImage,
                'icon-folder-open-empty': !hasImage
            }),
            onClick = (hasImage) ? this.onDelete : this.onClick;

        return (
            <div
                className="input input-image"
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}
                onClick={onClick}>
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
    src: BLANK_IMAGE,
    onChange: () => {}
};

module.exports = ImageInput;