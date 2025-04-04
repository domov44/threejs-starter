import { App } from './App';
import { AuthManager } from './auth/AuthManager';
import { ModalManager } from './ui/ModalManager';

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

    const howToPlayModal = new ModalManager('howToPlayModal', 'nextStep', 'prevStep');

    const howToPlayBtn = document.getElementById('howToPlayButton');
    howToPlayBtn?.addEventListener('click', () => {
        howToPlayModal.open();
    });
});
