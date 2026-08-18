import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  canChooseVideoSaveLocation,
  chooseVideoSaveLocation,
  clearVideoExportSegment,
  type FileHandleLike,
  setVideoExportSegment,
  startVideoRecording,
  VIDEO_EXPORT_FPS_OPTIONS,
  VIDEO_QUALITIES,
  type VideoEncoder,
  type VideoExportFps,
  type VideoQuality,
} from '@/app/actions/app';
import { chooseAudioFile, inspectAudioFile } from '@/app/actions/audio';
import { raiseError } from '@/app/actions/error';
import DualRangeInput from '@/components/DualRangeInput';
import ExportWaveform from '@/components/ExportWaveform';
import SelectInput from '@/components/SelectInput';
import TextInput from '@/components/TextInput';
import TimeInput from '@/components/TimeInput';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { getVideoEncoderConfig } from '@/lib/video/encoders';

type SaveVideoDialogProps = {
  onClose: () => void;
  onCloseAndThen: (afterClose: () => void) => void;
  fileHandle?: FileHandleLike | null;
  filePath?: string;
  defaultPath?: string;
  extension?: string;
  audioSource?: File | null;
  audioFileName?: string;
  audioBuffer?: AudioBuffer | null;
  totalDuration: number;
  startTime?: number;
  endTime?: number;
  includeAudio?: boolean;
  fps?: VideoExportFps;
  encoder?: VideoEncoder;
  encoderOptions?: VideoEncoder[];
  quality?: VideoQuality;
};

const MIN_EXPORT_DURATION = 5;

function replaceFileExtension(filePath: string, extension: string) {
  if (!filePath) {
    return filePath;
  }

  const normalized = extension.startsWith('.') ? extension : `.${extension}`;
  return filePath.replace(/\.[^./\\]+$/, '') + normalized;
}

