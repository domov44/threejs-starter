import * as THREE from 'three';

class KeyboardController {
    private object: THREE.Object3D;
    private velocity: THREE.Vector3;
    private acceleration: number;
    private maxSpeed: number;
    private friction: number;
    private turnSpeed: number;
    private keys: { [key: string]: boolean };

    constructor(object: THREE.Object3D) {
        this.object = object;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = 0.002;
        this.maxSpeed = 0.2;
        this.friction = 0.98;
        this.turnSpeed = 0.03;
        this.keys = {};

        window.addEventListener('keydown', (event) => this.keys[event.key] = true);
        window.addEventListener('keyup', (event) => this.keys[event.key] = false);
    }

    update() {
        if (this.keys['z']) {
            console.log("z")
            this.velocity.z -= this.acceleration;
        } else if (this.keys['s']) {
            this.velocity.z += this.acceleration;
        }

        if (this.keys['q']) {
            this.object.rotation.y += this.turnSpeed * (this.velocity.length() / this.maxSpeed);
        }
        if (this.keys['d']) {
            this.object.rotation.y -= this.turnSpeed * (this.velocity.length() / this.maxSpeed);
        }

        this.velocity.clampLength(0, this.maxSpeed);

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.object.quaternion);
        this.object.position.add(forward.multiplyScalar(this.velocity.z));

        this.velocity.multiplyScalar(this.friction);
    }

    getSpeed(): number {
        return this.velocity.z;
    }

}

export { KeyboardController };
