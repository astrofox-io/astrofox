import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import Spinner from 'components/interface/Spinner';
import useCombinedRefs from 'hooks/useCombinedRefs';
import { raiseError } from 'actions/error';
import { ignoreEvents } from 'utils/react';
import { api } from 'view/global';
import { FolderOpen, Times } from 'view/icons';
import { BLANK_IMAGE } from 'view/constants';
import styles from './ImageInput.less';

export default function ImageInput({ name, value, forwardRef, onChange }) {
  const [loading, setLoading] = useState(true);
  const image = useRef();
  const combinedRef = useCombinedRefs(forwardRef, image);
  const hasImage = image.current && value !== BLANK_IMAGE;

  function handleImageLoad() {
    setLoading(false);
    onChange(name, image.current.src);
  }

  function loadImageSrc(src) {
    if (image.current.src !== src) {
      image.current.src = src;
    }
  }

  async function loadImageFile(file) {
    try {
      setLoading(true);

      const dataUrl = await api.readImageFile(file);

      return loadImageSrc(dataUrl);
    } catch (error) {
      raiseError('Invalid image file.', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDrop(e) {
    e.preventDefault();

    await loadImageFile(e.dataTransfer.files[0].path);
    setLoading(false);
  }

  async function handleClick() {
    const { filePaths, canceled } = await api.showOpenDialog();

    if (!canceled) {
      await loadImageFile(filePaths[0]);
      setLoading(false);
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
          ref={combinedRef}
          className={classNames(styles.img, {
            [styles.hidden]: !hasImage,
          })}
          src={value}
          alt=""
          onLoad={handleImageLoad}
        />
        {loading && <Spinner size={20} />}
        <Icon className={styles.openIcon} glyph={FolderOpen} title="Open File" />
      </div>
      {hasImage && (
        <Icon
          className={classNames({
            [styles.closeIcon]: true,
            [styles.hidden]: !hasImage,
          })}
          glyph={Times}
          title="Remove Image"
          onClick={handleDelete}
        />
      )}
    </>
  );
}
