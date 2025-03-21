import * as THREE from 'three';

export class Cube {
    object: THREE.Mesh;

    constructor() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshToonMaterial({ color: 0x00ff00 });
        this.object = new THREE.Mesh(geometry, material);
        this.object.castShadow = true;
    }

    setPosition(x: number = 1, y: number = 1, z: number = 1) {
        this.object.position.set(x, y, z);
    }

    addToScene(scene: THREE.Scene) {
        scene.add(this.object);
    }

    rotate(x: number, y: number, z: number) {
        this.object.rotation.x += x;
        this.object.rotation.y += y;
        this.object.rotation.z += z;
    }
}
