import { onAuthStateChanged } from "firebase/auth";
import { getCurrentUserData, getLeaderboard, login, logout, register } from "./auth";
import { auth } from "./firebase";

export class AuthManager {
    authSection: HTMLElement | null;
    constructor(authSection: HTMLElement | null) {
        this.authSection = authSection;
    }

    init() {
        onAuthStateChanged(auth, async (user) => {
            this.fetchAndDisplayLeaderboard();
            if (user) {
                const userData = await getCurrentUserData();
                this.authSection!.innerHTML = `Logged in as ${userData.username}<button id="logoutButton" class="logout__button">Logout?</button>`;
                document.getElementById('logoutButton')?.addEventListener('click', () => {
                    logout();
                });

                this.authSection!.classList.add('__logged-in');
            } else {
                this.authSection!.innerHTML = `<button id="signInButton" class="button __primary">Sign In / Sign Up</button>`;
                document.getElementById('signInButton')?.addEventListener('click', () => {
                    this.createAuthModal();
                });
                this.authSection!.classList.remove('__logged-in');
            }
            this.authSection!.classList.remove('skeleton');
        });
    }

    async fetchAndDisplayLeaderboard(): Promise<void> {
        const leaderboardContainer = document.getElementById("leaderboard");

        if (!leaderboardContainer) {
            console.error("Error: The #leaderboard element does not exist in the DOM!");
            return;
        }

        const leaderboardListContainer = document.querySelector(".leaderboard-list") as HTMLUListElement;

        if (!leaderboardListContainer) {
            console.error("Error: The .leaderboard-list element does not exist in the DOM!");
            return;
        }

        if (leaderboardListContainer.querySelectorAll('.skeleton-row').length === 0) {
            return;
        }

        try {
            const leaderboard = await getLeaderboard();

            if (leaderboard.length === 0) {
                leaderboardListContainer.innerHTML = "<p>No scores available.</p>";
                return;
            }

            const leaderboardList = leaderboard
                .map((player, index) => {
                    let emoji = "";
                    let fontSize = "1rem";

                    if (index === 0) {
                        emoji = "🥇";
                        fontSize = "1.4rem";
                    } else if (index === 1) {
                        emoji = "🥈";
                        fontSize = "1.2rem";
                    } else if (index === 2) {
                        emoji = "🥉";
                        fontSize = "1rem";
                    }

                    return `
                    <li style="font-size: ${fontSize}; font-weight: bold;">
                        <span class="rank">#${index + 1} ${emoji}</span> 
                        <span class="username">${player.username}</span> 
                        <span class="score">${player.bestScore}s</span>
                    </li>
                `;
                })
                .join('');

            leaderboardListContainer.innerHTML = leaderboardList;


        } catch (error) {
            console.error("Error while retrieving the leaderboard", error);
            leaderboardListContainer.innerHTML = `<p class="error-message">⚠️ Error while loading the leaderboard.</p>`;
        }
    }

