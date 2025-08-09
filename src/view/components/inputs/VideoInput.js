import React, { useRef } from 'react';
import classNames from 'classnames';
import Icon from 'components/interface/Icon';
import { raiseError } from 'actions/error';
import { ignoreEvents } from 'utils/react';
import { api } from 'view/global';
import { FolderOpen, Times } from 'view/icons';
import { BLANK_IMAGE } from 'view/constants';
import styles from './ImageInput.less';

export default function VideoInput({ name, value, onChange }) {
  const video = useRef();
  const hasVideo = value !== BLANK_IMAGE;

  function handleVideoLoad() {
    onChange(name, video.current);
  }

  function loadVideoSrc(src) {
    if (video.current.src !== src) {
      video.current.src = src;
    }
  }

  async function loadVideoFile(file) {
    try {
      const dataUrl = await api.readVideoFile(file);

      return loadVideoSrc(dataUrl);
    } catch (error) {
      raiseError('Invalid video file.', error);
    }
  }

  async function handleDrop(e) {
    e.preventDefault();

    await loadVideoFile(e.dataTransfer.files[0].path);
  }

  async function handleClick() {
    const { filePaths, canceled } = await api.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Videos', extensions: ['mp4', 'webm', 'ogv'] },
        ],
    });

    if (!canceled) {
      await loadVideoFile(filePaths[0]);
    }
  }

  function handleDelete() {
    loadVideoSrc(BLANK_IMAGE);
  }

  return (
    <>
      <div
        className={styles.image}
        onDrop={handleDrop}
        onDragOver={ignoreEvents}
        onClick={handleClick}
      >
        <video
          ref={video}
          className={classNames(styles.img, {
            [styles.hidden]: !hasVideo,
          })}
          src={value}
          alt=""
          onLoadedData={handleVideoLoad}
          autoPlay
          muted
          loop
        />
        <Icon className={styles.openIcon} glyph={FolderOpen} title="Open File" />
      </div>
      {hasVideo && (
        <Icon
          className={classNames({
            [styles.closeIcon]: true,
          })}
          glyph={Times}
          title="Remove Video"
          onClick={handleDelete}
        />
      )}
    </>
  );
}
