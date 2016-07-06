'use strict';

const React = require('react');

const Application = require('../core/Application.js');
const Scene = require('../display/Scene.js');
const DisplayLibrary = require('../lib/DisplayLibrary.js');
const Window = require('../Window.js');
const autoBind = require('../util/autoBind.js');

const Header = require('./components/Header.jsx');
const Body = require('./components/Body.jsx');
const Footer = require('./components/Footer.jsx');
const MenuBar = require('./components/MenuBar.jsx');
const MainView = require('./components/MainView.jsx');
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
const ControlPicker = require('./components/ControlPicker.jsx');
const ModalWindow = require('./components/ModalWindow.jsx');

class App extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = {
            filename: '',
            showModal: false,
            modal: null
        };
    }

    componentWillMount() {
        // Default setup
        let scene = new Scene();

        Application.stage.addScene(scene);

        scene.addElement(new DisplayLibrary.ImageDisplay());
        scene.addElement(new DisplayLibrary.BarSpectrumDisplay());
        scene.addElement(new DisplayLibrary.TextDisplay());

        // Events
        Application.on('error', (err) => {
            this.onError(err);
        }, this);

        Application.on('pick_control', (props) => {
           this.showModal(
               props.title,
               <ControlPicker scene={props.scene} items={props.items} />
           );
        });

        Application.on('show_modal', (content) => {
            this.showModal(content);
        }, this);

        Application.on('hide_modal', () => {
            this.hideModal();
        }, this);

        Application.on('audio_file_loading', () => {
            this.refs.stage.showLoading(true);
        }, this);

        Application.on('audio_file_loaded', () => {
            this.refs.stage.showLoading(false);
        }, this);

        Application.on('menu_action', (action, checked) => {
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
        Application.emit('mousedown', e);
    }

    onMouseUp(e) {
        Application.emit('mouseup', e);
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

            case 'Edit/Settings':
                this.showModal('SETTINGS', <Settings />);
                break;

            case 'View/Control Dock':
                this.refs.dock.showDock(!checked);
                this.refs.menubar.setCheckState(action, !checked);
                break;

            case 'Help/About':
                this.showModal('ABOUT', <About />);
                break;
        }
    }

    onAudioFile(file) {
        Application.loadAudioFile(file);
    }

    onError(error) {
        this.showModal(
            'ERROR',
            <div>{error.message}</div>,
            [{ text: 'OK', click: this.hideModal }]
        );
    }

    showModal(title, content, buttons) {
        let modal = (
            <ModalWindow title={title} buttons={buttons} onClose={this.hideModal}>
                {content}
            </ModalWindow>
        );

        this.setState({ showModal: true, modal: modal });
    }

    hideModal() {
        this.setState({ showModal: false });
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
                <Body>
                    <Overlay visible={this.state.showModal}>
                        {this.state.modal}
                    </Overlay>
                    <MainView>
                        <Stage ref="stage" onFileDropped={this.onAudioFile} />
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
}

module.exports = App;