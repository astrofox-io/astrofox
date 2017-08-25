import * as THREE from 'three';
import Display from './Display';
import SpectrumParser from '../audio/SpectrumParser';

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

import POINT_SPRITE from '../../images/data/pointSprite.json';
const POINT_SIZE = 5.0;

export default class GeometryDisplay extends Display {
    constructor(options) {
        super(GeometryDisplay, options);

        this.parser = new SpectrumParser({ normalize: true });
        this.hasGeometry = true;
    }

    update(options) {
        let changed = super.update(options);

        if (changed) {
            // Create new mesh
            if (options.shape !== undefined ||
                options.material !== undefined ||
                options.shading !== undefined ||
                options.lines !== undefined ||
                options.edges !== undefined ||
                options.edgeColor !== undefined) {
                this.createMesh();
            }
            // Change wireframe
            else if (options.wireframe !== undefined) {
                if (this.options.material !== 'Points') {
                    this.material.wireframe = options.wireframe;
                    this.material.needsUpdate = true;
                }
            }
            // Change opacity
            else if (options.opacity !== undefined) {
                this.material.opacity = options.opacity;
                this.material.needsUpdate = true;
            }
            // Change color
            else if (options.color !== undefined) {
                this.material.color = new THREE.Color().set(options.color);
                this.material.needsUpdate = true;
            }
            // Change position
            else if (options.x !== undefined|| options.y !== undefined || options.z !== undefined) {
                this.mesh.position.set(this.options.x, this.options.y, this.options.z);
            }
            // Change visibility
            else if (options.enabled !== undefined) {
                this.group.visible = options.enabled;
            }
        }

        return changed;
    }

    addToScene(scene) {
        this.group = new THREE.Object3D();

        // Load point sprite image
        let img = document.createElement('img');

        img.onload = () => {
            this.sprite = new THREE.Texture(img);
            this.sprite.transparent = true;
            this.sprite.needsUpdate = true;
        };
        
        img.src = POINT_SPRITE;

        this.createMesh();

        scene.graph.add(this.group);
    }

    removeFromScene(scene) {
        if (this.group) {
            scene.graph.remove(this.group);
        }
    }

    renderToScene(scene, data) {
        if (!data.hasUpdate) return;

        let mesh = this.mesh,
            options = this.options,
            fft = this.parser.parseFFT(data.fft),
            x = fft[0],
            y = fft[3],
            z = fft[2];

        mesh.rotation.x += 5 * x;
        mesh.rotation.y += 3 * y;
        mesh.rotation.z += 2 * z;
        mesh.position.set(options.x, options.y, options.z);
    }

    createMesh() {
        if (!this.group) return;

        let geometry, material, rotation,
            group = this.group,
            mesh = this.mesh,
            options = this.options;

        if (mesh) {
            rotation = mesh.rotation.clone();
            group.remove(mesh);
        }

        mesh = new THREE.Object3D();

        // Set geometry
        switch (options.shape) {
            case 'Box':
                // width, height, depth, widthSegments:1, heightSegments:1, depthSegments:1
                geometry = new THREE.BoxBufferGeometry(50, 50, 50);
                break;
            case 'Sphere':
                // radius:50, widthSegments:8, heightSegments:6, phiStart:0, phiLength:PI*2, thetaStart:0, thetaLength:PI
                geometry = new THREE.SphereBufferGeometry(40, 10, 10);
                break;
            case 'Dodecahedron':
                // radius:1, detail:0
                geometry = new THREE.DodecahedronBufferGeometry(40, 0);
                break;
            case 'Icosahedron':
                // radius:1, detail:0
                geometry = new THREE.IcosahedronBufferGeometry(40, 0);
                break;
            case 'Octahedron':
                // radius:1, detail:0
                geometry = new THREE.OctahedronBufferGeometry(40, 0);
                break;
            case 'Tetrahedron':
                // radius:1, detail:0
                geometry = new THREE.TetrahedronBufferGeometry(40, 0);
                break;
            case 'Torus':
                // radius:100, tube:40, radialSegments:8, tubularSegments:6, arc:PI*2
                geometry = new THREE.TorusBufferGeometry(50, 20, 10, 10);
                break;
            case 'Torus Knot':
                // radius:100, tube:40, radialSegments:64, tubularSegments:8, p:2, q:3, heightScale:1
                geometry = new THREE.TorusKnotBufferGeometry(50, 10, 20, 10);
                break;
        }

        // Add edges
        if (options.edges && options.material !== 'Points') {
            mesh.add(new THREE.LineSegments(
                new THREE.EdgesGeometry(geometry, 2),
                new THREE.LineBasicMaterial({
                    color: new THREE.Color().set(options.edgeColor),
                    transparent: true,
                    opacity: 0.9
                })
            ));
        }

        // Get material
        material = new materials[options.material]();

        // Create mesh
        if (options.material === 'Points') {
            Object.assign(material, {
                size: POINT_SIZE,
                sizeAttenuation: true,
                map: this.sprite,
                transparent: true,
                alphaTest: 0.5,
                color: new THREE.Color().set(options.color),
                needsUpdate: true
            });

            mesh.add(new THREE.Points(geometry, material));
        }
        else {
            Object.assign(material, {
                flatShading: options.shading === 'Flat',
                color: new THREE.Color().set(options.color),
                opacity: options.opacity,
                wireframe: options.wireframe,
                needsUpdate: true,
                transparent: true,
                side: (options.material === 'Basic') ? THREE.FrontSide : THREE.DoubleSide
            });

            mesh.add(new THREE.Mesh(geometry, material));
        }

        group.add(mesh);

        mesh.position.set(options.x, options.y, options.z);

        if (rotation) {
            mesh.rotation.set(rotation.x, rotation.y, rotation.z);
        }

        this.mesh = mesh;
        this.material = material;
    }
}

GeometryDisplay.label = 'Geometry (3D)';

GeometryDisplay.className = 'GeometryDisplay';

GeometryDisplay.defaults = {
    shape: 'Box',
    material: 'Standard',
    shading: 'Smooth',
    color: '#FFFFFF',
    wireframe: false,
    edges: false,
    edgeColor: '#FFFFFF',
    x: 0,
    y: 0,
    z: 0,
    opacity: 1.0,
    startX: 0,
    startY: 0,
    startZ: 0,
    seed: 0
};