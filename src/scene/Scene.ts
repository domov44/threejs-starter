import * as THREE from 'three';
import { Cube } from '../Objects/Cube';
import { Sphere } from '../Objects/Sphere';
import { Floor } from '../Objects/Floor';
import { Torus } from '../Objects/Torus';

class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        document.body.appendChild(this.renderer.domElement);
    }

    createObjects() {
        // const cube = new Cube();
        // const sphere = new Sphere();
        // const torus = new Torus();
        const plane = new Floor();

        // cube.setPosition(-1, 0.5, 0);
        // sphere.setPosition(1, 1, 0);
        // torus.setPosition(3, 1, 0);

        // cube.addToScene(this.scene);
        // sphere.addToScene(this.scene);
        plane.addToScene(this.scene);
        // torus.addToScene(this.scene);

        return;
    }

    createLight() {
        const light = new THREE.DirectionalLight(0xffffff, 5);
        light.position.set(5, 5, 5);
        light.castShadow = true;
        this.scene.add(light);
    }

    getScene(): THREE.Scene {
        return this.scene;
    }

    getCamera(): THREE.PerspectiveCamera {
        return this.camera;
    }

    getRenderer(): THREE.WebGLRenderer {
        return this.renderer;
    }
}

export { Scene };
