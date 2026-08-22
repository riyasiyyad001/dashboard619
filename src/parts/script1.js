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
