import * as THREE from 'three';

export class Particle {
    private scene: THREE.Scene;
    private particles: THREE.Sprite[] = [];
    private texture: THREE.Texture;
    private maxParticles = 30;
    private timer = 0;
    private spawnInterval = 0.2;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.texture = new THREE.TextureLoader().load('./assets/dust.avif');
    }

    spawn(position: THREE.Vector3) {
        if (this.particles.length >= this.maxParticles) {
            return;
        }

        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.texture,
            transparent: true,
            opacity: 1.0,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.2, 0.2, 0.2);

        const isRight = Math.random() > 0.5;
        const offsetX = isRight
            ? (Math.random() * 0.3 + 0.3)
            : -(Math.random() * 0.3 + 0.3);


        sprite.position.copy(position).add(new THREE.Vector3(
            offsetX,
            0.1,
            (Math.random() - 0.5) * 0.3
        ));

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

            this.spawn(targetPosition.add(offset));
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
