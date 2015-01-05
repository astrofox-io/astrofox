var ColorInput = React.createClass({
    getDefaultProps: function() {
        return {
            name: "color",
            value: "#ffffff"
        };
    },

    handleChange: function(e) {
        e.stopPropagation();
        e.preventDefault();

        this.props.onChange(this.props.name, e.target.value);
    },

    render: function(){
        return (
            <div className="input">
                <input type="color"
                    className="input-field input-color"
                    name={this.props.name}
                    value={this.props.value}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
});