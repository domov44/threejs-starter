import { Scene } from './scene/Scene';
import { CameraController } from './controls/CameraController';
import { KeyboardController } from './controls/KeyboardController';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Model, CollisionEvent } from './Objects/Model';
import { Map } from './Objects/Map';
import { CannonDebug } from './debug/CannonDebug';
import { SoundController } from './controls/SoundController';
import { WallsManager } from './scene/WallsManager';
import { CoinsManager } from './scene/CoinsManager';
import { updateBestScore } from './auth/auth';

class App {
    private lastTime: number = 0;
    private model!: Model;
    private cameraController!: CameraController;
    private objectKeyboardController: KeyboardController | undefined;
    private map!: Map;
    private wallsManager!: WallsManager;
    private coinsManager!: CoinsManager;
    private cannonDebug: CannonDebug | undefined;
    private soundController: SoundController;
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private world!: CANNON.World;
    private started: boolean = false;
    private totalCoins: number = 0;
    private coinCount: number = 0;

    private timer: number = 0;
    private timerInterval: number | null = null;
    private lastCollisionTime: number = 0;
    private collisionPenalty: number = 5;
    private collisionCooldown: number = 1000;

    constructor() {
        this.soundController = new SoundController();
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

        this.wallsManager = new WallsManager(this.scene, this.world);
        this.wallsManager.loadWalls();
        this.coinsManager = new CoinsManager(this.scene, this.world, this.updateCoinCount.bind(this), this.soundController);
        this.coinsManager.loadCoins();
        this.model = new Model(this.scene, this.world, this.soundController);

        this.model.addCollisionListener(this.handleCollision.bind(this));

        this.map = new Map(this.scene, this.world);
        this.totalCoins = this.coinsManager.getCoinsCount();
        document.getElementById('coinCount')!.textContent = `${this.coinCount}/${this.totalCoins}`;
    }

    private handleCollision(event: CollisionEvent): void {
        if (event.collisionType === "wall") {
            const currentTime = Date.now();

            if (currentTime - this.lastCollisionTime > this.collisionCooldown) {
                this.lastCollisionTime = currentTime;
                this.applyTimerPenalty();
            }
        }
    }

    private applyTimerPenalty(): void {
        this.startTime -= this.collisionPenalty * 1000;

        const currentTime = performance.now();
        const elapsedMs = Math.floor(currentTime - this.startTime);
        document.getElementById('timer')!.textContent = `${elapsedMs} ms`;

        this.showPenaltyNotification();
    }

    private showPenaltyNotification(): void {
        const notification = document.createElement('div');
        notification.className = 'penalty-notification';
        notification.textContent = `+${this.collisionPenalty}s`;
        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    private updateCoinCount(): void {
        this.coinCount++;
        document.getElementById('coinCount')!.textContent = `${this.coinCount}/${this.totalCoins}`;

        if (this.coinCount === this.totalCoins) {
            this.stopTimer();
            this.endGame();
        }
    }
    private startTime: number = 0;

    private startTimer(): void {
        this.startTime = performance.now();
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            const currentTime = performance.now();
            const elapsedMs = Math.floor(currentTime - this.startTime);
            document.getElementById('timer')!.textContent = `${elapsedMs / 1000}s`;
        }, 10);
    }

    private stopTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    private async endGame(): Promise<void> {
        const finalTime = Math.floor(performance.now() - this.startTime);

        const finalTimeInSeconds = finalTime / 1000;

        await updateBestScore(finalTime);

        setTimeout(async () => {
            if (this.objectKeyboardController) {
                this.objectKeyboardController.disable();
            }

            const popup = document.createElement('div');
            popup.className = 'game-popup';
            popup.innerHTML = `
                <h2>${finalTimeInSeconds.toFixed(2)} seconds.</h2>
                <p>Good job! You've collected all the coins, next time try to do it faster.</p>
                <button id="restart-button" class="button __primary">New game</button>
            `;

            document.body.appendChild(popup);

            document.getElementById('restart-button')?.addEventListener('click', () => {
                window.location.reload();
            });
        }, 500);
    }

    public start(): void {
        if (!this.started) {
            this.started = true;
            this.loadApp();
        }
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
            this.soundController.loadSound("motor", "/assets/audio/motor.wav", { loop: true, volume: 0 }),
            this.soundController.loadSound("big_collision", "/assets/audio/big_collision.wav", { loop: false, volume: 0.5 }),
            this.soundController.loadSound("coin-collected", "/assets/audio/coin.wav", { loop: false, volume: 0.08 }),
            this.soundController.loadSound("drift", "/assets/audio/drift_loop.wav", { loop: true, volume: 0 })
        ]).then(() => {
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

            this.startTimer();
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
                const isDrifting = this.objectKeyboardController.isDriftingVehicle();
                const isBraking = this.objectKeyboardController.isBrakingVehicle();
                this.model.update(
                    deltaTime,
                    this.objectKeyboardController.getSpeed(),
                    isDrifting,
                    isBraking
                );
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