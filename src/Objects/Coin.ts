import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Coin {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private gui: dat.GUI | null = null;
    private loader: GLTFLoader;
    private coinModel: THREE.Object3D | null = null;
    private onCoinCollected: () => void;
    private coinBody: CANNON.Body | null = null;
    private collected: boolean = false;

    constructor(scene: THREE.Scene, world: CANNON.World, onCoinCollected: () => void) {
        this.scene = scene;
        this.world = world;
        this.loader = new GLTFLoader();
        this.onCoinCollected = onCoinCollected;

        if (import.meta.env.VITE_GUI_ENABLED === 'true') {
            this.gui = new dat.GUI();
        }
    }

    public addCoin(x: number, y: number, z: number, size: number = 0.5): void {
        const shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
        this.coinBody = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(x, y, z),
            material: new CANNON.Material({
                friction: 0.5,
                restitution: 0.3
            }),
            collisionFilterGroup: 2,
            collisionFilterMask: 0,
        });

        this.coinBody.addShape(shape);
        (this.coinBody as any).userData = { type: "coin" };
        this.world.addBody(this.coinBody);

        this.loader.load('/assets/models/coin.glb', (gltf) => {
            this.coinModel = gltf.scene;
            this.coinModel.position.set(x, y, z);
            this.coinModel.scale.set(size * 0.3, size * 0.3, size * 0.3);
            this.scene.add(this.coinModel);

            const updateCoin = () => {
                if (this.coinModel && this.coinBody) {
                    this.coinModel.position.copy(this.coinBody.position as unknown as THREE.Vector3);
                    this.coinModel.quaternion.copy(this.coinBody.quaternion as unknown as THREE.Quaternion);
                }
                requestAnimationFrame(updateCoin);
            };
            updateCoin();
        });

        this.detectCollisionWithJeep(this.coinBody);
    }

    private detectCollisionWithJeep(coinBody: CANNON.Body): void {
        this.world.addEventListener("postStep", () => {
            const jeepBody = this.getJeepBody();
            if (!jeepBody) return;

            if (this.collected) return;

            const distance = jeepBody.position.vsub(coinBody.position).length();
            if (distance < 1.2 && !this.collected) {
                this.collected = true;
                console.log("Pièce ramassée : " + coinBody.position, "déja ramassée :" + this.collected);
                if (this.coinModel) {
                    this.scene.remove(this.coinModel);
                }
                this.world.removeBody(coinBody);
                this.onCoinCollected();
            }
        });
    }

    private getJeepBody(): CANNON.Body | null {
        return this.world.bodies.find((body) => (body as any).userData?.type === "jeep") || null;
    }
}