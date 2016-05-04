'use strict';

const _ = require('lodash');
const THREE = require('three');
const Display = require('../display/Display.js');
const SpectrumParser = require('../audio/SpectrumParser.js');
const PointShader = require('../shaders/PointShader.js');

const defaults = {
    shape: 'Box',
    shader: 'Standard',
    shading: 'Smooth',
    color: '#ffffff',
    x: 0,
    y: 0,
    z: 0,
    wireframe: false,
    edges: false,
    edgeColor: '#ffffff',
    opacity: 1.0,
    startX: 0,
    startY: 0,
    startZ: 0
};

const materials = {
    Normal: THREE.MeshNormalMaterial,
    Basic: THREE.MeshBasicMaterial,
    Phong: THREE.MeshPhongMaterial,
    Lambert: THREE.MeshLambertMaterial,
    Depth: THREE.MeshDepthMaterial,
    Standard: THREE.MeshStandardMaterial,
    Physical: THREE.MeshPhysicalMaterial,
    Points: THREE.PointsMaterial
};

const shading = {
    Flat: THREE.FlatShading,
    Smooth: THREE.SmoothShading
};

const CIRCLE_SPRITE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA00lEQVRYw92XsQ3EIAxFmYAqO13HDDdABmEbWkq2oKPLCrQ+n+Qiiox0IQQ796XfIEBPYIxtAMBI2jwJwKId2qMjuqArudCYpzl2JMCCXtEJfleiNctVgBc6QL8C7dEF8EZnuK5Me50C+C7YYJy2FkTr2DOMV+augwu4APcpHAPzCLDC/VpbAPbkU+tV2ueJPYCDeXIcgJ8I4DmAOBEgcgBlIkDhAOpEgKoSQPwKxINQ/BmKJyLxVCz+Gan4jsULEhUlmYqiVEVZrqIxUdGa/Xd3/AFAB1kjvlZTLAAAAABJRU5ErkJggg==';
//const CIRCLE_SPRITE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAjgABBuQAAHhPAABF6gABEKcAADfcAAAV35+UbgAAABAwSURBVHgBACAQ3+8B////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAABAAAAAOgAAADAAAAAmAAAAGAAAAAAAAADoAAAA2gAAANAAAADGAAAAwAAAAPIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////AP///wD///8A////AP///wD///8A////AP///wD///8U////bP///8D/////////////////////////////////////////////////////////wP///2z///8U////AP///wD///8A////AP///wD///8A////AP///wAA////AP///wD///8A////AP///wD///8A////AP///0f///+v//////////////////////////////////////////////////////////////////////////////+v////R////wD///8A////AP///wD///8A////AP///wAA////AP///wD///8A////AP///wD///8A////YP///9f/////////////////////////////////////////////////////////////////////////////////////////1////2D///8A////AP///wD///8A////AP///wAA////AP///wD///8A////AP///wD///9g////5f///////////////////////////////////////////////////////////////////////////////////////////////////+X///9g////AP///wD///8A////AP///wAA////AP///wD///8A////AP///0f////X///////////////////////////////////////////////////////////////////////////////////////////////////////////////X////R////wD///8A////AP///wAA////AP///wD///8A////FP///6//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////r////xT///8A////AP///wAA////AP///wD///8A////bP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////2z///8A////AP///wACAAAAAAAAAAAAAAAOAAAAVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFQAAAAOAAAAAAAAAAACAAAAAAAAAAAAAABAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAABAAAAAAAAAAAACAAAAAAAAAAAAAAA6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA6AAAAAAAAAAACAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAACAAAAAAAAAAAAAAAmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmAAAAAAAAAAAB////AAAAAAAAAAD2AAAACQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD3AAAACgAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAADoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADoAAAAAAAAAAACAAAAAAAAAAAAAADaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADaAAAAAAAAAAACAAAAAAAAAAAAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADQAAAAAAAAAAACAAAAAAAAAAAAAADGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADGAAAAAAAAAAACAAAAAAAAAAAAAADAAAAAwQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMEAAADAAAAAAAAAAAACAAAAAAAAAAAAAADyAAAArAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKwAAADyAAAAAAAAAAAA////AP///wD///8A////FP///6//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////r////xT///8A////AP///wACAAAAAAAAAAAAAAAAAAAA7AAAAJgAAADYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADYAAAAmAAAAOwAAAAAAAAAAAAAAAAA////AP///wD///8A////AP///wD///9g////5f///////////////////////////////////////////////////////////////////////////////////////////////////+X///9g////AP///wD///8A////AP///wAA////AP///wD///8A////AP///wD///8A////YP///9f/////////////////////////////////////////////////////////////////////////////////////////1////2D///8A////AP///wD///8A////AP///wAA////AP///wD///8A////AP///wD///8A////AP///0f///+v//////////////////////////////////////////////////////////////////////////////+v////R////wD///8A////AP///wD///8A////AP///wAA////AP///wD///8A////AP///wD///8A////AP///wD///8U////bP///8D/////////////////////////////////////////////////////////wP///2z///8U////AP///wD///8A////AP///wD///8A////AP///wAB////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAABAAAAAOgAAADAAAAAmAAAAGAAAAAAAAADoAAAA2gAAANAAAADGAAAAwAAAAPIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAD//9+ajorOUQS2AAAAAElFTkSuQmCC';
const POINT_SIZE = 5;

