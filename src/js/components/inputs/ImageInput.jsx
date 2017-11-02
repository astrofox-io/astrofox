import React from 'react';

import UIComponent from 'components/UIComponent';
import Window from 'core/Window';
import Icon from 'components/interface/Icon';
import * as IO from 'util/io';

import folderIcon from 'svg/icons/folder-open-empty.svg';
import closeIcon from 'svg/icons/circle-with-cross.svg';

import BLANK_IMAGE from 'images/data/blank.gif';

export default class ImageInput extends UIComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.props.src) {
            this.loadImage(this.props.src);
        }
    }

    componentWillReceiveProps(props) {
        if (props.src !== undefined) {
            this.loadImage(props.src);
        }
    }

    onChange() {
        const { name, onChange } = this.props;

        if (onChange) {
            onChange(name, this.image.src);
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
        if (this.image.src !== src) {
            this.image.src = src;
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
        return this.image;
    }

    render() {
        let { src } = this.props,
            hasImage = (src && src !== BLANK_IMAGE),
            style = { display: (hasImage) ? 'inline-block' : 'none' },
            icon = hasImage ? closeIcon : folderIcon,
            onClick = (hasImage) ? this.onDelete : this.onClick;

        return (
            <div
                className="input input-image"
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}
                onClick={onClick}>
                <img
                    ref={image => this.image = image}
                    className="image"
                    style={style}
                    onLoad={this.onChange}
                />
                <div className="input-image-icon">
                    <Icon glyph={icon} />
                </div>
            </div>
        );
    }
}

ImageInput.defaultProps = {
    name: 'image',
    src: BLANK_IMAGE,
    onChange: null
};