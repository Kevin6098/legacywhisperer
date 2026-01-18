// Legacy Whisperer - Setup/Onboarding Script
// Handles the setup wizard

class SetupWizard {
    constructor() {
        this.userName = '';
        this.birthDate = null;
        this.emergencyContacts = [];
        this.lastWordsRecipients = [];
        this.lastWordsMessage = '';
        this.currentSetupStep = 1;
        this.setupRecipients = [];
        this.currentLang = localStorage.getItem('language') || 'en';
        
        this.init();
    }

    init() {
        this.loadLanguage();
        this.setupLanguageSelector();
        this.setupSetupListeners();
        this.applyTranslations();
    }

    loadLanguage() {
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            this.currentLang = savedLang;
            const select = document.getElementById('languageSelect');
            if (select) select.value = savedLang;
        }
    }

    setupLanguageSelector() {
        const select = document.getElementById('languageSelect');
        if (select) {
            select.value = this.currentLang;
            select.addEventListener('change', (e) => {
                this.currentLang = e.target.value;
                localStorage.setItem('language', this.currentLang);
                this.applyTranslations();
            });
        }
    }

    applyTranslations() {
        // Apply translations to all elements
        const elements = {
            'setupTitle': 'welcomeTo',
            'setupSubtitle': 'setupSubtitle',
            'stepText': 'step',
            'ofText': 'of',
            'step1Title': 'step1Title',
            'nameLabel': 'yourName',
            'birthDateLabel': 'yourBirthDate',
            'nextBtn1': 'next',
            'step2Title': 'step2Title',
            'step2Description': 'step2Description',
            'contactNameLabel': 'contactName',
            'phoneLabel': 'phoneNumber',
            'emailLabel': 'email',
            'backBtn2': 'back',
            'nextBtn2': 'next',
            'step3Title': 'step3Title',
            'step3Description': 'step3Description',
            'lastWordsLabel': 'yourLastWords',
            'autoSentInfo': 'autoSentMessage',
            'addRecipientsLabel': 'addRecipients',
            'addRecipientBtnText': 'addRecipient',
            'backBtn3': 'back',
            'completeBtn': 'completeSetup',
            'addRecipientTitle': 'addLastWordsRecipient',
            'addBtnText': 'add',
            'cancelBtnText': 'cancel'
        };

        for (const [elementId, translationKey] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = t(translationKey, this.currentLang);
            }
        }

        // Update placeholders
        const nameInput = document.getElementById('setupName');
        if (nameInput) nameInput.placeholder = t('enterFullName', this.currentLang);
        
        const phoneInput = document.getElementById('setupContactPhone');
        if (phoneInput) phoneInput.placeholder = t('examplePhone', this.currentLang);
    }

    setupSetupListeners() {
        // Step 1 form
        document.getElementById('setupForm1').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('setupName').value.trim();
            const birthDate = document.getElementById('setupBirthDate').value;
            
            if (!name || !birthDate) {
                alert(t('pleaseFillAllFields', this.currentLang));
                return;
            }
            
            this.userName = name;
            // Create date and set to start of day (midnight) for accurate calculation
            this.birthDate = new Date(birthDate + 'T00:00:00');
            this.birthDate.setHours(0, 0, 0, 0);
            this.goToStep(2);
        });

        // Step 2 form
        document.getElementById('setupForm2').addEventListener('submit', (e) => {
            e.preventDefault();
            const contactName = document.getElementById('setupContactName').value.trim();
            const contactPhone = document.getElementById('setupContactPhone').value.trim();
            const contactEmail = document.getElementById('setupContactEmail').value.trim();
            
            if (!contactName || !contactPhone) {
                alert(t('pleaseFillNamePhone', this.currentLang));
                return;
            }
            
            this.emergencyContacts.push({
                id: Date.now().toString(),
                name: contactName,
                phone: contactPhone,
                email: contactEmail
            });
            
            this.goToStep(3);
        });

        // Step 3 form
        document.getElementById('setupForm3').addEventListener('submit', (e) => {
            e.preventDefault();
            const lastWords = document.getElementById('setupLastWords').value.trim();
            
            if (!lastWords) {
                alert(t('pleaseEnterLastWords', this.currentLang));
                return;
            }
            
            this.lastWordsMessage = lastWords;
            this.lastWordsRecipients = [...this.setupRecipients];
            this.completeSetup();
        });

        // Back buttons
        document.getElementById('backStep2').addEventListener('click', () => {
            this.goToStep(1);
        });

        document.getElementById('backStep3').addEventListener('click', () => {
            this.goToStep(2);
        });

        // Add recipient in setup
        document.getElementById('addSetupRecipientBtn').addEventListener('click', () => {
            document.getElementById('setupRecipientModal').classList.add('show');
        });

        // Setup recipient form
        document.getElementById('setupRecipientForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('setupRecipientName').value.trim();
            const phone = document.getElementById('setupRecipientPhone').value.trim();
            const email = document.getElementById('setupRecipientEmail').value.trim();
            
            if (!name || !email) {
                alert(t('pleaseFillNameEmail', this.currentLang));
                return;
            }
            
            const recipient = {
                id: Date.now().toString(),
                name,
                phone,
                email
            };
            
            this.setupRecipients.push(recipient);
            this.renderSetupRecipients();
            document.getElementById('setupRecipientModal').classList.remove('show');
            document.getElementById('setupRecipientForm').reset();
        });

        // Close setup recipient modal
        document.getElementById('cancelSetupRecipientBtn').addEventListener('click', () => {
            document.getElementById('setupRecipientModal').classList.remove('show');
            document.getElementById('setupRecipientForm').reset();
        });

        // Close modal on X click
        document.querySelectorAll('#setupRecipientModal .close').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('setupRecipientModal').classList.remove('show');
            });
        });
    }

    goToStep(step) {
        // Hide all steps
        document.querySelectorAll('.setup-step').forEach(s => s.classList.remove('active'));
        
        // Show current step
        document.getElementById(`step${step}`).classList.add('active');
        this.currentSetupStep = step;
        
        // Update progress bar
        const progress = (step / 3) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('currentStep').textContent = step;
    }

    renderSetupRecipients() {
        const container = document.getElementById('setupRecipientsList');
        if (this.setupRecipients.length === 0) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">No recipients added yet</p>';
            return;
        }
        
        container.innerHTML = this.setupRecipients.map(recipient => `
            <div class="setup-recipient-item">
                <span><strong>${recipient.name}</strong> - ${recipient.email}</span>
                <button type="button" class="btn btn-danger" onclick="setupWizard.removeSetupRecipient('${recipient.id}')">${t('delete', this.currentLang)}</button>
            </div>
        `).join('');
    }

    removeSetupRecipient(id) {
        this.setupRecipients = this.setupRecipients.filter(r => r.id !== id);
        this.renderSetupRecipients();
    }

    completeSetup() {
        // Save all data
        localStorage.setItem('userName', this.userName);
        // Ensure birthDate is saved with time set to midnight for accurate calculation
        if (this.birthDate) {
            this.birthDate.setHours(0, 0, 0, 0);
            localStorage.setItem('birthDate', this.birthDate.toISOString());
        }
        localStorage.setItem('emergencyContacts', JSON.stringify(this.emergencyContacts));
        localStorage.setItem('lastWordsRecipients', JSON.stringify(this.lastWordsRecipients));
        localStorage.setItem('lastWordsMessage', this.lastWordsMessage);
        localStorage.setItem('setupComplete', 'true');
        localStorage.setItem('enableNotifications', 'true');
        localStorage.setItem('enableAutoContact', 'true');
        localStorage.setItem('language', this.currentLang);
        
        // Record initial check-in
        const lastCheckIn = new Date();
        localStorage.setItem('lastCheckIn', lastCheckIn.toISOString());
        
        // Redirect to main app
        window.location.href = 'app.html';
    }
}

// Initialize setup wizard when DOM is loaded
let setupWizard;
document.addEventListener('DOMContentLoaded', () => {
    setupWizard = new SetupWizard();
});
