import { Scene } from './scene/Scene';
import { CameraController } from './controls/CameraController';
import { GUIController } from './debug/GuiController';
import { KeyboardController } from './controls/KeyboardController';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon';

class App {
    private mixer: THREE.AnimationMixer | undefined;
    private animationAction: THREE.AnimationAction | undefined;
    private cameraController!: CameraController;
    private objectKeyboardController: KeyboardController | undefined;
    private lastTime: number = 0;

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

            model.scale.set(0.15, 0.15, 0.15);

            const modelPhysicsBody = this.createPhysicsForModel(model);
            world.addBody(modelPhysicsBody);

            this.objectKeyboardController = new KeyboardController(model, modelPhysicsBody);

            this.cameraController = new CameraController(camera, renderer.domElement, this.objectKeyboardController);

            const guiController = new GUIController();
            guiController.addCameraControls(camera);

            this.cameraController.setTarget(model);

            const animate = (currentTime: number) => {
                const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 1 / 60;
                this.lastTime = currentTime;

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
                    this.mixer.update(deltaTime);
                }

                model.position.copy(modelPhysicsBody.position);

                const cannonQuat = modelPhysicsBody.quaternion;
                const threeQuat = new THREE.Quaternion();
                threeQuat.set(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
                model.rotation.setFromQuaternion(threeQuat);

                world.step(deltaTime);
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
        }, undefined, (error) => {
            console.error("Erreur lors du chargement du modèle GLB :", error);
        });
    }

    private createPhysicsForModel(model: THREE.Group): CANNON.Body {
        const shape = new CANNON.Box(new CANNON.Vec3(5, 0, 8));
        const body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 0),
        });

        body.addShape(shape);

        return body;
    }
}

export { App };