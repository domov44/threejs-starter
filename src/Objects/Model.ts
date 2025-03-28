import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';

export class Model {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private modelMesh: THREE.Group | null = null;
    private modelBody: CANNON.Body | null = null;
    private mixer: THREE.AnimationMixer | null = null;
    private animationAction: THREE.AnimationAction | null = null;

    constructor(scene: THREE.Scene, world: CANNON.World) {
        this.scene = scene;
        this.world = world;
    }

    public async loadModel(modelPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();

            loader.load(
                modelPath,
                (gltf) => {
                    this.modelMesh = gltf.scene;
                    this.setupModelProperties(gltf);
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

    private setupModelProperties(gltf: any): void {
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

        const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.4, 0.7));

        this.modelBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 0, 0),
        });

        this.modelBody.addShape(shape);
        this.world.addBody(this.modelBody);
    }

    public update(deltaTime: number, speed: number): void {
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
    
        const yOffset = 0.4;
        this.modelMesh.position.y -= yOffset;
        // console.log(`Model position: x: ${this.modelMesh.position.x}, y: ${this.modelMesh.position.y}, z: ${this.modelMesh.position.z}`);
    
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }
    
    public getPhysicsBody(): CANNON.Body | null {
        return this.modelBody;
    }

    public getMesh(): THREE.Group | null {
        return this.modelMesh;
    }
}
