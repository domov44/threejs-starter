import { Scene } from './scene/Scene';
import { CameraController } from './controls/CameraController';
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
    private cannonDebug: CannonDebug | undefined;

    constructor() {
        const sceneBuilder = new Scene();
        sceneBuilder.createObjects();
        sceneBuilder.createLight();
        const scene = sceneBuilder.getScene();
        const camera = sceneBuilder.getCamera();
        const renderer = sceneBuilder.getRenderer();
        const world = sceneBuilder.getWorld();

        this.wallLoader = new Wall(scene, world);

        this.wallLoader.addWall(2, 0.5, 8.2, 3.5, 1, 15.1);
        this.wallLoader.addWall(6.9, 0.5, 10, 6.3, 1, 11.2);
        this.wallLoader.addWall(11.65, 0.6, 12.4, 0.2, 1.1, 2.8);
        this.wallLoader.addWall(10.03, 0.6, -18, 1.3, 1.2, 2.3);
        this.wallLoader.addWall(9.7, 0.6, -14, 1.3, 1.2, 2.2);
        this.wallLoader.addWall(4.7, 2.2, -16, 4.2, 4.4, 4.4);
        this.wallLoader.addWall(11.4, 0.3, -9.9, 0.7, 0.6, 1.1);
        this.wallLoader.addWall(6.5, 1.5, -8, 8.8, 3, 5.7);
        this.wallLoader.addWall(-6, 1.5, 13.5, 4, 3, 3.1);
        this.wallLoader.addWall(-10.1, 0.9, 13.6, 3, 1.8, 2);
        this.wallLoader.addWall(-13.6, 0.9, 13.72, 3.95, 1.8, 2.7);
        this.wallLoader.addWall(-10, 0.9, 6.32, 12.05, 1.8, 3.4);
        this.wallLoader.addWall(-10, 0.9, 3.3, 3.5, 1.8, 2.4);

        //school walls
        this.wallLoader.addWall(-15.6, 0.9, 2.3, 0.8, 1.8, 4.6);
        this.wallLoader.addWall(-4.4, 0.9, 2.3, 0.8, 1.8, 4.6);
        this.wallLoader.addWall(-6.25, 0.4, 0.09, 2.85, 0.8, 0.2);
        this.wallLoader.addWall(-13.75, 0.4, 0.09, 2.85, 0.8, 0.2);

        // double bush
        this.wallLoader.addWall(9.85, 0.4, -4.55, 0.8, 0.8, 0.5);
        this.wallLoader.addWall(6.95, 0.4, -4.55, 0.8, 0.8, 0.5);
        this.wallLoader.addWall(4.15, 0.4, -4.55, 0.8, 0.8, 0.5);

        // simple bush
        this.wallLoader.addWall(8.52, 0.4, -4.55, 0.4, 0.8, 0.5);
        this.wallLoader.addWall(5.65, 0.4, -4.55, 0.4, 0.8, 0.5);
        this.wallLoader.addWall(2.85, 0.4, -4.55, 0.4, 0.8, 0.5);

        this.model = new Model(scene, world);
        this.map = new Map(scene, world);

        document.getElementById('startButton')?.addEventListener('click', () => {
            this.loadApp(scene, camera, renderer, world);
        });
    }

    private loadApp(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, world: CANNON.World): void {
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.display = 'none';
        }

        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }

        let progress = 0;
        const updateProgress = (value: number) => {
            progress = Math.min(100, progress + value);
            const progressBar = document.getElementById('progressBar') as HTMLElement;
            progressBar.style.width = progress + '%';
        };

        import('three').then(THREE => {
            updateProgress(30);
            import('cannon-es').then(CANNON => {
                updateProgress(60);
                this.initializeScene(renderer, scene, camera, world, THREE, CANNON, updateProgress);
            }).catch(error => {
                console.error("Cannon.js failed to load:", error);
            });
        }).catch(error => {
            console.error("Three.js failed to load:", error);
        });
    }

    private initializeScene(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        world: CANNON.World,
        THREE: any,
        CANNON: any,
        updateProgress: (value: number) => void
    ): void {
        const debuggerEnabled = import.meta.env.VITE_DEBUG_ENABLED === 'true';

        if (debuggerEnabled) {
            this.cannonDebug = new CannonDebug(scene, world, true);
        }


        this.map.loadMap("/assets/models/map.glb")
            .then(() => {
                updateProgress(70);
                console.log("Map loaded successfully!");
                return this.model.loadModel("/assets/models/toy_jeep.glb");
            })
            .then(() => {
                updateProgress(90);
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
                    updateProgress(100);
                    setTimeout(() => {
                        const progressContainer = document.getElementById('progressContainer');
                        if (progressContainer) {
                            progressContainer.style.display = 'none';
                        }
                    }, 500);
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

            if (this.objectKeyboardController) {
                this.objectKeyboardController.update();
                const speed = this.objectKeyboardController.getSpeed();
                this.model.update(deltaTime, speed);
            }

            this.cameraController.update();
            world.step(1 / 60);

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
