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

    for (let key in displays) {
        if (displays.hasOwnProperty(key) && obj instanceof displays[key]) {
            let name = /(\w+)(Display|Effect)/.exec(key);
            return controlLibrary[name[1] + 'Control'];
        }
    }

    return EmptyControl;
}