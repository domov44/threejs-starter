import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SoundController } from '../controls/SoundController';

export class Coin {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private loader: GLTFLoader;
    private coinModel: THREE.Object3D | null = null;
    private onCoinCollected: () => void;
    private coinBody: CANNON.Body | null = null;
    private collected: boolean = false;
    private soundController: SoundController;

    private rotationSpeed: number = 2;
    private floatAmplitude: number = 0.1;
    private floatSpeed: number = 1.5;
    private initialY: number = 0;
    private elapsedTime: number = 0;

    constructor(scene: THREE.Scene, world: CANNON.World, onCoinCollected: () => void, soundController: SoundController) {
        this.scene = scene;
        this.world = world;
        this.loader = new GLTFLoader();
        this.onCoinCollected = onCoinCollected;
        this.soundController = soundController;
    }

    public addCoin(x: number, y: number, z: number, size: number = 0.5): void {
        this.initialY = y;

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

            this.coinModel.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    if (mesh.material instanceof THREE.MeshStandardMaterial) {
                        mesh.material.metalness = 1.0;
                        mesh.material.roughness = 0.2;
                        mesh.material.emissive = new THREE.Color(0x222200);
                        mesh.material.envMapIntensity = 1.5;
                    }
                }
            });

            this.scene.add(this.coinModel);

            const clock = new THREE.Clock();
            const updateCoin = () => {
                if (this.coinModel && this.coinBody && !this.collected) {
                    const deltaTime = clock.getDelta();
                    this.elapsedTime += deltaTime;
                    this.coinModel.rotation.y += this.rotationSpeed * deltaTime;
                    const floatOffset = Math.sin(this.elapsedTime * this.floatSpeed) * this.floatAmplitude;

                    this.coinModel.position.set(
                        this.coinBody.position.x,
                        this.coinBody.position.y + floatOffset,
                        this.coinBody.position.z
                    );
                    requestAnimationFrame(updateCoin);
                }
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
            if (distance < 1 && !this.collected) {
                this.collected = true;
                console.log("Pièce ramassée : " + coinBody.position);
                
                this.soundController.stop("coin-collected");
                this.soundController.play("coin-collected");
                
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