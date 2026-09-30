// @ts-nocheck

import { useThree } from '@react-three/fiber';
import React from 'react';
import { LinearFilter, SRGBColorSpace, VideoTexture } from 'three';
import { BLANK_IMAGE } from '@/app/constants';
import { registerFramePreparer } from '../framePreparation';
import { TexturePlane } from './TexturePlane';
import { videoTimeAt } from './videoTime';

/** While playing live, how far the video may drift from project time before it re-seeks. */
const MAX_LIVE_DRIFT = 0.25;

function hasMedia(src) {
  return !!src && src !== BLANK_IMAGE;
}

function once(target, event) {
  return new Promise(resolve => target.addEventListener(event, resolve, { once: true }));
}

/**
 * Seek to `getTarget()` and wait until that frame can be drawn. The target is
 * read after metadata loads, since looping and clamping need the duration.
 */
async function seekAndWait(video, getTarget) {
  if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
    await once(video, 'loadedmetadata');
  }

  const target = getTarget();

  if (Math.abs(video.currentTime - target) > 1e-3) {
    const seeked = once(video, 'seeked');
    video.currentTime = target;
    await seeked;
  }

  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await once(video, 'loadeddata');
  }
}

/**
 * A video display. The frame shown always comes from project time
 * (`frameData.time`): live it plays along and re-seeks when it drifts; paused,
 * in previews and in exports it seeks to the exact frame, and offline frames
 * wait for the seek before they are captured.
 */
export function VideoDisplayLayer({
  display,
  order,
  frameData,
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
  const invalidate = useThree(state => state.invalidate);

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

  // The latest timing, for callbacks that outlive a render.
  const timing = React.useRef({ startTime, endTime, loop: shouldLoop });
  timing.current = { startTime, endTime, loop: shouldLoop };

  const mediaTimeAt = React.useCallback(
    time => videoTimeAt(time, { ...timing.current, duration: video.duration }),
    [video],
  );

  React.useEffect(() => {
    if (!hasMedia(src)) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      return;
    }

    video.loop = Boolean(shouldLoop && !hasExplicitEndTime);

    if (video.getAttribute('src') !== src) {
      video.src = src;
    }
  }, [video, src, shouldLoop, hasExplicitEndTime]);

  // A seek finishes after the frame that asked for it: upload the new video
  // frame and draw again, so a paused or scrubbed stage shows it.
  React.useEffect(() => {
    const onReady = () => {
      texture.needsUpdate = true;
      invalidate();
    };

    video.addEventListener('seeked', onReady);
    video.addEventListener('loadeddata', onReady);

    return () => {
      video.removeEventListener('seeked', onReady);
      video.removeEventListener('loadeddata', onReady);
    };
  }, [video, texture, invalidate]);

  // Offline frames (export, previews) wait for the exact video frame.
  React.useEffect(() => {
    if (!hasMedia(src)) {
      return;
    }

    return registerFramePreparer(async frame => {
      video.pause();
      await seekAndWait(video, () => mediaTimeAt(frame.time));
      texture.needsUpdate = true;
    });
  }, [video, texture, src, mediaTimeAt]);

  // Follow project time on every frame.
  React.useLayoutEffect(() => {
    if (!hasMedia(src) || !frameData || video.readyState < HTMLMediaElement.HAVE_METADATA) {
      return;
    }

    const target = mediaTimeAt(frameData.time);
    const drift = Math.abs((video.currentTime || 0) - target);

    if (frameData.playing && !frameData.offline) {
      if (drift > MAX_LIVE_DRIFT) {
        video.currentTime = target;
      }

      if (video.paused) {
        video.play()?.catch?.(() => {});
      }
      return;
    }

    if (!video.paused) {
      video.pause();
    }

    // Paused or offline: show the frame for this time (offline frames were
    // already seeked by the preparer).
    if (drift > 0.5 / (frameData.fps || 30)) {
      video.currentTime = target;
    }
  });

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
