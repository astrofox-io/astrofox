import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Window from 'core/Window';
import { events } from 'core/Global';
import About from 'components/window/About';
import AppUpdates from 'components/window/AppUpdates';
import Dialog from 'components/window/Dialog';
import ModalWindow from 'components/window/ModalWindow';
import Overlay from 'components/window/Overlay';
import ControlPicker from 'components/window/ControlPicker';
import StatusBar from 'components/window/StatusBar';
import TitleBar from 'components/window/TitleBar';
import AppSettings from 'components/settings/AppSettings';
import CanvasSettings from 'components/settings/CanvasSettings';
import VideoSettings from 'components/settings/VideoSettings';
import ControlDock from 'components/panels/ControlDock';
import MenuBar from 'components/nav/MenuBar';
import Player from 'components/audio/Player';
import ReactorControl from 'components/controls/ReactorControl';
import Stage from 'components/stage/Stage';
import menuConfig from 'config/menu.json';
import audioExtensions from 'config/audioExtensions.json';
import fontOptions from 'config/fonts.json';
import styles from './App.less';

export default class App extends Component {
    static childContextTypes = {
        app: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.state = {
            statusBarText: '',
            modals: [],
            reactor: null,
            showControlDock: true,
            showPlayer: true,
            showReactor: false,
        };

        this.app = props.app;
    }

    getChildContext() {
        return { app: this.app };
    }

    componentDidMount() {
        this.app.init();

        events.on('message', (message) => {
            this.showDialog({ message });
        });

        events.on('error', (err) => {
            this.showDialog({
                title: 'ERROR',
                icon: 'icon-warning',
                message: err,
            });
        });

        events.on('pick-control', (type, callback) => {
            const types = ['display', 'effect'];

            this.showModal(
                <ControlPicker
                    activeIndex={types.indexOf(type)}
                    onControlPicked={callback}
                    onClose={this.hideModal}
                />,
                { title: 'ADD CONTROL', buttons: ['Close'] },
            );
        });

        events.on('audio-tags', ({ artist, title }) => {
            if (artist) {
                this.setState({ statusBarText: `${artist} - ${title}` });
            }
        });

        events.on('menu-action', (action) => {
            this.onMenuAction(action);
        });

        events.on('unsaved-changes', this.onUnsavedChanges);

        this.app.updater.on('update', (event) => {
            if (event === 'check-for-updates-complete' && this.app.updater.hasUpdate) {
                this.showCheckForUpdates();
            }
        });

        events.on('reactor-edit', this.showReactor);

        this.app.startRender();
    }

    onClick = () => {
        this.menubar.setActiveIndex(-1);
    }

    onDragDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }

    onMenuAction = (action) => {
        switch (action) {
            case 'new-project':
                this.app.newProject();
                break;

            case 'open-project':
                Window.showOpenDialog(
                    (files) => {
                        if (files) {
                            this.app.loadProject(files[0]);
                        }
                    },
                    {
                        filters: [
                            { name: 'Project files', extensions: ['afx'] },
                        ],
                    },
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
                    (files) => {
                        if (files) {
                            this.loadAudioFile(files[0]);
                        }
                    },
                    {
                        filters: [
                            { name: 'Audio files', extensions: audioExtensions },
                        ],
                    },
                );
                break;

            case 'save-image':
                Window.showSaveDialog(
                    (filename) => {
                        if (filename) {
                            this.app.saveImage(filename);
                        }
                    },
                    { defaultPath: 'image.png' },
                );
                break;

            case 'save-video':
                this.showModal(
                    <VideoSettings
                        onStart={this.startRender}
                        onClose={this.hideModal}
                    />,
                    { title: 'SAVE VIDEO', buttons: null },
                );
                break;

            case 'exit':
                Window.close();
                break;

            case 'edit-canvas':
                this.showModal(
                    <CanvasSettings
                        onClose={this.hideModal}
                    />,
                    { title: 'CANVAS', buttons: null },
                );
                break;

            case 'edit-settings':
                this.showModal(
                    <AppSettings
                        onClose={this.hideModal}
                    />,
                    { title: 'SETTINGS', buttons: null },
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
                    { title: null, buttons: null },
                );
                break;
        }
    }

    onUnsavedChanges = (callback) => {
        this.showDialog(
            {
                title: 'UNSAVED CHANGES',
                message: 'Do you want to save project changes before closing?',
                buttons: ['Yes', 'No', 'Cancel'],
            },
            (button) => {
                if (button === 'Yes') {
                    this.saveProject(callback);
                }
                else if (button === 'No') {
                    callback();
                }
            },
        );
    }

    saveProject = (callback) => {
        const file = this.app.projectFile;

        if (file) {
            this.app.saveProject(file);

            if (callback) callback();
        }
        else {
            this.saveProjectAs(callback);
        }
    }

    saveProjectAs = (callback) => {
        Window.showSaveDialog(
            (filename) => {
                if (filename) {
                    this.app.saveProject(filename);

                    if (callback) callback();
                }
            },
            { defaultPath: 'project.afx' },
        );
    }

    showModal = (content, props) => {
        if (this.dialogShown) return;

        this.setState(({ modals }) => ({
            modals: modals.concat([
                <ModalWindow
                    key={modals.length}
                    onClose={this.hideModal}
                    buttons={['OK']}
                    {...props}
                >
                    {content}
                </ModalWindow>,
            ]),
        }));
    }

    hideModal = () => {
        this.setState(({ modals }) => {
            modals.pop();
            return { modals };
        });
    }

    showDialog = ({ icon, message, ...otherProps }, callback) => {
        if (this.dialogShown) return;

        const props = {
            onClose: (button) => {
                this.hideModal();
                this.dialogShown = false;
                if (callback) callback(button);
            },
            ...otherProps,
        };

        this.showModal(
            <Dialog icon={icon} message={message} />,
            props,
        );

        this.dialogShown = true;
    }

    showCheckForUpdates = () => {
        if (this.updatesShown) return;

        const onClose = () => {
            this.hideModal();
            this.updatesShown = false;
        };

        this.showModal(
            <AppUpdates onClose={onClose} />,
            { title: 'UPDATES', buttons: null },
        );

        this.updatesShown = true;
    }

    showReactor = (reactor) => {
        this.setState(() => ({
            reactor,
            showReactor: reactor,
        }));
    }

    loadAudioFile = (file) => {
        const { showLoading } = this.stage;

        showLoading(true);

        this.app.loadAudioFile(file)
            .then(() => {
                showLoading(false);
            })
            .catch(() => {
                showLoading(false);
            });
    }

    startRender = (options) => {
        this.hideModal();

        const { videoFile, audioFile } = options;

        this.app.saveVideo(videoFile, audioFile, options);
        this.stage.startRender();
    }

    render() {
        const {
            showPlayer,
            showControlDock,
            showReactor,
            reactor,
            statusBarText,
            modals,
        } = this.state;

        return (
            <div
                className={styles.container}
                role="presentation"
                onClick={this.onClick}
                onDrop={this.onDragDrop}
                onDragOver={this.onDragDrop}
            >
                <Preload />
                <TitleBar />
                <MenuBar
                    ref={e => (this.menubar = e)}
                    items={menuConfig}
                    onMenuAction={this.onMenuAction}
                />
                <div className={styles.body}>
                    <div className={styles.viewport}>
                        <Stage
                            ref={e => (this.stage = e)}
                            onFileDropped={this.loadAudioFile}
                        />
                        <Player
                            visible={showPlayer}
                        />
                        <ReactorControl
                            visible={showReactor}
                            reactor={reactor}
                        />
                    </div>
                    <ControlDock
                        visible={showControlDock}
                    />
                </div>
                <StatusBar text={statusBarText} />
                <Overlay>
                    {modals}
                </Overlay>
            </div>
        );
    }
}

const Preload = () => (
    <div className={styles.preload}>
        {
            fontOptions.map((item, index) => (
                <div key={index} style={{ fontFamily: item }}>
                    {item}
                </div>
            ))
        }
    </div>
);
