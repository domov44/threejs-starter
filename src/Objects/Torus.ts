import * as THREE from 'three';

export class Torus {
    object: THREE.Mesh;

    constructor() {
        const geometry = new THREE.TorusKnotGeometry(0.5, 0.10, 100, 16);
        const material = new THREE.MeshToonMaterial({ color: 0x049BEF });
        this.object = new THREE.Mesh(geometry, material);
    }

    setPosition(x: number = 1, y: number = 1, z: number = 1) {
        this.object.position.set(x, y, z);
    }

    addToScene(scene: THREE.Scene) {
        scene.add(this.object);
    }
}
