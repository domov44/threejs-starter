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
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);

        document.body.appendChild(this.renderer.domElement);
    }

    createObjects() {
        const floor = new Floor();
        floor.addToWorld(this.world);
    }

    createLight() {
        const mainLight = new THREE.DirectionalLight(0xffffff, 5);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.top = 20;
        mainLight.shadow.camera.bottom = -20;
        mainLight.shadow.camera.left = -20;
        mainLight.shadow.camera.right = 20;
        
        this.scene.add(mainLight);

        const fillLight = new THREE.HemisphereLight(0xffffff, 0x080820, 2);
        fillLight.position.set(0, 20, 0);
        this.scene.add(fillLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 50);
        pointLight.position.set(5, 10, 5);
        this.scene.add(pointLight);
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