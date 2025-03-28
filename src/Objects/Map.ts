import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as CANNON from 'cannon-es';

export class Map {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private mapMesh: THREE.Group | null = null;

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

    public getMesh(): THREE.Group | null {
        return this.mapMesh;
    }

    public getPhysicsWorld(): CANNON.World {
        return this.world;
    }
}
