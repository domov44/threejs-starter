import { onAuthStateChanged } from "firebase/auth";
import { getCurrentUserData, login, register } from "./auth";
import { auth } from "./firebase";

export class AuthManager {
    authSection: HTMLElement | null;
    constructor(authSection: HTMLElement | null) {
        this.authSection = authSection;
    }

    init() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userData = await getCurrentUserData();
                console.log(userData);
                this.authSection!.innerHTML = `Logged in as ${userData.username}`;
            } else {
                this.authSection!.innerHTML = `<button id="signInButton" class="button __primary">Sign In / Sign Up</button>`;
                document.getElementById('signInButton')?.addEventListener('click', () => {
                    this.createAuthModal();
                });
            }
        });
    }

    createAuthModal() {
        const existingModal = document.getElementById('authModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.classList.add('modal');
        modal.style.display = 'block';

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close-btn');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        const authTabs = this.createAuthTabs();

        const authForm = document.createElement('div');
        authForm.id = 'authForm';

        const signInForm = this.createSignInForm();
        const signUpForm = this.createSignUpForm();

        authForm.appendChild(signInForm);
        authForm.appendChild(signUpForm);

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(authTabs);
        modalContent.appendChild(authForm);

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    createAuthTabs() {
        const authTabs = document.createElement('div');
        authTabs.id = 'authTabs';
        authTabs.classList.add('auth-tabs');

        const signInTab = document.createElement('button');
        signInTab.id = 'signInTab';
        signInTab.classList.add('tab', 'active');
        signInTab.textContent = 'Sign In';

        const signUpTab = document.createElement('button');
        signUpTab.id = 'signUpTab';
        signUpTab.classList.add('tab');
        signUpTab.textContent = 'Sign Up';

        signInTab.addEventListener('click', () => this.showSignInForm());
        signUpTab.addEventListener('click', () => this.showSignUpForm());

        authTabs.appendChild(signInTab);
        authTabs.appendChild(signUpTab);

        return authTabs;
    }

    createSignInForm() {
        const signInForm = document.createElement('div');
        signInForm.id = 'signInForm';
        const signInUsername = document.createElement('input');
        signInUsername.type = 'text';
        signInUsername.id = 'signInUsername';
        signInUsername.placeholder = 'Username';
        const signInPassword = document.createElement('input');
        signInPassword.type = 'password';
        signInPassword.id = 'signInPassword';
        signInPassword.placeholder = 'Password';
        const signInSubmit = document.createElement('button');
        signInSubmit.id = 'signInSubmit';
        signInSubmit.textContent = 'Sign In';
        signInSubmit.addEventListener('click', () => this.handleSignIn());

        signInForm.appendChild(signInUsername);
        signInForm.appendChild(signInPassword);
        signInForm.appendChild(signInSubmit);

        return signInForm;
    }

    createSignUpForm() {
        const signUpForm = document.createElement('div');
        signUpForm.id = 'signUpForm';
        signUpForm.style.display = 'none';
        const signUpUsername = document.createElement('input');
        signUpUsername.type = 'text';
        signUpUsername.id = 'signUpUsername';
        signUpUsername.placeholder = 'Username';
        const signUpPassword = document.createElement('input');
        signUpPassword.type = 'password';
        signUpPassword.id = 'signUpPassword';
        signUpPassword.placeholder = 'Password';
        const signUpSubmit = document.createElement('button');
        signUpSubmit.id = 'signUpSubmit';
        signUpSubmit.textContent = 'Sign Up';
        signUpSubmit.addEventListener('click', () => this.handleSignUp());

        signUpForm.appendChild(signUpUsername);
        signUpForm.appendChild(signUpPassword);
        signUpForm.appendChild(signUpSubmit);

        return signUpForm;
    }

    showSignInForm() {
        document.getElementById('signInForm')!.style.display = 'block';
        document.getElementById('signUpForm')!.style.display = 'none';
        document.getElementById('signInTab')!.classList.add('active');
        document.getElementById('signUpTab')!.classList.remove('active');
    }

    showSignUpForm() {
        document.getElementById('signUpForm')!.style.display = 'block';
        document.getElementById('signInForm')!.style.display = 'none';
        document.getElementById('signUpTab')!.classList.add('active');
        document.getElementById('signInTab')!.classList.remove('active');
    }

    async handleSignIn() {
        const username = (document.getElementById('signInUsername') as HTMLInputElement).value;
        const password = (document.getElementById('signInPassword') as HTMLInputElement).value;

        try {
            await login(username, password);
            alert('Connexion réussie!');
            document.getElementById('authModal')!.style.display = 'none';
        } catch (error) {
            console.error(error);
            alert('Erreur de connexion!');
        }
    }

    async handleSignUp() {
        const username = (document.getElementById('signUpUsername') as HTMLInputElement).value;
        const password = (document.getElementById('signUpPassword') as HTMLInputElement).value;

        try {
            await register(username, password);
            alert('Inscription réussie!');
            document.getElementById('authModal')!.style.display = 'none';
        } catch (error) {
            console.error(error);
            alert('Erreur d\'inscription!');
        }
    }
}
