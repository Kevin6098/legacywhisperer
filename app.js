// Legacy Whisperer - Dead Man's Switch App
// Main application logic

class LifeGuardian {
    constructor() {
        this.userName = '';
        this.birthDate = null;
        this.lastCheckIn = null;
        this.emergencyContacts = [];
        this.lastWordsRecipients = [];
        this.lastWordsMessage = '';
        this.checkInterval = null;
        this.counterInterval = null;
        this.enableNotifications = true;
        this.enableAutoContact = true;
        this.currentLang = localStorage.getItem('language') || 'en';
        
        this.init();
    }

    init() {
        try {
            // Redirect to setup if not completed
            const setupComplete = localStorage.getItem('setupComplete');
            if (setupComplete !== 'true') {
                window.location.href = 'setup.html';
                return;
            }
            
            this.loadData();
            this.setupLanguageSelector();
            this.setupEventListeners();
            this.applyTranslations();
            this.loadDailyQuote();
            this.updateAliveCounter();
            this.startAliveCounter();
            this.checkStatus();
            this.recordActivity();
        } catch (error) {
            console.error('Error in init():', error);
            throw error; // Re-throw so the outer try-catch can catch it
        }
        
        // Check every minute for inactivity
        this.checkInterval = setInterval(() => {
            this.checkStatus();
            this.recordActivity();
        }, 60000); // Check every minute
        
        // Update counter every second
        this.counterInterval = setInterval(() => {
            this.updateAliveCounter();
        }, 1000);

        // Check on page visibility change (when app is opened)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.recordActivity();
                this.checkStatus();
            }
        });

        // Listen for page focus (when user interacts)
        window.addEventListener('focus', () => {
            this.recordActivity();
            this.checkStatus();
        });
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
        // Check if t function is available
        if (typeof t === 'undefined') {
            console.warn('Translation function t() is not available yet. Translations will be skipped.');
            return;
        }
        
        const elements = {
            'appTitle': 'appTitle',
            'welcomeText': 'welcomeUser',
            'youveBeenAlive': 'youveBeenAlive',
            'yearsLabel': 'years',
            'monthsLabel': 'months',
            'daysLabel': 'days',
            'hoursLabel': 'hours',
            'minutesLabel': 'minutes',
            'secondsLabel': 'seconds',
            'settingsTitle': 'settings',
            'settingsToggleText': 'settings',
            'basicInfoTitle': 'basicInformation',
            'birthDateLabel': 'yourBirthDate',
            'languageLabel': 'language',
            'saveBtn': 'save',
            'enableNotificationsLabel': 'enableNotifications',
            'enableAutoContactLabel': 'enableAutoContact',
            'emergencyContactsTitle': 'emergencyContacts',
            'contactsNotifyText': 'contactsNotifyAfter',
            'addContactBtnText': 'addContact',
            'lastWordsTitle': 'lastWords',
            'lastWordsDescription': 'lastWordsDescription',
            'addRecipientBtnText': 'addRecipient',
            'yourLastWordsLabel': 'yourLastWords',
            'saveLastWordsBtnText': 'saveLastWords',
            'modalTitle': 'addEmergencyContact',
            'saveContactBtn': 'save',
            'cancelContactBtnText': 'cancel',
            'deleteContactBtnText': 'delete',
            'recipientModalTitle': 'addLastWordsRecipient',
            'saveRecipientBtn': 'save',
            'cancelRecipientBtnText': 'cancel',
            'deleteRecipientBtnText': 'delete'
        };

        for (const [elementId, translationKey] of Object.entries(elements)) {
            const element = document.getElementById(elementId);
            if (element) {
                try {
                    element.textContent = t(translationKey, this.currentLang);
                } catch (error) {
                    console.warn(`Error translating ${elementId}:`, error);
                }
            }
        }
    }

    // Daily Motivational Quotes
    getDailyQuote() {
        const quotes = [
            { text: "You're still part of the story.", author: "Unknown" },
            { text: "Life is not measured by the number of breaths we take, but by the moments that take our breath away.", author: "Maya Angelou" },
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
            { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
            { text: "You learn more from failure than from success.", author: "Unknown" },
            { text: "If you are working on something exciting that you really care about, you don't have to be pushed. The vision pulls you.", author: "Steve Jobs" },
            { text: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Rob Siltanen" },
            { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
            { text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
            { text: "Imagine your life is perfect in every respect; what would it look like?", author: "Brian Tracy" },
            { text: "We generate fears while we sit. We overcome them by action.", author: "Dr. Henry Link" },
            { text: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
            { text: "Security is mostly a superstition. Life is either a daring adventure or nothing.", author: "Helen Keller" },
            { text: "The man who has confidence in himself gains the confidence of others.", author: "Hasidic Proverb" },
            { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
            { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
            { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
            { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
            { text: "Your limitation—it's only your imagination.", author: "Unknown" },
            { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
            { text: "Great things never come from comfort zones.", author: "Unknown" },
            { text: "Dream it. Wish it. Do it.", author: "Unknown" },
            { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
            { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
            { text: "Dream bigger. Do bigger.", author: "Unknown" },
            { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
            { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
            { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" }
        ];

        // Get today's date and use it to pick a consistent quote for the day
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const quoteIndex = dayOfYear % quotes.length;
        
        return quotes[quoteIndex];
    }

    loadDailyQuote() {
        const quote = this.getDailyQuote();
        const quoteElement = document.getElementById('dailyQuote');
        const authorElement = document.getElementById('quoteAuthor');
        
        if (quoteElement && authorElement) {
            quoteElement.textContent = `"${quote.text}"`;
            authorElement.textContent = `— ${quote.author}`;
        }
    }


    loadData() {
        console.log('Loading data from localStorage...');
        
        // Load user name
        const savedUserName = localStorage.getItem('userName');
        console.log('Saved userName:', savedUserName);
        if (savedUserName) {
            this.userName = savedUserName;
            const userNameElement = document.getElementById('userName');
            if (userNameElement) {
                userNameElement.textContent = this.userName;
            } else {
                console.warn('userName element not found in DOM');
            }
        }

        // Load birth date
        const savedBirthDate = localStorage.getItem('birthDate');
        console.log('Saved birthDate:', savedBirthDate);
        if (savedBirthDate) {
            // Parse the date properly - handle ISO string format
            this.birthDate = new Date(savedBirthDate);
            
            // Verify the date is valid
            if (isNaN(this.birthDate.getTime())) {
                console.error('Invalid birth date loaded from storage:', savedBirthDate);
                this.birthDate = null;
            } else {
                // Set the time to start of day (midnight) to count from birthday
                this.birthDate.setHours(0, 0, 0, 0);
                console.log('Birth date loaded successfully:', this.birthDate);
                
                const birthDateInput = document.getElementById('birthDate');
                if (birthDateInput) {
                    // Format date for input field (YYYY-MM-DD)
                    const dateStr = this.birthDate.toISOString().split('T')[0];
                    birthDateInput.value = dateStr;
                } else {
                    console.warn('birthDate input element not found in DOM');
                }
            }
        } else {
            console.warn('No birth date found in localStorage');
        }

        // Load last check-in
        const savedLastCheckIn = localStorage.getItem('lastCheckIn');
        if (savedLastCheckIn) {
            this.lastCheckIn = new Date(savedLastCheckIn);
            this.updateLastCheckInDisplay();
        }

        // Load emergency contacts
        const savedContacts = localStorage.getItem('emergencyContacts');
        if (savedContacts) {
            this.emergencyContacts = JSON.parse(savedContacts);
            this.renderContacts();
        }

        // Load last words recipients
        const savedRecipients = localStorage.getItem('lastWordsRecipients');
        if (savedRecipients) {
            this.lastWordsRecipients = JSON.parse(savedRecipients);
            this.renderRecipients();
        }

        // Load last words message
        const savedMessage = localStorage.getItem('lastWordsMessage');
        if (savedMessage) {
            this.lastWordsMessage = savedMessage;
            const lastWordsMessageEl = document.getElementById('lastWordsMessage');
            if (lastWordsMessageEl) {
                lastWordsMessageEl.value = savedMessage;
            }
        }

        // Load settings
        const notificationsEnabled = localStorage.getItem('enableNotifications');
        this.enableNotifications = notificationsEnabled !== 'false';
        const enableNotificationsEl = document.getElementById('enableNotifications');
        if (enableNotificationsEl) {
            enableNotificationsEl.checked = this.enableNotifications;
        }

        const autoContactEnabled = localStorage.getItem('enableAutoContact');
        this.enableAutoContact = autoContactEnabled !== 'false';
        const enableAutoContactEl = document.getElementById('enableAutoContact');
        if (enableAutoContactEl) {
            enableAutoContactEl.checked = this.enableAutoContact;
        }
    }

    saveData() {
        if (this.userName) {
            localStorage.setItem('userName', this.userName);
        }
        if (this.birthDate) {
            localStorage.setItem('birthDate', this.birthDate.toISOString());
        }
        if (this.lastCheckIn) {
            localStorage.setItem('lastCheckIn', this.lastCheckIn.toISOString());
        }
        localStorage.setItem('emergencyContacts', JSON.stringify(this.emergencyContacts));
        localStorage.setItem('lastWordsRecipients', JSON.stringify(this.lastWordsRecipients));
        localStorage.setItem('lastWordsMessage', this.lastWordsMessage);
        localStorage.setItem('enableNotifications', this.enableNotifications);
        localStorage.setItem('enableAutoContact', this.enableAutoContact);
    }

    setupEventListeners() {
        // Settings toggle button
        const settingsToggle = document.getElementById('settingsToggle');
        const settingsSection = document.getElementById('settingsSection');
        
        if (settingsToggle && settingsSection) {
            settingsToggle.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isVisible = settingsSection.style.display !== 'none';
                settingsSection.style.display = isVisible ? 'none' : 'block';
                this.updateSettingsToggleText(!isVisible);
            };
            console.log('Settings toggle button connected');
        } else {
            console.error('Settings toggle elements not found:', { 
                toggle: !!settingsToggle, 
                section: !!settingsSection 
            });
        }

        // Birth date save
        const saveBirthDateBtn = document.getElementById('saveBirthDateBtn');
        if (saveBirthDateBtn) {
            saveBirthDateBtn.addEventListener('click', () => {
                const birthDateInput = document.getElementById('birthDate');
                if (birthDateInput && birthDateInput.value) {
                    const birthDateValue = birthDateInput.value;
                    // Create date and set to start of day (midnight)
                    this.birthDate = new Date(birthDateValue + 'T00:00:00');
                    // Verify the date is valid
                    if (isNaN(this.birthDate.getTime())) {
                        alert('Invalid birth date! Please select a valid date.');
                        return;
                    }
                    this.birthDate.setHours(0, 0, 0, 0);
                    this.saveData();
                    this.updateAliveCounter();
                    alert(t('birthDateSaved', this.currentLang) || 'Birth date saved!');
                    console.log('Birth date saved:', this.birthDate);
                } else {
                    alert('Please select your birth date first!');
                }
            });
        }

        // Add contact button
        const addContactBtn = document.getElementById('addContactBtn');
        if (addContactBtn) {
            addContactBtn.addEventListener('click', () => {
                this.openContactModal();
            });
        }

        // Contact form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveContact();
            });
        }

        // Add recipient button
        const addRecipientBtn = document.getElementById('addRecipientBtn');
        if (addRecipientBtn) {
            addRecipientBtn.addEventListener('click', () => {
                this.openRecipientModal();
            });
        }

        // Recipient form
        const recipientForm = document.getElementById('recipientForm');
        if (recipientForm) {
            recipientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRecipient();
            });
        }

        // Save last words
        const saveLastWordsBtn = document.getElementById('saveLastWordsBtn');
        if (saveLastWordsBtn) {
            saveLastWordsBtn.addEventListener('click', () => {
                const messageEl = document.getElementById('lastWordsMessage');
                if (messageEl) {
                    this.lastWordsMessage = messageEl.value;
                    this.saveData();
                    alert('Last words saved!');
                }
            });
        }

        // Settings checkboxes
        const enableNotificationsCheckbox = document.getElementById('enableNotifications');
        if (enableNotificationsCheckbox) {
            enableNotificationsCheckbox.addEventListener('change', (e) => {
                this.enableNotifications = e.target.checked;
                this.saveData();
            });
        }

        const enableAutoContactCheckbox = document.getElementById('enableAutoContact');
        if (enableAutoContactCheckbox) {
            enableAutoContactCheckbox.addEventListener('change', (e) => {
                this.enableAutoContact = e.target.checked;
                this.saveData();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        const cancelContactBtn = document.getElementById('cancelContactBtn');
        if (cancelContactBtn) {
            cancelContactBtn.addEventListener('click', () => {
                this.closeModals();
            });
        }

        const cancelRecipientBtn = document.getElementById('cancelRecipientBtn');
        if (cancelRecipientBtn) {
            cancelRecipientBtn.addEventListener('click', () => {
                this.closeModals();
            });
        }

        // Delete contact button in modal
        const deleteContactBtn = document.getElementById('deleteContactBtn');
        if (deleteContactBtn) {
            deleteContactBtn.addEventListener('click', () => {
                const form = document.getElementById('contactForm');
                const contactId = form.dataset.contactId;
                if (contactId) {
                    const contact = this.emergencyContacts.find(c => c.id === contactId);
                    if (contact) {
                        if (confirm(t('deleteContactConfirm', this.currentLang) + ` ${contact.name}?`)) {
                            this.deleteContact(contactId);
                        }
                    }
                }
            });
        }

        // Delete recipient button in modal
        const deleteRecipientBtn = document.getElementById('deleteRecipientBtn');
        if (deleteRecipientBtn) {
            deleteRecipientBtn.addEventListener('click', () => {
                const form = document.getElementById('recipientForm');
                const recipientId = form.dataset.recipientId;
                if (recipientId) {
                    const recipient = this.lastWordsRecipients.find(r => r.id === recipientId);
                    if (recipient) {
                        if (confirm(t('deleteRecipientConfirm', this.currentLang) + ` ${recipient.name}?`)) {
                            this.deleteRecipient(recipientId);
                        }
                    }
                }
            });
        }

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    updateSettingsToggleText(settingsVisible) {
        const toggleText = document.getElementById('settingsToggleText');
        if (toggleText) {
            toggleText.textContent = settingsVisible ? t('close', this.currentLang) : t('settings', this.currentLang);
        }
    }

    updateAliveCounter() {
        // Ensure birthDate is loaded if not already
        if (!this.birthDate) {
            const savedBirthDate = localStorage.getItem('birthDate');
            if (savedBirthDate) {
                this.birthDate = new Date(savedBirthDate);
                // Validate the date
                if (isNaN(this.birthDate.getTime())) {
                    console.error('Invalid birth date:', savedBirthDate);
                    return;
                }
                console.log('Birth date loaded from localStorage:', this.birthDate);
            } else {
                // No birth date set - show zeros
                console.warn('No birth date found in localStorage. Please set your birth date in Settings.');
                const elements = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
                elements.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = '0';
                });
                return;
            }
        }

        // Ensure birthDate is a valid Date object
        if (!(this.birthDate instanceof Date) || isNaN(this.birthDate.getTime())) {
            console.error('Invalid birth date object:', this.birthDate);
            return;
        }

        const now = new Date();
        
        // Ensure birthDate time is set to start of day (midnight) for accurate calculation
        const birthDateStart = new Date(this.birthDate);
        birthDateStart.setHours(0, 0, 0, 0);
        
        const diff = now - birthDateStart;

        // Check if diff is valid (positive)
        if (diff < 0) {
            console.error('Birth date is in the future:', birthDateStart);
            return;
        }

        // Calculate time units correctly
        const totalSeconds = Math.floor(diff / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);
        
        const years = Math.floor(totalDays / 365.25);
        const remainingDays = totalDays - Math.floor(years * 365.25);
        const months = Math.floor(remainingDays / 30.44);
        const days = remainingDays - Math.floor(months * 30.44);
        const hours = totalHours % 24;
        const minutes = totalMinutes % 60;
        const seconds = totalSeconds % 60;

        // Update display elements safely
        const yearsEl = document.getElementById('years');
        const monthsEl = document.getElementById('months');
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        if (yearsEl) yearsEl.textContent = years;
        if (monthsEl) monthsEl.textContent = months;
        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours;
        if (minutesEl) minutesEl.textContent = minutes;
        if (secondsEl) secondsEl.textContent = seconds;
    }

    startAliveCounter() {
        // Counter interval is already set up in init()
        // Just make sure updateAliveCounter is called immediately
        this.updateAliveCounter();
    }

    recordActivity() {
        // Record that user has interacted with the app
        this.lastCheckIn = new Date();
        this.saveData();
        this.updateLastCheckInDisplay();
    }

    checkIn() {
        this.recordActivity();
        this.hideStatusAlert();
        alert('✓ Check-in recorded! You are safe.');
    }

    updateLastCheckInDisplay() {
        if (this.lastCheckIn) {
            const lastCheckinEl = document.getElementById('lastCheckin');
            if (lastCheckinEl) {
                const options = { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                };
                lastCheckinEl.textContent = 
                    this.lastCheckIn.toLocaleString('en-US', options);
            }
        }
    }

    checkStatus() {
        if (!this.lastCheckIn) {
            return;
        }

        const now = new Date();
        const diffInMs = now - this.lastCheckIn;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        // Day 1: Send notification reminder
        if (diffInDays >= 1 && diffInDays < 2) {
            this.handleDayOneAlert();
        }
        // Day 2: Contact emergency contacts and police
        else if (diffInDays >= 2 && diffInDays < 3) {
            this.handleDayTwoAlert();
        }
        // Day 3: Send last words
        else if (diffInDays >= 3) {
            this.handleDayThreeAlert();
        } else {
            this.hideStatusAlert();
        }
    }

    handleDayOneAlert() {
        if (!this.enableNotifications) return;

        this.showStatusAlert(
            'warning',
            '⚠️ Please Check In',
            'You haven\'t checked in for 1 day. Please open this app to confirm you are safe!'
        );

        // Request notification permission and send notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Legacy Whisperer Alert', {
                body: 'Please open the app to confirm you are safe!',
                icon: '🛡️',
                badge: '🛡️',
                tag: 'checkin-reminder',
                requireInteraction: true
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Legacy Whisperer Alert', {
                        body: 'Please open the app to confirm you are safe!',
                        icon: '🛡️'
                    });
                }
            });
        }
    }

    handleDayTwoAlert() {
        if (!this.enableAutoContact) return;

        const lastAlertTime = localStorage.getItem('dayTwoAlertTime');
        const now = new Date();
        
        // Only execute once per day
        if (!lastAlertTime || (now - new Date(lastAlertTime)) > 24 * 60 * 60 * 1000) {
            this.showStatusAlert(
                'danger',
                '🚨 Emergency Alert - Day 2',
                'No activity detected for 2 days! Emergency contacts have been notified and authorities have been alerted.'
            );

            // Contact emergency contacts
            this.contactEmergencyContacts();

            // Alert police (simulated - would need backend service in production)
            this.alertAuthorities();

            localStorage.setItem('dayTwoAlertTime', now.toISOString());
        }
    }

    handleDayThreeAlert() {
        if (!this.enableAutoContact) return;

        const lastAlertTime = localStorage.getItem('dayThreeAlertTime');
        const now = new Date();
        
        // Only execute once per day
        if (!lastAlertTime || (now - new Date(lastAlertTime)) > 24 * 60 * 60 * 1000) {
            this.showStatusAlert(
                'danger',
                '💔 Last Words - Day 3',
                'No activity detected for 3 days. Your last words have been sent to all recipients.'
            );

            // Send last words to recipients
            this.sendLastWords();

            localStorage.setItem('dayThreeAlertTime', now.toISOString());
        }
    }

    contactEmergencyContacts() {
        if (this.emergencyContacts.length === 0) {
            console.warn('No emergency contacts configured');
            return;
        }

        const message = `🚨 URGENT: This is an automatic alert from Legacy Whisperer. The user has not checked in for 2 days. Please check on them immediately.`;

        this.emergencyContacts.forEach(contact => {
            console.log(`📞 Contacting ${contact.name}:`);
            console.log(`   Phone: ${contact.phone}`);
            if (contact.email) {
                console.log(`   Email: ${contact.email}`);
            }
            console.log(`   Message: ${message}`);

            // In a real app, this would:
            // - Send SMS via Twilio, AWS SNS, or similar service
            // - Send email via SendGrid, AWS SES, or similar
            // - Make phone call via Twilio Voice API
            
            // For demonstration, we'll show alerts
            alert(`📞 Emergency Contact: ${contact.name}\nPhone: ${contact.phone}\n\nMessage sent: "${message}"`);
        });
    }

    alertAuthorities() {
        // In a real app, this would:
        // - Call emergency services API (if available in your region)
        // - Use location services to send coordinates
        // - Provide user information and emergency contact details
        
        console.log('🚨 ALERTING AUTHORITIES');
        console.log('Emergency Services: 911 (or local emergency number)');
        console.log('This is an automated alert from Legacy Whisperer app.');
        console.log('User has not checked in for 2+ days.');
        
        // Note: In production, you'd need backend services to actually call emergency services
        // Most regions don't allow direct API calls to emergency services
        alert('🚨 Authorities Alert:\n\nAn automated alert has been logged. In a production app, this would contact emergency services (911) with your location and details.\n\n⚠️ For actual emergencies, always dial 911 directly.');
    }

    sendLastWords() {
        if (this.lastWordsRecipients.length === 0 || !this.lastWordsMessage) {
            console.warn('No recipients or message configured for last words');
            return;
        }

        const fullMessage = `${this.lastWordsMessage}\n\n---\nThis message was automatically sent after 3 days of inactivity.`;

        this.lastWordsRecipients.forEach(recipient => {
            console.log(`📧 Sending last words to ${recipient.name}:`);
            if (recipient.phone) {
                console.log(`   Phone: ${recipient.phone}`);
            }
            if (recipient.email) {
                console.log(`   Email: ${recipient.email}`);
            }
            console.log(`   Message: ${fullMessage}`);

            // In a real app, this would:
            // - Send email via email service
            // - Send SMS if phone number provided
            // - May also send via other messaging platforms
            
            alert(`💔 Last Words sent to ${recipient.name}\n${recipient.email ? `Email: ${recipient.email}\n` : ''}${recipient.phone ? `Phone: ${recipient.phone}\n` : ''}\nMessage: "${fullMessage}"`);
        });
    }

    showStatusAlert(type, title, message) {
        const alertElement = document.getElementById('statusAlert');
        const titleElement = document.getElementById('alertTitle');
        const messageElement = document.getElementById('alertMessage');

        alertElement.className = `status-alert ${type}`;
        titleElement.textContent = title;
        messageElement.textContent = message;
        alertElement.style.display = 'block';
    }

    hideStatusAlert() {
        document.getElementById('statusAlert').style.display = 'none';
    }

    openContactModal(contactId = null) {
        const modal = document.getElementById('contactModal');
        const form = document.getElementById('contactForm');
        const modalTitle = document.getElementById('modalTitle');
        const deleteBtn = document.getElementById('deleteContactBtn');

        if (!modal || !form) return;

        form.dataset.contactId = contactId || '';
        if (deleteBtn) {
            deleteBtn.style.display = contactId ? 'block' : 'none';
        }
        
        if (modalTitle) {
            modalTitle.textContent = contactId ? t('editEmergencyContact', this.currentLang) : t('addEmergencyContact', this.currentLang);
        }

        if (contactId) {
            const contact = this.emergencyContacts.find(c => c.id === contactId);
            if (contact) {
                const nameInput = document.getElementById('contactName');
                const phoneInput = document.getElementById('contactPhone');
                const emailInput = document.getElementById('contactEmail');
                if (nameInput) nameInput.value = contact.name;
                if (phoneInput) phoneInput.value = contact.phone;
                if (emailInput) emailInput.value = contact.email || '';
            }
        } else {
            form.reset();
        }

        modal.classList.add('show');
    }

    closeModals() {
        document.getElementById('contactModal').classList.remove('show');
        document.getElementById('recipientModal').classList.remove('show');
        document.getElementById('contactForm').reset();
        document.getElementById('recipientForm').reset();
    }

    saveContact() {
        const form = document.getElementById('contactForm');
        const contactId = form.dataset.contactId;
        const name = document.getElementById('contactName').value;
        const phone = document.getElementById('contactPhone').value;
        const email = document.getElementById('contactEmail').value;

        if (contactId) {
            // Update existing
            const index = this.emergencyContacts.findIndex(c => c.id === contactId);
            if (index !== -1) {
                this.emergencyContacts[index] = { id: contactId, name, phone, email };
            }
        } else {
            // Add new
            const newContact = {
                id: Date.now().toString(),
                name,
                phone,
                email
            };
            this.emergencyContacts.push(newContact);
        }

        this.saveData();
        this.renderContacts();
        this.closeModals();
    }

    deleteContact(contactId) {
        this.emergencyContacts = this.emergencyContacts.filter(c => c.id !== contactId);
        this.saveData();
        this.renderContacts();
        this.closeModals();
    }

    renderContacts() {
        const container = document.getElementById('contactsList');
        
        if (this.emergencyContacts.length === 0) {
            container.innerHTML = '<p style="color: #666; grid-column: 1/-1;">No emergency contacts added yet.</p>';
            return;
        }

        container.innerHTML = this.emergencyContacts.map(contact => `
            <div class="contact-card">
                <h3>${contact.name}</h3>
                <p>📞 ${contact.phone}</p>
                ${contact.email ? `<p>📧 ${contact.email}</p>` : ''}
                <div class="contact-actions">
                    <button class="btn btn-secondary" onclick="app.openContactModal('${contact.id}')">${t('edit', this.currentLang)}</button>
                    <button class="btn btn-danger" onclick="if(confirm('${t('deleteContactConfirm', this.currentLang)} ${contact.name}?')) app.deleteContact('${contact.id}')">${t('delete', this.currentLang)}</button>
                </div>
            </div>
        `).join('');
    }

    openRecipientModal(recipientId = null) {
        const modal = document.getElementById('recipientModal');
        const form = document.getElementById('recipientForm');
        const modalTitle = document.getElementById('recipientModalTitle');
        const deleteBtn = document.getElementById('deleteRecipientBtn');

        if (!modal || !form) return;

        form.dataset.recipientId = recipientId || '';
        if (deleteBtn) {
            deleteBtn.style.display = recipientId ? 'block' : 'none';
        }
        
        if (modalTitle) {
            modalTitle.textContent = recipientId ? t('editLastWordsRecipient', this.currentLang) : t('addLastWordsRecipient', this.currentLang);
        }

        if (recipientId) {
            const recipient = this.lastWordsRecipients.find(r => r.id === recipientId);
            if (recipient) {
                const nameInput = document.getElementById('recipientName');
                const phoneInput = document.getElementById('recipientPhone');
                const emailInput = document.getElementById('recipientEmail');
                if (nameInput) nameInput.value = recipient.name;
                if (phoneInput) phoneInput.value = recipient.phone || '';
                if (emailInput) emailInput.value = recipient.email;
            }
        } else {
            form.reset();
        }

        modal.classList.add('show');
    }

    saveRecipient() {
        const form = document.getElementById('recipientForm');
        const recipientId = form.dataset.recipientId;
        const name = document.getElementById('recipientName').value;
        const phone = document.getElementById('recipientPhone').value;
        const email = document.getElementById('recipientEmail').value;

        if (recipientId) {
            // Update existing
            const index = this.lastWordsRecipients.findIndex(r => r.id === recipientId);
            if (index !== -1) {
                this.lastWordsRecipients[index] = { id: recipientId, name, phone, email };
            }
        } else {
            // Add new
            const newRecipient = {
                id: Date.now().toString(),
                name,
                phone,
                email
            };
            this.lastWordsRecipients.push(newRecipient);
        }

        this.saveData();
        this.renderRecipients();
        this.closeModals();
    }

    deleteRecipient(recipientId) {
        this.lastWordsRecipients = this.lastWordsRecipients.filter(r => r.id !== recipientId);
        this.saveData();
        this.renderRecipients();
        this.closeModals();
    }

    renderRecipients() {
        const container = document.getElementById('recipientsList');
        
        if (this.lastWordsRecipients.length === 0) {
            container.innerHTML = '<p style="color: #666; grid-column: 1/-1;">No recipients added yet.</p>';
            return;
        }

        container.innerHTML = this.lastWordsRecipients.map(recipient => `
            <div class="recipient-card">
                <h3>${recipient.name}</h3>
                ${recipient.phone ? `<p>📞 ${recipient.phone}</p>` : ''}
                <p>📧 ${recipient.email}</p>
                <div class="contact-actions">
                    <button class="btn btn-secondary" onclick="app.openRecipientModal('${recipient.id}')">${t('edit', this.currentLang)}</button>
                    <button class="btn btn-danger" onclick="if(confirm('${t('deleteRecipientConfirm', this.currentLang)} ${recipient.name}?')) app.deleteRecipient('${recipient.id}')">${t('delete', this.currentLang)}</button>
                </div>
            </div>
        `).join('');
    }
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new LifeGuardian();
        console.log('Legacy Whisperer app initialized successfully');
    } catch (error) {
        console.error('Error initializing Legacy Whisperer app:', error);
        alert('Error initializing app. Please check the console for details.');
    }
});
