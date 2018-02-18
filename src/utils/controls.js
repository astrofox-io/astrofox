import * as displayLibrary from 'lib/displays';
import * as effectsLibrary from 'lib/effects';
import * as controlLibrary from 'lib/controls';

import SceneControl from 'components/controls/SceneControl';
import EmptyControl from 'components/controls/EmptyControl';

const displays = Object.assign({}, displayLibrary, effectsLibrary);

export function getControlComponent(obj) {
    if (obj.constructor.className === 'Scene') {
        return SceneControl;
    }

    let control;

    Object.keys(displays).forEach((key) => {
        if (!control && Object.prototype.hasOwnProperty.call(displays, key) && obj instanceof displays[key]) {
            const name = /(\w+)(Display|Effect)/.exec(key);
            control = controlLibrary[`${name[1]}Control`];
        }
    });

    return control || EmptyControl;
}

export default {
    getControlComponent,
};
