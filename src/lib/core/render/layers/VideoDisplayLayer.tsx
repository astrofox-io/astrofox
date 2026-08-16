// @ts-nocheck

import React from 'react';
import { LinearFilter, SRGBColorSpace, VideoTexture } from 'three';
import { BLANK_IMAGE } from '@/app/constants';
import { player } from '@/app/global';
import { TexturePlane } from './TexturePlane';

function getClipStart(startTime) {
  return Math.max(0, Number(startTime) || 0);
}

function getClipEnd(video, clipStart, endTime) {
  const explicitEnd = Number(endTime) || 0;

  if (explicitEnd > clipStart) {
    return explicitEnd;
  }

  const duration = Number(video.duration) || 0;
  return duration > clipStart ? duration : 0;
}

export function VideoDisplayLayer({
  display,
  order,
  sceneOpacity,
  sceneBlendMode,
  sceneMask,
  sceneInverse,
  sceneMaskCombine,
}) {
  const { properties = {} } = display;
  const {
    src,
    x = 0,
    y = 0,
    rotation = 0,
    zoom = 1,
    opacity = 1,
    width = 0,
    height = 0,
    loop = true,
    startTime = 0,
    endTime = 0,
  } = properties;
  const shouldLoop = loop !== false;
  const hasExplicitEndTime = (Number(endTime) || 0) > 0;

  const video = React.useMemo(() => {
    const element = document.createElement('video');
    element.muted = true;
    element.playsInline = true;
    element.preload = 'auto';
    element.crossOrigin = 'anonymous';

    return element;
  }, []);

  const texture = React.useMemo(() => {
    const nextTexture = new VideoTexture(video);
    nextTexture.minFilter = LinearFilter;
    nextTexture.magFilter = LinearFilter;
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.generateMipmaps = false;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [video]);

  const syncVideoTime = React.useCallback(
    (audioTime = 0) => {
      if (!src || src === BLANK_IMAGE) {
        return;
      }

      const clipStart = getClipStart(startTime);
      const clipEnd = getClipEnd(video, clipStart, endTime);
      const nextAudioTime = Math.max(0, Number(audioTime) || 0);
      let nextTime = clipStart + nextAudioTime;

      if (shouldLoop && clipEnd > clipStart) {
        const clipDuration = clipEnd - clipStart;
        nextTime = clipStart + (nextAudioTime % clipDuration);
      } else if (clipEnd > clipStart) {
        nextTime = Math.min(nextTime, clipEnd);
      }

      const duration = Number(video.duration) || 0;
      if (duration > 0) {
        nextTime = Math.min(nextTime, duration);
      }

      if (!Number.isFinite(nextTime)) {
        nextTime = clipStart;
      }

      if (Math.abs((video.currentTime || 0) - nextTime) > 0.05) {
        try {
          video.currentTime = nextTime;
        } catch {
          // Ignore failed seeks before metadata is ready.
        }
      }
    },
    [video, src, startTime, endTime, shouldLoop],
  );

  const resumeVideo = React.useCallback(() => {
    if (!src || src === BLANK_IMAGE || !player.isPlaying()) {
      return;
    }

    const playback = video.play();
    if (playback?.catch) {
      playback.catch(() => {});
    }
  }, [video, src]);

  React.useEffect(() => {
    if (!src || src === BLANK_IMAGE) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      return;
    }

    video.loop = Boolean(shouldLoop && !hasExplicitEndTime);

    if (video.getAttribute('src') !== src) {
      video.src = src;
    }

    const onTimeUpdate = () => {
      const clipStart = getClipStart(startTime);
      const clipEnd = getClipEnd(video, clipStart, endTime);

      if (clipEnd <= clipStart || video.currentTime < clipEnd) {
        return;
      }

      if (shouldLoop) {
        video.currentTime = clipStart;
        resumeVideo();
      } else {
        video.pause();
        video.currentTime = clipEnd;
      }
    };

    const onLoadedMetadata = () => {
      syncVideoTime(player.isPlaying() ? player.getCurrentTime() : 0);

      if (player.isPlaying()) {
        resumeVideo();
      } else {
        video.pause();
      }
    };

    const onEnded = () => {
      if (!shouldLoop) {
        return;
      }

      syncVideoTime(player.getCurrentTime());
      resumeVideo();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);

    if (video.readyState >= 1) {
      onLoadedMetadata();
    }

    return () => {
      video.pause();
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
    };
  }, [video, src, shouldLoop, hasExplicitEndTime, startTime, endTime, syncVideoTime, resumeVideo]);

  React.useEffect(() => {
    if (!src || src === BLANK_IMAGE) {
      return;
    }

    const handlePlay = () => {
      syncVideoTime(player.getCurrentTime());
      resumeVideo();
    };

    const handlePause = () => {
      video.pause();
      syncVideoTime(player.getCurrentTime());
    };

    const handleSeek = () => {
      syncVideoTime(player.getCurrentTime());

      if (player.isPlaying()) {
        resumeVideo();
      }
    };

    const handleStop = () => {
      video.pause();
      syncVideoTime(0);
    };

    player.on('play', handlePlay);
    player.on('pause', handlePause);
    player.on('seek', handleSeek);
    player.on('stop', handleStop);

    return () => {
      player.off('play', handlePlay);
      player.off('pause', handlePause);
      player.off('seek', handleSeek);
      player.off('stop', handleStop);
    };
  }, [video, src, syncVideoTime, resumeVideo]);

  React.useEffect(() => {
    return () => {
      texture.dispose();
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [texture, video]);

  if (!src || src === BLANK_IMAGE) {
    return null;
  }

  const videoWidth = video.videoWidth || width || 1;
  const videoHeight = video.videoHeight || height || 1;
  const planeWidth = width || videoWidth;
  const planeHeight = height || videoHeight;

  return (
    <TexturePlane
      texture={texture}
      width={planeWidth}
      height={planeHeight}
      x={x}
      y={y}
      originX={planeWidth / 2}
      originY={planeHeight / 2}
      rotation={rotation}
      zoom={zoom}
      opacity={opacity}
      sceneOpacity={sceneOpacity}
      sceneBlendMode={sceneBlendMode}
      sceneMask={sceneMask}
      sceneInverse={sceneInverse}
      sceneMaskCombine={sceneMaskCombine}
      renderOrder={order}
    />
  );
}
