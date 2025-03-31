import { Scene } from './scene/Scene';
import { CameraController } from './controls/CameraController';
import { KeyboardController } from './controls/KeyboardController';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Model } from './Objects/Model';
import { Map } from './Objects/Map';
import { Wall } from './Objects/Wall';
import { CannonDebug } from './debug/CannonDebug';
import { SoundController } from './controls/SoundController';

class App {
    private lastTime: number = 0;
    private model!: Model;
    private cameraController!: CameraController;
    private objectKeyboardController: KeyboardController | undefined;
    private map!: Map;
    private wallLoader: Wall;
    private cannonDebug: CannonDebug | undefined;
    private soundController: SoundController;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private world!: CANNON.World;
    private started: boolean = false;

    constructor() {
        this.soundController = new SoundController();
        this.wallLoader = new Wall(this.scene, this.world);
    }

    public initialize(): void {
        const sceneBuilder = new Scene();
        sceneBuilder.createObjects();
        sceneBuilder.createLight();
        this.scene = sceneBuilder.getScene();
        this.camera = sceneBuilder.getCamera();
        this.renderer = sceneBuilder.getRenderer();
        this.world = sceneBuilder.getWorld();

        this.soundController.attachListener(this.camera);

        this.wallLoader = new Wall(this.scene, this.world);
        this.loadWalls();
        this.model = new Model(this.scene, this.world, this.soundController);
        this.map = new Map(this.scene, this.world);
    }

    public start(): void {
        if (!this.started) {
            this.started = true;
            this.loadApp();
        }
    }

    private loadWalls(): void {
        const walls = [
            // Orange shop walls
            [10.03, 0.6, -18, 1.3, 1.2, 2.3],

            // Secondary orange shop walls
            [2, 0.5, 8.2, 3.5, 1, 15.1],
            [6.9, 0.5, 10, 6.3, 1, 11.2],
            [11.65, 0.6, 12.4, 0.2, 1.1, 2.8],
            [9.7, 0.6, -14, 1.3, 1.2, 2.2],
            [4.7, 2.2, -16, 4.2, 4.4, 4.4],

            // Large wall in front of the shop
            [6.5, 1.5, -8, 8.8, 3, 5.7],

            // School and school walls
            [-6, 1.5, 13.5, 4, 3, 3.1],
            [-10.1, 0.9, 13.6, 3, 1.8, 2],
            [-13.6, 0.9, 13.72, 3.95, 1.8, 2.7],
            [-10, 0.9, 6.32, 12.05, 1.8, 3.4],
            [-10, 0.9, 3.3, 3.5, 1.8, 2.4],
            [-6.25, 0.4, 0.09, 2.85, 0.8, 0.2],
            [-4.4, 0.9, 2.3, 0.8, 1.8, 4.6],
            [-13.75, 0.4, 0.09, 2.85, 0.8, 0.2],
            [-15.6, 0.9, 2.3, 0.8, 1.8, 4.6],

            // Small bush walls
            [9.85, 0.4, -4.55, 0.8, 0.8, 0.5],
            [6.95, 0.4, -4.55, 0.8, 0.8, 0.5],
            [4.15, 0.4, -4.55, 0.8, 0.8, 0.5],

            // Simple bush walls
            [8.52, 0.4, -4.55, 0.4, 0.8, 0.5],
            [5.65, 0.4, -4.55, 0.4, 0.8, 0.5],
            [2.85, 0.4, -4.55, 0.4, 0.8, 0.5],

            // Blue shop walls
            [-6.85, 0.6, -17.55, 1.3, 1.2, 1.65],
            [-7.05, 0.6, -18.82, 0.9, 1.2, 0.9],

            // Blue shop double bush walls
            [-6, 0.21, -17.05, 0.15, 0.4, 0.4],
            [-6, 0.21, -17.5, 0.15, 0.4, 0.4],
            [-4.8, 0.4, -16.8, 0.9, 0.8, 0.5],

            // Cinema walls
            [-6.2, 0.8, -14, 3, 1.5, 3.6],

            // Blue building walls
            [-10.85, 0.8, -14.05, 6.2, 1.5, 4.1],
            [-7.8, 0.6, -18, 0.7, 1.2, 4],

            // Blue building wall
            [-15.95, 0.3, -16, 0.2, 0.6, 8],
            [-14.9, 0.3, -12.1, 1.9, 0.6, 0.2],

            // Black trash wall
            [11.4, 0.3, -9.9, 0.7, 0.6, 1.1],

            // Orange trash wall
            [-14.4, 0.3, -13.55, 0.7, 0.6, 1.1],

            // Second double bush walls
            [9.85, 0.4, -11.4, 0.8, 0.8, 0.5],
            [6.95, 0.4, -11.4, 0.8, 0.8, 0.5],
            [4.15, 0.4, -11.4, 0.8, 0.8, 0.5],

            // Second simple bush walls
            [8.52, 0.4, -11.4, 0.4, 0.8, 0.5],
            [5.65, 0.4, -11.4, 0.4, 0.8, 0.5],
            [2.85, 0.4, -11.4, 0.4, 0.8, 0.5],

            // Garden door walls
            [-15.8, 0.6, -8, 0.2, 1.2, 2.45],
            [-4.3, 0.6, -8, 0.2, 1.2, 2.45],

            // Stone walls
            [-5.9, 0.4, -5.3, 1.4, 0.8, 1.1],
            [-14, 0.4, -5.6, 2.2, 0.8, 1.9]
        ];
        walls.forEach(w => this.wallLoader.addWall(...w));
    }

