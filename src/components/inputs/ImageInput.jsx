import React, { PureComponent, Fragment } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import { raiseError } from 'app/global';
import { showOpenDialog } from 'utils/window';
import { readFileAsBlob, readAsDataUrl } from 'utils/io';
import folderIcon from 'svg/icons/folder-open.svg';
import closeIcon from 'svg/icons/times.svg';
import blankImage from 'images/data/blank.gif';
import styles from './ImageInput.less';

export default class ImageInput extends PureComponent {
    static defaultProps = {
        name: 'image',
        value: blankImage,
        onChange: () => {},
    }

    handleImageLoad = () => {
        const { name, src, onChange } = this.props;

        this.forceUpdate();

        if (src !== this.image.src) {
            onChange(name, this.image.src);
        }
    }

    handleDragOver = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }

    handleDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.loadImageFile(e.dataTransfer.files[0].path);
    }

    handleClick = () => {
        showOpenDialog((files) => {
            if (files) {
                this.loadImageFile(files[0]);
            }
        });
    }

    handleDelete = (e) => {
        e.stopPropagation();
        e.preventDefault();

        this.loadImageSrc(blankImage);
    }

    getImage = () => this.image;

    loadImageSrc = (src) => {
        if (src && this.image.src !== src) {
            this.image.src = src;
        }
    }

    loadImageFile = file => readFileAsBlob(file)
        .then((data) => {
            this.loadImageBlob(data);
        })
        .catch((err) => {
            raiseError(err.message);
        });

    loadImageBlob = (blob) => {
        if (/^image/.test(blob.type)) {
            readAsDataUrl(blob)
                .then((data) => {
                    this.loadImageSrc(data);
                });
        }
        else {
            throw new Error('Invalid image file.');
        }
    }

    render() {
        const { image } = this;
        const { value } = this.props;
        const hasImage = (image && image.src && image.src !== blankImage) || (value && value !== blankImage);

        return (
            <Fragment>
                <div
                    role="presentation"
                    className={styles.image}
                    onDrop={this.handleDrop}
                    onDragOver={this.handleDragOver}
                    onClick={this.handleClick}
                >
                    <img
                        ref={e => (this.image = e)}
                        className={classNames({
                            [styles.img]: true,
                            [styles.hidden]: !hasImage,
                        })}
                        src={value || blankImage}
                        alt=""
                        onLoad={this.handleImageLoad}
                    />
                    <Icon
                        className={styles.openIcon}
                        glyph={folderIcon}
                        title="Open File"
                    />
                </div>
                <Icon
                    className={classNames({
                        [styles.closeIcon]: true,
                        [styles.hidden]: !hasImage,
                    })}
                    glyph={closeIcon}
                    title="Remove Image"
                    onClick={this.handleDelete}
                />
            </Fragment>
        );
    }
}
