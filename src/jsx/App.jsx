var App = React.createClass({
    getInitialState: function() {
        return {
            filename: ''
        };
    },

    componentWillMount: function() {
        this.audioContext = AstroFox.getAudioContext();
        this.player = new AstroFox.Player(this.audioContext);
    },

    handleClick: function(e) {
        this.refs.menu.setActiveIndex(-1);
    },

    handleDragDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleFileLoad: function(file, data, callback) {
        var player = this.player;
        var sound = new AstroFox.BufferedSound(this.audioContext);
        var timer = AstroFox.getTimer();

        sound.on('load', function() {
            console.log('sound loaded', timer.get('sound_load'));

            /*
            timer.set('sound_process');
            player.process(sound.buffer, function(max){
                player.spectrum.options.maxVal = max;
                console.log('sound processed', timer.get('sound_process'), max);
            });
            */

            player.load('audio', sound);
            player.play('audio');

            this.setState({ filename: file.name });

            if (callback) callback();
        }.bind(this));

        sound.on('error', function() {
            this.refs.scene.isLoading(false);
        }.bind(this));

        timer.set('sound_load');
        sound.load(data);
    },

    handlePlayerProgressChange: function() {
        this.refs.waveform.forceUpdate();
    },

    handleWaveformProgressChange: function() {
        this.refs.player.forceUpdate();
    },

    handleControlLoad: function(control) {
        this.refs.scene.registerControl(control);
    },

    handleMenuAction: function(action) {
        switch (action) {
            case 'File/Save Image':
                this.refs.scene.saveImage();
                break;
            case 'File/Render Movie':
                this.refs.scene.renderMovie();
                break;
        }
    },

    render: function() {
        return (
            <div id="container"
                onClick={this.handleClick}
                onDrop={this.handleDragDrop}
                onDragOver={this.handleDragDrop}>
                <Header />
                <MenuBar ref="menu" onMenuAction={this.handleMenuAction} />
                <div id="body">
                    <div id="view">
                        <Scene
                            ref="scene"
                            player={this.player}
                            onFileLoaded={this.handleFileLoad}
                        />
                        <Waveform
                            ref="waveform"
                            player={this.player}
                            onProgressChange={this.handleWaveformProgressChange}
                        />
                        <Player
                            ref="player"
                            player={this.player}
                            onProgressChange={this.handlePlayerProgressChange}
                        />
                    </div>
                    <ControlDock
                        ref="dock"
                        player={this.player}
                        onControlLoad={this.handleControlLoad}
                    />
                </div>
                <Footer filename={this.state.filename} />
            </div>
        );
    }
});

var Header = React.createClass({
    render: function() {
        return (
            <div id="header">
                <div id="title">ASTROFOX</div>
                <div id="control-box">
                    <ul>
                        <li className="box icon-minus"></li>
                        <li className="box icon-popup"></li>
                        <li className="box icon-cancel"></li>
                    </ul>
                </div>
            </div>
        );
    }
});

var Footer = React.createClass({
    render: function() {
        return (
            <div id="footer">
                <div className="filename">{this.props.filename}</div>
                <div className="version">v1.0</div>
            </div>
        );
    }
});

var MenuBar = React.createClass({
    getInitialState: function() {
        return {
            activeIndex: -1
        };
    },

    getDefaultProps: function() {
        return {
            onMenuAction: function(){}
        };
    },

    componentWillMount: function() {
        this.items = [
            { text: 'File', items: ['New Project', 'Open Project', 'Save Project', 'Import Audio', 'Save Image', 'Render Movie', 'Exit'] },
            { text: 'Edit', items: ['Settings'] },
            { text: 'View', items: ['Control Dock', 'Full Screen'] },
            { text: 'Help', items: ['Register', 'About'] }
        ];
    },

    handleClick: function(index) {
        this.setActiveIndex((this.state.activeIndex === index) ? -1 : index);
    },

    handleMouseOver: function(index) {
        if (this.state.activeIndex > -1) {
            this.setActiveIndex(index);
        }
    },

    handleItemClick: function(action) {
        this.setActiveIndex(-1);
        this.props.onMenuAction(action);
    },

    setActiveIndex: function(index) {
        this.setState({ activeIndex: index });
    },

    render: function() {
        var items = this.items.map(function(item, index) {
            return (
                <MenuBarItem
                    key={"menubaritem" + index}
                    text={item.text}
                    items={item.items}
                    active={this.state.activeIndex === index}
                    onClick={this.handleClick.bind(this, index)}
                    onMouseOver={this.handleMouseOver.bind(this, index)}
                    onItemClick={this.handleItemClick}
                />
            );
        }, this);

        return (
            <div id="menu">
                <ul>{items}</ul>
            </div>
        );
    }
});

var MenuBarItem = React.createClass({
    getInitialState: function() {
        return {
            showItems: false
        };
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.active !== 'undefined') {
            this.setState({ showItems: props.active });
        }
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick();
    },

    handleMouseOver: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onMouseOver();
    },

    handleItemClick: function(text) {
        var action = this.props.text + '/' + text;
        this.props.onItemClick(action);
    },

    render: function() {
        var style = { display: (this.state.showItems) ? 'block' : 'none' };
        var classes = "menubar-item";
        if (this.props.active) {
            classes += " active";
        }
        var items = this.props.items.map(function(item, index) {
            return (
                <MenuItem
                    key={"menuitem" + index}
                    text={item}
                    onClick={this.handleItemClick}
                />
            );
        }, this);

        return (
            <li>
                <div className={classes}
                    onClick={this.handleClick}
                    onMouseOver={this.handleMouseOver}>
                    {this.props.text}
                </div>
                <ul className="menu"
                    style={style}>
                    {items}
                </ul>
            </li>
        );
    }
});

var MenuItem = React.createClass({
    getDefaultProps: function() {
        return {
            text: '',
            onClick: function(){}
        };
    },

    handleClick: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onClick(this.props.text);
    },

    render: function() {
        return (
            <li className="menu-item"
                onClick={this.handleClick}>
                {this.props.text}
            </li>
        );
    }
});