export class ModalManager {
    private modal: HTMLElement | null;
    private steps: NodeListOf<HTMLElement>;
    private nextBtn: HTMLButtonElement | null;
    private prevBtn: HTMLButtonElement | null;
    private currentStep: number;

    constructor(modalId: string, nextBtnId: string, prevBtnId: string) {
        this.modal = document.getElementById(modalId);
        this.steps = document.querySelectorAll<HTMLElement>('.step');
        this.nextBtn = document.getElementById(nextBtnId) as HTMLButtonElement | null;
        this.prevBtn = document.getElementById(prevBtnId) as HTMLButtonElement | null;
        this.currentStep = 0;

        this.initializeEvents();
    }

    public open() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.currentStep = 0;
            this.showStep(this.currentStep);
        }
    }

    private showStep(index: number) {
        this.steps.forEach((step, i) => {
            step.classList.remove('active');
            step.style.display = i === index ? 'block' : 'none';
        });
        this.steps[index].classList.add('active');

        if (this.prevBtn) this.prevBtn.disabled = index === 0;
        if (this.nextBtn) this.nextBtn.disabled = index === this.steps.length - 1;
    }

    private initializeEvents() {
        const closeBtn = document.getElementById('closeModal');

        closeBtn?.addEventListener('click', () => {
            this.modal?.classList.add('hidden');
        });

        this.nextBtn?.addEventListener('click', () => {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.showStep(this.currentStep);
            }
        });

        this.prevBtn?.addEventListener('click', () => {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.showStep(this.currentStep);
            }
        });
    }
}