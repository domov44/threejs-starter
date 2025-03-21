import { GUI } from 'dat.gui';
import { Cube } from '../Objects/Cube';
import { Sphere } from '../Objects/Sphere';
import { Camera } from 'three';
import { Torus } from '../Objects/Torus';

class GUIController {
    private gui: GUI;

    constructor() {
        this.gui = new GUI();
    }

    addCubeControls(cube: Cube) {
        const cubeFolder = this.gui.addFolder('Cube');
        cubeFolder.add(cube.object.rotation, 'x', 0, Math.PI * 2);
        cubeFolder.add(cube.object.rotation, 'y', 0, Math.PI * 2);
        cubeFolder.add(cube.object.rotation, 'z', 0, Math.PI * 2);
        cubeFolder.open();
    }

    addSphereControls(sphere: Sphere) {
        const sphereFolder = this.gui.addFolder('Sphere');
        sphereFolder.add(sphere.object.rotation, 'x', 0, Math.PI * 2);
        sphereFolder.add(sphere.object.rotation, 'y', 0, Math.PI * 2);
        sphereFolder.add(sphere.object.rotation, 'z', 0, Math.PI * 2);
        sphereFolder.open();
    }

    addTorusControls(torus: Torus) {
        const torusFolder = this.gui.addFolder('Torus');
        torusFolder.add(torus.object.rotation, 'x', 0, Math.PI * 2);
        torusFolder.add(torus.object.rotation, 'y', 0, Math.PI * 2);
        torusFolder.add(torus.object.rotation, 'z', 0, Math.PI * 2);
        torusFolder.open();
    }

    addCameraControls(camera: Camera) {
        const cameraFolder = this.gui.addFolder('Camera');
        cameraFolder.add(camera.position, 'z', 0, 10);
        cameraFolder.open();
    }
}

export { GUIController };
