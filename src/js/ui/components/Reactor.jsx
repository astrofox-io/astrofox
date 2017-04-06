import React from 'react';

import UIComponent from '../UIComponent';
import Window from '../../core/Window';
import { events } from '../../core/Global';

export default class Reactor extends UIComponent {
    constructor(props, context) {
        super(props);

        this.app = context.app;
    }
}

Reactor.contextTypes = {
    app: React.PropTypes.object
};