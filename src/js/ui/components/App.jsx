'use strict';

const React = require('react');
const classNames = require('classnames');

const UIComponent = require('../UIComponent');
const Application = require('../../core/Application');
const Window = require('../../core/Window');
const { Events } = require('../../core/Global');

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

const menuConfig = require('../../../conf/menu.json');

class App extends UIComponent {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            modals: []
        };
    }

    componentWillMount() {
        window.onmousedown = (e) => {
            Events.emit('mousedown', e);
        };

        window.onmouseup = (e) => {
            Events.emit('mouseup', e);
        };

        Events.on('error', err => {
            this.showDialog({
                title: 'ERROR',
                icon: 'icon-warning',
                message: err
            });
        });

        Events.on('pick_control', props => {
           this.showModal(
               <ControlPicker scene={props.scene} items={props.items} onClose={this.hideModal} />,
               props
           );
        });

        Events.on('audio_tags', tags => {
            if (tags && tags.artist) {
                this.setState({ text: tags.artist + ' - ' + tags.title });
            }
        });

        Events.on('menu_action', action => {
            this.onMenuAction(action);
        });
    }

    componentDidMount() {
        Application.init();
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
            case 'File/New Project':
                Application.newProject();
                break;

            case 'File/Open Project':
                Window.showOpenDialog(
                    files => {
                        if (files) {
                            Application.loadProject(files[0]);
                        }
                    },
                    {
                        filters: [
                            { name: 'Project files', extensions: ['afx'] }
                        ]
                    }
                );
                break;

            case 'File/Save Project':
                Window.showSaveDialog(
                    filename => {
                        if (filename) {
                            Application.saveProject(filename);
                        }
                    },
                    { defaultPath: 'project.afx' }
                );
                break;

            case 'File/Load Audio':
                Window.showOpenDialog(
                    files => {
                        if (files) {
                            Application.loadAudioFile(files[0]);
                        }
                    },
                    {
                        filters: [
                            { name: 'Audio files', extensions: ['aac','mp3','m4a','ogg','wav'] }
                        ]
                    }
                );
                break;

            case 'File/Save Image':
                Window.showSaveDialog(
                    filename => {
                        if (filename) {
                            Application.saveImage(filename);
                        }
                    },
                    { defaultPath: 'image.png' }
                );
                break;

            case 'File/Save Video':
                this.showModal(
                    <VideoSettings key="canvas" audioFile={Application.audioFile} onClose={this.hideModal} />,
                    { title: 'VIDEO', buttons: null }
                );
                break;

            case 'File/Exit':
                Window.close();
                break;

            case 'Edit/Canvas':
                this.showModal(
                    <CanvasSettings key="canvas" onClose={this.hideModal} />,
                    { title: 'CANVAS', buttons: null }
                );
                break;

            case 'Edit/Settings':
                this.showModal(
                    <AppSettings key="settings" onClose={this.hideModal} />,
                    { title: 'SETTINGS', buttons: null }
                );
                break;

            case 'View/Control Dock':
                this.refs.dock.toggleDock();
                this.refs.menubar.setCheckState(action);
                break;

            case 'Help/About':
                this.showModal(
                    <About key="about" />,
                    { title: 'ABOUT' }
                );
                break;
        }
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

        this.setState({ modals: modals });
    }

    hideModal() {
        let modals = this.state.modals;

        modals.pop();

        this.setState({ modals: modals });
    }

    showDialog(props) {
        if (this.dialogShown) return;

        props.onClose = () => { this.hideModal(); this.dialogShown = false; };

        this.showModal(
            <div className="dialog">
                <span className={classNames('icon', props.icon)}/>
                <span className="message">{props.message}</span>
            </div>,
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
        let { text, modals } = this.state;

        return (
            <div
                id="container"
                onClick={this.onClick}
                onDrop={this.onDragDrop}
                onDragOver={this.onDragDrop}>
                <Preload />
                <Header />
                <MenuBar ref="menubar" items={menuConfig} onMenuAction={this.onMenuAction} />
                <div id="body">
                    <div id="viewport">
                        <Stage ref="stage" onFileDropped={this.loadAudioFile} />
                        <Spectrum ref="spectrum" />
                        <Oscilloscope ref="osc" />
                        <AudioWaveform ref="waveform" />
                        <Player ref="player" />
                    </div>
                    <ControlDock ref="dock" />
                </div>
                <Footer text={text} />
                <Overlay visible={modals.length}>
                    {modals}
                </Overlay>
            </div>
        );
    }
}

module.exports = App;