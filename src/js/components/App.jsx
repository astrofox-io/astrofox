import React from 'react';
import propTypes from 'prop-types';

import UIComponent from './UIComponent';
import Window from '../core/Window';
import { events } from '../core/Global';

import About from './window/About';
import AppSettings from './settings/AppSettings';
import AppUpdates from './window/AppUpdates';
import CanvasSettings from './settings/CanvasSettings';
import ControlDock from './panels/ControlDock';
import ControlPicker from './window/ControlPicker';
import Dialog from './window/Dialog';
import MenuBar from './nav/MenuBar';
import ModalWindow from './window/ModalWindow';
import Overlay from './window/Overlay';
import Player from './audio/Player';
import StatusBar from './window/StatusBar';
import Stage from './stage/Stage';
import TitleBar from './window/TitleBar';
import VideoSettings from './settings/VideoSettings';

import menuConfig from '../../config/menu';
import audioExtensions from '../../config/audioExtensions';
import fontOptions from '../../config/fonts.json';

export default class App extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            statusBarText: '',
            modals: [],
            showControlDock: true,
            showPlayer: true
        };
        
        this.app = props.app;
    }

    getChildContext() {
        return { app: this.app };
    }

    componentWillMount() {
        this.app.init();

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

        events.on('pick-control', type => {
            const types = ['display', 'effect'];

            this.showModal(
                <ControlPicker
                    width={720}
                    height={300}
                    activeIndex={types.indexOf(type)}
                    onClose={this.hideModal}
                />,
                { title: 'ADD CONTROL', buttons: ['Close'] }
            );
        });

        events.on('audio-tags', tags => {
            if (tags && tags.artist) {
                this.setState({statusBarText: tags.artist + ' - ' + tags.title});
            }
        });

        events.on('menu-action', action => {
            this.onMenuAction(action);
        });

        events.on('unsaved-changes', this.onUnsavedChanges);

        this.app.updater.on('update', event => {
            if (event === 'check-for-updates-complete' && this.app.updater.hasUpdate) {
                this.showCheckForUpdates();
            }
        });
    }

    componentDidMount() {
        this.app.startRender();
    }

    onClick() {
        this.menubar.setActiveIndex(-1);
    }

    onDragDrop(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    onMenuAction(action) {
        switch (action) {
            case 'new-project':
                this.app.newProject();
                break;

            case 'open-project':
                Window.showOpenDialog(
                    files => {
                        if (files) {
                            this.app.loadProject(files[0]);
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
                            this.app.saveImage(filename);
                        }
                    },
                    {defaultPath: 'image.png'}
                );
                break;

            case 'save-video':
                this.showModal(
                    <VideoSettings
                        width={640}
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
                    <CanvasSettings
                        width={500}
                        onClose={this.hideModal}
                    />,
                    {title: 'CANVAS', buttons: null}
                );
                break;

            case 'edit-settings':
                this.showModal(
                    <AppSettings
                        width={500}
                        onClose={this.hideModal}
                    />,
                    {title: 'SETTINGS', buttons: null}
                );
                break;

            case 'zoom-in':
                this.app.stage.setZoom(1);
                break;

            case 'zoom-out':
                this.app.stage.setZoom(-1);
                break;

            case 'zoom-reset':
                this.app.stage.setZoom(0);
                break;

            case 'view-control-dock':
                this.setState(prevState => ({ showControlDock: !prevState.showControlDock }));
                break;

            case 'view-player':
                this.setState(prevState => ({ showPlayer: !prevState.showPlayer }));
                break;

            case 'check-for-updates':
                this.showCheckForUpdates();
                break;

            case 'about':
                this.showModal(
                    <About key="about" onClose={this.hideModal} />,
                    {title: null, buttons: null}
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
        let file = this.app.projectFile;

        if (file) {
            this.app.saveProject(file);

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
                    this.app.saveProject(filename);

                    if (callback) callback();
                }
            },
            {defaultPath: 'project.afx'}
        );
    }

    showModal(content, props) {
        if (this.dialogShown) return;

        let modals = this.state.modals;

        // Default button
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
            <Dialog icon={props.icon} message={props.message} />,
            props
        );

        this.dialogShown = true;
    }

    showCheckForUpdates() {
        if (this.updatesShown) return;

        let onClose = () => {
            this.hideModal();
            this.updatesShown = false;
        };

        this.showModal(
            <AppUpdates onClose={onClose} />,
            {title: 'UPDATES', buttons: null}
        );

        this.updatesShown = true;
    }

    loadAudioFile(file) {
        let showLoading = this.stage.showLoading;

        showLoading(true);

        this.app.loadAudioFile(file)
            .then(() => {
                showLoading(false);
            })
            .catch(() => {
                showLoading(false);
            });
    }

    startRender(options) {
        this.hideModal();

        let { videoFile, audioFile } = options;

        this.app.saveVideo(videoFile, audioFile, options);
        this.stage.startRender();
    }

    render() {
        let state = this.state;

        return (
            <div
                id="container"
                onClick={this.onClick}
                onDrop={this.onDragDrop}
                onDragOver={this.onDragDrop}>
                <Preload />
                <TitleBar />
                <MenuBar
                    ref={el => this.menubar = el}
                    items={menuConfig}
                    onMenuAction={this.onMenuAction}
                />
                <div id="body">
                    <div id="viewport">
                        <Stage
                            ref={el => this.stage = el}
                            onFileDropped={this.loadAudioFile}
                        />
                        <Player
                            visible={state.showPlayer}
                        />
                    </div>
                    <ControlDock
                        visible={state.showControlDock}
                    />
                </div>
                <StatusBar text={state.statusBarText} />
                <Overlay>
                    {state.modals}
                </Overlay>
            </div>
        );
    }
}

App.childContextTypes = {
    app: propTypes.object
};

const Preload = () => {
    let fonts = fontOptions.map((item, index) => {
        return <div key={index} style={{fontFamily: item.name}}>{item.name}</div>;
    });

    return (
        <div className="hidden">
            {fonts}
        </div>
    );
};