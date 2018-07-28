import React, { Component } from 'react';
import Window from 'core/Window';
import { events } from 'app/global';
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
import fontOptions from 'config/fonts.json';
import styles from './App.less';

const audioFormats = [
    'aac',
    'mp3',
    'm4a',
    'ogg',
    'wav',
];

export const AppContext = React.createContext();

export default class App extends Component {
    state = {
        statusBarText: '',
        modals: [],
        reactor: null,
        showControlDock: true,
        showPlayer: true,
        showReactor: false,
    }

    componentDidMount() {
        const { app } = this.props;

        app.init();

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
                // eslint-disable-next-line
                const trim = str => str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

                this.setState({ statusBarText: `${trim(artist)} - ${trim(title)}` });
            }
        });

        events.on('menu-action', (action) => {
            this.onMenuAction(action);
        });

        events.on('unsaved-changes', this.onUnsavedChanges);

        events.on('reactor-edit', this.showReactor);

        app.updater.on('status', (event) => {
            if (event === 'check-for-updates-complete' && app.updater.hasUpdate) {
                this.showCheckForUpdates();
            }
        });

        app.startRender();
    }

    onDragDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();
    }

    onMenuAction = (action) => {
        const { app } = this.props;

        switch (action) {
            case 'new-project':
                app.newProject();
                break;

            case 'open-project':
                Window.showOpenDialog(
                    (files) => {
                        if (files) {
                            app.loadProject(files[0]);
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
                            { name: 'Audio files', extensions: audioFormats },
                        ],
                    },
                );
                break;

            case 'save-image':
                Window.showSaveDialog(
                    (filename) => {
                        if (filename) {
                            app.saveImage(filename);
                        }
                    },
                    { defaultPath: 'image.png' },
                );
                break;

            case 'save-video':
                this.showModal(
                    <VideoSettings
                        onStart={this.startVideoRender}
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
                app.stage.setZoom(1);
                break;

            case 'zoom-out':
                app.stage.setZoom(-1);
                break;

            case 'zoom-reset':
                app.stage.setZoom(0);
                break;

            case 'view-control-dock':
                this.setState(({ showControlDock }) => ({ showControlDock: !showControlDock }));
                break;

            case 'view-player':
                this.setState(({ showPlayer }) => ({ showPlayer: !showPlayer }));
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
        const { app } = this.props;
        const file = app.projectFile;

        if (file) {
            app.saveProject(file);

            if (callback) callback();
        }
        else {
            this.saveProjectAs(callback);
        }
    }

    saveProjectAs = (callback) => {
        const { app } = this.props;

        Window.showSaveDialog(
            (filename) => {
                if (filename) {
                    app.saveProject(filename);

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
        const { app } = this.props;
        const { showLoading } = this.stage;

        showLoading(true);

        app.loadAudioFile(file)
            .then(() => {
                showLoading(false);
            })
            .catch(() => {
                showLoading(false);
            });
    }

    startVideoRender = (options) => {
        const { app } = this.props;

        this.hideModal();

        const { videoFile, audioFile } = options;

        app.saveVideo(videoFile, audioFile, options);

        this.stage.startRender();
    }

    render() {
        const { app } = this.props;
        const {
            showPlayer,
            showControlDock,
            showReactor,
            reactor,
            statusBarText,
            modals,
        } = this.state;

        return (
            <AppContext.Provider value={app}>
                <div
                    className={styles.container}
                    role="presentation"
                    onDrop={this.onDragDrop}
                    onDragOver={this.onDragDrop}
                >
                    <Preload />
                    <TitleBar />
                    <MenuBar
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
            </AppContext.Provider>
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
