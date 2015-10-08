'use strict';

var _ = require('lodash');
var THREE = require('three');

var Class = require('core/Class.js');
var Display = require('display/Display.js');
var SpectrumParser = require('audio/SpectrumParser.js');
var Composer = require('graphics/Composer.js');
var ShaderLibrary = require('shaders/ShaderLibrary.js');

var defaults = {
    shape: 'Box',
    shader: 'Normal',
    shading: 'Smooth',
    color: '#ffffff',
    x: 0,
    y: 0,
    z: 0,
    wireframe: false,
    opacity: 1.0,
    lightIntensity: 1.0,
    lightDistance: 500
};

var shaders = {
    Normal: THREE.MeshNormalMaterial,
    Basic: THREE.MeshBasicMaterial,
    Phong: THREE.MeshPhongMaterial,
    Lambert: THREE.MeshLambertMaterial,
    Depth: THREE.MeshDepthMaterial
};

var shading = {
    None: THREE.NoShading,
    Flat: THREE.FlatShading,
    Smooth: THREE.SmoothShading
};

var id = 0;

var GeometryDisplay = function(options) {
    Display.call(this, id++, 'GeometryDisplay', defaults);

    this.update(options);
};

GeometryDisplay.info = {
    name: '3D Geometry'
};

Class.extend(GeometryDisplay, Display, {
    update: function(options) {
        if (typeof options !== 'undefined') {
            this._super.update.call(this, options);

            _.forIn(options, function(val, key) {

            });
            if (options.shape !== undefined || options.shader !== undefined || options.shading !== undefined) {
                this.createMesh(this.options.shape);
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
                this.material.needsUpdate = true;
            }
            else if (options.lightDistance !== undefined || options.lightIntensity !== undefined) {
                this.updateLights();
            }
        }
    },

    addToScene: function(scene) {
        var _scene, camera, lights,
            options = this.options,
            stage = scene.parent,
            size = stage.getSize(),
            fov = 45,
            near = 0.1,
            far = 1000;

        _scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(fov, size.width/size.height, near, far);
        camera.position.set(0, 0, 0.5 * far);

        lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 1, 0);
        lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        lights[2] = new THREE.PointLight(0xffffff, 1, 0);

        _scene.add(lights[0]);
        _scene.add(lights[1]);
        _scene.add(lights[2]);

        this.pass = scene.composer.addRenderPass(_scene, camera, {clearDepth: true, forceClear: false});
        this.scene = _scene;
        this.lights = lights;

        this.createMesh(options.shape);
        this.updateLights();
    },

    removeFromScene: function(scene) {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }

        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene, data) {
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

    updateLights: function() {
        var lights = this.lights,
            intensity = this.options.lightIntensity,
            distance = this.options.lightDistance;

        lights[0].intensity = intensity;
        lights[1].intensity = intensity;
        lights[2].intensity = intensity;

        lights[0].position.set(0, distance * 2, 0);
        lights[1].position.set(distance, distance * 2, distance);
        lights[2].position.set(-distance, -distance * 2, -distance);
    },

    createMesh: function(shape) {
        if (!this.scene) return;

        var geometry, material,
            scene = this.scene,
            mesh = this.mesh,
            options = this.options;

        if (mesh) {
            scene.remove(mesh);
        }

        switch (shape) {
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
                //geometry = new THREE.TorusKnotGeometry(50, 10, 20, 10, 1, 3);
                //geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
                geometry = new THREE.TorusKnotGeometry(50, 10, 20, 10);
                break;
        }

        //shader = THREE.ShaderLib[options.shader.toLowerCase()];
        //material = new THREE.ShaderMaterial(shader);

        if (options.shading == 'Flat') {
            geometry.computeFaceNormals();

            for ( var i = 0; i < geometry.faces.length; i ++ ) {
                geometry.faces[ i ].vertexNormals = [];
            }

            geometry = new THREE.BufferGeometry().fromGeometry(geometry);
        }

        material = new shaders[options.shader]();
        material.shading = shading[options.shading];
        material.color = new THREE.Color().set(options.color);
        material.opacity = options.opacity;
        material.wireframe = options.wireframe;
        material.needsUpdate = true;

        mesh = new THREE.Mesh(geometry, material);

        scene.add(mesh);

        this.mesh = mesh;
        this.material = material;
    }
});

module.exports = GeometryDisplay;