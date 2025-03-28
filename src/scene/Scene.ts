import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Floor } from '../Objects/Floor';

class Scene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private world: CANNON.World;

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;

        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);

        document.body.appendChild(this.renderer.domElement);
    }

    createObjects() {
        const floor = new Floor();
        floor.addToWorld(this.world);
        
        const geometry = new THREE.PlaneGeometry(100, 100);
        const material = new THREE.MeshStandardMaterial({ color: 0xfff });
        const plane = new THREE.Mesh(geometry, material);
        
        plane.rotation.x = -Math.PI / 2;
        
        plane.position.set(0, 0, 0);
        
        this.scene.add(plane);
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

    getWorld(): CANNON.World {
        return this.world;
    }
}

export { Scene };
