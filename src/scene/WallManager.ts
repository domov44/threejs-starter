import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Wall } from '../Objects/Wall';

export class WallsManager {
    private wallLoader: Wall;
    private wallsData: number[][];

    constructor(scene: THREE.Scene, world: CANNON.World) {
        this.wallLoader = new Wall(scene, world);
        this.wallsData = [];
        this.initializeWallsData();
    }

    private initializeWallsData(): void {
        this.wallsData = [
            // Orange shop walls
            [10.03, 0.6, -18, 1.3, 1.2, 2.3],

            // Secondary orange shop walls
            [2, 0.5, 8.2, 3.5, 1, 15.1],
            [6.9, 0.5, 10, 6.3, 1, 11.2],
            [11.65, 0.6, 12.4, 0.2, 1.1, 2.8],
            [9.7, 0.6, -14, 1.3, 1.2, 2.2],
            [4.7, 2.2, -16, 4.2, 4.4, 4.4],

            // Large wall in front of the shop
            [6.5, 1.5, -8, 8.8, 3, 5.7],

            // School and school walls
            [-6, 1.5, 13.5, 4, 3, 3.1],
            [-10.1, 0.9, 13.6, 3, 1.8, 2],
            [-13.6, 0.9, 13.72, 3.95, 1.8, 2.7],
            [-10, 0.9, 6.32, 12.05, 1.8, 3.4],
            [-10, 0.9, 3.3, 3.5, 1.8, 2.4],
            [-6.25, 0.4, 0.09, 2.85, 0.8, 0.2],
            [-4.4, 0.9, 2.3, 0.8, 1.8, 4.6],
            [-13.75, 0.4, 0.09, 2.85, 0.8, 0.2],
            [-15.6, 0.9, 2.3, 0.8, 1.8, 4.6],

            // Small bush walls
            [9.85, 0.4, -4.55, 0.8, 0.8, 0.5],
            [6.95, 0.4, -4.55, 0.8, 0.8, 0.5],
            [4.15, 0.4, -4.55, 0.8, 0.8, 0.5],

            // Simple bush walls
            [8.52, 0.4, -4.55, 0.4, 0.8, 0.5],
            [5.65, 0.4, -4.55, 0.4, 0.8, 0.5],
            [2.85, 0.4, -4.55, 0.4, 0.8, 0.5],

            // Blue shop walls
            [-6.85, 0.6, -17.55, 1.3, 1.2, 1.65],
            [-7.05, 0.6, -18.82, 0.9, 1.2, 0.9],

            // Blue shop double bush walls
            [-6, 0.21, -17.05, 0.15, 0.4, 0.4],
            [-6, 0.21, -17.5, 0.15, 0.4, 0.4],
            [-4.8, 0.4, -16.8, 0.9, 0.8, 0.5],

            // Cinema walls
            [-6.2, 0.8, -14, 3, 1.5, 3.6],

            // Blue building walls
            [-10.85, 0.8, -14.05, 6.2, 1.5, 4.1],
            [-7.8, 0.6, -18, 0.7, 1.2, 4],

            // Blue building wall
            [-15.95, 0.3, -16, 0.2, 0.6, 8],
            [-14.9, 0.3, -12.1, 1.9, 0.6, 0.2],

            // Black trash wall
            [11.4, 0.3, -9.9, 0.7, 0.6, 1.1],

            // Orange trash wall
            [-14.4, 0.3, -13.55, 0.7, 0.6, 1.1],

            // Second double bush walls
            [9.85, 0.4, -11.4, 0.8, 0.8, 0.5],
            [6.95, 0.4, -11.4, 0.8, 0.8, 0.5],
            [4.15, 0.4, -11.4, 0.8, 0.8, 0.5],

            // Second simple bush walls
            [8.52, 0.4, -11.4, 0.4, 0.8, 0.5],
            [5.65, 0.4, -11.4, 0.4, 0.8, 0.5],
            [2.85, 0.4, -11.4, 0.4, 0.8, 0.5],

            // Garden door walls
            [-15.8, 0.6, -8, 0.2, 1.2, 2.45],
            [-4.3, 0.6, -8, 0.2, 1.2, 2.45],

            // Stone walls
            [-5.9, 0.4, -5.3, 1.4, 0.8, 1.1],
            [-14, 0.4, -5.6, 2.2, 0.8, 1.9]
        ];
    }

    public loadWalls(): void {
        this.wallsData.forEach(wallData =>
            this.wallLoader.addWall(...wallData)
        );
    }
}