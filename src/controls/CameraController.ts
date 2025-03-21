import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class CameraController {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private targetObject: THREE.Object3D | null = null;
    private offset: THREE.Vector3;

    constructor(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLElement) {
        this.camera = camera;
        this.controls = new OrbitControls(this.camera, rendererDomElement);

        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;

        this.offset = new THREE.Vector3(0, 2, -5);
    }

    setTarget(object: THREE.Object3D) {
        this.targetObject = object;
    }

    update() {
        if (this.targetObject) {
            const targetPosition = this.targetObject.position.clone().add(this.offset);
            this.camera.position.lerp(targetPosition, 0.9);
            this.controls.target.copy(this.targetObject.position);
        }
        this.controls.update();
    }
}

export { CameraController };
