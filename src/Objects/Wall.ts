import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CannonDebug  } from '../debug/CannonDebug';

export class Wall {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private debugger: CannonDebug;

    constructor(scene: THREE.Scene, world: CANNON.World, debuggerEnabled: boolean) {
        this.scene = scene;
        this.world = world;

        this.debugger = new CannonDebug(scene, world, debuggerEnabled);
    }

    wall(x: number = 2, y: number = 0, z: number = 8) {
        const shape = new CANNON.Box(new CANNON.Vec3(2, 2, 8));
        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            position: new CANNON.Vec3(x, y, z),
            material: new CANNON.Material({
                friction: 0.5,
                restitution: 0.3
            })
        });

        this.world.addBody(body);

        return {
            body: body
        };
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.world.step(1 / 60);

        this.debugger.update();
    }
}
