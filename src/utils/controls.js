import EmptyControl from 'components/controls/EmptyControl';
import * as controlComponents from 'components/controls';

// Temporary fix
const mapping = {
  'astrofox-display-barspectrum': controlComponents.BarSpectrumControl,
  'astrofox-effect-bloom': controlComponents.BloomControl,
  'astrofox-effect-blur': controlComponents.BlurControl,
  'astrofox-effect-dotscreen': controlComponents.DotScreenControl,
  'astrofox-display-geometry': controlComponents.GeometryControl,
  'astrofox-effect-glow': controlComponents.GlowControl,
  'astrofox-display-image': controlComponents.ImageControl,
  'astrofox-effect-led': controlComponents.LEDControl,
  'astrofox-effect-image': controlComponents.MirrorControl,
  'astrofox-effect-pixelate': controlComponents.PixelateControl,
  'astrofox-effect-rgbshift': controlComponents.RGBShiftControl,
  'astrofox-display-scene': controlComponents.SceneControl,
  'astrofox-display-soundwave': controlComponents.SoundwaveControl,
  'astrofox-display-text': controlComponents.TextControl,
  'astrofox-effect-wavespectrum': controlComponents.WaveSpectrumControl,
};

export function getControlComponent(display) {
  return mapping[display.constructor.info.name] || EmptyControl;
}
