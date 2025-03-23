import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { KeyboardController } from './KeyboardController';

class CameraController {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private targetObject: THREE.Object3D | null = null;
    private offset: THREE.Vector3;
    private keyboardController: KeyboardController;

    constructor(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLElement, keyboardController: KeyboardController) {
        this.camera = camera;
        this.controls = new OrbitControls(this.camera, rendererDomElement);
        this.keyboardController = keyboardController;

        this.controls.enabled = false;

        this.offset = new THREE.Vector3(0, 2, -5);
    }

    setTarget(object: THREE.Object3D) {
        this.targetObject = object;
        this.updateCameraInitialAngle();
    }

    update() {
        if (this.targetObject) {
            const offsetVector = this.offset.clone();

            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.extractRotation(this.targetObject.matrix);

            offsetVector.applyMatrix4(rotationMatrix);

            const targetCameraPosition = this.targetObject.position.clone().add(offsetVector);
            this.camera.position.lerp(targetCameraPosition, 0.1);

            this.camera.lookAt(this.targetObject.position);

            this.updateFOV();
        }
    }

    private updateFOV() {
        const speed = Math.abs(this.keyboardController.getSpeed());
        const maxFOV = 60;
        const minFOV = 45;

        const maxSpeed = (this.keyboardController as any).maxSpeed || 0.2;

        const speedFactor = speed / maxSpeed;
        const newFOV = THREE.MathUtils.lerp(minFOV, maxFOV, speedFactor);

        this.camera.fov = newFOV;
        this.camera.updateProjectionMatrix();
    }

    private updateCameraInitialAngle() {
        if (this.targetObject) {
            const initialRotation = new THREE.Euler(0, Math.PI / 4, 0);
            this.camera.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);

            const initialPosition = this.targetObject.position.clone().add(this.offset);
            this.camera.position.copy(initialPosition);

            this.camera.lookAt(this.targetObject.position);
        }
    }
}

export { CameraController };
