import { App } from './App';

let appInstance: App | null = null;

document.getElementById('startButton')?.addEventListener('click', () => {
    if (!appInstance) {
        appInstance = new App();
        appInstance.initialize();
    }
    appInstance.start();
});
