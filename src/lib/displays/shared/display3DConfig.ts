/**
 * Shared default properties and controls for displays that own a 3D camera
 * (rendered through Display3DLayer): camera orbit, lighting rig, and optional
 * depth of field. Spread these into a display's `defaultProperties` and
 * `controls`.
 */

import { stageHeight } from '@/lib/utils/controls';

type DisplayLike = { properties: Record<string, unknown> };

const whenLighting = (display: DisplayLike) => !display.properties.lighting;
const whenDepthOfField = (display: DisplayLike) => !display.properties.depthOfField;

export const CAMERA_3D_DEFAULTS = {
  // Distance 0 = automatic (fit the stage height at the camera FOV).
  cameraDistance: 0,
  cameraAzimuth: (45 * Math.PI) / 180,
  cameraPolar: (30 * Math.PI) / 180,
};

export const camera3DControls = {
  cameraAzimuth: {
    label: 'Azimuth',
    type: 'number',
    min: -Math.PI,
    max: Math.PI,
    step: 0.01,
    withRange: true,
    withReactor: true,
    group: 'Camera',
  },
  cameraPolar: {
    label: 'Polar',
    type: 'number',
    min: -Math.PI / 2 + 0.05,
    max: Math.PI / 2 - 0.05,
    step: 0.01,
    withRange: true,
    withReactor: true,
    group: 'Camera',
  },
  cameraDistance: {
    label: 'Distance',
    type: 'number',
    min: 0,
    max: 5000,
    step: 1,
    withRange: true,
    withReactor: true,
    group: 'Camera',
  },
};

export const LIGHTING_3D_DEFAULTS = {
  lighting: false,
  shadows: true,
  keyLightIntensity: 2.2,
  keyLightDistance: 700,
  lightColor: '#0000FF',
  fillLightIntensity: 0.75,
  fillLightDistance: 700,
  fillLightColor: '#00FF00',
  rimLightIntensity: 0.35,
  rimLightDistance: 700,
  rimLightColor: '#FF0000',
};

const LIGHTING_GROUP = 'Lighting';

const lightControl = (label: string, control: Record<string, unknown>) => ({
  label,
  group: LIGHTING_GROUP,
  hidden: whenLighting,
  ...control,
});

const intensityControl = (label: string) =>
  lightControl(label, {
    type: 'number',
    min: 0,
    max: 4,
    step: 0.01,
    withRange: true,
    withReactor: true,
  });

const distanceControl = (label: string) =>
  lightControl(label, {
    type: 'number',
    min: 50,
    max: 2500,
    step: 1,
    withRange: true,
    withReactor: true,
  });

const colorControl = (label: string) => lightControl(label, { type: 'color' });

export const lighting3DControls = {
  lighting: {
    label: 'Enabled',
    type: 'toggle',
    group: LIGHTING_GROUP,
    groupToggle: true,
  },
  shadows: {
    label: 'Shadows',
    type: 'toggle',
    group: LIGHTING_GROUP,
    hidden: whenLighting,
  },
  keyLightIntensity: intensityControl('Key Intensity'),
  keyLightDistance: distanceControl('Key Distance'),
  lightColor: colorControl('Key Color'),
  fillLightIntensity: intensityControl('Fill Intensity'),
  fillLightDistance: distanceControl('Fill Distance'),
  fillLightColor: colorControl('Fill Color'),
  rimLightIntensity: intensityControl('Rim Intensity'),
  rimLightDistance: distanceControl('Rim Distance'),
  rimLightColor: colorControl('Rim Color'),
};

export const DOF_3D_DEFAULTS = {
  depthOfField: false,
  focusDistance: 0,
  focalLength: 0.02,
  bokehScale: 2,
  dofHeight: 480,
};

export const depthOfField3DControls = {
  depthOfField: {
    label: 'Enabled',
    type: 'toggle',
    group: 'Depth of Field',
    groupToggle: true,
  },
  focusDistance: {
    label: 'Focus Distance',
    type: 'number',
    min: 0,
    max: 1,
    step: 0.001,
    withRange: true,
    withReactor: true,
    group: 'Depth of Field',
    hidden: whenDepthOfField,
  },
  focalLength: {
    label: 'Focal Length',
    type: 'number',
    min: 0,
    max: 1,
    step: 0.001,
    withRange: true,
    withReactor: true,
    group: 'Depth of Field',
    hidden: whenDepthOfField,
  },
  bokehScale: {
    label: 'Bokeh Scale',
    type: 'number',
    min: 0,
    max: 10,
    step: 0.1,
    withRange: true,
    withReactor: true,
    group: 'Depth of Field',
    hidden: whenDepthOfField,
  },
  dofHeight: {
    label: 'Render Height',
    type: 'number',
    min: 120,
    max: stageHeight(),
    step: 1,
    withRange: true,
    group: 'Depth of Field',
    hidden: whenDepthOfField,
  },
};

export const DISPLAY_3D_DEFAULTS = {
  ...CAMERA_3D_DEFAULTS,
  ...LIGHTING_3D_DEFAULTS,
  ...DOF_3D_DEFAULTS,
};

export const display3DControls = {
  ...camera3DControls,
  ...lighting3DControls,
  ...depthOfField3DControls,
};
