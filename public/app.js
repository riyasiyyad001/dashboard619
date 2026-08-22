/* ==========================================================================
   GLOBAL STATE & REAL-TIME DATA ENGINE (PART 1)
   ========================================================================== */
   
Chart.defaults.color = '#64748b';
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size = 10;
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(7, 13, 10, 0.9)';
Chart.defaults.plugins.tooltip.titleColor = '#fff';
Chart.defaults.plugins.tooltip.bodyColor = '#e2e8f0';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(0, 255, 157, 0.3)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;

const chartGridOptions = {
    color: 'rgba(0, 255, 157, 0.05)',
    tickColor: 'transparent'
};

let navPages = [
    { id: 'home', title: 'Home', icon: 'fa-house', color: 'text-brand-500' },
    { id: 'assets', title: 'Portfolio', icon: 'fa-building-columns', color: 'text-accent-blue' },
    { id: 'india-ops', title: 'Equities', icon: 'fa-chart-pie', color: 'text-accent-cyan' },
    { id: 'budget', title: 'Budgets', icon: 'fa-scale-balanced', color: 'text-rose-400' },
    { id: 'goals', title: 'Milestone', icon: 'fa-bullseye', color: 'text-brand-500' },
    { id: 'notes', title: 'Notes', icon: 'fa-book-bookmark', color: 'text-amber-400' },
    { id: 'reminders', title: 'Reminders', icon: 'fa-bell', color: 'text-indigo-400' },
    { id: 'graphs', title: 'Intelligence', icon: 'fa-microchip', color: 'text-accent-plum' }
];

let db = {
    passcode: '1234',
    passcodeHint: 'Default PIN is 1234',
    profile: {
        name: 'RIYAS MADATHIL',
        phone: '0091-7559803371, 00974-55003371',
        photo: 'https://placehold.co/150x150/0284c7/ffffff?text=RM',
        address: 'Madathil House, Calicut, Kerala, India - 673001 | Villa 42, Al Rayyan, Doha, Qatar'
    },
    bgConfig: { opacity: 0.2, solidColor: '#0f172a', imgUrl: '' },
    navCustomTitles: {},
    assetCards: [],
    assetLogs: [],
    bankAccounts: [],
    bankCards: [],
    loans: [],
    assetMutualFunds: [],
    indiaOps: {
        shareMarket: [],
        ventures: [],
        othersEntries: []
    },
    budget: {
        QAR: [],
        INR: []
    },
    dailyExpenses: [],
    goals: [],
    notes: [],
    reminders: [],
    notifications: [],
    theme: 'theme-green',
    preferences: {
        budgetFilterMode: 'monthly',
        budgetFilterMonth: new Date().toLocaleString('default', { month: 'long' }),
        budgetFilterYear: new Date().getFullYear().toString(),
        eqFilterMode: 'monthly',
        eqFilterMonth: new Date().toLocaleString('default', { month: 'long' }),
        eqFilterYear: new Date().getFullYear().toString()
    }
};

function formatToDDMMYYYY(d) {
    if (!d) return '-';
    // If YYYY-MM-DD
    if (d.includes('-') && d.split('-')[0].length === 4) {
        const p = d.split('-');
        return `${p[2]}-${p[1]}-${p[0]}`;
    }
    // If DD/MM/YYYY
    if (d.includes('/')) {
        return d.replace(/\//g, '-');
    }
    return d;
}

function formatSentenceCapitalization(str) {
    if (!str) return '';
    // If the user typed entirely in uppercase (Caps Lock active for the whole string), preserve it
    if (str === str.toUpperCase() && /[A-Z]/.test(str) && str.length > 2) {
        return str;
    }

    // Split by sentences or paragraphs to capitalize the first letter of each sentence
    // Matches start of string or after punctuation (. ! ?) followed by spaces
    return str.replace(/(^\s*|[.!?]\s+)([a-zà-ÿ])/g, function(match, separator, char) {
        return separator + char.toUpperCase();
    });
}

// Global intelligent input listener across all text fields and contenteditable elements
document.addEventListener('input', function(e) {
    const target = e.target;
    if ((target.tagName === 'INPUT' && target.type === 'text') || target.tagName === 'TEXTAREA' || target.getAttribute('contenteditable') === 'true') {
        if (target.type === 'password' || target.classList.contains('no-auto-case')) return;
        
        const start = target.selectionStart;
        const end = target.selectionEnd;
        
        const val = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' ? target.value : target.innerText;
        
        // If user is currently typing in all caps, allow it
        if (val && val === val.toUpperCase() && /[A-Z]/.test(val) && val.length > 1) {
            return;
        }

        // Format with sentence/title capitalization (First letter capital, rest lowercase)
        const formatted = formatSentenceCapitalization(val);
        if (val !== formatted) {
            if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
                target.value = formatted;
                if (start !== null) target.setSelectionRange(start, end);
            } else {
                target.innerText = formatted;
            }
        }
    }
});

function sanitizeDatabase(data) {
    if (!data || typeof data !== 'object') data = {};
    if (!Array.isArray(data.assetCards)) data.assetCards = [];
    if (!Array.isArray(data.assetLogs)) data.assetLogs = [];
    if (!Array.isArray(data.bankAccounts)) data.bankAccounts = [];
    if (!Array.isArray(data.bankCards)) data.bankCards = [];
    if (!Array.isArray(data.loans)) data.loans = [];
    if (!Array.isArray(data.assetMutualFunds)) data.assetMutualFunds = [];
    
    if (!data.indiaOps || typeof data.indiaOps !== 'object') data.indiaOps = {};
    if (!Array.isArray(data.indiaOps.shareMarket)) data.indiaOps.shareMarket = [];
    if (!Array.isArray(data.indiaOps.ventures)) data.indiaOps.ventures = [];
    if (!Array.isArray(data.indiaOps.othersEntries)) data.indiaOps.othersEntries = [];

    if (!data.budget || typeof data.budget !== 'object') data.budget = { QAR: [], INR: [] };
    if (!Array.isArray(data.budget.QAR)) data.budget.QAR = [];
    if (!Array.isArray(data.budget.INR)) data.budget.INR = [];

    if (!Array.isArray(data.dailyExpenses)) data.dailyExpenses = [];
    if (!Array.isArray(data.goals)) data.goals = [];
    if (!Array.isArray(data.notes)) data.notes = [];
    if (!Array.isArray(data.reminders)) data.reminders = [];
    if (!Array.isArray(data.notifications)) data.notifications = [];

    if (!data.profile || typeof data.profile !== 'object') {
        data.profile = {
            name: 'RIYAS MADATHIL',
            phone: '0091-7559803371, 00974-55003371',
            photo: 'https://placehold.co/150x150/0284c7/ffffff?text=RM',
            address: 'Madathil House, Calicut, Kerala, India - 673001 | Villa 42, Al Rayyan, Doha, Qatar'
        };
    }
    if (!data.preferences || typeof data.preferences !== 'object') data.preferences = {};
    if (!data.vault || typeof data.vault !== 'object') data.vault = { documents: [], captures: [] };
    if (!Array.isArray(data.vault.documents)) data.vault.documents = [];
    if (!Array.isArray(data.vault.captures)) data.vault.captures = [];
    if (!data.bgConfig || typeof data.bgConfig !== 'object') data.bgConfig = { opacity: 0.2, solidColor: '#0f172a', imgUrl: '' };
    if (!data.navCustomTitles || typeof data.navCustomTitles !== 'object') data.navCustomTitles = {};

    return data;
}
window.sanitizeDatabase = sanitizeDatabase;

async function saveDatabase() {
    sanitizeDatabase(db);
    // Save to local cache first for zero-latency UI
    localStorage.setItem('riyas_executive_os_db_v2', JSON.stringify(db));
    // Persist to Firebase Firestore Cloud database
    if (window.cloudSave) {
        try {
            await window.cloudSave(db);
        } catch (e) {
            console.error("Firebase cloudSave error in saveDatabase:", e);
        }
    }
}

async function loadDatabase() {
    // 1. Load from local cache immediately for instantaneous rendering
    const local = localStorage.getItem('riyas_executive_os_db_v2');
    if (local) {
        try { 
            const parsed = JSON.parse(local);
            db = sanitizeDatabase({
                ...db,
                ...parsed,
                indiaOps: { ...(db.indiaOps || {}), ...(parsed.indiaOps || {}) },
                budget: { ...(db.budget || {}), ...(parsed.budget || {}) },
                profile: { ...(db.profile || {}), ...(parsed.profile || {}) },
                preferences: { ...(db.preferences || {}), ...(parsed.preferences || {}) }
            });
        } catch (e) {
            console.error("Error reading local db cache:", e);
        }
    }
    sanitizeDatabase(db);
    
    // 2. Connect to Firebase and fetch the latest cloud document
    if (window.initCloudStorage) {
        try {
            const ok = await window.initCloudStorage();
            if (ok && window.cloudLoad) {
                const remote = await window.cloudLoad();
                if (remote && typeof remote === 'object') {
                    db = sanitizeDatabase({
                        ...db,
                        ...remote,
                        indiaOps: { ...(db.indiaOps || {}), ...(remote.indiaOps || {}) },
                        budget: { ...(db.budget || {}), ...(remote.budget || {}) },
                        profile: { ...(db.profile || {}), ...(remote.profile || {}) },
                        preferences: { ...(db.preferences || {}), ...(remote.preferences || {}) }
                    });
                    localStorage.setItem('riyas_executive_os_db_v2', JSON.stringify(db));
                    refreshAllViews();
                } else if (local) {
                    // Initial bootstrap: Upload local state to the cloud database
                    if (window.cloudSave) {
                        await window.cloudSave(db);
                    }
                }
            }
        } catch (err) {
            console.error("Error connecting to Firebase cloud storage:", err);
        }
    }
}

// Handler for real-time updates from Firebase Firestore
window.onRemoteStateUpdate = function(remoteDb) {
    if (remoteDb && typeof remoteDb === 'object') {
        const prevNotifIds = new Set((db.notifications || []).map(n => n.id));
        const remoteNotifs = Array.isArray(remoteDb.notifications) ? remoteDb.notifications : [];
        
        // Detect if brand new unread notifications arrived from cloud
        const hasNewUnreadFromRemote = remoteNotifs.some(n => !n.read && !prevNotifIds.has(n.id));

        db = sanitizeDatabase({
            ...db,
            ...remoteDb,
            indiaOps: { ...(db.indiaOps || {}), ...(remoteDb.indiaOps || {}) },
            budget: { ...(db.budget || {}), ...(remoteDb.budget || {}) },
            profile: { ...(db.profile || {}), ...(remoteDb.profile || {}) },
            preferences: { ...(db.preferences || {}), ...(remoteDb.preferences || {}) }
        });
        localStorage.setItem('riyas_executive_os_db_v2', JSON.stringify(db));
        refreshAllViews();

        if (hasNewUnreadFromRemote && typeof playNotificationSound === 'function') {
            playNotificationSound();
        }
    }
};

window.onload = async function() {
    await loadDatabase();
    
    // Unlock Web Audio context on first user interaction
    const unlockAudio = () => {
        if (typeof getAudioContext === 'function') {
            getAudioContext();
        }
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    // Initialize flatpickr on date inputs
    flatpickr(".custom-datepicker", {
        dateFormat: "d/m/Y",
        allowInput: true
    });

    // Restore custom navigation titles if saved
    if (db.navCustomTitles) {
        navPages.forEach(p => {
            if (db.navCustomTitles[p.id]) {
                p.title = db.navCustomTitles[p.id];
            }
        });
    }

    // Restore Preferences for Filters
    if (db.preferences) {
        if (db.preferences.budgetFilterMode) budgetFilterMode = db.preferences.budgetFilterMode;
        if (db.preferences.budgetFilterMonth) budgetFilterMonth = db.preferences.budgetFilterMonth;
        if (db.preferences.budgetFilterYear) budgetFilterYear = db.preferences.budgetFilterYear;
        if (db.preferences.eqFilterMode) eqFilterMode = db.preferences.eqFilterMode;
        if (db.preferences.eqFilterMonth) eqFilterMonth = db.preferences.eqFilterMonth;
        if (db.preferences.eqFilterYear) eqFilterYear = db.preferences.eqFilterYear;
    }

    // Apply selected dropdown values
    const setSelect = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
    setSelect('budgetMonthSelect', budgetFilterMonth);
    setSelect('budgetYearSelect', budgetFilterYear);
    setSelect('eqMonthSelect', eqFilterMonth);
    setSelect('eqYearSelect', eqFilterYear);

    // Sync visual button states without triggering immediate duplicate renders
    setBudgetFilter(budgetFilterMode, true);
    setEquitiesFilter(eqFilterMode, true);

    renderNavTabs();
    refreshAllViews();
    checkPasscodeOnLaunch();
    if (typeof updateNotificationSoundUI === 'function') updateNotificationSoundUI();

    // Restore Theme Settings
    if (db.theme) {
        const htmlEl = document.documentElement;
        htmlEl.classList.remove('dark', 'theme-green', 'theme-black', 'theme-light');
        if (db.theme === 'theme-green' || db.theme === 'theme-black') htmlEl.classList.add('dark');
        htmlEl.classList.add(db.theme);
        currentThemeIndex = themes.indexOf(db.theme);
        if(currentThemeIndex === -1) currentThemeIndex = 0;
        
        setTimeout(() => {
            const icon = document.getElementById('themeToggleIcon');
            if(icon) {
                if (db.theme === 'theme-green') icon.className = 'fa-solid fa-leaf fa-fw text-sm group-hover:-rotate-12 transition-transform duration-300';
                else if (db.theme === 'theme-black') icon.className = 'fa-solid fa-moon fa-fw text-sm group-hover:-rotate-12 transition-transform duration-300';
                else icon.className = 'fa-solid fa-sun fa-fw text-sm group-hover:rotate-90 transition-transform duration-300';
            }
        }, 100);
    }

    // Explicitly focus the passcode field on load
    setTimeout(() => {
        const pinInput = document.getElementById('pinInput');
        if (pinInput && !document.getElementById('passcodeLockScreen').classList.contains('hidden')) {
            pinInput.focus();
        }
    }, 100);

    // Live Date & Time Engine
    setInterval(() => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const liveEl = document.getElementById('liveDateTime');
        if (liveEl) liveEl.innerText = `${dateStr} • ${timeStr}`;
    }, 1000);

    // Background Reminders Checker (Checks every 30 seconds)
    setInterval(checkReminders, 30000);
    setTimeout(checkReminders, 2000); // Initial check after loading
};

function refreshAllViews() {
    renderAssetLogsTable();
    renderBankAccountsTable();
    renderLoansTable();
    renderAssetMutualFundsTable();
    renderNetWorthAnalysis();
    renderIndiaOperations();
    renderBudgetsAndGoals();
    renderGoalsTable();
    renderNotesList();
    renderRemindersTable();
    renderNotifications();
    renderGrowthChart();
    applyBgCustomization();
    if (typeof updateNotificationSoundUI === 'function') updateNotificationSoundUI();
}

function checkPasscodeOnLaunch() {
    if (!db.passcode) {
        const screen = document.getElementById('passcodeLockScreen');
        if (screen) screen.classList.add('hidden');
    }
}

function unlockDashboard() {
    const pinEl = document.getElementById('pinInput');
    const pin = pinEl ? pinEl.value : '';
    if (pin === db.passcode || !db.passcode) {
        const screen = document.getElementById('passcodeLockScreen');
        if (screen) screen.classList.add('hidden');
        if (pinEl) pinEl.value = '';
    } else {
        showToast('Incorrect Passcode PIN');
    }
}

function handlePasscodeEnter(event) {
    if (event.key === 'Enter') {
        unlockDashboard();
    }
}

function showPasscodeHint() {
    const hintElem = document.getElementById('passcodeHintDisplay');
    if (hintElem) {
        hintElem.innerText = db.passcodeHint || 'No hint available';
        hintElem.classList.remove('hidden');
    }
}

function lockDashboard() {
    const screen = document.getElementById('passcodeLockScreen');
    if (screen) screen.classList.remove('hidden');
}

function openPasscodeModal() {
    openModal('passcodeSettingsModal');
}

function savePasscodeSettings() {
    const pinEl = document.getElementById('newPasscodePin');
    const hintEl = document.getElementById('newPasscodeHint');
    const newPin = pinEl ? pinEl.value : '';
    const newHint = hintEl ? hintEl.value : '';
    if (newPin.length === 4) {
        db.passcode = newPin;
        db.passcodeHint = newHint;
        saveDatabase();
        closeModal('passcodeSettingsModal');
        showToast('Passcode updated successfully');
    } else {
        showToast('Passcode must be 4 digits');
    }
}

function removePasscode() {
    requireConfirmation('Remove passcode protection?', () => {
        db.passcode = '';
        db.passcodeHint = '';
        saveDatabase();
        closeModal('passcodeSettingsModal');
        showToast('Passcode protection removed');
    });
}

const themes = ['theme-green', 'theme-black', 'theme-light'];
let currentThemeIndex = 0;

function toggleTheme() {
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('dark', 'theme-green', 'theme-black', 'theme-light');
    
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    
    if (newTheme === 'theme-green' || newTheme === 'theme-black') {
        htmlEl.classList.add('dark');
    }
    htmlEl.classList.add(newTheme);
    
    const icon = document.getElementById('themeToggleIcon');
    if (newTheme === 'theme-green') {
        icon.className = 'fa-solid fa-leaf fa-fw text-sm group-hover:-rotate-12 transition-transform duration-300';
        showToast('Cyber Nature Theme Applied');
    } else if (newTheme === 'theme-black') {
        icon.className = 'fa-solid fa-moon fa-fw text-sm group-hover:-rotate-12 transition-transform duration-300';
        showToast('OLED Black Theme Applied');
    } else {
        icon.className = 'fa-solid fa-sun fa-fw text-sm group-hover:rotate-90 transition-transform duration-300';
        showToast('Light Theme Applied');
    }
    
    db.theme = newTheme;
    saveDatabase();
}

let activePageId = 'home';

// Budget & Expenses Filter State
let budgetFilterMode = 'all';
let budgetFilterMonth = new Date().toLocaleString('default', { month: 'long' });
let budgetFilterYear = new Date().getFullYear().toString();

// Equities Filter State
let eqFilterMode = 'all';
let eqFilterMonth = new Date().toLocaleString('default', { month: 'long' });
let eqFilterYear = new Date().getFullYear().toString();

function setEquitiesFilter(mode, noRender = false) {
    eqFilterMode = mode.toLowerCase();
    
    if (!db.preferences) db.preferences = {};
    db.preferences.eqFilterMode = eqFilterMode;
    if (!noRender) saveDatabase();
    
    ['Monthly', 'Yearly', 'All'].forEach(m => {
        const btn = document.getElementById(`btnEq${m}`);
        if (btn) {
            if (eqFilterMode === m.toLowerCase()) {
                btn.className = 'px-2.5 py-1 rounded-md bg-brand-600 text-surface-950 font-bold transition-all shadow-[0_0_10px_rgba(0,255,157,0.3)] text-[10px] uppercase tracking-wider';
            } else {
                btn.className = 'px-2.5 py-1 rounded-md bg-transparent text-slate-400 hover:text-white hover:bg-surface-800 transition-all text-[10px] uppercase tracking-wider';
            }
        }
    });

    const monthSel = document.getElementById('eqMonthSelect');
    const yearSel = document.getElementById('eqYearSelect');
    const selContainer = document.getElementById('eqSelectors');

    if (selContainer && monthSel && yearSel) {
        if (eqFilterMode === 'monthly') {
            selContainer.classList.remove('hidden');
            monthSel.classList.remove('hidden');
            yearSel.classList.remove('hidden');
        } else if (eqFilterMode === 'yearly') {
            selContainer.classList.remove('hidden');
            monthSel.classList.add('hidden');
            yearSel.classList.remove('hidden');
        } else {
            selContainer.classList.add('hidden');
        }
    }

    if (!noRender) renderShareMarketTable();
}

window.updateEquitiesFilters = function() {
    const m = document.getElementById('eqMonthSelect');
    const y = document.getElementById('eqYearSelect');
    if (m) eqFilterMonth = m.value;
    if (y) eqFilterYear = y.value;
    
    if (!db.preferences) db.preferences = {};
    db.preferences.eqFilterMonth = eqFilterMonth;
    db.preferences.eqFilterYear = eqFilterYear;
    saveDatabase();
    
    renderIndiaOperations();
};

window.toggleGoalView = function(category, view) {
    const activeBtn = document.getElementById(`btn${capitalize(category)}Active`);
    const compBtn = document.getElementById(`btn${capitalize(category)}Completed`);
    const activeCont = document.getElementById(`${category}ActiveContainer`);
    const compCont = document.getElementById(`${category}CompletedContainer`);

    if (!activeBtn || !compBtn || !activeCont || !compCont) return;

    const activeClass = 'px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-bold bg-surface-800 text-white shadow-sm transition-all';
    const inactiveClass = 'px-3 py-1.5 rounded-md text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-slate-300 transition-all bg-transparent flex items-center gap-1.5';

    if (view === 'active') {
        activeBtn.className = activeClass;
        compBtn.className = inactiveClass;
        activeCont.classList.remove('hidden');
        activeCont.classList.add('block');
        compCont.classList.add('hidden');
        compCont.classList.remove('block');
    } else {
        compBtn.className = activeClass;
        activeBtn.className = inactiveClass;
        activeCont.classList.add('hidden');
        activeCont.classList.remove('block');
        compCont.classList.remove('hidden');
        compCont.classList.add('block');
    }
};

window.toggleCompletedSectionCollapse = function(category) {
    const contentBody = document.getElementById(`${category}CompletedContentBody`);
    const toggleText = document.getElementById(`${category}ToggleText`);
    const toggleIcon = document.getElementById(`${category}ToggleIcon`);
    
    if (!contentBody || !toggleText || !toggleIcon) return;

    const isHidden = contentBody.classList.contains('hidden');
    if (isHidden) {
        contentBody.classList.remove('hidden');
        toggleText.innerText = 'Hide Archive';
        toggleIcon.style.transform = 'rotate(180deg)';
    } else {
        contentBody.classList.add('hidden');
        toggleText.innerText = 'Show Archive';
        toggleIcon.style.transform = 'rotate(0deg)';
    }
};

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function switchEqSubTab(tabKey) {
    document.querySelectorAll('.eq-sub-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`eqSubView-${tabKey}`);
    if(target) target.classList.remove('hidden');

    const tabs = { 
        trading: { id: 'btnEqSubTrading', icon: 'fa-chart-pie', label: 'Trading Desk' }, 
        others: { id: 'btnEqSubOthers', icon: 'fa-layer-group', label: 'Others' }
    };

    Object.keys(tabs).forEach(k => {
        const btn = document.getElementById(tabs[k].id);
        if (btn) {
            if (k === tabKey) {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r from-brand-600 to-brand-700 text-surface-950 font-bold transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(201,164,107,0.25)] flex items-center gap-2 border border-brand-500/35';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            } else {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-surface-900/50 border border-surface-800 text-slate-400 hover:text-white hover:bg-surface-800/60 hover:border-surface-700 transition-all whitespace-nowrap flex items-center gap-2 shadow-sm';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            }
        }
    });
}

function renderNavTabs() {
    const container = document.getElementById('navPageTabs');
    if (!container) return;
    container.innerHTML = '';
    
    navPages.forEach(p => {
        const btn = document.createElement('button');
        const isActive = activePageId === p.id;
        
        btn.className = `w-full px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 text-sm tracking-[0.15em] uppercase group ${
            isActive 
            ? 'bg-surface-800/90 border border-surface-700 shadow-lg text-white font-bold backdrop-blur-md' 
            : 'bg-surface-900/30 text-slate-400 border border-surface-800/60 hover:bg-surface-800/60 hover:text-white hover:border-surface-700/80 shadow-sm'
        }`;
        btn.onclick = () => switchPage(p.id);
        
        const activeIconColor = p.color || 'text-brand-500';
        const indicator = isActive ? `<span class="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor] ml-auto ${activeIconColor}"></span>` : '';
        
        btn.innerHTML = `<i class="fa-solid ${p.icon} ${isActive ? activeIconColor + ' scale-110 drop-shadow-md' : 'text-slate-500 group-hover:' + activeIconColor} text-lg w-6 text-center transition-all duration-300"></i> <span class="pt-0.5">${p.title}</span> ${indicator}`;
        container.appendChild(btn);
    });
}

function switchPage(pageId) {
    activePageId = pageId;
    document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
    
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.remove('hidden');
    }
    renderNavTabs();
}

function saveHomeProfile() {
    const nameEl = document.getElementById('homeProfileName');
    const phoneEl = document.getElementById('homeProfilePhone');
    if (nameEl) db.profile.name = nameEl.innerText;
    if (phoneEl) db.profile.phone = phoneEl.innerText;
    saveDatabase();
}

function saveHomeAddress() {
    const addrEl = document.getElementById('homeAddressContent');
    if (addrEl) db.profile.address = addrEl.innerText;
    saveDatabase();
}

function uploadProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            db.profile.photo = e.target.result;
            const img = document.getElementById('profilePhotoImg');
            if (img) img.src = e.target.result;
            saveDatabase();
        };
        reader.readAsDataURL(file);
    }
}

let currentStorageType = 'documents';

function openStorageModal(type = 'documents') {
    currentStorageType = type;
    const titleEl = document.getElementById('storageModalTitle');
    if (titleEl) titleEl.innerText = type === 'documents' ? 'Documents Vault' : 'Captures Vault';
    renderStorageFileList();
    openModal('storageModal');
}
window.openStorageModal = openStorageModal;

function saveStorageFile() {
    const nameInput = document.getElementById('storageDocName');
    const name = (nameInput ? nameInput.value.trim() : '') || 'Untitled File';
    const fileInput = document.getElementById('storageFileInput');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('Please select a file to upload');
        return;
    }
    const file = fileInput.files[0];
    if (file.size > 1024 * 1024) {
        showToast('File too large! Max 1MB allowed.');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        if (!db.vault) db.vault = { documents: [], captures: [] };
        if (!db.vault[currentStorageType]) db.vault[currentStorageType] = [];
        
        db.vault[currentStorageType].push({
            id: Date.now().toString(),
            name: name,
            data: e.target.result,
            type: file.type,
            size: file.size,
            date: new Date().toLocaleDateString()
        });
        saveDatabase();
        renderStorageFileList();
        if (nameInput) nameInput.value = '';
        fileInput.value = '';
        showToast('File saved to secure vault');
    };
    reader.readAsDataURL(file);
}
window.saveStorageFile = saveStorageFile;

