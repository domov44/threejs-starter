import { App } from './App';
import { AuthManager } from './auth/AuthManager';

let appInstance: App | null = null;

window.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('authSection');

    if (authSection) {
        const authManager = new AuthManager(authSection);
        authManager.init();
    }

    document.getElementById('startButton')?.addEventListener('click', () => {
        if (!appInstance) {
            appInstance = new App();
            appInstance.initialize();
        }
        appInstance.start();
    });
});
