import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { SoundController } from './SoundController';

class KeyboardController {
    private object: THREE.Object3D;
    private velocity: THREE.Vector3;
    private acceleration: number;
    private maxSpeed: number;
    private friction: number;
    private turnSpeed: number;
    private minSpeedForTurning: number;
    private minSpeedForDrifting: number;
    private brakeForce: number;
    private keys: { [key: string]: boolean };
    private physicsBody: CANNON.Body;
    private lastUpdateTime: number;
    private soundController: SoundController;
    private enabled: boolean = true;
    private isDrifting: boolean = false;
    private driftSoundPlaying: boolean = false;
    private isBraking: boolean = false;

    constructor(object: THREE.Object3D, physicsBody: CANNON.Body, soundController: SoundController) {
        this.object = object;
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = 3;
        this.maxSpeed = 10;
        this.friction = 0.95;
        this.turnSpeed = 2;
        this.minSpeedForTurning = 0.1;
        this.minSpeedForDrifting = 2;
        this.brakeForce = 3;
        this.keys = {};
        this.physicsBody = physicsBody;
        this.lastUpdateTime = performance.now();
        this.soundController = soundController;

        this.physicsBody.fixedRotation = false;
        this.physicsBody.updateMassProperties();

        window.addEventListener('keydown', (event) => this.keys[event.key] = true);
        window.addEventListener('keyup', (event) => this.keys[event.key] = false);

        this.soundController.play("motor");
    }

    public disable(): void {
        this.enabled = false;
        this.stop();
        this.soundController.setVolume("motor", 0.1);
        this.soundController.setPlaybackRate("motor", 0.5);
    }

    public enable(): void {
        this.enabled = true;
    }

    private playDriftSound(speed: number, isDrifting: boolean, isBraking: boolean): void {
        let driftVolume = 0;
        let playbackRate = 1; 
    
        const normalizedSpeed = Math.min(1, speed / this.maxSpeed);
    
        if (isBraking && speed > 0.1) {
            driftVolume = Math.pow(normalizedSpeed, 1.5);
            driftVolume *= Math.max(0.1, Math.min(1, 1 - normalizedSpeed));
            driftVolume = Math.max(0.4, driftVolume);
            driftVolume = Math.min(1, driftVolume);
    
            playbackRate = 1.05 + normalizedSpeed * 0.15;
        } else if (isDrifting) {
            driftVolume = normalizedSpeed * 0.2;
            playbackRate = 1.0 + normalizedSpeed * 0.1;
        }
    
        if (isDrifting || isBraking) {
            if (!this.driftSoundPlaying) {
                this.driftSoundPlaying = true;
                this.soundController.play("drift");
            }
    
            this.soundController.setVolume("drift", driftVolume);
            this.soundController.setPlaybackRate("drift", playbackRate);
        } else {
            if (this.driftSoundPlaying) {
                this.driftSoundPlaying = false;
                this.soundController.stop("drift");
            }
        }
    }
    
    update() {
        if (!this.enabled) return;
        this.isDrifting = false;
        this.isBraking = false;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;

        let isAccelerating = false;
        if (this.keys['z'] || this.keys['Z'] || this.keys['ArrowUp']) {
            this.velocity.z = Math.max(this.velocity.z - this.acceleration * deltaTime, -this.maxSpeed);
            isAccelerating = true;
        } else if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) {
            this.velocity.z = Math.min(this.velocity.z + this.acceleration * deltaTime, this.maxSpeed);
            isAccelerating = true;
        } else {
            this.velocity.z *= Math.pow(this.friction, deltaTime * 60);
        }

        if (this.keys[' ']) {
            this.velocity.z *= Math.pow(1 - this.brakeForce * deltaTime, deltaTime * 60);
            this.isBraking = true;
        } else {
            this.isBraking = false;
        }

        const speed = Math.abs(this.velocity.z);
        const directionFactor = this.velocity.z !== 0 ? -Math.sign(this.velocity.z) : 0;

        if (speed > this.minSpeedForTurning) {
            if (this.keys['q'] || this.keys['Q'] || this.keys['ArrowLeft']) {
                const rotationAmount = this.turnSpeed * deltaTime;
                const rotationY = new CANNON.Quaternion();
                rotationY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationAmount);
                this.physicsBody.quaternion = rotationY.mult(this.physicsBody.quaternion);
                if (speed > this.minSpeedForDrifting) {
                    this.isDrifting = true;
                }
            } else if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) {
                const rotationAmount = -this.turnSpeed * deltaTime;
                const rotationY = new CANNON.Quaternion();
                rotationY.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), rotationAmount);
                this.physicsBody.quaternion = rotationY.mult(this.physicsBody.quaternion);
                if (speed > this.minSpeedForDrifting) {
                    this.isDrifting = true;
                }
            }
        }

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.object.quaternion);
        const cannonForward = new CANNON.Vec3(forward.x, forward.y, forward.z);

        this.physicsBody.position.vadd(cannonForward.scale(this.velocity.z * deltaTime, new CANNON.Vec3()), this.physicsBody.position);

        this.object.position.copy(this.physicsBody.position as any);
        const quat = this.physicsBody.quaternion;
        const threeQuat = new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
        this.object.rotation.setFromQuaternion(threeQuat);

        const volume = Math.max(0.2, Math.min(speed / this.maxSpeed, 1));
        const pitch = 0.8 + (speed / this.maxSpeed) * 0.5;

        this.soundController.setVolume("motor", volume);
        this.soundController.setPlaybackRate("motor", pitch);

        this.playDriftSound(speed, this.isDrifting, this.isBraking);
    }

    getSpeed(): number {
        return this.velocity.z;
    }

    isBrakingVehicle(): boolean {
        return this.isBraking;
    }

    isDriftingVehicle(): boolean {
        return this.isDrifting;
    }

    stop() {
        this.velocity.set(0, 0, 0);
    }
}

export { KeyboardController };