function renderStorageFileList() {
    const container = document.getElementById('storageFilesList');
    if (!db.vault) db.vault = { documents: [], captures: [] };
    const files = db.vault[currentStorageType] || [];

    const docCount = document.getElementById('docCountText');
    const capCount = document.getElementById('captureCountText');
    if (docCount) docCount.innerText = `${(db.vault.documents||[]).length} Files Stored`;
    if (capCount) capCount.innerText = `${(db.vault.captures||[]).length} Photos Stored`;

    if (!container) return;
    container.innerHTML = '';

    if (files.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-500 text-xs font-light">No items stored in vault yet. Select a file above to upload.</div>`;
        return;
    }

    files.forEach(f => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-3.5 rounded-xl bg-surface-900/60 border border-surface-800 text-xs text-slate-300 hover:bg-surface-800/40 transition-colors';
        const isImg = f.type && f.type.startsWith('image/');
        row.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 flex-shrink-0">
                    <i class="fa-solid ${isImg ? 'fa-image' : 'fa-file-lines'} text-xs"></i>
                </div>
                <div class="flex flex-col truncate">
                    <span class="font-medium truncate text-white">${f.name}</span>
                    <span class="text-[10px] text-slate-500 font-mono">${f.date || 'Stored'}</span>
                </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <button onclick="previewVaultFile('${f.id}')" class="px-2.5 py-1 bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 rounded-lg text-[11px] font-mono transition-colors cursor-pointer">View</button>
                <button onclick="downloadVaultFile('${f.id}')" class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[11px] font-mono transition-colors cursor-pointer"><i class="fa-solid fa-download"></i></button>
                <button onclick="deleteVaultFile('${f.id}')" class="text-slate-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
            </div>
        `;
        container.appendChild(row);
    });
}
window.renderStorageFileList = renderStorageFileList;

function previewVaultFile(id) {
    if (!db.vault || !db.vault[currentStorageType]) return;
    const f = db.vault[currentStorageType].find(x => x.id === id);
    if (f) {
        const titleEl = document.getElementById('previewFileTitle');
        if (titleEl) titleEl.innerText = f.name;
        const body = document.getElementById('previewModalBody');
        if (body) {
            if (f.data && f.data.startsWith('data:image')) {
                body.innerHTML = `<img src="${f.data}" class="max-h-[70vh] rounded-xl shadow-lg border border-surface-700 object-contain">`;
            } else if (f.data && f.data.startsWith('data:application/pdf')) {
                body.innerHTML = `<iframe src="${f.data}" class="w-full h-[70vh] rounded-xl border border-surface-700"></iframe>`;
            } else {
                body.innerHTML = `
                    <div class="p-8 text-center space-y-4">
                        <i class="fa-solid fa-file text-4xl text-brand-500 opacity-60"></i>
                        <p class="text-white text-sm font-medium">${f.name}</p>
                        <button onclick="downloadVaultFile('${f.id}')" class="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-surface-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all">Download File</button>
                    </div>
                `;
            }
        }
        openModal('filePreviewModal');
    }
}
window.previewVaultFile = previewVaultFile;

function downloadVaultFile(id) {
    if (!db.vault || !db.vault[currentStorageType]) return;
    const f = db.vault[currentStorageType].find(x => x.id === id);
    if (f && f.data) {
        const a = document.createElement('a');
        a.href = f.data;
        a.download = f.name || 'vault_file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
window.downloadVaultFile = downloadVaultFile;

function deleteVaultFile(id) {
    requireConfirmation('Delete this file from your vault?', () => {
        if (!db.vault || !db.vault[currentStorageType]) return;
        db.vault[currentStorageType] = db.vault[currentStorageType].filter(x => x.id !== id);
        saveDatabase();
        renderStorageFileList();
        showToast('File removed from vault');
    });
}
window.deleteVaultFile = deleteVaultFile;

function applyBgCustomization() {
    const overlay = document.getElementById('customBgOverlay');
    if (!overlay) return;
    overlay.style.backgroundColor = db.bgConfig.solidColor || '#0f172a';
    overlay.style.opacity = db.bgConfig.opacity || '0.2';
    if (db.bgConfig.imgUrl) {
        overlay.style.backgroundImage = `url(${db.bgConfig.imgUrl})`;
    }
}

function updateBgCustomization() {
    db.bgConfig.solidColor = document.getElementById('bgSolidColor').value;
    db.bgConfig.opacity = document.getElementById('bgOpacityRange').value;
    saveDatabase();
    applyBgCustomization();
}

function uploadBgImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            db.bgConfig.imgUrl = evt.target.result;
            saveDatabase();
            applyBgCustomization();
        };
        reader.readAsDataURL(file);
    }
}

function toggleHomeStylingBar() {
    document.getElementById('homeStylingToolbar').classList.toggle('hidden');
}

function openNavCustomizeModal() {
    switchPage('home');
    const toolbar = document.getElementById('homeStylingToolbar');
    if (toolbar) {
        toolbar.classList.remove('hidden');
        toolbar.scrollIntoView({ behavior: 'smooth' });
        renderNavEditorInputs();
    }
}

function renderNavEditorInputs() {
    const container = document.getElementById('navEditorInputsContainer');
    if(!container) return;
    container.innerHTML = '';
    
    navPages.forEach(p => {
        const div = document.createElement('div');
        div.className = 'flex flex-col gap-1.5 bg-surface-900 p-3 rounded-xl border border-surface-800';
        div.innerHTML = `
            <label class="font-mono text-[9px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <i class="fa-solid ${p.icon} text-brand-500"></i> ${p.id.toUpperCase()} Heading
            </label>
            <input type="text" id="navInput_${p.id}" value="${p.title}" class="w-full p-2.5 rounded-lg border border-surface-700 bg-surface-950 text-white text-xs focus:border-brand-500 focus:outline-none font-medium">
        `;
        container.appendChild(div);
    });
}

function saveNavCustomization() {
    if (!db.navCustomTitles) db.navCustomTitles = {};
    
    navPages.forEach(p => {
        const input = document.getElementById(`navInput_${p.id}`);
        if (input) {
            const newTitle = input.value.trim() || p.title;
            p.title = newTitle;
            db.navCustomTitles[p.id] = newTitle;
        }
    });

    saveDatabase();
    renderNavTabs();
    toggleHomeStylingBar();
    showToast('Navigation headings updated successfully');
}

function switchGoalSubTab(tabKey) {
    document.querySelectorAll('.goal-sub-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`goalSubView-${tabKey}`);
    if (target) target.classList.remove('hidden');

    const tabs = { 
        financial: { id: 'btnGoalSubFinancial', icon: 'fa-coins', label: 'Financial Milestones' }, 
        business: { id: 'btnGoalSubBusiness', icon: 'fa-briefcase', label: 'Business Plans' },
        personal: { id: 'btnGoalSubPersonal', icon: 'fa-user-astronaut', label: 'Personal Milestones' },
        books: { id: 'btnGoalSubBooks', icon: 'fa-book', label: 'Reading Goals' },
        travel: { id: 'btnGoalSubTravel', icon: 'fa-plane', label: 'Travel Goals' },
        ziyara: { id: 'btnGoalSubZiyara', icon: 'fa-kaaba', label: 'Ziyara Goals' },
        analytics: { id: 'btnGoalSubAnalytics', icon: 'fa-chart-pie', label: 'Overall Status' }
    };

    Object.keys(tabs).forEach(k => {
        const btn = document.getElementById(tabs[k].id);
        if (btn) {
            if (k === tabKey) {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r from-brand-600 to-brand-700 text-surface-950 font-bold transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(201,164,107,0.25)] flex items-center gap-2 border border-brand-500/35';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            } else {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-surface-900/50 border border-surface-800 text-slate-400 hover:text-white hover:bg-surface-800/60 hover:border-surface-700 transition-all whitespace-nowrap flex items-center gap-2 shadow-sm';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            }
        }
    });

    if (tabKey === 'analytics' && typeof renderGoalAnalytics === 'function') {
        setTimeout(() => {
            renderGoalAnalytics();
        }, 50);
    }
}

function switchBudgetSubTab(tabKey) {
    document.querySelectorAll('.budget-sub-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`budgetSubView-${tabKey}`);
    if (target) target.classList.remove('hidden');

    const tabs = { 
        qatar: { id: 'btnBudgetSubQatar', icon: 'fa-coins', label: 'Qatar Budget (QAR)' }, 
        india: { id: 'btnBudgetSubIndia', icon: 'fa-piggy-bank', label: 'India Budget (INR)' }
    };

    Object.keys(tabs).forEach(k => {
        const btn = document.getElementById(tabs[k].id);
        if (btn) {
            if (k === tabKey) {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r from-brand-600 to-brand-700 text-surface-950 font-bold transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(201,164,107,0.25)] flex items-center gap-2 border border-brand-500/35';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            } else {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-surface-900/50 border border-surface-800 text-slate-400 hover:text-white hover:bg-surface-800/60 hover:border-surface-700 transition-all whitespace-nowrap flex items-center gap-2 shadow-sm';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            }
        }
    });
}

function switchAssetSubTab(tabKey) {
    document.querySelectorAll('.asset-sub-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`assetSubView-${tabKey}`);
    if (target) target.classList.remove('hidden');

    const tabs = { 
        valuation: { id: 'btnAssetSubValuation', icon: 'fa-chart-line', label: 'Valuation Log' }, 
        mutualfunds: { id: 'btnAssetSubMutualFunds', icon: 'fa-seedling', label: 'Mutual Funds' },
        banking: { id: 'btnAssetSubBanking', icon: 'fa-building-columns', label: 'Banking' }, 
        credit: { id: 'btnAssetSubCredit', icon: 'fa-credit-card', label: 'Credit & Liabilities' }, 
        analysis: { id: 'btnAssetSubAnalysis', icon: 'fa-chart-pie', label: 'Net Worth Analysis' }
    };
    
    Object.keys(tabs).forEach(k => {
        const btn = document.getElementById(tabs[k].id);
        if (btn) {
            if (k === tabKey) {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r from-brand-600 to-brand-700 text-surface-950 font-bold transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(201,164,107,0.25)] flex items-center gap-2 border border-brand-500/35';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            } else {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-surface-900/50 border border-surface-800 text-slate-400 hover:text-white hover:bg-surface-800/60 hover:border-surface-700 transition-all whitespace-nowrap flex items-center gap-2 shadow-sm';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            }
        }
    });

    if(tabKey === 'analysis') {
        renderNetWorthAnalysis();
    }
}

function renderAssetLogsTable() {
    const body = document.getElementById('assetLogsTableBody');
    if(!body) return;
    body.innerHTML = '';
    if (!db.assetLogs) db.assetLogs = [];
    let totalValueImpact = 0;

    const sortedLogs = [...db.assetLogs].sort((a, b) => {
        const dateA = a.date ? (a.date.includes('-') ? a.date : a.date.split('/').reverse().join('-')) : '';
        const dateB = b.date ? (b.date.includes('-') ? b.date : b.date.split('/').reverse().join('-')) : '';
        return new Date(dateA) - new Date(dateB);
    });

    const getCategoryIcon = (cat) => {
        const c = (cat || '').toLowerCase();
        if (c.includes('real estate')) return 'fa-house text-brand-500';
        if (c.includes('gold') || c.includes('jewelry')) return 'fa-gem text-amber-400';
        if (c.includes('vehicle')) return 'fa-car text-accent-blue';
        if (c.includes('business')) return 'fa-briefcase text-accent-cyan';
        if (c.includes('stock') || c.includes('equit')) return 'fa-chart-line text-emerald-400';
        if (c.includes('mutual')) return 'fa-seedling text-emerald-400';
        if (c.includes('cash') || c.includes('liquid')) return 'fa-money-bill-wave text-accent-blue';
        return 'fa-layer-group text-slate-400';
    };

    sortedLogs.forEach(log => {
        const val = parseFloat(log.value) || 0;
        totalValueImpact += val;
        const iconClass = getCategoryIcon(log.category);
        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formatToDDMMYYYY(log.date)}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-semibold flex items-center gap-2 h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors"><i class="fa-solid ${iconClass} w-5"></i> ${log.assetName}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${log.category}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors text-slate-400">${log.activity}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${val.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                <div class="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    <button onclick="openAssetLogModal('${log.id}')" class="text-slate-500 hover:text-brand-500"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteAssetLog('${log.id}')" class="text-slate-500 hover:text-rose-500"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div></td>
        `;
        body.appendChild(tr);
    });

    const QAR_TO_INR_RATE = 23.5;
    let bankAssets = 0;
    if (db.bankAccounts) {
        db.bankAccounts.forEach(b => {
            let bal = parseFloat(b.balance) || 0;
            if (b.currency === 'QAR') bal *= QAR_TO_INR_RATE;
            bankAssets += bal;
        });
    }

    let mfAssets = 0;
    if (db.assetMutualFunds) {
        db.assetMutualFunds.forEach(mf => {
            let qty = parseFloat(mf.qty) || 0;
            let ltp = parseFloat(mf.ltp) || 0;
            mfAssets += (qty * ltp);
        });
    }

    totalValueImpact += bankAssets + mfAssets;

    const trMf = document.createElement('tr');
    trMf.className = 'group transition-colors';
    trMf.innerHTML = `
        <td class="py-px px-1"><div class="px-3 py-2 border border-emerald-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center h-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"><i class="fa-solid fa-bolt text-[10px] mr-1 text-emerald-400"></i> Live</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-emerald-500/25 rounded-xl font-semibold text-emerald-400 flex items-center h-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"><i class="fa-solid fa-seedling w-5 mr-1"></i> Mutual Funds Portfolio</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-emerald-500/25 rounded-xl text-slate-300 flex items-center h-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors">Equities / Funds</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-emerald-500/25 rounded-xl flex items-center h-full bg-emerald-500/5 group-hover:bg-emerald-500/10 font-bold text-emerald-400/70 transition-colors">Auto-Synced</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-emerald-500/25 rounded-xl text-right font-bold font-mono text-emerald-400 flex items-center justify-end h-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors">₹${mfAssets.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-emerald-500/25 rounded-xl flex items-center justify-center h-full bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors">
            <button onclick="switchAssetSubTab('mutualfunds')" class="text-emerald-400 hover:text-emerald-300 font-bold text-[10px] font-mono uppercase tracking-wider transition-colors underline decoration-emerald-500/40 underline-offset-4 opacity-0 group-hover:opacity-100">View Data</button>
        </div></td>
    `;
    body.appendChild(trMf);

    const trBank = document.createElement('tr');
    trBank.className = 'group transition-colors';
    trBank.innerHTML = `
        <td class="py-px px-1"><div class="px-3 py-2 border border-accent-blue/25 rounded-xl font-mono text-xs text-slate-400 flex items-center h-full bg-accent-blue/5 group-hover:bg-accent-blue/10 transition-colors"><i class="fa-solid fa-bolt text-[10px] mr-1 text-accent-blue"></i> Live</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-accent-blue/25 rounded-xl font-semibold text-accent-blue flex items-center h-full bg-accent-blue/5 group-hover:bg-accent-blue/10 transition-colors"><i class="fa-solid fa-building-columns w-5 mr-1"></i> Consolidated Bank Balances</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-accent-blue/25 rounded-xl text-slate-300 flex items-center h-full bg-accent-blue/5 group-hover:bg-accent-blue/10 transition-colors">Liquid Assets</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-accent-blue/25 rounded-xl flex items-center h-full bg-accent-blue/5 group-hover:bg-accent-blue/10 font-bold text-accent-blue/70 transition-colors">Auto-Synced</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-accent-blue/25 rounded-xl text-right font-bold font-mono text-accent-blue flex items-center justify-end h-full bg-accent-blue/5 group-hover:bg-accent-blue/10 transition-colors">₹${bankAssets.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-accent-blue/25 rounded-xl flex items-center justify-center h-full bg-accent-blue/5 group-hover:bg-accent-blue/10 transition-colors">
            <button onclick="switchAssetSubTab('banking')" class="text-accent-blue hover:text-accent-cyan font-bold text-[10px] font-mono uppercase tracking-wider transition-colors underline decoration-accent-blue/40 underline-offset-4 opacity-0 group-hover:opacity-100">View Data</button>
        </div></td>
    `;
    body.appendChild(trBank);

    const foot = document.getElementById('assetLogsTableFoot');
    if (foot) {
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        foot.innerHTML = `
            <tr>
                <td colspan="4" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Total Value Impact (Incl. Liquid):</td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border ${totalValueImpact >= 0 ? 'border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]' : 'border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'} text-lg font-mono tracking-wider font-bold">₹${totalValueImpact.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="border-none"></td>
            </tr>
        `;
    }
}

function openAssetLogModal(id = null) {
    const idEl = document.getElementById('assetLogId');
    if (idEl) idEl.value = id || '';
    const titleEl = document.getElementById('assetLogModalTitle');
    if (id) {
        const log = (db.assetLogs || []).find(x => x.id === id);
        if (log) {
            if (titleEl) titleEl.innerText = 'Edit Asset Activity';
            const dInput = document.getElementById('assetLogDate');
            if (dInput && dInput._flatpickr) {
                dInput._flatpickr.setDate(log.date && log.date.includes('-') ? log.date.split('-').reverse().join('/') : (log.date || new Date()));
            }
            if (document.getElementById('assetLogName')) document.getElementById('assetLogName').value = log.assetName || '';
            if (document.getElementById('assetLogCategory')) document.getElementById('assetLogCategory').value = log.category || 'Real Estate';
            if (document.getElementById('assetLogActivity')) document.getElementById('assetLogActivity').value = log.activity || 'Acquisition';
            if (document.getElementById('assetLogValue')) document.getElementById('assetLogValue').value = log.value || '';
            if (document.getElementById('assetLogNotes')) document.getElementById('assetLogNotes').value = log.notes || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Asset Activity';
        const dInput = document.getElementById('assetLogDate');
        if (dInput && dInput._flatpickr) dInput._flatpickr.setDate(new Date());
        if (document.getElementById('assetLogName')) document.getElementById('assetLogName').value = '';
        if (document.getElementById('assetLogCategory')) document.getElementById('assetLogCategory').value = 'Real Estate';
        if (document.getElementById('assetLogActivity')) document.getElementById('assetLogActivity').value = 'Acquisition';
        if (document.getElementById('assetLogValue')) document.getElementById('assetLogValue').value = '';
        if (document.getElementById('assetLogNotes')) document.getElementById('assetLogNotes').value = '';
    }
    openModal('assetLogModal');
}

function saveAssetLog() {
    const id = document.getElementById('assetLogId').value;
    const dateInputVal = document.getElementById('assetLogDate').value;
    let date = dateInputVal;
    if (dateInputVal && dateInputVal.includes('-')) {
        const parts = dateInputVal.split('-');
        if (parts.length === 3) date = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const assetName = document.getElementById('assetLogName').value || 'Asset';
    const category = document.getElementById('assetLogCategory').value;
    const activity = document.getElementById('assetLogActivity').value;
    const value = parseFloat(document.getElementById('assetLogValue').value) || 0;
    const notes = document.getElementById('assetLogNotes').value;

    if (!db.assetLogs) db.assetLogs = [];
    if (id) {
        const log = db.assetLogs.find(x => x.id === id);
        if (log) { log.date = date; log.assetName = assetName; log.category = category; log.activity = activity; log.value = value; log.notes = notes; }
    } else {
        db.assetLogs.push({ id: Date.now().toString(), date, assetName, category, activity, value, notes });
    }

    saveDatabase();
    renderAssetLogsTable();
    renderNetWorthAnalysis();
    closeModal('assetLogModal');
    showToast('Asset activity saved');
}

function deleteAssetLog(id) {
    requireConfirmation('Delete this asset activity log?', () => {
        db.assetLogs = db.assetLogs.filter(x => x.id !== id);
        saveDatabase();
        renderAssetLogsTable();
        renderNetWorthAnalysis();
    });
}

function renderBankAccountsTable() {
    const body = document.getElementById('bankDetailsTableBody');
    if(!body) return;
    body.innerHTML = '';
    let totalINR = 0, totalQAR = 0;

    db.bankAccounts.forEach((b, idx) => {
        let bal = parseFloat(b.balance) || 0;
        if (b.currency === 'QAR') totalQAR += bal; else totalINR += bal;

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-12">${idx + 1}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-semibold flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[250px] w-full">${b.bankName}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.accountName}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.branch}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.type}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl uppercase font-mono tracking-wider text-slate-400 text-xs flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.ifsc}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold text-brand-500 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.currency || 'INR'} ${bal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                <div class="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    <button onclick="openBankModal('${b.id}')" class="text-slate-500 hover:text-brand-500"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteBankRow('${b.id}')" class="text-slate-500 hover:text-rose-500"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div></td>
        `;
        body.appendChild(tr);
    });

    const foot = document.getElementById('bankDetailsTableFoot');
    if (foot) {
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        foot.innerHTML = `
            <tr>
                <td colspan="6" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Total Balance:</td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <div class="flex flex-col items-end gap-2">
                        <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-brand-500/30 shadow-[0_0_15px_rgba(201,164,107,0.15)] text-lg font-mono tracking-wider font-bold text-brand-500">₹${totalINR.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        ${totalQAR > 0 ? `<span class="inline-block px-4 py-1.5 rounded-xl bg-surface-950 border border-rose-900/40 shadow-[0_0_15px_rgba(138,21,56,0.15)] text-base font-mono tracking-wider font-bold text-[#8A1538]">QR ${totalQAR.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>` : ''}
                    </div>
                </td>
                <td class="border-none"></td>
            </tr>
        `;
    }
}

function openBankModal(id = null) {
    const idEl = document.getElementById('bankId');
    if (idEl) idEl.value = id || '';
    const titleEl = document.getElementById('bankModalTitle');
    if (id) {
        const b = (db.bankAccounts || []).find(x => x.id === id);
        if (b) {
            if (titleEl) titleEl.innerText = 'Edit Bank Account';
            if (document.getElementById('bankNameInput')) document.getElementById('bankNameInput').value = b.bankName || '';
            if (document.getElementById('bankAccountNameInput')) document.getElementById('bankAccountNameInput').value = b.accountName || '';
            if (document.getElementById('bankBranchInput')) document.getElementById('bankBranchInput').value = b.branch || '';
            if (document.getElementById('bankTypeInput')) document.getElementById('bankTypeInput').value = b.type || 'Checking';
            if (document.getElementById('bankIfscInput')) document.getElementById('bankIfscInput').value = b.ifsc || '';
            if (document.getElementById('bankCurrencyInput')) document.getElementById('bankCurrencyInput').value = b.currency || 'INR';
            if (document.getElementById('bankBalanceInput')) document.getElementById('bankBalanceInput').value = b.balance || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Bank Account';
        if (document.getElementById('bankNameInput')) document.getElementById('bankNameInput').value = '';
        if (document.getElementById('bankAccountNameInput')) document.getElementById('bankAccountNameInput').value = (db.profile && db.profile.name) ? db.profile.name : '';
        if (document.getElementById('bankBranchInput')) document.getElementById('bankBranchInput').value = '';
        if (document.getElementById('bankTypeInput')) document.getElementById('bankTypeInput').value = 'Checking';
        if (document.getElementById('bankIfscInput')) document.getElementById('bankIfscInput').value = '';
        if (document.getElementById('bankCurrencyInput')) document.getElementById('bankCurrencyInput').value = 'INR';
        if (document.getElementById('bankBalanceInput')) document.getElementById('bankBalanceInput').value = '';
    }
    openModal('bankModal');
}

function saveBankDetails() {
    const id = document.getElementById('bankId').value;
    const bankName = document.getElementById('bankNameInput').value || 'Bank';
    const accountName = document.getElementById('bankAccountNameInput').value || 'Self';
    const branch = document.getElementById('bankBranchInput').value || 'Main';
    const type = document.getElementById('bankTypeInput').value;
    const ifsc = document.getElementById('bankIfscInput').value;
    const currency = document.getElementById('bankCurrencyInput').value;
    const balance = parseFloat(document.getElementById('bankBalanceInput').value) || 0;

    if (id) {
        const b = db.bankAccounts.find(x => x.id === id);
        if (b) { b.bankName = bankName; b.accountName = accountName; b.branch = branch; b.type = type; b.ifsc = ifsc; b.currency = currency; b.balance = balance; }
    } else {
        db.bankAccounts.push({ id: Date.now().toString(), bankName, accountName, branch, type, ifsc, currency, balance });
    }

    saveDatabase();
    renderBankAccountsTable();
    renderAssetLogsTable();
    renderNetWorthAnalysis();
    closeModal('bankModal');
    showToast('Bank account saved');
}

function deleteBankRow(id) {
    requireConfirmation('Delete this bank account?', () => {
        db.bankAccounts = db.bankAccounts.filter(x => x.id !== id);
        saveDatabase();
        renderBankAccountsTable();
        renderAssetLogsTable();
        renderNetWorthAnalysis();
    });
}

function renderLoansTable() {
    const body = document.getElementById('loansTableBody');
    if(!body) return;
    body.innerHTML = '';
    let totalAmount = 0, totalRepaid = 0, totalOutstanding = 0;

    const sortedLoans = [...db.loans].sort((a, b) => {
        const dateA = a.startDate ? (a.startDate.includes('-') ? a.startDate : a.startDate.split('/').reverse().join('-')) : '';
        const dateB = b.startDate ? (b.startDate.includes('-') ? b.startDate : b.startDate.split('/').reverse().join('-')) : '';
        return new Date(dateA) - new Date(dateB);
    });

    sortedLoans.forEach((l, idx) => {
        const amt = parseFloat(l.amount) || 0;
        const rep = parseFloat(l.repaid) || 0;
        const outstanding = amt - rep;
        totalAmount += amt; totalRepaid += rep; totalOutstanding += outstanding;

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-12">${idx + 1}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full font-mono text-xs bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formatToDDMMYYYY(l.startDate)}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full font-mono text-xs bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formatToDDMMYYYY(l.endDate)}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full font-medium bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[250px] w-full">${l.source}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${l.type}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${amt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${rep.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold text-rose-400 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${outstanding.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                <div class="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    <button onclick="openLoanModal('${l.id}')" class="text-slate-500 hover:text-brand-500"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteLoanRow('${l.id}')" class="text-slate-500 hover:text-rose-500"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div></td>
        `;
        body.appendChild(tr);
    });

    const foot = document.getElementById('loansTableFoot');
    if (foot) {
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        foot.innerHTML = `
            <tr>
                <td colspan="5" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Total Liabilities:</td>
                <td class="p-4 text-right align-middle text-brand-500 text-sm font-bold border-none">₹${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                <td class="p-4 text-right align-middle text-emerald-400 text-sm font-bold border-none">₹${totalRepaid.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-lg font-mono tracking-wider font-bold text-rose-400">₹${totalOutstanding.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="border-none"></td>
            </tr>
        `;
    }
}

