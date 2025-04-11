import * as THREE from 'three';

export class Particle {
    private scene: THREE.Scene;
    private particles: THREE.Sprite[] = [];
    private textures: THREE.Texture[] = [];
    private texturePaths: string[] = [
        './assets/smokes/smoke_01.avif',
        './assets/smokes/smoke_02.avif',
        './assets/smokes/smoke_03.avif',
        './assets/smokes/smoke_04.avif',
        './assets/smokes/smoke_05.avif',
        './assets/smokes/smoke_06.avif',
        './assets/smokes/smoke_07.avif',
        './assets/smokes/smoke_08.avif',
    ];
    private maxParticles = 30;
    private timer = 0;
    private spawnInterval = 0.2;

    constructor(scene: THREE.Scene) {
        this.scene = scene;

        const loader = new THREE.TextureLoader();
        this.textures = this.texturePaths.map(path => loader.load(path));
    }

    spawn(position: THREE.Vector3, direction: THREE.Vector3) {
        if (this.particles.length >= this.maxParticles) return;

        const randomTexture = this.textures[Math.floor(Math.random() * this.textures.length)];

        const spriteMaterial = new THREE.SpriteMaterial({
            map: randomTexture,
            transparent: true,
            opacity: 1.0,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(spriteMaterial);

        const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

        const isRight = Math.random() > 0.5;
        const offsetAmount = (Math.random() * 0.2 + 0.3) * (isRight ? 1 : -1);

        const finalPos = new THREE.Vector3().copy(position)
            .add(right.multiplyScalar(offsetAmount))
            .add(new THREE.Vector3(0, 0.1, (Math.random() - 0.5) * 0.3));

        sprite.position.copy(finalPos);
        (sprite as any).life = 1.0;

        this.scene.add(sprite);
        this.particles.push(sprite);
    }

    update(deltaTime: number) {
        this.timer += deltaTime;

        if (this.timer >= this.spawnInterval) {
            this.timer = 0;

            const targetPosition = new THREE.Vector3(5, 1, 10);
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0.5,
                (Math.random() - 0.5) * 2
            );
            const dummyDirection = new THREE.Vector3(0, 0, 1);
            this.spawn(targetPosition.add(offset), dummyDirection);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            (p as any).life -= deltaTime;

            const scaleFactor = Math.max((p as any).life, 0);
            p.scale.set(scaleFactor * 0.2, scaleFactor * 0.2, scaleFactor * 0.2);

            p.position.y += deltaTime * 0.2;

            if ((p as any).life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }
    }
}
