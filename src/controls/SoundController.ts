import * as THREE from 'three';

export class SoundController {
    private listener: THREE.AudioListener;
    private sounds: Map<string, THREE.Audio>;
    private audioLoader: THREE.AudioLoader;

    constructor() {
        this.listener = new THREE.AudioListener();
        this.sounds = new Map<string, THREE.Audio>();
        this.audioLoader = new THREE.AudioLoader();
    }

    public getListener(): THREE.AudioListener {
        return this.listener;
    }

    public attachListener(camera: THREE.Camera): void {
        camera.add(this.listener);
    }

    public loadSound(name: string, path: string, options: { loop?: boolean, volume?: number } = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            const sound = new THREE.Audio(this.listener);
            
            this.audioLoader.load(
                path,
                (buffer) => {
                    sound.setBuffer(buffer);
                    sound.setLoop(options.loop || false);
                    sound.setVolume(options.volume !== undefined ? options.volume : 1.0);
                    this.sounds.set(name, sound);
                    resolve();
                },
                undefined,
                (error) => {
                    console.error(`Error loading sound: ${path}`, error);
                    reject(error);
                }
            );
        });
    }

    public play(name: string): void {
        const sound = this.sounds.get(name);
        if (sound && !sound.isPlaying) {
            sound.play();
        }
    }

    public stop(name: string): void {
        const sound = this.sounds.get(name);
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    public setVolume(name: string, volume: number): void {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.setVolume(Math.max(0, Math.min(1, volume)));
        }
    }

    public setPlaybackRate(name: string, rate: number): void {
        const sound = this.sounds.get(name);
        if (sound) {
            sound.setPlaybackRate(rate);
        }
    }

    public getSound(name: string): THREE.Audio | undefined {
        return this.sounds.get(name);
    }
}