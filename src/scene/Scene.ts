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
        // Lumière principale (directionnelle, avec ombres)
        const mainLight = new THREE.DirectionalLight(0xfffaf0, 7);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
    
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.top = 25;
        mainLight.shadow.camera.bottom = -25;
        mainLight.shadow.camera.left = -28;
        mainLight.shadow.camera.right = 28;
    
        this.scene.add(mainLight);
    
        const ambientLight = new THREE.AmbientLight(0x606060, 2);
        this.scene.add(ambientLight);
    
        const fillLight = new THREE.HemisphereLight(0xffffff, 0x505050, 2.5);
        fillLight.position.set(0, 30, 0);
        this.scene.add(fillLight);
    
        const secondaryDirectionalLight = new THREE.DirectionalLight(0xfffaf0, 0.8);
        secondaryDirectionalLight.position.set(-15, 15, -15);
        secondaryDirectionalLight.castShadow = false;
        this.scene.add(secondaryDirectionalLight);
    
        const secondaryPointLight = new THREE.PointLight(0xffffff, 2, 60);
        secondaryPointLight.position.set(-20, 25, -20);
        this.scene.add(secondaryPointLight);
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