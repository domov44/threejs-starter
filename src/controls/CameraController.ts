import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { KeyboardController } from './KeyboardController';

class CameraController {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private targetObject: THREE.Object3D | null = null;
    private offset: THREE.Vector3;
    private keyboardController: KeyboardController;
    private followEnabled: boolean = false;
    private manualCameraPosition: THREE.Vector3;
    private manualCameraLookAt: THREE.Vector3;
    private movementSpeed: number = 2;
    private rotationSpeed: number = 0.02;
    private keys: { [key: string]: boolean } = {};

    constructor(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLElement, keyboardController: KeyboardController) {
        this.camera = camera;
        this.controls = new OrbitControls(this.camera, rendererDomElement);
        this.keyboardController = keyboardController;

        this.controls.enabled = false;

        this.offset = new THREE.Vector3(0, 2, -5);
        this.manualCameraPosition = new THREE.Vector3(0, 30, -50);
        this.manualCameraLookAt = new THREE.Vector3(0, 0, 0);
        this.camera.updateProjectionMatrix();

        window.addEventListener('keydown', (event) => this.keys[event.key] = true);
        window.addEventListener('keyup', (event) => this.keys[event.key] = false);
    }

    setTarget(object: THREE.Object3D) {
        this.targetObject = object;
    }

    setFollowEnabled(enabled: boolean) {
        this.followEnabled = enabled;
    }

    setManualLookAt(position: THREE.Vector3) {
        this.manualCameraLookAt = position;
    }

    update() {
        if (!this.targetObject) return;

        if (this.followEnabled) {
            const offsetVector = this.offset.clone();
            const rotationMatrix = new THREE.Matrix4().extractRotation(this.targetObject.matrix);
            offsetVector.applyMatrix4(rotationMatrix);

            const targetCameraPosition = this.targetObject.position.clone().add(offsetVector);
            this.camera.position.lerp(targetCameraPosition, 0.2);
            this.camera.lookAt(this.targetObject.position);
        } else {
            this.controls.enabled = false;

            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);
            const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

            if (this.keys['z']) this.manualCameraPosition.addScaledVector(direction, this.movementSpeed);
            if (this.keys['s']) this.manualCameraPosition.addScaledVector(direction, -this.movementSpeed);
            if (this.keys['q']) this.manualCameraPosition.addScaledVector(right, -this.movementSpeed);
            if (this.keys['d']) this.manualCameraPosition.addScaledVector(right, this.movementSpeed);
            if (this.keys['e']) this.manualCameraPosition.y += this.movementSpeed;
            if (this.keys['t']) this.manualCameraPosition.y -= this.movementSpeed;

            if (this.keys['a']) this.camera.rotation.y += this.rotationSpeed;
            if (this.keys['e']) this.camera.rotation.y -= this.rotationSpeed;
            if (this.keys['r']) this.camera.rotation.x += this.rotationSpeed;
            if (this.keys['f']) this.camera.rotation.x -= this.rotationSpeed;

            this.camera.position.copy(this.manualCameraPosition);
            this.camera.lookAt(this.manualCameraLookAt);
        }
    }
}

export { CameraController };
