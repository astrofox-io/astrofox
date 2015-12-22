'use strict';

var React = require('react');
var Application = require('core/Application.js');
var Scene = require('display/Scene.js');
var DisplayLibrary = require('display/DisplayLibrary.js');
var Window = require('Window.js');

var Header = require('ui/Header.jsx');
var Body = require('ui/Body.jsx');
var Footer = require('ui/Footer.jsx');
var MenuBar = require('ui/MenuBar.jsx');
var MainView = require('ui/MainView.jsx');
var Stage = require('ui/Stage.jsx');
var Player = require('ui/Player.jsx');
var Spectrum = require('ui/Spectrum.jsx');
var Oscilloscope = require('ui/Oscilloscope.jsx');
var Waveform = require('ui/Waveform.jsx');
var Overlay = require('ui/Overlay.jsx');
var ControlDock = require('ui/ControlDock.jsx');

var ModalWindow = require('ui/windows/ModalWindow.jsx');
var AboutWindow = require('ui/windows/AboutWindow.jsx');
var SettingsWindow = require('ui/windows/SettingsWindow.jsx');

var App = React.createClass({
    getInitialState: function() {
        return {
            filename: '',
            showModal: false,
            modal: null
        };
    },

    componentWillMount: function() {
        var scene = new Scene();

        Application.stage.addScene(scene);

        scene.addDisplay(new DisplayLibrary.ImageDisplay());
        scene.addDisplay(new DisplayLibrary.BarSpectrumDisplay());
        scene.addDisplay(new DisplayLibrary.TextDisplay());

        Application.on('error', function(err) {
            this.showError(err);
        }, this);

        Application.on('show_modal', function(content) {
            this.showModal(content);
        }, this);

        Application.on('hide_modal', function() {
            this.hideModal();
        }, this);
    },

    componentDidMount: function() {
    },

    handleClick: function() {
        this.refs.menu.setActiveIndex(-1);
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
                }.bind(this));
                break;

            case 'File/Save Project':
                Window.showSaveDialog(
                    'project.afx',
                    function(filename) {
                        if (filename) {
                            Application.saveProject(filename);
                        }
                    }.bind(this)
                );
                break;

            case 'File/Load Audio':
                Window.showOpenDialog(function(files) {
                    if (files) {
                        this.loadAudioFile(files[0]);
                    }
                }.bind(this));
                break;

            case 'File/Save Image':
                Window.showSaveDialog(
                    'image.png',
                    function(filename) {
                        if (filename) {
                            Application.saveImage(filename);
                        }
                    }.bind(this)
                );
                break;

            case 'File/Save Video':
                Window.showSaveDialog(
                    'video.mp4',
                    function(filename) {
                        if (filename) {
                            Application.saveVideo(filename);
                        }
                    }.bind(this)
                );
                break;

            case 'Edit/Settings':
                this.showModal(<SettingsWindow onClose={this.hideModal} />);
                break;

            case 'View/Control Dock':
                this.refs.dock.showDock(!checked);
                this.refs.menu.setCheckState(action, !checked);
                break;

            case 'Help/About':
                this.showModal(<AboutWindow onClose={this.hideModal} />);
                break;
        }
    },

    showModal: function(modal) {
        this.setState({ modal: modal, showModal: true });
    },

    hideModal: function() {
        this.setState({ showModal: false });
    },

    showError: function(error) {
        this.showModal(
            <ModalWindow title="ERROR" onClose={this.hideModal}>
                {error.message}
            </ModalWindow>
        );
    },

    loadAudioFile: function(file) {
        var scene = this.refs.scene;

        scene.showLoading(true);

        Application.loadAudioFile(file)
            .then(function(data) {
                return Application.loadAudioData(data);
            })
            .catch(function(error) {
                this.showError(error);
            }.bind(this))
            .then(function() {
                scene.showLoading(false);
            });
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
                <MenuBar
                    ref="menu"
                    onMenuAction={this.handleMenuAction}
                />
                <Body>
                    <Overlay visible={this.state.showModal}>
                        {this.state.modal}
                    </Overlay>
                    <MainView>
                        <Stage ref="scene" onFileDropped={this.loadAudioFile} />
                        <Spectrum ref="spectrum" />
                        <Oscilloscope ref="osc" />
                        <Waveform ref="waveform" />
                        <Player ref="player" />
                    </MainView>
                    <ControlDock ref="dock" />
                </Body>
                <Footer
                    filename={this.state.filename}
                />
            </div>
        );
    }
});

module.exports = App;