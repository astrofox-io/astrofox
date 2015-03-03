var ImageInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: 'image',
            src: '',
            onChange: function(){}
        };
    },

    componentDidMount: function() {
        this.image = this.refs.image.getDOMNode();
        this.file = this.refs.file.getDOMNode();
        this.form = this.refs.form.getDOMNode();
    },

    componentWillReceiveProps: function(props) {
        if (typeof props.src !== 'undefined') {
            this.image.src = props.src;
        }
    },

    handleDragOver: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleDrop: function(e){
        e.stopPropagation();
        e.preventDefault();

        this.loadFile(e.dataTransfer.files[0]);
    },

    handleClick: function(e) {
        e.preventDefault();

        this.form.reset();
        this.file.click();
    },

    handleDelete: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.loadImage('');
    },

    handleFileOpen: function(e) {
        e.preventDefault();

        if (e.target.files.length > 0) {
            this.loadFile(e.target.files[0]);
        }
    },

    loadImage: function(src) {
        this.image.src = src;
        this.props.onChange('src', src);
    },

    loadFile: function(file) {
        if (!(/^image/.test(file.type))) return;

        var reader = new FileReader();

        reader.onload = function(fe) {
            var data = fe.target.result;

            this.loadImage(data);
        }.bind(this);

        reader.readAsDataURL(file);
    },

    getImage: function() {
        return this.image;
    },

    getImageRatio: function() {
        var image = this.image;
        return (image.src) ?  image.naturalWidth / image.naturalHeight :  0;
    },

    render: function() {
        var style = { display: (this.props.src) ? 'inline-block' : 'none' };

        return (
            <div>
                <div
                    className="input input-image"
                    onDrop={this.handleDrop}
                    onDragOver={this.handleDragOver}
                    onClick={this.handleClick}>
                    <img ref="image" style={style} />
                </div>
                <div
                    className="input input-image-delete icon-cancel-circled"
                    onClick={this.handleDelete}
                    style={style}
                />
                <form
                    ref="form"
                    className="input-file">
                    <input
                        ref="file"
                        type="file"
                        onChange={this.handleFileOpen}
                    />
                </form>
            </div>
        );
    }
});