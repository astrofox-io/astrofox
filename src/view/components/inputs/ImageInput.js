import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import Spinner from 'components/interface/Spinner';
import useCombinedRefs from 'components/hooks/useCombinedRefs';
import { raiseError } from 'actions/errors';
import { showOpenDialog } from 'utils/window';
import { readFileAsBlob, readAsDataUrl } from 'utils/io';
import { ignoreEvents } from 'utils/react';
import { FolderOpen, Times } from 'view/icons';
import { BLANK_IMAGE } from 'view/constants';
import styles from './ImageInput.less';

export default function ImageInput({ name, value, forwardRef, onChange }) {
  const dispatch = useDispatch();
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
      const blob = await readFileAsBlob(file);

      if (!/^image/.test(blob.type)) {
        throw new Error('Invalid image file.');
      }

      const data = await readAsDataUrl(blob);
      return loadImageSrc(data);
    } catch (error) {
      setLoading(false);
      dispatch(raiseError('Invalid image file.', error));
    }
  }

  async function handleDrop(e) {
    e.preventDefault();

    await loadImageFile(e.dataTransfer.files[0].path);
    setLoading(false);
  }

  async function handleClick() {
    const { filePaths, canceled } = await showOpenDialog();

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
          className={classNames({
            [styles.img]: true,
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
