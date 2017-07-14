import React from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import Panel from '../layout/Panel';
import { events } from '../../core/Global';
import Spectrum from '../audio/Spectrum';

export default class Reactor extends UIComponent {
    constructor(props, context) {
        super(props);

        this.app = context.app;
    }

    render() {
        let classes = {
            'reactor': true,
            'display-none': false //!this.props.visible
        };

        return (
            <Panel title="REACTOR" height="auto">
                <div className={classNames(classes)}>
                    REACTOR
                </div>
            </Panel>
        );
    }
}

Reactor.contextTypes = {
    app: propTypes.object
};