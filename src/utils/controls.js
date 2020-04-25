import * as displayComponents from 'displays';
import * as effectComponents from 'effects';
import * as controlComponents from 'components/controls';

import SceneControl from 'components/controls/SceneControl';
import EmptyControl from 'components/controls/EmptyControl';

const displays = { ...displayComponents, ...effectComponents };

export function getControlComponent(display) {
  if (display.constructor.className === 'Scene') {
    return SceneControl;
  }

  let control = null;

  Object.keys(displays).forEach(key => {
    if (!control && displays[key] && display instanceof displays[key]) {
      const name = /(\w+)(Display|Effect)/.exec(key);
      control = controlComponents[`${name[1]}Control`];
    }
  });

  return control || EmptyControl;
}