    createAuthModal() {
        const existingModal = document.getElementById('authModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.classList.add('modal');
        modal.style.display = 'flex';

        const modalContent = document.createElement('div');
        modalContent.classList.add('modal-content');

        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close-btn');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });

        const authTabs = this.createAuthTabs();
        const authTitle = this.createAuthModalTitle();

        const authForm = document.createElement('div');
        authForm.id = 'authForm';

        const signInForm = this.createSignInForm();
        const signUpForm = this.createSignUpForm();

        authForm.appendChild(signInForm);
        authForm.appendChild(signUpForm);

        modalContent.appendChild(closeBtn);
        modalContent.appendChild(authTitle);
        modalContent.appendChild(authTabs);
        modalContent.appendChild(authForm);

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    createAuthModalTitle() {
        const modalTitleWrapper = document.createElement('div');
        modalTitleWrapper.classList.add('modal-title-wrapper');

        const modalTitle = document.createElement('h2');
        modalTitle.classList.add('modal-title');
        modalTitle.textContent = 'Sign in to save your score';

        const separator = document.createElement('hr');
        separator.classList.add('modal-separator');

        modalTitleWrapper.appendChild(modalTitle);
        modalTitleWrapper.appendChild(separator);

        return modalTitleWrapper;
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
        signInForm.classList.add('form');
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
        signInSubmit.classList.add('button', '__primary', 'full-w');
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
        signUpForm.classList.add('form');
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
        const signUpConfirmPassword = document.createElement('input');
        signUpConfirmPassword.type = 'password';
        signUpConfirmPassword.id = 'signUpConfirmPassword';
        signUpConfirmPassword.placeholder = 'Confirm password';
        const signUpSubmit = document.createElement('button');
        signUpSubmit.classList.add('button', '__primary', 'full-w');
        signUpSubmit.id = 'signUpSubmit';
        signUpSubmit.textContent = 'Sign Up';
        signUpSubmit.addEventListener('click', () => this.handleSignUp());

        signUpForm.appendChild(signUpUsername);
        signUpForm.appendChild(signUpPassword);
        signUpForm.appendChild(signUpConfirmPassword);
        signUpForm.appendChild(signUpSubmit);

        return signUpForm;
    }

    showSignInForm() {
        document.getElementById('signInForm')!.style.display = 'flex';
        document.getElementById('signUpForm')!.style.display = 'none';
        document.getElementById('signInTab')!.classList.add('active');
        document.getElementById('signUpTab')!.classList.remove('active');
    }

    showSignUpForm() {
        document.getElementById('signUpForm')!.style.display = 'flex';
        document.getElementById('signInForm')!.style.display = 'none';
        document.getElementById('signUpTab')!.classList.add('active');
        document.getElementById('signInTab')!.classList.remove('active');
    }

    async handleSignIn() {
        const username = (document.getElementById('signInUsername') as HTMLInputElement).value;
        const password = (document.getElementById('signInPassword') as HTMLInputElement).value;
        const signInButton = document.getElementById('signInSubmit') as HTMLButtonElement;

        this.clearError('signInForm');

        if (!username) {
            this.showError('signInForm', 'Username is required');
            return;
        }

        if (!password) {
            this.showError('signInForm', 'Passwords is required.');
            return;
        }

        signInButton.disabled = true;
        signInButton.classList.add('loading');
        signInButton.textContent = 'Signing in...';

        try {
            await login(username, password);
            document.getElementById('authModal')!.style.display = 'none';
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                this.showError('signInForm', 'Incorrect username or password');
            } else if (error.code === 'auth/network-request-failed') {
                this.showError('signInForm', 'Error, check your network connection');
            } else if (error.code === 'auth/invalid-email') {
                this.showError('signInForm', 'Username is required');
            } else if (error.code === 'auth/missing-password') {
                this.showError('signInForm', 'Password is required');
            } else {
                this.showError('signInForm', 'Error, try again or check your connection.');
            }
        } finally {
            signInButton.disabled = false;
            signInButton.classList.remove('loading');
            signInButton.textContent = 'Sign In';
        }
    }

    async handleSignUp() {
        const username = (document.getElementById('signUpUsername') as HTMLInputElement).value;
        const password = (document.getElementById('signUpPassword') as HTMLInputElement).value;
        const confirmPassword = (document.getElementById('signUpConfirmPassword') as HTMLInputElement).value;
        const signUpButton = document.getElementById('signUpSubmit') as HTMLButtonElement;

        this.clearError('signUpForm');

        if (!username) {
            this.showError('signUpForm', 'Username is required');
            return;
        }

        if (!password) {
            this.showError('signUpForm', 'Passwords is required.');
            return;
        }

        if (!confirmPassword) {
            this.showError('signUpForm', 'You need to confirm your password.');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('signUpForm', 'Passwords do not match.');
            return;
        }

        signUpButton.disabled = true;
        signUpButton.classList.add('loading');
        signUpButton.textContent = 'Signing up...';

        try {
            await register(username, password);
            document.getElementById('authModal')!.style.display = 'none';
        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                this.showError('signUpForm', 'This username is already taken.');
            } else if (error.code === 'auth/weak-password') {
                this.showError('signUpForm', 'Password should be at least 6 characters.');
            } else if (error.message === 'Username cannot exceed 15 characters.') {
                this.showError('signUpForm', 'Username cannot exceed 15 characters.');
            } else if (error.code === 'auth/network-request-failed') {
                this.showError('signUpForm', 'Error, check your network connection');
            } else if (error.code === 'auth/invalid-email') {
                this.showError('signUpForm', 'Username is required');
            } else if (error.code === 'auth/missing-password') {
                this.showError('signUpForm', 'Password is required');
            }
            else {
                this.showError('signUpForm', 'Error, try again or check your connection.');
            }
        } finally {
            signUpButton.disabled = false;
            signUpButton.classList.remove('loading');
            signUpButton.textContent = 'Sign Up';
        }
    }

    showError(formId: string, message: string) {
        const form = document.getElementById(formId);
        if (!form) return;

        let errorDiv = form.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('error-message');
            form.insertBefore(errorDiv, form.lastElementChild);
        }

        errorDiv.textContent = message;
    }

    clearError(formId: string) {
        const form = document.getElementById(formId);
        if (!form) return;
        const errorDiv = form.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }


    async handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        }
    }
}
