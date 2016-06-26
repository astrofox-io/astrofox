'use strict';

var React = require('react');

var Application = require('../core/Application.js');
var Scene = require('../display/Scene.js');
var DisplayLibrary = require('../lib/DisplayLibrary.js');
var Window = require('../Window.js');

var Header = require('./components/Header.jsx');
var Body = require('./components/Body.jsx');
var Footer = require('./components/Footer.jsx');
var MenuBar = require('./components/MenuBar.jsx');
var MainView = require('./components/MainView.jsx');
var Stage = require('./components/Stage.jsx');
var Player = require('./components/Player.jsx');
var Spectrum = require('./components/Spectrum.jsx');
var Oscilloscope = require('./components/Oscilloscope.jsx');
var Waveform = require('./components/Waveform.jsx');
var Overlay = require('./components/Overlay.jsx');
var ControlDock = require('./components/ControlDock.jsx');
var Preload = require('../ui/components/Preload.jsx');

var ModalWindow = require('../ui/windows/ModalWindow.jsx');
var AboutWindow = require('../ui/windows/AboutWindow.jsx');
var SettingsWindow = require('../ui/windows/SettingsWindow.jsx');

var App = React.createClass({
    getInitialState: function() {
        return {
            filename: '',
            showModal: false,
            modal: null
        };
    },

    componentWillMount: function() {
        // Default setup
        var scene = new Scene();

        Application.stage.addScene(scene);

        scene.addElement(new DisplayLibrary.ImageDisplay());
        scene.addElement(new DisplayLibrary.BarSpectrumDisplay());
        scene.addElement(new DisplayLibrary.TextDisplay());

        // Events
        Application.on('error', function(err) {
            this.showError(err);
        }, this);

        Application.on('show_modal', function(content) {
            this.showModal(content);
        }, this);

        Application.on('hide_modal', function() {
            this.hideModal();
        }, this);

        Application.on('audio_file_loading', function() {
            this.refs.stage.showLoading(true);
        }, this);

        Application.on('audio_file_loaded', function() {
            this.refs.stage.showLoading(false);
        }, this);
    },

    componentDidMount: function() {
        Application.init();
    },

    handleClick: function() {
        this.refs.menubar.setActiveIndex(-1);
    },

    handleDragDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleMouseDown: function(e) {
        Application.emit('mousedown');
    },

    handleMouseUp: function(e) {
        Application.emit('mouseup');
    },

    handleMenuAction: function(action, checked) {
        switch (action) {
            case 'File/New Project':
                break;

            case 'File/Open Project':
                Window.showOpenDialog(function(files) {
                    if (files) {
                        Application.loadProject(files[0]);
                    }
                });
                break;

            case 'File/Save Project':
                Window.showSaveDialog(
                    'project.afx',
                    function(filename) {
                        if (filename) {
                            Application.saveProject(filename);
                        }
                    }
                );
                break;

            case 'File/Load Audio':
                Window.showOpenDialog(function(files) {
                    if (files) {
                        Application.loadAudioFile(files[0]);
                    }
                });
                break;

            case 'File/Save Image':
                Window.showSaveDialog(
                    'image.png',
                    function(filename) {
                        if (filename) {
                            Application.saveImage(filename);
                        }
                    }
                );
                break;

            case 'File/Save Video':
                Window.showSaveDialog(
                    'video.mp4',
                    function(filename) {
                        if (filename) {
                            Application.saveVideo(filename);
                        }
                    }
                );
                break;

            case 'Edit/Settings':
                this.showModal(<SettingsWindow onClose={this.hideModal} />);
                break;

            case 'View/Control Dock':
                this.refs.dock.showDock(!checked);
                this.refs.menubar.setCheckState(action, !checked);
                break;

            case 'Help/About':
                this.showModal(<AboutWindow onClose={this.hideModal} />);
                break;
        }
    },

    handleAudioFile: function(file) {
        Application.loadAudioFile(file);
    },

    showModal: function(modal) {
        this.setState({ modal: modal, showModal: true });
    },

    hideModal: function() {
        this.setState({ showModal: false });
    },

    showError: function(error) {
        console.error(error);
        this.showModal(
            <ModalWindow title="ERROR">
                {error.message}
            </ModalWindow>
        );
    },

    render: function() {
        return (
            <div
                id="container"
                onClick={this.handleClick}
                onDrop={this.handleDragDrop}
                onDragOver={this.handleDragDrop}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}>
                <Header />
                <MenuBar ref="menubar" onMenuAction={this.handleMenuAction} />
                <Body>
                    <Overlay visible={this.state.showModal}>
                        {this.state.modal}
                    </Overlay>
                    <MainView>
                        <Stage ref="stage" onFileDropped={this.handleAudioFile} />
                        <Spectrum ref="spectrum" />
                        <Oscilloscope ref="osc" />
                        <Waveform ref="waveform" />
                        <Player ref="player" />
                    </MainView>
                    <ControlDock ref="dock" />
                </Body>
                <Footer filename={this.state.filename} />
                <Preload />
            </div>
        );
    }
});

module.exports = App;