import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Coin } from '../Objects/Coin';

export class CoinsManager {
    private coinsData: [number, number, number, number][];
    private coins: Coin[] = [];

    constructor(private scene: THREE.Scene, private world: CANNON.World, private onCoinCollected: () => void) {
        this.coinsData = [
            [13, 0.5, 2, 0.5],
            [13, 0.5, 5, 0.5],
            [13, 0.5, 8, 0.5],
        ];
    }

    public loadCoins(): void {
        this.coinsData.forEach(coinData => {
            const coin = new Coin(this.scene, this.world, this.onCoinCollected);
            coin.addCoin(...coinData);

            console.log(`Création de la coin à la position: ${coinData}`);

            this.coins.push(coin);
        });
    }
}