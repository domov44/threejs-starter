import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { KeyboardController } from './KeyboardController';

class CameraController {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private targetObject: THREE.Object3D | null = null;
    private offset: THREE.Vector3;
    private keyboardController: KeyboardController;
    private baseFOV: number;
    private currentFOV: number;
    private fovLerpSpeed: number = 0.1;

    constructor(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLElement, keyboardController: KeyboardController) {
        this.camera = camera;
        this.controls = new OrbitControls(this.camera, rendererDomElement);
        this.keyboardController = keyboardController;

        this.controls.enabled = false;

        this.offset = new THREE.Vector3(0, 2, -5);
        this.baseFOV = 45;
        this.currentFOV = this.baseFOV;
        this.camera.fov = this.baseFOV;
        this.camera.updateProjectionMatrix();
    }

    setTarget(object: THREE.Object3D) {
        this.targetObject = object;
        this.updateCameraInitialAngle();
    }

    update() {
        if (!this.targetObject) return;

        const offsetVector = this.offset.clone();
        const rotationMatrix = new THREE.Matrix4().extractRotation(this.targetObject.matrix);
        offsetVector.applyMatrix4(rotationMatrix);

        const targetCameraPosition = this.targetObject.position.clone().add(offsetVector);
        this.camera.position.lerp(targetCameraPosition, 0.2);
        this.camera.lookAt(this.targetObject.position);

        this.updateFOV();
    }

    private updateFOV() {
        const speed = Math.abs(this.keyboardController.getSpeed());
        const maxSpeed = 25;
        const fovVariation = 0; 

        const speedFactor = Math.min(speed / maxSpeed, 1);
        const targetFOV = this.baseFOV + (fovVariation * speedFactor);

        this.currentFOV = THREE.MathUtils.lerp(this.currentFOV, targetFOV, this.fovLerpSpeed);
        
        this.camera.fov = this.currentFOV;
        this.camera.updateProjectionMatrix();
    }

    private updateCameraInitialAngle() {
        if (!this.targetObject) return;

        const initialRotation = new THREE.Euler(0, Math.PI / 4, 0);
        this.camera.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);

        const initialPosition = this.targetObject.position.clone().add(this.offset);
        this.camera.position.copy(initialPosition);
        this.camera.lookAt(this.targetObject.position);
    }
}

export { CameraController };