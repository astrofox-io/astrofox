'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const Window = require('../../core/Window');
const {events} = require('../../core/Global');

const Header = require('./Header.jsx');
const Footer = require('./Footer.jsx');
const MenuBar = require('./MenuBar.jsx');
const Stage = require('./Stage.jsx');
const Player = require('./Player.jsx');
const Spectrum = require('./Spectrum.jsx');
const Oscilloscope = require('./Oscilloscope.jsx');
const AudioWaveform = require('./AudioWaveform.jsx');
const Overlay = require('./Overlay.jsx');
const ControlDock = require('./ControlDock.jsx');
const Preload = require('./Preload.jsx');
const About = require('./About.jsx');
const AppSettings = require('./AppSettings.jsx');
const CanvasSettings = require('./CanvasSettings.jsx');
const VideoSettings = require('./VideoSettings.jsx');
const ControlPicker = require('./ControlPicker.jsx');
const ModalWindow = require('./ModalWindow.jsx');
const Dialog = require('./Dialog.jsx');

const menuConfig = require('../../../config/menu.json');

class App extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            modals: []
        };
    }

    componentWillMount() {
        Application.init();

        events.on('message', message => {
            this.showDialog({
                message: message
            });
        });

        events.on('error', err => {
            this.showDialog({
                title: 'ERROR',
                icon: 'icon-warning',
                message: err
            });
        });

        events.on('pick_control', props => {
            this.showModal(
                <ControlPicker scene={props.scene} items={props.items} onClose={this.hideModal}/>,
                props
            );
        });

        events.on('audio-tags', tags => {
            if (tags && tags.artist) {
                this.setState({text: tags.artist + ' - ' + tags.title});
            }
        });

        events.on('menu-action', action => {
            this.onMenuAction(action);
        });

        events.on('unsaved-changes', this.onUnsavedChanges);
    }

    componentDidMount() {
        Application.startRender();
    }

    onClick() {
        this.refs.menubar.setActiveIndex(-1);
    }

    onDragDrop(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    onMenuAction(action) {
        switch (action) {
            case 'new_project':
                Application.newProject();
                break;

            case 'open_project':
                Window.showOpenDialog(
                    files => {
                        if (files) {
                            Application.loadProject(files[0]);
                        }
                    },
                    {
                        filters: [
                            {name: 'Project files', extensions: ['afx']}
                        ]
                    }
                );
                break;

            case 'save_project':
                this.saveProject();
                break;

            case 'save_project_as':
                this.saveProjectAs();
                break;

            case 'load_audio':
                Window.showOpenDialog(
                    files => {
                        if (files) {
                            this.loadAudioFile(files[0]);
                        }
                    },
                    {
                        filters: [
                            {name: 'Audio files', extensions: ['aac', 'mp3', 'm4a', 'ogg', 'wav']}
                        ]
                    }
                );
                break;

            case 'save_image':
                Window.showSaveDialog(
                    filename => {
                        if (filename) {
                            Application.saveImage(filename);
                        }
                    },
                    {defaultPath: 'image.png'}
                );
                break;

            case 'save_video':
                this.showModal(
                    <VideoSettings key="canvas" audioFile={Application.audioFile} onClose={this.hideModal}/>,
                    {title: 'SAVE VIDEO', buttons: null}
                );
                break;

            case 'exit':
                Window.close();
                break;

            case 'edit_canvas':
                this.showModal(
                    <CanvasSettings key="canvas" onClose={this.hideModal}/>,
                    {title: 'CANVAS', buttons: null}
                );
                break;

            case 'edit_settings':
                this.showModal(
                    <AppSettings key="settings" onClose={this.hideModal}/>,
                    {title: 'SETTINGS', buttons: null}
                );
                break;

            case 'view_control_dock':
                this.refs.dock.toggleDock();
                this.refs.menubar.setCheckState(action);
                break;

            case 'about':
                this.showModal(
                    <About key="about"/>,
                    {title: 'ABOUT'}
                );
                break;
        }
    }

    onUnsavedChanges(callback) {
        this.showDialog(
            {
                title: 'UNSAVED CHANGES',
                message: 'Do you want to save project changes before closing?',
                buttons: ['Yes', 'No', 'Cancel']
            },
            button => {
                if (button === 'Yes') {
                    this.saveProject(callback);
                }
                else if (button == 'No') {
                    callback();
                }
            }
        );
    }

    saveProject(callback) {
        let file = Application.projectFile;

        if (file) {
            Application.saveProject(file);

            if (callback) callback();
        }
        else {
            this.saveProjectAs(callback);
        }
    }

    saveProjectAs(callback) {
        Window.showSaveDialog(
            filename => {
                if (filename) {
                    Application.saveProject(filename);

                    if (callback) callback();
                }
            },
            {defaultPath: 'project.afx'}
        );
    }

    showModal(content, props) {
        if (this.dialogShown) return;

        let modals = this.state.modals;

        props = Object.assign(
            {
                onClose: () => this.hideModal(),
                buttons: ['OK']
            },
            props
        );

        modals.push(
            <ModalWindow key={modals.length} {...props}>
                {content}
            </ModalWindow>
        );

        this.setState({modals: modals});
    }

    hideModal() {
        let modals = this.state.modals;

        modals.pop();

        this.setState({modals: modals});
    }

    showDialog(props, callback) {
        if (this.dialogShown) return;

        props.onClose = (button) => {
            this.hideModal();
            this.dialogShown = false;
            if (callback) callback(button);
        };

        this.showModal(
            <Dialog icon={props.icon} message={props.message}/>,
            props
        );

        this.dialogShown = true;
    }

    loadAudioFile(file) {
        let showLoading = this.refs.stage.showLoading;

        showLoading(true);

        Application.loadAudioFile(file).then(() => {
            showLoading(false);

            Application.player.play('audio');
        })
            .catch(() => {
                showLoading(false);
            });
    }

    render() {
        let {text, modals} = this.state;

        return (
            <div
                id="container"
                onClick={this.onClick}
                onDrop={this.onDragDrop}
                onDragOver={this.onDragDrop}>
                <Preload />
                <Header />
                <MenuBar ref="menubar" items={menuConfig} onMenuAction={this.onMenuAction}/>
                <div id="body">
                    <div id="viewport">
                        <Stage ref="stage" onFileDropped={this.loadAudioFile}/>
                        <Spectrum ref="spectrum"/>
                        <Oscilloscope ref="osc"/>
                        <AudioWaveform ref="waveform"/>
                        <Player ref="player"/>
                    </div>
                    <ControlDock ref="dock"/>
                </div>
                <Footer text={text}/>
                <Overlay visible={modals.length}>
                    {modals}
                </Overlay>
            </div>
        );
    }
}

module.exports = App;