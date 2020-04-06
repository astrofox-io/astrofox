/* eslint-disable import/prefer-default-export */
import * as displayLibrary from 'displays';
import * as effectsLibrary from 'effects';
import * as controlLibrary from 'components/controls';

import SceneControl from 'components/controls/SceneControl';
import EmptyControl from 'components/controls/EmptyControl';

const displays = { ...displayLibrary, ...effectsLibrary };

export function getControlComponent(display) {
  if (display.constructor.className === 'Scene') {
    return SceneControl;
  }

  let control = null;

  Object.keys(displays).forEach(key => {
    if (!control && displays[key] && display instanceof displays[key]) {
      const name = /(\w+)(Display|Effect)/.exec(key);
      control = controlLibrary[`${name[1]}Control`];
    }
  });

  return control || EmptyControl;
}