    private loadApp(): void {
        document.getElementById('home')!.style.display = 'none';
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) progressContainer.style.display = 'block';

        let progress = 0;
        const updateProgress = (value: number) => {
            progress = Math.min(100, progress + value);
            (document.getElementById('progressBar') as HTMLElement).style.width = `${progress}%`;
        };

        import('three').then(THREE => {
            updateProgress(30);
            import('cannon-es').then(CANNON => {
                updateProgress(60);
                this.initializeScene(this.renderer, this.scene, this.camera, this.world, THREE, CANNON, updateProgress);
            });
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
        if (import.meta.env.VITE_DEBUG_ENABLED === 'true') {
            this.cannonDebug = new CannonDebug(scene, world, true);
        }

        Promise.all([
            this.soundController.loadSound("motor", "/motor.wav", { loop: true, volume: 0 }),
            this.soundController.loadSound("big_collision", "/big_collision.wav", { loop: false, volume: 0.5 })
        ]).then(() => {
            this.soundController.play("motor");
            updateProgress(65);
            return this.map.loadMap("/assets/models/map.glb");
        }).then(() => {
            updateProgress(80);
            return this.model.loadModel("/assets/models/toy_jeep.glb");
        }).then(() => {
            updateProgress(95);
            this.setupScene(scene, camera, renderer, world);
            updateProgress(100);

            setTimeout(() => {
                const progressContainer = document.getElementById('progressContainer');
                const hero = document.getElementById('hero');
                if (progressContainer && hero) {
                    progressContainer.style.display = 'none';
                    hero.style.display = 'none';
                }
            }, 500);
        });
    }

    private setupScene(
        scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer,
        world: CANNON.World
    ): void {
        const modelMesh = this.model.getMesh();
        const modelPhysicsBody = this.model.getPhysicsBody();

        if (modelMesh && modelPhysicsBody) {
            this.objectKeyboardController = new KeyboardController(modelMesh, modelPhysicsBody, this.soundController);
            this.cameraController = new CameraController(camera, renderer.domElement, this.objectKeyboardController);

            this.cameraController.setTarget(modelMesh, modelPhysicsBody);

            this.startAnimationLoop(renderer, scene, camera, world);
        }
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
                this.model.update(deltaTime, this.objectKeyboardController.getSpeed());
            }
            this.cameraController.update();
            world.step(1 / 60);
            if (this.cannonDebug) this.cannonDebug.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

export { App };
