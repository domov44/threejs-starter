import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';
import { SoundController } from '../controls/SoundController';
import { Particle } from './Particle';

export interface CollisionEvent {
    type: string;
    collisionType: string;
}

export class Model {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private modelMesh: THREE.Group | null = null;
    private modelBody: CANNON.Body | null = null;
    private mixer: THREE.AnimationMixer | null = null;
    private animationAction: THREE.AnimationAction | null = null;
    private soundController: SoundController;
    private shakeTime: number = 0;
    private dustSystem: Particle;

    private collisionListeners: ((event: CollisionEvent) => void)[] = [];

    constructor(scene: THREE.Scene, world: CANNON.World, soundController: SoundController) {
        this.scene = scene;
        this.world = world;
        this.soundController = soundController;
        this.dustSystem = new Particle(scene);
    }

    public addCollisionListener(callback: (event: CollisionEvent) => void): void {
        this.collisionListeners.push(callback);
    }

    private emitCollisionEvent(collisionType: string): void {
        const event: CollisionEvent = {
            type: 'collision',
            collisionType: collisionType
        };

        this.collisionListeners.forEach(listener => listener(event));
    }

    public async loadModel(modelPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                modelPath,
                (gltf) => {
                    this.modelMesh = gltf.scene;
                    this.setupModelProperties();
                    this.createPhysicsBody();
                    this.setupAnimations(gltf);
                    this.addShadowsToModel();

                    resolve();
                },
                undefined,
                (error) => {
                    console.error("Error loading GLB model:", error);
                    reject(error);
                }
            );
        });
    }

    private setupModelProperties(): void {
        if (!this.modelMesh) return;

        this.modelMesh.scale.set(0.15, 0.15, 0.15);
        this.scene.add(this.modelMesh);
    }

    private setupAnimations(gltf: any): void {
        if (!this.modelMesh || gltf.animations.length === 0) return;

        this.mixer = new THREE.AnimationMixer(this.modelMesh);
        this.animationAction = this.mixer.clipAction(gltf.animations[0]);
        this.animationAction.play();
        this.animationAction.paused = true;
    }

    private addShadowsToModel(): void {
        if (!this.modelMesh) return;

        this.modelMesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    private createPhysicsBody(): void {
        if (!this.modelMesh) return;

        const shape = new CANNON.Box(new CANNON.Vec3(0.42, 0.4, 0.85));

        this.modelBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(2, 5, -2.8),
            linearDamping: 0.3,
            angularDamping: 0.3,
            collisionFilterGroup: 1,
            collisionFilterMask: -1,
        });

        const quat = new CANNON.Quaternion();
        quat.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI / 2);

        this.modelBody.quaternion.copy(quat);
        this.modelBody.addShape(shape);
        (this.modelBody as any).userData = { type: "jeep" };

        this.world.addBody(this.modelBody);

        this.modelBody.addEventListener("collide", (event: { body: CANNON.Body }) => this.handleCollision(event));
    }

    private handleCollision(event: { body: CANNON.Body }) {
        const otherBody = event.body;

        if ((otherBody as any).userData?.type === "wall") {
            this.soundController.play("big_collision");
            this.emitCollisionEvent("wall");
        }
    }

    public update(deltaTime: number, speed: number, isTurning: boolean = false): void {
        if (!this.modelMesh || !this.modelBody) return;

        if (this.animationAction) {
            if (Math.abs(speed) > 0.1) {
                this.animationAction.paused = false;
                this.animationAction.timeScale = Math.abs(speed) * 2;
            } else {
                this.animationAction.paused = true;
                this.animationAction.time = 0;
            }
        }

        this.modelMesh.position.copy(this.modelBody.position);

        const yOffset = 0.42;
        this.modelMesh.position.y -= yOffset;

        this.shakeTime += deltaTime;
        const shakeIntensity = 0.002;
        const shakeFrequency = 30;
        this.modelMesh.position.y += Math.sin(this.shakeTime * shakeFrequency) * shakeIntensity;

        if (this.mixer) {
            this.mixer.update(deltaTime);
        }

        const minSpeedForDust = 0.1;

        if (Math.abs(speed) > minSpeedForDust && isTurning) {
            const spawnPos = new THREE.Vector3()
                .copy(this.modelMesh.position)

            this.dustSystem.spawn(spawnPos);
        }

        this.dustSystem.update(deltaTime);
    }

    public getPhysicsBody(): CANNON.Body | null {
        return this.modelBody;
    }

    public getMesh(): THREE.Group | null {
        return this.modelMesh;
    }
}
