import { Scene } from './scene/Scene';
import { CameraController } from './controls/CameraController';
import { GUIController } from './debug/GuiController';
import { KeyboardController } from './controls/KeyboardController';
import * as THREE from 'three';
import { Model } from './Objects/Model';

class App {
    private lastTime: number = 0;
    private model!: Model;
    private cameraController!: CameraController;
    private objectKeyboardController: KeyboardController | undefined;

    constructor() {
        const sceneBuilder = new Scene();
        sceneBuilder.createObjects();
        sceneBuilder.createLight();

        const scene = sceneBuilder.getScene();
        const camera = sceneBuilder.getCamera();
        const renderer = sceneBuilder.getRenderer();
        const world = sceneBuilder.getWorld();

        camera.position.set(20, 2, 5);
        camera.rotation.x += 0.5;

        this.model = new Model(scene, world);

        this.model.loadModel("/assets/models/toy_jeep.glb").then(() => {
            const modelMesh = this.model.getMesh();
            const modelPhysicsBody = this.model.getPhysicsBody();

            if (modelMesh && modelPhysicsBody) {
                this.objectKeyboardController = new KeyboardController(modelMesh, modelPhysicsBody);

                this.cameraController = new CameraController(camera, renderer.domElement, this.objectKeyboardController);

                const guiController = new GUIController();
                guiController.addCameraControls(camera);

                this.cameraController.setTarget(modelMesh);

                this.startAnimationLoop(renderer, scene, camera, world);
            }
        }).catch(error => {
            console.error("Failed to load model:", error);
        });
    }

    private startAnimationLoop(
        renderer: THREE.WebGLRenderer, 
        scene: THREE.Scene, 
        camera: THREE.Camera, 
        world: CANNON.World
    ): void {
        const animate = (currentTime: number) => {
            const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 1 / 60;
            this.lastTime = currentTime;

            if (this.objectKeyboardController) {
                this.objectKeyboardController.update();
                const speed = this.objectKeyboardController.getSpeed();

                this.model.update(deltaTime, speed);
            }

            this.cameraController.update();
            world.step(deltaTime);
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }
}

export { App };