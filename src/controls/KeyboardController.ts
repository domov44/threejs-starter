import * as THREE from 'three';
import * as CANNON from 'cannon';

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

    constructor(object: THREE.Object3D, physicsBody: CANNON.Body) {
        this.object = object;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = 0.005;
        this.maxSpeed = 0.50;
        this.friction = 0.98;
        this.turnSpeed = 0.04;
        this.minSpeedForTurning = 0.02;
        this.keys = {};
        this.physicsBody = physicsBody;

        this.physicsBody.fixedRotation = false;
        this.physicsBody.updateMassProperties();

        window.addEventListener('keydown', (event) => this.keys[event.key] = true);
        window.addEventListener('keyup', (event) => this.keys[event.key] = false);
    }

    update() {
        if (this.keys['z']) {
            this.velocity.z -= this.acceleration;
        } else if (this.keys['s']) {
            this.velocity.z += this.acceleration;
        }

        this.velocity.clampLength(0, this.maxSpeed);
        const speed = Math.abs(this.velocity.z);
        const directionFactor = this.velocity.z !== 0 ? -Math.sign(this.velocity.z) : 0;

        if (speed > this.minSpeedForTurning) {
            const speedFactor = Math.pow((this.maxSpeed - speed) / this.maxSpeed, 0.5);

            if (this.keys['q']) {
                const rotationAmount = this.turnSpeed * speedFactor * directionFactor;
                const rotationY = new CANNON.Quaternion();
                rotationY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationAmount);
                this.physicsBody.quaternion = rotationY.mult(this.physicsBody.quaternion);
            } else if (this.keys['d']) {
                const rotationAmount = -this.turnSpeed * speedFactor * directionFactor;
                const rotationY = new CANNON.Quaternion();
                rotationY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationAmount);
                this.physicsBody.quaternion = rotationY.mult(this.physicsBody.quaternion);
            }
        }

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.object.quaternion);
        const cannonForward = new CANNON.Vec3(forward.x, forward.y, forward.z);

        this.physicsBody.position.vadd(cannonForward.scale(this.velocity.z, new CANNON.Vec3()), this.physicsBody.position);

        this.velocity.multiplyScalar(this.friction);

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