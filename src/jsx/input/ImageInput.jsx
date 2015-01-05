var ImageInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: "image",
            value: null
        };
    },

    componentWillMount: function() {
        this.image = new Image();

        this.image.onload = function(){
            console.log('src loaded');
            this.refs.image.getDOMNode().src = this.image.src;
            this.props.onChange(this.props.name, this.image);
        }.bind(this);
    },

    handleDragOver: function(e){
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

                this.image.src = data;
            }.bind(this);

            timer.set('image_load');

            reader.readAsDataURL(file);
        }
        else {
            alert('Invalid image.');
        }
    },

    handleChange: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onChange(this.props.name, e.target.value);
    },

    render: function(){
        var img = this.props.value;

        return (
            <div className="input input-image"
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}>
                <img ref="image" />
            </div>
        );
    }
});