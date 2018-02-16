import React, { Component } from 'react';

export default function withMouseEvents(Element) {
    return class extends Component {
        getMethod = e => (
            e ? window.addEventListener : window.removeEventListener
        )

        mouseUp = (func, e) => {
            this.getMethod(e)('mouseup', func);
        }

        mouseDown = (func, e) => {
            this.getMethod(e)('mousedown', func);
        }

        mouseMove = (func, e) => {
            this.getMethod(e)('mousemove', func);
        }

        render() {
            return (
                <Element
                    mouseUp={this.mouseUp}
                    mouseDown={this.mouseDown}
                    mouseMove={this.mouseMove}
                    {...this.props}
                />
            );
        }
    };
}