var GeometryDisplay = function(options) {
    Display.call(this, 'GeometryDisplay', defaults);

    this.update(options);
};

GeometryDisplay.info = {
    name: '3D Geometry'
};

GeometryDisplay.prototype = _.create(Display.prototype, {
    constructor: GeometryDisplay,

    update: function(options) {
        var changed = Display.prototype.update.call(this, options);

        if (changed) {
            if (options.shape !== undefined ||
                options.shader !== undefined ||
                options.shading !== undefined ||
                options.lines !== undefined ||
                options.edges !== undefined ||
                options.edgeColor !== undefined) {
                this.createMesh();
            }
            else if (options.wireframe !== undefined) {
                this.material.wireframe = options.wireframe;
                this.material.needsUpdate = true;
            }
            else if (options.opacity !== undefined) {
                this.material.opacity = options.opacity;
                this.material.needsUpdate = true;
            }
            else if (options.color !== undefined) {
                this.material.color = new THREE.Color().set(options.color);

                if (this.options.shader == 'Points') {
                    this.material.uniforms.color.value = this.material.color;
                }

                this.material.needsUpdate = true;
            }
            else if (options.enabled !== undefined) {
                this.group.visible = options.enabled;
            }
        }

        return changed;
    },

    addToScene: function(scene) {
        var img = document.createElement('img');

        this.group = new THREE.Object3D();

        img.onload = function() {
            this.sprite = new THREE.Texture(img);
            this.sprite.transparent = true;
            this.sprite.needsUpdate = true;
        }.bind(this);
        img.src = CIRCLE_SPRITE;

        this.createMesh();

        scene.graph.add(this.group);
    },

    removeFromScene: function(scene) {
        if (this.group) {
            scene.graph.remove(this.group);
        }
    },

    updateScene: function(renderer, data) {
        var mesh = this.mesh,
            options = this.options,
            fft = this.fft = SpectrumParser.parseFFT(data.fft, {normalize: true}, this.fft),
            x = fft[0],
            y = fft[3],
            z = fft[2];

        mesh.rotation.x += 5 * x;
        mesh.rotation.y += 3 * y;
        mesh.position.set(options.x, options.y, options.z);
    },

    createMesh: function() {
        if (!this.group) return;

        var i, len, geometry, material,
            group = this.group,
            mesh = this.mesh,
            options = this.options;

        if (mesh) {
            group.remove(mesh);
        }

        mesh = new THREE.Object3D();

        // Set geometry
        switch (options.shape) {
            case 'Box':
                // width, height, depth, widthSegments:1, heightSegments:1, depthSegments:1
                geometry = new THREE.BoxGeometry(50, 50, 50);
                break;
            case 'Sphere':
                // radius:50, widthSegments:8, heightSegments:6, phiStart:0, phiLength:PI*2, thetaStart:0, thetaLength:PI
                geometry = new THREE.SphereGeometry(40, 10, 10);
                break;
            case 'Dodecahedron':
                // radius:1, detail:0
                geometry = new THREE.DodecahedronGeometry(40, 0);
                break;
            case 'Icosahedron':
                // radius:1, detail:0
                geometry = new THREE.IcosahedronGeometry(40, 0);
                break;
            case 'Octahedron':
                // radius:1, detail:0
                geometry = new THREE.OctahedronGeometry(40, 0);
                break;
            case 'Tetrahedron':
                // radius:1, detail:0
                geometry = new THREE.TetrahedronGeometry(40, 0);
                break;
            case 'Torus':
                // radius:100, tube:40, radialSegments:8, tubularSegments:6, arc:PI*2
                geometry = new THREE.TorusGeometry(50, 20, 10, 10);
                break;
            case 'Torus Knot':
                // radius:100, tube:40, radialSegments:64, tubularSegments:8, p:2, q:3, heightScale:1
                geometry = new THREE.TorusKnotGeometry(50, 10, 20, 10);
                break;
        }

        // Special handling for flat shading
        if (options.shading === 'Flat' && (options.shader === 'Normal' || options.shader === 'Lambert')) {
            geometry.computeFaceNormals();

            if (geometry.faces) {
                for (i = 0, len = geometry.faces.length; i < len; i++) {
                    geometry.faces[i].vertexNormals = [];
                }
            }
        }

        // Add edges
        if (options.edges && !options.wireframe && options.shader !== 'Points') {
            mesh.add(new THREE.LineSegments(
                new THREE.EdgesGeometry(geometry, 2),
                new THREE.LineBasicMaterial({
                    color: new THREE.Color().set(this.options.edgeColor),
                    transparent: true,
                    opacity: 0.9
                })
            ));
        }

        // Create mesh
        if (options.shader === 'Points') {
            var color = new THREE.Color().set(options.color);
            var vertices = geometry.vertices;
            var positions = new Float32Array(vertices.length * 3);
            var colors = new Float32Array(vertices.length * 3);
            var sizes = new Float32Array(vertices.length);
            var vertex;
            var vertextColor = new THREE.Color();

            for (i = 0, len = vertices.length; i < len; i++) {
                vertex = vertices[i];
                vertex.toArray(positions, i * 3);
                //vertextColor.setHSL(0.01 + 0.1 * (i / len), 1.0, 0.5).lerp(color, 0.5);
                //vertextColor.set(color);
                vertextColor.toArray(colors, i * 3);
                sizes[i] = POINT_SIZE;
            }

            geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
            geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

            material = new THREE.ShaderMaterial(PointShader);

            material.uniforms['tDiffuse'].value = this.sprite;
            material.uniforms['color'].value = color;
            material.needsUpdate = true;
            material.transparent = true;

            mesh.add(new THREE.Points(geometry, material));
        }
        else {
            geometry = new THREE.BufferGeometry().fromGeometry(geometry);

            material = new materials[options.shader]();
            material.shading = shading[options.shading];
            material.color = new THREE.Color().set(options.color);
            material.opacity = options.opacity;
            material.wireframe = options.wireframe;
            material.needsUpdate = true;
            material.transparent = true;
            material.side = (options.shader == 'Basic') ? THREE.FrontSide : THREE.DoubleSide;

            mesh.add(new THREE.Mesh(geometry, material));
        }

        group.add(mesh);

        this.mesh = mesh;
        this.material = material;
    }
});

module.exports = GeometryDisplay;