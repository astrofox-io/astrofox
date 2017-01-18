import EventEmitter from '../core/EventEmitter';

export default class Sound extends EventEmitter {
    constructor(context) {
        super();

        this.audioContext = context;
        this.nodes = [];
        this.playing = false;
        this.paused = false;
        this.loaded = false;
        this.repeat = false;
    }

    addNode(node) {
        if (this.nodes.indexOf(node) < 0) {
            this.nodes.push(node);
        }
    }

    removeNode(node) {
        var index = this.nodes.indexOf(node);

        if (index > -1) {
            this.nodes.splice(index, 1);
        }
    }

    disconnectNodes() {
        this.nodes.forEach((node) => {
            node.disconnect();
        });
    }
}