import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { KeyboardController } from './KeyboardController';
import * as CANNON from 'cannon-es';

class CameraController {
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private targetMesh: THREE.Object3D | null = null;
    private targetBody: CANNON.Body | null = null;
    private offset: THREE.Vector3;
    private keyboardController: KeyboardController;
    private followEnabled: boolean = true;
    private manualCameraPosition: THREE.Vector3;
    private manualCameraLookAt: THREE.Vector3;

    constructor(camera: THREE.PerspectiveCamera, rendererDomElement: HTMLElement, keyboardController: KeyboardController) {
        this.camera = camera;
        this.controls = new OrbitControls(this.camera, rendererDomElement);
        this.keyboardController = keyboardController;
        this.controls.enabled = false;
        this.offset = new THREE.Vector3(0, 2, -5);
        this.manualCameraPosition = new THREE.Vector3(0, 30, -50);
        this.manualCameraLookAt = new THREE.Vector3(0, 0, 0);
        this.camera.updateProjectionMatrix();
    }

    setTarget(mesh: THREE.Object3D, body: CANNON.Body) {
        this.targetMesh = mesh;
        this.targetBody = body;
    }

    setFollowEnabled(enabled: boolean) {
        this.followEnabled = enabled;
    }

    setManualLookAt(position: THREE.Vector3) {
        this.manualCameraLookAt = position;
    }

    update() {
        if (!this.targetBody) return;

        if (this.followEnabled) {
            const bodyPosition = new THREE.Vector3(
                this.targetBody.position.x,
                this.targetBody.position.y,
                this.targetBody.position.z
            );

            const quaternion = new THREE.Quaternion(
                this.targetBody.quaternion.x,
                this.targetBody.quaternion.y,
                this.targetBody.quaternion.z,
                this.targetBody.quaternion.w
            );
            const rotationMatrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);

            const offsetVector = this.offset.clone();
            offsetVector.applyMatrix4(rotationMatrix);
            
            const targetCameraPosition = bodyPosition.clone().add(offsetVector);
            
            this.camera.position.lerp(targetCameraPosition, 0.2);
            
            this.camera.lookAt(bodyPosition);
        } else {
            this.controls.enabled = true;
            this.camera.position.copy(this.manualCameraPosition);
            this.camera.lookAt(this.manualCameraLookAt);
        }
    }
    
}

export { CameraController };