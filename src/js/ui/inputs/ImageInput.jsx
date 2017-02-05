import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import Window from '../../core/Window';
import * as IO from '../../util/io';

import BLANK_IMAGE from '../../../images/data/BlankGif.json';

export default class ImageInput extends UIComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.refs.image.onload = () => {
            if (this.props.onChange) {
                this.props.onChange('src', this.refs.image.src);
            }
        };
    }

    componentWillReceiveProps(props) {
        if (props.src !== undefined) {
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
        if (file instanceof File) {
            file = file.path;
        }

        if (typeof file === 'string') {
            return IO.readFileAsBlob(file).then(data => {
                this.loadImageBlob(data);
            });
        }
    }

    loadImageBlob(blob) {
        if (/^image/.test(blob.type)) {
            IO.readAsDataUrl(blob).then(data => {
                this.loadImage(data);
            });
        }
    }

    getImage() {
        return this.refs.image;
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
    onChange: null
};