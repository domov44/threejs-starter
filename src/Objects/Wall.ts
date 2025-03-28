import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CannonDebug } from '../debug/CannonDebug';
import * as dat from 'dat.gui';

export class Wall {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private debugger: CannonDebug;
    private gui: dat.GUI;
    private wallParams: { [key: string]: any } = {};

    constructor(scene: THREE.Scene, world: CANNON.World, debuggerEnabled: boolean) {
        this.scene = scene;
        this.world = world;

        this.debugger = new CannonDebug(scene, world, debuggerEnabled);
        this.gui = new dat.GUI();
    }

    addWall(x: number = 2, y: number = 0, z: number = 8, width: number = 2, height: number = 3, depth: number = 10) {
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(x, y, z),
            material: new CANNON.Material({
                friction: 0.5,
                restitution: 0.3
            })
        });
        body.addShape(shape);
        this.world.addBody(body);

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        this.scene.add(mesh);


        const wallId = `${x}-${y}-${z}`;
        this.wallParams[wallId] = {
            positionX: x,
            positionY: y,
            positionZ: z,
            width: width,
            height: height,
            depth: depth,
        };

        const wallFolder = this.gui.addFolder(`Wall at (${x}, ${y}, ${z})`);
        wallFolder.add(this.wallParams[wallId], 'positionX', -10, 10).onChange((value) => {
            mesh.position.x = value;
            body.position.x = value;
        });
        wallFolder.add(this.wallParams[wallId], 'positionY', -10, 10).onChange((value) => {
            mesh.position.y = value;
            body.position.y = value;
        });
        wallFolder.add(this.wallParams[wallId], 'positionZ', -10, 10).onChange((value) => {
            mesh.position.z = value;
            body.position.z = value;
        });

        wallFolder.add(this.wallParams[wallId], 'width', 1, 10).onChange((value) => {
            const newGeometry = new THREE.BoxGeometry(value, mesh.geometry.parameters.height, mesh.geometry.parameters.depth);
            mesh.geometry.dispose();
            mesh.geometry = newGeometry;

            shape.halfExtents.set(value / 2, shape.halfExtents.y, shape.halfExtents.z);
        });

        wallFolder.add(this.wallParams[wallId], 'height', 1, 10).onChange((value) => {
            const newGeometry = new THREE.BoxGeometry(mesh.geometry.parameters.width, value, mesh.geometry.parameters.depth);
            mesh.geometry.dispose();
            mesh.geometry = newGeometry;

            shape.halfExtents.set(shape.halfExtents.x, value / 2, shape.halfExtents.z);
        });

        wallFolder.add(this.wallParams[wallId], 'depth', 1, 30).onChange((value) => {
            const newGeometry = new THREE.BoxGeometry(mesh.geometry.parameters.width, mesh.geometry.parameters.height, value);
            mesh.geometry.dispose();
            mesh.geometry = newGeometry;

            shape.halfExtents.set(shape.halfExtents.x, shape.halfExtents.y, value / 2);
        });

        wallFolder.open();

        return {
            body: body,
            mesh: mesh,
        };
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.world.step(1 / 60);
        this.debugger.update();
    }
}
