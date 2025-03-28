import { Scene } from './scene/Scene';
import { CameraController } from './controls/CameraController';
import { GUIController } from './debug/GuiController';
import { KeyboardController } from './controls/KeyboardController';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Model } from './Objects/Model';
import { Map } from './Objects/Map';
import { Wall } from './Objects/Wall';
import { CannonDebug } from './debug/CannonDebug';

class App {
    private lastTime: number = 0;
    private model!: Model;
    private cameraController!: CameraController;
    private objectKeyboardController: KeyboardController | undefined;
    private map!: Map;
    private wallLoader: Wall;
    private fps: number = 0;
    private fpsInterval: number = 1;
    private fpsCount: number = 0;
    private lastFpsTime: number = 0;
    
    private cannonDebug: CannonDebug | undefined;

    constructor() {
        const sceneBuilder = new Scene();
        sceneBuilder.createObjects();
        sceneBuilder.createLight();

        const scene = sceneBuilder.getScene();
        const camera = sceneBuilder.getCamera();
        const renderer = sceneBuilder.getRenderer();
        const world = sceneBuilder.getWorld() as CANNON.World;
        const debuggerEnabled = import.meta.env.VITE_DEBUG_ENABLED === 'true';

        this.wallLoader = new Wall(scene, world);

        this.wallLoader.addWall(2, 0.5, 8.2, 3.5, 1, 15.1);
        this.wallLoader.addWall(6.9, 0.5, 10, 6.3, 1, 11.2);
        this.wallLoader.addWall(11.65, 0.6, 12.4, 0.2, 1.1, 2.8);
        

        this.model = new Model(scene, world);
        this.map = new Map(scene, world);

        if (debuggerEnabled) {
            this.cannonDebug = new CannonDebug(scene, world, true);
        }

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
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            this.fpsCount++;
            if (currentTime - this.lastFpsTime >= 1000) {
                this.fps = this.fpsCount;
                this.fpsCount = 0;
                this.lastFpsTime = currentTime;
                console.log(`FPS: ${this.fps}`);
            }

            if (this.objectKeyboardController) {
                this.objectKeyboardController.update();
                const speed = this.objectKeyboardController.getSpeed();
                this.model.update(deltaTime, speed);
            }

            this.cameraController.update();
            world.step(1 / 60);

            // Update CannonDebugger if it's enabled
            if (this.cannonDebug) {
                this.cannonDebug.update();
            }

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}

export { App };
