import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';

export class Map {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private mapMesh: THREE.Group | null = null;
    private mapBody: CANNON.Body | null = null;

    constructor(scene: THREE.Scene, world: CANNON.World) {
        this.scene = scene;
        this.world = world;
    }

    public async loadMap(mapPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                mapPath,
                (gltf) => {
                    this.mapMesh = gltf.scene;
                    this.setupMapProperties();
                    this.createPhysicsBody();
                    resolve();
                },
                undefined,
                (error) => {
                    console.error("Erreur lors du chargement de la map:", error);
                    reject(error);
                }
            );
        });
    }

    private setupMapProperties(): void {
        if (!this.mapMesh) return;

        const scaleFactor = 0.4;
        this.mapMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

        this.mapMesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.scene.add(this.mapMesh);
    }

    private createPhysicsBody(): void {
        if (!this.mapMesh) return;

        const scaleFactor = 0.1;
        const shape = new CANNON.Box(new CANNON.Vec3(10 * scaleFactor, 1 * scaleFactor, 10 * scaleFactor));

        this.mapBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, 0, 0),
        });

        this.mapBody.addShape(shape);
        this.world.addBody(this.mapBody);
    }

    public getPhysicsBody(): CANNON.Body | null {
        return this.mapBody;
    }

    public getMesh(): THREE.Group | null {
        return this.mapMesh;
    }
}