export default function SaveVideoDialog({
  onClose,
  onCloseAndThen,
  fileHandle: initialFileHandle = null,
  filePath: initialFilePath = '',
  defaultPath: initialDefaultPath = '',
  extension = 'webm',
  audioSource: initialAudioSource = null,
  audioFileName: initialAudioFileName = '',
  audioBuffer: initialAudioBuffer = null,
  totalDuration: initialTotalDuration,
  startTime = 0,
  endTime = initialTotalDuration,
  includeAudio = true,
  fps: initialFps = 30,
  encoder: initialEncoder = 'x264',
  encoderOptions = [],
  quality: initialQuality = 'medium',
}: SaveVideoDialogProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'save-video' });
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });
  const { t: te } = useTranslation(undefined, { keyPrefix: 'errors' });
  const [fileHandle, setFileHandle] = useState(initialFileHandle);
  const [filePath, setFilePath] = useState(initialFilePath);
  const [audioSource, setAudioSource] = useState<File | null>(initialAudioSource);
  const [audioFileName, setAudioFileName] = useState(initialAudioFileName);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(initialAudioBuffer);
  const [totalDuration, setTotalDuration] = useState(initialTotalDuration);
  const [selectedStartTime, setSelectedStartTime] = useState(startTime);
  const [selectedEndTime, setSelectedEndTime] = useState(endTime);
  const [shouldIncludeAudio, setShouldIncludeAudio] = useState(includeAudio);
  const [fps, setFps] = useState<VideoExportFps>(initialFps);
  const [encoder, setEncoder] = useState<VideoEncoder>(initialEncoder);
  const [quality, setQuality] = useState<VideoQuality>(initialQuality);
  const canChooseEncoder = encoderOptions.length > 0;
  const activeExtension = canChooseEncoder
    ? getVideoEncoderConfig(encoder).video.extension
    : extension;
  const defaultPath = replaceFileExtension(initialDefaultPath, activeExtension);
  const [validationMessage, setValidationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChoosingLocation, setIsChoosingLocation] = useState(false);
  const [isChoosingAudio, setIsChoosingAudio] = useState(false);
  const keepSegmentOverlayRef = useRef(false);
  const hasSelectedAudio = Boolean(audioFileName);
  // Browsers without File System Access (Firefox, Safari) prompt for the
  // location when the download starts, so there is nothing to choose up front.
  const [canChooseLocation] = useState(() => canChooseVideoSaveLocation());
  const hasSaveLocation = !canChooseLocation || Boolean(filePath || fileHandle?.name);
  const effectiveMinExportDuration = Math.min(MIN_EXPORT_DURATION, Math.max(totalDuration, 0));
  const hasValidDuration = totalDuration >= MIN_EXPORT_DURATION;
  const hasValidTimeRange =
    selectedEndTime > selectedStartTime &&
    selectedEndTime - selectedStartTime >= MIN_EXPORT_DURATION;
  const canSave = hasSelectedAudio && hasSaveLocation && hasValidDuration && hasValidTimeRange;

  useEffect(() => {
    setVideoExportSegment(selectedStartTime, selectedEndTime, totalDuration);
  }, [selectedEndTime, selectedStartTime, totalDuration]);

  useEffect(() => {
    return () => {
      if (!keepSegmentOverlayRef.current) {
        clearVideoExportSegment();
      }
    };
  }, []);

  async function handleChooseAudio() {
    setIsChoosingAudio(true);

    try {
      const file = await chooseAudioFile();

      if (!file) {
        return;
      }

      const audio = await inspectAudioFile(file);
      setAudioSource(audio.file);
      setAudioFileName(audio.name);
      setAudioBuffer(audio.buffer ?? null);
      setTotalDuration(audio.duration);
      setSelectedStartTime(0);
      setSelectedEndTime(audio.duration);
      setValidationMessage('');
    } catch (error) {
      raiseError(te('choose-audio-file-failed'), error);
    } finally {
      setIsChoosingAudio(false);
    }
  }

  async function handleChooseLocation() {
    setIsChoosingLocation(true);

    try {
      const selection = await chooseVideoSaveLocation(filePath || defaultPath, activeExtension);

      if (!selection.canceled) {
        setFileHandle(selection.fileHandle || null);
        setFilePath(selection.filePath || selection.defaultPath);
        setValidationMessage('');
      }
    } catch (error) {
      raiseError(te('choose-video-save-location-failed'), error);
    } finally {
      setIsChoosingLocation(false);
    }
  }

  function handleEncoderChange(nextEncoder: VideoEncoder) {
    if (nextEncoder === encoder) {
      return;
    }

    setEncoder(nextEncoder);

    // Keep a previously chosen native path but swap its extension. File System
    // Access handles are bound to a specific file, so they must be re-chosen.
    const nextExtension = getVideoEncoderConfig(nextEncoder).video.extension;
    if (fileHandle) {
      setFileHandle(null);
      setFilePath('');
    } else if (filePath) {
      setFilePath(replaceFileExtension(filePath, nextExtension));
    }
  }

  function handleCancel() {
    if (isSubmitting) {
      return;
    }

    keepSegmentOverlayRef.current = false;
    onClose();
  }

  function clampRange(
    nextStart: number,
    nextEnd: number,
    anchor: 'start' | 'end' | 'auto' = 'auto',
  ) {
    if (totalDuration <= 0) {
      return [0, 0] as const;
    }

    if (totalDuration < MIN_EXPORT_DURATION) {
      return [0, totalDuration] as const;
    }

    let clampedStart = Math.max(0, Math.min(totalDuration, nextStart));
    let clampedEnd = Math.max(0, Math.min(totalDuration, nextEnd));

    if (clampedEnd < clampedStart) {
      [clampedStart, clampedEnd] = [clampedEnd, clampedStart];
    }

    if (clampedEnd - clampedStart >= effectiveMinExportDuration) {
      return [clampedStart, clampedEnd] as const;
    }

    if (anchor === 'end') {
      clampedStart = Math.max(0, clampedEnd - effectiveMinExportDuration);
      clampedEnd = Math.min(totalDuration, clampedStart + effectiveMinExportDuration);
      return [clampedStart, clampedEnd] as const;
    }

    clampedEnd = Math.min(totalDuration, clampedStart + effectiveMinExportDuration);
    clampedStart = Math.max(0, clampedEnd - effectiveMinExportDuration);
    return [clampedStart, clampedEnd] as const;
  }

  function handleTimeRangeUpdate(_name: string, nextValue: [number, number]) {
    const startDelta = Math.abs(nextValue[0] - selectedStartTime);
    const endDelta = Math.abs(nextValue[1] - selectedEndTime);
    const anchor = endDelta > startDelta ? 'end' : 'start';
    const [nextStart, nextEnd] = clampRange(nextValue[0], nextValue[1], anchor);
    setSelectedStartTime(nextStart);
    setSelectedEndTime(nextEnd);
  }

  function handleSave() {
    if (!audioFileName) {
      setValidationMessage(t('validation-no-audio'));
      return;
    }

    if (canChooseLocation && !filePath && !fileHandle?.name) {
      setValidationMessage(t('validation-no-location'));
      return;
    }

    if (totalDuration < MIN_EXPORT_DURATION) {
      setValidationMessage(t('validation-audio-short'));
      return;
    }

    if (selectedEndTime <= selectedStartTime) {
      setValidationMessage(t('validation-end-before-start'));
      return;
    }

    if (selectedEndTime - selectedStartTime < MIN_EXPORT_DURATION) {
      setValidationMessage(t('validation-duration-short'));
      return;
    }

    setValidationMessage('');
    setIsSubmitting(true);
    keepSegmentOverlayRef.current = true;

    onCloseAndThen(() => {
      void (async () => {
        try {
          const started = await startVideoRecording({
            fileHandle,
            filePath,
            defaultPath,
            startTime: selectedStartTime,
            endTime: selectedEndTime,
            includeAudio: shouldIncludeAudio,
            audioSource,
            fps,
            encoder,
            quality,
          });

          if (!started) {
            clearVideoExportSegment();
          }
        } catch (error) {
          clearVideoExportSegment();
          raiseError(te('start-video-recording-failed'), error);
        }
      })();
    });
  }

  return (
    <div className="flex w-[560px] max-w-full flex-col">
      <div className="flex max-h-[60vh] flex-col gap-5 overflow-auto px-4 py-4">
        <section className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-medium text-neutral-100">{t('audio-source')}</h3>
            <Button
              variant="secondary"
              size="sm"
              disabled={isSubmitting || isChoosingAudio}
              onClick={handleChooseAudio}
            >
              {isChoosingAudio ? tc('choosing') : tc('choose')}
            </Button>
          </div>
          <TextInput
            name="audioFileName"
            value={audioFileName}
            placeholder={t('no-audio-selected')}
            width="100%"
            readOnly
          />
        </section>

        {canChooseLocation ? (
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-neutral-100">{t('save-location')}</h3>
              <Button
                variant="secondary"
                size="sm"
                disabled={isSubmitting || isChoosingLocation}
                onClick={handleChooseLocation}
              >
                {isChoosingLocation ? tc('choosing') : tc('choose')}
              </Button>
            </div>
            <TextInput
              name="filePath"
              value={filePath}
              placeholder={t('no-video-selected')}
              width="100%"
              readOnly
            />
          </section>
        ) : (
          <section className="space-y-2">
            <h3 className="text-sm font-medium text-neutral-100">{t('save-location')}</h3>
            <p className="text-xs text-neutral-400">{t('save-location-browser-prompt')}</p>
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-100">{t('time-duration')}</h3>
          <div className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="video-export-start-time"
                className="block text-xs uppercase tracking-wide text-neutral-400"
              >
                {t('start')}
              </label>
              <TimeInput
                name="startTime"
                value={selectedStartTime}
                min={0}
                max={Math.max(0, totalDuration - effectiveMinExportDuration)}
                width="100%"
                disabled={totalDuration <= 0}
                onChange={(_name, value) => {
                  const [nextStart, nextEnd] = clampRange(value, selectedEndTime, 'start');
                  setSelectedStartTime(nextStart);
                  setSelectedEndTime(nextEnd);
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="video-export-end-time"
                className="block text-xs uppercase tracking-wide text-neutral-400"
              >
                {t('end')}
              </label>
              <TimeInput
                name="endTime"
                value={selectedEndTime}
                min={effectiveMinExportDuration}
                max={totalDuration}
                width="100%"
                disabled={totalDuration <= 0}
                onChange={(_name, value) => {
                  const [nextStart, nextEnd] = clampRange(selectedStartTime, value, 'end');
                  setSelectedStartTime(nextStart);
                  setSelectedEndTime(nextEnd);
                }}
              />
            </div>
          </div>
          <ExportWaveform
            audioBuffer={audioBuffer}
            startTime={selectedStartTime}
            endTime={selectedEndTime}
            duration={totalDuration}
          />
          <DualRangeInput
            name="timeRange"
            value={[selectedStartTime, selectedEndTime]}
            min={0}
            max={Math.max(totalDuration, 0)}
            step={0.01}
            disabled={!hasSelectedAudio || totalDuration <= 0}
            onChange={handleTimeRangeUpdate}
            onUpdate={handleTimeRangeUpdate}
          />
        </section>

        <section className="space-y-2">
          {canChooseEncoder ? (
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-sm text-neutral-100">{t('encoder')}</span>
              <SelectInput
                name="encoder"
                value={encoder}
                width={100}
                items={encoderOptions.map(option => ({
                  label: getVideoEncoderConfig(option).label,
                  value: option,
                }))}
                onChange={(_name, value) => handleEncoderChange(String(value) as VideoEncoder)}
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-sm text-neutral-100">{t('quality')}</span>
            <SelectInput
              name="quality"
              value={quality}
              width={100}
              items={VIDEO_QUALITIES.map(option => ({
                label: t(`quality-${option}`),
                value: option,
              }))}
              onChange={(_name, value) => setQuality(String(value) as VideoQuality)}
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-1">
            <span className="text-sm text-neutral-100">{t('frame-rate')}</span>
            <SelectInput
              name="fps"
              value={fps}
              width={100}
              items={VIDEO_EXPORT_FPS_OPTIONS.map(option => ({
                label: t('fps', { value: option }),
                value: option,
              }))}
              onChange={(_name, value) => setFps(Number(value) as VideoExportFps)}
            />
          </div>
          <div className="flex items-center justify-between gap-4 py-1">
            <label htmlFor="video-export-include-audio" className="text-sm text-neutral-100">
              {t('include-audio')}
            </label>
            <Switch
              id="video-export-include-audio"
              checked={shouldIncludeAudio}
              disabled={isSubmitting}
              onCheckedChange={setShouldIncludeAudio}
            />
          </div>
        </section>

        {validationMessage ? (
          <div className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {validationMessage}
          </div>
        ) : null}
      </div>
      <div className="shrink-0 bg-neutral-800 px-4 py-3">
        <DialogFooter className="justify-end sm:justify-end">
          <Button variant="secondary" size="sm" disabled={isSubmitting} onClick={handleCancel}>
            {tc('cancel')}
          </Button>
          <Button
            variant="default"
            size="sm"
            disabled={isSubmitting || isChoosingLocation || isChoosingAudio || !canSave}
            onClick={handleSave}
          >
            {isSubmitting ? t('starting') : t('save-video')}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
