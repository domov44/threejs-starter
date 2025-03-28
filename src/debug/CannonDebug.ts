import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

export class CannonDebug {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private cannonDebugger: any;
    private enabled: boolean;

    constructor(scene: THREE.Scene, world: CANNON.World, enabled: boolean) {
        this.scene = scene;
        this.world = world;
        this.enabled = enabled;

        if (this.enabled) {
            this.cannonDebugger = new (CannonDebugger as any)(scene, world, {
                color: 0x00ff00,
                scale: 1,
            });
        }
    }

    update() {
        if (this.enabled && this.cannonDebugger) {
            this.cannonDebugger.update();
        }
    }
}
