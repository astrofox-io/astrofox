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

        if (/^image/.test(file.type)) {
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
        }
        else {
            alert('Invalid image.');
        }
    },

    handleDelete: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.image.src = '';
        this.setState({ src: '' }, function() {
            this.props.onChange(this.props.name, null);
        }.bind(this));
    },

    render: function() {
        var style = { display: (this.state.src !== '') ? 'block' : 'none' };

        return (
            <div className="input input-image"
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}>
                <img
                    ref="image"
                    style={style}
                />
                <div className="input-image-delete icon-cancel"
                    onClick={this.handleDelete}
                    style={style}>
                </div>
            </div>
        );
    }
});