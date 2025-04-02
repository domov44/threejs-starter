import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Coin } from '../Objects/Coin';
import { SoundController } from '../controls/SoundController';

export class CoinsManager {
    private coinsData: [number, number, number, number][];
    private coins: Coin[] = [];
    private soundController: SoundController;

    constructor(private scene: THREE.Scene, private world: CANNON.World, private onCoinCollected: () => void, soundController: SoundController) {
        this.coinsData = [
            [-18, 0.5, 16, 0.5],
            [-18, 0.5, 12, 0.5],
            [-18, 0.5, 8, 0.5],
            [-18, 0.5, 4, 0.5],
            [-18, 0.5, 0, 0.5],
            [-18, 0.5, -4, 0.5],
            [-18, 0.5, -8, 0.5],
            [-18, 0.5, -12, 0.5],
            [-18, 0.5, -16, 0.5],

            [-18, 0.5, -20, 0.5],
            [-14, 0.5, -22, 0.5],
            [-10, 0.5, -22, 0.5],
            [-6, 0.5, -22, 0.5],
            [-2, 0.5, -22, 0.5],
            [2, 0.5, -22, 0.5],
            [6, 0.5, -22, 0.5],
            [10, 0.5, -22, 0.5],

            [14, 0.5, -20, 0.5],
            [14, 0.5, -16, 0.5],
            [14, 0.5, -12, 0.5],
            [14, 0.5, -8, 0.5],
            [14, 0.5, -4, 0.5],
            [14, 0.5, 0, 0.5],
            [14, 0.5, 4, 0.5],
            [14, 0.5, 8, 0.5],
            [14, 0.5, 12, 0.5],
            [14, 0.5, 16, 0.5],

            [12, 0.5, 18, 0.5],
            [8, 0.5, 18, 0.5],
            [4, 0.5, 18, 0.5],
            [0, 0.5, 18, 0.5],
            [-4, 0.5, 18, 0.5],
            [-8, 0.5, 18, 0.5],
            [-12, 0.5, 18, 0.5],
            [-16, 0.5, 18, 0.5],

            [-16, 0.5, -2, 0.5],
            [-12, 0.5, -2, 0.5],
            [-8, 0.5, -2, 0.5],
            [-4, 0.5, -2, 0.5],

            // school
            [-10, 0.5, 1, 0.5],
            [-13, 0.5, 1, 0.5],
            [-7, 0.5, 1, 0.5],

            [4, 0.5, -2, 0.5],
            [8, 0.5, -2, 0.5],
            [12, 0.5, -2, 0.5],

            [6.25, 0.5, 2.75, 0.5],
            [8.75, 0.5, 2.75, 0.5],

            [-2, 0.5, -2, 0.5],
            [-2, 0.5, 0, 0.5],
            [-2, 0.5, 4, 0.5],
            [-2, 0.5, 8, 0.5],
            [-2, 0.5, 12, 0.5],
            [-2, 0.5, 16, 0.5],

            [-4, 0.5, 10, 0.5],
            [-8, 0.5, 10, 0.5],
            [-12, 0.5, 10, 0.5],
            [-16, 0.5, 10, 0.5],

            [-2, 0.5, -4, 0.5],
            [-2, 0.5, -8, 0.5],
            [-2, 0.5, -12, 0.5],
            [-2, 0.5, -16, 0.5],
            [-2, 0.5, -19, 0.5],

            // orange building
            [2, 0.5, -12, 0.5],
            [6, 0.5, -12, 0.5],
            [10, 0.5, -12, 0.5],

            // garden 
            [-14, 0.5, -8, 0.5],
            [-6, 0.5, -8, 0.5],
            
        ];

        this.onCoinCollected = onCoinCollected;
        this.soundController = soundController;
    }

    public loadCoins(): void {
        this.coinsData.forEach(coinData => {
            const coin = new Coin(this.scene, this.world, this.onCoinCollected, this.soundController);
            coin.addCoin(...coinData);

            this.coins.push(coin);
        });
    }

    public getCoinsCount(): number {
        return this.coinsData.length;
    }
}