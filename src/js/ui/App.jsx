'use strict';

var React = require('react');
var Header = require('./Header.jsx');
var Body = require('./Body.jsx');
var Footer = require('./Footer.jsx');
var MenuBar = require('./MenuBar.jsx');
var MainView = require('./MainView.jsx');
var Scene = require('./Scene.jsx');
var Player = require('./Player.jsx');
var Waveform = require('./Waveform.jsx');
var Modal = require('./Modal.jsx');
var MessageWindow = require('./MessageWindow.jsx');
var ControlDock = require('./ControlDock.jsx');
var ControlsWindow = require('./ControlsWindow.jsx');

var Application = require('../Application.js');
var FX = require('../FX.js');

var App = React.createClass({
    getInitialState: function() {
        return {
            filename: '',
            showModal: false,
            modal: null
        };
    },

    componentWillMount: function() {
        var app = this.app = new Application();
        app.addDisplay(new FX.TextDisplay());
        app.addDisplay(new FX.BarSpectrumDisplay());
        app.addDisplay(new FX.ImageDisplay());

        app.on('error', function(err) {
            this.showError(err);
        }.bind(this));
    },

    componentDidMount: function() {
        this.fileForm = React.findDOMNode(this.refs.form);
        this.fileInput = React.findDOMNode(this.refs.file);
        this.fileInput.setAttribute('nwsaveas', '');
        this.fileAction = null;
    },

    componentDidUpdate: function() {

    },

    handleClick: function() {
        this.refs.menu.setActiveIndex(-1);
    },

    handleDragDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleMouseDown: function(e) {
        this.app.emit('mousedown');
    },

    handleMouseUp: function(e) {
        this.app.emit('mouseup');
    },

    handlePlayerProgressChange: function() {
        this.refs.waveform.forceUpdate();
    },

    handleWaveformProgressChange: function() {
        this.refs.player.forceUpdate();
    },

    handleFileAction: function(e) {
        e.preventDefault();

        var files = e.target.files;

        if (files.length > 0) {
            this.fileAction(files[0]);
            this.fileForm.reset();
        }
    },

    handleMenuAction: function(action, checked) {
        switch (action) {
            case 'File/New Project':
                break;

            case 'File/Open Project':
                this.loadFileDialog(function(file) {
                    this.app.loadProject(file);
                }.bind(this), '');
                break;

            case 'File/Save Project':
                this.loadFileDialog(function(file) {
                    this.app.saveProject(file);
                }.bind(this), 'project.afx');
                break;

            case 'File/Load Audio':
                this.loadFileDialog(function(file) {
                    this.loadAudioFile(file);
                }.bind(this), '');
                break;

            case 'File/Save Image':
                this.loadFileDialog(function(file) {
                    this.app.saveImage(file);
                }.bind(this), 'image.png');
                break;

            case 'File/Save Video':
                this.loadFileDialog(function(file) {
                    this.app.saveVideo(file);
                }.bind(this), 'video.mp4');
                break;

            case 'Edit/Settings':
                this.showModal(
                    <MessageWindow title="SETTINGS" onConfirm={this.hideModal}>
                        Configuration Settings
                    </MessageWindow>
                );
                break;

            case 'View/Control Dock':
                this.refs.dock.showDock(!checked);
                this.refs.menu.setCheckState(action, !checked);
                break;

            case 'View/Show FPS':
                this.app.showFPS(!checked);
                this.refs.menu.setCheckState(action, !checked);
                break;

            case 'Help/About':
                this.showModal(
                    <MessageWindow title="ABOUT" onConfirm={this.hideModal}>
                        AstroFox version 1.0
                    </MessageWindow>
                );
                break;
        }
    },

    handleLayerAdd: function() {
        this.showModal(
            <ControlsWindow title="ADD CONTROL" onConfirm={this.hideModal} />
        );
    },

    loadFileDialog: function(action, filename) {
        this.fileAction = action;

        if (filename) {
            this.fileInput.setAttribute('nwsaveas', filename);
        }
        else {
            this.fileInput.removeAttribute('nwsaveas');
        }

        this.fileInput.click();
    },

    showModal: function(modal) {
        this.setState({ modal: modal, showModal: true });
    },

    hideModal: function() {
        this.setState({ showModal: false });
    },

    showError: function(error) {
        this.showModal(
            <MessageWindow title="ERROR" onConfirm={this.hideModal}>
                {error.message}
            </MessageWindow>
        );
    },

    loadAudioFile: function(file) {
        var scene = this.refs.scene;

        scene.showLoading(true);

        this.app.loadAudioFile(file, function(error, data) {
            if (error) {
                scene.showLoading(false);
                this.showError(error);
            }
            else {
                this.app.loadAudioData(
                    data,
                    function (error) {
                        if (error) {
                            scene.showLoading(false);;
                            this.showError(error);
                        }
                        else {
                            this.setState({filename: file.name}, function () {
                                scene.showLoading(false);
                            });
                        }
                    }.bind(this)
                );
            }
        }.bind(this));
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
                    app={this.app}
                    onMenuAction={this.handleMenuAction}
                />
                <Body>
                    <Modal visible={this.state.showModal}>
                        {this.state.modal}
                    </Modal>
                    <MainView>
                        <Scene
                            ref="scene"
                            app={this.app}
                            onAudioFileLoaded={this.loadAudioFile}
                        />
                        <Waveform
                            ref="waveform"
                            app={this.app}
                            onProgressChange={this.handleWaveformProgressChange}
                        />
                        <Player
                            ref="player"
                            app={this.app}
                            onProgressChange={this.handlePlayerProgressChange}
                        />
                    </MainView>
                    <ControlDock
                        ref="dock"
                        app={this.app}
                        onLayerAdd={this.handleLayerAdd}
                    />
                </Body>
                <Footer
                    app={this.app}
                    filename={this.state.filename}
                />
                <form ref="form" className="off-screen">
                    <input
                        ref="file"
                        type="file"
                        onChange={this.handleFileAction}
                    />
                </form>
            </div>
        );
    }
});

module.exports = App;