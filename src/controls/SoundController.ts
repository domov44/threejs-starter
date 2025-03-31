import * as THREE from 'three';

export class SoundController {
    private listener: THREE.AudioListener;
    private sounds: Map<string, THREE.Audio>;
    private audioLoader: THREE.AudioLoader;
    private muted: boolean = false;
    private volumes: Map<string, number>;

    constructor() {
        this.listener = new THREE.AudioListener();
        this.sounds = new Map<string, THREE.Audio>();
        this.volumes = new Map<string, number>();
        this.audioLoader = new THREE.AudioLoader();
        this.setupMuteControl();
    }

    private setupMuteControl(): void {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'm') {
                this.toggleMute();
            }
        });
    }

    public toggleMute(): void {
        this.muted = !this.muted;

        this.sounds.forEach((sound, name) => {
            if (this.muted) {
                this.volumes.set(name, sound.getVolume());
                sound.setVolume(0);
            } else {
                const previousVolume = this.volumes.get(name) || 1.0;
                sound.setVolume(previousVolume);
            }
        });
    }

    public isMuted(): boolean {
        return this.muted;
    }

    public stopAllSounds(): void {
        this.sounds.forEach((sound) => {
            if (sound.isPlaying) {
                sound.stop();
            }
        });
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

                    const initialVolume = options.volume !== undefined ? options.volume : 1.0;
                    this.volumes.set(name, initialVolume);

                    sound.setVolume(this.muted ? 0 : initialVolume);

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
            this.volumes.set(name, volume);

            if (!this.muted) {
                sound.setVolume(Math.max(0, Math.min(1, volume)));
            }
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