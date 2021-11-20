import React, { useRef } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import { raiseError } from 'actions/error';
import { ignoreEvents } from 'utils/react';
import { api } from 'view/global';
import { FolderOpen, Times } from 'view/icons';
import { BLANK_IMAGE } from 'view/constants';
import styles from './ImageInput.less';

export default function ImageInput({ name, value, onChange }) {
  const image = useRef();
  const hasImage = value !== BLANK_IMAGE;

  function handleImageLoad() {
    onChange(name, image.current);
  }

  function loadImageSrc(src) {
    if (image.current.src !== src) {
      image.current.src = src;
    }
  }

  async function loadImageFile(file) {
    try {
      const dataUrl = await api.readImageFile(file);

      return loadImageSrc(dataUrl);
    } catch (error) {
      raiseError('Invalid image file.', error);
    }
  }

  async function handleDrop(e) {
    e.preventDefault();

    await loadImageFile(e.dataTransfer.files[0].path);
  }

  async function handleClick() {
    const { filePaths, canceled } = await api.showOpenDialog();

    if (!canceled) {
      await loadImageFile(filePaths[0]);
    }
  }

  function handleDelete() {
    loadImageSrc(BLANK_IMAGE);
  }

  return (
    <>
      <div
        className={styles.image}
        onDrop={handleDrop}
        onDragOver={ignoreEvents}
        onClick={handleClick}
      >
        <img
          ref={image}
          className={classNames(styles.img, {
            [styles.hidden]: !hasImage,
          })}
          src={value}
          alt=""
          onLoad={handleImageLoad}
        />
        <Icon className={styles.openIcon} glyph={FolderOpen} title="Open File" />
      </div>
      {hasImage && (
        <Icon
          className={classNames({
            [styles.closeIcon]: true,
          })}
          glyph={Times}
          title="Remove Image"
          onClick={handleDelete}
        />
      )}
    </>
  );
}
