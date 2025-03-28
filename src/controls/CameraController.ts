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
        this.camera.updateProjectionMatrix();
    }

    setTarget(object: THREE.Object3D) {
        this.targetObject = object;
    }

    update() {
        if (!this.targetObject) return;

        const offsetVector = this.offset.clone();
        const rotationMatrix = new THREE.Matrix4().extractRotation(this.targetObject.matrix);
        offsetVector.applyMatrix4(rotationMatrix);

        const targetCameraPosition = this.targetObject.position.clone().add(offsetVector);
        this.camera.position.lerp(targetCameraPosition, 0.2);
        this.camera.lookAt(this.targetObject.position);

    }
}

export { CameraController };