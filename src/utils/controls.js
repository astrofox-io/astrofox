/* eslint-disable import/prefer-default-export */
import * as displayLibrary from 'lib/displays';
import * as effectsLibrary from 'lib/effects';
import * as controlLibrary from 'lib/controls';

import SceneControl from 'components/controls/SceneControl';
import EmptyControl from 'components/controls/EmptyControl';

const displays = { ...displayLibrary, ...effectsLibrary };

export function getControlComponent(display) {
    if (display.constructor.className === 'Scene') {
        return SceneControl;
    }

    let control = null;

    Object.keys(displays).forEach((key) => {
        if (!control && displays[key] && display instanceof displays[key]) {
            const name = /(\w+)(Display|Effect)/.exec(key);
            control = controlLibrary[`${name[1]}Control`];
        }
    });

    return control || EmptyControl;
}
