import { Scene } from './scene/Scene';
import { CameraController } from './controls/CameraController';
import { GUIController } from './debug/GuiController';
import { KeyboardController } from './controls/KeyboardController';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class App {
    private mixer: THREE.AnimationMixer | undefined;
    private animationAction: THREE.AnimationAction | undefined;
    private cameraController!: CameraController;
    private objectKeyboardController: KeyboardController | undefined;

    constructor() {
        const sceneBuilder = new Scene();
        sceneBuilder.createObjects();
        sceneBuilder.createLight();

        const scene = sceneBuilder.getScene();
        const camera = sceneBuilder.getCamera();
        const renderer = sceneBuilder.getRenderer();

        camera.position.set(0, 2, 5);

        const modelPath = "/assets/models/toy_jeep.glb";
        const loader = new GLTFLoader();

        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            this.mixer = new THREE.AnimationMixer(model);
            if (gltf.animations.length > 0) {
                this.animationAction = this.mixer.clipAction(gltf.animations[0]);
                this.animationAction.play();
                this.animationAction.paused = true;
            }

            model.position.set(0, 0, 0);
            model.scale.set(0.15, 0.15, 0.15);

            this.objectKeyboardController = new KeyboardController(model);

            this.cameraController = new CameraController(camera, renderer.domElement, this.objectKeyboardController);

            const guiController = new GUIController();
            guiController.addCameraControls(camera);

            this.cameraController.setTarget(model);

            const animate = () => {
                if (this.objectKeyboardController) {
                    this.objectKeyboardController.update();

                    const speed = this.objectKeyboardController.getSpeed();

                    if (this.animationAction) {
                        if (speed > 0.01 || speed < -0.01) {
                            this.animationAction.paused = false;
                            this.animationAction.timeScale = Math.abs(speed) * 10;
                        } else {
                            this.animationAction.paused = true;
                        }
                    }
                }

                this.cameraController.update();

                if (this.mixer) {
                    this.mixer.update(0.01);
                }

                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        }, undefined, (error) => {
            console.error("Erreur lors du chargement du modèle GLB :", error);
        });
    }
}

export { App };
