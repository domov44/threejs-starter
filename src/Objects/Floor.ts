import * as CANNON from 'cannon-es';

export class Floor {
    physicsBody: CANNON.Body;

    constructor() {
        const shape = new CANNON.Plane();

        this.physicsBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
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
