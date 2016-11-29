'use strict';

const React = require('react');
const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');

class About extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            checking: false
        };
    }

    onUpdateCheck() {
        Application.checkForUpdates();
    }

    render() {
        return (
            <div className="about">
                <h1>AstroFox version 1.0</h1>
                <div className="button" onClick={this.onUpdateCheck}>{'Check For Updates'}</div>
            </div>
        );
    }
}

module.exports = About;