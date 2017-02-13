import React from 'react';

import UIComponent from '../UIComponent';
import Application from '../../core/Application';
import Window from '../../core/Window';
import { appUpdater, events } from '../../core/Global';
import { APP_VERSION } from '../../core/Environment';

import About from './About';
import AppSettings from './AppSettings';
import AudioWaveform from './AudioWaveform';
import CanvasSettings from './CanvasSettings';
import ControlDock from './ControlDock';
import ControlPicker from './ControlPicker';
import Dialog from './Dialog';
import MenuBar from './MenuBar';
import ModalWindow from './ModalWindow';
import Oscilloscope from './Oscilloscope';
import Overlay from './Overlay';
import Player from './Player';
import Preload from './Preload';
import StatusBar from './StatusBar';
import Stage from './Stage';
import Spectrum from './Spectrum';
import TitleBar from './TitleBar';
import Updates from './Updates';
import VideoSettings from './VideoSettings';

import menuConfig from '../../../config/menu';
import audioExtensions from '../../../config/audioExtensions';

export default class App extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            modals: [],
            renderVideo: false
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

        appUpdater.on('check-for-updates-complete', () => {
            if (appUpdater.hasUpdate) {
                this.checkForUpdates();
            }
        });
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
            case 'new-project':
                Application.newProject();
                break;

            case 'open-project':
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

            case 'save-project':
                this.saveProject();
                break;

            case 'save-project-as':
                this.saveProjectAs();
                break;

            case 'load-audio':
                Window.showOpenDialog(
                    files => {
                        if (files) {
                            this.loadAudioFile(files[0]);
                        }
                    },
                    {
                        filters: [
                            {name: 'Audio files', extensions: audioExtensions}
                        ]
                    }
                );
                break;

            case 'save-image':
                Window.showSaveDialog(
                    filename => {
                        if (filename) {
                            Application.saveImage(filename);
                        }
                    },
                    {defaultPath: 'image.png'}
                );
                break;

            case 'save-video':
                this.showModal(
                    <VideoSettings
                        key="video"
                        onStart={this.startRender}
                        onClose={this.hideModal}
                    />,
                    {title: 'SAVE VIDEO', buttons: null}
                );
                break;

            case 'exit':
                Window.close();
                break;

            case 'edit-canvas':
                this.showModal(
                    <CanvasSettings key="canvas" onClose={this.hideModal}/>,
                    {title: 'CANVAS', buttons: null}
                );
                break;

            case 'edit-settings':
                this.showModal(
                    <AppSettings key="settings" onClose={this.hideModal}/>,
                    {title: 'SETTINGS', buttons: null}
                );
                break;

            case 'view-control-dock':
                this.refs.dock.toggleDock();
                this.refs.menubar.setCheckState(action);
                break;

            case 'check-for-updates':
                this.checkForUpdates();
                break;

            case 'about':
                this.showModal(
                    <About key="about"/>,
                    {title: 'ABOUT', buttons: ['Close']}
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

            Application.playAudio();
        })
            .catch(() => {
                showLoading(false);
            });
    }

    startRender(options) {
        this.hideModal();

        let { videoFile, audioFile } = options;

        Application.saveVideo(videoFile, audioFile, options);

        this.setState({ renderVideo: true });
    }

    stopRender() {
        this.setState({ renderVideo: false });
    }

    checkForUpdates() {
        this.showModal(
            <Updates onClose={this.hideModal} />,
            {title: 'UPDATES', buttons: null}
        );
    }

    render() {
        let { text, modals, renderVideo } = this.state;

        return (
            <div
                id="container"
                onClick={this.onClick}
                onDrop={this.onDragDrop}
                onDragOver={this.onDragDrop}>
                <Preload />
                <TitleBar />
                <MenuBar
                    ref="menubar"
                    items={menuConfig}
                    onMenuAction={this.onMenuAction}
                />
                <div id="body">
                    <div id="viewport">
                        <Stage
                            ref="stage"
                            renderVideo={renderVideo}
                            onFileDropped={this.loadAudioFile}
                            onStopRender={this.stopRender}
                        />
                        <Spectrum ref="spectrum"/>
                        <Oscilloscope ref="osc"/>
                        <AudioWaveform ref="waveform"/>
                        <Player ref="player"/>
                    </div>
                    <ControlDock ref="dock"/>
                </div>
                <StatusBar text={text}/>
                <Overlay>
                    {modals}
                </Overlay>
            </div>
        );
    }
}