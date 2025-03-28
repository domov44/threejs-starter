// App.ts
import { Scene } from './scene/Scene';
import { CameraController } from './controls/CameraController';
import { GUIController } from './debug/GuiController';
import { KeyboardController } from './controls/KeyboardController';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Model } from './Objects/Model';
import { Map } from './Objects/Map';
import { Wall } from './Objects/Wall';

class App {
    private lastTime: number = 0;
    private model!: Model;
    private cameraController!: CameraController;
    private objectKeyboardController: KeyboardController | undefined;
    private map!: Map;
    private wallLoader: Wall;

    constructor() {
        const sceneBuilder = new Scene();
        sceneBuilder.createObjects();
        sceneBuilder.createLight();

        const scene = sceneBuilder.getScene();
        const camera = sceneBuilder.getCamera();
        const renderer = sceneBuilder.getRenderer();
        const world = sceneBuilder.getWorld() as CANNON.World;

        const debuggerEnabled = false;

        this.wallLoader = new Wall(scene, world, debuggerEnabled);

        this.wallLoader.wall();

        camera.position.set(20, 2, 5);
        camera.rotation.x += 0.5;

        this.model = new Model(scene, world);
        this.map = new Map(scene, world);

        this.initializeScene(renderer, scene, camera, world);
    }

    private initializeScene(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        world: CANNON.World
    ): void {
        this.map.loadMap("/assets/models/map.glb")
            .then(() => {
                console.log("Map loaded successfully!");

                return this.model.loadModel("/assets/models/toy_jeep.glb");
            })
            .then(() => {
                const modelMesh = this.model.getMesh();
                const modelPhysicsBody = this.model.getPhysicsBody();

                if (modelMesh && modelPhysicsBody) {
                    this.objectKeyboardController = new KeyboardController(
                        modelMesh,
                        modelPhysicsBody
                    );

                    this.cameraController = new CameraController(
                        camera,
                        renderer.domElement,
                        this.objectKeyboardController
                    );

                    const guiController = new GUIController();
                    guiController.addCameraControls(camera);

                    this.cameraController.setTarget(modelMesh);

                    this.startAnimationLoop(renderer, scene, camera, world);
                } else {
                    console.error("Failed to initialize model mesh or physics body");
                }
            })
            .catch(error => {
                console.error("Scene initialization failed:", error);
            });
    }

    private startAnimationLoop(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        world: CANNON.World
    ): void {
        const animate = (currentTime: number) => {
            const deltaTime = this.lastTime
                ? (currentTime - this.lastTime) / 1000
                : 1 / 60;
            this.lastTime = currentTime;

            if (this.objectKeyboardController) {
                this.objectKeyboardController.update();
                const speed = this.objectKeyboardController.getSpeed();
                this.model.update(deltaTime, speed);
            }

            this.cameraController.update();
            world.step(1 / 60);
            this.wallLoader.animate();

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}

export { App };
