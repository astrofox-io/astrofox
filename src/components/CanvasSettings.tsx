import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProject, { DEFAULT_PROJECT_NAME, updateProjectName } from '@/app/actions/project';
import useStage, { updateCanvas } from '@/app/actions/stage';
import Setting from '@/components/Setting';
import Settings from '@/components/Settings';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

type CanvasSettingsProps = {
  onClose: () => void;
};

type CanvasSettingsState = {
  projectName: string;
  backgroundColor: string;
  baseSize: number;
  aspect: string;
};

interface AspectOption {
  label: string;
  value: string;
  widthRatio: number;
  heightRatio: number;
}

const CANVAS_BASE_SIZES = [480, 720, 1080];

function toEven(value: number) {
  return Math.max(2, Math.round(value / 2) * 2);
}

function getAspectByValue(value: string, options: AspectOption[]) {
  return options.find(aspect => aspect.value === value) || options[2];
}

function getNearestBaseSize(size: number) {
  return CANVAS_BASE_SIZES.reduce((nearest, current) => {
    return Math.abs(current - size) < Math.abs(nearest - size) ? current : nearest;
  }, CANVAS_BASE_SIZES[0]);
}

function getInitialAspect(width: number, height: number, options: AspectOption[]) {
  const ratio = width > 0 && height > 0 ? width / height : 16 / 9;

  return options.reduce(
    (nearest, aspect) => {
      const currentRatio = aspect.widthRatio / aspect.heightRatio;

      return Math.abs(currentRatio - ratio) < Math.abs(nearest.ratio - ratio)
        ? { value: aspect.value, ratio: currentRatio }
        : nearest;
    },
    { value: '16:9', ratio: 16 / 9 },
  ).value;
}

function getCanvasDimensions(baseSize: number, aspectValue: string, options: AspectOption[]) {
  const aspect = getAspectByValue(aspectValue, options);
  const ratio = aspect.widthRatio / aspect.heightRatio;

  if (ratio >= 1) {
    return {
      width: toEven(baseSize * ratio),
      height: toEven(baseSize),
    };
  }

  return {
    width: toEven(baseSize),
    height: toEven(baseSize / ratio),
  };
}

export default function CanvasSettings({ onClose }: CanvasSettingsProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'canvas-settings' });
  const { t: tc } = useTranslation(undefined, { keyPrefix: 'common' });
  const { t: tt } = useTranslation(undefined, { keyPrefix: 'title-bar' });

  const aspectOptions: AspectOption[] = [
    { label: t('square'), value: '1:1', widthRatio: 1, heightRatio: 1 },
    {
      label: t('portrait-916'),
      value: '9:16',
      widthRatio: 9,
      heightRatio: 16,
    },
    {
      label: t('landscape-169'),
      value: '16:9',
      widthRatio: 16,
      heightRatio: 9,
    },
    {
      label: t('mobile-portrait-34'),
      value: '3:4',
      widthRatio: 3,
      heightRatio: 4,
    },
    {
      label: t('mobile-landscape-43'),
      value: '4:3',
      widthRatio: 4,
      heightRatio: 3,
    },
  ];

  const stageConfig = useStage(state => state);
  const projectName = useProject(state => state.projectName);
  const defaultProjectName = tt('default-project-name');
  const [state, setState] = useState({
    projectName:
      projectName && projectName !== DEFAULT_PROJECT_NAME ? projectName : defaultProjectName,
    backgroundColor: stageConfig.backgroundColor,
    baseSize: getNearestBaseSize(Math.min(stageConfig.width, stageConfig.height)),
    aspect: getInitialAspect(stageConfig.width, stageConfig.height, aspectOptions),
  });
  const { projectName: draftProjectName, baseSize, aspect, backgroundColor } = state;
  const { width, height } = getCanvasDimensions(baseSize, aspect, aspectOptions);

  function handleChange(props: Partial<CanvasSettingsState>) {
    setState(current => ({ ...current, ...props }));
  }

  function handleCancel() {
    onClose();
  }

  async function handleSave() {
    updateProjectName(
      draftProjectName.trim() === defaultProjectName ? DEFAULT_PROJECT_NAME : draftProjectName,
    );
    await updateCanvas(width, height, backgroundColor);
    onClose();
  }

  return (
    <div className="flex w-[500px] max-w-full flex-col">
      <div className="max-h-[60vh] overflow-auto">
        <Settings
          columns={['50%', '50%']}
          onChange={handleChange as (props: Record<string, unknown>) => void}
        >
          <Setting
            label={t('project-title')}
            type="text"
            name="projectName"
            value={draftProjectName}
            width={220}
            buffered
          />
          <Setting
            label={t('format')}
            type="select"
            name="aspect"
            value={aspect}
            items={aspectOptions}
            width={180}
            optionsWidth={220}
          />
          <Setting
            label={t('size')}
            type="select"
            name="baseSize"
            value={baseSize}
            items={CANVAS_BASE_SIZES.map(size => ({
              label: `${size}p`,
              value: size,
            }))}
            width={100}
          />
          <div className="mb-4 flex items-center">
            <div style={{ width: '50%' }} />
            <div style={{ width: '50%' }} className="text-sm text-neutral-400">
              {t('output', { width, height })}
            </div>
          </div>
          <Setting
            label={t('background-color')}
            type="color"
            name="backgroundColor"
            value={backgroundColor}
          />
        </Settings>
      </div>
      <div className="shrink-0 bg-neutral-800 px-4 py-3">
        <DialogFooter className="justify-end sm:justify-end">
          <Button variant="secondary" size="sm" onClick={handleCancel}>
            {tc('cancel')}
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            {tc('save')}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
}