function openLoanModal(id = null) {
    const idEl = document.getElementById('loanId');
    if (idEl) idEl.value = id || '';
    const todayStr = new Date();
    const titleEl = document.getElementById('loanModalTitle');
    if (id) {
        const l = (db.loans || []).find(x => x.id === id);
        if (l) {
            if (titleEl) titleEl.innerText = 'Edit Credit Facility';
            const sInput = document.getElementById('loanStartDateInput');
            if (sInput && sInput._flatpickr) {
                sInput._flatpickr.setDate(l.startDate && l.startDate.includes('-') ? l.startDate.split('-').reverse().join('/') : (l.startDate || todayStr));
            }
            const eInput = document.getElementById('loanEndDateInput');
            if (eInput && eInput._flatpickr) {
                eInput._flatpickr.setDate(l.endDate && l.endDate.includes('-') ? l.endDate.split('-').reverse().join('/') : (l.endDate || ''));
            }
            if (document.getElementById('loanSourceInput')) document.getElementById('loanSourceInput').value = l.source || '';
            if (document.getElementById('loanTypeInput')) document.getElementById('loanTypeInput').value = l.type || 'Commercial';
            if (document.getElementById('loanAmountInput')) document.getElementById('loanAmountInput').value = l.amount || '';
            if (document.getElementById('loanRepaidInput')) document.getElementById('loanRepaidInput').value = l.repaid || '0';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Credit Facility';
        const sInput = document.getElementById('loanStartDateInput');
        if (sInput && sInput._flatpickr) sInput._flatpickr.setDate(todayStr);
        const eInput = document.getElementById('loanEndDateInput');
        if (eInput && eInput._flatpickr) eInput._flatpickr.clear();
        if (document.getElementById('loanSourceInput')) document.getElementById('loanSourceInput').value = '';
        if (document.getElementById('loanTypeInput')) document.getElementById('loanTypeInput').value = 'Commercial';
        if (document.getElementById('loanAmountInput')) document.getElementById('loanAmountInput').value = '';
        if (document.getElementById('loanRepaidInput')) document.getElementById('loanRepaidInput').value = '0';
    }
    openModal('loanModal');
}

function saveLoanDetails() {
    const id = document.getElementById('loanId').value;
    const startRaw = document.getElementById('loanStartDateInput').value;
    const endRaw = document.getElementById('loanEndDateInput').value;
    let startDate = startRaw, endDate = endRaw;
    if (startRaw && startRaw.includes('-')) {
        const p = startRaw.split('-');
        if (p.length === 3) startDate = `${p[2]}/${p[1]}/${p[0]}`;
    }
    if (endRaw && endRaw.includes('-')) {
        const p = endRaw.split('-');
        if (p.length === 3) endDate = `${p[2]}/${p[1]}/${p[0]}`;
    }
    const source = document.getElementById('loanSourceInput').value || 'Creditor';
    const type = document.getElementById('loanTypeInput').value;
    const amount = parseFloat(document.getElementById('loanAmountInput').value) || 0;
    const repaid = parseFloat(document.getElementById('loanRepaidInput').value) || 0;

    if (id) {
        const l = db.loans.find(x => x.id === id);
        if (l) { l.startDate = startDate; l.endDate = endDate; l.source = source; l.type = type; l.amount = amount; l.repaid = repaid; }
    } else {
        db.loans.push({ id: Date.now().toString(), startDate, endDate, source, type, amount, repaid });
    }

    saveDatabase();
    renderLoansTable();
    renderNetWorthAnalysis();
    closeModal('loanModal');
    showToast('Credit facility saved');
}

function deleteLoanRow(id) {
    requireConfirmation('Delete this credit facility?', () => {
        db.loans = db.loans.filter(x => x.id !== id);
        saveDatabase();
        renderLoansTable();
        renderNetWorthAnalysis();
    });
}

function renderAssetMutualFundsTable() {
    const body = document.getElementById('assetMutualFundsTableBody');
    if(!body) return;
    body.innerHTML = '';
    if (!db.assetMutualFunds) db.assetMutualFunds = [];
    let totalInvested = 0, totalPresent = 0;

    const sortedMFs = [...db.assetMutualFunds].sort((a, b) => {
        if (!a.purchaseDate || !b.purchaseDate) return 0;
        const dateA = a.purchaseDate.split('/').reverse().join('-');
        const dateB = b.purchaseDate.split('/').reverse().join('-');
        return new Date(dateA) - new Date(dateB);
    });

    sortedMFs.forEach((mf, idx) => {
        const qty = parseFloat(mf.qty) || 0;
        const avgBuy = parseFloat(mf.avgBuy) || 0;
        const ltp = parseFloat(mf.ltp) || 0;
        const invested = qty * avgBuy;
        const presentVal = qty * ltp;
        const pnl = presentVal - invested;
        const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
        totalInvested += invested; totalPresent += presentVal;

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-12">${idx + 1}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formatToDDMMYYYY(mf.purchaseDate)}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl uppercase font-bold text-accent-cyan flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-full min-w-[250px]">${mf.symbol}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${mf.type}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${qty.toLocaleString('en-IN')}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${avgBuy.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono text-slate-300 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${invested.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${ltp.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold text-brand-500 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${presentVal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${pnl>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${pnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${pnlPct>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${pnlPct.toFixed(2)}%</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                <div class="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    <button onclick="openAssetMutualFundModal('${mf.id}')" class="text-slate-500 hover:text-brand-500"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteAssetMutualFund('${mf.id}')" class="text-slate-500 hover:text-rose-500"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div></td>
        `;
        body.appendChild(tr);
    });

    const foot = document.getElementById('assetMutualFundsTableFoot');
    if (foot) {
        const totalPnl = totalPresent - totalInvested;
        const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        foot.innerHTML = `
            <tr>
                <td colspan="8" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Total Mutual Funds:</td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-brand-500/30 shadow-[0_0_15px_rgba(201,164,107,0.15)] text-lg font-mono tracking-wider font-bold text-brand-500">₹${totalPresent.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-1.5 rounded-xl bg-surface-950 border ${totalPnl>=0?'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-emerald-400':'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400'} text-base font-mono tracking-wider font-bold">₹${totalPnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-1.5 rounded-xl bg-surface-950 border ${totalPnlPct>=0?'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-emerald-400':'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400'} text-base font-mono tracking-wider font-bold">${totalPnlPct.toFixed(2)}%</span>
                </td>
                <td class="border-none"></td>
            </tr>
        `;
    }
}

function openAssetMutualFundModal(id = null) {
    const idEl = document.getElementById('assetMfId');
    if (idEl) idEl.value = id || '';
    const todayStr = new Date();
    const titleEl = document.getElementById('assetMutualFundModalTitle');
    if (id) {
        if (!db.assetMutualFunds) db.assetMutualFunds = [];
        const mf = db.assetMutualFunds.find(x => x.id === id);
        if (mf) {
            if (titleEl) titleEl.innerText = 'Edit Mutual Fund';
            const dateInput = document.getElementById('assetMfDateInput');
            if (dateInput && dateInput._flatpickr) {
                dateInput._flatpickr.setDate(mf.purchaseDate && mf.purchaseDate.includes('-') ? mf.purchaseDate.split('-').reverse().join('/') : (mf.purchaseDate || todayStr));
            }
            if (document.getElementById('assetMfSymbolInput')) document.getElementById('assetMfSymbolInput').value = mf.symbol || '';
            if (document.getElementById('assetMfTypeInput')) document.getElementById('assetMfTypeInput').value = mf.type || 'Small Cap';
            if (document.getElementById('assetMfQtyInput')) document.getElementById('assetMfQtyInput').value = mf.qty || '';
            if (document.getElementById('assetMfAvgBuyInput')) document.getElementById('assetMfAvgBuyInput').value = mf.avgBuy || '';
            if (document.getElementById('assetMfLtpInput')) document.getElementById('assetMfLtpInput').value = mf.ltp || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add New Mutual Fund';
        const dateInput = document.getElementById('assetMfDateInput');
        if (dateInput && dateInput._flatpickr) dateInput._flatpickr.setDate(todayStr);
        if (document.getElementById('assetMfSymbolInput')) document.getElementById('assetMfSymbolInput').value = '';
        if (document.getElementById('assetMfTypeInput')) document.getElementById('assetMfTypeInput').value = 'Small Cap';
        if (document.getElementById('assetMfQtyInput')) document.getElementById('assetMfQtyInput').value = '';
        if (document.getElementById('assetMfAvgBuyInput')) document.getElementById('assetMfAvgBuyInput').value = '';
        if (document.getElementById('assetMfLtpInput')) document.getElementById('assetMfLtpInput').value = '';
    }
    openModal('assetMutualFundModal');
}

function saveAssetMutualFund() {
    const id = document.getElementById('assetMfId').value;
    const dateRaw = document.getElementById('assetMfDateInput').value;
    let purchaseDate = dateRaw;
    if (dateRaw && dateRaw.includes('-')) {
        const p = dateRaw.split('-');
        if (p.length === 3) purchaseDate = `${p[2]}/${p[1]}/${p[0]}`;
    }
    const symbol = document.getElementById('assetMfSymbolInput').value.trim() || 'FUND';
    const type = document.getElementById('assetMfTypeInput').value;
    const qty = parseFloat(document.getElementById('assetMfQtyInput').value) || 0;
    const avgBuy = parseFloat(document.getElementById('assetMfAvgBuyInput').value) || 0;
    const ltp = parseFloat(document.getElementById('assetMfLtpInput').value) || 0;

    if (!db.assetMutualFunds) db.assetMutualFunds = [];
    if (id) {
        const mf = db.assetMutualFunds.find(x => x.id === id);
        if (mf) { mf.purchaseDate = purchaseDate; mf.symbol = symbol; mf.type = type; mf.qty = qty; mf.avgBuy = avgBuy; mf.ltp = ltp; }
    } else {
        db.assetMutualFunds.push({ id: Date.now().toString(), purchaseDate, symbol, type, qty, avgBuy, ltp });
    }

    saveDatabase();
    renderAssetMutualFundsTable();
    renderAssetLogsTable();
    renderNetWorthAnalysis();
    closeModal('assetMutualFundModal');
    showToast('Mutual fund saved');
}

function deleteAssetMutualFund(id) {
    requireConfirmation('Remove this mutual fund?', () => {
        if (!db.assetMutualFunds) return;
        db.assetMutualFunds = db.assetMutualFunds.filter(x => x.id !== id);
        saveDatabase();
        renderAssetMutualFundsTable();
        renderAssetLogsTable();
        renderNetWorthAnalysis();
    });
}

function renderNetWorthAnalysis() {
    const QAR_TO_INR_RATE = 23.5;

    let bankAssets = 0;
    if (db.bankAccounts) {
        db.bankAccounts.forEach(b => {
            let bal = parseFloat(b.balance) || 0;
            if (b.currency === 'QAR') {
                bal = bal * QAR_TO_INR_RATE;
            }
            bankAssets += bal;
        });
    }

    let mfAssets = 0;
    if (db.assetMutualFunds) {
        db.assetMutualFunds.forEach(mf => {
            let qty = parseFloat(mf.qty) || 0;
            let ltp = parseFloat(mf.ltp) || 0;
            mfAssets += (qty * ltp);
        });
    }

    let physicalAssets = 0;
    if (db.assetLogs) {
        db.assetLogs.forEach(log => {
            physicalAssets += parseFloat(log.value) || 0;
        });
    }

    const totalAssets = bankAssets + mfAssets + physicalAssets;

    let totalLiabilities = 0;
    if (db.loans) {
        db.loans.forEach(l => {
            let amt = parseFloat(l.amount) || 0;
            let rep = parseFloat(l.repaid) || 0;
            totalLiabilities += (amt - rep);
        });
    }

    const netWorth = totalAssets - totalLiabilities;

    const formatINR = (val) => '₹' + val.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    const elTotalAssets = document.getElementById('nwTotalAssets');
    const elTotalLiab = document.getElementById('nwTotalLiabilities');
    const elTotalNW = document.getElementById('nwTotalNetWorth');
    if (elTotalAssets) elTotalAssets.innerText = formatINR(totalAssets);
    if (elTotalLiab) elTotalLiab.innerText = formatINR(totalLiabilities);
    if (elTotalNW) elTotalNW.innerText = formatINR(netWorth);

    const elRepBank = document.getElementById('repBankAssets');
    const elRepMf = document.getElementById('repMfAssets');
    const elRepPhys = document.getElementById('repPhysicalAssets');
    const elRepLiab = document.getElementById('repLiabilities');
    const elRepNW = document.getElementById('repNetWorthFinal');

    if (elRepBank) elRepBank.innerText = formatINR(bankAssets);
    if (elRepMf) elRepMf.innerText = formatINR(mfAssets);
    
    const repEquityRow = document.getElementById('repEquityAssets');
    if (repEquityRow && repEquityRow.parentElement) {
        repEquityRow.parentElement.style.display = 'none';
    }

    if (elRepPhys) elRepPhys.innerText = formatINR(physicalAssets);
    if (elRepLiab) elRepLiab.innerText = '-' + formatINR(totalLiabilities);
    if (elRepNW) elRepNW.innerText = formatINR(netWorth);

    let debtRatio = 0;
    if (totalAssets > 0) {
        debtRatio = (totalLiabilities / totalAssets) * 100;
    }
    const elDebtText = document.getElementById('nwDebtRatioText');
    const elDebtBar = document.getElementById('nwDebtRatioBar');
    const elDebtInsight = document.getElementById('nwDebtRatioInsight');

    if (elDebtText) elDebtText.innerText = debtRatio.toFixed(1) + '%';
    if (elDebtBar) elDebtBar.style.width = Math.min(debtRatio, 100) + '%';
    
    let insightText = "Extremely healthy asset coverage.";
    if(debtRatio > 50) insightText = "High leverage. Consider reducing liabilities.";
    else if(debtRatio > 30) insightText = "Moderate leverage. Manageable debt levels.";
    if (elDebtInsight) elDebtInsight.innerText = insightText;

    const chartCanvas = document.getElementById('nwAllocationChart');
    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        if (window.nwAllocationChartInst) window.nwAllocationChartInst.destroy();

        if (totalAssets > 0 || totalLiabilities > 0) {
            window.nwAllocationChartInst = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Banking & Liquid', 'Mutual Funds', 'Physical Assets'],
                    datasets: [{
                        data: [bankAssets, mfAssets, physicalAssets],
                        backgroundColor: [
                            '#88A3D6',
                            '#34d399',
                            '#C9A46B'
                        ],
                        borderColor: '#070A0F',
                        borderWidth: 2,
                        hoverOffset: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#94a3b8',
                                usePointStyle: true,
                                padding: 20,
                                font: { family: "'JetBrains Mono', monospace", size: 10 }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) { label += ': '; }
                                    if (context.parsed !== null) {
                                        label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}

function renderIndiaOperations() {
    renderShareMarketTable();
    renderOthersTable();
}

function renderOthersTable() {
    const body = document.getElementById('othersTableBody');
    const mobileContainer = document.getElementById('othersMobileCards');
    
    if(!body || !mobileContainer) return;
    
    body.innerHTML = '';
    mobileContainer.innerHTML = '';
    
    if (!db.indiaOps) db.indiaOps = {};
    if (!db.indiaOps.othersEntries) db.indiaOps.othersEntries = [];

    let totalIncome = 0, totalExpense = 0, totalNet = 0;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let filteredEntries = [...db.indiaOps.othersEntries];
    if (eqFilterMode === 'monthly') {
        filteredEntries = filteredEntries.filter(sm => sm.year === eqFilterYear && sm.month.toLowerCase() === eqFilterMonth.toLowerCase());
    } else if (eqFilterMode === 'yearly') {
        filteredEntries = filteredEntries.filter(sm => sm.year === eqFilterYear);
    }

    const sortedEntries = filteredEntries.sort((a, b) => {
        const yearDiff = parseInt(a.year || '2026') - parseInt(b.year || '2026');
        if (yearDiff !== 0) return yearDiff;
        return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
    });

    if (sortedEntries.length === 0) {
        const emptyMsg = `<tr><td colspan="8" class="p-12 text-center text-slate-500 font-light"><div class="flex flex-col items-center justify-center opacity-50"><i class="fa-solid fa-folder-open text-3xl mb-3"></i><p>No miscellaneous entries recorded for the selected filter.</p></div></td></tr>`;
        body.innerHTML = emptyMsg;
        mobileContainer.innerHTML = `<div class="p-8 text-center text-slate-500 font-light text-sm opacity-60"><i class="fa-solid fa-folder-open text-2xl mb-2 block"></i> No records found.</div>`;
        
        const foot = document.getElementById('othersTableFoot');
        if(foot) foot.innerHTML = '';
        return;
    }

    sortedEntries.forEach((entry, idx) => {
        const inc = parseFloat(entry.income) || 0;
        const exp = parseFloat(entry.expense) || 0;
        const net = inc - exp;

        totalIncome += inc;
        totalExpense += exp;
        totalNet += net;

        const isPositive = net >= 0;
        const netColor = isPositive ? 'text-emerald-400' : 'text-rose-400';
        const netBg = isPositive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-[10px] text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-16">${(idx + 1).toString().padStart(2, '0')}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-300 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-24">${entry.year || '2026'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-300 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-32">${entry.month || 'February'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[380px]"><div class="flex flex-col"><span class="font-medium text-slate-200">${entry.desc || '-'}</span>${entry.notes ? `<span class="text-[10px] text-slate-500 font-light mt-0.5 truncate max-w-md" title="${entry.notes}">${entry.notes}</span>` : ''}</div></div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-36">${inc > 0 ? `₹${inc.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono text-slate-400 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-36">${exp > 0 ? `₹${exp.toLocaleString('en-IN', {minimumFractionDigits: 2})}` : '-'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-36 ${netColor}">₹${Math.abs(net).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-center flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-24"><div class="flex items-center justify-center gap-2 w-full"><button onclick="openOthersEntryModal('${entry.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition-colors flex items-center justify-center cursor-pointer" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button><button onclick="deleteOthersEntry('${entry.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button></div></div></td>
        `;
        body.appendChild(tr);

        const card = document.createElement('div');
        card.className = 'p-5 flex flex-col gap-3 hover:bg-surface-800/40 transition-colors';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h5 class="font-medium text-slate-200 text-sm mb-1">${entry.desc || '-'}</h5>
                    <span class="font-mono text-[10px] uppercase tracking-widest text-slate-500 px-2 py-0.5 rounded border border-surface-700 bg-surface-800">${entry.month || 'February'} ${entry.year || '2026'}</span>
                </div>
                <div class="flex gap-2">
                    <button onclick="openOthersEntryModal('${entry.id}')" class="p-2 text-slate-500 hover:text-accent-blue transition-colors"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteOthersEntry('${entry.id}')" class="p-2 text-slate-500 hover:text-rose-500 transition-colors"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            ${entry.notes ? `<p class="text-xs text-slate-400 font-light italic border-l-2 border-surface-700 pl-2 py-0.5">${entry.notes}</p>` : ''}
            <div class="grid grid-cols-3 gap-2 pt-3 mt-1 border-t border-surface-800/50">
                <div class="flex flex-col">
                    <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Income</span>
                    <span class="font-mono text-xs text-slate-300">${inc > 0 ? `₹${inc.toLocaleString('en-IN')}` : '-'}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Expense</span>
                    <span class="font-mono text-xs text-slate-400">${exp > 0 ? `₹${exp.toLocaleString('en-IN')}` : '-'}</span>
                </div>
                <div class="flex flex-col items-end text-right">
                    <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Net Balance</span>
                    <span class="font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${netBg} ${netColor}">
                        ₹${Math.abs(net).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
        `;
        mobileContainer.appendChild(card);
    });

    const foot = document.getElementById('othersTableFoot');
    if (foot) {
        const isTotalPos = totalNet >= 0;
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        foot.innerHTML = `
            <tr>
                <td colspan="4" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Period Ledger Total:</td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-slate-500/30 text-base font-mono tracking-wider font-bold text-slate-300">₹${totalIncome.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-slate-500/30 text-base font-mono tracking-wider font-bold text-slate-400">₹${totalExpense.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border ${isTotalPos ? 'border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]' : 'border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.15)]'} text-lg font-mono tracking-wider font-bold">₹${Math.abs(totalNet).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="border-none"></td>
            </tr>
        `;
    }
}

function openOthersEntryModal(id = null) {
    const idEl = document.getElementById('othersEntryId');
    if (idEl) idEl.value = id || '';
    const titleEl = document.getElementById('othersModalTitle');
    if (id) {
        const entry = ((db.indiaOps && db.indiaOps.othersEntries) || []).find(x => x.id === id);
        if (entry) {
            if (titleEl) titleEl.innerText = 'Edit Ledger Entry';
            if (document.getElementById('othersYearInput')) document.getElementById('othersYearInput').value = entry.year || '2026';
            if (document.getElementById('othersMonthInput')) document.getElementById('othersMonthInput').value = entry.month || 'February';
            if (document.getElementById('othersDescInput')) document.getElementById('othersDescInput').value = entry.desc || '';
            if (document.getElementById('othersIncomeInput')) document.getElementById('othersIncomeInput').value = entry.income || '';
            if (document.getElementById('othersExpenseInput')) document.getElementById('othersExpenseInput').value = entry.expense || '';
            if (document.getElementById('othersNotesInput')) document.getElementById('othersNotesInput').value = entry.notes || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Miscellaneous Ledger Entry';
        if (document.getElementById('othersYearInput')) document.getElementById('othersYearInput').value = eqFilterYear || '2026';
        if (document.getElementById('othersMonthInput')) document.getElementById('othersMonthInput').value = eqFilterMonth || 'February';
        if (document.getElementById('othersDescInput')) document.getElementById('othersDescInput').value = '';
        if (document.getElementById('othersIncomeInput')) document.getElementById('othersIncomeInput').value = '';
        if (document.getElementById('othersExpenseInput')) document.getElementById('othersExpenseInput').value = '';
        if (document.getElementById('othersNotesInput')) document.getElementById('othersNotesInput').value = '';
    }
    openModal('othersEntryModal');
}

function saveOthersEntry() {
    const id = document.getElementById('othersEntryId').value;
    const year = document.getElementById('othersYearInput').value;
    const month = document.getElementById('othersMonthInput').value;
    const desc = document.getElementById('othersDescInput').value.trim() || 'Entry';
    const income = parseFloat(document.getElementById('othersIncomeInput').value) || 0;
    const expense = parseFloat(document.getElementById('othersExpenseInput').value) || 0;
    const notes = document.getElementById('othersNotesInput').value.trim();

    if (!db.indiaOps) db.indiaOps = {};
    if (!db.indiaOps.othersEntries) db.indiaOps.othersEntries = [];

    if (id) {
        const entry = db.indiaOps.othersEntries.find(x => x.id === id);
        if (entry) {
            entry.year = year;
            entry.month = month;
            entry.desc = desc;
            entry.income = income;
            entry.expense = expense;
            entry.notes = notes;
        }
    } else {
        db.indiaOps.othersEntries.push({
            id: Date.now().toString(),
            year,
            month,
            desc,
            income,
            expense,
            notes
        });
    }

    saveDatabase();
    renderOthersTable();
    closeModal('othersEntryModal');
    showToast('Ledger entry saved successfully');
}

function deleteOthersEntry(id) {
    requireConfirmation('Delete this miscellaneous ledger entry?', () => {
        if (!db.indiaOps || !db.indiaOps.othersEntries) return;
        db.indiaOps.othersEntries = db.indiaOps.othersEntries.filter(x => x.id !== id);
        saveDatabase();
        renderOthersTable();
    });
}

function renderShareMarketTable() {
    const body = document.getElementById('shareMarketTableBody');
    if (!body) return;
    body.innerHTML = '';
    let totalInvested = 0, totalCurrent = 0;

    if (!db.indiaOps) db.indiaOps = {};
    if (!db.indiaOps.shareMarket) db.indiaOps.shareMarket = [];

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let filteredList = [...db.indiaOps.shareMarket];
    if (eqFilterMode === 'monthly') {
        filteredList = filteredList.filter(sm => sm.year === eqFilterYear && sm.month.toLowerCase() === eqFilterMonth.toLowerCase());
    } else if (eqFilterMode === 'yearly') {
        filteredList = filteredList.filter(sm => sm.year === eqFilterYear);
    }

    const sortedList = filteredList.sort((a, b) => {
        const yearDiff = parseInt(a.year || '2026') - parseInt(b.year || '2026');
        if (yearDiff !== 0) return yearDiff;
        return monthNames.indexOf(a.month) - monthNames.indexOf(b.month);
    });

    if (sortedList.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="8" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-chart-pie text-2xl mb-2 block opacity-40"></i> No equity positions found for ${eqFilterMonth} ${eqFilterYear}. Click "+ Log Trade" above to add one.</td>`;
        body.appendChild(tr);
    }

    sortedList.forEach((sm, idx) => {
        const inv = parseFloat(sm.invested) || 0;
        const cur = parseFloat(sm.current) || 0;
        const pnl = cur - inv;
        const pnlPct = inv > 0 ? (pnl / inv) * 100 : 0;
        totalInvested += inv; totalCurrent += cur;

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/30 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-12">${idx + 1}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${sm.year}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors font-mono text-xs">${sm.month}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-full min-w-[250px]"><span class="uppercase font-bold text-accent-cyan tracking-wide">${sm.script}</span>${sm.notes ? `<span class="text-[10px] text-slate-500 font-light ml-2 truncate max-w-xs" title="${sm.notes}">(${sm.notes})</span>` : ''}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${inv.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors font-bold text-brand-500">₹${cur.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${pnl>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${pnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${pnlPct>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${pnlPct.toFixed(2)}%</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                <div class="flex items-center justify-center gap-2 w-full">
                    <button onclick="openShareMarketModal('${sm.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition-colors flex items-center justify-center cursor-pointer" title="Edit Position"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteShareMarketRow('${sm.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer" title="Delete Position"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div></td>
        `;
        body.appendChild(tr);
    });

    // Mobile Cards View
    const mobileContainer = document.getElementById('shareMarketMobileCards');
    if (mobileContainer) {
        mobileContainer.innerHTML = '';
        if (sortedList.length === 0) {
            mobileContainer.innerHTML = `<div class="p-6 text-center text-slate-500 text-xs font-light"><i class="fa-solid fa-chart-line text-2xl mb-2 block opacity-40"></i> No equity positions found. Click "+ Log Trade" to record one.</div>`;
        } else {
            sortedList.forEach(sm => {
                const inv = parseFloat(sm.invested) || 0;
                const cur = parseFloat(sm.current) || 0;
                const pnl = cur - inv;
                const pnlPct = inv > 0 ? (pnl / inv) * 100 : 0;
                const pnlColor = pnl >= 0 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10';
                const card = document.createElement('div');
                card.className = 'p-5 flex flex-col gap-3 hover:bg-surface-800/40 transition-colors';
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h5 class="font-bold text-white text-sm tracking-wide uppercase">${sm.script}</h5>
                            <span class="font-mono text-[10px] uppercase tracking-widest text-slate-500 px-2 py-0.5 rounded border border-surface-700 bg-surface-800">${sm.month || 'February'} ${sm.year || '2026'}</span>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="openShareMarketModal('${sm.id}')" class="p-2 text-slate-400 hover:text-brand-500 transition-colors cursor-pointer" title="Edit"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="deleteShareMarketRow('${sm.id}')" class="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" title="Delete"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    ${sm.notes ? `<p class="text-xs text-slate-400 font-light italic border-l-2 border-surface-700 pl-2 py-0.5">${sm.notes}</p>` : ''}
                    <div class="grid grid-cols-3 gap-2 pt-3 mt-1 border-t border-surface-800/50">
                        <div class="flex flex-col">
                            <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Invested</span>
                            <span class="font-mono text-xs text-slate-300">₹${inv.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Current Val</span>
                            <span class="font-mono text-xs font-bold text-brand-500">₹${cur.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="flex flex-col items-end text-right">
                            <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">P&L (${pnlPct.toFixed(1)}%)</span>
                            <span class="font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${pnlColor}">
                                ${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </span>
                        </div>
                    </div>
                `;
                mobileContainer.appendChild(card);
            });
        }
    }

    const foot = document.getElementById('shareMarketTableFoot');
    if (foot) {
        const totalPnl = totalCurrent - totalInvested;
        const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        foot.innerHTML = `
            <tr>
                <td colspan="4" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Period Totals:</td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-slate-500/30 text-base font-mono tracking-wider font-bold text-slate-300">₹${totalInvested.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-brand-500/30 shadow-[0_0_15px_rgba(201,164,107,0.15)] text-lg font-mono tracking-wider font-bold text-brand-500">₹${totalCurrent.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-1.5 rounded-xl bg-surface-950 border ${totalPnl>=0?'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-emerald-400':'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400'} text-base font-mono tracking-wider font-bold">₹${totalPnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-1.5 rounded-xl bg-surface-950 border ${totalPnlPct>=0?'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-emerald-400':'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400'} text-base font-mono tracking-wider font-bold">${totalPnlPct.toFixed(2)}%</span>
                </td>
                <td class="border-none"></td>
            </tr>
        `;
    }
}

function openShareMarketModal(id = null) {
    const idField = document.getElementById('shareTradeId');
    if (idField) idField.value = id || '';
    
    if (id) {
        const sm = db.indiaOps.shareMarket.find(x => x.id === id);
        if (sm) {
            const titleEl = document.getElementById('shareTradeModalTitle');
            if (titleEl) titleEl.innerText = 'Edit Equity Trade';
            if (document.getElementById('shareYearInput')) document.getElementById('shareYearInput').value = sm.year;
            if (document.getElementById('shareMonthInput')) document.getElementById('shareMonthInput').value = sm.month;
            if (document.getElementById('shareParticularsInput')) document.getElementById('shareParticularsInput').value = sm.script || '';
            const inv = parseFloat(sm.invested) || 0;
            const cur = parseFloat(sm.current) || 0;
            const pnl = cur - inv;
            if (document.getElementById('shareCapitalInput')) document.getElementById('shareCapitalInput').value = inv || '';
            if (document.getElementById('sharePnlInput')) document.getElementById('sharePnlInput').value = pnl || '';
            if (document.getElementById('shareDescInput')) document.getElementById('shareDescInput').value = sm.notes || '';
        }
    } else {
        const titleEl = document.getElementById('shareTradeModalTitle');
        if (titleEl) titleEl.innerText = 'Log Equities Trade';
        if (document.getElementById('shareYearInput')) document.getElementById('shareYearInput').value = eqFilterYear || '2026';
        if (document.getElementById('shareMonthInput')) document.getElementById('shareMonthInput').value = eqFilterMonth || 'February';
        if (document.getElementById('shareParticularsInput')) document.getElementById('shareParticularsInput').value = '';
        if (document.getElementById('shareCapitalInput')) document.getElementById('shareCapitalInput').value = '';
        if (document.getElementById('sharePnlInput')) document.getElementById('sharePnlInput').value = '';
        if (document.getElementById('shareDescInput')) document.getElementById('shareDescInput').value = '';
    }
    openModal('shareTradeModal');
}
window.openShareTradeModal = openShareMarketModal;

function saveShareTrade() {
    const idField = document.getElementById('shareTradeId');
    const id = idField ? idField.value : '';
    const year = document.getElementById('shareYearInput') ? document.getElementById('shareYearInput').value : (eqFilterYear || '2026');
    const month = document.getElementById('shareMonthInput') ? document.getElementById('shareMonthInput').value : (eqFilterMonth || 'February');
    const script = (document.getElementById('shareParticularsInput') ? document.getElementById('shareParticularsInput').value.trim() : '') || 'SCRIPT';
    const invested = parseFloat(document.getElementById('shareCapitalInput') ? document.getElementById('shareCapitalInput').value : 0) || 0;
    const pnl = parseFloat(document.getElementById('sharePnlInput') ? document.getElementById('sharePnlInput').value : 0) || 0;
    const current = invested + pnl;
    const notes = document.getElementById('shareDescInput') ? document.getElementById('shareDescInput').value.trim() : '';

    if (!db.indiaOps) db.indiaOps = {};
    if (!db.indiaOps.shareMarket) db.indiaOps.shareMarket = [];

    if (id) {
        const sm = db.indiaOps.shareMarket.find(x => x.id === id);
        if (sm) {
            sm.year = year;
            sm.month = month;
            sm.script = script;
            sm.invested = invested;
            sm.current = current;
            sm.notes = notes;
        }
    } else {
        db.indiaOps.shareMarket.push({
            id: Date.now().toString(),
            year,
            month,
            script,
            invested,
            current,
            notes
        });
    }

    saveDatabase();
    renderShareMarketTable();
    closeModal('shareTradeModal');
    showToast('Equity trade recorded successfully');
}
window.saveShareMarketDetails = saveShareTrade;

function deleteShareMarketRow(id) {
    requireConfirmation('Delete this equity position?', () => {
        if (!db.indiaOps || !db.indiaOps.shareMarket) return;
        db.indiaOps.shareMarket = db.indiaOps.shareMarket.filter(x => x.id !== id);
        saveDatabase();
        renderShareMarketTable();
        showToast('Equity position deleted');
    });
}

function setBudgetFilter(mode, noRender = false) {
    budgetFilterMode = mode.toLowerCase();
    
    if (!db.preferences) db.preferences = {};
    db.preferences.budgetFilterMode = budgetFilterMode;
    if (!noRender) saveDatabase();
    
    ['Monthly', 'Yearly', 'All'].forEach(m => {
        const btn = document.getElementById(`btnBudget${m}`);
        if (btn) {
            if (budgetFilterMode === m.toLowerCase()) {
                btn.className = 'px-2.5 py-1 rounded-md bg-brand-600 text-surface-950 font-bold transition-all shadow-[0_0_10px_rgba(0,255,157,0.3)] text-[10px] uppercase tracking-wider';
            } else {
                btn.className = 'px-2.5 py-1 rounded-md bg-transparent text-slate-400 hover:text-white hover:bg-surface-800 transition-all text-[10px] uppercase tracking-wider';
            }
        }
    });

    const monthSel = document.getElementById('budgetMonthSelect');
    const yearSel = document.getElementById('budgetYearSelect');
    const selContainer = document.getElementById('budgetSelectors');

    if (selContainer && monthSel && yearSel) {
        if (budgetFilterMode === 'monthly') {
            selContainer.classList.remove('hidden');
            monthSel.classList.remove('hidden');
            yearSel.classList.remove('hidden');
        } else if (budgetFilterMode === 'yearly') {
            selContainer.classList.remove('hidden');
            monthSel.classList.add('hidden');
            yearSel.classList.remove('hidden');
        } else {
            selContainer.classList.add('hidden');
        }
    }

    if (!noRender) renderBudgetsAndGoals();
}

window.updateBudgetFilters = function() {
    const m = document.getElementById('budgetMonthSelect');
    const y = document.getElementById('budgetYearSelect');
    if (m) budgetFilterMonth = m.value;
    if (y) budgetFilterYear = y.value;
    
    if (!db.preferences) db.preferences = {};
    db.preferences.budgetFilterMonth = budgetFilterMonth;
    db.preferences.budgetFilterYear = budgetFilterYear;
    saveDatabase();
    
    renderBudgetsAndGoals();
};

function renderBudgetsAndGoals() {
    renderBudgetBlock('QAR', 'qatarBudgetTableBody', 'qatarBudgetTableFoot');
    renderBudgetBlock('INR', 'indiaBudgetTableBody', 'indiaBudgetTableFoot');
}

function renderBudgetBlock(curr, tableBodyId, tableFootId) {
    const body = document.getElementById(tableBodyId);
    if (!body) return;
    body.innerHTML = '';

    const isQAR = curr === 'QAR';
    const currSymbol = isQAR ? 'QR ' : '₹';
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let filteredBudgets = (db.budget && db.budget[curr]) ? [...db.budget[curr]] : [];
    if (budgetFilterMode === 'monthly') {
        filteredBudgets = filteredBudgets.filter(b => (b.year || '2026') === budgetFilterYear && (b.month || 'February').toLowerCase() === budgetFilterMonth.toLowerCase());
    } else if (budgetFilterMode === 'yearly') {
        filteredBudgets = filteredBudgets.filter(b => (b.year || '2026') === budgetFilterYear);
    }

    const sortedBudgets = filteredBudgets.sort((a, b) => {
        const yearDiff = parseInt(a.year || '2026') - parseInt(b.year || '2026');
        if (yearDiff !== 0) return yearDiff;
        return monthNames.indexOf(a.month || 'January') - monthNames.indexOf(b.month || 'January');
    });

    let totalBudgetSum = 0;
    let totalSpendSum = 0;

    const getExpenseSpend = (budgetCat, bYear, bMonth) => {
        return (db.dailyExpenses || []).filter(e => {
            if ((e.currency || 'INR') !== curr) return false;
            if (budgetCat && e.category && e.category.toLowerCase() !== budgetCat.toLowerCase()) return false;
            if (!e.date) return true;
            let d;
            if (e.date.includes('/')) {
                const p = e.date.split('/');
                d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
            } else {
                d = new Date(e.date);
            }
            if (isNaN(d.getTime())) return true;
            if (budgetFilterMode === 'monthly' || bMonth) {
                const expMonth = d.toLocaleString('default', { month: 'long' }).toLowerCase();
                const expYear = d.getFullYear().toString();
                return expMonth === (bMonth || budgetFilterMonth).toLowerCase() && expYear === (bYear || budgetFilterYear);
            } else if (budgetFilterMode === 'yearly' || bYear) {
                return d.getFullYear().toString() === (bYear || budgetFilterYear);
            }
            return true;
        }).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    };

    if (sortedBudgets.length === 0) {
        body.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-scale-balanced text-2xl mb-2 block opacity-40"></i> No planned budget items found for this selection. Click "+ Add ${curr} Budget" above to create one.</td></tr>`;
    }

    sortedBudgets.forEach((b, idx) => {
        const budgetAmt = parseFloat(b.amount) || 0;
        const spendAmt = getExpenseSpend(b.category, b.year, b.month);
        const variance = budgetAmt - spendAmt;
        totalBudgetSum += budgetAmt;
        totalSpendSum += spendAmt;

        let statusBadge = '';
        if (spendAmt === 0) {
            statusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-slate-700 bg-surface-900 text-slate-400">Planned</span>`;
        } else if (variance >= 0) {
            statusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold">Within Budget</span>`;
        } else {
            statusBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold">Over Budget</span>`;
        }

        const varClass = variance >= 0 ? 'text-emerald-400' : 'text-rose-400';
        const varSign = variance < 0 ? '-' : '+';
        const varDisplay = `${varSign}${currSymbol}${Math.abs(variance).toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors border-b border-surface-800/30 last:border-0';
        tr.innerHTML = `
            <td class="py-2.5 px-2 text-center font-mono text-xs text-slate-400">${idx + 1}</td>
            <td class="py-2.5 px-2 font-mono text-xs text-slate-300 font-medium">${b.month || 'All'} ${b.year || '2026'}</td>
            <td class="py-2.5 px-2 font-semibold text-slate-100 flex items-center gap-2">
                <span>${b.category}</span>
                ${b.notes ? `<span class="text-[10px] text-slate-500 font-normal italic">(${b.notes})</span>` : ''}
            </td>
            <td class="py-2.5 px-2 text-right font-bold text-slate-200 font-mono">${currSymbol}${budgetAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            <td class="py-2.5 px-2 text-right font-bold text-rose-400 font-mono">${currSymbol}${spendAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            <td class="py-2.5 px-2 text-right font-bold font-mono ${varClass}">${varDisplay}</td>
            <td class="py-2.5 px-2">${statusBadge}</td>
            <td class="py-2.5 px-2 text-center">
                <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="openBudgetModal('${curr}', '${b.id}')" class="p-1 text-slate-400 hover:text-brand-500 transition-colors" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteBudget('${curr}', '${b.id}')" class="p-1 text-slate-400 hover:text-rose-500 transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </td>
        `;
        body.appendChild(tr);
    });

    const foot = document.getElementById(tableFootId);
    if (foot) {
        const netVariance = totalBudgetSum - totalSpendSum;
        const netVarClass = netVariance >= 0 ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30';
        const netSign = netVariance < 0 ? '-' : '+';
        foot.innerHTML = `
            <tr class="border-t-2 border-surface-700 bg-surface-900/90 font-mono text-xs">
                <td colspan="3" class="py-3 px-3 uppercase text-slate-400 tracking-wider font-bold">Total (${curr})</td>
                <td class="py-3 px-2 text-right font-bold text-slate-100">${currSymbol}${totalBudgetSum.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                <td class="py-3 px-2 text-right font-bold text-rose-400">${currSymbol}${totalSpendSum.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                <td class="py-3 px-2 text-right font-bold ${netVarClass}">${netSign}${currSymbol}${Math.abs(netVariance).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                <td colspan="2" class="py-3 px-2 text-center text-slate-400 text-[10px]">
                    <span class="px-2 py-0.5 rounded-md border bg-surface-950 ${netVarClass}">${netVariance >= 0 ? 'Net Surplus' : 'Net Deficit'}</span>
                </td>
            </tr>
        `;
    }
}

function toggleBudgetCategoryInput() {
    const sel = document.getElementById('budgetCategoryInput');
    const custom = document.getElementById('budgetCustomCategoryInput');
    if (sel && custom) {
        if (sel.value === 'Others') {
            custom.classList.remove('hidden');
        } else {
            custom.classList.add('hidden');
        }
    }
}

function toggleDailyExpCategoryInput() {
    const sel = document.getElementById('dailyExpCategoryInput');
    const custom = document.getElementById('dailyExpCustomCategoryInput');
    if (sel && custom) {
        if (sel.value === 'Others') {
            custom.classList.remove('hidden');
        } else {
            custom.classList.add('hidden');
        }
    }
}

function openBudgetModal(currency, id = null) {
    const currEl = document.getElementById('budgetModalCurrency') || document.getElementById('budgetCurrencyInput');
    if (currEl) currEl.value = currency;
    const idEl = document.getElementById('budgetId');
    if (idEl) idEl.value = id || '';
    
    if (id) {
        const list = (db.budget && db.budget[currency]) ? db.budget[currency] : [];
        const b = list.find(x => x.id === id);
        if (b) {
            const titleEl = document.getElementById('budgetModalTitle');
            if (titleEl) titleEl.innerText = `Edit ${currency} Planned Budget`;
            if (document.getElementById('budgetYearInput')) document.getElementById('budgetYearInput').value = b.year || '2026';
            if (document.getElementById('budgetMonthInput')) document.getElementById('budgetMonthInput').value = b.month || 'February';
            if (document.getElementById('budgetCategoryInput')) document.getElementById('budgetCategoryInput').value = b.category || 'Family Maintenance';
            if (document.getElementById('budgetAmountInput')) document.getElementById('budgetAmountInput').value = b.amount || '';
            if (document.getElementById('budgetNotesInput')) document.getElementById('budgetNotesInput').value = b.notes || '';
        }
    } else {
        const titleEl = document.getElementById('budgetModalTitle');
        if (titleEl) titleEl.innerText = `Add ${currency} Planned Budget`;
        if (document.getElementById('budgetYearInput')) document.getElementById('budgetYearInput').value = budgetFilterYear || '2026';
        if (document.getElementById('budgetMonthInput')) document.getElementById('budgetMonthInput').value = budgetFilterMonth || 'February';
        if (document.getElementById('budgetCategoryInput')) document.getElementById('budgetCategoryInput').value = 'Family Maintenance';
        if (document.getElementById('budgetAmountInput')) document.getElementById('budgetAmountInput').value = '';
        if (document.getElementById('budgetNotesInput')) document.getElementById('budgetNotesInput').value = '';
    }
    toggleBudgetCategoryInput();
    openModal('budgetModal');
}

function saveBudgetEntry() {
    const currEl = document.getElementById('budgetModalCurrency') || document.getElementById('budgetCurrencyInput');
    const curr = currEl ? currEl.value : 'INR';
    const idEl = document.getElementById('budgetId');
    const id = idEl ? idEl.value : '';
    const year = (document.getElementById('budgetYearInput') ? document.getElementById('budgetYearInput').value : '') || '2026';
    const month = (document.getElementById('budgetMonthInput') ? document.getElementById('budgetMonthInput').value : '') || 'February';
    let category = (document.getElementById('budgetCategoryInput') ? document.getElementById('budgetCategoryInput').value : '') || 'Family Maintenance';
    if (category === 'Others') {
        const customCat = (document.getElementById('budgetCustomCategoryInput') ? document.getElementById('budgetCustomCategoryInput').value.trim() : '');
        if (customCat) category = customCat;
    }
    const amount = parseFloat(document.getElementById('budgetAmountInput') ? document.getElementById('budgetAmountInput').value : 0) || 0;
    const notes = document.getElementById('budgetNotesInput') ? document.getElementById('budgetNotesInput').value.trim() : '';

    if (!db.budget) db.budget = { INR: [], QAR: [] };
    if (!db.budget[curr]) db.budget[curr] = [];
    
    if (id) {
        const b = db.budget[curr].find(x => x.id === id);
        if (b) { b.year = year; b.month = month; b.category = category; b.amount = amount; b.notes = notes; }
    } else {
        db.budget[curr].push({ id: Date.now().toString(), year, month, category, amount, notes });
    }

    saveDatabase();
    renderBudgetsAndGoals();
    closeModal('budgetModal');
    showToast('Planned budget updated');
}
window.saveBudgetDetails = saveBudgetEntry;

function deleteBudget(currency, id) {
    requireConfirmation('Delete this budget item?', () => {
        if (db.budget && db.budget[currency]) {
            db.budget[currency] = db.budget[currency].filter(x => x.id !== id);
            saveDatabase();
            renderBudgetsAndGoals();
        }
    });
}

function openDailyExpenseModal(currency, id = null) {
    const currEl = document.getElementById('dailyExpenseCurrency') || document.getElementById('dailyExpenseCurrencyInput');
    if (currEl) currEl.value = currency;
    const idEl = document.getElementById('dailyExpenseId');
    if (idEl) idEl.value = id || '';
    
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    if (id) {
        const exp = (db.dailyExpenses || []).find(x => x.id === id);
        if (exp) {
            const titleEl = document.getElementById('dailyExpenseModalTitle');
            if (titleEl) titleEl.innerText = `Edit ${currency} Expense`;
            const dateInput = document.getElementById('dailyExpDateInput') || document.getElementById('dailyExpenseDateInput');
            if (dateInput) {
                if (dateInput._flatpickr) {
                    dateInput._flatpickr.setDate(exp.date && exp.date.includes('-') ? exp.date.split('-').reverse().join('/') : (exp.date || todayStr));
                } else {
                    dateInput.value = exp.date || todayStr;
                }
            }
            const catEl = document.getElementById('dailyExpCategoryInput') || document.getElementById('dailyExpenseCategoryInput');
            if (catEl) catEl.value = exp.category || 'Family Maintenance';
            const descEl = document.getElementById('dailyExpDescInput') || document.getElementById('dailyExpenseItemInput');
            if (descEl) descEl.value = exp.particulars || exp.item || '';
            const amtEl = document.getElementById('dailyExpAmountInput') || document.getElementById('dailyExpenseAmountInput');
            if (amtEl) amtEl.value = exp.amount || '';
        }
    } else {
        const titleEl = document.getElementById('dailyExpenseModalTitle');
        if (titleEl) titleEl.innerText = `Log ${currency} Expense`;
        const dateInput = document.getElementById('dailyExpDateInput') || document.getElementById('dailyExpenseDateInput');
        if (dateInput) {
            if (dateInput._flatpickr) {
                dateInput._flatpickr.setDate(new Date());
            } else {
                dateInput.value = todayStr;
            }
        }
        const catEl = document.getElementById('dailyExpCategoryInput') || document.getElementById('dailyExpenseCategoryInput');
        if (catEl) catEl.value = 'Family Maintenance';
        const descEl = document.getElementById('dailyExpDescInput') || document.getElementById('dailyExpenseItemInput');
        if (descEl) descEl.value = '';
        const amtEl = document.getElementById('dailyExpAmountInput') || document.getElementById('dailyExpenseAmountInput');
        if (amtEl) amtEl.value = '';
    }
    toggleDailyExpCategoryInput();
    openModal('dailyExpenseModal');
}

function saveDailyExpense() {
    const currEl = document.getElementById('dailyExpenseCurrency') || document.getElementById('dailyExpenseCurrencyInput');
    const curr = currEl ? currEl.value : 'INR';
    const idEl = document.getElementById('dailyExpenseId');
    const id = idEl ? idEl.value : '';
    
    const dateInput = document.getElementById('dailyExpDateInput') || document.getElementById('dailyExpenseDateInput');
    let date = dateInput ? dateInput.value : '';
    if (!date) date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (date.includes('-')) {
        const parts = date.split('-');
        if (parts.length === 3) date = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    let category = (document.getElementById('dailyExpCategoryInput') || document.getElementById('dailyExpenseCategoryInput')) ? (document.getElementById('dailyExpCategoryInput') || document.getElementById('dailyExpenseCategoryInput')).value : 'Family Maintenance';
    if (category === 'Others') {
        const customCat = (document.getElementById('dailyExpCustomCategoryInput') ? document.getElementById('dailyExpCustomCategoryInput').value.trim() : '');
        if (customCat) category = customCat;
    }
    
    const descEl = document.getElementById('dailyExpDescInput') || document.getElementById('dailyExpenseItemInput');
    const particulars = (descEl ? descEl.value.trim() : '') || 'Expense';
    const amtEl = document.getElementById('dailyExpAmountInput') || document.getElementById('dailyExpenseAmountInput');
    const amount = parseFloat(amtEl ? amtEl.value : 0) || 0;

    if (!db.dailyExpenses) db.dailyExpenses = [];
    if (id) {
        const exp = db.dailyExpenses.find(x => x.id === id);
        if (exp) {
            exp.currency = curr;
            exp.date = date;
            exp.particulars = particulars;
            exp.item = particulars;
            exp.category = category;
            exp.amount = amount;
        }
    } else {
        db.dailyExpenses.push({
            id: Date.now().toString(),
            currency: curr,
            date,
            particulars,
            item: particulars,
            category,
            amount
        });
    }

    saveDatabase();
    renderBudgetsAndGoals();
    closeModal('dailyExpenseModal');
    showToast('Outflow expense logged');
}
window.saveDailyExpenseDetails = saveDailyExpense;

function deleteDailyExpense(id) {
    requireConfirmation('Delete this expense entry?', () => {
        if (db.dailyExpenses) {
            db.dailyExpenses = db.dailyExpenses.filter(x => x.id !== id);
            saveDatabase();
            renderBudgetsAndGoals();
            if (!document.getElementById('dailyExpenseLogModal').classList.contains('hidden')) {
                renderDailyExpensesLogTable();
            }
        }
    });
}

let logFilterMode = 'all';
let logFilterMonth = new Date().toLocaleString('default', { month: 'long' });
let logFilterYear = new Date().getFullYear().toString();
let activeLogCurrency = 'ALL';

function setLogViewFilter(mode) {
    logFilterMode = mode;
    const btnAll = document.getElementById('btnLogAll');
    const btnMonthly = document.getElementById('btnLogMonthly');
    const btnYearly = document.getElementById('btnLogYearly');
    const selectors = document.getElementById('logSelectors');
    const monthSelect = document.getElementById('logMonthSelect');

    [btnAll, btnMonthly, btnYearly].forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-brand-600', 'text-surface-950', 'font-bold', 'shadow-[0_0_10px_rgba(0,255,157,0.3)]');
            btn.classList.add('bg-transparent', 'text-slate-400');
        }
    });

    if (mode === 'all') {
        if (btnAll) {
            btnAll.classList.remove('bg-transparent', 'text-slate-400');
            btnAll.classList.add('bg-brand-600', 'text-surface-950', 'font-bold', 'shadow-[0_0_10px_rgba(0,255,157,0.3)]');
        }
        if (selectors) selectors.classList.add('hidden');
    } else if (mode === 'yearly') {
        if (btnYearly) {
            btnYearly.classList.remove('bg-transparent', 'text-slate-400');
            btnYearly.classList.add('bg-brand-600', 'text-surface-950', 'font-bold', 'shadow-[0_0_10px_rgba(0,255,157,0.3)]');
        }
        if (selectors) selectors.classList.remove('hidden');
        if (monthSelect) monthSelect.classList.add('hidden');
    } else if (mode === 'monthly') {
        if (btnMonthly) {
            btnMonthly.classList.remove('bg-transparent', 'text-slate-400');
            btnMonthly.classList.add('bg-brand-600', 'text-surface-950', 'font-bold', 'shadow-[0_0_10px_rgba(0,255,157,0.3)]');
        }
        if (selectors) selectors.classList.remove('hidden');
        if (monthSelect) monthSelect.classList.remove('hidden');
    }

    renderDailyExpensesLogTable();
}
window.setLogViewFilter = setLogViewFilter;

function updateLogFilters() {
    const monthEl = document.getElementById('logMonthSelect');
    const yearEl = document.getElementById('logYearSelect');
    if (monthEl) logFilterMonth = monthEl.value;
    if (yearEl) logFilterYear = yearEl.value;
    renderDailyExpensesLogTable();
}
window.updateLogFilters = updateLogFilters;

function openDailyExpenseLogModal(currency = 'ALL') {
    activeLogCurrency = currency;
    const titleEl = document.getElementById('dailyExpenseLogModalTitle');
    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-list-check text-brand-500"></i> ${currency !== 'ALL' ? currency + ' ' : ''}Daily Outflows Log`;
    }
    
    const yearEl = document.getElementById('logYearSelect');
    const monthEl = document.getElementById('logMonthSelect');
    if (yearEl) yearEl.value = logFilterYear;
    if (monthEl) monthEl.value = logFilterMonth;
    
    setLogViewFilter(logFilterMode || 'all');
    openModal('dailyExpenseLogModal');
}
window.openDailyExpenseLogModal = openDailyExpenseLogModal;

function renderDailyExpensesLogTable() {
    const body = document.getElementById('dailyExpensesTableBody');
    if (!body) return;
    body.innerHTML = '';

    let list = (db.dailyExpenses || []).slice();
    if (activeLogCurrency && activeLogCurrency !== 'ALL') {
        list = list.filter(e => (e.currency || 'INR') === activeLogCurrency);
    }

    if (logFilterMode === 'monthly') {
        list = list.filter(e => {
            if (!e.date) return false;
            let d;
            if (e.date.includes('/')) {
                const parts = e.date.split('/');
                d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else {
                d = new Date(e.date);
            }
            if (isNaN(d.getTime())) return true;
            const m = d.toLocaleString('default', { month: 'long' });
            const y = d.getFullYear().toString();
            return m.toLowerCase() === logFilterMonth.toLowerCase() && y === logFilterYear;
        });
    } else if (logFilterMode === 'yearly') {
        list = list.filter(e => {
            if (!e.date) return false;
            let d;
            if (e.date.includes('/')) {
                const parts = e.date.split('/');
                d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            } else {
                d = new Date(e.date);
            }
            if (isNaN(d.getTime())) return true;
            return d.getFullYear().toString() === logFilterYear;
        });
    }

    if (list.length === 0) {
        body.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-light"><i class="fa-solid fa-receipt text-2xl mb-2 block opacity-40"></i> No expense records found for this selection.</td></tr>`;
        return;
    }

    list.sort((a, b) => {
        const parseDate = (dStr) => {
            if (!dStr) return 0;
            if (dStr.includes('/')) {
                const p = dStr.split('/');
                return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0])).getTime();
            }
            return new Date(dStr).getTime();
        };
        return parseDate(b.date) - parseDate(a.date);
    });

    list.forEach(exp => {
        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0';
        const curr = exp.currency || 'INR';
        const currColor = curr === 'QAR' ? 'text-[#8A1538] border-rose-900/40 bg-rose-950/20' : 'text-brand-500 border-brand-500/30 bg-brand-950/20';
        const amt = parseFloat(exp.amount) || 0;
        const particularText = exp.particulars || exp.item || 'Expense';

        tr.innerHTML = `
            <td class="py-3 px-4 font-mono text-xs text-slate-400">${exp.date || '-'}</td>
            <td class="py-3 px-4"><span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${currColor}">${curr}</span></td>
            <td class="py-3 px-4 text-slate-300 font-medium">${exp.category || 'General'}</td>
            <td class="py-3 px-4 text-white font-medium">${particularText}</td>
            <td class="py-3 px-4 text-right font-mono font-bold text-slate-200">${curr === 'QAR' ? 'QR ' : '₹'}${amt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
            <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="openDailyExpenseModal('${curr}', '${exp.id}')" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition-colors flex items-center justify-center"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteDailyExpenseFromLog('${exp.id}')" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </td>
        `;
        body.appendChild(tr);
    });
}
window.renderDailyExpensesLogTable = renderDailyExpensesLogTable;

function deleteDailyExpenseFromLog(id) {
    requireConfirmation('Delete this expense entry?', () => {
        if (db.dailyExpenses) {
            db.dailyExpenses = db.dailyExpenses.filter(x => x.id !== id);
            saveDatabase();
            renderBudgetsAndGoals();
            renderDailyExpensesLogTable();
        }
    });
}
window.deleteDailyExpenseFromLog = deleteDailyExpenseFromLog;

function switchGoalSubTab(tabKey) {
    document.querySelectorAll('.goal-sub-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`goalSubView-${tabKey}`);
    if (target) target.classList.remove('hidden');

    const tabs = {
        financial: { id: 'btnGoalSubFinancial', icon: 'fa-coins', label: 'Financial Milestones' },
        business: { id: 'btnGoalSubBusiness', icon: 'fa-briefcase', label: 'Business Plans' },
        personal: { id: 'btnGoalSubPersonal', icon: 'fa-user-astronaut', label: 'Personal Milestones' },
        books: { id: 'btnGoalSubBooks', icon: 'fa-book', label: 'Reading Goals' },
        travel: { id: 'btnGoalSubTravel', icon: 'fa-plane', label: 'Travel Goals' },
        ziyara: { id: 'btnGoalSubZiyara', icon: 'fa-kaaba', label: 'Ziyara Goals' },
        analytics: { id: 'btnGoalSubAnalytics', icon: 'fa-chart-pie', label: 'Overall Status' }
    };

    Object.keys(tabs).forEach(k => {
        const btn = document.getElementById(tabs[k].id);
        if (btn) {
            if (k === tabKey) {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r from-brand-600 to-brand-700 text-surface-950 font-bold transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(201,164,107,0.25)] flex items-center gap-2 border border-brand-500/30';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            } else {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r from-surface-900 to-surface-800 border border-surface-700/80 text-slate-400 hover:text-white hover:border-brand-500/40 transition-all whitespace-nowrap flex items-center gap-2 shadow-sm';
                btn.innerHTML = `<i class="fa-solid ${tabs[k].icon} text-[10px]"></i> ${tabs[k].label}`;
            }
        }
    });

    if (tabKey === 'analytics') {
        renderGoalAnalytics();
    }
}
window.switchGoalSubTab = switchGoalSubTab;

function renderGoalsTable() {
    const categories = ['financial', 'business', 'personal', 'books', 'travel', 'ziyara'];
    
    if (!db.goals) db.goals = [];

    const getStatusBadge = (status, isComp) => {
        const s = isComp ? 'Completed' : (status || 'In Progress');
        if (s === 'Completed') return '<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold">Completed</span>';
        if (s === 'In Progress') return '<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-brand-500/30 bg-brand-500/10 text-brand-400 font-bold">In Progress</span>';
        if (s === 'Not Started') return '<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-slate-700 bg-surface-900 text-slate-400">Not Started</span>';
        if (s === 'On Hold') return '<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-amber-500/30 bg-amber-500/10 text-amber-400 font-bold">On Hold</span>';
        if (s === 'Abandoned') return '<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold">Abandoned</span>';
        return `<span class="px-2 py-0.5 rounded-md text-[10px] font-mono border border-slate-700 bg-surface-900 text-slate-400">${s}</span>`;
    };

    categories.forEach(cat => {
        const activeTableBody = document.getElementById(`${cat}GoalsTableBody`);
        const completedTableBody = document.getElementById(`${cat}CompletedGoalsTableBody`);
        const compCountBadge = document.getElementById(`${cat}CompCount`);
        const compBadgeCount = document.getElementById(`${cat}CompBadgeCount`);
        
        if (!activeTableBody) return;
        
        activeTableBody.innerHTML = '';
        if (completedTableBody) completedTableBody.innerHTML = '';

        const catGoals = db.goals.filter(g => {
            const c = (g.category || 'financial').toLowerCase();
            if (cat === 'financial') return c === 'financial';
            if (cat === 'business') return c === 'business';
            if (cat === 'personal') return c === 'personal' || c === 'health';
            if (cat === 'books') return c === 'reading' || c === 'books';
            if (cat === 'travel') return c === 'travel';
            if (cat === 'ziyara') return c === 'ziyara';
            return c === cat;
        });

        const activeGoals = catGoals.filter(g => !g.completed);
        const completedGoals = catGoals.filter(g => g.completed);

        if (compCountBadge) compCountBadge.innerText = completedGoals.length.toString();
        if (compBadgeCount) compBadgeCount.innerText = `${completedGoals.length} Items`;

        const renderRow = (g, idx, isComp) => {
            const tr = document.createElement('tr');
            tr.className = 'group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0';

            const statusBadge = getStatusBadge(g.status, isComp);
            
            let progressPct = parseInt(g.progress) || 0;
            if (cat === 'financial') {
                const est = parseFloat(g.estimate) || 0;
                const paid = parseFloat(g.paid) || 0;
                if (est > 0) progressPct = Math.min(100, Math.round((paid / est) * 100));
            }
            if (isComp) progressPct = 100;

            const progressBarHtml = `
                <div class="flex items-center gap-2 w-full justify-center">
                    <div class="w-24 bg-surface-950 rounded-full h-2 overflow-hidden border border-surface-700/60">
                        <div class="h-full bg-brand-500 rounded-full transition-all" style="width: ${progressPct}%"></div>
                    </div>
                    <span class="text-[10px] font-mono text-slate-400 shrink-0 w-8 text-right">${progressPct}%</span>
                </div>
            `;

            const manageHtml = `
                <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="toggleGoalStatus('${g.id}')" class="p-1 text-slate-400 hover:text-emerald-400 transition-colors" title="${isComp ? 'Reactivate' : 'Mark Complete'}">
                        <i class="fa-solid ${isComp ? 'fa-rotate-left text-amber-400' : 'fa-check text-emerald-400'} text-xs"></i>
                    </button>
                    <button onclick="openGoalModal('${g.id}')" class="p-1 text-slate-400 hover:text-brand-500 transition-colors" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteGoal('${g.id}')" class="p-1 text-slate-400 hover:text-rose-500 transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            `;

            if (cat === 'financial') {
                const est = parseFloat(g.estimate || 0);
                const paid = parseFloat(g.paid || 0);
                tr.innerHTML = `
                    <td class="py-3 px-3 w-12 text-center font-mono text-xs text-slate-400">${idx + 1}</td>
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100 ${isComp ? 'line-through text-slate-500' : ''}">${g.title}</div>
                        ${(g.notes || g.desc) ? `<div class="text-[10px] text-slate-400 font-light mt-0.5">${g.notes || g.desc}</div>` : ''}
                    </td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-400">${g.startDate || '-'}</td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300 font-medium">${g.targetDate || '-'}</td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300 text-right">₹${est.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td class="py-3 px-3 font-mono text-xs font-bold text-emerald-400 text-right">₹${paid.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td class="py-3 px-3 text-center">${progressBarHtml}</td>
                    <td class="py-3 px-3">${statusBadge}</td>
                    <td class="py-3 px-3 text-center">${manageHtml}</td>
                `;
            } else {
                const secondaryVal = g.genre || g.category || '-';
                tr.innerHTML = `
                    <td class="py-3 px-3 w-12 text-center font-mono text-xs text-slate-400">${idx + 1}</td>
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100 ${isComp ? 'line-through text-slate-500' : ''}">${g.title}</div>
                        ${(g.notes || g.desc) ? `<div class="text-[10px] text-slate-400 font-light mt-0.5">${g.notes || g.desc}</div>` : ''}
                    </td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300">${secondaryVal}</td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300">${g.targetDate || '-'}</td>
                    <td class="py-3 px-3 text-center">${progressBarHtml}</td>
                    <td class="py-3 px-3">${statusBadge}</td>
                    <td class="py-3 px-3 text-center">${manageHtml}</td>
                `;
            }
            return tr;
        };

        activeGoals.forEach((g, idx) => activeTableBody.appendChild(renderRow(g, idx, false)));
        if (completedTableBody) {
            completedGoals.forEach((g, idx) => completedTableBody.appendChild(renderRow(g, idx, true)));
        }

        const colSpan = cat === 'financial' ? 9 : 7;
        if (activeGoals.length === 0) {
            activeTableBody.innerHTML = `<tr><td colspan="${colSpan}" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-flag-checkered text-2xl mb-2 block opacity-40"></i> No active milestones in this track. Click Add Goal to create one.</td></tr>`;
        }
        if (completedTableBody && completedGoals.length === 0) {
            completedTableBody.innerHTML = `<tr><td colspan="${colSpan}" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-box-archive text-2xl mb-2 block opacity-40"></i> No archived milestones.</td></tr>`;
        }
    });

    renderGoalAnalytics();
}
window.renderGoalsTable = renderGoalsTable;

function renderGoalAnalytics() {
    if (!db.goals) db.goals = [];

    const totalGoals = db.goals.length;
    const completedGoals = db.goals.filter(g => g.completed).length;
    const activeGoals = totalGoals - completedGoals;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    // Financial calculations
    const finGoals = db.goals.filter(g => (g.category || '').toLowerCase() === 'financial');
    let finEstTotal = 0;
    let finPaidTotal = 0;
    finGoals.forEach(g => {
        finEstTotal += parseFloat(g.estimate || 0);
        finPaidTotal += parseFloat(g.paid || 0);
    });
    const finProgPct = finEstTotal > 0 ? Math.min(100, Math.round((finPaidTotal / finEstTotal) * 100)) : 0;

    // KPI Elements
    const elTotal = document.getElementById('goalStatTotal');
    const elCompleted = document.getElementById('goalStatCompleted');
    const elRate = document.getElementById('goalStatRate');
    const elActive = document.getElementById('goalStatActive');
    const elFinProg = document.getElementById('goalStatFinProgressPct');
    const elFinPaid = document.getElementById('goalStatFinPaidText');

    if (elTotal) elTotal.innerText = totalGoals.toString();
    if (elCompleted) elCompleted.innerText = completedGoals.toString();
    if (elRate) elRate.innerText = `${completionRate}%`;
    if (elActive) elActive.innerText = activeGoals.toString();
    if (elFinProg) elFinProg.innerText = `${finProgPct}%`;
    if (elFinPaid) {
        if (finEstTotal > 0) {
            elFinPaid.innerText = `₹${(finPaidTotal / 100000).toFixed(1)}L of ₹${(finEstTotal / 100000).toFixed(1)}L`;
        } else {
            elFinPaid.innerText = `₹0 Paid`;
        }
    }

    // Category breakdown definitions
    const trackDefs = [
        { key: 'financial', label: 'Financial Milestones', icon: 'fa-coins', color: 'text-brand-500', barColor: 'bg-brand-500', match: c => c === 'financial' },
        { key: 'business', label: 'Business Plans', icon: 'fa-briefcase', color: 'text-accent-blue', barColor: 'bg-accent-blue', match: c => c === 'business' },
        { key: 'personal', label: 'Personal Goals', icon: 'fa-user-astronaut', color: 'text-accent-cyan', barColor: 'bg-accent-cyan', match: c => c === 'personal' || c === 'health' },
        { key: 'books', label: 'Reading Goals', icon: 'fa-book', color: 'text-amber-400', barColor: 'bg-amber-400', match: c => c === 'reading' || c === 'books' },
        { key: 'travel', label: 'Travel Goals', icon: 'fa-plane', color: 'text-emerald-400', barColor: 'bg-emerald-400', match: c => c === 'travel' },
        { key: 'ziyara', label: 'Ziyara Milestones', icon: 'fa-kaaba', color: 'text-brand-400', barColor: 'bg-brand-400', match: c => c === 'ziyara' }
    ];

    const trackCounts = [];
    const trackActiveCounts = [];
    const trackCompCounts = [];

    const gridContainer = document.getElementById('goalCategoryBreakdownGrid');
    if (gridContainer) {
        gridContainer.innerHTML = '';
        trackDefs.forEach(track => {
            const items = db.goals.filter(g => track.match((g.category || 'financial').toLowerCase()));
            const total = items.length;
            const comp = items.filter(g => g.completed).length;
            const act = total - comp;
            const pct = total > 0 ? Math.round((comp / total) * 100) : 0;

            trackCounts.push(total);
            trackActiveCounts.push(act);
            trackCompCounts.push(comp);

            const card = document.createElement('div');
            card.className = 'p-5 rounded-2xl bg-surface-900/60 border border-surface-800 hover:border-surface-700 transition-all flex flex-col justify-between gap-4 group';
            card.innerHTML = `
                <div class="flex items-start justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-xl bg-surface-800/80 border border-surface-700/60 flex items-center justify-center ${track.color}">
                            <i class="fa-solid ${track.icon}"></i>
                        </div>
                        <div>
                            <div class="font-display font-bold text-sm text-white">${track.label}</div>
                            <div class="text-[10px] font-mono text-slate-400">${total} Total &bull; ${act} Active</div>
                        </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${pct === 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface-800 text-slate-400'}">${pct}%</span>
                </div>

                <div>
                    <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                        <span>Completed: <span class="text-emerald-400 font-bold">${comp}</span></span>
                        <span>Pending: <span class="text-brand-400 font-bold">${act}</span></span>
                    </div>
                    <div class="w-full bg-surface-950 rounded-full h-2 overflow-hidden border border-surface-800">
                        <div class="h-full ${track.barColor} transition-all duration-500 rounded-full" style="width: ${pct}%"></div>
                    </div>
                </div>

                <div class="pt-2 border-t border-surface-800/60 flex items-center justify-between">
                    <button onclick="switchGoalSubTab('${track.key}')" class="text-xs font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1.5 transition-colors cursor-pointer">
                        View Track <i class="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
                    </button>
                    <button onclick="openGoalModal('${track.key}')" class="text-[10px] font-mono text-slate-500 hover:text-white transition-colors cursor-pointer" title="Add milestone to ${track.label}">
                        <i class="fa-solid fa-plus"></i> Add
                    </button>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    } else {
        trackDefs.forEach(track => {
            const items = db.goals.filter(g => track.match((g.category || 'financial').toLowerCase()));
            const total = items.length;
            const comp = items.filter(g => g.completed).length;
            const act = total - comp;
            trackCounts.push(total);
            trackActiveCounts.push(act);
            trackCompCounts.push(comp);
        });
    }

    // Chart 1: Category Distribution Doughnut
    const chartCatCanvas = document.getElementById('goalCategoryChartCanvas');
    if (chartCatCanvas && typeof Chart !== 'undefined') {
        const ctx = chartCatCanvas.getContext('2d');
        if (window.goalCategoryChartInst) window.goalCategoryChartInst.destroy();

        const hasAny = trackCounts.some(c => c > 0);
        const dataValues = hasAny ? trackCounts : [1, 1, 1, 1, 1, 1];
        const bgColors = hasAny 
            ? ['#C9A46B', '#88A3D6', '#00f2fe', '#f59e0b', '#34d399', '#fbbf24']
            : ['#334155', '#334155', '#334155', '#334155', '#334155', '#334155'];

        window.goalCategoryChartInst = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Financial', 'Business', 'Personal', 'Reading', 'Travel', 'Ziyara'],
                datasets: [{
                    data: dataValues,
                    backgroundColor: bgColors,
                    borderColor: '#070A0F',
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            usePointStyle: true,
                            padding: 12,
                            font: { family: "'JetBrains Mono', monospace", size: 10 }
                        }
                    }
                }
            }
        });
    }

    // Chart 2: Active vs Completed Bar Chart
    const chartStatusCanvas = document.getElementById('goalStatusChartCanvas');
    if (chartStatusCanvas && typeof Chart !== 'undefined') {
        const ctx2 = chartStatusCanvas.getContext('2d');
        if (window.goalStatusChartInst) window.goalStatusChartInst.destroy();

        window.goalStatusChartInst = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Financial', 'Business', 'Personal', 'Reading', 'Travel', 'Ziyara'],
                datasets: [
                    {
                        label: 'Active',
                        data: trackActiveCounts,
                        backgroundColor: 'rgba(201, 164, 107, 0.85)',
                        borderColor: '#C9A46B',
                        borderWidth: 1,
                        borderRadius: 6
                    },
                    {
                        label: 'Completed',
                        data: trackCompCounts,
                        backgroundColor: 'rgba(16, 185, 129, 0.85)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: chartGridOptions,
                        ticks: {
                            color: '#94a3b8',
                            font: { family: "'JetBrains Mono', monospace", size: 10 }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: chartGridOptions,
                        ticks: {
                            stepSize: 1,
                            color: '#94a3b8',
                            font: { family: "'JetBrains Mono', monospace", size: 10 }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            usePointStyle: true,
                            padding: 12,
                            font: { family: "'JetBrains Mono', monospace", size: 10 }
                        }
                    }
                }
            }
        });
    }

    // Top Active Target Trajectory Table
    const activeTable = document.getElementById('goalAnalyticsActiveTableBody');
    if (activeTable) {
        activeTable.innerHTML = '';
        const activeList = db.goals.filter(g => !g.completed);

        if (activeList.length === 0) {
            activeTable.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-flag-checkered text-2xl mb-2 block opacity-40"></i> All milestones completed or no active targets logged.</td></tr>`;
        } else {
            activeList.slice(0, 10).forEach((g, idx) => {
                const tr = document.createElement('tr');
                tr.className = 'group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0';
                
                let progressPct = parseInt(g.progress) || 0;
                if ((g.category || '').toLowerCase() === 'financial') {
                    const est = parseFloat(g.estimate) || 0;
                    const paid = parseFloat(g.paid) || 0;
                    if (est > 0) progressPct = Math.min(100, Math.round((paid / est) * 100));
                }

                const catName = capitalize(g.category || 'Financial');
                
                tr.innerHTML = `
                    <td class="py-3 px-3 w-12 text-center font-mono text-xs text-slate-400">${idx + 1}</td>
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100">${g.title}</div>
                        ${(g.notes || g.desc) ? `<div class="text-[10px] text-slate-400 font-light mt-0.5">${g.notes || g.desc}</div>` : ''}
                    </td>
                    <td class="py-3 px-3">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-surface-800 text-brand-400 border border-surface-700">${catName}</span>
                    </td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300">${g.targetDate || '-'}</td>
                    <td class="py-3 px-3 text-center">
                        <div class="flex items-center gap-2 justify-center">
                            <div class="w-20 bg-surface-950 rounded-full h-1.5 overflow-hidden border border-surface-700/60">
                                <div class="h-full bg-brand-500 rounded-full" style="width: ${progressPct}%"></div>
                            </div>
                            <span class="text-[10px] font-mono text-slate-400 shrink-0 w-8 text-right">${progressPct}%</span>
                        </div>
                    </td>
                    <td class="py-3 px-3 text-center">
                        <div class="flex items-center justify-center gap-2">
                            <button onclick="toggleGoalStatus('${g.id}')" class="p-1 text-slate-400 hover:text-emerald-400 transition-colors" title="Mark as Complete">
                                <i class="fa-solid fa-check text-xs"></i>
                            </button>
                            <button onclick="openGoalModal('${g.id}')" class="p-1 text-slate-400 hover:text-brand-500 transition-colors" title="Edit">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                        </div>
                    </td>
                `;
                activeTable.appendChild(tr);
            });
        }
    }
}
window.renderGoalAnalytics = renderGoalAnalytics;

function toggleGoalModalFields() {
    const catEl = document.getElementById('goalCategoryInput');
    const cat = catEl ? catEl.value.toLowerCase() : 'financial';
    const finFields = document.getElementById('goalFinancialFields');
    const genreInput = document.getElementById('goalGenreInput');
    const progField = document.getElementById('goalProgressField');

    if (finFields) {
        if (cat === 'financial') finFields.classList.remove('hidden');
        else finFields.classList.add('hidden');
    }

    if (genreInput) {
        if (cat === 'reading' || cat === 'travel' || cat === 'books') {
            genreInput.classList.remove('hidden');
            if (cat === 'reading' || cat === 'books') genreInput.placeholder = 'e.g. Non-Fiction, Biography, Strategy';
            else genreInput.placeholder = 'e.g. Itinerary, Holy sites, Cities';
        } else {
            genreInput.classList.add('hidden');
        }
    }

    if (progField) {
        if (cat !== 'financial') progField.classList.remove('hidden');
        else progField.classList.add('hidden');
    }
}
window.toggleGoalModalFields = toggleGoalModalFields;

function openGoalModal(param = null) {
    const idEl = document.getElementById('goalId');
    const titleEl = document.getElementById('goalModalTitle');
    const catEl = document.getElementById('goalCategoryInput');
    const nameEl = document.getElementById('goalTitleInput');
    const genreEl = document.getElementById('goalGenreInput');
    const startEl = document.getElementById('goalStartDateInput');
    const targetEl = document.getElementById('goalTargetDateInput');
    const estEl = document.getElementById('goalEstimateInput');
    const paidEl = document.getElementById('goalPaidInput');
    const progEl = document.getElementById('goalProgressInput');
    const statusEl = document.getElementById('goalStatusInput');
    const notesEl = document.getElementById('goalNotesInput') || document.getElementById('goalDescInput');
    const todayStr = new Date();

    const categories = ['financial', 'business', 'personal', 'travel', 'ziyara', 'reading', 'books'];
    const isCategory = param && categories.includes(String(param).toLowerCase());
    
    let goal = null;
    if (param && !isCategory) {
        goal = (db.goals || []).find(x => x.id === param);
    }

    if (goal) {
        if (idEl) idEl.value = goal.id;
        if (titleEl) titleEl.innerText = 'Edit Milestone';
        if (catEl) catEl.value = capitalize(goal.category || 'Financial');
        if (nameEl) nameEl.value = goal.title || '';
        if (genreEl) genreEl.value = goal.genre || '';
        if (startEl) startEl.value = goal.startDate || '';
        if (targetEl) targetEl.value = goal.targetDate || '';
        if (estEl) estEl.value = goal.estimate || '';
        if (paidEl) paidEl.value = goal.paid || '';
        if (progEl) progEl.value = goal.progress || 0;
        if (statusEl) statusEl.value = goal.status || 'In Progress';
        if (notesEl) notesEl.value = goal.notes || goal.desc || '';
    } else {
        if (idEl) idEl.value = '';
        if (titleEl) titleEl.innerText = 'Add New Goal';
        if (catEl) {
            let catName = 'Financial';
            if (isCategory) {
                const p = String(param).toLowerCase();
                if (p === 'books' || p === 'reading') catName = 'Reading';
                else if (p === 'ziyara') catName = 'Ziyara';
                else if (p === 'travel') catName = 'Travel';
                else if (p === 'personal') catName = 'Personal';
                else if (p === 'business') catName = 'Business';
            }
            catEl.value = catName;
        }
        if (nameEl) nameEl.value = '';
        if (genreEl) genreEl.value = '';
        if (startEl) startEl.value = todayStr.toLocaleDateString('en-GB');
        if (targetEl) targetEl.value = '';
        if (estEl) estEl.value = '';
        if (paidEl) paidEl.value = '';
        if (progEl) progEl.value = '0';
        if (statusEl) statusEl.value = 'In Progress';
        if (notesEl) notesEl.value = '';
    }
    toggleGoalModalFields();
    openModal('goalModal');
}
window.openGoalModal = openGoalModal;

function saveGoal() {
    const idEl = document.getElementById('goalId');
    const id = idEl ? idEl.value : '';
    const catEl = document.getElementById('goalCategoryInput');
    const category = catEl ? catEl.value : 'Financial';
    const titleEl = document.getElementById('goalTitleInput');
    const title = titleEl ? (titleEl.value.trim() || 'Milestone') : 'Milestone';
    const genreEl = document.getElementById('goalGenreInput');
    const genre = genreEl ? genreEl.value.trim() : '';
    const startEl = document.getElementById('goalStartDateInput');
    const startDate = startEl ? startEl.value : '';
    const targetEl = document.getElementById('goalTargetDateInput');
    const targetDate = targetEl ? targetEl.value : '';
    const estEl = document.getElementById('goalEstimateInput');
    const estimate = parseFloat(estEl ? estEl.value : 0) || 0;
    const paidEl = document.getElementById('goalPaidInput');
    const paid = parseFloat(paidEl ? paidEl.value : 0) || 0;
    const progEl = document.getElementById('goalProgressInput');
    const progress = parseInt(progEl ? progEl.value : 0) || 0;
    const statusEl = document.getElementById('goalStatusInput');
    const status = statusEl ? statusEl.value : 'In Progress';
    const notesEl = document.getElementById('goalNotesInput') || document.getElementById('goalDescInput');
    const notes = notesEl ? notesEl.value.trim() : '';

    const completed = status === 'Completed';

    if (!db.goals) db.goals = [];
    if (id) {
        const g = db.goals.find(x => x.id === id);
        if (g) {
            g.category = category;
            g.title = title;
            g.genre = genre;
            g.startDate = startDate;
            g.targetDate = targetDate;
            g.estimate = estimate;
            g.paid = paid;
            g.progress = progress;
            g.status = status;
            g.notes = notes;
            g.desc = notes;
            g.completed = completed;
        }
    } else {
        db.goals.push({
            id: Date.now().toString(),
            category,
            title,
            genre,
            startDate,
            targetDate,
            estimate,
            paid,
            progress,
            status,
            notes,
            desc: notes,
            completed
        });
    }

    saveDatabase();
    renderGoalsTable();
    closeModal('goalModal');
    showToast('Milestone saved');
}
window.saveGoal = saveGoal;

function toggleGoalStatus(id) {
    const g = (db.goals || []).find(x => x.id === id);
    if (g) {
        g.completed = !g.completed;
        g.status = g.completed ? 'Completed' : 'In Progress';
        if (g.completed && typeof pushNotification === 'function') {
            pushNotification({
                title: `Milestone Achieved: ${g.title}`,
                desc: `${g.category || 'Executive Target'} completed successfully`,
                type: 'goal',
                category: 'goal',
                linkPage: 'goals',
                playSound: true
            });
        }
        saveDatabase();
        renderGoalsTable();
        showToast(g.completed ? 'Milestone marked as complete' : 'Milestone reactivated');
    }
}
window.toggleGoalStatus = toggleGoalStatus;

function deleteGoal(id) {
    requireConfirmation('Delete this milestone?', () => {
        if (db.goals) {
            db.goals = db.goals.filter(x => x.id !== id);
            saveDatabase();
            renderGoalsTable();
            showToast('Milestone removed');
        }
    });
}
window.deleteGoal = deleteGoal;

let notesViewMode = 'grid';
let notesSearchQuery = '';

const noteThemeMap = {
    'gold': {
        border: 'border-amber-500/40 hover:border-amber-400/80',
        glow: 'rgba(245, 158, 11, 0.15)',
        badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
        gradient: 'from-amber-400 via-brand-600 to-accent-plum',
        dot: 'bg-amber-400'
    },
    'emerald': {
        border: 'border-emerald-500/40 hover:border-emerald-400/80',
        glow: 'rgba(16, 185, 129, 0.15)',
        badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
        gradient: 'from-emerald-400 via-teal-600 to-cyan-500',
        dot: 'bg-emerald-400'
    },
    'cyan': {
        border: 'border-cyan-500/40 hover:border-cyan-400/80',
        glow: 'rgba(6, 182, 212, 0.15)',
        badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
        gradient: 'from-cyan-400 via-blue-600 to-indigo-500',
        dot: 'bg-cyan-400'
    },
    'violet': {
        border: 'border-purple-500/40 hover:border-purple-400/80',
        glow: 'rgba(168, 85, 247, 0.15)',
        badge: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
        gradient: 'from-purple-400 via-fuchsia-600 to-pink-500',
        dot: 'bg-purple-400'
    },
    'rose': {
        border: 'border-rose-500/40 hover:border-rose-400/80',
        glow: 'rgba(244, 63, 94, 0.15)',
        badge: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
        gradient: 'from-rose-400 via-pink-600 to-amber-500',
        dot: 'bg-rose-400'
    },
    'slate': {
        border: 'border-surface-700 hover:border-slate-500',
        glow: 'rgba(148, 163, 184, 0.08)',
        badge: 'bg-surface-800 text-slate-300 border-surface-700',
        gradient: 'from-slate-400 via-slate-600 to-zinc-700',
        dot: 'bg-slate-400'
    }
};

const noteFontMap = {
    'inter': 'note-font-inter',
    'playfair': 'note-font-playfair',
    'outfit': 'note-font-outfit',
    'merriweather': 'note-font-merriweather',
    'lora': 'note-font-lora',
    'mono': 'note-font-mono',
    'caveat': 'note-font-caveat',
    'cinzel': 'note-font-cinzel'
};

function setNotesViewMode(mode) {
    notesViewMode = mode;
    const btnGrid = document.getElementById('btnNoteViewGrid');
    const btnList = document.getElementById('btnNoteViewList');
    const gridContainer = document.getElementById('notesGridContainer');
    const listContainer = document.getElementById('notesListContainer');

    if (btnGrid && btnList) {
        if (mode === 'grid') {
            btnGrid.className = 'p-1.5 px-2.5 rounded-lg text-xs text-amber-400 bg-surface-800 transition-all cursor-pointer shadow-sm';
            btnList.className = 'p-1.5 px-2.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all cursor-pointer';
            if (gridContainer) gridContainer.classList.remove('hidden');
            if (listContainer) listContainer.classList.add('hidden');
        } else {
            btnGrid.className = 'p-1.5 px-2.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all cursor-pointer';
            btnList.className = 'p-1.5 px-2.5 rounded-lg text-xs text-amber-400 bg-surface-800 transition-all cursor-pointer shadow-sm';
            if (gridContainer) gridContainer.classList.add('hidden');
            if (listContainer) listContainer.classList.remove('hidden');
        }
    }
    renderNotesList();
}
window.setNotesViewMode = setNotesViewMode;

function handleNotesSearch() {
    const input = document.getElementById('notesSearchInput');
    const clearBtn = document.getElementById('btnClearNotesSearch');
    notesSearchQuery = (input ? input.value : '').toLowerCase().trim();
    if (clearBtn) {
        if (notesSearchQuery) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }
    renderNotesList();
}
window.handleNotesSearch = handleNotesSearch;

function clearNotesSearch() {
    const input = document.getElementById('notesSearchInput');
    const clearBtn = document.getElementById('btnClearNotesSearch');
    if (input) input.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    notesSearchQuery = '';
    renderNotesList();
}
window.clearNotesSearch = clearNotesSearch;

function filterNotes() {
    renderNotesList();
}
window.filterNotes = filterNotes;

function renderNotesList() {
    const gridContainer = document.getElementById('notesGridContainer');
    const listTableBody = document.getElementById('notesListTableBody');
    const countBadge = document.getElementById('notesCountBadge');
    
    if (!db.notes) db.notes = [];
    if (countBadge) countBadge.innerText = db.notes.length.toString();

    // Read filters
    const catFilter = (document.getElementById('notesCategoryFilter') ? document.getElementById('notesCategoryFilter').value : 'all') || 'all';
    const colorFilter = (document.getElementById('notesColorFilter') ? document.getElementById('notesColorFilter').value : 'all') || 'all';
    const sortBy = (document.getElementById('notesSortSelect') ? document.getElementById('notesSortSelect').value : 'pinned') || 'pinned';

    let filtered = [...db.notes];

    // Filter by Category
    if (catFilter !== 'all') {
        filtered = filtered.filter(n => (n.category || 'general').toLowerCase() === catFilter.toLowerCase());
    }

    // Filter by Color Accent
    if (colorFilter !== 'all') {
        filtered = filtered.filter(n => (n.accentColor || 'gold').toLowerCase() === colorFilter.toLowerCase());
    }

    // Filter by Search Query
    if (notesSearchQuery) {
        filtered = filtered.filter(n => {
            const t = (n.title || '').toLowerCase();
            const b = (n.body || n.content || '').toLowerCase();
            const c = (n.category || '').toLowerCase();
            return t.includes(notesSearchQuery) || b.includes(notesSearchQuery) || c.includes(notesSearchQuery);
        });
    }

    // Sort Notes
    filtered.sort((a, b) => {
        if (sortBy === 'pinned') {
            const pinA = !!a.pinned;
            const pinB = !!b.pinned;
            if (pinA !== pinB) return pinA ? -1 : 1;
            return (b.id || '').localeCompare(a.id || '');
        } else if (sortBy === 'newest') {
            return (b.id || '').localeCompare(a.id || '');
        } else if (sortBy === 'oldest') {
            return (a.id || '').localeCompare(b.id || '');
        } else if (sortBy === 'title') {
            return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
    });

    // 1. RENDER GRID VIEW
    if (gridContainer) {
        gridContainer.innerHTML = '';
        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div class="col-span-full p-12 text-center text-slate-500 font-light rounded-2xl bg-surface-900/40 border border-surface-800/60">
                    <div class="w-12 h-12 rounded-2xl bg-surface-800/80 border border-surface-700/60 text-slate-400 flex items-center justify-center mx-auto mb-3 text-lg shadow-inner">
                        <i class="fa-regular fa-file-lines text-amber-400/60"></i>
                    </div>
                    <div class="text-white font-medium text-sm mb-1">No Notes Found</div>
                    <p class="text-slate-400 max-w-sm mx-auto mb-4 text-xs">No executive journal entries match your selected criteria.</p>
                    <button onclick="openNoteModal()" class="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-plus text-[10px]"></i> Create New Note
                    </button>
                </div>
            `;
        } else {
            filtered.forEach(note => {
                const colorKey = note.accentColor || 'gold';
                const theme = noteThemeMap[colorKey] || noteThemeMap['gold'];
                const fontClass = noteFontMap[note.fontFamily] || 'note-font-inter';
                const isPinned = !!note.pinned;
                
                // Excerpt text without HTML tags
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = note.body || note.content || '';
                const plainExcerpt = tempDiv.innerText.trim() || 'No content written.';

                const card = document.createElement('div');
                card.className = `p-6 rounded-2xl bg-surface-900/80 border ${theme.border} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between gap-4 group cursor-pointer relative overflow-hidden`;
                card.onclick = (e) => {
                    if (e.target.closest('button')) return;
                    openNoteReader(note.id);
                };

                card.innerHTML = `
                    <!-- Accent top glow bar -->
                    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.gradient}"></div>
                    
                    <div class="space-y-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-2 min-w-0">
                                ${isPinned ? `<span class="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-[10px] shrink-0" title="Pinned Note"><i class="fa-solid fa-thumbtack"></i></span>` : ''}
                                <h4 class="font-display text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1 ${fontClass}">${note.title || 'Untitled Note'}</h4>
                            </div>
                            <!-- Quick Action Buttons on Hover -->
                            <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onclick="event.stopPropagation()">
                                <button onclick="toggleNotePin('${note.id}')" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer" title="${isPinned ? 'Unpin Note' : 'Pin Note'}">
                                    <i class="fa-solid fa-thumbtack text-xs ${isPinned ? 'text-amber-400' : ''}"></i>
                                </button>
                                <button onclick="openNoteModal('${note.id}')" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer" title="Edit Note">
                                    <i class="fa-solid fa-pen text-xs"></i>
                                </button>
                                <button onclick="deleteNote('${note.id}')" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer" title="Delete Note">
                                    <i class="fa-solid fa-trash text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <p class="text-xs text-slate-400 font-light line-clamp-4 leading-relaxed whitespace-pre-wrap ${fontClass}">${plainExcerpt}</p>
                    </div>

                    <div class="flex items-center justify-between pt-3 border-t border-surface-800/60 text-[10px] font-mono text-slate-500">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md border ${theme.badge} uppercase tracking-wider font-semibold">${note.category || 'General'}</span>
                            <span class="w-2 h-2 rounded-full ${theme.dot}"></span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span><i class="fa-regular fa-clock text-[9px] text-amber-400"></i> ${note.date || 'Recent'}</span>
                        </div>
                    </div>
                `;
                gridContainer.appendChild(card);
            });
        }
    }

    // 2. RENDER LIST VIEW TABLE
    if (listTableBody) {
        listTableBody.innerHTML = '';
        if (filtered.length === 0) {
            listTableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-light">No notes found matching current filters.</td></tr>`;
        } else {
            filtered.forEach(note => {
                const colorKey = note.accentColor || 'gold';
                const theme = noteThemeMap[colorKey] || noteThemeMap['gold'];
                const fontClass = noteFontMap[note.fontFamily] || 'note-font-inter';
                const isPinned = !!note.pinned;

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = note.body || note.content || '';
                const plainExcerpt = tempDiv.innerText.trim().substring(0, 80) || 'No content';

                const tr = document.createElement('tr');
                tr.className = 'group hover:bg-surface-800/20 transition-colors cursor-pointer';
                tr.onclick = (e) => {
                    if (e.target.closest('button')) return;
                    openNoteReader(note.id);
                };

                tr.innerHTML = `
                    <td class="p-4 text-center" onclick="event.stopPropagation()">
                        <button onclick="toggleNotePin('${note.id}')" class="p-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer">
                            <i class="fa-solid fa-thumbtack ${isPinned ? 'text-amber-400' : 'opacity-30'}"></i>
                        </button>
                    </td>
                    <td class="p-4">
                        <div class="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors ${fontClass}">${note.title || 'Untitled Note'}</div>
                        <div class="text-[11px] text-slate-400 truncate max-w-md ${fontClass}">${plainExcerpt}</div>
                    </td>
                    <td class="p-4">
                        <span class="px-2.5 py-1 rounded-md text-[10px] font-mono border ${theme.badge} uppercase tracking-wider">${note.category || 'General'}</span>
                    </td>
                    <td class="p-4 font-mono text-[11px] text-slate-400">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full ${theme.dot}"></span>
                            <span class="capitalize">${note.fontFamily || 'Inter'}</span>
                        </div>
                    </td>
                    <td class="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">${note.date || '-'}</td>
                    <td class="p-4 text-center" onclick="event.stopPropagation()">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="openNoteModal('${note.id}')" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                            <button onclick="deleteNote('${note.id}')" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
                        </div>
                    </td>
                `;
                listTableBody.appendChild(tr);
            });
        }
    }
}
window.renderNotesList = renderNotesList;

function setNoteAccentColor(colorKey) {
    const hidden = document.getElementById('noteAccentColor');
    if (hidden) hidden.value = colorKey;
    
    ['gold', 'emerald', 'cyan', 'violet', 'rose', 'slate'].forEach(c => {
        const swatch = document.getElementById(`colorSwatch-${c}`);
        if (swatch) {
            if (c === colorKey) {
                swatch.classList.add('border-white', 'ring-2', 'ring-white/40');
                swatch.classList.remove('border-transparent');
            } else {
                swatch.classList.remove('border-white', 'ring-2', 'ring-white/40');
                swatch.classList.add('border-transparent');
            }
        }
    });
}
window.setNoteAccentColor = setNoteAccentColor;

function applyNoteFontFamily(fontKey) {
    const editor = document.getElementById('noteEditor');
    if (!editor) return;
    
    Object.values(noteFontMap).forEach(cls => editor.classList.remove(cls));
    const targetCls = noteFontMap[fontKey] || 'note-font-inter';
    editor.classList.add(targetCls);
}
window.applyNoteFontFamily = applyNoteFontFamily;

function applyNoteFontSize(size) {
    const editor = document.getElementById('noteEditor');
    if (editor) editor.style.fontSize = size;
}
window.applyNoteFontSize = applyNoteFontSize;

function toggleCurrentNotePin() {
    const pinHidden = document.getElementById('notePinned');
    const btn = document.getElementById('btnToggleNotePin');
    const label = document.getElementById('notePinLabel');
    const icon = document.getElementById('notePinIcon');
    
    const isPinned = pinHidden && pinHidden.value === 'true';
    const nextState = !isPinned;
    
    if (pinHidden) pinHidden.value = nextState ? 'true' : 'false';
    if (btn && label && icon) {
        if (nextState) {
            btn.className = 'px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 text-amber-300 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm';
            label.innerText = 'Pinned';
        } else {
            btn.className = 'px-3 py-1.5 rounded-xl border border-surface-700 bg-surface-900 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm';
            label.innerText = 'Pin';
        }
    }
}
window.toggleCurrentNotePin = toggleCurrentNotePin;

function toggleNotePin(id) {
    const note = (db.notes || []).find(n => n.id === id);
    if (note) {
        note.pinned = !note.pinned;
        saveDatabase();
        renderNotesList();
        showToast(note.pinned ? 'Note pinned to top' : 'Note unpinned');
    }
}
window.toggleNotePin = toggleNotePin;

function formatNoteText(cmd, val = null) {
    const editor = document.getElementById('noteEditor');
    if (editor) editor.focus();
    document.execCommand(cmd, false, val);
    updateNoteStats();
}
window.formatNoteText = formatNoteText;

function formatNoteTextColor(color) {
    formatNoteText('foreColor', color);
}
window.formatNoteTextColor = formatNoteTextColor;

function formatNoteHighlight() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    
    const range = sel.getRangeAt(0);
    const selectedContent = range.extractContents();
    const mark = document.createElement('mark');
    mark.appendChild(selectedContent);
    range.insertNode(mark);
    updateNoteStats();
}
window.formatNoteHighlight = formatNoteHighlight;

function formatNoteCodeBlock() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        formatNoteText('insertHTML', '<pre><code>// Insert code or notes here</code></pre><p><br></p>');
    } else {
        const range = sel.getRangeAt(0);
        const selectedText = sel.toString();
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.innerText = selectedText;
        pre.appendChild(code);
        range.deleteContents();
        range.insertNode(pre);
    }
    updateNoteStats();
}
window.formatNoteCodeBlock = formatNoteCodeBlock;

function insertNoteChecklist() {
    formatNoteText('insertHTML', '<div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;"><input type="checkbox" style="width: 16px; height: 16px; accent-color: #F59E0B; cursor: pointer;"> <span>Task item...</span></div>');
}
window.insertNoteChecklist = insertNoteChecklist;

function insertNoteTimestamp() {
    const now = new Date();
    const ts = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    formatNoteText('insertHTML', `<span class="px-2 py-0.5 rounded bg-surface-800 text-amber-400 font-mono text-[11px] border border-surface-700">[${ts}]</span> `);
}
window.insertNoteTimestamp = insertNoteTimestamp;

function updateNoteStats() {
    const editor = document.getElementById('noteEditor');
    const wordCountEl = document.getElementById('noteWordCount');
    const charCountEl = document.getElementById('noteCharCount');
    if (!editor) return;

    const text = editor.innerText.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;

    if (wordCountEl) wordCountEl.innerText = words.toString();
    if (charCountEl) charCountEl.innerText = chars.toString();
}
window.updateNoteStats = updateNoteStats;

function openNoteModal(id = null) {
    const idEl = document.getElementById('noteId');
    if (idEl) idEl.value = id || '';
    
    const titleModal = document.getElementById('noteModalTitle');
    const titleInput = document.getElementById('noteTitleInput');
    const catInput = document.getElementById('noteCategoryInput');
    const editor = document.getElementById('noteEditor');
    const fontSelect = document.getElementById('noteFontFamilySelect');
    const sizeSelect = document.getElementById('noteFontSizeSelect');

    if (id) {
        const n = (db.notes || []).find(x => x.id === id);
        if (n) {
            if (titleModal) titleModal.innerText = 'Edit Executive Note';
            if (titleInput) titleInput.value = n.title || '';
            if (catInput) catInput.value = n.category || 'general';
            setNoteAccentColor(n.accentColor || 'gold');
            
            if (fontSelect) fontSelect.value = n.fontFamily || 'inter';
            applyNoteFontFamily(n.fontFamily || 'inter');

            if (sizeSelect) sizeSelect.value = n.fontSize || '17px';
            applyNoteFontSize(n.fontSize || '17px');

            const pinHidden = document.getElementById('notePinned');
            if (pinHidden) pinHidden.value = n.pinned ? 'true' : 'false';
            
            const btn = document.getElementById('btnToggleNotePin');
            const label = document.getElementById('notePinLabel');
            if (btn && label) {
                if (n.pinned) {
                    btn.className = 'px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 text-amber-300 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm';
                    label.innerText = 'Pinned';
                } else {
                    btn.className = 'px-3 py-1.5 rounded-xl border border-surface-700 bg-surface-900 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm';
                    label.innerText = 'Pin';
                }
            }

            if (editor) {
                editor.innerHTML = n.body || n.content || '';
            }
        }
    } else {
        if (titleModal) titleModal.innerText = 'Executive Note Composer';
        if (titleInput) titleInput.value = '';
        if (catInput) catInput.value = 'general';
        setNoteAccentColor('gold');
        
        if (fontSelect) fontSelect.value = 'inter';
        applyNoteFontFamily('inter');

        if (sizeSelect) sizeSelect.value = '17px';
        applyNoteFontSize('17px');

        const pinHidden = document.getElementById('notePinned');
        if (pinHidden) pinHidden.value = 'false';
        
        const btn = document.getElementById('btnToggleNotePin');
        const label = document.getElementById('notePinLabel');
        if (btn && label) {
            btn.className = 'px-3 py-1.5 rounded-xl border border-surface-700 bg-surface-900 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm';
            label.innerText = 'Pin';
        }

        if (editor) {
            editor.innerHTML = '';
        }
    }
    
    updateNoteStats();
    openModal('noteModal');
    setTimeout(() => {
        if (titleInput && !id) titleInput.focus();
    }, 150);
}
window.openNoteModal = openNoteModal;

function saveNote() {
    const idEl = document.getElementById('noteId');
    const id = idEl ? idEl.value : '';
    const titleInput = document.getElementById('noteTitleInput');
    const title = titleInput ? (titleInput.value.trim() || 'Untitled Note') : 'Untitled Note';
    const catInput = document.getElementById('noteCategoryInput');
    const category = catInput ? catInput.value : 'general';
    const colorInput = document.getElementById('noteAccentColor');
    const accentColor = colorInput ? colorInput.value : 'gold';
    const fontSelect = document.getElementById('noteFontFamilySelect');
    const fontFamily = fontSelect ? fontSelect.value : 'inter';
    const sizeSelect = document.getElementById('noteFontSizeSelect');
    const fontSize = sizeSelect ? sizeSelect.value : '17px';
    const pinHidden = document.getElementById('notePinned');
    const pinned = pinHidden ? pinHidden.value === 'true' : false;
    
    const editor = document.getElementById('noteEditor');
    const body = editor ? editor.innerHTML : '';
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (!db.notes) db.notes = [];
    if (id) {
        const n = db.notes.find(x => x.id === id);
        if (n) { 
            n.title = title; 
            n.body = body; 
            n.content = body; 
            n.category = category; 
            n.accentColor = accentColor;
            n.fontFamily = fontFamily;
            n.fontSize = fontSize;
            n.pinned = pinned;
            n.date = date; 
        }
    } else {
        db.notes.unshift({ 
            id: Date.now().toString(), 
            title, 
            body, 
            content: body, 
            category, 
            accentColor,
            fontFamily,
            fontSize,
            pinned,
            date 
        });
    }

    saveDatabase();
    renderNotesList();
    closeModal('noteModal');
    showToast('Note saved to journal');
}
window.saveNote = saveNote;

function openNoteReader(id) {
    const n = (db.notes || []).find(x => x.id === id);
    if (!n) return;
    
    const catEl = document.getElementById('viewNoteCategory');
    const dateEl = document.getElementById('viewNoteDate');
    const titleEl = document.getElementById('viewNoteTitle');
    const contentEl = document.getElementById('viewNoteContent');
    const curIdEl = document.getElementById('currentViewNoteId');
    const pinBadge = document.getElementById('viewNotePinBadge');
    const wordCountEl = document.getElementById('viewNoteWordCount');
    const wrapper = document.getElementById('viewNoteWrapper');
    const glow = document.getElementById('viewNoteGlow');

    const colorKey = n.accentColor || 'gold';
    const theme = noteThemeMap[colorKey] || noteThemeMap['gold'];
    const fontClass = noteFontMap[n.fontFamily] || 'note-font-inter';

    if (wrapper) {
        wrapper.className = `max-w-4xl w-full h-full max-h-[88vh] rounded-[2rem] p-[2px] bg-gradient-to-br ${theme.gradient} shadow-[0_0_60px_rgba(201,164,107,0.25)] relative group`;
    }
    if (glow) {
        glow.className = `absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-[2rem] blur-2xl opacity-25 group-hover:opacity-45 transition-opacity duration-700 -z-10`;
    }

    if (pinBadge) {
        if (n.pinned) pinBadge.classList.remove('hidden');
        else pinBadge.classList.add('hidden');
    }

    if (catEl) {
        catEl.innerText = (n.category || 'General').toUpperCase();
        catEl.className = `px-4 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-widest border font-bold shadow-lg ${theme.badge}`;
    }
    if (dateEl) dateEl.innerHTML = `<i class="fa-regular fa-clock text-amber-400"></i> ${n.date || 'Recent'}`;
    if (titleEl) {
        titleEl.innerText = n.title || 'Untitled Note';
        Object.values(noteFontMap).forEach(c => titleEl.classList.remove(c));
        titleEl.classList.add(fontClass);
    }
    
    if (contentEl) {
        contentEl.innerHTML = n.body || n.content || '';
        Object.values(noteFontMap).forEach(c => contentEl.classList.remove(c));
        contentEl.classList.add(fontClass);
        if (n.fontSize) contentEl.style.fontSize = n.fontSize;
    }

    if (wordCountEl) {
        const text = (contentEl ? contentEl.innerText : '').trim();
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        wordCountEl.innerText = `• ${words} words`;
    }

    if (curIdEl) curIdEl.value = n.id;

    openModal('noteViewModal');
}
window.openNoteReader = openNoteReader;

function editNoteFromView() {
    const idEl = document.getElementById('currentViewNoteId');
    const id = idEl ? idEl.value : null;
    closeModal('noteViewModal');
    if (id) {
        openNoteModal(id);
    }
}
window.editNoteFromView = editNoteFromView;

function deleteNote(id) {
    requireConfirmation('Delete this executive note permanently?', () => {
        db.notes = db.notes.filter(x => x.id !== id);
        saveDatabase();
        renderNotesList();
        showToast('Note deleted');
    });
}
window.deleteNote = deleteNote;

let currentReminderFilter = 'all';
let currentReminderViewMode = localStorage.getItem('executive_reminder_view_mode') || 'cards';

function isReminderOverdue(r) {
    if (r.completed || r.status === 'completed') return false;
    if (!r.date) return false;
    let dStr = r.date;
    if (dStr.includes('/')) {
        const p = dStr.split('/');
        if (p.length === 3) dStr = `${p[2]}-${p[1]}-${p[0]}`;
    }
    const timeStr = r.time || '23:59';
    const due = new Date(`${dStr}T${timeStr}:00`);
    return !isNaN(due.getTime()) && due < new Date();
}

function isReminderToday(r) {
    if (!r.date) return false;
    let dStr = r.date;
    if (dStr.includes('/')) {
        const p = dStr.split('/');
        if (p.length === 3) dStr = `${p[2]}-${p[1]}-${p[0]}`;
    }
    const today = new Date().toISOString().split('T')[0];
    return dStr === today;
}

function setReminderFilter(filter) {
    currentReminderFilter = filter;
    ['all', 'active', 'high', 'overdue', 'completed'].forEach(f => {
        const btn = document.getElementById(`btnReminderFilter-${f}`);
        if (!btn) return;
        if (f === filter) {
            btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/30 transition-all whitespace-nowrap cursor-pointer shadow-sm';
        } else {
            btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-all whitespace-nowrap cursor-pointer';
        }
    });
    renderRemindersTable();
}
window.setReminderFilter = setReminderFilter;

function setReminderViewMode(mode) {
    currentReminderViewMode = mode;
    localStorage.setItem('executive_reminder_view_mode', mode);
    
    const btnCards = document.getElementById('btnReminderViewCards');
    const btnTable = document.getElementById('btnReminderViewTable');
    const containerCards = document.getElementById('remindersCardsContainer');
    const containerTable = document.getElementById('remindersTableContainer');

    if (btnCards && btnTable) {
        if (mode === 'cards') {
            btnCards.className = 'p-1.5 px-2.5 rounded-lg text-xs text-brand-400 bg-surface-800/90 transition-all cursor-pointer shadow-sm';
            btnTable.className = 'p-1.5 px-2.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all cursor-pointer';
            if (containerCards) containerCards.classList.remove('hidden');
            if (containerTable) containerTable.classList.add('hidden');
        } else {
            btnCards.className = 'p-1.5 px-2.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all cursor-pointer';
            btnTable.className = 'p-1.5 px-2.5 rounded-lg text-xs text-brand-400 bg-surface-800/90 transition-all cursor-pointer shadow-sm';
            if (containerCards) containerCards.classList.add('hidden');
            if (containerTable) containerTable.classList.remove('hidden');
        }
    }
}
window.setReminderViewMode = setReminderViewMode;

function clearReminderSearch() {
    const searchInput = document.getElementById('reminderSearchInput');
    const clearBtn = document.getElementById('btnClearReminderSearch');
    if (searchInput) searchInput.value = '';
    if (clearBtn) clearBtn.classList.add('hidden');
    renderRemindersTable();
}
window.clearReminderSearch = clearReminderSearch;

function postponeReminder(id, days = 1) {
    if (!db.reminders) return;
    const r = db.reminders.find(x => x.id === id);
    if (!r) return;

    let baseDate = new Date();
    if (r.date) {
        let dStr = r.date;
        if (dStr.includes('/')) {
            const p = dStr.split('/');
            if (p.length === 3) dStr = `${p[2]}-${p[1]}-${p[0]}`;
        }
        const parsed = new Date(dStr);
        if (!isNaN(parsed.getTime())) {
            baseDate = parsed > new Date() ? parsed : new Date();
        }
    }

    baseDate.setDate(baseDate.getDate() + days);
    const newDDMMYYYY = baseDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    r.date = newDDMMYYYY;
    r.notifiedDue = false;
    
    saveDatabase();
    renderRemindersTable();
    showToast(`Postponed by ${days === 1 ? '1 day' : days + ' days'} to ${newDDMMYYYY}`);
}
window.postponeReminder = postponeReminder;

function renderRemindersTable() {
    const body = document.getElementById('remindersTableBody');
    const cardsContainer = document.getElementById('remindersCardsContainer');
    if (!db.reminders) db.reminders = [];

    // Ensure View Mode toggle is synchronized
    setReminderViewMode(currentReminderViewMode);

    // Calculate stats
    const totalAll = db.reminders.length;
    const totalActive = db.reminders.filter(r => !r.completed && r.status !== 'completed').length;
    const totalHigh = db.reminders.filter(r => (!r.completed && r.status !== 'completed') && (r.priority || '').toLowerCase() === 'high').length;
    const totalOverdue = db.reminders.filter(r => isReminderOverdue(r)).length;
    const totalCompleted = db.reminders.filter(r => r.completed || r.status === 'completed').length;
    const completionRate = totalAll > 0 ? Math.round((totalCompleted / totalAll) * 100) : 0;

    // Update KPI Elements
    const activeStat = document.getElementById('remindersActiveStat');
    const highStat = document.getElementById('remindersHighStat');
    const overdueStat = document.getElementById('remindersOverdueStat');
    const completedStat = document.getElementById('remindersCompletedStat');
    const completionRateEl = document.getElementById('remindersCompletionRate');

    if (activeStat) activeStat.innerText = totalActive.toString();
    if (highStat) highStat.innerText = totalHigh.toString();
    if (overdueStat) overdueStat.innerText = totalOverdue.toString();
    if (completedStat) completedStat.innerText = totalCompleted.toString();
    if (completionRateEl) completionRateEl.innerText = `${completionRate}% Done`;

    // Update Count Badges on Filters
    const cntAll = document.getElementById('cntFilterAll');
    const cntAct = document.getElementById('cntFilterActive');
    const cntHigh = document.getElementById('cntFilterHigh');
    const cntOverdue = document.getElementById('cntFilterOverdue');
    const cntComp = document.getElementById('cntFilterCompleted');

    if (cntAll) cntAll.innerText = totalAll.toString();
    if (cntAct) cntAct.innerText = totalActive.toString();
    if (cntHigh) cntHigh.innerText = totalHigh.toString();
    if (cntOverdue) cntOverdue.innerText = totalOverdue.toString();
    if (cntComp) cntComp.innerText = totalCompleted.toString();

    // Search query & clear button visibility
    const searchInput = document.getElementById('reminderSearchInput');
    const clearBtn = document.getElementById('btnClearReminderSearch');
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    if (clearBtn) {
        if (q) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }

    // Sort by Date & Priority
    let list = [...db.reminders].sort((a, b) => {
        const isCompA = a.completed || a.status === 'completed';
        const isCompB = b.completed || b.status === 'completed';
        if (isCompA !== isCompB) return isCompA ? 1 : -1;

        const dateA = a.date ? (a.date.includes('/') ? a.date.split('/').reverse().join('-') : a.date) : '';
        const dateB = b.date ? (b.date.includes('/') ? b.date.split('/').reverse().join('-') : b.date) : '';
        return (dateA + (a.time || '')) > (dateB + (b.time || '')) ? 1 : -1;
    });

    // Apply Filter
    if (currentReminderFilter === 'active') {
        list = list.filter(r => !r.completed && r.status !== 'completed');
    } else if (currentReminderFilter === 'high') {
        list = list.filter(r => (r.priority || '').toLowerCase() === 'high');
    } else if (currentReminderFilter === 'overdue') {
        list = list.filter(r => isReminderOverdue(r));
    } else if (currentReminderFilter === 'completed') {
        list = list.filter(r => r.completed || r.status === 'completed');
    }

    // Apply Search
    if (q) {
        list = list.filter(r => 
            (r.title && r.title.toLowerCase().includes(q)) || 
            (r.notes && r.notes.toLowerCase().includes(q)) ||
            (r.date && r.date.toLowerCase().includes(q)) ||
            (r.priority && r.priority.toLowerCase().includes(q))
        );
    }

    // 1. RENDER CARDS VIEW
    if (cardsContainer) {
        cardsContainer.innerHTML = '';
        if (list.length === 0) {
            cardsContainer.innerHTML = `
                <div class="p-12 text-center text-slate-500 font-light text-xs rounded-2xl bg-surface-900/40 border border-surface-800/60">
                    <div class="w-12 h-12 rounded-2xl bg-surface-800/80 border border-surface-700/60 text-slate-400 flex items-center justify-center mx-auto mb-3 text-lg shadow-inner">
                        <i class="fa-regular fa-calendar-check text-brand-400/60"></i>
                    </div>
                    <div class="text-white font-medium text-sm mb-1">No Reminders Found</div>
                    <p class="text-slate-400 max-w-sm mx-auto mb-4">There are no reminders matching the selected filter or search query.</p>
                    <button onclick="openReminderModal()" class="px-4 py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-plus text-[10px]"></i> Create New Reminder
                    </button>
                </div>
            `;
        } else {
            list.forEach(r => {
                const isComp = r.completed || r.status === 'completed';
                const isOverdue = isReminderOverdue(r);
                const isToday = isReminderToday(r);

                // Date Parsing for Date Box
                let dayNum = '--';
                let monthStr = 'DATE';
                let dayOfWeek = '';
                if (r.date) {
                    let dStr = r.date;
                    if (dStr.includes('/')) {
                        const p = dStr.split('/');
                        if (p.length === 3) dStr = `${p[2]}-${p[1]}-${p[0]}`;
                    }
                    const parsedDate = new Date(dStr);
                    if (!isNaN(parsedDate.getTime())) {
                        dayNum = parsedDate.getDate().toString().padStart(2, '0');
                        monthStr = parsedDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                        dayOfWeek = parsedDate.toLocaleString('default', { weekday: 'short' });
                    }
                }

                // Priority Indicator
                const prio = (r.priority || r.category || 'Medium').toLowerCase();
                let prioBadge = '';
                if (prio === 'high') {
                    prioBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-rose-400 bg-rose-500/10 border border-rose-500/25 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>High</span>`;
                } else if (prio === 'low') {
                    prioBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-slate-400 bg-surface-800 border border-surface-700 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>Low</span>`;
                } else {
                    prioBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-brand-300 bg-brand-500/10 border border-brand-500/25 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-brand-400"></span>Medium</span>`;
                }

                // Status Pill
                let statusPill = '';
                if (isComp) {
                    statusPill = `<span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-1"><i class="fa-solid fa-check text-[8px]"></i> Completed</span>`;
                } else if (isOverdue) {
                    statusPill = `<span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 flex items-center gap-1 animate-pulse"><i class="fa-solid fa-triangle-exclamation text-[8px]"></i> Overdue</span>`;
                } else if (isToday) {
                    statusPill = `<span class="px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold text-brand-300 bg-brand-500/15 border border-brand-500/30 flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-brand-400"></span> Due Today</span>`;
                }

                const card = document.createElement('div');
                card.className = `p-4 sm:p-5 rounded-2xl border transition-all duration-200 group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isComp 
                        ? 'bg-surface-900/30 border-surface-800/40 opacity-60 hover:opacity-100' 
                        : isOverdue
                            ? 'bg-gradient-to-r from-amber-500/[0.04] to-surface-900/80 border-amber-500/30 hover:border-amber-500/50 shadow-sm'
                            : 'bg-surface-900/70 border-surface-800/80 hover:border-brand-500/30 hover:bg-surface-900/90 shadow-sm'
                }`;

                card.innerHTML = `
                    <div class="flex items-start gap-3.5 flex-1 min-w-0">
                        <!-- Custom Interactive Check Circle -->
                        <button onclick="toggleReminderStatus('${r.id}')" class="mt-1 w-6 h-6 rounded-full border ${
                            isComp 
                                ? 'bg-emerald-500 border-emerald-500 text-surface-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                                : 'border-surface-700 bg-surface-950/60 hover:border-brand-400 text-transparent hover:text-brand-400/40'
                        } flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-90" title="${isComp ? 'Mark as Pending' : 'Mark Completed'}">
                            <i class="fa-solid fa-check text-xs ${isComp ? 'text-surface-950' : 'opacity-0 hover:opacity-100'}"></i>
                        </button>

                        <!-- Date Badge Block -->
                        <div class="hidden sm:flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-surface-950/60 border border-surface-800 text-center shrink-0 p-1">
                            <span class="text-[9px] font-mono font-bold tracking-wider ${isOverdue ? 'text-amber-400' : 'text-brand-400'} leading-none">${monthStr}</span>
                            <span class="text-base font-bold font-mono text-white leading-tight">${dayNum}</span>
                        </div>

                        <!-- Content Details -->
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <span class="font-display font-semibold text-sm sm:text-base text-white ${isComp ? 'line-through text-slate-400' : ''} truncate">${r.title}</span>
                                ${statusPill}
                                ${prioBadge}
                            </div>
                            
                            ${r.notes ? `<p class="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed mb-1.5">${r.notes}</p>` : ''}
                            
                            <!-- Date, Time & Repeat Meta -->
                            <div class="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                                <span class="flex items-center gap-1.5 text-slate-300">
                                    <i class="fa-regular fa-calendar text-[10px] text-brand-400"></i>
                                    <span>${dayOfWeek ? dayOfWeek + ', ' : ''}${formatToDDMMYYYY(r.date)}</span>
                                </span>
                                ${r.time ? `<span class="flex items-center gap-1 text-slate-400"><i class="fa-regular fa-clock text-[9px] text-brand-400"></i>${r.time}</span>` : ''}
                                ${r.repeat && r.repeat !== 'None' ? `<span class="flex items-center gap-1 text-brand-400/80 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 text-[10px]"><i class="fa-solid fa-arrows-rotate text-[9px]"></i>${r.repeat}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions Strip -->
                    <div class="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-800/40 w-full sm:w-auto justify-end">
                        ${!isComp ? `
                            <button onclick="postponeReminder('${r.id}', 1)" class="px-2.5 py-1.5 rounded-lg bg-surface-950/60 hover:bg-surface-800 text-slate-400 hover:text-brand-300 border border-surface-800 text-xs transition-all flex items-center gap-1 cursor-pointer" title="Postpone by +1 Day">
                                <i class="fa-regular fa-clock text-[10px]"></i> <span class="text-[10px] font-mono">+1d</span>
                            </button>
                        ` : ''}
                        <button onclick="openReminderModal('${r.id}')" class="p-2 rounded-lg bg-surface-950/60 hover:bg-brand-500/15 text-slate-400 hover:text-brand-300 border border-surface-800 text-xs transition-all cursor-pointer" title="Edit Reminder">
                            <i class="fa-solid fa-pen text-[11px]"></i>
                        </button>
                        <button onclick="deleteReminder('${r.id}')" class="p-2 rounded-lg bg-surface-950/60 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 border border-surface-800 text-xs transition-all cursor-pointer" title="Delete Reminder">
                            <i class="fa-solid fa-trash text-[11px]"></i>
                        </button>
                    </div>
                `;
                cardsContainer.appendChild(card);
            });
        }
    }

    // 2. RENDER TABLE VIEW
    if (body) {
        body.innerHTML = '';
        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="5" class="p-12 text-center text-slate-500 font-light text-xs"><i class="fa-regular fa-calendar-check text-3xl mb-3 block opacity-40"></i> No reminders found matching the current filter.</td></tr>`;
        } else {
            list.forEach(r => {
                const isComp = r.completed || r.status === 'completed';
                const isOverdue = isReminderOverdue(r);

                let prioBadgeClass = 'border-slate-700 bg-surface-900 text-slate-400';
                const prio = (r.priority || r.category || 'Medium').toLowerCase();
                if (prio === 'high') prioBadgeClass = 'border-rose-500/30 bg-rose-500/10 text-rose-400';
                else if (prio === 'low') prioBadgeClass = 'border-slate-700 bg-surface-900 text-slate-400';
                else prioBadgeClass = 'border-brand-500/30 bg-brand-500/10 text-brand-300';

                const tr = document.createElement('tr');
                tr.className = `group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0 ${isComp ? 'opacity-60 hover:opacity-100' : ''}`;
                
                tr.innerHTML = `
                    <td class="py-3 px-5">
                        <div class="flex items-start gap-3">
                            <button onclick="toggleReminderStatus('${r.id}')" class="mt-0.5 w-5 h-5 rounded-full border ${isComp ? 'bg-emerald-500 border-emerald-500 text-surface-950' : 'border-surface-700 bg-surface-900/60 hover:border-brand-400 text-transparent'} flex items-center justify-center transition-colors shrink-0 cursor-pointer" title="${isComp ? 'Reactivate' : 'Mark Completed'}">
                                <i class="fa-solid fa-check text-[10px] ${isComp ? 'text-surface-950' : 'opacity-0'}"></i>
                            </button>
                            <div>
                                <div class="font-semibold text-slate-100 ${isComp ? 'line-through text-slate-500' : ''}">${r.title}</div>
                                ${r.notes ? `<div class="text-xs text-slate-400 font-light mt-0.5 leading-relaxed whitespace-pre-wrap">${r.notes}</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td class="py-3 px-4 font-mono text-xs">
                        <div class="flex items-center gap-1.5 text-slate-300">
                            <i class="fa-regular fa-calendar text-[10px] text-brand-400"></i>
                            <span>${formatToDDMMYYYY(r.date)}</span>
                        </div>
                        ${r.time ? `<div class="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5"><i class="fa-regular fa-clock text-[9px] text-brand-400"></i><span>${r.time}</span></div>` : ''}
                        ${isOverdue && !isComp ? `<span class="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold font-mono uppercase tracking-wider">Overdue</span>` : ''}
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold border ${prioBadgeClass}">
                            ${r.priority || 'Medium'}
                        </span>
                    </td>
                    <td class="py-3 px-4 font-mono text-xs text-slate-400">
                        <span class="flex items-center gap-1.5">
                            <i class="fa-solid ${r.repeat && r.repeat !== 'None' ? 'fa-arrows-rotate text-brand-400' : 'fa-minus text-slate-600'} text-[10px]"></i>
                            ${r.repeat || 'None'}
                        </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onclick="toggleReminderStatus('${r.id}')" class="p-1.5 rounded-lg bg-surface-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer" title="${isComp ? 'Reactivate' : 'Mark Complete'}">
                                <i class="fa-solid ${isComp ? 'fa-rotate-left text-amber-400' : 'fa-check text-emerald-400'} text-xs"></i>
                            </button>
                            <button onclick="openReminderModal('${r.id}')" class="p-1.5 rounded-lg bg-surface-800 hover:bg-brand-500/20 text-slate-400 hover:text-brand-300 transition-colors cursor-pointer" title="Edit">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onclick="deleteReminder('${r.id}')" class="p-1.5 rounded-lg bg-surface-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer" title="Delete">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                    </td>
                `;
                body.appendChild(tr);
            });
        }
    }
}
window.renderRemindersTable = renderRemindersTable;

function openReminderModal(id = null) {
    const idEl = document.getElementById('reminderId');
    if (idEl) idEl.value = id || '';
    const titleEl = document.getElementById('reminderModalTitle');
    const titleInput = document.getElementById('reminderTitleInput');
    const dateInput = document.getElementById('reminderDateInput');
    const timeInput = document.getElementById('reminderTimeInput');
    const prioInput = document.getElementById('reminderPriorityInput');
    const repInput = document.getElementById('reminderRepeatInput');
    const notesInput = document.getElementById('reminderNotesInput');

    const todayFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (id) {
        const r = (db.reminders || []).find(x => x.id === id);
        if (r) {
            if (titleEl) titleEl.innerText = 'Edit Reminder';
            if (titleInput) titleInput.value = r.title || '';
            if (dateInput) {
                if (dateInput._flatpickr) {
                    dateInput._flatpickr.setDate(r.date && r.date.includes('-') ? r.date.split('-').reverse().join('/') : (r.date || todayFormatted));
                } else {
                    dateInput.value = r.date || todayFormatted;
                }
            }
            if (timeInput) timeInput.value = r.time || '';
            if (prioInput) prioInput.value = r.priority || r.category || 'Medium';
            if (repInput) repInput.value = r.repeat || 'None';
            if (notesInput) notesInput.value = r.notes || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Reminder';
        if (titleInput) titleInput.value = '';
        if (dateInput) {
            if (dateInput._flatpickr) {
                dateInput._flatpickr.setDate(new Date());
            } else {
                dateInput.value = todayFormatted;
            }
        }
        if (timeInput) timeInput.value = '';
        if (prioInput) prioInput.value = 'Medium';
        if (repInput) repInput.value = 'None';
        if (notesInput) notesInput.value = '';
    }
    openModal('reminderModal');
}
window.openReminderModal = openReminderModal;

// ==========================================
// NOTIFICATION AUDIO & SOUND CHIME ENGINE
// ==========================================
let notifAudioContext = null;

function getAudioContext() {
    try {
        if (!notifAudioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                notifAudioContext = new AudioContextClass();
            }
        }
        if (notifAudioContext && notifAudioContext.state === 'suspended') {
            notifAudioContext.resume().catch(() => {});
        }
        return notifAudioContext;
    } catch (e) {
        return null;
    }
}
window.getAudioContext = getAudioContext;

function isNotificationSoundMuted() {
    return localStorage.getItem('executive_notif_sound_muted') === 'true';
}

function updateNotificationSoundUI() {
    const isMuted = isNotificationSoundMuted();
    const btn = document.getElementById('btnNotificationSound');
    const icon = document.getElementById('notifSoundIcon');
    const text = document.getElementById('notifSoundText');

    if (icon) {
        icon.className = isMuted 
            ? 'fa-solid fa-volume-xmark text-[10px] text-slate-500' 
            : 'fa-solid fa-volume-high text-[10px] text-amber-400';
    }
    if (text) {
        text.innerText = isMuted ? 'Muted' : 'Chime ON';
    }
    if (btn) {
        btn.className = isMuted
            ? 'text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors bg-surface-900 px-2.5 py-1 rounded-lg border border-surface-800 flex items-center gap-1.5 cursor-pointer shadow-sm'
            : 'text-[10px] font-mono text-slate-300 hover:text-amber-400 transition-colors bg-surface-800/80 px-2.5 py-1 rounded-lg border border-surface-700 flex items-center gap-1.5 cursor-pointer shadow-sm';
    }
}
window.updateNotificationSoundUI = updateNotificationSoundUI;

function toggleNotificationSound() {
    const currentlyMuted = isNotificationSoundMuted();
    const newMutedState = !currentlyMuted;
    localStorage.setItem('executive_notif_sound_muted', newMutedState ? 'true' : 'false');
    updateNotificationSoundUI();
    
    if (!newMutedState) {
        playNotificationSound(true);
        showToast('Notification chime enabled');
    } else {
        showToast('Notification chime muted');
    }
}
window.toggleNotificationSound = toggleNotificationSound;

function testNotificationSound() {
    playNotificationSound(true);
    showToast('Playing notification chime test');
}
window.testNotificationSound = testNotificationSound;

function playNotificationSound(force = false) {
    if (isNotificationSoundMuted() && !force) return;

    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;

        const playTone = (freq, startTime, duration, gainLevel, type = 'sine') => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        // Modern harmonic 2-tone executive bell chime (E5 -> A5 with sparkling overtones)
        playTone(659.25, now, 0.35, 0.22, 'sine');
        playTone(987.77, now + 0.015, 0.22, 0.06, 'triangle');
        playTone(880.00, now + 0.12, 0.55, 0.26, 'sine');
        playTone(1318.51, now + 0.135, 0.38, 0.07, 'triangle');
    } catch (err) {
        console.warn('Audio playback not permitted or unavailable:', err);
    }
}
window.playNotificationSound = playNotificationSound;

function pushNotification({ title, desc = '', type = 'reminder', category = 'reminder', linkPage = '', playSound = true }) {
    if (!db.notifications) db.notifications = [];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    
    const notifItem = {
        id: 'notif-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
        type,
        category,
        title,
        desc,
        date: nowStr,
        read: false,
        linkPage
    };

    db.notifications.unshift(notifItem);
    if (db.notifications.length > 50) {
        db.notifications = db.notifications.slice(0, 50);
    }

    if (playSound) {
        playNotificationSound();
    }

    saveDatabase();
    renderNotifications();
    return notifItem;
}
window.pushNotification = pushNotification;

function saveReminder() {
    const idEl = document.getElementById('reminderId');
    const id = idEl ? idEl.value : '';
    const dateInput = document.getElementById('reminderDateInput');
    const dateRaw = dateInput ? dateInput.value.trim() : '';
    let date = dateRaw;
    if (dateRaw && dateRaw.includes('-')) {
        const p = dateRaw.split('-');
        if (p.length === 3) date = `${p[2]}/${p[1]}/${p[0]}`;
    }
    const titleInput = document.getElementById('reminderTitleInput');
    const title = titleInput ? (titleInput.value.trim() || 'Reminder') : 'Reminder';
    const timeInput = document.getElementById('reminderTimeInput');
    const time = timeInput ? timeInput.value.trim() : '';
    const prioInput = document.getElementById('reminderPriorityInput');
    const priority = prioInput ? prioInput.value : 'Medium';
    const repInput = document.getElementById('reminderRepeatInput');
    const repeat = repInput ? repInput.value : 'None';
    const notesInput = document.getElementById('reminderNotesInput');
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!db.reminders) db.reminders = [];
    if (!db.notifications) db.notifications = [];

    const isNew = !id;
    if (id) {
        const r = db.reminders.find(x => x.id === id);
        if (r) {
            r.date = date;
            r.time = time;
            r.title = title;
            r.priority = priority;
            r.category = priority;
            r.repeat = repeat;
            r.notes = notes;
        }
    } else {
        db.reminders.push({
            id: Date.now().toString(),
            date,
            time,
            title,
            priority,
            category: priority,
            repeat,
            notes,
            status: 'active',
            completed: false,
            createdAt: new Date().toISOString()
        });
    }

    // Reflect directly in Notification Hub with chime
    pushNotification({
        title: isNew ? `New Reminder: ${title}` : `Updated Reminder: ${title}`,
        desc: `${date}${time ? ' at ' + time : ''} • Priority: ${priority}${repeat !== 'None' ? ' • Repeat: ' + repeat : ''}`,
        type: 'reminder',
        category: 'reminder',
        linkPage: 'reminders',
        playSound: isNew
    });

    renderRemindersTable();
    closeModal('reminderModal');
    showToast(isNew ? 'Reminder created & added to Notification Hub' : 'Reminder updated');
}
window.saveReminder = saveReminder;

function toggleReminderStatus(id) {
    const r = (db.reminders || []).find(x => x.id === id);
    if (!r) return;
    r.completed = !r.completed;
    r.status = r.completed ? 'completed' : 'active';
    
    if (r.completed) {
        pushNotification({
            title: `Reminder Completed: ${r.title}`,
            desc: `Scheduled for ${r.date} marked as completed`,
            type: 'reminder',
            category: 'reminder',
            linkPage: 'reminders',
            playSound: true
        });
    }

    saveDatabase();
    renderRemindersTable();
    renderNotifications();
    showToast(r.completed ? 'Reminder marked as completed' : 'Reminder reactivated');
}
window.toggleReminderStatus = toggleReminderStatus;

function deleteReminder(id) {
    requireConfirmation('Delete this reminder?', () => {
        if (db.reminders) {
            db.reminders = db.reminders.filter(x => x.id !== id);
            saveDatabase();
            renderRemindersTable();
            renderNotifications();
            showToast('Reminder deleted');
        }
    });
}
window.deleteReminder = deleteReminder;

function checkReminders() {
    if (!db.reminders) return;
    const now = new Date();
    let triggerCount = 0;

    db.reminders.forEach(r => {
        if (!r.completed && r.status !== 'completed' && r.date) {
            let d;
            if (r.date.includes('/')) {
                const p = r.date.split('/');
                d = new Date(`${p[2]}-${p[1]}-${p[0]}T${r.time || '23:59'}:00`);
            } else {
                d = new Date(`${r.date}T${r.time || '23:59'}:00`);
            }

            if (!isNaN(d.getTime()) && d <= now && !r.notifiedDue) {
                r.notifiedDue = true;
                pushNotification({
                    title: `Reminder Due: ${r.title}`,
                    desc: `${r.date}${r.time ? ' at ' + r.time : ''} • Priority: ${r.priority || 'Medium'}`,
                    type: 'reminder',
                    category: 'reminder',
                    linkPage: 'reminders',
                    playSound: false
                });
                triggerCount++;
            }
        }
    });

    if (triggerCount > 0) {
        playNotificationSound();
        saveDatabase();
        renderRemindersTable();
        renderNotifications();
    }
}
window.checkReminders = checkReminders;

function renderNotifications() {
    const list = document.getElementById('notificationsList');
    const badge = document.getElementById('notificationBadge');
    if (!list) return;

    list.innerHTML = '';
    const notifs = db.notifications || [];
    const unreadCount = notifs.filter(n => !n.read).length;

    if (badge) {
        if (unreadCount > 0) {
            badge.innerText = unreadCount.toString();
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    notifs.forEach(n => {
        const item = document.createElement('div');
        const isRead = !!n.read;
        item.className = `p-4 rounded-xl border flex items-start justify-between gap-3 transition-all ${
            isRead 
            ? 'bg-surface-900/40 border-surface-800/60 text-slate-500 hover:border-surface-700' 
            : 'bg-surface-900/80 border-surface-700 text-slate-200 shadow-md hover:border-amber-500/40'
        }`;

        let iconClass = 'fa-solid fa-bell text-indigo-400';
        if (n.category === 'transaction' || n.type === 'transaction') iconClass = 'fa-solid fa-receipt text-emerald-400';
        else if (n.category === 'goal' || n.type === 'goal') iconClass = 'fa-solid fa-bullseye text-brand-500';
        else if (n.category === 'asset' || n.type === 'asset') iconClass = 'fa-solid fa-vault text-accent-cyan';

        item.innerHTML = `
            <div class="flex items-start gap-3 flex-1 min-w-0 cursor-pointer" onclick="handleNotificationClick('${n.id}', '${n.linkPage || ''}')">
                <div class="w-8 h-8 rounded-lg bg-surface-800/80 border border-surface-700 flex items-center justify-center shrink-0 mt-0.5">
                    <i class="${iconClass} text-xs"></i>
                </div>
                <div class="space-y-1 flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <h5 class="text-xs font-semibold ${isRead ? 'text-slate-400' : 'text-slate-100'} truncate">${n.title}</h5>
                        <span class="font-mono text-[9px] text-slate-500 shrink-0">${n.date}</span>
                    </div>
                    ${n.desc ? `<p class="text-[11px] font-light ${isRead ? 'text-slate-500' : 'text-slate-400'} line-clamp-2 leading-relaxed">${n.desc}</p>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0 self-center">
                ${!isRead ? `<button onclick="toggleSingleNotificationRead('${n.id}')" class="p-1 text-slate-500 hover:text-amber-400 transition-colors" title="Mark Read"><i class="fa-solid fa-circle-check text-xs"></i></button>` : ''}
                <button onclick="deleteNotification('${n.id}')" class="p-1 text-slate-500 hover:text-rose-400 transition-colors" title="Delete"><i class="fa-solid fa-xmark text-xs"></i></button>
            </div>
        `;
        list.appendChild(item);
    });

    if (notifs.length === 0) {
        list.innerHTML = `<div class="p-10 text-center text-slate-500 text-xs font-light"><i class="fa-regular fa-bell text-2xl mb-2 block opacity-30"></i> No notifications yet. Reminders and milestone updates will appear here.</div>`;
    }
}
window.renderNotifications = renderNotifications;

function handleNotificationClick(notifId, linkPage) {
    if (db.notifications) {
        const n = db.notifications.find(x => x.id === notifId);
        if (n) n.read = true;
        saveDatabase();
        renderNotifications();
    }
    if (linkPage && typeof window.switchView === 'function') {
        window.switchView(linkPage);
    }
}
window.handleNotificationClick = handleNotificationClick;

function toggleSingleNotificationRead(id) {
    if (!db.notifications) return;
    const n = db.notifications.find(x => x.id === id);
    if (n) {
        n.read = !n.read;
        saveDatabase();
        renderNotifications();
    }
}
window.toggleSingleNotificationRead = toggleSingleNotificationRead;

function deleteNotification(id) {
    if (!db.notifications) return;
    db.notifications = db.notifications.filter(x => x.id !== id);
    saveDatabase();
    renderNotifications();
}
window.deleteNotification = deleteNotification;

function toggleNotifications() {
    const el = document.getElementById('notificationsDropdown');
    if (el) el.classList.toggle('hidden');
}
window.toggleNotifications = toggleNotifications;

function markAllNotificationsRead() {
    if (!db.notifications) return;
    db.notifications.forEach(n => n.read = true);
    saveDatabase();
    renderNotifications();
    showToast('All notifications marked as read');
}
window.markAllNotificationsRead = markAllNotificationsRead;

function clearAllNotifications() {
    db.notifications = [];
    saveDatabase();
    renderNotifications();
    showToast('Notification hub cleared');
}
window.clearAllNotifications = clearAllNotifications;

function openUniversalSearch() {
    const input = document.getElementById('universalSearchInput');
    const container = document.getElementById('searchResultsContainer');
    if (input) input.value = '';
    if (container) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-500 font-light">
                <i class="fa-solid fa-magnifying-glass text-3xl mb-3 opacity-30 text-brand-500"></i>
                <p class="font-light text-sm">Start typing to search your workspace across assets, banking, equities, budgets, notes, and reminders...</p>
            </div>
        `;
    }
    openModal('universalSearchModal');
    setTimeout(() => {
        if (input) input.focus();
    }, 100);
}
window.openUniversalSearch = openUniversalSearch;
window.openSearchModal = openUniversalSearch;

function executeUniversalSearch() {
    const input = document.getElementById('universalSearchInput');
    const q = (input ? input.value : '').toLowerCase().trim();
    const container = document.getElementById('searchResultsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (!q) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-500 font-light">
                <i class="fa-solid fa-magnifying-glass text-3xl mb-3 opacity-30 text-brand-500"></i>
                <p class="font-light text-sm">Start typing to search your workspace across assets, banking, equities, budgets, notes, and reminders...</p>
            </div>
        `;
        return;
    }

    const results = [];

    // Search Assets
    (db.assetLogs || []).forEach(l => {
        if ((l.assetName && l.assetName.toLowerCase().includes(q)) || (l.category && l.category.toLowerCase().includes(q))) {
            results.push({ page: 'assets', tab: 'valuation', label: `Asset: ${l.assetName} (${l.category})` });
        }
    });

    // Search Banks
    (db.bankAccounts || []).forEach(b => {
        if ((b.bankName && b.bankName.toLowerCase().includes(q)) || (b.accountName && b.accountName.toLowerCase().includes(q))) {
            results.push({ page: 'assets', tab: 'banking', label: `Bank: ${b.bankName} - ${b.accountName}` });
        }
    });

    // Search Mutual Funds & Loans
    (db.assetMutualFunds || []).forEach(mf => {
        if ((mf.fundName && mf.fundName.toLowerCase().includes(q)) || (mf.folioNumber && mf.folioNumber.toLowerCase().includes(q))) {
            results.push({ page: 'assets', tab: 'mf', label: `Mutual Fund: ${mf.fundName}` });
        }
    });

    (db.loans || []).forEach(l => {
        if ((l.loanName && l.loanName.toLowerCase().includes(q)) || (l.bankName && l.bankName.toLowerCase().includes(q))) {
            results.push({ page: 'assets', tab: 'liabilities', label: `Liability: ${l.loanName || l.bankName}` });
        }
    });

    // Search Equities
    if (db.indiaOps && db.indiaOps.shareMarket) {
        db.indiaOps.shareMarket.forEach(sm => {
            if ((sm.script && sm.script.toLowerCase().includes(q)) || (sm.notes && sm.notes.toLowerCase().includes(q))) {
                results.push({ page: 'equities', label: `Equity Position: ${sm.script} (${sm.month} ${sm.year})` });
            }
        });
    }

    // Search Notes
    (db.notes || []).forEach(n => {
        if ((n.title && n.title.toLowerCase().includes(q)) || (n.body && n.body.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q))) {
            results.push({ page: 'notes', id: n.id, label: `Note: ${n.title}` });
        }
    });

    // Search Goals
    (db.goals || []).forEach(g => {
        if ((g.title && g.title.toLowerCase().includes(q)) || (g.category && g.category.toLowerCase().includes(q))) {
            results.push({ page: 'goals', label: `Goal: ${g.title} (${g.category})` });
        }
    });

    // Search Reminders
    (db.reminders || []).forEach(r => {
        if ((r.title && r.title.toLowerCase().includes(q)) || (r.category && r.category.toLowerCase().includes(q))) {
            results.push({ page: 'reminders', label: `Reminder: ${r.title}` });
        }
    });

    results.forEach(res => {
        const item = document.createElement('div');
        item.className = 'p-3.5 rounded-xl bg-surface-900/60 border border-surface-800 hover:border-brand-500 hover:bg-surface-800/80 cursor-pointer flex items-center justify-between text-xs text-slate-200 transition-all';
        item.innerHTML = `<span>${res.label}</span> <span class="font-mono text-[10px] uppercase text-brand-500">Go to ${res.page} →</span>`;
        item.onclick = () => {
            closeModal('universalSearchModal');
            switchPage(res.page);
            if (res.tab) switchAssetSubTab(res.tab);
        };
        container.appendChild(item);
    });

    if (results.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-slate-500 text-xs font-light">No matching records found for "${q}"</div>`;
    }
}
window.executeUniversalSearch = executeUniversalSearch;
window.handleUniversalSearch = executeUniversalSearch;

function renderGrowthChart() {
    const canvas = document.getElementById('growthChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (window.growthChartInst) window.growthChartInst.destroy();

    const labels = ['2021', '2022', '2023', '2024', '2025', '2026 (Live)'];
    const data = [1200000, 2400000, 4800000, 8500000, 14200000, 21850000];

    window.growthChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Consolidated Wealth Trajectory (INR)',
                data: data,
                borderColor: '#C9A46B',
                backgroundColor: 'rgba(201, 164, 107, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#C9A46B',
                pointBorderColor: '#070A0F',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: chartGridOptions },
                y: {
                    grid: chartGridOptions,
                    ticks: {
                        callback: function(val) {
                            return '₹' + (val / 100000).toFixed(1) + 'L';
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function exportToExcel() {
    const wb = XLSX.utils.book_new();

    // Export Assets Log
    const wsAssets = XLSX.utils.json_to_sheet(db.assetLogs || []);
    XLSX.utils.book_append_sheet(wb, wsAssets, "Asset_Valuations");

    // Export Banking
    const wsBanks = XLSX.utils.json_to_sheet(db.bankAccounts || []);
    XLSX.utils.book_append_sheet(wb, wsBanks, "Bank_Accounts");

    // Export Mutual Funds
    const wsMF = XLSX.utils.json_to_sheet(db.assetMutualFunds || []);
    XLSX.utils.book_append_sheet(wb, wsMF, "Mutual_Funds");

    // Export Loans
    const wsLoans = XLSX.utils.json_to_sheet(db.loans || []);
    XLSX.utils.book_append_sheet(wb, wsLoans, "Liabilities_Loans");

    // Export Equities
    const wsEquities = XLSX.utils.json_to_sheet(db.indiaOps.shareMarket || []);
    XLSX.utils.book_append_sheet(wb, wsEquities, "Equities_Trading");

    // Export Miscellaneous Ledger
    const wsOthers = XLSX.utils.json_to_sheet(db.indiaOps.othersEntries || []);
    XLSX.utils.book_append_sheet(wb, wsOthers, "Miscellaneous_Ledger");

    // Export Budgets
    const wsBudgetQAR = XLSX.utils.json_to_sheet(db.budget.QAR || []);
    XLSX.utils.book_append_sheet(wb, wsBudgetQAR, "Budget_QAR");
    const wsBudgetINR = XLSX.utils.json_to_sheet(db.budget.INR || []);
    XLSX.utils.book_append_sheet(wb, wsBudgetINR, "Budget_INR");

    // Export Expenses
    const wsExpenses = XLSX.utils.json_to_sheet(db.dailyExpenses || []);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Daily_Expenses");

    // Export Goals
    const wsGoals = XLSX.utils.json_to_sheet(db.goals || []);
    XLSX.utils.book_append_sheet(wb, wsGoals, "Milestones");

    XLSX.writeFile(wb, `Riyas_Executive_OS_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Executive database exported to Excel');
}

function importFromExcel(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: 'array' });

        if (wb.Sheets["Asset_Valuations"]) db.assetLogs = XLSX.utils.sheet_to_json(wb.Sheets["Asset_Valuations"]);
        if (wb.Sheets["Bank_Accounts"]) db.bankAccounts = XLSX.utils.sheet_to_json(wb.Sheets["Bank_Accounts"]);
        if (wb.Sheets["Mutual_Funds"]) db.assetMutualFunds = XLSX.utils.sheet_to_json(wb.Sheets["Mutual_Funds"]);
        if (wb.Sheets["Liabilities_Loans"]) db.loans = XLSX.utils.sheet_to_json(wb.Sheets["Liabilities_Loans"]);
        if (wb.Sheets["Equities_Trading"]) {
            if (!db.indiaOps) db.indiaOps = {};
            db.indiaOps.shareMarket = XLSX.utils.sheet_to_json(wb.Sheets["Equities_Trading"]);
        }
        if (wb.Sheets["Miscellaneous_Ledger"]) {
            if (!db.indiaOps) db.indiaOps = {};
            db.indiaOps.othersEntries = XLSX.utils.sheet_to_json(wb.Sheets["Miscellaneous_Ledger"]);
        }
        if (wb.Sheets["Budget_QAR"]) {
            if (!db.budget) db.budget = {};
            db.budget.QAR = XLSX.utils.sheet_to_json(wb.Sheets["Budget_QAR"]);
        }
        if (wb.Sheets["Budget_INR"]) {
            if (!db.budget) db.budget = {};
            db.budget.INR = XLSX.utils.sheet_to_json(wb.Sheets["Budget_INR"]);
        }
        if (wb.Sheets["Daily_Expenses"]) db.dailyExpenses = XLSX.utils.sheet_to_json(wb.Sheets["Daily_Expenses"]);
        if (wb.Sheets["Milestones"]) db.goals = XLSX.utils.sheet_to_json(wb.Sheets["Milestones"]);

        saveDatabase();
        refreshAllViews();
        showToast('Database restored successfully from Excel');
    };
    reader.readAsArrayBuffer(file);
}

function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('hidden');
        el.classList.add('flex');
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('hidden');
        el.classList.remove('flex');
    }
}

let confirmCallback = null;

function requireConfirmation(msg, cb) {
    const msgEl = document.getElementById('confirmDeleteMessage') || document.getElementById('confirmationDialogMsg');
    if (msgEl) msgEl.innerText = msg;
    confirmCallback = cb;
    openModal('confirmDeleteModal');
}
window.requireConfirmation = requireConfirmation;

function executeConfirmDelete() {
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
    closeModal('confirmDeleteModal');
}
window.executeConfirmDelete = executeConfirmDelete;
window.executeConfirmedAction = executeConfirmDelete;

function closeConfirmDelete() {
    confirmCallback = null;
    closeModal('confirmDeleteModal');
}
window.closeConfirmDelete = closeConfirmDelete;

function confirmClearAllData(section = null) {
    // Determine active page target
    let targetPage = section;
    if (!targetPage || targetPage === 'auto') {
        if (typeof activePageId !== 'undefined' && activePageId) {
            targetPage = activePageId;
        } else if (typeof window.activePageId !== 'undefined' && window.activePageId) {
            targetPage = window.activePageId;
        } else {
            targetPage = 'assets';
        }
    }

    let targetTitle = '';
    let clearAction = null;

    if (targetPage === 'assets' || targetPage === 'portfolio') {
        targetTitle = 'Portfolio records (Bank accounts, Credit liabilities, Mutual funds & Asset Valuation logs)';
        clearAction = () => {
            db.bankAccounts = [];
            db.loans = [];
            db.assetMutualFunds = [];
            db.assetLogs = [];
            db.assetCards = [];
            showToast('Portfolio data cleared successfully');
        };
    } else if (targetPage === 'india-ops' || targetPage === 'equities') {
        targetTitle = 'Equities and Trading Desk entries';
        clearAction = () => {
            if (db.indiaOps) {
                db.indiaOps.shareMarket = [];
                db.indiaOps.ventures = [];
                db.indiaOps.othersEntries = [];
            }
            showToast('Equities data cleared successfully');
        };
    } else if (targetPage === 'budget' || targetPage === 'budgets') {
        targetTitle = 'Budget allocations and Daily Outflows';
        clearAction = () => {
            db.budget = { INR: [], QAR: [] };
            db.dailyExpenses = [];
            showToast('Budget data cleared successfully');
        };
    } else if (targetPage === 'goals' || targetPage === 'milestones') {
        targetTitle = 'Milestones and Goals';
        clearAction = () => {
            db.goals = [];
            showToast('Milestones cleared successfully');
        };
    } else if (targetPage === 'notes' || targetPage === 'journal') {
        targetTitle = 'Executive Notes and Journal entries';
        clearAction = () => {
            db.notes = [];
            showToast('Notes cleared successfully');
        };
    } else if (targetPage === 'reminders') {
        targetTitle = 'Reminders and Alerts';
        clearAction = () => {
            db.reminders = [];
            showToast('Reminders cleared successfully');
        };
    } else if (targetPage === 'all') {
        targetTitle = 'ALL application records across the entire dashboard';
        clearAction = () => {
            db.bankAccounts = [];
            db.loans = [];
            db.assetMutualFunds = [];
            db.assetLogs = [];
            db.assetCards = [];
            if (db.indiaOps) {
                db.indiaOps.shareMarket = [];
                db.indiaOps.ventures = [];
                db.indiaOps.othersEntries = [];
            }
            db.budget = { INR: [], QAR: [] };
            db.dailyExpenses = [];
            db.goals = [];
            db.notes = [];
            db.reminders = [];
            db.notifications = [];
            showToast('All dashboard data cleared');
        };
    } else {
        targetTitle = 'Portfolio records';
        clearAction = () => {
            db.bankAccounts = [];
            db.loans = [];
            db.assetMutualFunds = [];
            db.assetLogs = [];
            showToast('Portfolio data cleared successfully');
        };
    }

    requireConfirmation(`Are you sure you want to clear ${targetTitle}? This will only delete data for this page and keep the rest intact.`, () => {
        if (typeof clearAction === 'function') {
            clearAction();
        }
        saveDatabase();
        if (typeof refreshAllViews === 'function') {
            refreshAllViews();
        }
    });
}
window.confirmClearAllData = confirmClearAllData;
window.confirmClearPageData = confirmClearAllData;

function showToast(msg) {
    const toast = document.getElementById('appToast');
    const toastMsg = document.getElementById('appToastMsg');
    if (toast && toastMsg) {
        toastMsg.innerText = msg;
        toast.classList.remove('translate-y-24', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
        }, 3000);
    }
}

function openCloudSyncModal() {
    updateCloudModalUI();
    openModal('cloudSyncModal');
}

function updateCloudModalUI() {
    const emailDisp = document.getElementById('cloudUserEmailDisplay');
    const authBtn = document.getElementById('cloudAuthBtn');
    const syncTime = document.getElementById('lastCloudSyncTime');

    if (window.firebaseUser) {
        if (window.firebaseUser.isAnonymous) {
            if (emailDisp) emailDisp.innerHTML = '<span class="text-emerald-400 font-mono text-xs">● Connected (Worldwide Cloud Sync Active)</span>';
            if (authBtn) {
                authBtn.innerHTML = '<i class="fa-brands fa-google text-brand-500"></i> <span>Sign in with Google</span>';
                authBtn.className = 'px-4 py-2 bg-brand-600 hover:bg-brand-500 text-surface-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md';
            }
        } else {
            const email = window.firebaseUser.email || window.firebaseUser.displayName || 'Google Account';
            if (emailDisp) emailDisp.innerHTML = `<span class="text-emerald-400 font-mono text-xs">● Signed In:</span> <span class="text-white font-medium text-xs">${email}</span>`;
            if (authBtn) {
                authBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket text-rose-400"></i> <span>Sign Out</span>';
                authBtn.className = 'px-4 py-2 bg-surface-800 hover:bg-rose-900/40 text-rose-300 rounded-xl text-xs font-semibold border border-surface-700 transition-all flex items-center gap-2';
            }
        }
    } else {
        if (emailDisp) emailDisp.innerText = 'Connecting to Firebase...';
    }

    if (syncTime) {
        syncTime.innerText = 'Last sync: ' + new Date().toLocaleTimeString();
    }
}

async function handleCloudAuthClick() {
    if (window.firebaseUser && !window.firebaseUser.isAnonymous) {
        if (window.signOutGoogle) {
            await window.signOutGoogle();
            updateCloudModalUI();
        }
    } else {
        if (window.signInWithGoogle) {
            await window.signInWithGoogle();
            updateCloudModalUI();
            // Trigger automatic sync
            if (window.cloudSave) await window.cloudSave(db);
        }
    }
}

async function triggerManualPushToCloud() {
    if (window.cloudSave) {
        showToast("Uploading data to Firebase Cloud...");
        await window.cloudSave(db);
        updateCloudModalUI();
        showToast("All data pushed to Firebase Cloud successfully!");
    } else {
        showToast("Cloud connection initializing, please try again in a second.");
    }
}

async function triggerManualPullFromCloud() {
    if (window.cloudLoad) {
        showToast("Fetching master data from Firebase Cloud...");
        const cloudData = await window.cloudLoad();
        if (cloudData) {
            db = { ...db, ...cloudData };
            localStorage.setItem('riyas_executive_os_db_v2', JSON.stringify(db));
            refreshAllViews();
            updateCloudModalUI();
            showToast("Downloaded and updated with latest Firebase Cloud state!");
        } else {
            showToast("No remote state found. Uploading current state to Cloud.");
            if (window.cloudSave) await window.cloudSave(db);
        }
    } else {
        showToast("Cloud connection offline or not ready.");
    }
}

