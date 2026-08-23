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

// Global intelligent input listener across standard form text inputs
document.addEventListener('input', function(e) {
    const target = e.target;
    // Exclude contenteditable rich editors (e.g. msNoteEditor, noteEditor), password inputs, and elements marked no-auto-case
    if (!target || target.getAttribute('contenteditable') === 'true' || target.closest('[contenteditable="true"]') || target.classList.contains('no-auto-case') || target.classList.contains('note-rich-content')) {
        return;
    }

    if ((target.tagName === 'INPUT' && (target.type === 'text' || !target.type)) || target.tagName === 'TEXTAREA') {
        if (target.type === 'password') return;
        
        const start = target.selectionStart;
        const end = target.selectionEnd;
        
        const val = target.value;
        if (!val) return;
        
        // If user is currently typing in all caps, allow it
        if (val === val.toUpperCase() && /[A-Z]/.test(val) && val.length > 1) {
            return;
        }

        // Format with sentence/title capitalization (First letter capital, rest lowercase)
        const formatted = formatSentenceCapitalization(val);
        if (val !== formatted) {
            target.value = formatted;
            if (start !== null && end !== null) {
                target.setSelectionRange(start, end);
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
    renderHomeProfile();
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

function saveHomePrinciples() {
    const titleEl = document.getElementById('homePrinciplesTitle');
    const items = [];
    document.querySelectorAll('.home-principle-text').forEach(el => {
        const txt = el.innerText.trim();
        if (txt) items.push(txt);
    });

    if (!db.profile) db.profile = {};
    if (titleEl) db.profile.principlesTitle = titleEl.innerText.trim() || 'Determine to Overcome';
    if (items.length > 0) {
        db.profile.principles = items;
    }
    saveDatabase();
}

function renderHomeProfile() {
    if (!db.profile) return;
    const nameEl = document.getElementById('homeProfileName');
    const phoneEl = document.getElementById('homeProfilePhone');
    const photoEl = document.getElementById('profilePhotoImg');
    const titleEl = document.getElementById('homePrinciplesTitle');
    const listEl = document.getElementById('homePrinciplesList');

    if (nameEl && db.profile.name && document.activeElement !== nameEl) {
        nameEl.innerText = db.profile.name;
    }
    if (phoneEl && db.profile.phone && document.activeElement !== phoneEl) {
        phoneEl.innerText = db.profile.phone;
    }
    if (photoEl && db.profile.photo) {
        photoEl.src = db.profile.photo;
    }
    if (titleEl && db.profile.principlesTitle && document.activeElement !== titleEl) {
        titleEl.innerText = db.profile.principlesTitle;
    }

    if (listEl) {
        if (listEl.contains(document.activeElement)) {
            return;
        }

        const principles = Array.isArray(db.profile.principles) && db.profile.principles.length > 0
            ? db.profile.principles
            : [
                'Set a highest goal',
                'Make a plan',
                'Work harder & harder for it',
                'Evaluate the update daily',
                'Gradually will get the result'
            ];

        const diamondGradients = [
            'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]',
            'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.45)]',
            'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.45)]',
            'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.45)]',
            'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.45)]'
        ];

        listEl.innerHTML = principles.map((item, idx) => {
            const glow = diamondGradients[idx % diamondGradients.length];
            const safeText = String(item).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            return `
                <div class="home-principle-row flex items-center gap-2.5 py-1.5 px-2.5 rounded-xl hover:bg-surface-900/60 transition-all duration-200 group/item">
                    <span class="w-5 h-5 rounded-lg bg-surface-900/90 flex items-center justify-center shrink-0 shadow-sm">
                        <i class="fa-solid fa-gem ${glow} text-[10px]"></i>
                    </span>
                    <div class="home-principle-text flex-1 font-mono text-[12px] text-slate-200 leading-snug outline-none cursor-text hover:text-white transition-colors" contenteditable="true" onblur="saveHomePrinciples()" data-index="${idx}" title="Click to edit">${safeText}</div>
                    <button type="button" onclick="deleteHomePrinciple(${idx})" class="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1 text-[10px] cursor-pointer" title="Remove">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
}

function addHomePrinciple() {
    if (!db.profile) db.profile = {};
    if (!Array.isArray(db.profile.principles)) {
        db.profile.principles = [
            'Set a highest goal',
            'Make a plan',
            'Work harder & harder for it',
            'Evaluate the update daily',
            'Gradually will get the result'
        ];
    }
    db.profile.principles.push('New key milestone goal');
    saveDatabase();
    renderHomeProfile();

    setTimeout(() => {
        const texts = document.querySelectorAll('.home-principle-text');
        if (texts.length > 0) {
            const last = texts[texts.length - 1];
            last.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(last);
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }, 50);
}

// =========================================================================
// GLOBAL UNDO ENGINE & RESTORATION STACK
// =========================================================================
window.undoStack = [];

function recordDeletion(entry) {
    if (!entry) return;
    if (!window.undoStack) window.undoStack = [];
    window.undoStack.push({
        ...entry,
        timestamp: Date.now()
    });
    if (window.undoStack.length > 50) {
        window.undoStack.shift();
    }
    if (typeof updateUndoUI === 'function') updateUndoUI();
    if (typeof showUndoToast === 'function') {
        showUndoToast(entry.label || 'Item');
    } else if (typeof showToast === 'function') {
        showToast(`Deleted: ${entry.label || 'Item'}`);
    }
}
window.recordDeletion = recordDeletion;

function undoLastDelete() {
    if (!window.undoStack || window.undoStack.length === 0) {
        if (typeof showToast === 'function') showToast('No deleted items to restore');
        return;
    }
    const item = window.undoStack.pop();
    if (!item) return;

    let restored = false;
    try {
        switch (item.type) {
            case 'bank':
                if (!db.bankAccounts) db.bankAccounts = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.bankAccounts.length) {
                    db.bankAccounts.splice(item.originalIndex, 0, item.data);
                } else {
                    db.bankAccounts.push(item.data);
                }
                restored = true;
                break;
            case 'loan':
                if (!db.loans) db.loans = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.loans.length) {
                    db.loans.splice(item.originalIndex, 0, item.data);
                } else {
                    db.loans.push(item.data);
                }
                restored = true;
                break;
            case 'mutualFund':
                if (!db.assetMutualFunds) db.assetMutualFunds = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.assetMutualFunds.length) {
                    db.assetMutualFunds.splice(item.originalIndex, 0, item.data);
                } else {
                    db.assetMutualFunds.push(item.data);
                }
                restored = true;
                break;
            case 'assetLog':
                if (!db.assetLogs) db.assetLogs = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.assetLogs.length) {
                    db.assetLogs.splice(item.originalIndex, 0, item.data);
                } else {
                    db.assetLogs.push(item.data);
                }
                restored = true;
                break;
            case 'vaultFile':
                const storageType = item.meta && item.meta.storageType ? item.meta.storageType : (window.currentStorageType || 'banking');
                if (!db.vault) db.vault = { banking: [], legal: [], loans: [], personal: [] };
                if (!db.vault[storageType]) db.vault[storageType] = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.vault[storageType].length) {
                    db.vault[storageType].splice(item.originalIndex, 0, item.data);
                } else {
                    db.vault[storageType].push(item.data);
                }
                if (typeof renderStorageFileList === 'function') renderStorageFileList();
                restored = true;
                break;
            case 'equity':
                if (!db.indiaOps) db.indiaOps = {};
                if (!db.indiaOps.shareMarket) db.indiaOps.shareMarket = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.indiaOps.shareMarket.length) {
                    db.indiaOps.shareMarket.splice(item.originalIndex, 0, item.data);
                } else {
                    db.indiaOps.shareMarket.push(item.data);
                }
                restored = true;
                break;
            case 'others':
                if (!db.indiaOps) db.indiaOps = {};
                if (!db.indiaOps.othersEntries) db.indiaOps.othersEntries = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.indiaOps.othersEntries.length) {
                    db.indiaOps.othersEntries.splice(item.originalIndex, 0, item.data);
                } else {
                    db.indiaOps.othersEntries.push(item.data);
                }
                restored = true;
                break;
            case 'budget':
                const curr = item.meta && item.meta.currency ? item.meta.currency : 'QAR';
                if (!db.budget) db.budget = { QAR: [], INR: [] };
                if (!db.budget[curr]) db.budget[curr] = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.budget[curr].length) {
                    db.budget[curr].splice(item.originalIndex, 0, item.data);
                } else {
                    db.budget[curr].push(item.data);
                }
                restored = true;
                break;
            case 'expense':
                if (!db.dailyExpenses) db.dailyExpenses = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.dailyExpenses.length) {
                    db.dailyExpenses.splice(item.originalIndex, 0, item.data);
                } else {
                    db.dailyExpenses.push(item.data);
                }
                restored = true;
                break;
            case 'goal':
                if (!db.goals) db.goals = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.goals.length) {
                    db.goals.splice(item.originalIndex, 0, item.data);
                } else {
                    db.goals.push(item.data);
                }
                restored = true;
                break;
            case 'note':
                if (!db.notes) db.notes = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.notes.length) {
                    db.notes.splice(item.originalIndex, 0, item.data);
                } else {
                    db.notes.push(item.data);
                }
                restored = true;
                break;
            case 'reminder':
                if (!db.reminders) db.reminders = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.reminders.length) {
                    db.reminders.splice(item.originalIndex, 0, item.data);
                } else {
                    db.reminders.push(item.data);
                }
                restored = true;
                break;
            case 'homePrinciple':
                if (!db.profile) db.profile = {};
                if (!Array.isArray(db.profile.principles)) db.profile.principles = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.profile.principles.length) {
                    db.profile.principles.splice(item.originalIndex, 0, item.data);
                } else {
                    db.profile.principles.push(item.data);
                }
                restored = true;
                break;
            case 'bulk':
                if (item.data && typeof item.data === 'object') {
                    Object.keys(item.data).forEach(k => {
                        db[k] = JSON.parse(JSON.stringify(item.data[k]));
                    });
                    restored = true;
                }
                break;
            default:
                console.warn('Unknown restoration type:', item.type);
                break;
        }
    } catch (e) {
        console.error('Error during undo restore:', e);
    }

    if (restored) {
        if (typeof saveDatabase === 'function') saveDatabase();
        if (typeof refreshAllViews === 'function') refreshAllViews();
        if (typeof updateUndoUI === 'function') updateUndoUI();
        if (typeof showToast === 'function') {
            showToast(`↺ Restored: ${item.label || 'Deleted item'}`);
        }
    }
}
window.undoLastDelete = undoLastDelete;

function updateUndoUI() {
    const count = window.undoStack ? window.undoStack.length : 0;
    const lastItem = count > 0 ? window.undoStack[window.undoStack.length - 1] : null;
    
    document.querySelectorAll('.global-undo-btn').forEach(btn => {
        if (count > 0) {
            btn.classList.remove('opacity-40', 'cursor-not-allowed', 'pointer-events-none');
            btn.classList.add('opacity-100', 'cursor-pointer');
            btn.setAttribute('title', `Undo last delete: ${lastItem ? lastItem.label : ''} (Ctrl+Z)`);
        } else {
            btn.classList.add('opacity-40', 'cursor-not-allowed');
            btn.classList.remove('opacity-100');
            btn.setAttribute('title', 'Nothing to undo (Ctrl+Z)');
        }
    });

    document.querySelectorAll('.global-undo-badge').forEach(badge => {
        if (count > 0) {
            badge.innerText = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}
window.updateUndoUI = updateUndoUI;

// Global Ctrl+Z shortcut listener for undoing deletions
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        const isEditable = document.activeElement && (document.activeElement.isContentEditable || activeTag === 'input' || activeTag === 'textarea');
        if (!isEditable) {
            e.preventDefault();
            undoLastDelete();
        }
    }
});

function deleteHomePrinciple(index) {
    if (!db.profile || !Array.isArray(db.profile.principles)) return;
    const removedText = db.profile.principles[index];
    if (typeof recordDeletion === 'function' && removedText) {
        recordDeletion({
            type: 'homePrinciple',
            label: `Principle: "${removedText}"`,
            data: removedText,
            originalIndex: index
        });
    }
    db.profile.principles.splice(index, 1);
    if (db.profile.principles.length === 0) {
        db.profile.principles = ['Set a highest goal'];
    }
    saveDatabase();
    renderHomeProfile();
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

window.saveHomeProfile = saveHomeProfile;
window.saveHomeAddress = saveHomeAddress;
window.saveHomePrinciples = saveHomePrinciples;
window.addHomePrinciple = addHomePrinciple;
window.deleteHomePrinciple = deleteHomePrinciple;
window.renderHomeProfile = renderHomeProfile;
