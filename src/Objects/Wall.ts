import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CannonDebug } from '../debug/CannonDebug';
import * as dat from 'dat.gui';

export class Wall {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private gui: dat.GUI;
    private wallParams: { [key: string]: any } = {};

    constructor(scene: THREE.Scene, world: CANNON.World) {
        this.scene = scene;
        this.world = world;
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
        wallFolder.add(this.wallParams[wallId], 'positionX', -50, 50).onChange((value) => {
            body.position.x = value;
        });
        wallFolder.add(this.wallParams[wallId], 'positionY', -50, 50).onChange((value) => {
            body.position.y = value;
        });
        wallFolder.add(this.wallParams[wallId], 'positionZ', -50, 50).onChange((value) => {
            body.position.z = value;
        });
    
        wallFolder.add(this.wallParams[wallId], 'width', 0.1, 50).onChange((value) => {
            shape.halfExtents.set(value / 2, shape.halfExtents.y, shape.halfExtents.z);
        });
    
        wallFolder.add(this.wallParams[wallId], 'height', 0.1, 50).onChange((value) => {
            shape.halfExtents.set(shape.halfExtents.x, value / 2, shape.halfExtents.z);
        });
    
        wallFolder.add(this.wallParams[wallId], 'depth', 0.1, 50).onChange((value) => {
            shape.halfExtents.set(shape.halfExtents.x, shape.halfExtents.y, value / 2);
        });
    
        wallFolder.open();
    
        return {
            body: body,
        };
    }
    
}
