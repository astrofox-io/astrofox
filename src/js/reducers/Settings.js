'use strict';

const defaults = {
    canvasWidth: 854,
    canvasHeight: 480
};

module.exports = function(state = defaults, action) {
    console.log(state, action);

    switch (action.type) {
        case 'SET_CANVAS_SIZE':
            return Object.assign({}, state, { canvsWidth: action.width, canvasHeight: action.height });
    }

    return state;
};