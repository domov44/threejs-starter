import * as THREE from 'three';

export class Floor {
    object: THREE.Mesh;

    constructor() {
        const geometry = new THREE.PlaneGeometry(5, 2000);
        const material = new THREE.MeshToonMaterial({ color: 0xffff00, side: THREE.DoubleSide });
        this.object = new THREE.Mesh(geometry, material);
        this.object.position.set(0, 0, 0);
        this.object.rotation.x = -Math.PI / 2;
        this.object.receiveShadow = true;
    }

    addToScene(scene: THREE.Scene) {
        scene.add(this.object);
    }
}