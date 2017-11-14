import React from 'react';
import classNames from 'classnames';

import Window from 'core/Window';
import Icon from 'components/interface/Icon';
import { readFileAsBlob, readAsDataUrl } from 'util/io';

import folderIcon from 'svg/icons/folder-open-empty.svg';
import closeIcon from 'svg/icons/circle-with-cross.svg';

import BLANK_IMAGE from 'images/data/blank.gif';

export default class ImageInput extends React.Component {
    constructor(props) {
        super(props);
    }

    onImageLoad = () => {
        const { name, onChange } = this.props;

        this.forceUpdate();

        if (onChange) {
            onChange(name, this.image.src);
        }
    };

    onDragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
    };

    onDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.loadImageFile(e.dataTransfer.files[0]);
    };

    onClick = (e) => {
        e.preventDefault();

        Window.showOpenDialog(files => {
            if (files) {
                this.loadImageFile(files[0]);
            }
        });
    };

    onDelete = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.loadImage(BLANK_IMAGE);
    };

    loadImage = (src) => {
        if (src && this.image.src !== src) {
            this.image.src = src;
        }
    };

    loadImageFile = (file) => {
        if (file instanceof File) {
            file = file.path;
        }

        if (typeof file === 'string') {
            return readFileAsBlob(file).then(data => {
                this.loadImageBlob(data);
            });
        }
    };

    loadImageBlob = (blob) => {
        if (/^image/.test(blob.type)) {
            readAsDataUrl(blob).then(data => {
                this.loadImage(data);
            });
        }
    };

    getImage = () => {
        return this.image;
    };

    render() {
        let { image } = this,
            { value } = this.props,
            hasImage = (image && image.src && image.src !== BLANK_IMAGE) || (value && value !== BLANK_IMAGE),
            icon = hasImage ? closeIcon : folderIcon,
            onClick = (hasImage) ? this.onDelete : this.onClick,
            classes = {
                'image': true,
                'display-none': !hasImage
            };

        return (
            <div
                className="input-image"
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}
                onClick={onClick}>
                <img
                    ref={e => this.image = e}
                    className={classNames(classes)}
                    src={value || BLANK_IMAGE}
                    onLoad={this.onImageLoad}
                />
                <Icon glyph={icon} className="input-image-icon" />
            </div>
        );
    }
}

ImageInput.defaultProps = {
    name: 'image',
    value: BLANK_IMAGE
};