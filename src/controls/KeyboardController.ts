import * as THREE from 'three';
import * as CANNON from 'cannon-es';

class KeyboardController {
    private object: THREE.Object3D;
    private velocity: THREE.Vector3;
    private acceleration: number;
    private maxSpeed: number;
    private friction: number;
    private turnSpeed: number;
    private minSpeedForTurning: number;
    private keys: { [key: string]: boolean };
    private physicsBody: CANNON.Body;
    private lastUpdateTime: number;

    constructor(object: THREE.Object3D, physicsBody: CANNON.Body) {
        this.object = object;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = 8;
        this.maxSpeed = 15;
        this.friction = 0.95;
        this.turnSpeed = 2;
        this.minSpeedForTurning = 0.1;
        this.keys = {};
        this.physicsBody = physicsBody;
        this.lastUpdateTime = performance.now();

        this.physicsBody.fixedRotation = false;
        this.physicsBody.updateMassProperties();

        window.addEventListener('keydown', (event) => this.keys[event.key] = true);
        window.addEventListener('keyup', (event) => this.keys[event.key] = false);
    }

    update() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;

        let isAccelerating = false;
        if (this.keys['z']) {
            this.velocity.z = Math.max(this.velocity.z - this.acceleration * deltaTime, -this.maxSpeed);
            isAccelerating = true;
        } else if (this.keys['s']) {
            this.velocity.z = Math.min(this.velocity.z + this.acceleration * deltaTime, this.maxSpeed);
            isAccelerating = true;
        } else {
            this.velocity.z *= Math.pow(this.friction, deltaTime * 60);
        }

        const speed = Math.abs(this.velocity.z);
        const directionFactor = this.velocity.z !== 0 ? -Math.sign(this.velocity.z) : 0;

        if (speed > this.minSpeedForTurning) {
            if (this.keys['q']) {
                const rotationAmount = this.turnSpeed * deltaTime;
                const rotationY = new CANNON.Quaternion();
                rotationY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationAmount);
                this.physicsBody.quaternion = rotationY.mult(this.physicsBody.quaternion);
            } else if (this.keys['d']) {
                const rotationAmount = -this.turnSpeed * deltaTime;
                const rotationY = new CANNON.Quaternion();
                rotationY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationAmount);
                this.physicsBody.quaternion = rotationY.mult(this.physicsBody.quaternion);
            }
        }

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.object.quaternion);
        const cannonForward = new CANNON.Vec3(forward.x, forward.y, forward.z);

        this.physicsBody.position.vadd(cannonForward.scale(this.velocity.z * deltaTime, new CANNON.Vec3()), this.physicsBody.position);

        this.object.position.copy(this.physicsBody.position as any);
        const quat = this.physicsBody.quaternion;
        const threeQuat = new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
        this.object.rotation.setFromQuaternion(threeQuat);
    }

    getSpeed(): number {
        return this.velocity.z;
    }
}

export { KeyboardController };