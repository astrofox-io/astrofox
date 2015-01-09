var ImageInput = React.createClass({
    getInitialState: function() {
        return {
            src: ''
        };
    },

    getDefaultProps: function() {
        return {
            name: 'image',
            src: '',
            onChange: function(){}
        };
    },

    componentWillMount: function() {
        this.image = new Image();
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.src !== 'undefined' && props.src !== '') {
            this.setState({ src: props.src });
        }
    },

    handleDragOver: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleDrop: function(e){
        e.stopPropagation();
        e.preventDefault();

        var file = e.dataTransfer.files[0];

        this.loadFile(file);
    },

    handleClick: function(e) {
        this.refs.file.getDOMNode().click();
    },

    handleDelete: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.image.src = '';
        this.refs.form.getDOMNode().reset();

        this.setState({ src: '' }, function() {
            this.props.onChange(this.props.name, null);
        }.bind(this));
    },

    handleFileOpen: function(e) {
        e.preventDefault();

        if (e.target.files.length > 0) {
            this.loadFile(e.target.files[0]);
        }
    },

    loadFile: function(file) {
        if (!(/^image/.test(file.type))) return;

        var reader = new FileReader();
        var timer = AstroFox.getTimer();

        reader.onload = function(fe) {
            // DEBUG
            console.log('image loaded', timer.get('image_load'));
            var data = fe.target.result;

            this.setState({ src: data }, function() {
                this.image.src = this.refs.image.getDOMNode().src = this.state.src;
                this.props.onChange(this.props.name, this.image);
            });
        }.bind(this);

        timer.set('image_load');

        reader.readAsDataURL(file);
    },

    render: function() {
        var style = { display: (this.state.src !== '') ? 'inline-block' : 'none' };

        return (
            <div>
                <div className="input input-image"
                    onDrop={this.handleDrop}
                    onDragOver={this.handleDragOver}
                    onClick={this.handleClick}>
                    <form ref="form" className="input-file">
                        <input
                            ref="file"
                            type="file"
                            onChange={this.handleFileOpen}
                        />
                    </form>
                    <img ref="image" style={style} />
                </div>
                <div className="input input-image-delete icon-cancel"
                    onClick={this.handleDelete}
                    style={style}
                />
            </div>
        );
    }
});