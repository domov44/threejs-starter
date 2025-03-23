import * as CANNON from 'cannon';

export class Floor {
    physicsBody: CANNON.Body;

    constructor() {
        const shape = new CANNON.Plane();

        this.physicsBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(0, 0, 0),
        });

        const quat = new CANNON.Quaternion();
        quat.setFromEuler(-Math.PI / 2, 0, 0);
        this.physicsBody.quaternion.set(quat.x, quat.y, quat.z, quat.w);

        this.physicsBody.addShape(shape);
    }

    addToWorld(world: CANNON.World) {
        world.addBody(this.physicsBody);
    }
}
