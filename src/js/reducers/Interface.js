'use strict';

const defaults = {
    showControlDock: true
};

module.exports = function(state = defaults, action) {
    console.log(state, action);

    switch (action.type) {
        case 'MENU_SHOW_CONTROLDOCK':
            return Object.assign({}, state, { showControlDock: action.checked });

        case 'MENU_AUDIO_PLAYER':
            return Object.assign({}, state, { showPlayer: action.checked });
    }

    return state;
};