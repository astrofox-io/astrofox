import * as THREE from 'three';
import TexturePass from './TexturePass';

class FrameBuffer {
    constructor() {
        this.canvas = document.createElement('canvas');

        this.texture = new THREE.Texture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
    
        this.pass = new TexturePass(this.texture);
    }
}

export class CanvasBuffer extends FrameBuffer {
    constructor(width, height) {
        super();

        this.context = this.canvas.getContext('2d');

        this.setSize(width, height);
    }

    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

export class GLBuffer extends FrameBuffer {
    constructor(width, height) {
        super();

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: this.canvas
        });

        this.renderer.autoClear = false;

        this.setSize(width, height);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    clear() {
        this.renderer.clear();
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }
}