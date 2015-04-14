var SetIntervalMixin = {
    componentWillMount: function() {
        this.intervals = [];
    },
    setInterval: function() {
        this.intervals.push(setInterval.apply(null, arguments));
    },
    componentWillUnmount: function() {
        this.intervals.map(clearInterval);
    }
};

var RangeControlMixin = {
    getStyle: function(value, startColor, endColor) {
        if (value < 0.5) value += 0.005;
        return {
            'backgroundImage': '-webkit-gradient(linear, left top, right top, color-stop('+value+', '+startColor+'), color-stop('+value+', '+endColor+'))'
        };
    }
};