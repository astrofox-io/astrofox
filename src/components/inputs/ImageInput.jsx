import React, { Component } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import Window from 'core/Window';
import { readFileAsBlob, readAsDataUrl } from 'utils/io';
import folderIcon from 'svg/icons/folder-open-empty.svg';
import closeIcon from 'svg/icons/circle-with-cross.svg';
import blankImage from 'images/data/blank.gif';
import styles from './ImageInput.less';

export default class ImageInput extends Component {
    static defaultProps = {
        name: 'image',
        value: blankImage,
        onChange: () => {},
    }

    onImageLoad = () => {
        const { name, onChange } = this.props;

        this.forceUpdate();

        onChange(name, this.image.src);
    }

    onDragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }

    onDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.loadImageFile(e.dataTransfer.files[0].path);
    }

    onClick = () => {
        Window.showOpenDialog((files) => {
            if (files) {
                this.loadImageFile(files[0]);
            }
        });
    }

    onDelete = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.loadImage(blankImage);
    }

    getImage = () => this.image;

    loadImage = (src) => {
        if (src && this.image.src !== src) {
            this.image.src = src;
        }
    }

    loadImageFile = file => readFileAsBlob(file).then((data) => {
        this.loadImageBlob(data);
    });

    loadImageBlob = (blob) => {
        if (/^image/.test(blob.type)) {
            readAsDataUrl(blob).then((data) => {
                this.loadImage(data);
            });
        }
    }

    render() {
        const { image } = this;
        const { value } = this.props;
        const hasImage = (image && image.src && image.src !== blankImage) || (value && value !== blankImage);

        return (
            <div
                role="presentation"
                className={styles.image}
                onDrop={this.onDrop}
                onDragOver={this.onDragOver}
                onClick={hasImage ? this.onDelete : this.onClick}
            >
                <img
                    ref={e => (this.image = e)}
                    className={classNames({
                        [styles.img]: true,
                        [styles.hidden]: !hasImage,
                    })}
                    src={value || blankImage}
                    alt=""
                    onLoad={this.onImageLoad}
                />
                <Icon
                    glyph={hasImage ? closeIcon : folderIcon}
                    className={styles.icon}
                />
            </div>
        );
    }
}
