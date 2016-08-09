'use strict';

const React = require('react');

const { Events } = require('../core/Global.js');
const Application = require('../core/Application.js');
const Window = require('../core/Window.js');
const autoBind = require('../util/autoBind.js');

const Header = require('./components/Header.jsx');
const Footer = require('./components/Footer.jsx');
const MenuBar = require('./components/MenuBar.jsx');
const Stage = require('./components/Stage.jsx');
const Player = require('./components/Player.jsx');
const Spectrum = require('./components/Spectrum.jsx');
const Oscilloscope = require('./components/Oscilloscope.jsx');
const Waveform = require('./components/Waveform.jsx');
const Overlay = require('./components/Overlay.jsx');
const ControlDock = require('./components/ControlDock.jsx');
const Preload = require('./components/Preload.jsx');
const About = require('./components/About.jsx');
const Settings = require('./components/Settings.jsx');
const CanvasSettings = require('./components/CanvasSettings.jsx');
const ControlPicker = require('./components/ControlPicker.jsx');
const ModalWindow = require('./components/ModalWindow.jsx');

class App extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            text: '',
            modal: null,
            error: null
        };
    }

    componentWillMount() {
        Events.on('error', (err) => {
            this.showError(err);
        }, this);

        Events.on('pick_control', (props) => {
           this.showModal(
               props.title,
               <ControlPicker scene={props.scene} items={props.items} onClose={this.hideModal} />
           );
        });

        Events.on('show_modal', (content) => {
            this.showModal(content);
        }, this);

        Events.on('audio_file_loading', () => {
            this.refs.stage.showLoading(true);
        }, this);

        Events.on('audio_file_loaded', () => {
            this.refs.stage.showLoading(false);
        }, this);

        Events.on('menu_action', (action, checked) => {
            this.onMenuAction(action, checked);
        }, this);
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

    onMouseDown(e) {
        Events.emit('mousedown', e);
    }

    onMouseUp(e) {
        Events.emit('mouseup', e);
    }

    onMenuAction(action, checked) {
        switch (action) {
            case 'File/New Project':
                break;

            case 'File/Open Project':
                Window.showOpenDialog(files => {
                    if (files) {
                        Application.loadProject(files[0]);
                    }
                });
                break;

            case 'File/Save Project':
                Window.showSaveDialog(
                    'project.afx',
                    filename => {
                        if (filename) {
                            Application.saveProject(filename);
                        }
                    }
                );
                break;

            case 'File/Load Audio':
                Window.showOpenDialog(files => {
                    if (files) {
                        Application.loadAudioFile(files[0]);
                    }
                });
                break;

            case 'File/Save Image':
                Window.showSaveDialog(
                    'image.png',
                    filename => {
                        if (filename) {
                            Application.saveImage(filename);
                        }
                    }
                );
                break;

            case 'File/Save Video':
                Window.showSaveDialog(
                    'video.mp4',
                    filename => {
                        if (filename) {
                            Application.saveVideo(filename);
                        }
                    }
                );
                break;

            case 'File/Exit':
                Window.close();
                break;

            case 'Edit/Canvas':
                this.showModal('CANVAS', <CanvasSettings key="canvas" onClose={this.hideModal} />);
                break;

            case 'Edit/Settings':
                this.showModal('SETTINGS', <Settings key="settings" onClose={this.hideModal} />);
                break;

            case 'View/Control Dock':
                this.refs.dock.showDock(!checked);
                this.refs.menubar.setCheckState(action, !checked);
                break;

            case 'Help/About':
                this.showModal('ABOUT', <About key="about" onClose={this.hideModal} />);
                break;
        }
    }

    showError(error) {
        let onClose = () => this.setState({ error: null }),
            buttons = [{ text: 'OK', click: onClose }];

        let modal = (
            <ModalWindow title="ERROR" buttons={buttons} onClose={onClose}>
                <div className="message">{error.message}</div>
            </ModalWindow>
        );

        this.setState({ error: modal });
    }

    showModal(title, content, buttons) {
        let modal = (
            <ModalWindow title={title} buttons={buttons} onClose={this.hideModal}>
                {content}
            </ModalWindow>
        );

        this.setState({ modal: modal });
    }

    hideModal() {
        this.setState({ modal: null });
    }

    loadAudioFile(file) {
        Application.loadAudioFile(file).then(tags => {
            this.setState({ text: tags.artist + ' - ' + tags.title });
        });
    }

    render() {
        return (
            <div
                id="container"
                onClick={this.onClick}
                onDrop={this.onDragDrop}
                onDragOver={this.onDragDrop}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}>
                <Header />
                <MenuBar ref="menubar" onMenuAction={this.onMenuAction} />
                <div id="body">
                    <div id="viewport">
                        <Stage ref="stage" onFileDropped={this.loadAudioFile} />
                        <Spectrum ref="spectrum" />
                        <Oscilloscope ref="osc" />
                        <Waveform ref="waveform" />
                        <Player ref="player" />
                    </div>
                    <ControlDock ref="dock" />
                    <Overlay visible={this.state.modal || this.state.error}>
                        {this.state.modal}
                        {this.state.error}
                    </Overlay>
                </div>
                <Footer text={this.state.text} />
                <Preload />
            </div>
        );
    }
}

module.exports = App;