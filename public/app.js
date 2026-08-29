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
    { id: 'goals', title: 'Milestones', icon: 'fa-bullseye', color: 'text-brand-500' },
    { id: 'documents', title: 'Documents', icon: 'fa-folder-open', color: 'text-emerald-400' },
    { id: 'reminders', title: 'Reminders', icon: 'fa-bell', color: 'text-indigo-400' },
    { id: 'favorites', title: 'Favorites', icon: 'fa-star', color: 'text-amber-400' },
    { id: 'notes', title: 'Notes', icon: 'fa-book-bookmark', color: 'text-amber-400' },
    { id: 'graphs', title: 'Intelligence', icon: 'fa-microchip', color: 'text-accent-plum' }
];

let db = {
    passcode: '1234',
    passcodeHint: 'Default PIN is 1234',
    profile: {
        name: 'RIYAS MADATHIL',
        contact1: '',
        contact2: '',
        whatsapp: '',
        gmail: '',
        facebook: '',
        instagram: '',
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

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

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
    if (!Array.isArray(data.qatarAssets)) data.qatarAssets = [];
    
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
    if (!Array.isArray(data.documents)) {
        data.documents = [
            {
                id: 'doc_seed_1',
                title: 'Passport - Republic of India',
                category: 'identity',
                fileType: 'pdf',
                mimeType: 'application/pdf',
                fileSize: 184320,
                date: '2026-08-20',
                tags: ['#Passport', '#Identity', '#Travel'],
                notes: 'Valid until 2032. Registered at Calicut Regional Passport Office.',
                isConfidential: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'doc_seed_2',
                title: 'Qatar Executive Residency Permit (QID)',
                category: 'identity',
                fileType: 'photo',
                mimeType: 'image/jpeg',
                fileData: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
                fileSize: 98304,
                date: '2026-08-15',
                tags: ['#QID', '#Doha', '#Residency'],
                notes: 'QID Residency permit documentation - Al Rayyan zone.',
                isConfidential: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'doc_seed_3',
                title: 'Villa 42 Property Deed & Registry Agreement',
                category: 'legal',
                fileType: 'pdf',
                mimeType: 'application/pdf',
                fileSize: 458752,
                date: '2026-08-10',
                tags: ['#Property', '#Deed', '#AlRayyan', '#RealEstate'],
                notes: 'Executive property title deed & registered agreement copy.',
                isConfidential: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'doc_seed_4',
                title: 'Annual Tax Audit & Returns Report FY25-26',
                category: 'financial',
                fileType: 'pdf',
                mimeType: 'application/pdf',
                fileSize: 327680,
                date: '2026-08-01',
                tags: ['#Tax', '#Audit', '#Compliance', '#CA'],
                notes: 'Certified CA tax computation & compliance acknowledgment.',
                isConfidential: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'doc_seed_5',
                title: 'Calicut Ancestral Land Deed & Survey Boundary Map',
                category: 'legal',
                fileType: 'photo',
                mimeType: 'image/jpeg',
                fileData: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
                fileSize: 614400,
                date: '2026-07-28',
                tags: ['#Land', '#Calicut', '#Survey', '#Madathil'],
                notes: 'Revenue survey boundary map & ownership registry documentation.',
                isConfidential: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'doc_seed_6',
                title: 'Executive Sanctuary & Villa Architectural Blueprint',
                category: 'personal',
                fileType: 'photo',
                mimeType: 'image/jpeg',
                fileData: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                fileSize: 524288,
                date: '2026-07-15',
                tags: ['#Sanctuary', '#Architecture', '#Retreat'],
                notes: 'Architectural blueprint & master site plan for the private sanctuary.',
                isConfidential: false,
                createdAt: new Date().toISOString()
            }
        ];
    }
    if (!Array.isArray(data.favorites)) {
        data.favorites = [
            {
                id: 'fav_seed_1',
                type: 'quote',
                title: 'Executive Creed',
                content: 'Set a highest goal, make a plan, work harder & harder for it, evaluate the update daily, and gradually will get the result.',
                author: 'Riyas Madathil',
                category: 'Determination',
                accentColor: 'rose',
                isPinned: true,
                createdAt: new Date().toISOString(),
                date: '2026-08-25',
                tags: ['#Creed', '#Determination', '#Execution']
            },
            {
                id: 'fav_seed_2',
                type: 'quote',
                title: 'Action & Momentum',
                content: 'The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks.',
                author: 'Mark Twain',
                category: 'Leadership',
                accentColor: 'gold',
                isPinned: true,
                createdAt: new Date().toISOString(),
                date: '2026-08-25',
                tags: ['#Leadership', '#Focus', '#Productivity']
            },
            {
                id: 'fav_seed_3',
                type: 'note',
                title: '3 Golden Rules of Wealth & Capital',
                content: '1. Never lose principal capital.\n2. Reinvest dividends and cashflow into appreciating assets.\n3. Keep 6 months of operational liquidity at all times.',
                author: 'Riyas M.',
                category: 'Wealth',
                accentColor: 'emerald',
                isPinned: false,
                createdAt: new Date().toISOString(),
                date: '2026-08-25',
                tags: ['#Wealth', '#Strategy', '#Discipline']
            },
            {
                id: 'fav_seed_4',
                type: 'photo',
                title: 'Executive Vision & Sanctuary',
                content: 'Serenity, focus and strategic clarity for long-term compounding.',
                photoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                category: 'Memories',
                accentColor: 'cyan',
                isPinned: false,
                createdAt: new Date().toISOString(),
                date: '2026-08-25',
                tags: ['#Sanctum', '#Vision', '#Retreat']
            },
            {
                id: 'fav_seed_5',
                type: 'quote',
                title: 'Resilience & Courage',
                content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
                author: 'Winston Churchill',
                category: 'Mindset',
                accentColor: 'indigo',
                isPinned: false,
                createdAt: new Date().toISOString(),
                date: '2026-08-25',
                tags: ['#Resilience', '#Courage']
            }
        ];
    }

    if (!data.profile || typeof data.profile !== 'object') {
        data.profile = {
            name: 'RIYAS MADATHIL',
            contact1: '',
            contact2: '',
            whatsapp: '',
            gmail: '',
            facebook: '',
            instagram: '',
            photo: 'https://placehold.co/150x150/0284c7/ffffff?text=RM',
            address: 'Madathil House, Calicut, Kerala, India - 673001 | Villa 42, Al Rayyan, Doha, Qatar'
        };
    }
    if (data.profile) {
        if (data.profile.contact1 === undefined) data.profile.contact1 = '';
        if (data.profile.contact2 === undefined) data.profile.contact2 = '';
        if (data.profile.whatsapp === undefined) data.profile.whatsapp = '';
        if (data.profile.gmail === undefined) data.profile.gmail = '';
        if (data.profile.facebook === undefined) data.profile.facebook = '';
        if (data.profile.instagram === undefined) data.profile.instagram = '';
        if (!data.profile.principlesTitle) data.profile.principlesTitle = 'Determine to Overcome';
        if (!Array.isArray(data.profile.principles)) {
            data.profile.principles = [
                'Set a highest goal',
                'Make a plan',
                'Work harder & harder for it',
                'Evaluate the update daily',
                'Gradually will get the result'
            ];
        }
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

async function saveDatabase(immediate = false) {
    const now = Date.now();
    db.lastUpdatedAt = now;
    sanitizeDatabase(db);

    // 1. Save to local cache for fast reload
    try {
        const localCopy = JSON.parse(JSON.stringify(db));
        localCopy.lastUpdatedAt = now;
        if (Array.isArray(localCopy.documents)) {
            for (let i = 0; i < localCopy.documents.length; i++) {
                const d = localCopy.documents[i];
                if (d.fileData && (d.fileData.startsWith('data:') || d.fileData.length > 2000)) {
                    if (window.vaultStorage) {
                        await window.vaultStorage.saveFile(d.id, d.fileData);
                    }
                    d.hasBinary = true;
                    delete d.fileData;
                }
            }
        }
        localStorage.setItem('riyas_executive_os_db_v2', JSON.stringify(localCopy));
        localStorage.setItem('riyas_executive_os_last_updated', String(now));
    } catch (err) {
        console.warn("Local storage cache warning:", err);
    }

    // 2. Persist full state to high-capacity IndexedDB
    if (window.vaultStorage && typeof window.vaultStorage.saveState === 'function') {
        try {
            await window.vaultStorage.saveState(db);
        } catch (idbErr) {
            console.warn("IndexedDB state save warning:", idbErr);
        }
    }

    // 3. Persist to Firebase Firestore Cloud database (debounced & deduplicated)
    if (window.cloudSave) {
        try {
            await window.cloudSave(db, immediate);
        } catch (e) {
            console.warn("Firebase cloudSave warning:", e);
        }
    }
}

async function loadDatabase() {
    // 1. Load from local cache immediately for instantaneous rendering
    const local = localStorage.getItem('riyas_executive_os_db_v2');
    let localTs = parseInt(localStorage.getItem('riyas_executive_os_last_updated') || '0', 10) || 0;
    
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
            if (localTs) db.lastUpdatedAt = localTs;
        } catch (e) {
            console.error("Error reading local db cache:", e);
        }
    }

    // 2. Load from IndexedDB to catch changes that exceeded localStorage size
    if (window.vaultStorage && typeof window.vaultStorage.getState === 'function') {
        try {
            const idbState = await window.vaultStorage.getState();
            if (idbState && typeof idbState === 'object') {
                const idbTs = idbState.lastUpdatedAt || 0;
                if (idbTs >= localTs) {
                    db = sanitizeDatabase({
                        ...db,
                        ...idbState,
                        indiaOps: { ...(db.indiaOps || {}), ...(idbState.indiaOps || {}) },
                        budget: { ...(db.budget || {}), ...(idbState.budget || {}) },
                        profile: { ...(db.profile || {}), ...(idbState.profile || {}) },
                        preferences: { ...(db.preferences || {}), ...(idbState.preferences || {}) }
                    });
                    if (idbTs) {
                        db.lastUpdatedAt = idbTs;
                        localTs = idbTs;
                    }
                }
            }
        } catch (idbReadErr) {
            console.warn("IndexedDB state read warning:", idbReadErr);
        }
    }

    sanitizeDatabase(db);

    // 3. Hydrate all document binaries from IndexedDB into memory before initial view render
    if (window.vaultStorage && Array.isArray(db.documents)) {
        try {
            await Promise.all(db.documents.map(async (doc) => {
                if (!doc.fileData) {
                    const storedBinary = await window.vaultStorage.getFile(doc.id);
                    if (storedBinary) {
                        doc.fileData = storedBinary;
                    }
                }
            }));
        } catch (hydErr) {
            console.warn("IndexedDB document hydration warning:", hydErr);
        }
    }
    
    // 4. Connect to Firebase and fetch the latest cloud document (respecting local freshness)
    if (window.initCloudStorage) {
        try {
            const ok = await window.initCloudStorage();
            if (ok && window.cloudLoad) {
                const remote = await window.cloudLoad();
                if (remote && typeof remote === 'object') {
                    const remoteTs = remote.lastUpdatedAt || 0;
                    const currentLocalTs = db.lastUpdatedAt || localTs || 0;

                    // Only adopt remote if it is strictly newer than our local state
                    if (remoteTs > currentLocalTs + 500) {
                        const inMemoryBinaries = new Map();
                        if (Array.isArray(db.documents)) {
                            db.documents.forEach(d => { if (d.fileData) inMemoryBinaries.set(d.id, d.fileData); });
                        }

                        db = sanitizeDatabase({
                            ...db,
                            ...remote,
                            indiaOps: { ...(db.indiaOps || {}), ...(remote.indiaOps || {}) },
                            budget: { ...(db.budget || {}), ...(remote.budget || {}) },
                            profile: { ...(db.profile || {}), ...(remote.profile || {}) },
                            preferences: { ...(db.preferences || {}), ...(remote.preferences || {}) }
                        });

                        // Reattach/hydrate binaries
                        if (Array.isArray(db.documents)) {
                            await Promise.all(db.documents.map(async (d) => {
                                if (inMemoryBinaries.has(d.id)) {
                                    d.fileData = inMemoryBinaries.get(d.id);
                                } else if (!d.fileData && window.vaultStorage) {
                                    const b = await window.vaultStorage.getFile(d.id);
                                    if (b) d.fileData = b;
                                }
                            }));
                        }

                        localStorage.setItem('riyas_executive_os_db_v2', JSON.stringify(db));
                        localStorage.setItem('riyas_executive_os_last_updated', String(remoteTs));
                        if (window.vaultStorage && typeof window.vaultStorage.saveState === 'function') {
                            await window.vaultStorage.saveState(db);
                        }
                        refreshAllViews();
                    } else if (currentLocalTs > remoteTs + 500 && !window.isFirestoreQuotaExceeded) {
                        // Local is newer than cloud; push up our fresh local data
                        if (window.cloudSave) {
                            await window.cloudSave(db, true);
                        }
                    }
                } else if (local && !window.isFirestoreQuotaExceeded) {
                    // Initial bootstrap: Upload local state to the cloud database if remote is empty
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
window.onRemoteStateUpdate = async function(remoteDb) {
    if (remoteDb && typeof remoteDb === 'object') {
        const remoteTs = remoteDb.lastUpdatedAt || 0;
        const currentLocalTs = db.lastUpdatedAt || parseInt(localStorage.getItem('riyas_executive_os_last_updated') || '0', 10) || 0;

        // If local state has newer modifications, do NOT overwrite with stale cloud snapshot!
        if (remoteTs <= currentLocalTs) {
            return;
        }

        const prevNotifIds = new Set((db.notifications || []).map(n => n.id));
        const remoteNotifs = Array.isArray(remoteDb.notifications) ? remoteDb.notifications : [];
        const hasNewUnreadFromRemote = remoteNotifs.some(n => !n.read && !prevNotifIds.has(n.id));

        const inMemoryBinaries = new Map();
        if (Array.isArray(db.documents)) {
            db.documents.forEach(d => { if (d.fileData) inMemoryBinaries.set(d.id, d.fileData); });
        }

        db = sanitizeDatabase({
            ...db,
            ...remoteDb,
            indiaOps: { ...(db.indiaOps || {}), ...(remoteDb.indiaOps || {}) },
            budget: { ...(db.budget || {}), ...(remoteDb.budget || {}) },
            profile: { ...(db.profile || {}), ...(remoteDb.profile || {}) },
            preferences: { ...(db.preferences || {}), ...(remoteDb.preferences || {}) }
        });

        // Hydrate binaries for updated documents
        if (Array.isArray(db.documents)) {
            await Promise.all(db.documents.map(async (d) => {
                if (inMemoryBinaries.has(d.id)) {
                    d.fileData = inMemoryBinaries.get(d.id);
                } else if (!d.fileData && window.vaultStorage) {
                    const b = await window.vaultStorage.getFile(d.id);
                    if (b) d.fileData = b;
                }
            }));
        }

        localStorage.setItem('riyas_executive_os_db_v2', JSON.stringify(db));
        localStorage.setItem('riyas_executive_os_last_updated', String(remoteTs));
        if (window.vaultStorage && typeof window.vaultStorage.saveState === 'function') {
            await window.vaultStorage.saveState(db);
        }
        refreshAllViews();

        if (hasNewUnreadFromRemote && typeof playNotificationSound === 'function') {
            playNotificationSound();
        }
    }
};

window.onload = async function() {
    await loadDatabase();
    
    // Unlock Web Audio context on user interactions
    const unlockAudio = () => {
        if (typeof getAudioContext === 'function') {
            const ctx = getAudioContext();
            if (ctx && ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
        }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

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
    if (typeof renderQatarAssetsTable === 'function') renderQatarAssetsTable();
    renderNetWorthAnalysis();
    renderIndiaOperations();
    renderBudgetsAndGoals();
    renderGoalsTable();
    renderNotesList();
    renderRemindersTable();
    renderNotifications();
    renderGrowthChart();
    if (typeof renderFinancialIntelligencePage === 'function') renderFinancialIntelligencePage();
    if (typeof renderFavoritesPage === 'function') renderFavoritesPage();
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
    window.currentEqActiveTab = tabKey;
    document.querySelectorAll('.eq-sub-view').forEach(v => v.classList.add('hidden'));
    
    if (['options', 'futures', 'mcx', 'equity'].includes(tabKey)) {
        const target = document.getElementById('eqSubView-trading');
        if (target) target.classList.remove('hidden');
        window.currentEqSegment = tabKey;
        if (typeof renderShareMarketTable === 'function') renderShareMarketTable();
    } else if (tabKey === 'others') {
        const target = document.getElementById('eqSubView-others');
        if (target) target.classList.remove('hidden');
        if (typeof renderOthersTable === 'function') renderOthersTable();
    } else if (tabKey === 'analysis') {
        const target = document.getElementById('eqSubView-analysis');
        if (target) target.classList.remove('hidden');
        if (typeof renderTradingAnalysis === 'function') renderTradingAnalysis();
    }

    const tabs = { 
        options: { id: 'btnEqSubOptions', icon: 'fa-bolt', label: 'Options' },
        futures: { id: 'btnEqSubFutures', icon: 'fa-arrow-trend-up', label: 'Futures' },
        mcx: { id: 'btnEqSubMcx', icon: 'fa-coins', label: 'MCX' },
        equity: { id: 'btnEqSubEquity', icon: 'fa-cubes', label: 'Equity' },
        others: { id: 'btnEqSubOthers', icon: 'fa-layer-group', label: 'Others' },
        analysis: { id: 'btnEqSubAnalysis', icon: 'fa-chart-pie', label: 'Analysis' }
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
        
        btn.className = `w-full px-5 py-4 rounded-2xl flex items-center gap-4 transition-all duration-300 text-sm tracking-[0.15em] uppercase group ${
            isActive 
            ? 'nav-tab-active' 
            : 'nav-tab-inactive'
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

    if (pageId === 'graphs') {
        if (typeof renderFinancialIntelligencePage === 'function') renderFinancialIntelligencePage();
    } else if (pageId === 'documents') {
        if (typeof renderDocumentsPage === 'function') renderDocumentsPage();
    } else if (pageId === 'favorites') {
        if (typeof renderFavoritesPage === 'function') renderFavoritesPage();
    } else if (pageId === 'assets') {
        if (typeof renderAssetLogsTable === 'function') renderAssetLogsTable();
        if (typeof renderBankAccountsTable === 'function') renderBankAccountsTable();
        if (typeof renderLoansTable === 'function') renderLoansTable();
        if (typeof renderAssetMutualFundsTable === 'function') renderAssetMutualFundsTable();
        if (typeof renderQatarAssetsTable === 'function') renderQatarAssetsTable();
        if (typeof renderNetWorthAnalysis === 'function') renderNetWorthAnalysis();
    } else if (pageId === 'india-ops') {
        if (typeof renderIndiaOperations === 'function') renderIndiaOperations();
    } else if (pageId === 'budget') {
        if (typeof renderBudgetsAndGoals === 'function') renderBudgetsAndGoals();
    } else if (pageId === 'goals') {
        if (typeof renderGoalsTable === 'function') renderGoalsTable();
    } else if (pageId === 'notes') {
        if (typeof renderNotesList === 'function') renderNotesList();
    } else if (pageId === 'reminders') {
        if (typeof renderRemindersTable === 'function') renderRemindersTable();
    } else if (pageId === 'home') {
        if (typeof renderHomeProfile === 'function') renderHomeProfile();
    }
}

function saveHomeProfile() {
    if (!db.profile) db.profile = {};
    const nameEl = document.getElementById('homeProfileName');
    const subtitleEl = document.getElementById('homeProfileSubtitle');
    const hqBadgeEl = document.getElementById('homeHeadquartersBadge');
    const protocolPillEl = document.getElementById('homeProtocolPillText');

    if (nameEl) db.profile.name = nameEl.innerText.trim();
    if (subtitleEl) db.profile.subtitle = subtitleEl.innerText.trim();
    if (hqBadgeEl) db.profile.headquartersBadge = hqBadgeEl.innerText.trim();
    if (protocolPillEl) db.profile.protocolPillText = protocolPillEl.innerText.trim();

    saveDatabase();
}

function saveHomeContacts() {
    if (!db.profile) db.profile = {};
    const c1El = document.getElementById('homeProfileContact1');
    const c2El = document.getElementById('homeProfileContact2');
    const waEl = document.getElementById('homeProfileWhatsapp');
    const gmEl = document.getElementById('homeProfileGmail');
    const fbEl = document.getElementById('homeProfileFacebook');
    const igEl = document.getElementById('homeProfileInstagram');

    if (c1El) db.profile.contact1 = c1El.innerText.trim();
    if (c2El) db.profile.contact2 = c2El.innerText.trim();
    if (waEl) db.profile.whatsapp = waEl.innerText.trim();
    if (gmEl) db.profile.gmail = gmEl.innerText.trim();
    if (fbEl) db.profile.facebook = fbEl.innerText.trim();
    if (igEl) db.profile.instagram = igEl.innerText.trim();

    updateContactLinks();
    saveDatabase();
}
window.saveHomeContacts = saveHomeContacts;

function updateContactLinks() {
    if (!db.profile) return;
    
    // Contact 1 link
    const c1Link = document.getElementById('homeProfileContact1Link');
    if (c1Link) {
        const val = (db.profile.contact1 || '').trim();
        if (val) {
            c1Link.href = val.startsWith('http') ? val : `tel:${val.replace(/[^0-9+]/g, '')}`;
            c1Link.classList.remove('hidden');
        } else {
            c1Link.classList.add('hidden');
        }
    }

    // Contact 2 link
    const c2Link = document.getElementById('homeProfileContact2Link');
    if (c2Link) {
        const val = (db.profile.contact2 || '').trim();
        if (val) {
            c2Link.href = val.startsWith('http') ? val : `tel:${val.replace(/[^0-9+]/g, '')}`;
            c2Link.classList.remove('hidden');
        } else {
            c2Link.classList.add('hidden');
        }
    }

    // WhatsApp link
    const waLink = document.getElementById('homeProfileWhatsappLink');
    if (waLink) {
        const val = (db.profile.whatsapp || '').trim();
        if (val) {
            waLink.href = val.startsWith('http') ? val : `https://wa.me/${val.replace(/[^0-9]/g, '')}`;
            waLink.classList.remove('hidden');
        } else {
            waLink.classList.add('hidden');
        }
    }

    // Gmail link
    const gmLink = document.getElementById('homeProfileGmailLink');
    if (gmLink) {
        const val = (db.profile.gmail || '').trim();
        if (val) {
            gmLink.href = val.startsWith('mailto:') || val.startsWith('http') ? val : `mailto:${val}`;
            gmLink.classList.remove('hidden');
        } else {
            gmLink.classList.add('hidden');
        }
    }

    // Facebook link
    const fbLink = document.getElementById('homeProfileFacebookLink');
    if (fbLink) {
        const val = (db.profile.facebook || '').trim();
        if (val) {
            fbLink.href = val.startsWith('http') ? val : (val.startsWith('facebook.com') ? `https://${val}` : `https://facebook.com/${val.replace(/^@/, '')}`);
            fbLink.classList.remove('hidden');
        } else {
            fbLink.classList.add('hidden');
        }
    }

    // Instagram link
    const igLink = document.getElementById('homeProfileInstagramLink');
    if (igLink) {
        const val = (db.profile.instagram || '').trim();
        if (val) {
            igLink.href = val.startsWith('http') ? val : (val.startsWith('instagram.com') ? `https://${val}` : `https://instagram.com/${val.replace(/^@/, '')}`);
            igLink.classList.remove('hidden');
        } else {
            igLink.classList.add('hidden');
        }
    }
}
window.updateContactLinks = updateContactLinks;

let isDeletingPrinciple = false;

function saveHomePrinciples() {
    if (isDeletingPrinciple) return;
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

function renderHomePhoto() {
    const photoContainer = document.getElementById('homeOvalBgPhoto');
    const glowContainer = document.getElementById('homeOvalSpreadGlow');
    const emptyState = document.getElementById('homeOvalEmptyState');
    const photoActions = document.getElementById('homeOvalPhotoActions');
    const photo = db.homePhoto || (db.profile && db.profile.coverPhoto) || (db.profile && db.profile.photo) || '';

    if (photo) {
        if (photoContainer) {
            photoContainer.style.backgroundImage = `url(${photo})`;
            photoContainer.classList.remove('hidden');
        }
        if (glowContainer) {
            glowContainer.style.backgroundImage = `url(${photo})`;
            glowContainer.classList.remove('hidden');
        }
        if (emptyState) emptyState.classList.add('hidden');
        if (photoActions) photoActions.classList.remove('hidden');
    } else {
        if (photoContainer) {
            photoContainer.style.backgroundImage = 'none';
            photoContainer.classList.add('hidden');
        }
        if (glowContainer) {
            glowContainer.style.backgroundImage = 'none';
            glowContainer.classList.add('hidden');
        }
        if (emptyState) emptyState.classList.remove('hidden');
        if (photoActions) photoActions.classList.add('hidden');
    }
}
window.renderHomePhoto = renderHomePhoto;

function triggerHomePhotoUpload() {
    const input = document.getElementById('homePhotoFileInput');
    if (input) input.click();
}
window.triggerHomePhotoUpload = triggerHomePhotoUpload;

function handleHomePhotoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast('Photo is too large! Please choose an image under 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const dataUrl = evt.target.result;
        db.homePhoto = dataUrl;
        if (!db.profile) db.profile = {};
        db.profile.coverPhoto = dataUrl;
        saveDatabase();
        renderHomePhoto();
        showToast('Home background photo updated successfully!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}
window.handleHomePhotoUpload = handleHomePhotoUpload;

function removeHomePhoto() {
    requireConfirmation('Remove home background photo?', () => {
        db.homePhoto = '';
        if (db.profile) db.profile.coverPhoto = '';
        saveDatabase();
        renderHomePhoto();
        showToast('Home background photo removed');
    });
}
window.removeHomePhoto = removeHomePhoto;

function previewHomePhotoFullscreen() {
    const photo = db.homePhoto || (db.profile && db.profile.coverPhoto) || (db.profile && db.profile.photo) || '';
    if (!photo) return;
    const previewBody = document.getElementById('previewModalBody');
    const previewTitle = document.getElementById('previewFileTitle');
    if (previewTitle) previewTitle.innerText = 'Home Background Photo';
    if (previewBody) {
        previewBody.innerHTML = `<img src="${photo}" class="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl border border-surface-700 object-contain mx-auto">`;
    }
    openModal('filePreviewModal');
}
window.previewHomePhotoFullscreen = previewHomePhotoFullscreen;

function renderHomeProfile() {
    if (!db.profile) db.profile = {};
    const nameEl = document.getElementById('homeProfileName');
    const subtitleEl = document.getElementById('homeProfileSubtitle');
    const hqBadgeEl = document.getElementById('homeHeadquartersBadge');
    const protocolPillEl = document.getElementById('homeProtocolPillText');
    const photoEl = document.getElementById('profilePhotoImg');
    const titleEl = document.getElementById('homePrinciplesTitle');
    const listEl = document.getElementById('homePrinciplesList');
    const c1El = document.getElementById('homeProfileContact1');
    const c2El = document.getElementById('homeProfileContact2');
    const waEl = document.getElementById('homeProfileWhatsapp');
    const gmEl = document.getElementById('homeProfileGmail');
    const fbEl = document.getElementById('homeProfileFacebook');
    const igEl = document.getElementById('homeProfileInstagram');

    if (nameEl && db.profile.name && document.activeElement !== nameEl) {
        nameEl.innerText = db.profile.name;
    }
    if (subtitleEl && db.profile.subtitle && document.activeElement !== subtitleEl) {
        subtitleEl.innerText = db.profile.subtitle;
    }
    if (hqBadgeEl && db.profile.headquartersBadge && document.activeElement !== hqBadgeEl) {
        hqBadgeEl.innerText = db.profile.headquartersBadge;
    }
    if (protocolPillEl && db.profile.protocolPillText && document.activeElement !== protocolPillEl) {
        protocolPillEl.innerText = db.profile.protocolPillText;
    }
    if (photoEl && db.profile.photo) {
        photoEl.src = db.profile.photo;
    }
    if (titleEl && db.profile.principlesTitle && document.activeElement !== titleEl) {
        titleEl.innerText = db.profile.principlesTitle;
    }

    if (c1El && document.activeElement !== c1El) {
        c1El.innerText = db.profile.contact1 || '';
    }
    if (c2El && document.activeElement !== c2El) {
        c2El.innerText = db.profile.contact2 || '';
    }
    if (waEl && document.activeElement !== waEl) {
        waEl.innerText = db.profile.whatsapp || '';
    }
    if (gmEl && document.activeElement !== gmEl) {
        gmEl.innerText = db.profile.gmail || '';
    }
    if (fbEl && document.activeElement !== fbEl) {
        fbEl.innerText = db.profile.facebook || '';
    }
    if (igEl && document.activeElement !== igEl) {
        igEl.innerText = db.profile.instagram || '';
    }

    updateContactLinks();
    renderHomePhoto();

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
            'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]',
            'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]',
            'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.7)]',
            'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.7)]',
            'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]'
        ];

        listEl.innerHTML = principles.map((item, idx) => {
            const dotGlow = diamondGradients[idx % diamondGradients.length];
            const safeText = String(item).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            return `
                <div class="home-principle-row flex items-center gap-2.5 py-1 px-1 hover:pl-2 transition-all duration-200 group/item relative">
                    <span class="w-1.5 h-1.5 rounded-full ${dotGlow} shrink-0"></span>
                    <div class="home-principle-text flex-1 font-['Outfit',sans-serif] text-[12px] font-normal text-slate-200/90 tracking-wide leading-tight outline-none cursor-text hover:text-white transition-colors" contenteditable="true" onblur="saveHomePrinciples()" data-index="${idx}" title="Click to edit">${safeText}</div>
                    <button type="button" onmousedown="deleteHomePrinciple(${idx}, event)" onclick="deleteHomePrinciple(${idx}, event)" class="opacity-0 group-hover/item:opacity-100 p-1 w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all text-[11px] cursor-pointer shrink-0" title="Delete principle">
                        <i class="fa-solid fa-trash-can pointer-events-none"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    if (typeof updateHomeLiquidityRadar === 'function') updateHomeLiquidityRadar();
    if (typeof calculateHomeFxQuick === 'function') calculateHomeFxQuick();
}

function updateHomeLiquidityRadar() {
    // 1. Calculate Bank liquid totals
    let liquidInr = 0;
    const rate = parseFloat(db.exchangeRate) || 22.85;
    
    if (Array.isArray(db.bankAccounts)) {
        db.bankAccounts.forEach(acc => {
            const bal = parseFloat(acc.balance) || 0;
            if (acc.currency === 'QAR') liquidInr += bal * rate;
            else liquidInr += bal;
        });
    }

    // 2. Calculate Total Assets & Loans
    let totalAssetsInr = 0;
    if (Array.isArray(db.assets)) {
        db.assets.forEach(a => {
            totalAssetsInr += parseFloat(a.currentValue || a.value) || 0;
        });
    }
    if (Array.isArray(db.equities)) {
        db.equities.forEach(eq => {
            const qty = parseFloat(eq.quantity) || 0;
            const cmp = parseFloat(eq.cmp || eq.avgPrice) || 0;
            totalAssetsInr += qty * cmp;
        });
    }
    if (Array.isArray(db.mutualFunds)) {
        db.mutualFunds.forEach(mf => {
            totalAssetsInr += parseFloat(mf.currentValue || mf.invested) || 0;
        });
    }
    totalAssetsInr += liquidInr;

    let totalLoansInr = 0;
    if (Array.isArray(db.loans)) {
        db.loans.forEach(l => {
            totalLoansInr += parseFloat(l.outstanding || l.amount) || 0;
        });
    }

    // Calculate Monthly Burn & Runway
    let monthlyBurn = 0;
    if (Array.isArray(db.dailyExpenses)) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        db.dailyExpenses.forEach(exp => {
            if (new Date(exp.date) >= thirtyDaysAgo) {
                monthlyBurn += parseFloat(exp.amount) || 0;
            }
        });
    }
    if (monthlyBurn <= 0) monthlyBurn = 75000; // Sensible executive baseline

    const runwayMonths = (liquidInr / monthlyBurn).toFixed(1);
    const runwayBarPct = Math.min(100, Math.max(10, Math.round((parseFloat(runwayMonths) / 24) * 100)));

    const reservesEl = document.getElementById('homeLiquidReservesText');
    const qarBadgeEl = document.getElementById('homeLiquidQarBadge');
    const runwayTextEl = document.getElementById('homeRunwayMonthsText');
    const runwayBarEl = document.getElementById('homeRunwayProgressBar');
    const assetsEl = document.getElementById('homeTotalAssetsText');
    const loansEl = document.getElementById('homeTotalLoansText');

    if (reservesEl) reservesEl.innerText = `₹${Math.round(liquidInr).toLocaleString('en-IN')}`;
    if (qarBadgeEl) qarBadgeEl.innerText = `${Math.round(liquidInr / rate).toLocaleString('en-US')} QAR`;
    if (runwayTextEl) runwayTextEl.innerText = parseFloat(runwayMonths) >= 24 ? '24+ Months' : `${runwayMonths} Months`;
    if (runwayBarEl) runwayBarEl.style.width = `${runwayBarPct}%`;
    if (assetsEl) assetsEl.innerText = `₹${Math.round(totalAssetsInr).toLocaleString('en-IN')}`;
    if (loansEl) loansEl.innerText = `₹${Math.round(totalLoansInr).toLocaleString('en-IN')}`;
}
window.updateHomeLiquidityRadar = updateHomeLiquidityRadar;

function calculateHomeFxQuick() {
    const qarInput = document.getElementById('homeFxQarInput');
    const inrResult = document.getElementById('homeFxInrResult');
    if (!qarInput || !inrResult) return;

    const qarVal = parseFloat(qarInput.value) || 0;
    const rate = parseFloat(db.exchangeRate) || 22.85;
    const inr = Math.round(qarVal * rate);
    inrResult.innerText = `₹${inr.toLocaleString('en-IN')}`;
}
window.calculateHomeFxQuick = calculateHomeFxQuick;

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
window.addHomePrinciple = addHomePrinciple;

function deleteHomePrinciple(index, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    isDeletingPrinciple = true;
    if (!db.profile) db.profile = {};
    if (!Array.isArray(db.profile.principles) || db.profile.principles.length === 0) {
        const currentElements = document.querySelectorAll('.home-principle-text');
        const items = [];
        currentElements.forEach(el => {
            const txt = el.innerText.trim();
            if (txt) items.push(txt);
        });
        db.profile.principles = items.length > 0 ? items : [
            'Set a highest goal',
            'Make a plan',
            'Work harder & harder for it',
            'Evaluate the update daily',
            'Gradually will get the result'
        ];
    }
    const idx = parseInt(index, 10);
    if (!isNaN(idx) && idx >= 0 && idx < db.profile.principles.length) {
        const deletedText = db.profile.principles[idx];
        if (typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'homePrinciple',
                originalIndex: idx,
                data: deletedText,
                label: `Principle: "${deletedText}"`
            });
        }
        db.profile.principles.splice(idx, 1);
        saveDatabase();
        renderHomeProfile();
    }
    setTimeout(() => {
        isDeletingPrinciple = false;
    }, 150);
}
window.deleteHomePrinciple = deleteHomePrinciple;

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
            case 'qatarAsset':
                if (!db.qatarAssets) db.qatarAssets = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.qatarAssets.length) {
                    db.qatarAssets.splice(item.originalIndex, 0, item.data);
                } else {
                    db.qatarAssets.push(item.data);
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
            case 'favorite':
                if (!db.favorites) db.favorites = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.favorites.length) {
                    db.favorites.splice(item.originalIndex, 0, item.data);
                } else {
                    db.favorites.push(item.data);
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
            btn.disabled = false;
            btn.classList.remove('cursor-not-allowed', 'pointer-events-none');
            btn.classList.add('cursor-pointer');
            btn.setAttribute('title', `Undo last delete: ${lastItem ? (lastItem.label || 'Item') : ''} (Ctrl+Z)`);
        } else {
            btn.disabled = true;
            btn.classList.add('cursor-not-allowed', 'pointer-events-none');
            btn.classList.remove('cursor-pointer');
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
        const item = db.vault[currentStorageType].find(x => x.id === id);
        const idx = db.vault[currentStorageType].findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'vaultFile',
                label: `Vault Document: ${item.name || 'File'}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx,
                meta: { storageType: currentStorageType }
            });
        }
        db.vault[currentStorageType] = db.vault[currentStorageType].filter(x => x.id !== id);
        saveDatabase();
        renderStorageFileList();
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
        india: { id: 'btnBudgetSubIndia', icon: 'fa-piggy-bank', label: 'India Budget (INR)' },
        analysis: { id: 'btnBudgetSubAnalysis', icon: 'fa-chart-pie', label: 'Analysis' }
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

    if (tabKey === 'analysis' && typeof renderBudgetAnalysis === 'function') {
        setTimeout(() => {
            renderBudgetAnalysis();
        }, 50);
    }
}

function switchAssetSubTab(tabKey) {
    document.querySelectorAll('.asset-sub-view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`assetSubView-${tabKey}`);
    if (target) target.classList.remove('hidden');

    const tabs = { 
        valuation: { id: 'btnAssetSubValuation', icon: 'fa-chart-line', label: 'Valuation Log' }, 
        mutualfunds: { id: 'btnAssetSubMutualFunds', icon: 'fa-seedling', label: 'Mutual Funds' },
        banking: { id: 'btnAssetSubBanking', icon: 'fa-building-columns', label: 'Banking' }, 
        qatarvaluation: { id: 'btnAssetSubQatarValuation', icon: 'fa-earth-asia', label: 'Qatar Valuation' },
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

    if(tabKey === 'qatarvaluation') {
        renderQatarAssetsTable();
    } else if(tabKey === 'analysis') {
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

    let qatarAssetsTotalRs = 0;
    let qatarAssetsTotalQr = 0;
    if (db.qatarAssets) {
        db.qatarAssets.forEach(qa => {
            let qr = parseFloat(qa.valueQr) || 0;
            let per = parseFloat(qa.perQr) || 23.5;
            let rs = parseFloat(qa.valueRs);
            if (isNaN(rs) || rs === 0) rs = qr * per;
            qatarAssetsTotalQr += qr;
            qatarAssetsTotalRs += rs;
        });
    }

    totalValueImpact += qatarAssetsTotalRs + mfAssets + bankAssets;

    // 1. Qatar Assets Valuation (Auto-Synced above Mutual Funds)
    const trQatar = document.createElement('tr');
    trQatar.className = 'group transition-colors';
    trQatar.innerHTML = `
        <td class="py-px px-1"><div class="px-3 py-2 border border-amber-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center h-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"><i class="fa-solid fa-bolt text-[10px] mr-1 text-amber-400"></i> Live</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-amber-500/25 rounded-xl font-semibold text-amber-400 flex items-center h-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"><i class="fa-solid fa-earth-asia w-5 mr-1"></i> Qatar Assets Valuation</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-amber-500/25 rounded-xl text-slate-300 flex items-center h-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors">Qatar Offshore Holdings</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-amber-500/25 rounded-xl flex items-center h-full bg-amber-500/5 group-hover:bg-amber-500/10 font-bold ${qatarAssetsTotalQr < 0 ? 'text-rose-400' : 'text-amber-400/80'} transition-colors">Auto-Synced (${qatarAssetsTotalQr < 0 ? '-' : ''}QR ${Math.abs(qatarAssetsTotalQr).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-amber-500/25 rounded-xl text-right font-bold font-mono ${qatarAssetsTotalRs < 0 ? 'text-rose-400' : 'text-amber-400'} flex items-center justify-end h-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors">${qatarAssetsTotalRs < 0 ? '-' : ''}₹${Math.abs(qatarAssetsTotalRs).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-amber-500/25 rounded-xl flex items-center justify-center h-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors">
            <button onclick="switchAssetSubTab('qatarvaluation')" class="text-amber-400 hover:text-amber-300 font-bold text-[10px] font-mono uppercase tracking-wider transition-colors underline decoration-amber-500/40 underline-offset-4 opacity-0 group-hover:opacity-100">View Data</button>
        </div></td>
    `;
    body.appendChild(trQatar);

    // 2. Mutual Funds Portfolio
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

    // 3. Consolidated Bank Balances
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
                <td colspan="4" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Total Value Impact (Incl. Qatar & Liquid):</td>
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
        if (!db.assetLogs) return;
        const item = db.assetLogs.find(x => x.id === id);
        const idx = db.assetLogs.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'assetLog',
                label: `Asset Log: ${item.assetName || 'Asset Activity'}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
        db.assetLogs = db.assetLogs.filter(x => x.id !== id);
        saveDatabase();
        renderAssetLogsTable();
        renderNetWorthAnalysis();
    });
}

// =========================================================================
// QATAR ASSET VALUATION ENGINE
// =========================================================================

function renderQatarAssetsTable() {
    const body = document.getElementById('qatarAssetsTableBody');
    if (!body) return;
    body.innerHTML = '';
    if (!Array.isArray(db.qatarAssets)) db.qatarAssets = [];

    let totalQr = 0;
    let totalInr = 0;

    const getQatarCategoryIcon = (cat) => {
        const c = (cat || '').toLowerCase();
        if (c.includes('real estate') || c.includes('property')) return 'fa-building text-brand-500';
        if (c.includes('commercial') || c.includes('business')) return 'fa-briefcase text-accent-cyan';
        if (c.includes('vehicle') || c.includes('transport')) return 'fa-car text-accent-blue';
        if (c.includes('deposit') || c.includes('cash')) return 'fa-money-bill-wave text-emerald-400';
        if (c.includes('equity') || c.includes('shares')) return 'fa-chart-line text-amber-400';
        if (c.includes('gold') || c.includes('valuable')) return 'fa-gem text-amber-400';
        return 'fa-earth-asia text-slate-400';
    };

    const sortedList = [...db.qatarAssets].sort((a, b) => {
        const dateA = a.date ? (a.date.includes('-') ? a.date : a.date.split('/').reverse().join('-')) : '';
        const dateB = b.date ? (b.date.includes('-') ? b.date : b.date.split('/').reverse().join('-')) : '';
        return new Date(dateB) - new Date(dateA); // Latest first
    });

    if (sortedList.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="8" class="py-12 text-center text-slate-500 font-mono text-xs">
                    <div class="flex flex-col items-center justify-center gap-2">
                        <i class="fa-solid fa-earth-asia text-2xl text-amber-500/40"></i>
                        <span>No Qatar asset records found. Click "Add Qatar Asset" to track offshore holdings.</span>
                    </div>
                </td>
            </tr>
        `;
    } else {
        sortedList.forEach((item, index) => {
            const qrVal = parseFloat(item.valueQr) || 0;
            const perQr = parseFloat(item.perQr) || 23.5;
            let inrVal = parseFloat(item.valueRs);
            if (isNaN(inrVal) || inrVal === 0) inrVal = qrVal * perQr;

            totalQr += qrVal;
            totalInr += inrVal;

            const iconClass = getQatarCategoryIcon(item.category);
            const isNegQr = qrVal < 0;
            const isNegInr = inrVal < 0;
            const formattedQr = (isNegQr ? '-' : '') + 'QR ' + Math.abs(qrVal).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const formattedInr = (isNegInr ? '-' : '') + '₹' + Math.abs(inrVal).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            const qrColorClass = isNegQr ? 'text-rose-400' : 'text-amber-400';
            const inrColorClass = isNegInr ? 'text-rose-400' : 'text-emerald-400';

            const tr = document.createElement('tr');
            tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
            tr.innerHTML = `
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${index + 1}</div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-300 flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formatToDDMMYYYY(item.date)}</div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl font-semibold flex flex-col justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                    <span class="flex items-center gap-2 text-white"><i class="fa-solid ${iconClass} w-4 text-xs"></i> ${item.assetIdentity || 'Qatar Asset'}</span>
                    ${item.remarks ? `<span class="text-[10px] font-mono text-slate-400 font-normal mt-0.5 truncate max-w-xs">${item.remarks}</span>` : ''}
                </div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors text-xs text-slate-300">${item.category || 'Asset'}</div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${qrColorClass} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formattedQr}</div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl text-right font-mono text-slate-400 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors text-xs">₹${perQr.toFixed(2)}</div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${inrColorClass} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formattedInr}</div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                    <div class="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                        <button onclick="openQatarAssetModal('${item.id}')" title="Edit" class="text-slate-400 hover:text-amber-400 transition-colors"><i class="fa-solid fa-pen text-xs"></i></button>
                        <button onclick="deleteQatarAsset('${item.id}')" title="Delete" class="text-slate-400 hover:text-rose-500 transition-colors"><i class="fa-solid fa-trash text-xs"></i></button>
                    </div>
                </div></td>
            `;
            body.appendChild(tr);
        });
    }

    // Update summary metrics
    const totalQrEl = document.getElementById('qatarAssetTotalQrVal');
    const totalInrEl = document.getElementById('qatarAssetTotalInrVal');
    const countEl = document.getElementById('qatarAssetCountVal');

    const totQrIsNeg = totalQr < 0;
    const totInrIsNeg = totalInr < 0;
    const totQrText = (totQrIsNeg ? '-' : '') + 'QR ' + Math.abs(totalQr).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const totInrText = (totInrIsNeg ? '-' : '') + '₹' + Math.abs(totalInr).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    if (totalQrEl) {
        totalQrEl.innerText = totQrText;
        totalQrEl.className = totQrIsNeg ? 'text-xl font-bold font-mono text-rose-400' : 'text-xl font-bold font-mono text-amber-400';
    }
    if (totalInrEl) {
        totalInrEl.innerText = totInrText;
        totalInrEl.className = totInrIsNeg ? 'text-xl font-bold font-mono text-rose-400' : 'text-xl font-bold font-mono text-emerald-400';
    }
    if (countEl) countEl.innerText = `${sortedList.length} ${sortedList.length === 1 ? 'Holding' : 'Holdings'}`;

    // Render footer totals
    const foot = document.getElementById('qatarAssetsTableFoot');
    if (foot) {
        const avgRate = totalQr !== 0 ? Math.abs(totalInr / totalQr).toFixed(2) : '23.50';
        foot.innerHTML = `
            <tr class="border-t border-surface-800 bg-surface-900/90 font-bold">
                <td colspan="4" class="py-3.5 px-4 text-right uppercase tracking-widest text-slate-400 text-[10px]">Total Qatar Portfolio Valuation:</td>
                <td class="py-3.5 px-4 text-right font-mono ${totQrIsNeg ? 'text-rose-400' : 'text-amber-400'} text-sm">${totQrText}</td>
                <td class="py-3.5 px-4 text-right font-mono text-slate-400 text-xs">Avg: ₹${avgRate}</td>
                <td class="py-3.5 px-4 text-right font-mono ${totInrIsNeg ? 'text-rose-400' : 'text-emerald-400'} text-sm">${totInrText}</td>
                <td></td>
            </tr>
        `;
    }
}

function openQatarAssetModal(id = null) {
    const idEl = document.getElementById('qatarAssetId');
    const titleEl = document.getElementById('qatarAssetModalTitle');
    const dateEl = document.getElementById('qatarAssetDateInput');
    const catEl = document.getElementById('qatarAssetCategoryInput');
    const nameEl = document.getElementById('qatarAssetNameInput');
    const valQrEl = document.getElementById('qatarAssetValueQrInput');
    const perQrEl = document.getElementById('qatarAssetPerQrInput');
    const valRsEl = document.getElementById('qatarAssetValueRsInput');
    const remEl = document.getElementById('qatarAssetRemarksInput');

    if (!idEl) return;

    if (id) {
        const item = (db.qatarAssets || []).find(x => x.id === id);
        if (item) {
            idEl.value = item.id;
            if (titleEl) titleEl.innerText = 'Edit Qatar Asset';
            if (dateEl) {
                let d = item.date;
                if (d && d.includes('/')) {
                    const parts = d.split('/');
                    if (parts.length === 3) d = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
                dateEl.value = d || new Date().toISOString().split('T')[0];
            }
            if (catEl) catEl.value = item.category || 'Real Estate';
            if (nameEl) nameEl.value = item.assetIdentity || '';
            if (valQrEl) valQrEl.value = item.valueQr !== undefined ? item.valueQr : '';
            if (perQrEl) perQrEl.value = item.perQr || '23.50';
            if (remEl) remEl.value = item.remarks || '';
            computeQatarModalInrValue();
        }
    } else {
        idEl.value = '';
        if (titleEl) titleEl.innerText = 'Add Qatar Asset';
        if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];
        if (catEl) catEl.value = 'Real Estate';
        if (nameEl) nameEl.value = '';
        if (valQrEl) valQrEl.value = '';
        if (perQrEl) perQrEl.value = '23.50';
        if (valRsEl) {
            valRsEl.value = '₹0.00';
            valRsEl.className = 'w-full p-3 rounded-xl border border-surface-700/80 bg-surface-950 text-emerald-400 font-mono text-xs font-bold cursor-not-allowed';
        }
        if (remEl) remEl.value = '';
    }

    openModal('qatarAssetModal');
}

function computeQatarModalInrValue() {
    const valQr = parseFloat(document.getElementById('qatarAssetValueQrInput')?.value) || 0;
    const perQr = parseFloat(document.getElementById('qatarAssetPerQrInput')?.value) || 0;
    const inr = valQr * perQr;
    const valRsEl = document.getElementById('qatarAssetValueRsInput');
    if (valRsEl) {
        const isNeg = inr < 0;
        valRsEl.value = `${isNeg ? '-' : ''}₹${Math.abs(inr).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        valRsEl.className = isNeg 
            ? 'w-full p-3 rounded-xl border border-rose-500/50 bg-surface-950 text-rose-400 font-mono text-xs font-bold cursor-not-allowed'
            : 'w-full p-3 rounded-xl border border-surface-700/80 bg-surface-950 text-emerald-400 font-mono text-xs font-bold cursor-not-allowed';
    }
}

function saveQatarAssetDetails() {
    const id = document.getElementById('qatarAssetId')?.value;
    const dateVal = document.getElementById('qatarAssetDateInput')?.value;
    const category = document.getElementById('qatarAssetCategoryInput')?.value || 'Real Estate';
    const assetIdentity = document.getElementById('qatarAssetNameInput')?.value?.trim();
    const valueQr = parseFloat(document.getElementById('qatarAssetValueQrInput')?.value);
    const perQr = parseFloat(document.getElementById('qatarAssetPerQrInput')?.value) || 23.50;
    const remarks = document.getElementById('qatarAssetRemarksInput')?.value?.trim() || '';

    if (!dateVal) {
        showToast('Please select an asset valuation date');
        return;
    }
    if (!assetIdentity) {
        showToast('Please enter an asset identity or name');
        return;
    }
    if (isNaN(valueQr)) {
        showToast('Please enter a valid Value in QR (positive or negative amount)');
        return;
    }

    const valueRs = valueQr * perQr;

    if (!Array.isArray(db.qatarAssets)) db.qatarAssets = [];

    if (id) {
        const item = db.qatarAssets.find(x => x.id === id);
        if (item) {
            item.date = dateVal;
            item.category = category;
            item.assetIdentity = assetIdentity;
            item.valueQr = valueQr;
            item.perQr = perQr;
            item.valueRs = valueRs;
            item.remarks = remarks;
        }
    } else {
        const newAsset = {
            id: 'qa_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
            date: dateVal,
            category,
            assetIdentity,
            valueQr,
            perQr,
            valueRs,
            remarks,
            createdAt: new Date().toISOString()
        };
        db.qatarAssets.push(newAsset);
    }

    saveDatabase();
    renderQatarAssetsTable();
    renderAssetLogsTable();
    renderNetWorthAnalysis();
    closeModal('qatarAssetModal');
    showToast('Qatar asset valuation saved successfully');
}

function deleteQatarAsset(id) {
    requireConfirmation('Delete this Qatar asset valuation record?', () => {
        if (!Array.isArray(db.qatarAssets)) return;
        const item = db.qatarAssets.find(x => x.id === id);
        const idx = db.qatarAssets.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'qatarAsset',
                label: `Qatar Asset: ${item.assetIdentity || 'Asset'} (QR ${item.valueQr})`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
        db.qatarAssets = db.qatarAssets.filter(x => x.id !== id);
        saveDatabase();
        renderQatarAssetsTable();
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

        const accNo = b.accountNumber || b.accountNo || b.accNo || '-';
        const rawType = b.type || 'Savings';
        let typeBadge = rawType;
        if (rawType.toUpperCase() === 'NRE') {
            typeBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">NRE</span>`;
        } else if (rawType.toUpperCase() === 'NRO') {
            typeBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">NRO</span>`;
        } else if (rawType.toLowerCase().includes('nre') && rawType.toLowerCase().includes('nro')) {
            typeBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">NRE/NRO</span>`;
        } else if (rawType === 'Savings') {
            typeBadge = `<span class="text-slate-300 font-medium">Savings</span>`;
        } else if (rawType === 'Checking') {
            typeBadge = `<span class="text-slate-300 font-medium">Checking</span>`;
        } else if (rawType === 'Deposit') {
            typeBadge = `<span class="text-slate-300 font-medium">Fixed Deposit</span>`;
        } else if (rawType === 'Salary') {
            typeBadge = `<span class="text-slate-300 font-medium">Salary</span>`;
        }

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-12">${idx + 1}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-semibold flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[220px] w-full">${b.bankName}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-300 flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[150px]">${accNo}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.accountName}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.branch}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${typeBadge}</div></td>
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
                <td colspan="7" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Total Balance:</td>
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
            if (document.getElementById('bankAccountNumberInput')) document.getElementById('bankAccountNumberInput').value = b.accountNumber || b.accountNo || b.accNo || '';
            if (document.getElementById('bankAccountNameInput')) document.getElementById('bankAccountNameInput').value = b.accountName || '';
            if (document.getElementById('bankBranchInput')) document.getElementById('bankBranchInput').value = b.branch || '';
            let valType = b.type || 'Savings';
            if (valType === 'NRE / NRO') valType = 'NRE';
            if (document.getElementById('bankTypeInput')) document.getElementById('bankTypeInput').value = valType;
            if (document.getElementById('bankIfscInput')) document.getElementById('bankIfscInput').value = b.ifsc || '';
            if (document.getElementById('bankCurrencyInput')) document.getElementById('bankCurrencyInput').value = b.currency || 'INR';
            if (document.getElementById('bankBalanceInput')) document.getElementById('bankBalanceInput').value = b.balance || '';
            if (document.getElementById('bankNotesInput')) document.getElementById('bankNotesInput').value = b.notes || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Bank Account';
        if (document.getElementById('bankNameInput')) document.getElementById('bankNameInput').value = '';
        if (document.getElementById('bankAccountNumberInput')) document.getElementById('bankAccountNumberInput').value = '';
        if (document.getElementById('bankAccountNameInput')) document.getElementById('bankAccountNameInput').value = (db.profile && db.profile.name) ? db.profile.name : '';
        if (document.getElementById('bankBranchInput')) document.getElementById('bankBranchInput').value = '';
        if (document.getElementById('bankTypeInput')) document.getElementById('bankTypeInput').value = 'Savings';
        if (document.getElementById('bankIfscInput')) document.getElementById('bankIfscInput').value = '';
        if (document.getElementById('bankCurrencyInput')) document.getElementById('bankCurrencyInput').value = 'INR';
        if (document.getElementById('bankBalanceInput')) document.getElementById('bankBalanceInput').value = '';
        if (document.getElementById('bankNotesInput')) document.getElementById('bankNotesInput').value = '';
    }
    openModal('bankModal');
}

function saveBankDetails() {
    const id = document.getElementById('bankId').value;
    const bankName = document.getElementById('bankNameInput').value || 'Bank';
    const accountNumber = document.getElementById('bankAccountNumberInput') ? document.getElementById('bankAccountNumberInput').value.trim() : '';
    const accountName = document.getElementById('bankAccountNameInput').value || 'Self';
    const branch = document.getElementById('bankBranchInput').value || 'Main';
    const type = document.getElementById('bankTypeInput').value;
    const ifsc = document.getElementById('bankIfscInput').value;
    const currency = document.getElementById('bankCurrencyInput').value;
    const balance = parseFloat(document.getElementById('bankBalanceInput').value) || 0;
    const notes = document.getElementById('bankNotesInput') ? document.getElementById('bankNotesInput').value.trim() : '';

    if (id) {
        const b = db.bankAccounts.find(x => x.id === id);
        if (b) { 
            b.bankName = bankName; 
            b.accountNumber = accountNumber;
            b.accountName = accountName; 
            b.branch = branch; 
            b.type = type; 
            b.ifsc = ifsc; 
            b.currency = currency; 
            b.balance = balance; 
            b.notes = notes;
        }
    } else {
        db.bankAccounts.push({ id: Date.now().toString(), bankName, accountNumber, accountName, branch, type, ifsc, currency, balance, notes });
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
        if (!db.bankAccounts) return;
        const item = db.bankAccounts.find(x => x.id === id);
        const idx = db.bankAccounts.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'bank',
                label: `Bank Account: ${item.bankName || ''} (${item.accountName || ''})`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
        db.bankAccounts = db.bankAccounts.filter(x => x.id !== id);
        saveDatabase();
        renderBankAccountsTable();
        renderAssetLogsTable();
        renderNetWorthAnalysis();
    });
}

function getLoanPriorityWeight(priority) {
    const p = (priority || 'Medium').toLowerCase().trim();
    if (p === 'critical' || p === 'urgent') return 4;
    if (p === 'high') return 3;
    if (p === 'medium' || p === 'normal') return 2;
    if (p === 'low') return 1;
    return 2;
}
window.getLoanPriorityWeight = getLoanPriorityWeight;

function getLoanPriorityBadge(priority) {
    const p = (priority || 'Medium').toLowerCase().trim();
    if (p === 'critical' || p === 'urgent') {
        return '<span class="w-6 h-6 rounded-md border border-rose-500/50 bg-rose-500/20 text-rose-400 inline-flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.25)] transition-transform cursor-pointer" title="Critical Priority (Click to cycle)"><i class="fa-solid fa-angles-up text-[10px]"></i></span>';
    }
    if (p === 'high') {
        return '<span class="w-6 h-6 rounded-md border border-amber-500/50 bg-amber-500/20 text-amber-400 inline-flex items-center justify-center transition-transform cursor-pointer" title="High Priority (Click to cycle)"><i class="fa-solid fa-angle-up text-[11px] font-bold"></i></span>';
    }
    if (p === 'low') {
        return '<span class="w-6 h-6 rounded-md border border-slate-700 bg-surface-900 text-slate-400 inline-flex items-center justify-center transition-transform cursor-pointer" title="Low Priority (Click to cycle)"><i class="fa-solid fa-angle-down text-[10px]"></i></span>';
    }
    return '<span class="w-6 h-6 rounded-md border border-brand-500/40 bg-brand-500/15 text-brand-400 inline-flex items-center justify-center transition-transform cursor-pointer" title="Medium Priority (Click to cycle)"><i class="fa-solid fa-minus text-[10px]"></i></span>';
}
window.getLoanPriorityBadge = getLoanPriorityBadge;

function cycleLoanPriority(loanId, e) {
    if (e) e.stopPropagation();
    if (!db.loans) return;
    const l = db.loans.find(x => x.id === loanId);
    if (!l) return;
    const current = (l.priority || 'Medium').toLowerCase().trim();
    let next = 'Medium';
    if (current === 'critical' || current === 'urgent') next = 'High';
    else if (current === 'high') next = 'Medium';
    else if (current === 'medium' || current === 'normal') next = 'Low';
    else if (current === 'low') next = 'Critical';
    l.priority = next;
    saveDatabase();
    renderLoansTable();
    showToast(`Priority set to ${next}`);
}
window.cycleLoanPriority = cycleLoanPriority;

function renderLoansTable() {
    const body = document.getElementById('loansTableBody');
    if(!body) return;
    body.innerHTML = '';
    let totalAmount = 0, totalRepaid = 0, totalOutstanding = 0;

    if (!Array.isArray(db.loans)) db.loans = [];

    // Priority-based sorting (Milestone style): Critical > High > Medium > Low, then by date
    const sortedLoans = [...db.loans].sort((a, b) => {
        const weightA = getLoanPriorityWeight(a.priority || 'Medium');
        const weightB = getLoanPriorityWeight(b.priority || 'Medium');
        if (weightB !== weightA) {
            return weightB - weightA;
        }
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
            <td class="py-px px-1"><div class="px-2 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-16" onclick="cycleLoanPriority('${l.id}', event)">${getLoanPriorityBadge(l.priority || 'Medium')}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full font-mono text-xs bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formatToDDMMYYYY(l.startDate)}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full font-mono text-xs bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${formatToDDMMYYYY(l.endDate)}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full font-medium bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[250px] w-full">${l.source}${l.notes ? `<span class="text-[10px] text-slate-500 font-light ml-2 truncate max-w-xs" title="${l.notes}">(${l.notes})</span>` : ''}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${l.type}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${amt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${rep.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold text-rose-400 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${outstanding.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                <div class="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    <button onclick="openLoanModal('${l.id}')" class="text-slate-500 hover:text-brand-500 cursor-pointer"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteLoanRow('${l.id}')" class="text-slate-500 hover:text-rose-500 cursor-pointer"><i class="fa-solid fa-trash"></i></button>
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
                <td colspan="6" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Total Liabilities:</td>
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
            if (document.getElementById('loanPriorityInput')) document.getElementById('loanPriorityInput').value = l.priority || 'Medium';
            if (document.getElementById('loanAmountInput')) document.getElementById('loanAmountInput').value = l.amount || '';
            if (document.getElementById('loanRepaidInput')) document.getElementById('loanRepaidInput').value = l.repaid || '0';
            if (document.getElementById('loanNotesInput')) document.getElementById('loanNotesInput').value = l.notes || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Credit Facility';
        const sInput = document.getElementById('loanStartDateInput');
        if (sInput && sInput._flatpickr) sInput._flatpickr.setDate(todayStr);
        const eInput = document.getElementById('loanEndDateInput');
        if (eInput && eInput._flatpickr) eInput._flatpickr.clear();
        if (document.getElementById('loanSourceInput')) document.getElementById('loanSourceInput').value = '';
        if (document.getElementById('loanTypeInput')) document.getElementById('loanTypeInput').value = 'Commercial';
        if (document.getElementById('loanPriorityInput')) document.getElementById('loanPriorityInput').value = 'Medium';
        if (document.getElementById('loanAmountInput')) document.getElementById('loanAmountInput').value = '';
        if (document.getElementById('loanRepaidInput')) document.getElementById('loanRepaidInput').value = '0';
        if (document.getElementById('loanNotesInput')) document.getElementById('loanNotesInput').value = '';
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
    const priority = document.getElementById('loanPriorityInput')?.value || 'Medium';
    const amount = parseFloat(document.getElementById('loanAmountInput').value) || 0;
    const repaid = parseFloat(document.getElementById('loanRepaidInput').value) || 0;
    const notes = document.getElementById('loanNotesInput')?.value?.trim() || '';

    if (id) {
        const l = db.loans.find(x => x.id === id);
        if (l) { 
            l.startDate = startDate; 
            l.endDate = endDate; 
            l.source = source; 
            l.type = type; 
            l.priority = priority; 
            l.amount = amount; 
            l.repaid = repaid; 
            l.notes = notes; 
        }
    } else {
        db.loans.push({ id: Date.now().toString(), startDate, endDate, source, type, priority, amount, repaid, notes });
    }

    saveDatabase();
    renderLoansTable();
    renderNetWorthAnalysis();
    closeModal('loanModal');
    showToast('Credit facility saved');
}

function deleteLoanRow(id) {
    requireConfirmation('Delete this credit facility?', () => {
        if (!db.loans) return;
        const item = db.loans.find(x => x.id === id);
        const idx = db.loans.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'loan',
                label: `Credit / Facility: ${item.source || item.bank || ''} - ${item.type || ''}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
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
        const item = db.assetMutualFunds.find(x => x.id === id);
        const idx = db.assetMutualFunds.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'mutualFund',
                label: `Mutual Fund: ${item.fundName || 'Mutual Fund'}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
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

    let qatarAssets = 0;
    if (db.qatarAssets) {
        db.qatarAssets.forEach(qa => {
            let qr = parseFloat(qa.valueQr) || 0;
            let per = parseFloat(qa.perQr) || QAR_TO_INR_RATE;
            let rs = parseFloat(qa.valueRs);
            if (isNaN(rs) || rs === 0) rs = qr * per;
            qatarAssets += rs;
        });
    }

    let physicalAssets = 0;
    if (db.assetLogs) {
        db.assetLogs.forEach(log => {
            physicalAssets += parseFloat(log.value) || 0;
        });
    }

    const totalAssets = bankAssets + mfAssets + qatarAssets + physicalAssets;

    let totalLiabilities = 0;
    if (db.loans) {
        db.loans.forEach(l => {
            let amt = parseFloat(l.amount) || 0;
            let rep = parseFloat(l.repaid) || 0;
            totalLiabilities += (amt - rep);
        });
    }

    const netWorth = totalAssets - totalLiabilities;

    const formatINR = (val) => (val < 0 ? '-' : '') + '₹' + Math.abs(val).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    const elTotalAssets = document.getElementById('nwTotalAssets');
    const elTotalLiab = document.getElementById('nwTotalLiabilities');
    const elTotalNW = document.getElementById('nwTotalNetWorth');
    if (elTotalAssets) elTotalAssets.innerText = formatINR(totalAssets);
    if (elTotalLiab) elTotalLiab.innerText = formatINR(totalLiabilities);
    if (elTotalNW) elTotalNW.innerText = formatINR(netWorth);

    const elRepBank = document.getElementById('repBankAssets');
    const elRepMf = document.getElementById('repMfAssets');
    const elRepQatar = document.getElementById('repQatarAssets');
    const elRepPhys = document.getElementById('repPhysicalAssets');
    const elRepLiab = document.getElementById('repLiabilities');
    const elRepNW = document.getElementById('repNetWorthFinal');

    if (elRepBank) elRepBank.innerText = formatINR(bankAssets);
    if (elRepQatar) elRepQatar.innerText = formatINR(qatarAssets);
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
                    labels: ['Banking & Liquid', 'Qatar Assets', 'Mutual Funds', 'Physical Assets'],
                    datasets: [{
                        data: [bankAssets, qatarAssets, mfAssets, physicalAssets],
                        backgroundColor: [
                            '#88A3D6',
                            '#f59e0b',
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
    if (typeof renderTradingAnalysis === 'function') {
        renderTradingAnalysis();
    }
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
        const item = db.indiaOps.othersEntries.find(x => x.id === id);
        const idx = db.indiaOps.othersEntries.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'others',
                label: `Ledger Entry: ${item.particulars || item.description || 'Miscellaneous Entry'}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
        db.indiaOps.othersEntries = db.indiaOps.othersEntries.filter(x => x.id !== id);
        saveDatabase();
        renderOthersTable();
    });
}

function formatTradeParticular(str) {
    if (!str) return '';
    const trimmed = str.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}
window.formatTradeParticular = formatTradeParticular;

function getTradeSegment(sm) {
    if (sm && sm.segment) return sm.segment.toLowerCase();
    const scrip = (sm && sm.script ? sm.script : '').toUpperCase();
    if (scrip.includes('CE') || scrip.includes('PE') || scrip.includes('CALL') || scrip.includes('PUT') || scrip.includes('OPTION') || scrip.includes('OPT')) {
        return 'options';
    }
    if (scrip.includes('FUT') || scrip.includes('FUTURE')) {
        return 'futures';
    }
    if (scrip.includes('CRUDE') || scrip.includes('GOLD') || scrip.includes('SILVER') || scrip.includes('NATGAS') || scrip.includes('NATURAL GAS') || scrip.includes('MCX') || scrip.includes('COPPER') || scrip.includes('ZINC') || scrip.includes('NICKEL') || scrip.includes('LEAD') || scrip.includes('ALUMINIUM') || scrip.includes('COTTON')) {
        return 'mcx';
    }
    return 'equity';
}
window.getTradeSegment = getTradeSegment;

const SEGMENT_CONFIG = {
    options: { title: 'Options Trading Log', icon: 'fa-bolt', color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/30' },
    futures: { title: 'Futures Trading Log', icon: 'fa-arrow-trend-up', color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', border: 'border-accent-cyan/30' },
    mcx: { title: 'MCX Commodity Trading Log', icon: 'fa-coins', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    equity: { title: 'Equity Stocks Trading Log', icon: 'fa-cubes', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
};

function renderShareMarketTable() {
    const body = document.getElementById('shareMarketTableBody');
    if (!body) return;
    body.innerHTML = '';
    let totalInvested = 0, totalPnl = 0;

    if (!db.indiaOps) db.indiaOps = {};
    if (!db.indiaOps.shareMarket) db.indiaOps.shareMarket = [];

    const activeSegment = window.currentEqSegment || 'options';
    const config = SEGMENT_CONFIG[activeSegment] || SEGMENT_CONFIG.options;

    // Update Header
    const titleTextEl = document.getElementById('tradingTableTitleText');
    const titleIconEl = document.getElementById('tradingTableIcon');
    if (titleTextEl) titleTextEl.innerText = config.title;
    if (titleIconEl) {
        titleIconEl.className = `fa-solid ${config.icon} ${config.color} text-sm`;
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Filter by segment first
    let segmentFiltered = db.indiaOps.shareMarket.filter(sm => getTradeSegment(sm) === activeSegment);

    // Apply Time Filters
    let filteredList = [...segmentFiltered];
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

    const countBadge = document.getElementById('tradingTableCountBadge');
    if (countBadge) {
        countBadge.innerText = `${sortedList.length} Trade${sortedList.length === 1 ? '' : 's'}`;
    }

    if (sortedList.length === 0) {
        const tr = document.createElement('tr');
        const filterStr = eqFilterMode === 'monthly' ? ` for ${eqFilterMonth} ${eqFilterYear}` : (eqFilterMode === 'yearly' ? ` for Year ${eqFilterYear}` : '');
        tr.innerHTML = `<td colspan="9" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid ${config.icon} text-2xl mb-2 block opacity-40"></i> No ${activeSegment.toUpperCase()} trades found${filterStr}. Click "+ Log Trade" above to add one.</td>`;
        body.appendChild(tr);
    }

    sortedList.forEach((sm, idx) => {
        const inv = parseFloat(sm.invested) || 0;
        const cur = parseFloat(sm.current) || 0;
        const pnl = cur - inv;
        const pnlPct = inv > 0 ? (pnl / inv) * 100 : 0;
        totalInvested += inv;
        totalPnl += pnl;

        const hasNotes = Boolean(sm.detailedNotes || sm.notes);

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/30 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-12">${idx + 1}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${sm.year || '2026'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors font-mono text-xs">${sm.month || 'February'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-full min-w-[250px]"><span class="font-bold text-accent-cyan tracking-wide">${formatTradeParticular(sm.script)}</span>${sm.notes ? `<span class="text-[10px] text-slate-500 font-light ml-2 truncate max-w-xs" title="${sm.notes}">(${sm.notes})</span>` : ''}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors font-medium text-slate-300">₹${inv.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${pnl>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${pnlPct>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-16">
                <button onclick="openTradeNotesModal('${sm.id}')" class="w-8 h-8 rounded-xl bg-surface-900/90 hover:bg-brand-500/20 border border-surface-700 hover:border-brand-500 text-slate-400 hover:text-brand-400 transition-all inline-flex items-center justify-center cursor-pointer shadow-sm group/note" title="Open Trade Notes & Documentation">
                    <i class="fa-regular fa-note-sticky text-xs group-hover/note:scale-110 transition-transform ${hasNotes ? 'text-brand-400 font-bold' : ''}"></i>
                </button>
            </div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-24">
                <div class="flex items-center justify-center gap-2 w-full">
                    <button onclick="openShareMarketModal('${sm.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition-colors flex items-center justify-center cursor-pointer" title="Edit Position"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteShareMarketRow('${sm.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer" title="Delete Position"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div></td>
        `;
        body.appendChild(tr);
    });

    const tradeCount = sortedList.length;
    const avgInvested = tradeCount > 0 ? (totalInvested / tradeCount) : 0;
    const profitPctOnAvg = avgInvested > 0 ? (totalPnl / avgInvested) * 100 : 0;

    // Mobile Cards View
    const mobileContainer = document.getElementById('shareMarketMobileCards');
    if (mobileContainer) {
        mobileContainer.innerHTML = '';
        if (tradeCount === 0) {
            mobileContainer.innerHTML = `<div class="p-6 text-center text-slate-500 text-xs font-light"><i class="fa-solid ${config.icon} text-2xl mb-2 block opacity-40"></i> No ${activeSegment.toUpperCase()} trades recorded. Click "+ Log Trade" to add one.</div>`;
        } else {
            sortedList.forEach(sm => {
                const inv = parseFloat(sm.invested) || 0;
                const cur = parseFloat(sm.current) || 0;
                const pnl = cur - inv;
                const pnlPct = inv > 0 ? (pnl / inv) * 100 : 0;
                const pnlColor = pnl >= 0 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10';
                const hasNotes = Boolean(sm.detailedNotes || sm.notes);
                
                const card = document.createElement('div');
                card.className = 'p-5 flex flex-col gap-3 hover:bg-surface-800/40 transition-colors';
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h5 class="font-bold text-white text-sm tracking-wide">${formatTradeParticular(sm.script)}</h5>
                            <span class="font-mono text-[10px] uppercase tracking-widest text-slate-500 px-2 py-0.5 rounded border border-surface-700 bg-surface-800">${sm.month || 'February'} ${sm.year || '2026'}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="openTradeNotesModal('${sm.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition-colors flex items-center justify-center cursor-pointer" title="Trade Notes"><i class="fa-regular fa-note-sticky text-xs ${hasNotes ? 'text-brand-400' : ''}"></i></button>
                            <button onclick="openShareMarketModal('${sm.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 transition-colors flex items-center justify-center cursor-pointer" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                            <button onclick="deleteShareMarketRow('${sm.id}')" class="w-7 h-7 rounded-lg bg-surface-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center cursor-pointer" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
                        </div>
                    </div>
                    ${sm.notes ? `<p class="text-xs text-slate-400 font-light italic border-l-2 border-surface-700 pl-2 py-0.5">${sm.notes}</p>` : ''}
                    <div class="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-surface-800/50">
                        <div class="flex flex-col">
                            <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Deployed Capital</span>
                            <span class="font-mono text-xs font-semibold text-slate-300">₹${inv.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div class="flex flex-col items-end text-right">
                            <span class="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">Realized P&L (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%)</span>
                            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded border ${pnlColor}">
                                ${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                            </span>
                        </div>
                    </div>
                `;
                mobileContainer.appendChild(card);
            });

            // Summary Card on Mobile
            const summaryCard = document.createElement('div');
            summaryCard.className = 'p-4 bg-surface-950/80 border-t-2 border-brand-500/30 flex flex-col gap-2.5';
            summaryCard.innerHTML = `
                <div class="grid grid-cols-3 gap-2 pt-1">
                    <div class="flex flex-col">
                        <span class="font-mono text-xs font-bold text-slate-200">₹${avgInvested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div class="flex flex-col items-center text-center">
                        <span class="font-mono text-xs font-bold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div class="flex flex-col items-end text-right">
                        <span class="font-mono text-xs font-bold ${profitPctOnAvg >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${profitPctOnAvg >= 0 ? '+' : ''}${profitPctOnAvg.toFixed(2)}%</span>
                    </div>
                </div>
            `;
            mobileContainer.appendChild(summaryCard);
        }
    }

    const foot = document.getElementById('shareMarketTableFoot');
    if (foot) {
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        foot.innerHTML = `
            <tr>
                <td colspan="4" class="py-4 pr-4 pl-4 border-none"></td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <div class="flex flex-col items-end">
                        <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-slate-500/30 text-sm sm:text-base font-mono tracking-wider font-bold text-slate-300">₹${avgInvested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <div class="flex flex-col items-end">
                        <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border ${totalPnl>=0?'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-emerald-400':'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400'} text-sm sm:text-base font-mono tracking-wider font-bold">${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <div class="flex flex-col items-end">
                        <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border ${profitPctOnAvg>=0?'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-emerald-400':'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400'} text-sm sm:text-base font-mono tracking-wider font-bold">${profitPctOnAvg >= 0 ? '+' : ''}${profitPctOnAvg.toFixed(2)}%</span>
                    </div>
                </td>
                <td class="border-none"></td>
                <td class="border-none"></td>
            </tr>
        `;
    }
}

function openShareMarketModal(id = null) {
    const idField = document.getElementById('shareTradeId');
    if (idField) idField.value = id || '';
    
    const activeSeg = window.currentEqSegment || 'options';
    const segInput = document.getElementById('shareSegmentInput');

    if (id) {
        const sm = db.indiaOps.shareMarket.find(x => x.id === id);
        if (sm) {
            const titleEl = document.getElementById('shareTradeModalTitle');
            if (titleEl) titleEl.innerText = 'Edit Trade Record';
            if (segInput) segInput.value = sm.segment || getTradeSegment(sm);
            if (document.getElementById('shareYearInput')) document.getElementById('shareYearInput').value = sm.year || '2026';
            if (document.getElementById('shareMonthInput')) document.getElementById('shareMonthInput').value = sm.month || 'February';
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
        const segName = activeSeg.charAt(0).toUpperCase() + activeSeg.slice(1);
        if (titleEl) titleEl.innerText = `Log ${segName} Trade`;
        if (segInput) segInput.value = activeSeg;
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
    const segment = (document.getElementById('shareSegmentInput') ? document.getElementById('shareSegmentInput').value : '') || (window.currentEqSegment || 'options');
    const year = document.getElementById('shareYearInput') ? document.getElementById('shareYearInput').value : (eqFilterYear || '2026');
    const month = document.getElementById('shareMonthInput') ? document.getElementById('shareMonthInput').value : (eqFilterMonth || 'February');
    const script = (document.getElementById('shareParticularsInput') ? document.getElementById('shareParticularsInput').value.trim() : '') || 'Trade Position';
    const invested = parseFloat(document.getElementById('shareCapitalInput') ? document.getElementById('shareCapitalInput').value : 0) || 0;
    const pnl = parseFloat(document.getElementById('sharePnlInput') ? document.getElementById('sharePnlInput').value : 0) || 0;
    const current = invested + pnl;
    const notes = document.getElementById('shareDescInput') ? document.getElementById('shareDescInput').value.trim() : '';

    if (!db.indiaOps) db.indiaOps = {};
    if (!db.indiaOps.shareMarket) db.indiaOps.shareMarket = [];

    if (id) {
        const sm = db.indiaOps.shareMarket.find(x => x.id === id);
        if (sm) {
            sm.segment = segment;
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
            segment,
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
    if (typeof renderTradingAnalysis === 'function') renderTradingAnalysis();
    closeModal('shareTradeModal');
    showToast('Trade record saved successfully');
}
window.saveShareMarketDetails = saveShareTrade;

function deleteShareMarketRow(id) {
    requireConfirmation('Delete this trading position?', () => {
        if (!db.indiaOps || !db.indiaOps.shareMarket) return;
        const item = db.indiaOps.shareMarket.find(x => x.id === id);
        const idx = db.indiaOps.shareMarket.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'equity',
                label: `Trade Position: ${item.script || item.scriptName || 'Trading Entry'}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
        db.indiaOps.shareMarket = db.indiaOps.shareMarket.filter(x => x.id !== id);
        saveDatabase();
        renderShareMarketTable();
        if (typeof renderTradingAnalysis === 'function') renderTradingAnalysis();
    });
}

/* ==========================================================================
   QUANTITATIVE TRADING ANALYSIS MODULE
   ========================================================================== */
window.tradingMonthlyChartInstance = null;
window.tradingSegmentChartInstance = null;

function renderTradingAnalysis() {
    if (!db.indiaOps || !db.indiaOps.shareMarket) {
        db.indiaOps = db.indiaOps || {};
        db.indiaOps.shareMarket = [];
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const allTrades = [...db.indiaOps.shareMarket];

    // Filter by time filters if active
    let filteredTrades = [...allTrades];
    let filterLabel = "All Time Quantitative Performance";
    if (eqFilterMode === 'monthly') {
        filteredTrades = filteredTrades.filter(t => t.year === eqFilterYear && t.month?.toLowerCase() === eqFilterMonth?.toLowerCase());
        filterLabel = `${eqFilterMonth} ${eqFilterYear} Period Analysis`;
    } else if (eqFilterMode === 'yearly') {
        filteredTrades = filteredTrades.filter(t => t.year === eqFilterYear);
        filterLabel = `Year ${eqFilterYear} Annual Analysis`;
    }

    const filterBadgeEl = document.getElementById('analysisFilterLabel');
    if (filterBadgeEl) filterBadgeEl.innerText = filterLabel;

    // KPI Metrics calculation
    let totalInvested = 0;
    let totalPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let beCount = 0;
    let grossWins = 0;
    let grossLosses = 0;
    let bestTradePnl = -Infinity;
    let bestTradeScript = 'None';

    filteredTrades.forEach(t => {
        const inv = parseFloat(t.invested) || 0;
        const cur = parseFloat(t.current) || 0;
        const pnl = cur - inv;
        totalInvested += inv;
        totalPnl += pnl;

        if (pnl > 0) {
            winCount++;
            grossWins += pnl;
            if (pnl > bestTradePnl) {
                bestTradePnl = pnl;
                bestTradeScript = formatTradeParticular(t.script);
            }
        } else if (pnl < 0) {
            lossCount++;
            grossLosses += Math.abs(pnl);
        } else {
            beCount++;
        }
    });

    const totalTrades = filteredTrades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    const avgCapital = totalTrades > 0 ? (totalInvested / totalTrades) : 0;
    const pnlRoi = avgCapital > 0 ? (totalPnl / avgCapital) * 100 : 0;
    const avgWin = winCount > 0 ? (grossWins / winCount) : 0;
    const avgLoss = lossCount > 0 ? (grossLosses / lossCount) : 0;
    const profitFactor = grossLosses > 0 ? (grossWins / grossLosses) : (grossWins > 0 ? 99.9 : 0);

    // Update KPI Stat Elements
    const netPnlEl = document.getElementById('anStatNetPnl');
    const pnlRoiEl = document.getElementById('anStatPnlRoi');
    if (netPnlEl) {
        netPnlEl.innerText = (totalPnl >= 0 ? '+' : '') + '₹' + totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        netPnlEl.className = `text-base sm:text-lg font-bold font-mono ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
    }
    if (pnlRoiEl) {
        pnlRoiEl.innerText = `${pnlRoi >= 0 ? '+' : ''}${pnlRoi.toFixed(2)}% on Avg Cap`;
    }

    const winRateEl = document.getElementById('anStatWinRate');
    const winCountEl = document.getElementById('anStatWinCount');
    if (winRateEl) {
        winRateEl.innerText = `${winRate.toFixed(1)}%`;
        winRateEl.className = `text-base sm:text-lg font-bold font-mono ${winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`;
    }
    if (winCountEl) {
        winCountEl.innerText = `${winCount}W • ${lossCount}L ${beCount > 0 ? `• ${beCount}BE` : ''}`;
    }

    const avgCapEl = document.getElementById('anStatAvgCap');
    const totalTradesEl = document.getElementById('anStatTotalTrades');
    if (avgCapEl) avgCapEl.innerText = `₹${avgCapital.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (totalTradesEl) totalTradesEl.innerText = `Across ${totalTrades} Trade${totalTrades === 1 ? '' : 's'}`;

    const pfEl = document.getElementById('anStatProfitFactor');
    const payoffEl = document.getElementById('anStatPayoffRatio');
    if (pfEl) {
        pfEl.innerText = grossLosses === 0 && grossWins > 0 ? 'Max (No Loss)' : `${profitFactor.toFixed(2)}x`;
        pfEl.className = `text-base sm:text-lg font-bold font-mono ${profitFactor >= 1.5 ? 'text-emerald-400' : (profitFactor >= 1 ? 'text-brand-400' : 'text-rose-400')}`;
    }
    if (payoffEl) {
        payoffEl.innerText = `Gross: +₹${Math.round(grossWins).toLocaleString('en-IN')} / -₹${Math.round(grossLosses).toLocaleString('en-IN')}`;
    }

    const avgWinLossEl = document.getElementById('anStatAvgWinLoss');
    const riskRewardEl = document.getElementById('anStatRiskReward');
    if (avgWinLossEl) {
        avgWinLossEl.innerText = `+₹${Math.round(avgWin).toLocaleString('en-IN')} / -₹${Math.round(avgLoss).toLocaleString('en-IN')}`;
    }
    if (riskRewardEl) {
        const rr = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) + ':1' : '-';
        riskRewardEl.innerText = `Win/Loss Ratio: ${rr}`;
    }

    const bestTradeEl = document.getElementById('anStatBestTrade');
    const bestTradeScriptEl = document.getElementById('anStatBestTradeScript');
    if (bestTradeEl) {
        bestTradeEl.innerText = bestTradePnl > -Infinity ? `+₹${bestTradePnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '₹0.00';
    }
    if (bestTradeScriptEl) {
        bestTradeScriptEl.innerText = bestTradeScript !== 'None' ? bestTradeScript : 'No winning trades yet';
    }

    // Chart 1: Monthly Realized P&L & Trajectory Curve
    renderMonthlyTrajectoryChart(allTrades);

    // Chart 2: Segment Attribution Donut Chart
    renderSegmentShareChart(filteredTrades);

    // Table 1: Segment Matrix
    renderSegmentPerformanceMatrix(filteredTrades);

    // Table 2: Chronological Monthly Matrix
    renderChronologicalMonthlyMatrix(allTrades);
}
window.renderTradingAnalysis = renderTradingAnalysis;

function renderMonthlyTrajectoryChart(tradesList) {
    const canvas = document.getElementById('tradingMonthlyPnlChartCanvas');
    if (!canvas) return;

    if (window.tradingMonthlyChartInstance) {
        window.tradingMonthlyChartInstance.destroy();
        window.tradingMonthlyChartInstance = null;
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyMap = {};

    tradesList.forEach(t => {
        const y = t.year || '2026';
        const m = t.month || 'February';
        const key = `${y}-${String(monthNames.indexOf(m) + 1).padStart(2, '0')}`;
        const label = `${m.slice(0, 3)} '${y.slice(2)}`;

        if (!monthlyMap[key]) {
            monthlyMap[key] = { label, year: y, month: m, pnl: 0, capital: 0, trades: 0 };
        }
        const inv = parseFloat(t.invested) || 0;
        const cur = parseFloat(t.current) || 0;
        monthlyMap[key].pnl += (cur - inv);
        monthlyMap[key].capital += inv;
        monthlyMap[key].trades += 1;
    });

    const sortedKeys = Object.keys(monthlyMap).sort();
    
    // If no trades, default to current months
    let labels = [];
    let pnlData = [];
    let barColors = [];
    let cumPnlData = [];
    let cumTotal = 0;

    if (sortedKeys.length === 0) {
        labels = ['Jan \'26', 'Feb \'26', 'Mar \'26'];
        pnlData = [0, 0, 0];
        barColors = ['rgba(0,255,157,0.3)', 'rgba(0,255,157,0.3)', 'rgba(0,255,157,0.3)'];
        cumPnlData = [0, 0, 0];
    } else {
        sortedKeys.forEach(k => {
            const item = monthlyMap[k];
            labels.push(item.label);
            pnlData.push(item.pnl);
            barColors.push(item.pnl >= 0 ? '#34D399' : '#F43F5E');
            cumTotal += item.pnl;
            cumPnlData.push(cumTotal);
        });
    }

    const ctx = canvas.getContext('2d');
    window.tradingMonthlyChartInstance = new Chart(ctx, {
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Cumulative P&L (Equity Curve)',
                    data: cumPnlData,
                    borderColor: '#C9A46B',
                    backgroundColor: 'rgba(201,164,107,0.08)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointBackgroundColor: '#C9A46B',
                    pointBorderColor: '#0A140F',
                    pointBorderWidth: 2,
                    yAxisID: 'y1',
                    order: 1
                },
                {
                    type: 'bar',
                    label: 'Net Monthly Realized P&L',
                    data: pnlData,
                    backgroundColor: barColors,
                    borderRadius: 6,
                    borderWidth: 0,
                    yAxisID: 'y',
                    order: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#94A3B8',
                        font: { family: 'JetBrains Mono', size: 10 },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 20, 15, 0.95)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#E2E8F0',
                    borderColor: 'rgba(201, 164, 107, 0.3)',
                    borderWidth: 1,
                    padding: 10,
                    titleFont: { family: 'Inter', size: 12, weight: 'bold' },
                    bodyFont: { family: 'JetBrains Mono', size: 11 },
                    callbacks: {
                        label: function(context) {
                            const val = context.raw || 0;
                            return `${context.dataset.label}: ₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(51, 65, 85, 0.25)' },
                    ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 10 } }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(51, 65, 85, 0.25)' },
                    ticks: {
                        color: '#64748B',
                        font: { family: 'JetBrains Mono', size: 10 },
                        callback: (v) => '₹' + (v >= 1000 || v <= -1000 ? (v / 1000).toFixed(0) + 'k' : v)
                    }
                },
                y1: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function renderSegmentShareChart(tradesList) {
    const canvas = document.getElementById('tradingSegmentShareChartCanvas');
    const legendEl = document.getElementById('tradingSegmentLegend');
    if (!canvas) return;

    if (window.tradingSegmentChartInstance) {
        window.tradingSegmentChartInstance.destroy();
        window.tradingSegmentChartInstance = null;
    }

    const segStats = {
        options: { label: 'Options', trades: 0, pnl: 0, capital: 0, color: '#C9A46B', icon: 'fa-bolt' },
        futures: { label: 'Futures', trades: 0, pnl: 0, capital: 0, color: '#00F0FF', icon: 'fa-arrow-trend-up' },
        mcx: { label: 'MCX', trades: 0, pnl: 0, capital: 0, color: '#FBBF24', icon: 'fa-coins' },
        equity: { label: 'Equity', trades: 0, pnl: 0, capital: 0, color: '#A855F7', icon: 'fa-cubes' }
    };

    tradesList.forEach(t => {
        const seg = getTradeSegment(t);
        const target = segStats[seg] || segStats.equity;
        const inv = parseFloat(t.invested) || 0;
        const cur = parseFloat(t.current) || 0;
        target.trades += 1;
        target.capital += inv;
        target.pnl += (cur - inv);
    });

    const segments = ['options', 'futures', 'mcx', 'equity'];
    const tradeCounts = segments.map(s => segStats[s].trades);
    const colors = segments.map(s => segStats[s].color);

    const hasData = tradeCounts.some(c => c > 0);
    const chartData = hasData ? tradeCounts : [1, 1, 1, 1];
    const chartColors = hasData ? colors : ['#334155', '#475569', '#64748B', '#1E293B'];

    const ctx = canvas.getContext('2d');
    window.tradingSegmentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: segments.map(s => segStats[s].label),
            datasets: [{
                data: chartData,
                backgroundColor: chartColors,
                borderColor: '#0A140F',
                borderWidth: 3,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 20, 15, 0.95)',
                    titleColor: '#FFFFFF',
                    bodyColor: '#E2E8F0',
                    borderColor: 'rgba(201, 164, 107, 0.3)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const segKey = segments[context.dataIndex];
                            const s = segStats[segKey];
                            return `${s.label}: ${s.trades} trades | Net: ${s.pnl >= 0 ? '+' : ''}₹${s.pnl.toLocaleString('en-IN')}`;
                        }
                    }
                }
            }
        }
    });

    // Populate Custom Segment Legend
    if (legendEl) {
        legendEl.innerHTML = '';
        segments.forEach(s => {
            const st = segStats[s];
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-2 rounded-lg bg-surface-900/60 border border-surface-800/80';
            item.innerHTML = `
                <div class="flex items-center gap-1.5 truncate">
                    <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${st.color}"></span>
                    <span class="text-slate-300 font-medium text-[10px]">${st.label}</span>
                </div>
                <div class="text-right">
                    <span class="font-bold font-mono text-[10px] ${st.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${st.pnl >= 0 ? '+' : ''}₹${Math.round(st.pnl).toLocaleString('en-IN')}</span>
                </div>
            `;
            legendEl.appendChild(item);
        });
    }
}

function renderSegmentPerformanceMatrix(tradesList) {
    const body = document.getElementById('tradingSegmentMatrixBody');
    if (!body) return;
    body.innerHTML = '';

    const segments = [
        { key: 'options', name: 'Options Trading', icon: 'fa-bolt', color: 'text-brand-400', badgeClass: 'bg-brand-500/10 text-brand-400 border-brand-500/20' },
        { key: 'futures', name: 'Futures Trading', icon: 'fa-arrow-trend-up', color: 'text-accent-cyan', badgeClass: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20' },
        { key: 'mcx', name: 'MCX Commodity', icon: 'fa-coins', color: 'text-amber-400', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
        { key: 'equity', name: 'Cash Equities', icon: 'fa-cubes', color: 'text-purple-400', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
    ];

    let totalAllTrades = 0, totalAllWins = 0, totalAllLosses = 0, totalAllCapital = 0, totalAllPnl = 0;

    segments.forEach(seg => {
        const segTrades = tradesList.filter(t => getTradeSegment(t) === seg.key);
        let segCap = 0, segPnl = 0, segWins = 0, segLosses = 0;

        segTrades.forEach(t => {
            const inv = parseFloat(t.invested) || 0;
            const cur = parseFloat(t.current) || 0;
            const pnl = cur - inv;
            segCap += inv;
            segPnl += pnl;
            if (pnl > 0) segWins++;
            else if (pnl < 0) segLosses++;
        });

        const count = segTrades.length;
        const winRate = count > 0 ? (segWins / count) * 100 : 0;
        const avgCap = count > 0 ? (segCap / count) : 0;
        const pnlPct = avgCap > 0 ? (segPnl / avgCap) * 100 : 0;

        totalAllTrades += count;
        totalAllWins += segWins;
        totalAllLosses += segLosses;
        totalAllCapital += segCap;
        totalAllPnl += segPnl;

        const statusBadge = count === 0 
            ? `<span class="px-2 py-0.5 rounded text-[9px] font-mono text-slate-500 bg-surface-900 border border-surface-800">No Trades</span>`
            : (segPnl >= 0 
                ? `<span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Profitable</span>`
                : `<span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">Drawdown</span>`);

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-surface-800/30 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-4 flex items-center gap-2.5">
                <div class="w-6 h-6 rounded-lg ${seg.badgeClass} flex items-center justify-center text-xs">
                    <i class="fa-solid ${seg.icon}"></i>
                </div>
                <span class="font-bold text-white tracking-wide">${seg.name}</span>
            </td>
            <td class="py-3 px-4 text-center font-mono text-xs text-slate-300">${count}</td>
            <td class="py-3 px-4 text-center font-mono text-xs text-slate-400">${segWins}W / ${segLosses}L</td>
            <td class="py-3 px-4 text-center font-mono text-xs ${winRate >= 50 ? 'text-emerald-400' : 'text-slate-300'} font-bold">${count > 0 ? winRate.toFixed(1) + '%' : '-'}</td>
            <td class="py-3 px-4 text-right font-mono text-xs text-slate-300">₹${avgCap.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4 text-right font-mono text-xs font-bold ${segPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${segPnl >= 0 ? '+' : ''}₹${segPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4 text-right font-mono text-xs font-bold ${pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${count > 0 ? (pnlPct >= 0 ? '+' : '') + pnlPct.toFixed(2) + '%' : '-'}</td>
            <td class="py-3 px-4 text-center">${statusBadge}</td>
        `;
        body.appendChild(tr);
    });

    // Summary Total Row
    const totalAvgCap = totalAllTrades > 0 ? (totalAllCapital / totalAllTrades) : 0;
    const totalAllWinRate = totalAllTrades > 0 ? (totalAllWins / totalAllTrades) * 100 : 0;
    const totalAllPct = totalAvgCap > 0 ? (totalAllPnl / totalAvgCap) * 100 : 0;

    const totalTr = document.createElement('tr');
    totalTr.className = 'bg-surface-900/90 font-mono text-xs border-t-2 border-brand-500/30 font-bold';
    totalTr.innerHTML = `
        <td class="py-3.5 px-4 text-brand-400 uppercase tracking-widest">Total Combined Portfolio</td>
        <td class="py-3.5 px-4 text-center text-white">${totalAllTrades}</td>
        <td class="py-3.5 px-4 text-center text-slate-300">${totalAllWins}W / ${totalAllLosses}L</td>
        <td class="py-3.5 px-4 text-center text-emerald-400">${totalAllTrades > 0 ? totalAllWinRate.toFixed(1) + '%' : '-'}</td>
        <td class="py-3.5 px-4 text-right text-slate-200">₹${totalAvgCap.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="py-3.5 px-4 text-right ${totalAllPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${totalAllPnl >= 0 ? '+' : ''}₹${totalAllPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td class="py-3.5 px-4 text-right ${totalAllPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${totalAllTrades > 0 ? (totalAllPct >= 0 ? '+' : '') + totalAllPct.toFixed(2) + '%' : '-'}</td>
        <td class="py-3.5 px-4 text-center"><span class="px-2 py-0.5 rounded text-[9px] bg-brand-500/10 text-brand-400 border border-brand-500/30">Aggregated</span></td>
    `;
    body.appendChild(totalTr);
}

function renderChronologicalMonthlyMatrix(tradesList) {
    const body = document.getElementById('tradingMonthlyMatrixBody');
    if (!body) return;
    body.innerHTML = '';

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthlyMap = {};

    tradesList.forEach(t => {
        const y = t.year || '2026';
        const m = t.month || 'February';
        const key = `${y}-${String(monthNames.indexOf(m) + 1).padStart(2, '0')}`;
        if (!monthlyMap[key]) {
            monthlyMap[key] = { year: y, month: m, trades: 0, wins: 0, capital: 0, pnl: 0 };
        }
        const inv = parseFloat(t.invested) || 0;
        const cur = parseFloat(t.current) || 0;
        const pnl = cur - inv;
        monthlyMap[key].trades += 1;
        monthlyMap[key].capital += inv;
        monthlyMap[key].pnl += pnl;
        if (pnl > 0) monthlyMap[key].wins += 1;
    });

    const sortedKeys = Object.keys(monthlyMap).sort().reverse(); // Newest first

    if (sortedKeys.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="p-6 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-calendar-days text-xl mb-1.5 block opacity-40"></i> No monthly trading history recorded yet.</td>`;
        body.appendChild(tr);
        return;
    }

    sortedKeys.forEach(k => {
        const item = monthlyMap[k];
        const winRate = item.trades > 0 ? (item.wins / item.trades) * 100 : 0;
        const avgCap = item.trades > 0 ? (item.capital / item.trades) : 0;
        const yieldPct = avgCap > 0 ? (item.pnl / avgCap) * 100 : 0;

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-surface-800/30 transition-colors';
        tr.innerHTML = `
            <td class="py-3 px-4 font-bold text-white font-mono text-xs">${item.month} ${item.year}</td>
            <td class="py-3 px-4 text-center font-mono text-xs text-slate-300">${item.trades}</td>
            <td class="py-3 px-4 text-center font-mono text-xs ${winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'} font-bold">${winRate.toFixed(1)}%</td>
            <td class="py-3 px-4 text-right font-mono text-xs text-slate-300">₹${avgCap.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4 text-right font-mono text-xs font-bold ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${item.pnl >= 0 ? '+' : ''}₹${item.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4 text-right font-mono text-xs font-bold ${yieldPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${yieldPct >= 0 ? '+' : ''}${yieldPct.toFixed(2)}%</td>
        `;
        body.appendChild(tr);
    });
}

// -------------------------------------------------------------
// EQUITIES TRADE NOTES & DATA DOCUMENTATION WORKSPACE
// -------------------------------------------------------------
function openTradeNotesModal(tradeId) {
    if (!db.indiaOps || !db.indiaOps.shareMarket) db.indiaOps = { shareMarket: [] };
    const sm = db.indiaOps.shareMarket.find(x => x.id === tradeId);
    if (!sm) return;

    // Set Hidden Trade ID
    const tradeIdEl = document.getElementById('tradeNoteTradeId');
    if (tradeIdEl) tradeIdEl.value = sm.id;

    // Set Scrip Title
    const titleEl = document.getElementById('tradeNoteTitle');
    if (titleEl) titleEl.innerText = `${sm.script || 'EQUITY TRADE'} - Trade Notes`;

    // Metrics & badges
    const inv = parseFloat(sm.invested) || 0;
    const cur = parseFloat(sm.current) || 0;
    const pnl = cur - inv;
    const pnlPct = inv > 0 ? (pnl / inv) * 100 : 0;

    const periodBadge = document.getElementById('tradeNotePeriodBadge');
    if (periodBadge) periodBadge.innerText = `${sm.month || 'February'} ${sm.year || '2026'}`;

    const capitalBadge = document.getElementById('tradeNoteCapitalBadge');
    if (capitalBadge) capitalBadge.innerText = `Cap: ₹${inv.toLocaleString('en-IN')}`;

    const pnlBadge = document.getElementById('tradeNotePnlBadge');
    if (pnlBadge) {
        pnlBadge.innerText = `${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString('en-IN')} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`;
        pnlBadge.className = `px-2.5 py-0.5 rounded-md font-bold text-[11px] ${pnl >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`;
    }

    // Populate Editor
    const editor = document.getElementById('tradeNoteEditor');
    if (editor) {
        editor.innerHTML = sm.detailedNotes || (sm.notes ? `<p>${sm.notes}</p>` : '');
    }

    // Set Font Size
    const fontSizeSelect = document.getElementById('tradeNoteFontSizeSelect');
    if (fontSizeSelect) {
        fontSizeSelect.value = sm.notesFontSize || '17px';
        applyTradeNoteFontSize(fontSizeSelect.value);
    }

    openModal('tradeNotesModal');

    // Auto-focus editor cleanly at the end
    setTimeout(() => {
        if (editor) {
            editor.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editor);
            range.collapse(false);
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }, 100);
}
window.openTradeNotesModal = openTradeNotesModal;

function saveTradeNotes() {
    const tradeIdEl = document.getElementById('tradeNoteTradeId');
    const tradeId = tradeIdEl ? tradeIdEl.value : null;
    if (!tradeId) return;

    if (!db.indiaOps || !db.indiaOps.shareMarket) return;
    const sm = db.indiaOps.shareMarket.find(x => x.id === tradeId);
    if (!sm) return;

    const editor = document.getElementById('tradeNoteEditor');
    const fontSizeSelect = document.getElementById('tradeNoteFontSizeSelect');

    const htmlContent = editor ? editor.innerHTML : '';
    const textContent = editor ? (editor.innerText || editor.textContent || '') : '';

    sm.detailedNotes = htmlContent;
    if (!sm.notes || sm.notes.trim() === '') {
        sm.notes = textContent.slice(0, 100).trim();
    }
    if (fontSizeSelect) sm.notesFontSize = fontSizeSelect.value;

    saveDatabase();
    renderShareMarketTable();
    showToast('Trade notes saved successfully');
    closeModal('tradeNotesModal');
}
window.saveTradeNotes = saveTradeNotes;

function formatTradeNoteText(cmd, value = null) {
    document.execCommand(cmd, false, value);
    const editor = document.getElementById('tradeNoteEditor');
    if (editor) editor.focus();
}
window.formatTradeNoteText = formatTradeNoteText;

function applyTradeNoteFontSize(sizeVal) {
    const editor = document.getElementById('tradeNoteEditor');
    if (!editor) return;
    editor.style.fontSize = sizeVal;
}
window.applyTradeNoteFontSize = applyTradeNoteFontSize;

function formatTradeNoteHighlight() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    document.execCommand('hiliteColor', false, 'rgba(245, 158, 11, 0.35)');
    const editor = document.getElementById('tradeNoteEditor');
    if (editor) editor.focus();
}
window.formatTradeNoteHighlight = formatTradeNoteHighlight;

function formatTradeNoteTextColor(colorHex) {
    document.execCommand('foreColor', false, colorHex);
    const editor = document.getElementById('tradeNoteEditor');
    if (editor) editor.focus();
}
window.formatTradeNoteTextColor = formatTradeNoteTextColor;

function formatTradeNoteCodeBlock() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selectedText = range.toString() || 'Strategy rule / indicator details here...';
    
    const codeElem = document.createElement('pre');
    codeElem.className = 'p-3 my-2 rounded-xl bg-surface-900 border border-surface-700/80 font-mono text-xs text-brand-400 overflow-x-auto';
    codeElem.innerText = selectedText;
    
    range.deleteContents();
    range.insertNode(codeElem);
}
window.formatTradeNoteCodeBlock = formatTradeNoteCodeBlock;

function insertTradeNoteChecklist() {
    const checkboxHtml = `<div class="flex items-center gap-2.5 my-1.5"><input type="checkbox" class="w-4 h-4 rounded border-surface-600 bg-surface-900 text-brand-500 focus:ring-brand-500 accent-amber-500 cursor-pointer"><span>Trade entry checklist item...</span></div><p></p>`;
    document.execCommand('insertHTML', false, checkboxHtml);
}
window.insertTradeNoteChecklist = insertTradeNoteChecklist;

function insertTradeNoteTimestamp() {
    const now = new Date();
    const formatted = `[${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}] `;
    document.execCommand('insertHTML', false, `<span class="font-mono text-xs text-amber-400 font-semibold">${formatted}</span>`);
}
window.insertTradeNoteTimestamp = insertTradeNoteTimestamp;

function copyTradeNotesToClipboard() {
    const editor = document.getElementById('tradeNoteEditor');
    const text = editor ? (editor.innerText || editor.textContent || '') : '';
    if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Trade notes copied to clipboard');
        }).catch(() => {
            showToast('Could not copy notes');
        });
    } else {
        showToast('No notes content to copy');
    }
}
window.copyTradeNotesToClipboard = copyTradeNotesToClipboard;

function printTradeNotes() {
    const title = document.getElementById('tradeNoteTitle')?.innerText || 'Trade Notes';
    const content = document.getElementById('tradeNoteEditor')?.innerHTML || '';
    const win = window.open('', '_blank');
    if (!win) {
        showToast('Popup blocked by browser. Please allow popups.');
        return;
    }
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
                h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { font-size: 18px; margin-top: 20px; }
                pre { background: #f4f4f4; padding: 12px; border-radius: 8px; font-family: monospace; }
                ul, ol { padding-left: 24px; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div>${content}</div>
            <script>window.print();<\/script>
        </body>
        </html>
    `);
    win.document.close();
}
window.printTradeNotes = printTradeNotes;

function toggleTradeNotesFullscreen() {
    const card = document.getElementById('tradeNotesCard');
    const icon = document.getElementById('iconTradeNotesExpand');
    if (!card) return;

    if (card.classList.contains('max-w-6xl')) {
        card.classList.remove('max-w-6xl', 'h-[96vh]');
        card.classList.add('w-full', 'h-full', 'rounded-none', 'max-w-none');
        if (icon) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        }
    } else {
        card.classList.add('max-w-6xl', 'h-[96vh]');
        card.classList.remove('w-full', 'h-full', 'rounded-none', 'max-w-none');
        if (icon) {
            icon.classList.add('fa-expand');
            icon.classList.remove('fa-compress');
        }
    }
}
window.toggleTradeNotesFullscreen = toggleTradeNotesFullscreen;

/* ==========================================================================
   FAVORITES MODULE (PHOTOS & QUOTES)
   ========================================================================== */

let favCurrentFilter = 'photo'; // Default to 'photo' (All is removed)
let favViewMode = 'grid'; // 'grid' (compact icons) or 'list'

function setFavoriteFilter(filter) {
    favCurrentFilter = (filter === 'quote') ? 'quote' : 'photo';
    
    // Update Filter Buttons styling (photo, quote)
    const filters = ['photo', 'quote'];
    filters.forEach(f => {
        const btn = document.getElementById(`btnFavFilter-${f}`);
        if (!btn) return;
        if (f === favCurrentFilter) {
            const activeColors = {
                photo: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                quote: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            };
            btn.className = `px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium ${activeColors[f]} border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm`;
        } else {
            btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer border border-transparent flex items-center gap-1.5 shrink-0';
        }
    });

    renderFavoritesPage();
}
window.setFavoriteFilter = setFavoriteFilter;

function setFavoriteViewMode(mode) {
    favViewMode = mode;
    const btnGrid = document.getElementById('btnFavViewGrid');
    const btnList = document.getElementById('btnFavViewList');

    if (btnGrid && btnList) {
        if (mode === 'grid') {
            btnGrid.className = 'px-2.5 py-1 rounded-lg text-xs font-mono transition-all bg-surface-800 text-cyan-300 shadow-sm cursor-pointer flex items-center gap-1';
            btnList.className = 'px-2.5 py-1 rounded-lg text-xs font-mono transition-all text-slate-400 hover:text-white cursor-pointer flex items-center gap-1';
        } else {
            btnGrid.className = 'px-2.5 py-1 rounded-lg text-xs font-mono transition-all text-slate-400 hover:text-white cursor-pointer flex items-center gap-1';
            btnList.className = 'px-2.5 py-1 rounded-lg text-xs font-mono transition-all bg-surface-800 text-cyan-300 shadow-sm cursor-pointer flex items-center gap-1';
        }
    }

    renderFavoritesPage();
}
window.setFavoriteViewMode = setFavoriteViewMode;

function clearFavoriteSearch() {
    const searchInput = document.getElementById('favSearchInput');
    if (searchInput) searchInput.value = '';
    renderFavoritesPage();
}
window.clearFavoriteSearch = clearFavoriteSearch;

function renderFavoritesPage() {
    if (!db.favorites) db.favorites = [];

    const quoteCount = db.favorites.filter(x => x.type === 'quote').length;
    const photoCount = db.favorites.filter(x => x.type === 'photo').length;

    // Update Filter Tab Pill Counts
    const cntPhoto = document.getElementById('cntFavFilterPhoto');
    const cntQuote = document.getElementById('cntFavFilterQuote');

    if (cntPhoto) cntPhoto.innerText = photoCount;
    if (cntQuote) cntQuote.innerText = quoteCount;

    // Search query
    const searchInput = document.getElementById('favSearchInput');
    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // Filter Items by active category
    let items = db.favorites.filter(item => {
        if (favCurrentFilter === 'quote' && item.type !== 'quote') return false;
        if (favCurrentFilter === 'photo' && item.type !== 'photo') return false;

        if (searchQuery) {
            const titleMatch = (item.title || '').toLowerCase().includes(searchQuery);
            const contentMatch = (item.content || '').toLowerCase().includes(searchQuery);
            const authorMatch = (item.author || '').toLowerCase().includes(searchQuery);
            if (!titleMatch && !contentMatch && !authorMatch) {
                return false;
            }
        }

        return true;
    });

    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    const container = document.getElementById('favoritesContainer');
    if (!container) return;

    // Update container layout class for grid (compact icons) vs list
    if (favViewMode === 'grid') {
        container.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4';
    } else {
        container.className = 'flex flex-col space-y-2.5';
    }

    if (items.length === 0) {
        container.className = 'w-full';
        const typeLabels = { photo: 'photos', quote: 'quotes' };
        const typeBtnLabels = { photo: 'Photo', quote: 'Quote' };
        container.innerHTML = `
            <div class="py-14 px-4 text-center bg-surface-900/30 border border-surface-800/80 rounded-3xl w-full">
                <div class="w-12 h-12 rounded-2xl bg-surface-800 border border-surface-700 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <i class="fa-solid fa-folder-open text-lg"></i>
                </div>
                <h4 class="text-white font-display text-base font-bold">No ${typeLabels[favCurrentFilter] || 'items'} found</h4>
                <p class="text-slate-400 font-mono text-xs max-w-sm mx-auto mt-1 mb-5">
                    ${searchQuery ? 'No items match your search keyword.' : `Add your favorite ${typeLabels[favCurrentFilter] || 'items'} to access them quickly.`}
                </p>
                <div class="flex items-center justify-center">
                    <button onclick="openFavoriteModal(null, favCurrentFilter)" class="px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-amber-500/20 hover:bg-surface-700 border border-brand-500/40 text-brand-300 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95">
                        <i class="fa-solid fa-plus text-xs"></i> Add ${typeBtnLabels[favCurrentFilter] || 'Favorite'}
                    </button>
                </div>
            </div>
        `;
        return;
    }

    if (favViewMode === 'grid') {
        container.innerHTML = items.map(item => renderFavoriteCompactCard(item)).join('');
    } else {
        container.innerHTML = items.map(item => renderFavoriteListRow(item)).join('');
    }
}
window.renderFavoritesPage = renderFavoritesPage;

// COMPACT ICON / GRID CARD (Small Icons / Tiles)
function renderFavoriteCompactCard(item) {
    const dateFormatted = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '');

    if (item.type === 'photo') {
        const photoSrc = item.photoUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
        return `
            <div class="group relative rounded-2xl border border-surface-800 hover:border-cyan-500/60 bg-surface-900/80 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer" onclick="openFavoritePhotoLightbox('${item.id}')">
                <!-- Compact Image Thumbnail -->
                <div class="relative aspect-square w-full overflow-hidden bg-surface-950">
                    <img src="${escapeHtml(photoSrc)}" alt="${escapeHtml(item.title || 'Photo')}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" onerror="this.src='https://placehold.co/400x400/0A140F/00FF9D?text=Photo'">
                    <div class="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-surface-950/20 to-transparent"></div>
                    
                    <!-- Quick action buttons on hover -->
                    <div class="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10" onclick="event.stopPropagation()">
                        <button onclick="openUniversalShare('favorite', '${item.id}', event);" class="w-6 h-6 rounded-lg bg-surface-950/90 hover:bg-surface-800 text-slate-300 hover:text-brand-400 flex items-center justify-center transition-colors shadow" title="Share Options">
                            <i class="fa-solid fa-share-nodes text-[10px]"></i>
                        </button>
                        <button onclick="openFavoriteModal('${item.id}', 'photo');" class="w-6 h-6 rounded-lg bg-surface-950/90 hover:bg-surface-800 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-colors shadow" title="Edit">
                            <i class="fa-solid fa-pen text-[10px]"></i>
                        </button>
                        <button onclick="deleteFavorite('${item.id}');" class="w-6 h-6 rounded-lg bg-surface-950/90 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow" title="Delete">
                            <i class="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                    </div>

                    <!-- Type Tag Bottom Left -->
                    <div class="absolute bottom-2 left-2 right-2">
                        <p class="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">${escapeHtml(item.title || 'Photo Memory')}</p>
                        ${dateFormatted ? `<p class="text-[9px] font-mono text-slate-400 truncate">${dateFormatted}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    } else {
        // Quote Card
        return `
            <div class="group relative rounded-2xl border border-surface-800 hover:border-amber-500/60 bg-surface-900/80 p-3.5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer aspect-square" onclick="openFavoriteQuoteView('${item.id}')">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] border border-amber-500/20">
                        <i class="fa-solid fa-quote-left"></i>
                    </span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
                        <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 flex items-center justify-center transition-colors" title="Share Options">
                            <i class="fa-solid fa-share-nodes text-[10px]"></i>
                        </button>
                        <button onclick="copyFavoriteText('${item.id}')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="Copy">
                            <i class="fa-regular fa-copy text-[10px]"></i>
                        </button>
                        <button onclick="openFavoriteModal('${item.id}', 'quote')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors" title="Edit">
                            <i class="fa-solid fa-pen text-[10px]"></i>
                        </button>
                        <button onclick="deleteFavorite('${item.id}')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="Delete">
                            <i class="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                    </div>
                </div>

                <!-- Snippet -->
                <p class="text-xs font-sans italic text-slate-200 line-clamp-3 leading-snug my-1 group-hover:text-amber-200 transition-colors">
                    "${escapeHtml(item.content)}"
                </p>

                <div class="pt-1.5 border-t border-surface-800/60 flex items-center justify-between gap-1 text-[10px]">
                    <span class="text-amber-400 font-medium truncate font-sans">
                        — ${escapeHtml(item.author || 'Anonymous')}
                    </span>
                    ${dateFormatted ? `<span class="font-mono text-slate-500 text-[9px] shrink-0">${dateFormatted}</span>` : ''}
                </div>
            </div>
        `;
    }
}

// LIST VIEW ROW
function renderFavoriteListRow(item) {
    const dateFormatted = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

    if (item.type === 'photo') {
        const photoSrc = item.photoUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80';
        return `
            <div class="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border border-surface-800 hover:border-cyan-500/50 bg-surface-900/70 transition-all hover:bg-surface-900 cursor-pointer" onclick="openFavoritePhotoLightbox('${item.id}')">
                <div class="flex items-center gap-3 min-w-0">
                    <img src="${escapeHtml(photoSrc)}" alt="${escapeHtml(item.title || 'Photo')}" class="w-12 h-12 rounded-xl object-cover border border-surface-700 shrink-0" onerror="this.src='https://placehold.co/100x100/0A140F/00FF9D?text=Photo'">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 text-[10px] font-mono border border-cyan-500/20">Photo</span>
                            <h4 class="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">${escapeHtml(item.title || 'Photo Memory')}</h4>
                        </div>
                        <p class="text-[10px] font-mono text-slate-400 mt-0.5">${dateFormatted}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
                    <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 rounded-xl text-xs transition-colors cursor-pointer" title="Share Options">
                        <i class="fa-solid fa-share-nodes text-xs"></i>
                    </button>
                    <button onclick="openFavoritePhotoLightbox('${item.id}')" class="px-2.5 py-1.5 bg-surface-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-eye text-xs"></i> <span class="hidden sm:inline">View</span>
                    </button>
                    <button onclick="openFavoriteModal('${item.id}', 'photo');" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 rounded-xl text-xs transition-colors cursor-pointer" title="Edit">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteFavorite('${item.id}');" class="p-1.5 bg-surface-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer" title="Delete">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        // Quote row
        return `
            <div class="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border border-surface-800 hover:border-amber-500/50 bg-surface-900/70 transition-all hover:bg-surface-900 cursor-pointer" onclick="openFavoriteQuoteView('${item.id}')">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-sm">
                        <i class="fa-solid fa-quote-left"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-mono border border-amber-500/20">Quote</span>
                            <span class="text-xs font-bold text-amber-300 font-sans truncate">— ${escapeHtml(item.author || 'Anonymous')}</span>
                        </div>
                        <p class="text-xs italic text-slate-200 truncate mt-0.5 font-sans group-hover:text-amber-200">"${escapeHtml(item.content)}"</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
                    <span class="text-[10px] font-mono text-slate-500 hidden md:inline mr-1">${dateFormatted}</span>
                    <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 rounded-xl text-xs transition-colors cursor-pointer" title="Share Options">
                        <i class="fa-solid fa-share-nodes text-xs"></i>
                    </button>
                    <button onclick="copyFavoriteText('${item.id}')" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer" title="Copy">
                        <i class="fa-regular fa-copy text-xs"></i>
                    </button>
                    <button onclick="openFavoriteQuoteView('${item.id}');" class="px-2.5 py-1.5 bg-surface-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-book-open text-xs"></i> <span class="hidden sm:inline">Read</span>
                    </button>
                    <button onclick="openFavoriteModal('${item.id}', 'quote');" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 rounded-xl text-xs transition-colors cursor-pointer" title="Edit">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteFavorite('${item.id}');" class="p-1.5 bg-surface-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer" title="Delete">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    }
}

function openFavoriteModal(id = null, defaultType = 'photo') {
    const editIdEl = document.getElementById('favEditId');
    const modalTitleEl = document.getElementById('favoriteModalTitle');
    const saveBtnText = document.getElementById('favSaveBtnText');

    const cleanDefaultType = (defaultType === 'quote') ? 'quote' : 'photo';

    if (id) {
        const item = (db.favorites || []).find(x => x.id === id);
        if (item) {
            if (editIdEl) editIdEl.value = item.id;
            if (modalTitleEl) modalTitleEl.innerText = 'Edit Favorite';
            if (saveBtnText) saveBtnText.innerText = 'Save Changes';

            setFavoriteModalType(item.type === 'quote' ? 'quote' : 'photo');

            if (document.getElementById('favPhotoCaptionInput')) document.getElementById('favPhotoCaptionInput').value = item.title || '';
            if (document.getElementById('favPhotoUrlInput')) document.getElementById('favPhotoUrlInput').value = item.photoUrl || '';
            if (document.getElementById('favContentInput')) document.getElementById('favContentInput').value = item.content || '';
            if (document.getElementById('favAuthorInput')) document.getElementById('favAuthorInput').value = item.author || '';

            if (item.type === 'photo' && item.photoUrl) {
                previewFavoritePhoto(item.photoUrl);
            }
        }
    } else {
        if (editIdEl) editIdEl.value = '';
        const titles = { photo: 'Add Photo', quote: 'Add Quote' };
        if (modalTitleEl) modalTitleEl.innerText = titles[cleanDefaultType] || 'Add Favorite';
        if (saveBtnText) saveBtnText.innerText = 'Save';

        setFavoriteModalType(cleanDefaultType);

        if (document.getElementById('favPhotoCaptionInput')) document.getElementById('favPhotoCaptionInput').value = '';
        if (document.getElementById('favPhotoUrlInput')) document.getElementById('favPhotoUrlInput').value = '';
        if (document.getElementById('favContentInput')) document.getElementById('favContentInput').value = '';
        if (document.getElementById('favAuthorInput')) document.getElementById('favAuthorInput').value = '';
        clearFavoritePhotoPreview();
    }

    openModal('favoriteModal');
}
window.openFavoriteModal = openFavoriteModal;

function setFavoriteModalType(type) {
    const targetType = (type === 'quote') ? 'quote' : 'photo';
    const typeInput = document.getElementById('favEditType');
    if (typeInput) typeInput.value = targetType;

    const tabPhoto = document.getElementById('favTabPhoto');
    const tabQuote = document.getElementById('favTabQuote');
    const photoContainer = document.getElementById('favPhotoContainer');
    const quoteContainer = document.getElementById('favQuoteContainer');
    const modalIcon = document.getElementById('favModalHeaderIcon');

    // Reset tabs
    if (tabPhoto) tabPhoto.className = 'py-2 px-2.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer';
    if (tabQuote) tabQuote.className = 'py-2 px-2.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer';

    if (photoContainer) photoContainer.classList.add('hidden');
    if (quoteContainer) quoteContainer.classList.add('hidden');

    if (targetType === 'photo') {
        if (tabPhoto) tabPhoto.className = 'py-2 px-2.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm cursor-pointer';
        if (photoContainer) photoContainer.classList.remove('hidden');
        if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-camera text-sm text-cyan-400"></i>';
    } else {
        if (tabQuote) tabQuote.className = 'py-2 px-2.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm cursor-pointer';
        if (quoteContainer) quoteContainer.classList.remove('hidden');
        if (modalIcon) modalIcon.innerHTML = '<i class="fa-solid fa-quote-left text-sm text-amber-400"></i>';
    }
}
window.setFavoriteModalType = setFavoriteModalType;

function previewFavoritePhoto(urlOverride = null) {
    const urlInput = document.getElementById('favPhotoUrlInput');
    const previewBox = document.getElementById('favPhotoPreviewBox');
    const previewImg = document.getElementById('favPhotoPreviewImg');

    const url = urlOverride || (urlInput ? urlInput.value.trim() : '');
    if (url && previewBox && previewImg) {
        previewImg.src = url;
        previewBox.classList.remove('hidden');
    }
}
window.previewFavoritePhoto = previewFavoritePhoto;

function clearFavoritePhotoPreview() {
    const urlInput = document.getElementById('favPhotoUrlInput');
    const previewBox = document.getElementById('favPhotoPreviewBox');
    const previewImg = document.getElementById('favPhotoPreviewImg');
    const fileName = document.getElementById('favFileName');

    if (urlInput) urlInput.value = '';
    if (previewBox) previewBox.classList.add('hidden');
    if (previewImg) previewImg.src = '';
    if (fileName) fileName.innerText = '';
}
window.clearFavoritePhotoPreview = clearFavoritePhotoPreview;

function handleFavoriteFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const fileNameEl = document.getElementById('favFileName');
    if (fileNameEl) fileNameEl.innerText = file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        const urlInput = document.getElementById('favPhotoUrlInput');
        if (urlInput) urlInput.value = base64;
        previewFavoritePhoto(base64);
    };
    reader.readAsDataURL(file);
}
window.handleFavoriteFileUpload = handleFavoriteFileUpload;

function saveFavoriteItem() {
    const id = document.getElementById('favEditId').value;
    const type = document.getElementById('favEditType').value || 'photo';

    if (!db.favorites) db.favorites = [];

    if (type === 'photo') {
        const photoUrl = (document.getElementById('favPhotoUrlInput').value || '').trim();
        const caption = (document.getElementById('favPhotoCaptionInput').value || '').trim();

        if (!photoUrl) {
            showToast('Please upload an image file or enter an image URL.');
            return;
        }

        if (id) {
            const item = db.favorites.find(x => x.id === id);
            if (item) {
                item.type = 'photo';
                item.title = caption || 'Photo Memory';
                item.photoUrl = photoUrl;
                showToast('Photo updated successfully');
            }
        } else {
            const newItem = {
                id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                type: 'photo',
                title: caption || 'Photo Memory',
                photoUrl: photoUrl,
                createdAt: new Date().toISOString(),
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            db.favorites.unshift(newItem);
            showToast('Photo added to favorites');
        }
    } else {
        // Quote
        const content = (document.getElementById('favContentInput').value || '').trim();
        const author = (document.getElementById('favAuthorInput').value || '').trim();

        if (!content) {
            showToast('Please enter the quote text.');
            return;
        }

        if (id) {
            const item = db.favorites.find(x => x.id === id);
            if (item) {
                item.type = 'quote';
                item.content = content;
                item.author = author || 'Anonymous';
                showToast('Quote updated successfully');
            }
        } else {
            const newItem = {
                id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                type: 'quote',
                content: content,
                author: author || 'Anonymous',
                createdAt: new Date().toISOString(),
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            db.favorites.unshift(newItem);
            showToast('Quote added to favorites');
        }
    }

    saveDatabase();
    closeModal('favoriteModal');
    renderFavoritesPage();
}
window.saveFavoriteItem = saveFavoriteItem;

function deleteFavorite(id) {
    if (!db.favorites) return;
    const index = db.favorites.findIndex(x => x.id === id);
    if (index === -1) return;

    const deletedItem = db.favorites[index];

    if (typeof pushUndoDelete === 'function') {
        pushUndoDelete('favorite', deletedItem, index);
    }

    db.favorites.splice(index, 1);
    saveDatabase();
    renderFavoritesPage();
    showToast('Item deleted from favorites', true);
}
window.deleteFavorite = deleteFavorite;

function copyFavoriteText(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item) return;

    let textToCopy = `"${item.content}"\n— ${item.author || 'Anonymous'}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Quote copied to clipboard!');
        }).catch(() => {
            showToast('Quote copied!');
        });
    } else {
        showToast('Quote copied!');
    }
}
window.copyFavoriteText = copyFavoriteText;

let currentLightboxFavId = null;
let currentQuoteViewFavId = null;

function openFavoritePhotoLightbox(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item) return;

    currentLightboxFavId = id;
    window.currentLightboxFavId = id;

    const img = document.getElementById('lightboxFavPhotoImg');
    const title = document.getElementById('lightboxFavPhotoTitle');
    const date = document.getElementById('lightboxFavPhotoDate');
    const download = document.getElementById('lightboxFavPhotoDownload');
    const deleteBtn = document.getElementById('lightboxFavPhotoDeleteBtn');
    const editBtn = document.getElementById('lightboxFavPhotoEditBtn');

    const photoSrc = item.photoUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

    if (img) img.src = photoSrc;
    if (title) title.innerText = item.title || 'Photo Memory';
    if (date) date.innerText = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
    if (download) {
        download.href = photoSrc;
    }
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            deleteFavorite(item.id);
            closeModal('favoritePhotoLightboxModal');
        };
    }
    if (editBtn) {
        editBtn.onclick = () => {
            closeModal('favoritePhotoLightboxModal');
            openFavoriteModal(item.id, 'photo');
        };
    }

    openModal('favoritePhotoLightboxModal');
}
window.openFavoritePhotoLightbox = openFavoritePhotoLightbox;

function shareFavoriteFromLightbox(channel) {
    if (!currentLightboxFavId) return;
    if (typeof shareItemDirect === 'function') {
        shareItemDirect('favorite', currentLightboxFavId, channel);
    }
}
window.shareFavoriteFromLightbox = shareFavoriteFromLightbox;

function openShareForCurrentLightboxFav() {
    if (!currentLightboxFavId) return;
    if (typeof openUniversalShare === 'function') {
        openUniversalShare('favorite', currentLightboxFavId);
    }
}
window.openShareForCurrentLightboxFav = openShareForCurrentLightboxFav;

function openFavoriteQuoteView(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item) return;

    currentQuoteViewFavId = id;
    window.currentQuoteViewFavId = id;

    const contentEl = document.getElementById('viewFavQuoteContent');
    const authorEl = document.getElementById('viewFavQuoteAuthor');
    const dateEl = document.getElementById('viewFavQuoteDate');
    const copyBtn = document.getElementById('viewFavQuoteCopyBtn');
    const editBtn = document.getElementById('viewFavQuoteEditBtn');
    const deleteBtn = document.getElementById('viewFavQuoteDeleteBtn');

    if (contentEl) contentEl.innerText = `"${item.content || ''}"`;
    if (authorEl) authorEl.innerText = `— ${item.author || 'Anonymous'}`;
    if (dateEl) dateEl.innerText = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

    if (copyBtn) {
        copyBtn.onclick = () => copyFavoriteText(item.id);
    }
    if (editBtn) {
        editBtn.onclick = () => {
            closeModal('favoriteQuoteViewModal');
            openFavoriteModal(item.id, 'quote');
        };
    }
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            deleteFavorite(item.id);
            closeModal('favoriteQuoteViewModal');
        };
    }

    openModal('favoriteQuoteViewModal');
}
window.openFavoriteQuoteView = openFavoriteQuoteView;

function shareFavoriteFromQuoteView(channel) {
    if (!currentQuoteViewFavId) return;
    if (typeof shareItemDirect === 'function') {
        shareItemDirect('favorite', currentQuoteViewFavId, channel);
    }
}
window.shareFavoriteFromQuoteView = shareFavoriteFromQuoteView;

function openShareForCurrentQuoteViewFav() {
    if (!currentQuoteViewFavId) return;
    if (typeof openUniversalShare === 'function') {
        openUniversalShare('favorite', currentQuoteViewFavId);
    }
}
window.openShareForCurrentQuoteViewFav = openShareForCurrentQuoteViewFav;





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
    if (typeof renderBudgetAnalysis === 'function') {
        renderBudgetAnalysis();
    }
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
            statusBadge = `<span class="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 font-medium"><i class="fa-regular fa-clock text-[11px] text-slate-500"></i> Planned</span>`;
        } else if (variance >= 0) {
            statusBadge = `<span class="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check text-[11px]"></i> Within Budget</span>`;
        } else {
            statusBadge = `<span class="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 font-semibold"><i class="fa-solid fa-circle-exclamation text-[11px]"></i> Over Budget</span>`;
        }

        const varClass = variance >= 0 ? 'text-emerald-400' : 'text-rose-400';
        const varSign = variance < 0 ? '-' : '+';
        const varDisplay = `${varSign}${currSymbol}${Math.abs(variance).toLocaleString('en-IN', {minimumFractionDigits: 2})}`;

        const tr = document.createElement('tr');
        tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-12">${idx + 1}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-300 font-medium flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.month || 'All'} ${b.year || '2026'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-semibold text-slate-100 flex items-center gap-2 h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[180px]">
                <span>${b.category}</span>
                ${b.notes ? `<span class="text-[10px] text-slate-500 font-normal italic">(${b.notes})</span>` : ''}
            </div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold text-slate-200 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${currSymbol}${budgetAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold text-rose-400 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${currSymbol}${spendAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-bold font-mono ${varClass} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${varDisplay}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${statusBadge}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                <div class="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    <button onclick="openBudgetModal('${curr}', '${b.id}')" class="text-slate-500 hover:text-brand-500 transition-colors" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteBudget('${curr}', '${b.id}')" class="text-slate-500 hover:text-rose-500 transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div></td>
        `;
        body.appendChild(tr);
    });

    const foot = document.getElementById(tableFootId);
    if (foot) {
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        const netVariance = totalBudgetSum - totalSpendSum;
        const netVarClass = netVariance >= 0 ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30';
        const netSign = netVariance < 0 ? '-' : '+';
        foot.innerHTML = `
            <tr class="border-none">
                <td colspan="3" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 tracking-widest text-xs font-bold align-middle border-none">Total (${curr}):</td>
                <td class="py-4 px-1 text-right align-middle border-none">
                    <span class="inline-block px-3 py-2 rounded-xl bg-surface-950 border border-brand-500/30 text-slate-100 font-bold font-mono text-xs shadow-sm">${currSymbol}${totalBudgetSum.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 px-1 text-right align-middle border-none">
                    <span class="inline-block px-3 py-2 rounded-xl bg-surface-950 border border-rose-500/30 text-rose-400 font-bold font-mono text-xs shadow-sm">${currSymbol}${totalSpendSum.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 px-1 text-right align-middle border-none">
                    <span class="inline-block px-3 py-2 rounded-xl bg-surface-950 border ${netVarClass} font-bold font-mono text-xs shadow-sm">${netSign}${currSymbol}${Math.abs(netVariance).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 px-1 text-center align-middle border-none">
                    <span class="inline-block px-3 py-2 rounded-xl bg-surface-950 border ${netVarClass} text-[10px] font-mono font-bold shadow-sm">${netVariance >= 0 ? 'Net Surplus' : 'Net Deficit'}</span>
                </td>
                <td class="border-none"></td>
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

function populateCategorySelect(selectId, currency, selectedValue = '') {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const isQAR = (currency || '').toUpperCase() === 'QAR';
    
    // Qatar: Personal Expenses first
    // India: Family Maintenance first
    const categories = isQAR
        ? ['Personal Expenses', 'Family Maintenance', 'Charity', 'Investment', 'Others']
        : ['Family Maintenance', 'Personal Expenses', 'Charity', 'Investment', 'Others'];
    
    sel.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    
    if (selectedValue) {
        if (categories.includes(selectedValue)) {
            sel.value = selectedValue;
        } else {
            sel.value = 'Others';
        }
    } else {
        sel.value = categories[0];
    }
}
window.populateCategorySelect = populateCategorySelect;

function openBudgetModal(currency, id = null) {
    const currEl = document.getElementById('budgetModalCurrency') || document.getElementById('budgetCurrencyInput');
    if (currEl) currEl.value = currency;
    const idEl = document.getElementById('budgetId');
    if (idEl) idEl.value = id || '';
    
    const isQAR = (currency || '').toUpperCase() === 'QAR';
    const defaultCat = isQAR ? 'Personal Expenses' : 'Family Maintenance';

    if (id) {
        const list = (db.budget && db.budget[currency]) ? db.budget[currency] : [];
        const b = list.find(x => x.id === id);
        if (b) {
            const titleEl = document.getElementById('budgetModalTitle');
            if (titleEl) titleEl.innerText = `Edit ${currency} Planned Budget`;
            if (document.getElementById('budgetYearInput')) document.getElementById('budgetYearInput').value = b.year || '2026';
            if (document.getElementById('budgetMonthInput')) document.getElementById('budgetMonthInput').value = b.month || 'February';
            
            populateCategorySelect('budgetCategoryInput', currency, b.category || defaultCat);
            const customCatInput = document.getElementById('budgetCustomCategoryInput');
            if (customCatInput) {
                if (b.category && !['Personal Expenses', 'Family Maintenance', 'Charity', 'Investment'].includes(b.category)) {
                    customCatInput.value = b.category;
                } else {
                    customCatInput.value = '';
                }
            }
            
            if (document.getElementById('budgetAmountInput')) document.getElementById('budgetAmountInput').value = b.amount || '';
            if (document.getElementById('budgetNotesInput')) document.getElementById('budgetNotesInput').value = b.notes || '';
        }
    } else {
        const titleEl = document.getElementById('budgetModalTitle');
        if (titleEl) titleEl.innerText = `Add ${currency} Planned Budget`;
        if (document.getElementById('budgetYearInput')) document.getElementById('budgetYearInput').value = budgetFilterYear || '2026';
        if (document.getElementById('budgetMonthInput')) document.getElementById('budgetMonthInput').value = budgetFilterMonth || 'February';
        
        populateCategorySelect('budgetCategoryInput', currency, defaultCat);
        const customCatInput = document.getElementById('budgetCustomCategoryInput');
        if (customCatInput) customCatInput.value = '';
        
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
            const item = db.budget[currency].find(x => x.id === id);
            const idx = db.budget[currency].findIndex(x => x.id === id);
            if (item && typeof recordDeletion === 'function') {
                recordDeletion({
                    type: 'budget',
                    label: `Budget: ${item.category || 'Budget Item'} (${currency})`,
                    data: JSON.parse(JSON.stringify(item)),
                    originalIndex: idx,
                    meta: { currency }
                });
            }
            db.budget[currency] = db.budget[currency].filter(x => x.id !== id);
            saveDatabase();
            renderBudgetsAndGoals();
        }
    });
}

function onDailyExpenseCurrencyChanged() {
    const currEl = document.getElementById('dailyExpenseCurrency') || document.getElementById('dailyExpenseCurrencyInput');
    const curr = currEl ? currEl.value : 'INR';
    const catSel = document.getElementById('dailyExpCategoryInput') || document.getElementById('dailyExpenseCategoryInput');
    const currentCat = catSel ? catSel.value : '';
    populateCategorySelect('dailyExpCategoryInput', curr, currentCat);
    toggleDailyExpCategoryInput();
}
window.onDailyExpenseCurrencyChanged = onDailyExpenseCurrencyChanged;

function openDailyExpenseModal(currency, id = null) {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let selectedCurr = currency || 'INR';
    let targetExp = null;

    if (id) {
        targetExp = (db.dailyExpenses || []).find(x => String(x.id) === String(id));
        if (targetExp && targetExp.currency) {
            selectedCurr = targetExp.currency;
        }
    }

    const currEl = document.getElementById('dailyExpenseCurrency') || document.getElementById('dailyExpenseCurrencyInput');
    if (currEl) currEl.value = selectedCurr;
    
    const idEl = document.getElementById('dailyExpenseId');
    if (idEl) idEl.value = id ? String(id) : '';
    
    const isQAR = (selectedCurr || '').toUpperCase() === 'QAR';
    const defaultCat = isQAR ? 'Personal Expenses' : 'Family Maintenance';
    
    const titleEl = document.getElementById('dailyExpenseModalTitle');
    const dateInput = document.getElementById('dailyExpDateInput') || document.getElementById('dailyExpenseDateInput');
    const customCatInput = document.getElementById('dailyExpCustomCategoryInput');
    const descEl = document.getElementById('dailyExpDescInput') || document.getElementById('dailyExpenseItemInput');
    const amtEl = document.getElementById('dailyExpAmountInput') || document.getElementById('dailyExpenseAmountInput');

    if (targetExp) {
        if (titleEl) titleEl.innerText = `Edit ${selectedCurr} Expense`;
        
        let dVal = targetExp.date || todayStr;
        if (dVal && dVal.includes('-')) {
            const parts = dVal.split('-');
            if (parts.length === 3) dVal = `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
        if (dateInput) {
            if (dateInput._flatpickr) {
                dateInput._flatpickr.setDate(dVal, true, "d/m/Y");
            } else {
                dateInput.value = dVal;
            }
        }
        
        const standardCats = ['Family Maintenance', 'Personal Expenses', 'Charity', 'Investment'];
        const isCustom = targetExp.category && !standardCats.includes(targetExp.category);
        
        populateCategorySelect('dailyExpCategoryInput', selectedCurr, isCustom ? 'Others' : (targetExp.category || defaultCat));
        
        if (customCatInput) {
            customCatInput.value = isCustom ? targetExp.category : '';
        }
        
        if (descEl) descEl.value = targetExp.particulars || targetExp.item || '';
        if (amtEl) amtEl.value = targetExp.amount !== undefined ? targetExp.amount : '';
    } else {
        if (titleEl) titleEl.innerText = `Log ${selectedCurr} Expense`;
        if (dateInput) {
            if (dateInput._flatpickr) {
                dateInput._flatpickr.setDate(todayStr, true, "d/m/Y");
            } else {
                dateInput.value = todayStr;
            }
        }
        populateCategorySelect('dailyExpCategoryInput', selectedCurr, defaultCat);
        if (customCatInput) customCatInput.value = '';
        if (descEl) descEl.value = '';
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
    let date = dateInput ? dateInput.value.trim() : '';
    if (!date) date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (date.includes('-')) {
        const parts = date.split('-');
        if (parts.length === 3) date = `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
    }
    
    const catSel = document.getElementById('dailyExpCategoryInput') || document.getElementById('dailyExpenseCategoryInput');
    let category = catSel ? catSel.value : 'Family Maintenance';
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
        const exp = db.dailyExpenses.find(x => String(x.id) === String(id));
        if (exp) {
            exp.currency = curr;
            exp.date = date;
            exp.particulars = particulars;
            exp.item = particulars;
            exp.category = category;
            exp.amount = amount;
        } else {
            db.dailyExpenses.push({
                id: String(id),
                currency: curr,
                date,
                particulars,
                item: particulars,
                category,
                amount
            });
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
    showToast(id ? 'Daily expense updated' : 'Daily expense logged');

    const logModal = document.getElementById('dailyExpenseLogModal');
    if (logModal && !logModal.classList.contains('hidden')) {
        renderDailyExpensesLogTable();
    }
}
window.saveDailyExpenseDetails = saveDailyExpense;

function deleteDailyExpense(id) {
    requireConfirmation('Delete this expense entry?', () => {
        if (db.dailyExpenses) {
            const item = db.dailyExpenses.find(x => x.id === id);
            const idx = db.dailyExpenses.findIndex(x => x.id === id);
            if (item && typeof recordDeletion === 'function') {
                recordDeletion({
                    type: 'expense',
                    label: `Expense: ${item.category || item.description || 'Expense'} (${item.currency || 'INR'} ${item.amount || 0})`,
                    data: JSON.parse(JSON.stringify(item)),
                    originalIndex: idx
                });
            }
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
        tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
        const curr = exp.currency || 'INR';
        const currBadge = curr === 'QAR' 
            ? `<span class="inline-flex items-center gap-1 font-mono text-xs font-bold text-rose-400"><i class="fa-solid fa-coins text-[10px] text-rose-400/80"></i> QAR</span>`
            : `<span class="inline-flex items-center gap-1 font-mono text-xs font-bold text-accent-cyan"><i class="fa-solid fa-indian-rupee-sign text-[10px] text-accent-cyan/80"></i> INR</span>`;
        const amt = parseFloat(exp.amount) || 0;
        const particularText = exp.particulars || exp.item || 'Expense';

        tr.innerHTML = `
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-400 flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${exp.date || '-'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${currBadge}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-slate-300 font-medium flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${exp.category || 'General'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-white font-medium flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[200px]">${particularText}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono font-bold text-slate-200 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${curr === 'QAR' ? 'QR ' : '₹'}${amt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                <div class="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity w-full">
                    <button onclick="openDailyExpenseModal('${curr}', '${exp.id}')" class="text-slate-500 hover:text-brand-500 transition-colors" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteDailyExpenseFromLog('${exp.id}')" class="text-slate-500 hover:text-rose-500 transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </div></td>
        `;
        body.appendChild(tr);
    });
}
window.renderDailyExpensesLogTable = renderDailyExpensesLogTable;

function deleteDailyExpenseFromLog(id) {
    requireConfirmation('Delete this expense entry?', () => {
        if (db.dailyExpenses) {
            const item = db.dailyExpenses.find(x => x.id === id);
            const idx = db.dailyExpenses.findIndex(x => x.id === id);
            if (item && typeof recordDeletion === 'function') {
                recordDeletion({
                    type: 'expense',
                    label: `Expense: ${item.category || item.description || 'Expense'} (${item.currency || 'INR'} ${item.amount || 0})`,
                    data: JSON.parse(JSON.stringify(item)),
                    originalIndex: idx
                });
            }
            db.dailyExpenses = db.dailyExpenses.filter(x => x.id !== id);
            saveDatabase();
            renderBudgetsAndGoals();
            renderDailyExpensesLogTable();
        }
    });
}
window.deleteDailyExpenseFromLog = deleteDailyExpenseFromLog;

let budgetAnalysisCurrency = 'ALL';

function setBudgetAnalysisCurrency(curr) {
    budgetAnalysisCurrency = curr;
    const btnAll = document.getElementById('btnBudgetAnalysisCurrALL');
    const btnQar = document.getElementById('btnBudgetAnalysisCurrQAR');
    const btnInr = document.getElementById('btnBudgetAnalysisCurrINR');

    const activeClass = 'px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-brand-600 text-surface-950 font-bold transition-all shadow-sm';
    const inactiveClass = 'px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-white hover:bg-surface-800 transition-all';

    if (btnAll) btnAll.className = curr === 'ALL' ? activeClass : inactiveClass;
    if (btnQar) btnQar.className = curr === 'QAR' ? activeClass : inactiveClass;
    if (btnInr) btnInr.className = curr === 'INR' ? activeClass : inactiveClass;

    renderBudgetAnalysis();
}
window.setBudgetAnalysisCurrency = setBudgetAnalysisCurrency;

function renderBudgetAnalysis() {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const QAR_TO_INR = 22.8;
    const year = budgetFilterYear || '2026';
    const month = budgetFilterMonth || 'February';
    const isYearly = budgetFilterMode === 'yearly';

    // Update table period header label
    const periodLabel = document.getElementById('baTablePeriodLabel');
    if (periodLabel) {
        periodLabel.innerText = `Period: ${isYearly ? year : `${month} ${year}`} (${budgetAnalysisCurrency === 'ALL' ? 'Combined INR' : budgetAnalysisCurrency})`;
    }
    const trendTitle = document.getElementById('budgetMonthlyTrendTitle');
    if (trendTitle) {
        trendTitle.innerText = `Monthly Budget & Spend Trend (${year} - ${budgetAnalysisCurrency === 'ALL' ? 'Combined INR' : budgetAnalysisCurrency})`;
    }

    const parseExpenseDate = (dStr) => {
        if (!dStr) return null;
        if (dStr.includes('/')) {
            const p = dStr.split('/');
            return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
        }
        return new Date(dStr);
    };

    const isExpenseInFilter = (e) => {
        const d = parseExpenseDate(e.date);
        if (!d || isNaN(d.getTime())) return true;
        const expYear = d.getFullYear().toString();
        if (isYearly) {
            return expYear === year;
        }
        const expMonth = d.toLocaleString('default', { month: 'long' }).toLowerCase();
        return expYear === year && expMonth === month.toLowerCase();
    };

    // Filter budgets
    const filterBudgetList = (list) => {
        if (!list) return [];
        return list.filter(b => {
            const bYear = b.year || '2026';
            if (isYearly) return bYear === year;
            const bMonth = b.month || 'February';
            return bYear === year && bMonth.toLowerCase() === month.toLowerCase();
        });
    };

    const qarBudgets = filterBudgetList(db.budget?.QAR || []);
    const inrBudgets = filterBudgetList(db.budget?.INR || []);

    const allExpenses = db.dailyExpenses || [];
    const qarExpenses = allExpenses.filter(e => (e.currency || 'INR') === 'QAR' && isExpenseInFilter(e));
    const inrExpenses = allExpenses.filter(e => (e.currency || 'INR') === 'INR' && isExpenseInFilter(e));

    // Category aggregation
    const catMap = {};
    const initCat = (c) => {
        if (!catMap[c]) {
            catMap[c] = { category: c, budget: 0, spend: 0, qarBudget: 0, inrBudget: 0, qarSpend: 0, inrSpend: 0 };
        }
    };

    // Populate from standard categories
    ['Personal Expenses', 'Family Maintenance', 'Charity', 'Investment', 'Others'].forEach(initCat);

    // Populate planned budgets
    qarBudgets.forEach(b => {
        const cat = b.category || 'Others';
        initCat(cat);
        const amt = parseFloat(b.amount) || 0;
        catMap[cat].qarBudget += amt;
    });
    inrBudgets.forEach(b => {
        const cat = b.category || 'Others';
        initCat(cat);
        const amt = parseFloat(b.amount) || 0;
        catMap[cat].inrBudget += amt;
    });

    // Populate actual spends
    qarExpenses.forEach(e => {
        const cat = e.category || 'Others';
        initCat(cat);
        const amt = parseFloat(e.amount) || 0;
        catMap[cat].qarSpend += amt;
    });
    inrExpenses.forEach(e => {
        const cat = e.category || 'Others';
        initCat(cat);
        const amt = parseFloat(e.amount) || 0;
        catMap[cat].inrSpend += amt;
    });

    // Compute effective values based on currency
    const currSym = budgetAnalysisCurrency === 'QAR' ? 'QR ' : '₹';

    Object.values(catMap).forEach(c => {
        if (budgetAnalysisCurrency === 'QAR') {
            c.budget = c.qarBudget;
            c.spend = c.qarSpend;
        } else if (budgetAnalysisCurrency === 'INR') {
            c.budget = c.inrBudget;
            c.spend = c.inrSpend;
        } else {
            // Combined in INR
            c.budget = c.inrBudget + (c.qarBudget * QAR_TO_INR);
            c.spend = c.inrSpend + (c.qarSpend * QAR_TO_INR);
        }
    });

    // Total metrics
    let totalBudget = 0;
    let totalSpend = 0;
    let totalQarBudget = 0;
    let totalInrBudget = 0;
    let totalQarSpend = 0;
    let totalInrSpend = 0;

    Object.values(catMap).forEach(c => {
        totalBudget += c.budget;
        totalSpend += c.spend;
        totalQarBudget += c.qarBudget;
        totalInrBudget += c.inrBudget;
        totalQarSpend += c.qarSpend;
        totalInrSpend += c.inrSpend;
    });

    const variance = totalBudget - totalSpend;
    const utilizationPct = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : (totalSpend > 0 ? 100 : 0);

    // Update KPI Card 1: Total Budget
    const elTotBudget = document.getElementById('baMetricTotalBudget');
    if (elTotBudget) {
        elTotBudget.innerText = `${currSym}${totalBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const elBudgetSub = document.getElementById('baMetricBudgetSub');
    if (elBudgetSub) {
        if (budgetAnalysisCurrency === 'ALL') {
            elBudgetSub.innerText = `INR ₹${totalInrBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })} + QAR QR ${totalQarBudget.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        } else {
            elBudgetSub.innerText = `Planned budget for ${isYearly ? year : month}`;
        }
    }

    // Update KPI Card 2: Actual Spend
    const elTotSpend = document.getElementById('baMetricTotalSpend');
    if (elTotSpend) {
        elTotSpend.innerText = `${currSym}${totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const elSpendSub = document.getElementById('baMetricSpendSub');
    if (elSpendSub) {
        if (budgetAnalysisCurrency === 'ALL') {
            elSpendSub.innerText = `INR ₹${totalInrSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })} + QAR QR ${totalQarSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
        } else {
            elSpendSub.innerText = `Logged expenses for ${isYearly ? year : month}`;
        }
    }

    // Update KPI Card 3: Net Variance
    const elVariance = document.getElementById('baMetricVariance');
    const elVarianceSub = document.getElementById('baMetricVarianceSub');
    const elVarianceIcon = document.getElementById('baMetricVarianceIcon');
    if (elVariance) {
        const sign = variance >= 0 ? '+' : '-';
        elVariance.innerText = `${sign}${currSym}${Math.abs(variance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (variance >= 0) {
            elVariance.className = 'font-mono text-xl font-bold text-emerald-400 tracking-tight';
            if (elVarianceSub) elVarianceSub.innerHTML = `<span class="text-emerald-400 font-medium">Surplus retained (${(100 - Math.min(100, utilizationPct)).toFixed(1)}% unspent)</span>`;
            if (elVarianceIcon) elVarianceIcon.className = 'w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs';
        } else {
            elVariance.className = 'font-mono text-xl font-bold text-rose-400 tracking-tight';
            if (elVarianceSub) elVarianceSub.innerHTML = `<span class="text-rose-400 font-medium">Deficit exceeded by ${(utilizationPct - 100).toFixed(1)}%</span>`;
            if (elVarianceIcon) elVarianceIcon.className = 'w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center text-xs';
        }
    }

    // Update KPI Card 4: Utilization & Burn
    const elUtilPct = document.getElementById('baMetricUtilizationPct');
    const elDailyBurn = document.getElementById('baMetricDailyBurn');
    const elProgress = document.getElementById('baMetricProgressBar');
    const elStatusBadge = document.getElementById('baMetricStatusBadge');

    const daysCount = isYearly ? 365 : 30;
    const dailyAvg = totalSpend / (daysCount || 1);

    if (elUtilPct) elUtilPct.innerText = `${utilizationPct.toFixed(1)}%`;
    if (elDailyBurn) elDailyBurn.innerText = `Avg: ${currSym}${dailyAvg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/day`;
    if (elProgress) {
        elProgress.style.width = `${Math.min(100, Math.max(0, utilizationPct))}%`;
        if (utilizationPct > 100) {
            elProgress.className = 'h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500';
        } else if (utilizationPct > 85) {
            elProgress.className = 'h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500';
        } else {
            elProgress.className = 'h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500';
        }
    }
    if (elStatusBadge) {
        if (utilizationPct > 100) {
            elStatusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30';
            elStatusBadge.innerText = 'Over Budget';
        } else if (utilizationPct > 85) {
            elStatusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30';
            elStatusBadge.innerText = 'Near Limit';
        } else {
            elStatusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
            elStatusBadge.innerText = 'Optimal';
        }
    }

    // Active categories for table & charts
    const activeCategories = Object.values(catMap).filter(c => c.budget > 0 || c.spend > 0);
    // If empty, show all standard categories
    const displayCategories = activeCategories.length > 0 ? activeCategories : Object.values(catMap).slice(0, 5);

    // Render Table
    const tableBody = document.getElementById('budgetAnalysisTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        if (displayCategories.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-chart-pie text-2xl mb-2 block opacity-40"></i> No budget or expense entries found for this period.</td></tr>`;
        } else {
            displayCategories.forEach(c => {
                const catBudget = c.budget;
                const catSpend = c.spend;
                const catVar = catBudget - catSpend;
                const catUtil = catBudget > 0 ? (catSpend / catBudget) * 100 : (catSpend > 0 ? 100 : 0);

                let healthBadge = '';
                if (catSpend === 0 && catBudget > 0) {
                    healthBadge = `<span class="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 font-medium"><i class="fa-regular fa-clock text-[11px] text-slate-500"></i> Unspent</span>`;
                } else if (catSpend > 0 && catBudget === 0) {
                    healthBadge = `<span class="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-semibold"><i class="fa-solid fa-triangle-exclamation text-[11px]"></i> Unbudgeted</span>`;
                } else if (catVar >= 0) {
                    healthBadge = `<span class="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold"><i class="fa-solid fa-circle-check text-[11px]"></i> Within Budget</span>`;
                } else {
                    healthBadge = `<span class="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 font-semibold"><i class="fa-solid fa-circle-exclamation text-[11px]"></i> Over Budget</span>`;
                }

                let barColor = 'bg-emerald-400';
                if (catUtil > 100) barColor = 'bg-rose-400';
                else if (catUtil > 85) barColor = 'bg-amber-400';

                const varSign = catVar >= 0 ? '+' : '-';
                const varColor = catVar >= 0 ? 'text-emerald-400' : 'text-rose-400';

                const tr = document.createElement('tr');
                tr.className = 'group hover:bg-surface-800/20 transition-colors last:border-0';
                tr.innerHTML = `
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center gap-2 h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                            <span class="w-2 h-2 rounded-full ${catUtil > 100 ? 'bg-rose-400' : (catUtil > 85 ? 'bg-amber-400' : 'bg-brand-400')}"></span>
                            <span class="font-semibold text-slate-100 text-xs">${c.category}</span>
                        </div>
                    </td>
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono font-bold text-slate-200 text-xs flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                            ${currSym}${catBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </td>
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono font-bold text-amber-400 text-xs flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                            ${currSym}${catSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </td>
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono font-bold ${varColor} text-xs flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                            ${varSign}${currSym}${Math.abs(catVar).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </td>
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl flex flex-col justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors space-y-1">
                            <div class="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span>${catUtil.toFixed(1)}%</span>
                            </div>
                            <div class="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden border border-surface-800">
                                <div class="h-full ${barColor} rounded-full" style="width: ${Math.min(100, Math.max(0, catUtil))}%"></div>
                            </div>
                        </div>
                    </td>
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center justify-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                            ${healthBadge}
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // Chart 1: Category Comparison Bar Chart
    const compareCanvas = document.getElementById('budgetCategoryCompareChartCanvas');
    if (compareCanvas && typeof Chart !== 'undefined') {
        const ctx = compareCanvas.getContext('2d');
        if (window.budgetCategoryCompareChartInst) window.budgetCategoryCompareChartInst.destroy();

        const catLabels = displayCategories.map(c => c.category);
        const budgetData = displayCategories.map(c => c.budget);
        const spendData = displayCategories.map(c => c.spend);

        window.budgetCategoryCompareChartInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: catLabels,
                datasets: [
                    {
                        label: 'Planned Budget',
                        data: budgetData,
                        backgroundColor: 'rgba(201, 164, 107, 0.85)',
                        borderColor: '#C9A46B',
                        borderWidth: 1,
                        borderRadius: 6,
                        barPercentage: 0.7,
                        categoryPercentage: 0.6
                    },
                    {
                        label: 'Actual Spend',
                        data: spendData,
                        backgroundColor: 'rgba(0, 242, 254, 0.85)',
                        borderColor: '#00f2fe',
                        borderWidth: 1,
                        borderRadius: 6,
                        barPercentage: 0.7,
                        categoryPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#94a3b8',
                            usePointStyle: true,
                            font: { family: "'JetBrains Mono', monospace", size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.raw || 0;
                                return ` ${context.dataset.label}: ${currSym}${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace", size: 10 } },
                        grid: { display: false }
                    },
                    y: {
                        ticks: {
                            color: '#64748b',
                            font: { family: "'JetBrains Mono', monospace", size: 10 },
                            callback: function(val) { return currSym + (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val); }
                        },
                        grid: { color: 'rgba(51, 65, 85, 0.25)' }
                    }
                }
            }
        });
    }

    // Chart 2: Category Spend Share Doughnut Chart
    const shareCanvas = document.getElementById('budgetCategoryShareChartCanvas');
    if (shareCanvas && typeof Chart !== 'undefined') {
        const ctx2 = shareCanvas.getContext('2d');
        if (window.budgetCategoryShareChartInst) window.budgetCategoryShareChartInst.destroy();

        const spendCategories = displayCategories.filter(c => c.spend > 0);
        const shareLabels = spendCategories.length > 0 ? spendCategories.map(c => c.category) : ['No Spends'];
        const shareData = spendCategories.length > 0 ? spendCategories.map(c => c.spend) : [1];
        const colorPalette = ['#C9A46B', '#00f2fe', '#34d399', '#f59e0b', '#a855f7', '#ec4899', '#38bdf8', '#fb7185'];
        const shareColors = spendCategories.length > 0 ? colorPalette.slice(0, spendCategories.length) : ['#334155'];

        window.budgetCategoryShareChartInst = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: shareLabels,
                datasets: [{
                    data: shareData,
                    backgroundColor: shareColors,
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
                            padding: 10,
                            font: { family: "'JetBrains Mono', monospace", size: 10 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (spendCategories.length === 0) return ' No expense records';
                                const val = context.raw || 0;
                                const pct = totalSpend > 0 ? ((val / totalSpend) * 100).toFixed(1) : '0.0';
                                return ` ${context.label}: ${currSym}${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Chart 3: Monthly Trend Chart across 12 months
    const trendCanvas = document.getElementById('budgetMonthlyTrendChartCanvas');
    if (trendCanvas && typeof Chart !== 'undefined') {
        const ctx3 = trendCanvas.getContext('2d');
        if (window.budgetMonthlyTrendChartInst) window.budgetMonthlyTrendChartInst.destroy();

        const monthlyBudgets = [];
        const monthlySpends = [];

        monthNames.forEach(mName => {
            const mQarBudgets = (db.budget?.QAR || []).filter(b => (b.year || '2026') === year && (b.month || '').toLowerCase() === mName.toLowerCase());
            const mInrBudgets = (db.budget?.INR || []).filter(b => (b.year || '2026') === year && (b.month || '').toLowerCase() === mName.toLowerCase());

            const mQarExpenses = allExpenses.filter(e => {
                if ((e.currency || 'INR') !== 'QAR') return false;
                const d = parseExpenseDate(e.date);
                if (!d || isNaN(d.getTime())) return false;
                return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }).toLowerCase() === mName.toLowerCase();
            });

            const mInrExpenses = allExpenses.filter(e => {
                if ((e.currency || 'INR') !== 'INR') return false;
                const d = parseExpenseDate(e.date);
                if (!d || isNaN(d.getTime())) return false;
                return d.getFullYear().toString() === year && d.toLocaleString('default', { month: 'long' }).toLowerCase() === mName.toLowerCase();
            });

            const qB = mQarBudgets.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
            const iB = mInrBudgets.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
            const qS = mQarExpenses.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
            const iS = mInrExpenses.reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);

            if (budgetAnalysisCurrency === 'QAR') {
                monthlyBudgets.push(qB);
                monthlySpends.push(qS);
            } else if (budgetAnalysisCurrency === 'INR') {
                monthlyBudgets.push(iB);
                monthlySpends.push(iS);
            } else {
                monthlyBudgets.push(iB + (qB * QAR_TO_INR));
                monthlySpends.push(iS + (qS * QAR_TO_INR));
            }
        });

        const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        window.budgetMonthlyTrendChartInst = new Chart(ctx3, {
            type: 'line',
            data: {
                labels: shortMonths,
                datasets: [
                    {
                        label: 'Planned Budget Ceiling',
                        data: monthlyBudgets,
                        borderColor: '#C9A46B',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#C9A46B',
                        tension: 0.2
                    },
                    {
                        label: 'Actual Expense Spend',
                        data: monthlySpends,
                        borderColor: '#00f2fe',
                        backgroundColor: 'rgba(0, 242, 254, 0.12)',
                        fill: true,
                        borderWidth: 2.5,
                        pointRadius: 5,
                        pointBackgroundColor: '#00f2fe',
                        pointHoverRadius: 7,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#94a3b8',
                            usePointStyle: true,
                            font: { family: "'JetBrains Mono', monospace", size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.raw || 0;
                                return ` ${context.dataset.label}: ${currSym}${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8', font: { family: "'JetBrains Mono', monospace", size: 10 } },
                        grid: { color: 'rgba(51, 65, 85, 0.15)' }
                    },
                    y: {
                        ticks: {
                            color: '#64748b',
                            font: { family: "'JetBrains Mono', monospace", size: 10 },
                            callback: function(val) { return currSym + (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val); }
                        },
                        grid: { color: 'rgba(51, 65, 85, 0.25)' }
                    }
                }
            }
        });
    }
}
window.renderBudgetAnalysis = renderBudgetAnalysis;

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

function getGoalPriorityWeight(priority) {
    const p = (priority || 'Medium').toLowerCase().trim();
    if (p === 'critical' || p === 'urgent') return 4;
    if (p === 'high') return 3;
    if (p === 'medium' || p === 'normal') return 2;
    if (p === 'low') return 1;
    return 2;
}
window.getGoalPriorityWeight = getGoalPriorityWeight;

function getGoalPriorityBadge(priority) {
    const p = (priority || 'Medium').toLowerCase().trim();
    if (p === 'critical' || p === 'urgent') {
        return '<span class="w-6 h-6 rounded-md border border-rose-500/50 bg-rose-500/20 text-rose-400 inline-flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.25)] transition-transform" title="Critical Priority (Click to cycle)"><i class="fa-solid fa-angles-up text-[10px]"></i></span>';
    }
    if (p === 'high') {
        return '<span class="w-6 h-6 rounded-md border border-amber-500/50 bg-amber-500/20 text-amber-400 inline-flex items-center justify-center transition-transform" title="High Priority (Click to cycle)"><i class="fa-solid fa-angle-up text-[11px] font-bold"></i></span>';
    }
    if (p === 'low') {
        return '<span class="w-6 h-6 rounded-md border border-slate-700 bg-surface-900 text-slate-400 inline-flex items-center justify-center transition-transform" title="Low Priority (Click to cycle)"><i class="fa-solid fa-angle-down text-[10px]"></i></span>';
    }
    return '<span class="w-6 h-6 rounded-md border border-brand-500/40 bg-brand-500/15 text-brand-400 inline-flex items-center justify-center transition-transform" title="Medium Priority (Click to cycle)"><i class="fa-solid fa-minus text-[10px]"></i></span>';
}
window.getGoalPriorityBadge = getGoalPriorityBadge;

function cycleGoalPriority(goalId, e) {
    if (e) e.stopPropagation();
    if (!db.goals) return;
    const g = db.goals.find(x => x.id === goalId);
    if (!g) return;
    const current = (g.priority || 'Medium').toLowerCase().trim();
    let next = 'Medium';
    if (current === 'critical' || current === 'urgent') next = 'High';
    else if (current === 'high') next = 'Medium';
    else if (current === 'medium' || current === 'normal') next = 'Low';
    else if (current === 'low') next = 'Critical';
    else next = 'High';

    g.priority = next;
    saveDatabase();
    renderGoalsTable();
    showToast(`Priority updated to ${next}`);
}
window.cycleGoalPriority = cycleGoalPriority;

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

        // PRIORITY-BASED SORTING: Critical > High > Medium > Low
        activeGoals.sort((a, b) => {
            const weightA = getGoalPriorityWeight(a.priority);
            const weightB = getGoalPriorityWeight(b.priority);
            if (weightB !== weightA) {
                return weightB - weightA; // Higher priority on top
            }
            if (a.targetDate && b.targetDate) {
                return (a.targetDate || '').localeCompare(b.targetDate || '');
            }
            return (b.id || '').localeCompare(a.id || '');
        });

        completedGoals.sort((a, b) => {
            const weightA = getGoalPriorityWeight(a.priority);
            const weightB = getGoalPriorityWeight(b.priority);
            if (weightB !== weightA) {
                return weightB - weightA;
            }
            return (b.id || '').localeCompare(a.id || '');
        });

        if (compCountBadge) compCountBadge.innerText = completedGoals.length.toString();
        if (compBadgeCount) compBadgeCount.innerText = `${completedGoals.length} Items`;

        const renderRow = (g, idx, isComp) => {
            const tr = document.createElement('tr');
            tr.className = 'group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0';

            const statusBadge = getStatusBadge(g.status, isComp);
            const priorityBadge = getGoalPriorityBadge(g.priority);
            
            let progressPct = parseInt(g.progress) || 0;
            if (cat === 'financial') {
                const est = parseFloat(g.estimate) || 0;
                const paid = parseFloat(g.paid) || 0;
                if (est > 0) progressPct = Math.min(100, Math.round((paid / est) * 100));
            }
            if (isComp) progressPct = 100;

            const trackGradients = {
                financial: 'from-amber-500 via-brand-500 to-amber-300 shadow-[0_0_14px_rgba(201,164,107,0.4)]',
                business: 'from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_14px_rgba(99,102,241,0.4)]',
                personal: 'from-cyan-500 via-teal-400 to-emerald-300 shadow-[0_0_14px_rgba(6,182,212,0.4)]',
                books: 'from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_14px_rgba(245,158,11,0.4)]',
                travel: 'from-sky-500 via-blue-500 to-teal-300 shadow-[0_0_14px_rgba(14,165,233,0.4)]',
                ziyara: 'from-emerald-600 via-teal-400 to-brand-400 shadow-[0_0_14px_rgba(16,185,129,0.4)]'
            };
            const barGradient = isComp 
                ? 'from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.5)]' 
                : (trackGradients[cat] || 'from-brand-600 via-brand-500 to-amber-300 shadow-[0_0_14px_rgba(201,164,107,0.4)]');

            const progressBarHtml = `
                <div class="flex items-center gap-3 w-full justify-center px-1">
                    <div class="flex-1 min-w-[180px] max-w-[320px] bg-surface-950/95 rounded-full h-4 sm:h-4.5 overflow-hidden border border-surface-700/90 p-0.5 shadow-inner">
                        <div class="h-full bg-gradient-to-r ${barGradient} rounded-full transition-all duration-500 flex items-center justify-end" style="width: ${progressPct}%">
                            ${progressPct >= 15 ? '<span class="w-1.5 h-1.5 rounded-full bg-white/90 mr-1.5 shadow-sm"></span>' : ''}
                        </div>
                    </div>
                    <span class="text-xs font-mono font-bold ${progressPct >= 100 ? 'text-emerald-400' : 'text-slate-200'} shrink-0 w-11 text-right">${progressPct}%</span>
                </div>
            `;

            const dataNotesHtml = `
                <button onclick="openMilestoneNotesModal('${g.id}')" class="w-8 h-8 rounded-xl bg-surface-900/90 hover:bg-brand-500/20 border border-surface-700 hover:border-brand-500 text-slate-400 hover:text-brand-400 transition-all inline-flex items-center justify-center cursor-pointer shadow-sm group/note" title="Open Milestone Notes & Documentation">
                    <i class="fa-regular fa-note-sticky text-xs group-hover/note:scale-110 transition-transform ${g.detailedNotes || g.notes ? 'text-brand-400' : ''}"></i>
                </button>
            `;

            const manageHtml = `
                <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="openGoalModal('${g.id}')" class="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Edit Milestone"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteGoal('${g.id}')" class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Delete Milestone"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            `;

            if (cat === 'financial') {
                const est = parseFloat(g.estimate || 0);
                const paid = parseFloat(g.paid || 0);
                tr.innerHTML = `
                    <td class="py-3 px-3 w-12 text-center font-mono text-xs text-slate-400">${idx + 1}</td>
                    <td class="py-3 px-3 w-16 text-center">
                        <button onclick="cycleGoalPriority('${g.id}', event)" class="cursor-pointer hover:scale-105 active:scale-95 transition-transform" title="Click to change priority">
                            ${priorityBadge}
                        </button>
                    </td>
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100 ${isComp ? 'line-through text-slate-500' : ''}">${g.title}</div>
                    </td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-400">${g.startDate || '-'}</td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300 font-medium">${g.targetDate || '-'}</td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300 text-right">₹${est.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td class="py-3 px-3 font-mono text-xs font-bold text-emerald-400 text-right">₹${paid.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td class="py-3 px-3 text-center">${progressBarHtml}</td>
                    <td class="py-3 px-3">${statusBadge}</td>
                    <td class="py-3 px-3 text-center">${dataNotesHtml}</td>
                    <td class="py-3 px-3 text-center">${manageHtml}</td>
                `;
            } else {
                const secondaryVal = g.genre || g.category || '-';
                tr.innerHTML = `
                    <td class="py-3 px-3 w-12 text-center font-mono text-xs text-slate-400">${idx + 1}</td>
                    <td class="py-3 px-3 w-16 text-center">
                        <button onclick="cycleGoalPriority('${g.id}', event)" class="cursor-pointer hover:scale-105 active:scale-95 transition-transform" title="Click to change priority">
                            ${priorityBadge}
                        </button>
                    </td>
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100 ${isComp ? 'line-through text-slate-500' : ''}">${g.title}</div>
                    </td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300">${secondaryVal}</td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300">${g.targetDate || '-'}</td>
                    <td class="py-3 px-3 text-center">${progressBarHtml}</td>
                    <td class="py-3 px-3">${statusBadge}</td>
                    <td class="py-3 px-3 text-center">${dataNotesHtml}</td>
                    <td class="py-3 px-3 text-center">${manageHtml}</td>
                `;
            }
            return tr;
        };

        activeGoals.forEach((g, idx) => activeTableBody.appendChild(renderRow(g, idx, false)));
        if (completedTableBody) {
            completedGoals.forEach((g, idx) => completedTableBody.appendChild(renderRow(g, idx, true)));
        }

        const colSpan = cat === 'financial' ? 11 : 9;
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
        { key: 'financial', label: 'Financial Milestones', icon: 'fa-coins', color: 'text-brand-500', barColor: 'bg-gradient-to-r from-amber-500 via-brand-500 to-amber-300 shadow-[0_0_12px_rgba(201,164,107,0.4)]', match: c => c === 'financial' },
        { key: 'business', label: 'Business Plans', icon: 'fa-briefcase', color: 'text-accent-blue', barColor: 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.4)]', match: c => c === 'business' },
        { key: 'personal', label: 'Personal Goals', icon: 'fa-user-astronaut', color: 'text-accent-cyan', barColor: 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]', match: c => c === 'personal' || c === 'health' },
        { key: 'books', label: 'Reading Goals', icon: 'fa-book', color: 'text-amber-400', barColor: 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]', match: c => c === 'reading' || c === 'books' },
        { key: 'travel', label: 'Travel Goals', icon: 'fa-plane', color: 'text-emerald-400', barColor: 'bg-gradient-to-r from-sky-500 via-blue-500 to-teal-300 shadow-[0_0_12px_rgba(14,165,233,0.4)]', match: c => c === 'travel' },
        { key: 'ziyara', label: 'Ziyara Milestones', icon: 'fa-kaaba', color: 'text-brand-400', barColor: 'bg-gradient-to-r from-emerald-600 via-teal-400 to-brand-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]', match: c => c === 'ziyara' }
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
                    <div class="w-full bg-surface-950 rounded-full h-3.5 sm:h-4 overflow-hidden border border-surface-700/80 p-0.5 shadow-inner">
                        <div class="h-full ${track.barColor} transition-all duration-500 rounded-full flex items-center justify-end" style="width: ${pct}%">
                            ${pct >= 20 ? '<span class="w-1.5 h-1.5 rounded-full bg-white/80 mr-1 shadow-sm"></span>' : ''}
                        </div>
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

        // Sort trajectory by priority
        activeList.sort((a, b) => {
            const weightA = getGoalPriorityWeight(a.priority);
            const weightB = getGoalPriorityWeight(b.priority);
            if (weightB !== weightA) return weightB - weightA;
            if (a.targetDate && b.targetDate) return (a.targetDate || '').localeCompare(b.targetDate || '');
            return (b.id || '').localeCompare(a.id || '');
        });

        if (activeList.length === 0) {
            activeTable.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-flag-checkered text-2xl mb-2 block opacity-40"></i> All milestones completed or no active targets logged.</td></tr>`;
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
                const priorityBadge = getGoalPriorityBadge(g.priority);
                
                tr.innerHTML = `
                    <td class="py-3 px-3 w-12 text-center font-mono text-xs text-slate-400">${idx + 1}</td>
                    <td class="py-3 px-3 w-16 text-center">
                        <button onclick="cycleGoalPriority('${g.id}', event)" class="cursor-pointer hover:scale-105 active:scale-95 transition-transform" title="Click to change priority">
                            ${priorityBadge}
                        </button>
                    </td>
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100">${g.title}</div>
                    </td>
                    <td class="py-3 px-3">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-mono bg-surface-800 text-brand-400 border border-surface-700">${catName}</span>
                    </td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300">${g.targetDate || '-'}</td>
                    <td class="py-3 px-3 text-center">
                        <div class="flex items-center gap-3 justify-center w-full min-w-[180px]">
                            <div class="flex-1 max-w-[280px] bg-surface-950/95 rounded-full h-4 overflow-hidden border border-surface-700/80 p-0.5 shadow-inner">
                                <div class="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-amber-300 rounded-full shadow-sm flex items-center justify-end" style="width: ${progressPct}%">
                                    ${progressPct >= 15 ? '<span class="w-1.5 h-1.5 rounded-full bg-white/90 mr-1 shadow-sm"></span>' : ''}
                                </div>
                            </div>
                            <span class="text-xs font-mono font-bold text-slate-200 shrink-0 w-10 text-right">${progressPct}%</span>
                        </div>
                    </td>
                    <td class="py-3 px-3 text-center">
                        <button onclick="openMilestoneNotesModal('${g.id}')" class="w-8 h-8 rounded-xl bg-surface-900/90 hover:bg-brand-500/20 border border-surface-700 hover:border-brand-500 text-slate-400 hover:text-brand-400 transition-all inline-flex items-center justify-center cursor-pointer shadow-sm group/note" title="Open Milestone Notes & Documentation">
                            <i class="fa-regular fa-note-sticky text-xs group-hover/note:scale-110 transition-transform ${g.detailedNotes || g.notes ? 'text-brand-400' : ''}"></i>
                        </button>
                    </td>
                    <td class="py-3 px-3 text-center">
                        <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="openGoalModal('${g.id}')" class="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Edit Milestone">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onclick="deleteGoal('${g.id}')" class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Delete Milestone">
                                <i class="fa-solid fa-trash text-xs"></i>
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
    const prioEl = document.getElementById('goalPriorityInput');
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
        if (prioEl) prioEl.value = goal.priority || 'Medium';
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
        if (prioEl) prioEl.value = 'Medium';
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
    const prioEl = document.getElementById('goalPriorityInput');
    const priority = prioEl ? prioEl.value : 'Medium';
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
            g.priority = priority;
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
            priority,
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
            const item = db.goals.find(x => x.id === id);
            const idx = db.goals.findIndex(x => x.id === id);
            if (item && typeof recordDeletion === 'function') {
                recordDeletion({
                    type: 'goal',
                    label: `Milestone: ${item.title || item.name || 'Goal'}`,
                    data: JSON.parse(JSON.stringify(item)),
                    originalIndex: idx
                });
            }
            db.goals = db.goals.filter(x => x.id !== id);
            saveDatabase();
            renderGoalsTable();
        }
    });
}
window.deleteGoal = deleteGoal;

/* =========================================================================
   MILESTONE NOTES & EXECUTIVE DOCUMENTATION WORKSPACE
   ========================================================================= */

function openMilestoneNotesModal(goalId) {
    if (!db.goals) db.goals = [];
    const g = db.goals.find(x => x.id === goalId);
    if (!g) return;

    // Set Goal ID
    const goalIdEl = document.getElementById('msNoteGoalId');
    if (goalIdEl) goalIdEl.value = g.id;

    // Set Milestone Title
    const titleEl = document.getElementById('msNoteMilestoneTitle');
    if (titleEl) titleEl.innerText = g.title || 'Milestone Documentation';

    // Track icon and Category badge
    const cat = (g.category || 'Financial').toLowerCase();
    const catBadge = document.getElementById('msNoteCategoryBadge');
    const trackIcon = document.getElementById('msNoteTrackIcon');
    const trackIconBox = document.getElementById('msNoteTrackIconBox');

    const trackMeta = {
        financial: { icon: 'fa-coins', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
        business: { icon: 'fa-briefcase', color: 'text-accent-blue', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
        personal: { icon: 'fa-user-astronaut', color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10' },
        reading: { icon: 'fa-book', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
        books: { icon: 'fa-book', color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
        travel: { icon: 'fa-plane', color: 'text-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-500/10' },
        ziyara: { icon: 'fa-kaaba', color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' }
    };
    const meta = trackMeta[cat] || trackMeta.financial;

    if (catBadge) {
        catBadge.innerText = capitalize(g.category || 'Financial');
        catBadge.className = `px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${meta.bg} ${meta.border} ${meta.color}`;
    }
    if (trackIcon) {
        trackIcon.className = `fa-solid ${meta.icon}`;
    }
    if (trackIconBox) {
        trackIconBox.className = `w-11 h-11 rounded-2xl ${meta.bg} ${meta.border} ${meta.color} flex items-center justify-center text-lg shadow-inner shrink-0`;
    }

    // Target Date
    const targetDateText = document.getElementById('msNoteTargetDateText');
    if (targetDateText) targetDateText.innerText = g.targetDate ? `Target: ${g.targetDate}` : 'No target date set';

    // Progress Bar
    let progressPct = parseInt(g.progress) || 0;
    if (cat === 'financial') {
        const est = parseFloat(g.estimate) || 0;
        const paid = parseFloat(g.paid) || 0;
        if (est > 0) progressPct = Math.min(100, Math.round((paid / est) * 100));
    }
    if (g.completed) progressPct = 100;

    const progBar = document.getElementById('msNoteProgressBar');
    const progText = document.getElementById('msNoteProgressText');
    if (progBar) progBar.style.width = `${progressPct}%`;
    if (progText) progText.innerText = `${progressPct}%`;

    // Populate Editor
    const editor = document.getElementById('msNoteEditor');
    if (editor) {
        editor.innerHTML = g.detailedNotes || g.notes || g.desc || '';
    }

    // Set Font Size
    const fontSizeSelect = document.getElementById('msNoteFontSizeSelect');
    if (fontSizeSelect) {
        fontSizeSelect.value = g.notesFontSize || '17px';
        applyMsNoteFontSize(fontSizeSelect.value);
    }

    updateMsNoteStats();
    openModal('milestoneNotesModal');

    // Auto-focus editor cleanly at the end
    setTimeout(() => {
        if (editor) {
            editor.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editor);
            range.collapse(false);
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }, 100);
}
window.openMilestoneNotesModal = openMilestoneNotesModal;

function saveMilestoneNotes() {
    const goalIdEl = document.getElementById('msNoteGoalId');
    const goalId = goalIdEl ? goalIdEl.value : null;
    if (!goalId) return;

    const g = (db.goals || []).find(x => x.id === goalId);
    if (!g) return;

    const editor = document.getElementById('msNoteEditor');
    const fontSizeSelect = document.getElementById('msNoteFontSizeSelect');

    const htmlContent = editor ? editor.innerHTML : '';
    const textContent = editor ? (editor.innerText || editor.textContent || '') : '';

    g.detailedNotes = htmlContent;
    if (fontSizeSelect) g.notesFontSize = fontSizeSelect.value;

    saveDatabase();
    renderGoalsTable();
    showToast('Milestone notes saved to cloud');
    closeModal('milestoneNotesModal');
}
window.saveMilestoneNotes = saveMilestoneNotes;

function updateMsNoteStats() {
    const editor = document.getElementById('msNoteEditor');
    const wordCountEl = document.getElementById('msNoteWordCount');
    const charCountEl = document.getElementById('msNoteCharCount');
    if (!editor) return;

    const text = editor.innerText || editor.textContent || '';
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;

    if (wordCountEl) wordCountEl.innerText = words.toString();
    if (charCountEl) charCountEl.innerText = chars.toString();
}
window.updateMsNoteStats = updateMsNoteStats;

function handleMsNoteProgressChange(val) {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    const progBar = document.getElementById('msNoteProgressBar');
    const progText = document.getElementById('msNoteProgressText');
    if (progBar) progBar.style.width = `${num}%`;
    if (progText) progText.innerText = `${num}%`;
}
window.handleMsNoteProgressChange = handleMsNoteProgressChange;

function handleMsNoteStatusChange(status) {
    const statusBadge = document.getElementById('msNoteStatusBadge');
    if (statusBadge) {
        statusBadge.innerText = status;
        if (status === 'Completed') {
            statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
            const progInput = document.getElementById('msNoteQuickProgressInput');
            if (progInput) {
                progInput.value = 100;
                handleMsNoteProgressChange(100);
            }
        } else if (status === 'In Progress') {
            statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-500/10 border border-brand-500/30 text-brand-400';
        } else {
            statusBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-surface-900 border border-surface-700 text-slate-400';
        }
    }
}
window.handleMsNoteStatusChange = handleMsNoteStatusChange;

function applyMsNoteFontFamily(fontKey) {
    const editor = document.getElementById('msNoteEditor');
    if (!editor) return;

    editor.classList.remove('note-font-inter', 'note-font-playfair', 'note-font-outfit', 'note-font-merriweather', 'note-font-lora', 'note-font-mono', 'note-font-caveat', 'note-font-cinzel');
    
    const fontClassMap = {
        inter: 'note-font-inter',
        playfair: 'note-font-playfair',
        outfit: 'note-font-outfit',
        merriweather: 'note-font-merriweather',
        lora: 'note-font-lora',
        mono: 'note-font-mono',
        caveat: 'note-font-caveat',
        cinzel: 'note-font-cinzel'
    };
    editor.classList.add(fontClassMap[fontKey] || 'note-font-inter');
}
window.applyMsNoteFontFamily = applyMsNoteFontFamily;

function applyMsNoteFontSize(sizeVal) {
    const editor = document.getElementById('msNoteEditor');
    if (!editor) return;
    editor.style.fontSize = sizeVal;
}
window.applyMsNoteFontSize = applyMsNoteFontSize;

function formatMsNoteText(cmd, value = null) {
    document.execCommand(cmd, false, value);
    const editor = document.getElementById('msNoteEditor');
    if (editor) editor.focus();
    updateMsNoteStats();
}
window.formatMsNoteText = formatMsNoteText;

function formatMsNoteHighlight() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    document.execCommand('hiliteColor', false, 'rgba(245, 158, 11, 0.35)');
    const editor = document.getElementById('msNoteEditor');
    if (editor) editor.focus();
}
window.formatMsNoteHighlight = formatMsNoteHighlight;

function formatMsNoteTextColor(colorHex) {
    document.execCommand('foreColor', false, colorHex);
    const editor = document.getElementById('msNoteEditor');
    if (editor) editor.focus();
}
window.formatMsNoteTextColor = formatMsNoteTextColor;

function formatMsNoteCodeBlock() {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selectedText = range.toString() || 'Code or execution snippet here...';
    
    const codeElem = document.createElement('pre');
    codeElem.className = 'p-3 my-2 rounded-xl bg-surface-900 border border-surface-700/80 font-mono text-xs text-brand-400 overflow-x-auto';
    codeElem.innerText = selectedText;
    
    range.deleteContents();
    range.insertNode(codeElem);
    updateMsNoteStats();
}
window.formatMsNoteCodeBlock = formatMsNoteCodeBlock;

function insertMsNoteChecklist() {
    const checkboxHtml = `<div class="flex items-center gap-2.5 my-1.5"><input type="checkbox" class="w-4 h-4 rounded border-surface-600 bg-surface-900 text-brand-500 focus:ring-brand-500 accent-amber-500 cursor-pointer"><span>Task step item...</span></div><p></p>`;
    document.execCommand('insertHTML', false, checkboxHtml);
    updateMsNoteStats();
}
window.insertMsNoteChecklist = insertMsNoteChecklist;

function insertMsNoteTimestamp() {
    const now = new Date();
    const formatted = `[${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}] `;
    document.execCommand('insertHTML', false, `<span class="font-mono text-xs text-amber-400 font-semibold">${formatted}</span>`);
    updateMsNoteStats();
}
window.insertMsNoteTimestamp = insertMsNoteTimestamp;

function insertMsNoteTemplate(type) {
    let templateHtml = '';
    if (type === 'action_plan') {
        templateHtml = `
            <h2 class="text-base font-bold text-brand-400 mb-2">🎯 Strategic Action Plan</h2>
            <p><strong>Primary Objective:</strong> Define key result here</p>
            <p><strong>Target Timeline:</strong> Phase 1 & Phase 2</p>
            <h3 class="text-sm font-semibold text-slate-200 mt-3 mb-1">Key Execution Milestones:</h3>
            <ul>
                <li>Phase 1: Initial research, requirements & budget allocation</li>
                <li>Phase 2: Execution, partner outreach, and active tracking</li>
                <li>Phase 3: Final delivery, review & milestone achievement</li>
            </ul>
            <p></p>
        `;
    } else if (type === 'checklist') {
        templateHtml = `
            <h2 class="text-base font-bold text-emerald-400 mb-2">📋 Action Checklist</h2>
            <div class="flex items-center gap-2.5 my-1.5"><input type="checkbox" class="w-4 h-4 rounded border-surface-600 bg-surface-900 accent-amber-500"><span>Finalize budget & allocate funds</span></div>
            <div class="flex items-center gap-2.5 my-1.5"><input type="checkbox" class="w-4 h-4 rounded border-surface-600 bg-surface-900 accent-amber-500"><span>Reach out to vendors / stakeholders</span></div>
            <div class="flex items-center gap-2.5 my-1.5"><input type="checkbox" class="w-4 h-4 rounded border-surface-600 bg-surface-900 accent-amber-500"><span>Complete checkpoint review 1</span></div>
            <div class="flex items-center gap-2.5 my-1.5"><input type="checkbox" class="w-4 h-4 rounded border-surface-600 bg-surface-900 accent-amber-500"><span>Achieve final completion</span></div>
            <p></p>
        `;
    } else if (type === 'checkpoint') {
        const d = new Date().toLocaleDateString('en-GB');
        templateHtml = `
            <h2 class="text-base font-bold text-cyan-400 mb-2">📅 Progress Checkpoint Log (${d})</h2>
            <p><strong>Current Status:</strong> On track</p>
            <p><strong>Progress Accomplished:</strong> Summary of achievements so far...</p>
            <p><strong>Blockers / Risks:</strong> None identified</p>
            <p><strong>Next Steps for This Week:</strong> Outline upcoming actions...</p>
            <p></p>
        `;
    } else if (type === 'financial') {
        templateHtml = `
            <h2 class="text-base font-bold text-amber-400 mb-2">💰 Financial & Budget Breakdown</h2>
            <p><strong>Total Estimate:</strong> ₹0.00</p>
            <p><strong>Paid / Invested to Date:</strong> ₹0.00</p>
            <p><strong>Balance Outstanding:</strong> ₹0.00</p>
            <h3 class="text-sm font-semibold text-slate-200 mt-3 mb-1">Expense Allocation:</h3>
            <ul>
                <li>Item 1: ₹0.00</li>
                <li>Item 2: ₹0.00</li>
                <li>Contingency Buffer: ₹0.00</li>
            </ul>
            <p></p>
        `;
    }
    document.execCommand('insertHTML', false, templateHtml);
    updateMsNoteStats();
}
window.insertMsNoteTemplate = insertMsNoteTemplate;

function copyMilestoneNotesToClipboard() {
    const editor = document.getElementById('msNoteEditor');
    const text = editor ? (editor.innerText || editor.textContent || '') : '';
    if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Notes copied to clipboard');
        }).catch(() => {
            showToast('Could not copy notes');
        });
    } else {
        showToast('No content to copy');
    }
}
window.copyMilestoneNotesToClipboard = copyMilestoneNotesToClipboard;

function printMilestoneNotes() {
    const title = document.getElementById('msNoteMilestoneTitle')?.innerText || 'Milestone Notes';
    const content = document.getElementById('msNoteEditor')?.innerHTML || '';
    const win = window.open('', '_blank');
    if (!win) {
        showToast('Popup blocked by browser. Please allow popups.');
        return;
    }
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
                h1 { font-size: 24px; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                h2 { font-size: 18px; margin-top: 20px; }
                pre { background: #f4f4f4; padding: 12px; border-radius: 8px; font-family: monospace; }
                ul, ol { padding-left: 24px; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <div>${content}</div>
            <script>window.print();<\/script>
        </body>
        </html>
    `);
    win.document.close();
}
window.printMilestoneNotes = printMilestoneNotes;

function toggleMilestoneNotesFullscreen() {
    const card = document.getElementById('milestoneNotesCard');
    const icon = document.getElementById('iconMsNotesExpand');
    if (!card) return;

    if (card.classList.contains('max-w-6xl')) {
        card.classList.remove('max-w-6xl', 'h-[96vh]');
        card.classList.add('w-full', 'h-full', 'rounded-none', 'max-w-none');
        if (icon) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        }
    } else {
        card.classList.add('max-w-6xl', 'h-[96vh]');
        card.classList.remove('w-full', 'h-full', 'rounded-none', 'max-w-none');
        if (icon) {
            icon.classList.add('fa-expand');
            icon.classList.remove('fa-compress');
        }
    }
}
window.toggleMilestoneNotesFullscreen = toggleMilestoneNotesFullscreen;

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
            const idxA = db.notes.indexOf(a);
            const idxB = db.notes.indexOf(b);
            return idxA - idxB;
        } else if (sortBy === 'custom') {
            const idxA = db.notes.indexOf(a);
            const idxB = db.notes.indexOf(b);
            return idxA - idxB;
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
                card.setAttribute('draggable', 'true');
                card.setAttribute('data-note-id', note.id);
                card.ondragstart = (e) => handleNoteDragStart(e, note.id);
                card.ondragover = (e) => handleNoteDragOver(e);
                card.ondragleave = (e) => handleNoteDragLeave(e);
                card.ondrop = (e) => handleNoteDrop(e, note.id);
                card.ondragend = (e) => handleNoteDragEnd(e);
                card.onclick = (e) => {
                    if (e.target.closest('button') || e.target.closest('.note-drag-handle')) return;
                    openNoteReader(note.id);
                };

                card.innerHTML = `
                    <!-- Accent top glow bar -->
                    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.gradient}"></div>
                    
                    <div class="space-y-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="note-drag-handle cursor-grab active:cursor-grabbing text-slate-500/60 hover:text-amber-400 p-1 -ml-1 transition-colors shrink-0" title="Drag to rearrange" onclick="event.stopPropagation()">
                                    <i class="fa-solid fa-grip-vertical text-xs"></i>
                                </span>
                                ${isPinned ? `<span class="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-[10px] shrink-0" title="Pinned Note"><i class="fa-solid fa-thumbtack"></i></span>` : ''}
                                <h4 class="font-display text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1 ${fontClass}">${note.title || 'Untitled Note'}</h4>
                            </div>
                            <!-- Quick Action Buttons on Hover -->
                            <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onclick="event.stopPropagation()">
                                <button onclick="openUniversalShare('note', '${note.id}', event)" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer" title="Share Options">
                                    <i class="fa-solid fa-share-nodes text-xs"></i>
                                </button>
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
                tr.setAttribute('draggable', 'true');
                tr.setAttribute('data-note-id', note.id);
                tr.ondragstart = (e) => handleNoteDragStart(e, note.id);
                tr.ondragover = (e) => handleNoteDragOver(e);
                tr.ondragleave = (e) => handleNoteDragLeave(e);
                tr.ondrop = (e) => handleNoteDrop(e, note.id);
                tr.ondragend = (e) => handleNoteDragEnd(e);
                tr.onclick = (e) => {
                    if (e.target.closest('button') || e.target.closest('.note-drag-handle')) return;
                    openNoteReader(note.id);
                };

                tr.innerHTML = `
                    <td class="p-4 text-center" onclick="event.stopPropagation()">
                        <div class="flex items-center justify-center gap-1.5">
                            <span class="note-drag-handle cursor-grab active:cursor-grabbing text-slate-500/60 hover:text-amber-400 p-1 transition-colors" title="Drag to rearrange">
                                <i class="fa-solid fa-grip-vertical text-xs"></i>
                            </span>
                            <button onclick="toggleNotePin('${note.id}')" class="p-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer">
                                <i class="fa-solid fa-thumbtack ${isPinned ? 'text-amber-400' : 'opacity-30'}"></i>
                            </button>
                        </div>
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
                            <button onclick="openUniversalShare('note', '${note.id}', event)" class="w-7 h-7 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer" title="Share Options"><i class="fa-solid fa-share-nodes text-xs"></i></button>
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

// NOTE DRAG AND DROP REORDER HANDLERS
let draggedNoteId = null;

function handleNoteDragStart(e, noteId) {
    draggedNoteId = noteId;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', noteId);
    }
    
    const el = e.currentTarget;
    if (el) {
        setTimeout(() => {
            el.classList.add('opacity-40', 'scale-[0.98]', 'ring-2', 'ring-amber-500/50');
        }, 0);
    }
}
window.handleNoteDragStart = handleNoteDragStart;

function handleNoteDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
    const target = e.currentTarget;
    if (target && !target.classList.contains('note-drag-target')) {
        target.classList.add('note-drag-target', 'border-amber-400', 'ring-2', 'ring-amber-400/50', 'scale-[1.01]', '-translate-y-0.5');
    }
}
window.handleNoteDragOver = handleNoteDragOver;

function handleNoteDragLeave(e) {
    const target = e.currentTarget;
    if (target) {
        target.classList.remove('note-drag-target', 'border-amber-400', 'ring-2', 'ring-amber-400/50', 'scale-[1.01]', '-translate-y-0.5');
    }
}
window.handleNoteDragLeave = handleNoteDragLeave;

function handleNoteDrop(e, targetNoteId) {
    e.preventDefault();
    const target = e.currentTarget;
    if (target) {
        target.classList.remove('note-drag-target', 'border-amber-400', 'ring-2', 'ring-amber-400/50', 'scale-[1.01]', '-translate-y-0.5');
    }

    const sourceId = (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null) || draggedNoteId;
    if (!sourceId || !targetNoteId || sourceId === targetNoteId) {
        return;
    }

    if (!db.notes || !Array.isArray(db.notes)) return;

    const fromIndex = db.notes.findIndex(n => n.id === sourceId);
    const toIndex = db.notes.findIndex(n => n.id === targetNoteId);

    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
        const [movedNote] = db.notes.splice(fromIndex, 1);
        db.notes.splice(toIndex, 0, movedNote);

        const sortSelect = document.getElementById('notesSortSelect');
        if (sortSelect && sortSelect.value !== 'pinned' && sortSelect.value !== 'custom') {
            sortSelect.value = 'custom';
        }

        saveDatabase();
        renderNotesList();
        if (typeof showToast === 'function') {
            showToast('✋ Note rearranged');
        }
    }
}
window.handleNoteDrop = handleNoteDrop;

function handleNoteDragEnd(e) {
    draggedNoteId = null;
    document.querySelectorAll('.note-drag-target').forEach(el => {
        el.classList.remove('note-drag-target', 'border-amber-400', 'ring-2', 'ring-amber-400/50', 'scale-[1.01]', '-translate-y-0.5');
    });
    const el = e.currentTarget;
    if (el) {
        el.classList.remove('opacity-40', 'scale-[0.98]', 'ring-2', 'ring-amber-500/50');
    }
}
window.handleNoteDragEnd = handleNoteDragEnd;

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
            icon.className = 'fa-solid fa-thumbtack text-xs text-amber-300';
            btn.setAttribute('title', 'Click to unpin note');
            if (typeof showToast === 'function') showToast('📌 Note will be pinned to top');
        } else {
            btn.className = 'px-3 py-1.5 rounded-xl border border-surface-700 bg-surface-900 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm';
            label.innerText = 'Pin';
            icon.className = 'fa-solid fa-thumbtack text-xs';
            btn.setAttribute('title', 'Pin Note to Top');
            if (typeof showToast === 'function') showToast('Note will be unpinned');
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
        
        // Synchronize Note Reader UI if currently viewing this note
        const curIdEl = document.getElementById('currentViewNoteId');
        if (curIdEl && curIdEl.value === id) {
            const pinBadge = document.getElementById('viewNotePinBadge');
            const pinBtn = document.getElementById('btnToggleViewNotePin');
            const pinIcon = document.getElementById('viewNotePinBtnIcon');
            if (pinBadge) {
                if (note.pinned) pinBadge.classList.remove('hidden');
                else pinBadge.classList.add('hidden');
            }
            if (pinBtn && pinIcon) {
                if (note.pinned) {
                    pinBtn.classList.remove('border-surface-700', 'text-slate-400');
                    pinBtn.classList.add('border-amber-500/50', 'bg-amber-500/20', 'text-amber-300');
                    pinBtn.setAttribute('title', 'Unpin Note');
                    pinIcon.className = 'fa-solid fa-thumbtack text-sm md:text-base text-amber-300';
                } else {
                    pinBtn.classList.remove('border-amber-500/50', 'bg-amber-500/20', 'text-amber-300');
                    pinBtn.classList.add('border-surface-700', 'text-slate-400');
                    pinBtn.setAttribute('title', 'Pin Note to Top');
                    pinIcon.className = 'fa-solid fa-thumbtack text-sm md:text-base';
                }
            }
        }

        if (typeof showToast === 'function') {
            showToast(note.pinned ? '📌 Note pinned to top' : '📌 Note unpinned');
        }
    }
}
window.toggleNotePin = toggleNotePin;

function toggleCurrentViewNotePin() {
    const idEl = document.getElementById('currentViewNoteId');
    const id = idEl ? idEl.value : null;
    if (id) {
        toggleNotePin(id);
    }
}
window.toggleCurrentViewNotePin = toggleCurrentViewNotePin;

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

// AUTO-CAPITALIZATION HANDLERS FOR NOTES
function capitalizeFirstLetter(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
window.capitalizeFirstLetter = capitalizeFirstLetter;

function handleNoteTitleInput(el) {
    if (!el) return;
    const val = el.value;
    if (!val) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    // Auto-capitalize the first letter and letters after sentence terminators (. ! ? :)
    const newVal = val.replace(/(^\s*|[.!?:]\s+)([a-z\u00E0-\u00FC])/g, (match, prefix, letter) => {
        return prefix + letter.toUpperCase();
    });

    if (newVal !== val) {
        el.value = newVal;
        if (start !== null && end !== null) {
            el.setSelectionRange(start, end);
        }
    }
}
window.handleNoteTitleInput = handleNoteTitleInput;

function handleNoteEditorInput(e) {
    // If deletion or history undo/redo, only update stats
    if (e && e.inputType && (e.inputType.startsWith('delete') || e.inputType.startsWith('history'))) {
        updateNoteStats();
        return;
    }

    try {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
            const node = sel.anchorNode;
            const offset = sel.anchorOffset;

            if (node && node.nodeType === Node.TEXT_NODE && offset > 0) {
                const text = node.nodeValue || '';
                const charTyped = text.charAt(offset - 1);

                // If the character just typed is a lowercase letter
                if (charTyped && charTyped.toLowerCase() !== charTyped.toUpperCase() && charTyped === charTyped.toLowerCase()) {
                    const before = text.substring(0, offset - 1);
                    
                    // Check if at start of text (allowing leading whitespace)
                    const isStart = /^\s*$/.test(before);
                    // Check if after punctuation (. ! ? :) followed by optional spaces
                    const isAfterPunct = /[.!?:\n]\s*$/.test(before);

                    // Check if parent block is beginning of a new paragraph/div/li
                    let isBlockStart = false;
                    if (isStart) {
                        let p = node.parentNode;
                        while (p && p.id !== 'noteEditor') {
                            if (/^(P|DIV|LI|H1|H2|H3|H4|BLOCKQUOTE|SECTION)$/i.test(p.tagName)) {
                                isBlockStart = true;
                                break;
                            }
                            p = p.parentNode;
                        }
                        if (!p || p.id === 'noteEditor') isBlockStart = true;
                    }

                    if (isStart || isAfterPunct || isBlockStart) {
                        const upper = charTyped.toUpperCase();
                        const newText = before + upper + text.substring(offset);
                        node.nodeValue = newText;

                        // Seamlessly restore cursor position right after the capitalized character
                        const range = document.createRange();
                        range.setStart(node, offset);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            }
        }
    } catch (err) {
        console.warn('Note auto-capitalization error handled:', err);
    }

    updateNoteStats();
}
window.handleNoteEditorInput = handleNoteEditorInput;

// NOTE MODAL MAXIMIZE / FULLSCREEN TOGGLE
let isNoteModalMaximized = false;
let isNoteViewModalMaximized = false;

function toggleNoteModalMaximize(forceState = null) {
    if (forceState !== null) {
        isNoteModalMaximized = forceState;
    } else {
        isNoteModalMaximized = !isNoteModalMaximized;
    }

    const modal = document.getElementById('noteModal');
    const container = document.getElementById('noteModalContainer');
    const icon = document.getElementById('noteModalMaxIcon');
    const btn = document.getElementById('btnToggleNoteModalMaximize');

    if (!container || !modal) return;

    if (isNoteModalMaximized) {
        modal.classList.remove('p-2', 'sm:p-4', 'md:p-6');
        modal.classList.add('p-0');
        
        container.classList.remove('max-w-6xl', 'h-[94vh]', 'max-h-[960px]', 'rounded-2xl', 'md:rounded-3xl', 'm-auto');
        container.classList.add('max-w-none', 'w-full', 'h-full', 'max-h-none', 'rounded-none', 'border-0');
        
        if (icon) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        }
        if (btn) btn.setAttribute('title', 'Restore Modal Window');
        try { localStorage.setItem('note_modal_maximized', 'true'); } catch(e) {}
    } else {
        modal.classList.remove('p-0');
        modal.classList.add('p-2', 'sm:p-4', 'md:p-6');
        
        container.classList.remove('max-w-none', 'max-h-none', 'rounded-none', 'border-0');
        container.classList.add('max-w-6xl', 'w-full', 'h-[94vh]', 'max-h-[960px]');
        
        if (icon) {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
        }
        if (btn) btn.setAttribute('title', 'Maximize to Full Page');
        try { localStorage.setItem('note_modal_maximized', 'false'); } catch(e) {}
    }
}
window.toggleNoteModalMaximize = toggleNoteModalMaximize;

function toggleNoteViewModalMaximize(forceState = null) {
    if (forceState !== null) {
        isNoteViewModalMaximized = forceState;
    } else {
        isNoteViewModalMaximized = !isNoteViewModalMaximized;
    }

    const modal = document.getElementById('noteViewModal');
    const wrapper = document.getElementById('viewNoteWrapper');
    const icon = document.getElementById('noteViewMaxIcon');
    const btn = document.getElementById('btnToggleNoteViewMaximize');

    if (!wrapper || !modal) return;

    if (isNoteViewModalMaximized) {
        modal.classList.remove('p-2', 'sm:p-4', 'md:p-6', 'lg:p-8', 'p-3', 'md:p-8');
        modal.classList.add('p-0');
        
        wrapper.classList.remove('max-w-6xl', 'xl:max-w-7xl', 'max-w-4xl', 'max-h-[92vh]', 'max-h-[88vh]', 'rounded-[2rem]');
        wrapper.classList.add('max-w-none', 'h-full', 'max-h-none', 'rounded-none');
        
        if (icon) {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        }
        if (btn) btn.setAttribute('title', 'Restore Reader Window');
    } else {
        modal.classList.remove('p-0');
        modal.classList.add('p-2', 'sm:p-4', 'md:p-6', 'lg:p-8');
        
        wrapper.classList.remove('max-w-none', 'max-h-none', 'rounded-none');
        wrapper.classList.add('max-w-6xl', 'xl:max-w-7xl', 'w-full', 'h-full', 'max-h-[92vh]', 'rounded-[2rem]');
        
        if (icon) {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
        }
        if (btn) btn.setAttribute('title', 'Maximize to Full Page');
    }
}
window.toggleNoteViewModalMaximize = toggleNoteViewModalMaximize;

function openNoteModal(id = null) {
    const idEl = document.getElementById('noteId');
    if (idEl) idEl.value = id || '';
    
    // Check saved maximize preference
    try {
        const savedMax = localStorage.getItem('note_modal_maximized');
        if (savedMax === 'true') {
            toggleNoteModalMaximize(true);
        } else {
            toggleNoteModalMaximize(false);
        }
    } catch(e) {}
    
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
            if (titleInput) titleInput.value = capitalizeFirstLetter(n.title || '');
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
    const title = titleInput ? capitalizeFirstLetter(titleInput.value.trim() || 'Untitled Note') : 'Untitled Note';
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
    const pinBtn = document.getElementById('btnToggleViewNotePin');
    const pinIcon = document.getElementById('viewNotePinBtnIcon');
    const wordCountEl = document.getElementById('viewNoteWordCount');
    const wrapper = document.getElementById('viewNoteWrapper');
    const glow = document.getElementById('viewNoteGlow');

    const colorKey = n.accentColor || 'gold';
    const theme = noteThemeMap[colorKey] || noteThemeMap['gold'];
    const fontClass = noteFontMap[n.fontFamily] || 'note-font-inter';

    if (wrapper) {
        if (isNoteViewModalMaximized) {
            wrapper.className = `max-w-none w-full h-full max-h-none rounded-none p-[2px] bg-gradient-to-br ${theme.gradient} shadow-none relative group`;
        } else {
            wrapper.className = `max-w-6xl xl:max-w-7xl w-full h-full max-h-[92vh] rounded-[2rem] p-[2px] bg-gradient-to-br ${theme.gradient} shadow-[0_0_60px_rgba(201,164,107,0.25)] relative group transition-all duration-300`;
        }
    }
    if (glow) {
        glow.className = `absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-[2rem] blur-2xl opacity-25 group-hover:opacity-45 transition-opacity duration-700 -z-10`;
    }

    if (pinBadge) {
        if (n.pinned) pinBadge.classList.remove('hidden');
        else pinBadge.classList.add('hidden');
    }

    if (pinBtn && pinIcon) {
        if (n.pinned) {
            pinBtn.classList.remove('border-surface-700', 'text-slate-400');
            pinBtn.classList.add('border-amber-500/50', 'bg-amber-500/20', 'text-amber-300');
            pinBtn.setAttribute('title', 'Unpin Note');
            pinIcon.className = 'fa-solid fa-thumbtack text-sm md:text-base text-amber-300';
        } else {
            pinBtn.classList.remove('border-amber-500/50', 'bg-amber-500/20', 'text-amber-300');
            pinBtn.classList.add('border-surface-700', 'text-slate-400');
            pinBtn.setAttribute('title', 'Pin Note to Top');
            pinIcon.className = 'fa-solid fa-thumbtack text-sm md:text-base';
        }
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
    window.currentViewNoteId = n.id;

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
        if (!db.notes) return;
        const item = db.notes.find(x => x.id === id);
        const idx = db.notes.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'note',
                label: `Note: ${item.title || 'Untitled Note'}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
        db.notes = db.notes.filter(x => x.id !== id);
        saveDatabase();
        renderNotesList();
    });
}
window.deleteNote = deleteNote;

let currentReminderFilter = 'all';
let currentReminderViewMode = localStorage.getItem('executive_reminder_view_mode') || 'cards';

function isReminderOverdue(r) {
    if (r.completed || r.status === 'completed') return false;
    const targetDate = r.remindDate || r.date;
    if (!targetDate) return false;
    let dStr = targetDate;
    if (dStr.includes('/')) {
        const p = dStr.split('/');
        if (p.length === 3) dStr = `${p[2]}-${p[1]}-${p[0]}`;
    }
    const timeStr = r.time || '23:59';
    const due = new Date(`${dStr}T${timeStr}:00`);
    return !isNaN(due.getTime()) && due < new Date();
}

function isReminderToday(r) {
    const targetDate = r.remindDate || r.date;
    if (!targetDate) return false;
    let dStr = targetDate;
    if (dStr.includes('/')) {
        const p = dStr.split('/');
        if (p.length === 3) dStr = `${p[2]}-${p[1]}-${p[0]}`;
    }
    const today = new Date().toISOString().split('T')[0];
    return dStr === today;
}

function setReminderFilter(filter) {
    currentReminderFilter = filter;
    
    // Highlight active sub-navigation heading button
    const mapBtn = {
        all: 'btnReminderSubAll',
        active: 'btnReminderSubActive',
        high: 'btnReminderSubHigh',
        overdue: 'btnReminderSubOverdue',
        completed: 'btnReminderSubCompleted'
    };

    Object.keys(mapBtn).forEach(f => {
        const btn = document.getElementById(mapBtn[f]);
        if (btn) {
            if (f === filter) {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r from-brand-600 to-brand-700 text-surface-950 font-bold transition-all whitespace-nowrap shadow-[0_4px_15px_rgba(201,164,107,0.25)] flex items-center gap-2 border border-brand-500/30 cursor-pointer';
            } else {
                btn.className = 'px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-wider bg-gradient-to-r from-surface-900 to-surface-800 border border-surface-700/80 text-slate-400 hover:text-white transition-all whitespace-nowrap flex items-center gap-2 shadow-sm cursor-pointer';
            }
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
    const targetDate = r.remindDate || r.date;
    if (targetDate) {
        let dStr = targetDate;
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
    r.remindDate = newDDMMYYYY;
    r.date = newDDMMYYYY;
    r.notified24h = false;
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

    // Update Sub-navigation Counts & stats
    const allStat = document.getElementById('remindersAllStat');
    const activeStat = document.getElementById('remindersActiveStat');
    const highStat = document.getElementById('remindersHighStat');
    const overdueStat = document.getElementById('remindersOverdueStat');
    const completedStat = document.getElementById('remindersCompletedStat');
    const completionRateEl = document.getElementById('remindersCompletionRate');

    if (allStat) allStat.innerText = totalAll.toString();
    if (activeStat) activeStat.innerText = totalActive.toString();
    if (highStat) highStat.innerText = totalHigh.toString();
    if (overdueStat) overdueStat.innerText = totalOverdue.toString();
    if (completedStat) completedStat.innerText = totalCompleted.toString();
    if (completionRateEl) completionRateEl.innerText = `${completionRate}% Done`;

    // Search query & clear button visibility
    const searchInput = document.getElementById('reminderSearchInput');
    const clearBtn = document.getElementById('btnClearReminderSearch');
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    if (clearBtn) {
        if (q) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }

    // Sort by Remind Date & Priority
    let list = [...db.reminders].sort((a, b) => {
        const isCompA = a.completed || a.status === 'completed';
        const isCompB = b.completed || b.status === 'completed';
        if (isCompA !== isCompB) return isCompA ? 1 : -1;

        const dateTargetA = a.remindDate || a.date || '';
        const dateTargetB = b.remindDate || b.date || '';
        const dateA = dateTargetA ? (dateTargetA.includes('/') ? dateTargetA.split('/').reverse().join('-') : dateTargetA) : '';
        const dateB = dateTargetB ? (dateTargetB.includes('/') ? dateTargetB.split('/').reverse().join('-') : dateTargetB) : '';
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
            (r.remindDate && r.remindDate.toLowerCase().includes(q)) ||
            (r.entryDate && r.entryDate.toLowerCase().includes(q)) ||
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
                const remindDateStr = r.remindDate || r.date || '';
                const entryDateStr = r.entryDate || (r.createdAt ? formatToDDMMYYYY(r.createdAt.split('T')[0]) : remindDateStr);

                // Date Parsing for Date Box
                let dayNum = '--';
                let monthStr = 'ALERT';
                let dayOfWeek = '';
                if (remindDateStr) {
                    let dStr = remindDateStr;
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
                                <span class="flex items-center gap-1.5 text-brand-300 font-semibold" title="Remind Date (Alert Date)">
                                    <i class="fa-regular fa-bell text-[10px] text-amber-400"></i>
                                    <span>Remind: ${dayOfWeek ? dayOfWeek + ', ' : ''}${formatToDDMMYYYY(remindDateStr)}</span>
                                </span>
                                ${r.time ? `<span class="flex items-center gap-1 text-slate-300"><i class="fa-regular fa-clock text-[9px] text-brand-400"></i>${r.time}</span>` : ''}
                                <span class="flex items-center gap-1 text-slate-500 text-[10px]" title="Entry Date (Data logged)">
                                    <i class="fa-solid fa-pen-nib text-[9px] text-slate-500"></i>
                                    <span>Entry: ${formatToDDMMYYYY(entryDateStr)}</span>
                                </span>
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
            body.innerHTML = `<tr><td colspan="6" class="p-12 text-center text-slate-500 font-light text-xs"><i class="fa-regular fa-calendar-check text-3xl mb-3 block opacity-40"></i> No reminders found matching the current filter.</td></tr>`;
        } else {
            list.forEach(r => {
                const isComp = r.completed || r.status === 'completed';
                const isOverdue = isReminderOverdue(r);
                const remindDateStr = r.remindDate || r.date || '';
                const entryDateStr = r.entryDate || (r.createdAt ? formatToDDMMYYYY(r.createdAt.split('T')[0]) : remindDateStr);

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
                        <div class="flex items-center gap-1.5 text-brand-300 font-semibold">
                            <i class="fa-regular fa-bell text-[10px] text-amber-400"></i>
                            <span>${formatToDDMMYYYY(remindDateStr)}</span>
                        </div>
                        ${r.time ? `<div class="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5"><i class="fa-regular fa-clock text-[9px] text-brand-400"></i><span>${r.time}</span></div>` : ''}
                        ${isOverdue && !isComp ? `<span class="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold font-mono uppercase tracking-wider">Overdue</span>` : ''}
                    </td>
                    <td class="py-3 px-4 font-mono text-xs text-slate-400">
                        <div class="flex items-center gap-1.5 text-slate-400">
                            <i class="fa-solid fa-pen-nib text-[9px] text-slate-500"></i>
                            <span>${formatToDDMMYYYY(entryDateStr)}</span>
                        </div>
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
    const entryDateInput = document.getElementById('reminderEntryDateInput');
    const dueDateInput = document.getElementById('reminderDueDateInput');
    const legacyDateInput = document.getElementById('reminderDateInput');
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
            
            const rEntry = r.entryDate || (r.createdAt ? formatToDDMMYYYY(r.createdAt.split('T')[0]) : (r.date || todayFormatted));
            const rDue = r.remindDate || r.date || todayFormatted;

            if (entryDateInput) {
                if (entryDateInput._flatpickr) {
                    entryDateInput._flatpickr.setDate(rEntry.includes('-') ? rEntry.split('-').reverse().join('/') : rEntry);
                } else {
                    entryDateInput.value = rEntry;
                }
            }
            if (dueDateInput) {
                if (dueDateInput._flatpickr) {
                    dueDateInput._flatpickr.setDate(rDue.includes('-') ? rDue.split('-').reverse().join('/') : rDue);
                } else {
                    dueDateInput.value = rDue;
                }
            }
            if (legacyDateInput) legacyDateInput.value = rDue;

            if (timeInput) timeInput.value = r.time || '';
            if (prioInput) prioInput.value = r.priority || r.category || 'Medium';
            if (repInput) repInput.value = r.repeat || 'None';
            if (notesInput) notesInput.value = r.notes || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Reminder';
        if (titleInput) titleInput.value = '';
        if (entryDateInput) {
            if (entryDateInput._flatpickr) {
                entryDateInput._flatpickr.setDate(new Date());
            } else {
                entryDateInput.value = todayFormatted;
            }
        }
        if (dueDateInput) {
            if (dueDateInput._flatpickr) {
                dueDateInput._flatpickr.setDate(new Date());
            } else {
                dueDateInput.value = todayFormatted;
            }
        }
        if (legacyDateInput) legacyDateInput.value = todayFormatted;
        if (timeInput) timeInput.value = '09:00';
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
        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        const now = ctx.currentTime;

        const playTone = (freq, startTime, duration, gainLevel, type = 'sine') => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        // Multi-Pulse Executive Alert Alarm Sound (Crisp, resonant & recognizable alert chime)
        // Pulse 1: Alert intro pulse
        playTone(784.00, now, 0.12, 0.32, 'sine'); // G5
        playTone(1568.00, now, 0.09, 0.10, 'triangle');

        // Pulse 2: Rising alert pulse
        playTone(880.00, now + 0.13, 0.13, 0.35, 'sine'); // A5
        playTone(1760.00, now + 0.13, 0.09, 0.10, 'triangle');

        // Pulse 3: Secondary alert pulse
        playTone(880.00, now + 0.28, 0.14, 0.36, 'sine'); // A5
        playTone(1760.00, now + 0.28, 0.10, 0.11, 'triangle');

        // Pulse 4: Resonant Bright Alarm Ring Finale (High C6 with E6 harmony and crystalline overtone)
        playTone(1046.50, now + 0.44, 0.75, 0.40, 'sine'); // C6
        playTone(1318.51, now + 0.46, 0.58, 0.16, 'sine'); // E6
        playTone(2093.00, now + 0.44, 0.45, 0.14, 'triangle'); // C7 overtone
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
    
    // Entry Date (Date of data logging)
    const entryDateInput = document.getElementById('reminderEntryDateInput');
    let entryDate = entryDateInput ? entryDateInput.value.trim() : '';
    if (entryDate && entryDate.includes('-')) {
        const p = entryDate.split('-');
        if (p.length === 3) entryDate = `${p[2]}/${p[1]}/${p[0]}`;
    }

    // Remind Date (Date when reminder alert is targeted)
    const dueDateInput = document.getElementById('reminderDueDateInput') || document.getElementById('reminderDateInput');
    let remindDate = dueDateInput ? dueDateInput.value.trim() : '';
    if (remindDate && remindDate.includes('-')) {
        const p = remindDate.split('-');
        if (p.length === 3) remindDate = `${p[2]}/${p[1]}/${p[0]}`;
    }

    const todayFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!entryDate) entryDate = todayFormatted;
    if (!remindDate) remindDate = entryDate || todayFormatted;

    const titleInput = document.getElementById('reminderTitleInput');
    const title = titleInput ? (titleInput.value.trim() || 'Reminder') : 'Reminder';
    const timeInput = document.getElementById('reminderTimeInput');
    const time = timeInput ? (timeInput.value.trim() || '09:00') : '09:00';
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
            r.entryDate = entryDate;
            r.remindDate = remindDate;
            r.date = remindDate; // maintain compatibility
            r.time = time;
            r.title = title;
            r.priority = priority;
            r.category = priority;
            r.repeat = repeat;
            r.notes = notes;
            r.notified24h = false;
            r.notifiedDue = false;
        }
    } else {
        db.reminders.push({
            id: Date.now().toString(),
            entryDate,
            remindDate,
            date: remindDate,
            time,
            title,
            priority,
            category: priority,
            repeat,
            notes,
            status: 'active',
            completed: false,
            notified24h: false,
            notifiedDue: false,
            createdAt: new Date().toISOString()
        });
    }

    saveDatabase();
    // Re-check reminders so if the created reminder is already within the 24h window, it gets triggered properly
    if (typeof checkReminders === 'function') checkReminders();

    renderRemindersTable();
    closeModal('reminderModal');
    showToast(isNew ? 'Reminder scheduled' : 'Reminder updated');
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
            desc: `Target date ${r.remindDate || r.date} marked as completed`,
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
            const item = db.reminders.find(x => x.id === id);
            const idx = db.reminders.findIndex(x => x.id === id);
            if (item && typeof recordDeletion === 'function') {
                recordDeletion({
                    type: 'reminder',
                    label: `Reminder: ${item.title || 'Reminder Item'}`,
                    data: JSON.parse(JSON.stringify(item)),
                    originalIndex: idx
                });
            }
            db.reminders = db.reminders.filter(x => x.id !== id);
            saveDatabase();
            renderRemindersTable();
            renderNotifications();
        }
    });
}
window.deleteReminder = deleteReminder;

function checkReminders() {
    if (!db.reminders) return;
    const now = new Date();
    const nowTime = now.getTime();
    let triggerCount = 0;

    db.reminders.forEach(r => {
        if (!r.completed && r.status !== 'completed') {
            const targetDateStr = r.remindDate || r.date;
            if (!targetDateStr) return;

            let d;
            if (targetDateStr.includes('/')) {
                const p = targetDateStr.split('/');
                if (p.length === 3) d = new Date(`${p[2]}-${p[1]}-${p[0]}T${r.time || '09:00'}:00`);
            } else {
                d = new Date(`${targetDateStr}T${r.time || '09:00'}:00`);
            }

            if (!d || isNaN(d.getTime())) return;

            const dueTime = d.getTime();
            const alert24hTime = dueTime - (24 * 60 * 60 * 1000); // 24 hours before target time

            // 1. Advance 24-hour reminder notification
            if (nowTime >= alert24hTime && nowTime < dueTime && !r.notified24h) {
                r.notified24h = true;
                pushNotification({
                    title: `⏰ 24h Advance Alert: ${r.title}`,
                    desc: `Due tomorrow (${formatToDDMMYYYY(targetDateStr)})${r.time ? ' at ' + r.time : ''} • Priority: ${r.priority || 'Medium'}`,
                    type: 'reminder',
                    category: 'reminder',
                    linkPage: 'reminders',
                    playSound: false
                });
                triggerCount++;
            }

            // 2. Due Date/Time reminder notification
            if (nowTime >= dueTime && !r.notifiedDue) {
                r.notifiedDue = true;
                pushNotification({
                    title: `🔔 Reminder Due: ${r.title}`,
                    desc: `Due now (${formatToDDMMYYYY(targetDateStr)})${r.time ? ' at ' + r.time : ''} • Priority: ${r.priority || 'Medium'}`,
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
    const homeBellContainer = document.getElementById('homeNotificationBellContainer');
    const homeUnreadCount = document.getElementById('homeNotificationUnreadCount');
    const homeFlyoutList = document.getElementById('homeNotificationFlyoutList');

    const notifs = db.notifications || [];
    const unreadCount = notifs.filter(n => !n.read).length;

    // Update Global Badge
    if (badge) {
        if (unreadCount > 0) {
            badge.innerText = unreadCount.toString();
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    // Update Home Small Red Bell Icon (Visible ONLY when active / unread > 0)
    if (homeBellContainer) {
        if (unreadCount > 0) {
            homeBellContainer.classList.remove('hidden');
            if (homeUnreadCount) homeUnreadCount.innerText = unreadCount.toString();
            const homeHeaderCount = document.getElementById('homeNotificationHeaderCount');
            if (homeHeaderCount) homeHeaderCount.innerText = unreadCount.toString();
        } else {
            homeBellContainer.classList.add('hidden');
            const flyout = document.getElementById('homeNotificationFlyout');
            if (flyout) flyout.classList.add('hidden');
        }
    }

    // Render Home Flyout List (Spacious Double-Size View)
    if (homeFlyoutList) {
        homeFlyoutList.innerHTML = '';
        if (notifs.length === 0) {
            homeFlyoutList.innerHTML = `<div class="p-8 text-center text-slate-400 text-sm font-light rounded-2xl border border-dashed border-white/[0.1] bg-surface-900/40"><i class="fa-regular fa-bell-slash text-2xl mb-2 block text-slate-500"></i> No pending notifications or alerts at this time.</div>`;
        } else {
            notifs.forEach(n => {
                const item = document.createElement('div');
                const isRead = !!n.read;
                item.className = `p-3.5 sm:p-4 rounded-2xl border flex items-start justify-between gap-3.5 transition-all duration-200 ${
                    isRead 
                    ? 'bg-surface-900/40 border-white/[0.06] text-slate-400 hover:border-white/[0.12]' 
                    : 'bg-surface-900/90 border-rose-500/35 text-slate-100 shadow-[0_4px_16px_rgba(244,63,94,0.12)] hover:border-rose-400/60'
                }`;

                let iconClass = 'fa-solid fa-bell text-rose-400';
                let iconBg = 'bg-rose-500/15 border-rose-500/30';
                if (n.category === 'reminder' || n.type === 'reminder') {
                    iconClass = 'fa-solid fa-clock-rotate-left text-amber-400';
                    iconBg = 'bg-amber-500/15 border-amber-500/30';
                } else if (n.category === 'transaction' || n.type === 'transaction') {
                    iconClass = 'fa-solid fa-receipt text-emerald-400';
                    iconBg = 'bg-emerald-500/15 border-emerald-500/30';
                } else if (n.category === 'goal' || n.type === 'goal') {
                    iconClass = 'fa-solid fa-bullseye text-brand-400';
                    iconBg = 'bg-brand-500/15 border-brand-500/30';
                }

                item.innerHTML = `
                    <div class="flex items-start gap-3 flex-1 min-w-0 cursor-pointer group/item" onclick="handleNotificationClick('${n.id}', '${n.linkPage || ''}')">
                        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${iconBg} border flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover/item:scale-105 transition-transform">
                            <i class="${iconClass} text-sm sm:text-base"></i>
                        </div>
                        <div class="space-y-1 flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-2">
                                <h5 class="text-xs sm:text-sm font-semibold ${isRead ? 'text-slate-400' : 'text-white'} truncate group-hover/item:text-brand-300 transition-colors">${n.title}</h5>
                                <span class="font-mono text-[10px] sm:text-[11px] text-slate-400 shrink-0 bg-surface-950 px-2 py-0.5 rounded-md border border-white/[0.06]">${n.date || 'Now'}</span>
                            </div>
                            ${n.desc ? `<p class="text-xs sm:text-sm font-light ${isRead ? 'text-slate-400' : 'text-slate-200'} leading-relaxed line-clamp-3">${n.desc}</p>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0 self-center pl-2">
                        ${!isRead ? `<button onclick="toggleSingleNotificationRead('${n.id}')" class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-white/[0.08] hover:border-emerald-500/40 flex items-center justify-center transition-all cursor-pointer shadow-sm" title="Mark as Read"><i class="fa-solid fa-check text-xs"></i></button>` : ''}
                        <button onclick="deleteNotification('${n.id}')" class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-500/40 flex items-center justify-center transition-all cursor-pointer shadow-sm" title="Delete"><i class="fa-solid fa-trash-can text-xs"></i></button>
                    </div>
                `;
                homeFlyoutList.appendChild(item);
            });
        }
    }

    if (!list) return;

    list.innerHTML = '';

    notifs.forEach(n => {
        const item = document.createElement('div');
        const isRead = !!n.read;
        item.className = `p-3 sm:p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition-all duration-200 ${
            isRead 
            ? 'bg-surface-950/35 border-emerald-500/15 text-slate-400 hover:border-emerald-500/30' 
            : 'bg-surface-900/70 border-emerald-500/30 text-slate-100 shadow-[0_4px_16px_rgba(0,255,157,0.06)] hover:border-emerald-400/60'
        }`;

        let iconClass = 'fa-solid fa-bell text-emerald-400';
        if (n.category === 'reminder' || n.type === 'reminder') iconClass = 'fa-solid fa-clock-rotate-left text-emerald-400';
        else if (n.category === 'transaction' || n.type === 'transaction') iconClass = 'fa-solid fa-receipt text-emerald-400';
        else if (n.category === 'goal' || n.type === 'goal') iconClass = 'fa-solid fa-bullseye text-brand-400';
        else if (n.category === 'asset' || n.type === 'asset') iconClass = 'fa-solid fa-vault text-accent-cyan';

        item.innerHTML = `
            <div class="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer" onclick="handleNotificationClick('${n.id}', '${n.linkPage || ''}')">
                <div class="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <i class="${iconClass} text-[11px]"></i>
                </div>
                <div class="space-y-0.5 flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <h5 class="text-xs font-semibold ${isRead ? 'text-slate-400' : 'text-slate-100'} truncate">${n.title}</h5>
                        <span class="font-mono text-[9px] text-emerald-500/70 shrink-0">${n.date || 'Today'}</span>
                    </div>
                    ${n.desc ? `<p class="text-[11px] font-light ${isRead ? 'text-slate-500' : 'text-slate-300'} line-clamp-2 leading-tight">${n.desc}</p>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-1 shrink-0 self-center">
                ${!isRead ? `<button onclick="toggleSingleNotificationRead('${n.id}')" class="p-1 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer" title="Mark Read"><i class="fa-solid fa-circle-check text-xs"></i></button>` : ''}
                <button onclick="deleteNotification('${n.id}')" class="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer" title="Delete"><i class="fa-solid fa-xmark text-xs"></i></button>
            </div>
        `;
        list.appendChild(item);
    });

    if (notifs.length === 0) {
        list.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs font-light rounded-2xl border border-dashed border-emerald-500/20 bg-surface-950/25"><i class="fa-regular fa-bell text-xl mb-1.5 block text-emerald-400/50"></i> No pending notifications. Reminders and milestone updates will appear here.</div>`;
    }
}
window.renderNotifications = renderNotifications;

function toggleHomeNotificationFlyout(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const flyout = document.getElementById('homeNotificationFlyout');
    if (flyout) flyout.classList.toggle('hidden');
}
window.toggleHomeNotificationFlyout = toggleHomeNotificationFlyout;

document.addEventListener('click', (e) => {
    const container = document.getElementById('homeNotificationBellContainer');
    const flyout = document.getElementById('homeNotificationFlyout');
    if (flyout && !flyout.classList.contains('hidden') && container && !container.contains(e.target)) {
        flyout.classList.add('hidden');
    }
});

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
        if ((b.bankName && b.bankName.toLowerCase().includes(q)) || 
            (b.accountName && b.accountName.toLowerCase().includes(q)) ||
            (b.accountNumber && b.accountNumber.toLowerCase().includes(q)) ||
            (b.notes && b.notes.toLowerCase().includes(q))) {
            results.push({ page: 'assets', tab: 'banking', label: `Bank: ${b.bankName} - ${b.accountName}${b.accountNumber ? ` (${b.accountNumber})` : ''}` });
        }
    });

    // Search Mutual Funds & Loans
    (db.assetMutualFunds || []).forEach(mf => {
        if ((mf.fundName && mf.fundName.toLowerCase().includes(q)) || (mf.folioNumber && mf.folioNumber.toLowerCase().includes(q))) {
            results.push({ page: 'assets', tab: 'mf', label: `Mutual Fund: ${mf.fundName}` });
        }
    });

    // Search Qatar Assets
    (db.qatarAssets || []).forEach(qa => {
        if ((qa.assetIdentity && qa.assetIdentity.toLowerCase().includes(q)) || (qa.category && qa.category.toLowerCase().includes(q)) || (qa.remarks && qa.remarks.toLowerCase().includes(q))) {
            results.push({ page: 'assets', tab: 'qatarvaluation', label: `Qatar Asset: ${qa.assetIdentity} (${qa.category || 'Asset'}) - QR ${qa.valueQr}` });
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
    renderFinancialIntelligencePage();
}

function renderFinancialIntelligencePage() {
    const pageEl = document.getElementById('page-graphs');
    if (!pageEl) return;

    const QAR_TO_INR_RATE = 23.5;
    const formatINR = (val) => '₹' + (Number(val) || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const formatQAR = (val) => 'QR ' + (Number(val) || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    // 1. Calculate Liquid Bank Cash
    let bankLiquidINR = 0;
    let bankLiquidQAR = 0;
    if (db.bankAccounts && Array.isArray(db.bankAccounts)) {
        db.bankAccounts.forEach(b => {
            const bal = parseFloat(b.balance) || 0;
            if (b.currency === 'QAR') {
                bankLiquidQAR += bal;
            } else {
                bankLiquidINR += bal;
            }
        });
    }
    const totalLiquidINR = bankLiquidINR + (bankLiquidQAR * QAR_TO_INR_RATE);

    // 2. Mutual Funds
    let mfTotalINR = 0;
    if (db.assetMutualFunds && Array.isArray(db.assetMutualFunds)) {
        db.assetMutualFunds.forEach(mf => {
            const qty = parseFloat(mf.qty) || 0;
            const ltp = parseFloat(mf.ltp) || 0;
            mfTotalINR += (qty * ltp);
        });
    }

    // 3. Equities / Share Market
    let equityTotalINR = 0;
    if (db.indiaOps && Array.isArray(db.indiaOps.shareMarket)) {
        db.indiaOps.shareMarket.forEach(stk => {
            const qty = parseFloat(stk.qty) || 0;
            const price = parseFloat(stk.ltp) || parseFloat(stk.avgPrice) || 0;
            equityTotalINR += (qty * price);
        });
    }

    // 4. Physical Assets
    let physicalTotalINR = 0;
    if (db.assetLogs && Array.isArray(db.assetLogs)) {
        db.assetLogs.forEach(log => {
            physicalTotalINR += parseFloat(log.value) || 0;
        });
    }

    // 5. Total Assets
    const totalAssetsINR = totalLiquidINR + mfTotalINR + equityTotalINR + physicalTotalINR;

    // 6. Total Liabilities / Loans
    let totalLiabilitiesINR = 0;
    if (db.loans && Array.isArray(db.loans)) {
        db.loans.forEach(l => {
            const amt = parseFloat(l.amount) || 0;
            const rep = parseFloat(l.repaid) || 0;
            totalLiabilitiesINR += Math.max(0, amt - rep);
        });
    }

    // 7. Net Worth
    const netWorthINR = totalAssetsINR - totalLiabilitiesINR;

    // 8. Monthly Budgets & Spends
    let budgetQAR = 0;
    if (db.budget && Array.isArray(db.budget.QAR)) {
        db.budget.QAR.forEach(b => budgetQAR += (parseFloat(b.amount) || 0));
    }

    let budgetINR = 0;
    if (db.budget && Array.isArray(db.budget.INR)) {
        db.budget.INR.forEach(b => budgetINR += (parseFloat(b.amount) || 0));
    }

    let spentQAR = 0;
    let spentINR = 0;
    if (db.dailyExpenses && Array.isArray(db.dailyExpenses)) {
        db.dailyExpenses.forEach(exp => {
            const amt = parseFloat(exp.amount) || 0;
            if (exp.currency === 'QAR') spentQAR += amt;
            else spentINR += amt;
        });
    }

    const totalMonthlySpendINR = spentINR + (spentQAR * QAR_TO_INR_RATE);
    const totalMonthlyBudgetINR = budgetINR + (budgetQAR * QAR_TO_INR_RATE);

    // 9. Compute Ratios & KPIs
    // Asset/Debt Coverage
    let assetCoverageText = '0.0x';
    let assetCoverageNum = 0;
    if (totalLiabilitiesINR === 0 && totalAssetsINR > 0) {
        assetCoverageText = 'Debt Free (∞)';
        assetCoverageNum = 99;
    } else if (totalLiabilitiesINR > 0) {
        assetCoverageNum = totalAssetsINR / totalLiabilitiesINR;
        assetCoverageText = assetCoverageNum.toFixed(1) + 'x';
    }

    // Emergency Runway
    let runwayMonths = '12+';
    let runwayNum = 12;
    if (totalMonthlySpendINR > 0) {
        runwayNum = totalLiquidINR / totalMonthlySpendINR;
        runwayMonths = runwayNum.toFixed(1);
    } else if (totalMonthlyBudgetINR > 0) {
        runwayNum = totalLiquidINR / totalMonthlyBudgetINR;
        runwayMonths = runwayNum.toFixed(1);
    }

    // Health Score (0 - 100)
    let healthScore = 75;
    if (totalLiabilitiesINR === 0 && totalAssetsINR > 0) healthScore += 15;
    else if (assetCoverageNum >= 3) healthScore += 10;
    else if (assetCoverageNum < 1.5 && assetCoverageNum > 0) healthScore -= 15;

    if (runwayNum >= 6) healthScore += 10;
    else if (runwayNum < 2) healthScore -= 10;

    if (totalMonthlySpendINR > 0 && totalMonthlySpendINR <= totalMonthlyBudgetINR) healthScore += 5;
    else if (totalMonthlySpendINR > totalMonthlyBudgetINR && totalMonthlyBudgetINR > 0) healthScore -= 10;

    healthScore = Math.max(25, Math.min(99, Math.round(healthScore)));

    let healthBadgeText = 'Optimal';
    let healthBadgeClass = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400';
    let healthBarClass = 'bg-gradient-to-r from-emerald-500 to-accent-cyan h-full rounded-full transition-all duration-700';
    let healthDescText = 'Robust balance sheet fundamentals and healthy reserves';

    if (healthScore < 60) {
        healthBadgeText = 'Caution';
        healthBadgeClass = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-400';
        healthBarClass = 'bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-700';
        healthDescText = 'High debt exposure or tight liquidity runway detected';
    } else if (healthScore < 80) {
        healthBadgeText = 'Balanced';
        healthBadgeClass = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 border border-sky-500/30 text-sky-400';
        healthBarClass = 'bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-700';
        healthDescText = 'Stable asset backing with manageable liabilities';
    }

    // Update DOM KPI elements
    const elHealthScore = document.getElementById('intelHealthScore');
    const elHealthBadge = document.getElementById('intelHealthBadge');
    const elHealthBar = document.getElementById('intelHealthBar');
    const elHealthDesc = document.getElementById('intelHealthDesc');
    if (elHealthScore) elHealthScore.innerText = healthScore;
    if (elHealthBadge) {
        elHealthBadge.innerText = healthBadgeText;
        elHealthBadge.className = healthBadgeClass;
    }
    if (elHealthBar) {
        elHealthBar.style.width = `${healthScore}%`;
        elHealthBar.className = healthBarClass;
    }
    if (elHealthDesc) elHealthDesc.innerText = healthDescText;

    const elAssetRatio = document.getElementById('intelAssetRatio');
    const elAssetRatioSub = document.getElementById('intelAssetRatioSub');
    if (elAssetRatio) elAssetRatio.innerText = assetCoverageText;
    if (elAssetRatioSub) {
        elAssetRatioSub.innerText = totalLiabilitiesINR === 0 ? 'Zero active debt recorded' : `Covers ${formatINR(totalLiabilitiesINR)} total liabilities`;
    }

    const elLiquidBuffer = document.getElementById('intelLiquidBuffer');
    const elLiquidBufferSub = document.getElementById('intelLiquidBufferSub');
    if (elLiquidBuffer) elLiquidBuffer.innerText = formatINR(totalLiquidINR);
    if (elLiquidBufferSub) {
        elLiquidBufferSub.innerText = `INR: ${formatINR(bankLiquidINR)} | QAR: ${formatQAR(bankLiquidQAR)}`;
    }

    const elRunwayMonths = document.getElementById('intelRunwayMonths');
    const elRunwayDesc = document.getElementById('intelRunwayDesc');
    if (elRunwayMonths) elRunwayMonths.innerText = runwayMonths;
    if (elRunwayDesc) {
        elRunwayDesc.innerText = `Monthly burn: ${formatINR(totalMonthlySpendINR || totalMonthlyBudgetINR)}`;
    }

    const elNetWorthPill = document.getElementById('intelNetWorthPill');
    if (elNetWorthPill) elNetWorthPill.innerText = `Net Worth: ${formatINR(netWorthINR)}`;

    // Budget Adherence Rate
    const elAdherenceRate = document.getElementById('intelAdherenceRate');
    if (elAdherenceRate) {
        if (totalMonthlyBudgetINR > 0) {
            const spentPct = (totalMonthlySpendINR / totalMonthlyBudgetINR) * 100;
            if (spentPct <= 100) {
                elAdherenceRate.innerText = `${(100 - spentPct).toFixed(0)}% Under Limit`;
                elAdherenceRate.className = 'font-bold text-emerald-400';
            } else {
                elAdherenceRate.innerText = `${(spentPct - 100).toFixed(0)}% Over Budget`;
                elAdherenceRate.className = 'font-bold text-rose-400';
            }
        } else {
            elAdherenceRate.innerText = 'No Budget Limit Set';
            elAdherenceRate.className = 'font-bold text-slate-400';
        }
    }

    // 10. Render Charts
    // Chart 1: Wealth Trajectory Line Chart
    const growthCanvas = document.getElementById('intelGrowthChart') || document.getElementById('growthComboChart');
    if (growthCanvas) {
        const ctx = growthCanvas.getContext('2d');
        if (window.intelGrowthChartInst) window.intelGrowthChartInst.destroy();

        // Calculate reasonable trajectory points based on current Net Worth
        const baseNW = Math.max(netWorthINR, 100000);
        const y2023 = Math.round(baseNW * 0.55);
        const y2024 = Math.round(baseNW * 0.72);
        const y2025 = Math.round(baseNW * 0.88);
        const y2026 = Math.round(netWorthINR);
        const y2027_proj = Math.round(netWorthINR * 1.15);
        const y2028_proj = Math.round(netWorthINR * 1.32);

        window.intelGrowthChartInst = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2023', '2024', '2025', '2026 (Live)', '2027 (Proj)', '2028 (Proj)'],
                datasets: [
                    {
                        label: 'Consolidated Wealth Trajectory',
                        data: [y2023, y2024, y2025, y2026, y2027_proj, y2028_proj],
                        borderColor: '#C9A46B',
                        backgroundColor: 'rgba(201, 164, 107, 0.08)',
                        fill: true,
                        tension: 0.35,
                        pointBackgroundColor: ['#C9A46B', '#C9A46B', '#C9A46B', '#00ff9d', '#b829ff', '#38bdf8'],
                        pointBorderColor: '#070A0F',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        segment: {
                            borderDash: ctx => ctx.p0DataIndex >= 3 ? [6, 6] : undefined,
                            borderColor: ctx => ctx.p0DataIndex >= 3 ? '#b829ff' : '#C9A46B'
                        }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    x: { grid: chartGridOptions },
                    y: {
                        grid: chartGridOptions,
                        ticks: {
                            callback: function(val) {
                                if (val >= 10000000) return '₹' + (val / 10000000).toFixed(1) + 'Cr';
                                if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + 'L';
                                return '₹' + val;
                            }
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' Net Worth: ' + formatINR(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }

    // Chart 2: Capital Allocation Mix Doughnut Chart
    const allocCanvas = document.getElementById('intelAllocationChart');
    if (allocCanvas) {
        const ctx = allocCanvas.getContext('2d');
        if (window.intelAllocationChartInst) window.intelAllocationChartInst.destroy();

        const labels = ['Liquid Banks', 'Mutual Funds', 'Equities', 'Physical Assets'];
        const values = [totalLiquidINR, mfTotalINR, equityTotalINR, physicalTotalINR];
        const colors = ['#38bdf8', '#34d399', '#a855f7', '#f59e0b'];

        window.intelAllocationChartInst = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values.map(v => Math.max(0, v)),
                    backgroundColor: colors,
                    borderColor: '#0b1320',
                    borderWidth: 2,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = values.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? ((context.raw / total) * 100).toFixed(1) : '0';
                                return ` ${context.label}: ${formatINR(context.raw)} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Summary pills below donut chart
        const allocSummaryEl = document.getElementById('intelAllocationSummary');
        if (allocSummaryEl) {
            const total = values.reduce((a, b) => a + b, 0) || 1;
            allocSummaryEl.innerHTML = `
                <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#38bdf8]"></span> <span>Banks: ${(totalLiquidINR/total*100).toFixed(0)}%</span></div>
                <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#34d399]"></span> <span>MFs: ${(mfTotalINR/total*100).toFixed(0)}%</span></div>
                <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#a855f7]"></span> <span>Equities: ${(equityTotalINR/total*100).toFixed(0)}%</span></div>
                <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#f59e0b]"></span> <span>Physical: ${(physicalTotalINR/total*100).toFixed(0)}%</span></div>
            `;
        }
    }

    // Chart 3: Monthly Cashflow Velocity Bar Chart
    const cashflowCanvas = document.getElementById('intelCashflowChart');
    if (cashflowCanvas) {
        const ctx = cashflowCanvas.getContext('2d');
        if (window.intelCashflowChartInst) window.intelCashflowChartInst.destroy();

        window.intelCashflowChartInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Qatar (QAR)', 'India (₹ Lakhs)'],
                datasets: [
                    {
                        label: 'Budget Limit',
                        data: [budgetQAR, (budgetINR / 100000)],
                        backgroundColor: 'rgba(56, 189, 248, 0.4)',
                        borderColor: '#38bdf8',
                        borderWidth: 1.5,
                        borderRadius: 6
                    },
                    {
                        label: 'Actual Spend',
                        data: [spentQAR, (spentINR / 100000)],
                        backgroundColor: 'rgba(244, 63, 94, 0.5)',
                        borderColor: '#f43f5e',
                        borderWidth: 1.5,
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: chartGridOptions },
                    y: { grid: chartGridOptions }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { boxWidth: 10, font: { size: 9 }, color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // 11. Dynamic AI Audits & Strategic Recommendations Grid
    const auditGridEl = document.getElementById('intelAuditGrid');
    if (auditGridEl) {
        let auditCardsHtml = '';

        // Audit 1: Liquidity Safety
        const isRunwaySafe = runwayNum >= 6;
        auditCardsHtml += `
            <div class="p-4 rounded-xl bg-surface-900/40 border border-surface-800 flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg ${isRunwaySafe ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'} flex items-center justify-center shrink-0 mt-0.5">
                    <i class="fa-solid fa-shield-heart text-xs"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-semibold text-white">Liquidity Reserve Health</span>
                        <span class="text-[10px] font-mono font-bold ${isRunwaySafe ? 'text-emerald-400' : 'text-amber-400'}">${runwayMonths} Mo Runway</span>
                    </div>
                    <p class="text-[11px] text-slate-400 font-light leading-relaxed">
                        ${totalLiquidINR > 0 ? `Liquid buffer of ${formatINR(totalLiquidINR)} across banks provides adequate runway against current burns.` : 'No liquid cash balances recorded in bank accounts.'}
                    </p>
                </div>
            </div>
        `;

        // Audit 2: Debt & Liability Health
        const isDebtClean = totalLiabilitiesINR === 0 || assetCoverageNum >= 3;
        auditCardsHtml += `
            <div class="p-4 rounded-xl bg-surface-900/40 border border-surface-800 flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg ${isDebtClean ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'} flex items-center justify-center shrink-0 mt-0.5">
                    <i class="fa-solid fa-scale-unbalanced text-xs"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-semibold text-white">Liabilities & Leverage</span>
                        <span class="text-[10px] font-mono font-bold ${isDebtClean ? 'text-emerald-400' : 'text-rose-400'}">${totalLiabilitiesINR === 0 ? 'Zero Debt' : assetCoverageText}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 font-light leading-relaxed">
                        ${totalLiabilitiesINR > 0 ? `Active debt obligation is ${formatINR(totalLiabilitiesINR)} against ${formatINR(totalAssetsINR)} total assets.` : 'Zero outstanding debt liabilities. Portfolio is fully unleveraged.'}
                    </p>
                </div>
            </div>
        `;

        // Audit 3: Investment Diversification
        const isDiversified = (mfTotalINR > 0 || equityTotalINR > 0) && (totalLiquidINR > 0 || physicalTotalINR > 0);
        auditCardsHtml += `
            <div class="p-4 rounded-xl bg-surface-900/40 border border-surface-800 flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg ${isDiversified ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-slate-700/30 text-slate-400'} flex items-center justify-center shrink-0 mt-0.5">
                    <i class="fa-solid fa-chart-pie text-xs"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-semibold text-white">Asset Allocation Mix</span>
                        <span class="text-[10px] font-mono font-bold text-accent-cyan">${isDiversified ? 'Diversified' : 'Concentrated'}</span>
                    </div>
                    <p class="text-[11px] text-slate-400 font-light leading-relaxed">
                        ${mfTotalINR + equityTotalINR > 0 ? `Growth assets (MFs & Equities) comprise ${formatINR(mfTotalINR + equityTotalINR)} of wealth.` : 'Consider increasing exposure to mutual funds or equities for inflation protection.'}
                    </p>
                </div>
            </div>
        `;

        // Audit 4: Milestone & Goals Velocity
        const totalGoals = (db.goals || []).length;
        const compGoals = (db.goals || []).filter(g => g.status === 'Completed' || (g.current && g.target && Number(g.current) >= Number(g.target))).length;
        auditCardsHtml += `
            <div class="p-4 rounded-xl bg-surface-900/40 border border-surface-800 flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                    <i class="fa-solid fa-bullseye text-xs"></i>
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-semibold text-white">Strategic Milestones</span>
                        <span class="text-[10px] font-mono font-bold text-brand-400">${compGoals}/${totalGoals} Done</span>
                    </div>
                    <p class="text-[11px] text-slate-400 font-light leading-relaxed">
                        ${totalGoals > 0 ? `Tracking ${totalGoals} strategic financial goals with ${compGoals} milestones successfully achieved.` : 'No milestones registered. Add wealth targets in the Milestone page.'}
                    </p>
                </div>
            </div>
        `;

        auditGridEl.innerHTML = auditCardsHtml;
    }

    // Executive Summary
    const execSummaryEl = document.getElementById('intelExecutiveSummary');
    if (execSummaryEl) {
        if (netWorthINR > 0) {
            execSummaryEl.innerText = `Portfolio net worth stands at ${formatINR(netWorthINR)} with a ${healthBadgeText.toLowerCase()} balance sheet score of ${healthScore}/100. Liquid bank reserves of ${formatINR(totalLiquidINR)} afford a ${runwayMonths}-month emergency runway. Capital is distributed across liquid banking, mutual funds, equities, and tangible assets.`;
        } else {
            execSummaryEl.innerText = `Add your bank balances, mutual funds, and assets in the Portfolio page to activate full real-time predictive analytics and trajectory intelligence.`;
        }
    }
}
window.renderFinancialIntelligencePage = renderFinancialIntelligencePage;
window.renderGrowthChart = renderGrowthChart;
window.exportDashboardToExcel = exportToExcel;
window.importDataFromExcel = importFromExcel;

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
    let backupState = null;

    if (targetPage === 'assets' || targetPage === 'portfolio') {
        targetTitle = 'Portfolio records (Bank accounts, Credit liabilities, Mutual funds & Asset Valuation logs)';
        backupState = {
            bankAccounts: JSON.parse(JSON.stringify(db.bankAccounts || [])),
            loans: JSON.parse(JSON.stringify(db.loans || [])),
            assetMutualFunds: JSON.parse(JSON.stringify(db.assetMutualFunds || [])),
            assetLogs: JSON.parse(JSON.stringify(db.assetLogs || [])),
            assetCards: JSON.parse(JSON.stringify(db.assetCards || []))
        };
        clearAction = () => {
            db.bankAccounts = [];
            db.loans = [];
            db.assetMutualFunds = [];
            db.assetLogs = [];
            db.assetCards = [];
        };
    } else if (targetPage === 'india-ops' || targetPage === 'equities') {
        targetTitle = 'Equities and Trading Desk entries';
        backupState = {
            indiaOps: JSON.parse(JSON.stringify(db.indiaOps || {}))
        };
        clearAction = () => {
            if (db.indiaOps) {
                db.indiaOps.shareMarket = [];
                db.indiaOps.ventures = [];
                db.indiaOps.othersEntries = [];
            }
        };
    } else if (targetPage === 'budget' || targetPage === 'budgets') {
        targetTitle = 'Budget allocations and Daily Outflows';
        backupState = {
            budget: JSON.parse(JSON.stringify(db.budget || {})),
            dailyExpenses: JSON.parse(JSON.stringify(db.dailyExpenses || []))
        };
        clearAction = () => {
            db.budget = { INR: [], QAR: [] };
            db.dailyExpenses = [];
        };
    } else if (targetPage === 'goals' || targetPage === 'milestones') {
        targetTitle = 'Milestones and Goals';
        backupState = {
            goals: JSON.parse(JSON.stringify(db.goals || []))
        };
        clearAction = () => {
            db.goals = [];
        };
    } else if (targetPage === 'notes' || targetPage === 'journal') {
        targetTitle = 'Executive Notes and Journal entries';
        backupState = {
            notes: JSON.parse(JSON.stringify(db.notes || []))
        };
        clearAction = () => {
            db.notes = [];
        };
    } else if (targetPage === 'reminders') {
        targetTitle = 'Reminders and Alerts';
        backupState = {
            reminders: JSON.parse(JSON.stringify(db.reminders || []))
        };
        clearAction = () => {
            db.reminders = [];
        };
    } else if (targetPage === 'all') {
        targetTitle = 'ALL application records across the entire dashboard';
        backupState = {
            bankAccounts: JSON.parse(JSON.stringify(db.bankAccounts || [])),
            loans: JSON.parse(JSON.stringify(db.loans || [])),
            assetMutualFunds: JSON.parse(JSON.stringify(db.assetMutualFunds || [])),
            assetLogs: JSON.parse(JSON.stringify(db.assetLogs || [])),
            assetCards: JSON.parse(JSON.stringify(db.assetCards || [])),
            indiaOps: JSON.parse(JSON.stringify(db.indiaOps || {})),
            budget: JSON.parse(JSON.stringify(db.budget || {})),
            dailyExpenses: JSON.parse(JSON.stringify(db.dailyExpenses || [])),
            goals: JSON.parse(JSON.stringify(db.goals || [])),
            notes: JSON.parse(JSON.stringify(db.notes || [])),
            reminders: JSON.parse(JSON.stringify(db.reminders || []))
        };
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
        };
    } else {
        targetTitle = 'Portfolio records';
        backupState = {
            bankAccounts: JSON.parse(JSON.stringify(db.bankAccounts || [])),
            loans: JSON.parse(JSON.stringify(db.loans || [])),
            assetMutualFunds: JSON.parse(JSON.stringify(db.assetMutualFunds || [])),
            assetLogs: JSON.parse(JSON.stringify(db.assetLogs || []))
        };
        clearAction = () => {
            db.bankAccounts = [];
            db.loans = [];
            db.assetMutualFunds = [];
            db.assetLogs = [];
        };
    }

    requireConfirmation(`Are you sure you want to clear ${targetTitle}? This will only delete data for this page and keep the rest intact.`, () => {
        if (backupState && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'bulk',
                label: `Cleared ${targetTitle.split('(')[0].trim()}`,
                data: backupState
            });
        }
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

let appToastTimer = null;

function showToast(msg) {
    const toast = document.getElementById('appToast');
    const toastMsg = document.getElementById('appToastMsg');
    const undoBtn = document.getElementById('appToastUndoBtn');
    if (toast && toastMsg) {
        toastMsg.innerHTML = msg;
        if (undoBtn) undoBtn.classList.add('hidden');
        toast.classList.remove('translate-y-24', 'opacity-0');
        if (appToastTimer) clearTimeout(appToastTimer);
        appToastTimer = setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
        }, 3200);
    }
}
window.showToast = showToast;

function showUndoToast(deletedLabel) {
    const toast = document.getElementById('appToast');
    const toastMsg = document.getElementById('appToastMsg');
    const undoBtn = document.getElementById('appToastUndoBtn');
    if (toast && toastMsg) {
        toastMsg.innerHTML = `<span class="text-rose-400 font-bold mr-1"><i class="fa-solid fa-trash text-[10px]"></i> Deleted:</span> <span class="text-slate-200">${deletedLabel || 'Item'}</span>`;
        if (undoBtn) {
            undoBtn.classList.remove('hidden');
            undoBtn.onclick = () => {
                undoLastDelete();
                hideToast();
            };
        }
        toast.classList.remove('translate-y-24', 'opacity-0');
        if (appToastTimer) clearTimeout(appToastTimer);
        appToastTimer = setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
        }, 6000);
    }
}
window.showUndoToast = showUndoToast;

function hideToast() {
    const toast = document.getElementById('appToast');
    if (toast) {
        toast.classList.add('translate-y-24', 'opacity-0');
    }
    if (appToastTimer) clearTimeout(appToastTimer);
}
window.hideToast = hideToast;

function openCloudSyncModal() {
    updateCloudModalUI();
    openModal('cloudSyncModal');
}

function updateCloudModalUI() {
    const emailDisp = document.getElementById('cloudUserEmailDisplay');
    const authBtn = document.getElementById('cloudAuthBtn');
    const syncTime = document.getElementById('lastCloudSyncTime');
    const quotaCard = document.getElementById('cloudQuotaNoticeCard');
    const activeCard = document.getElementById('cloudActiveInfoCard');

    const isQuota = window.isFirestoreQuotaExceeded && Date.now() < (window.firestoreQuotaExceededUntil || 0);
    if (quotaCard && activeCard) {
        if (isQuota) {
            quotaCard.classList.remove('hidden');
            activeCard.classList.add('hidden');
        } else {
            quotaCard.classList.add('hidden');
            activeCard.classList.remove('hidden');
        }
    }

    if (window.firebaseUser) {
        if (window.firebaseUser.isAnonymous) {
            if (emailDisp) {
                emailDisp.innerHTML = isQuota 
                    ? '<span class="text-amber-400 font-mono text-xs">● Daily Quota Limit (Local Storage Safe)</span>'
                    : '<span class="text-emerald-400 font-mono text-xs">● Connected (Worldwide Cloud Sync Active)</span>';
            }
            if (authBtn) {
                authBtn.innerHTML = '<i class="fa-brands fa-google text-brand-500"></i> <span>Sign in with Google</span>';
                authBtn.className = 'px-4 py-2 bg-brand-600 hover:bg-brand-500 text-surface-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer';
            }
        } else {
            const email = window.firebaseUser.email || window.firebaseUser.displayName || 'Google Account';
            if (emailDisp) {
                emailDisp.innerHTML = isQuota 
                    ? `<span class="text-amber-400 font-mono text-xs">● Signed In (Quota Limit):</span> <span class="text-white font-medium text-xs">${email}</span>`
                    : `<span class="text-emerald-400 font-mono text-xs">● Signed In:</span> <span class="text-white font-medium text-xs">${email}</span>`;
            }
            if (authBtn) {
                authBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket text-rose-400"></i> <span>Sign Out</span>';
                authBtn.className = 'px-4 py-2 bg-surface-800 hover:bg-rose-900/40 text-rose-300 rounded-xl text-xs font-semibold border border-surface-700 transition-all flex items-center gap-2 cursor-pointer';
            }
        }
    } else {
        if (emailDisp) emailDisp.innerText = 'Connecting to Firebase...';
    }

    if (syncTime) {
        syncTime.innerText = isQuota ? 'Status: Local device cache active (Free quota reached)' : ('Last sync: ' + new Date().toLocaleTimeString());
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

// =========================================================================
// DOCUMENTS & MEDIA VAULT ENGINE
// =========================================================================
let docActiveCategoryFilter = 'all';
let docActiveSubCategory = 'all';
let docViewMode = 'grid';
let modalDocStagedFile = null;

function setDocumentCategoryFilter(cat) {
    docActiveCategoryFilter = cat;
    renderDocumentsPage();
}
window.setDocumentCategoryFilter = setDocumentCategoryFilter;

function setDocumentSubCategory(subCat) {
    docActiveSubCategory = subCat;

    const cats = ['all', 'identity', 'legal', 'financial', 'business', 'receipts', 'personal'];
    cats.forEach(c => {
        const btn = document.getElementById(`btnDocCat-${c}`);
        if (btn) {
            if (c === subCat) {
                btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition-all cursor-pointer whitespace-nowrap';
            } else {
                btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer whitespace-nowrap';
            }
        }
    });

    renderDocumentsPage();
}
window.setDocumentSubCategory = setDocumentSubCategory;

function setDocumentViewMode(mode) {
    docViewMode = mode;
    const gridBtn = document.getElementById('btnDocViewGrid');
    const listBtn = document.getElementById('btnDocViewList');
    const gridContainer = document.getElementById('documentsGridContainer');
    const listContainer = document.getElementById('documentsListContainer');

    if (mode === 'grid') {
        if (gridBtn) gridBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-mono transition-all bg-surface-800 text-emerald-300 shadow-sm cursor-pointer flex items-center gap-1';
        if (listBtn) listBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-mono transition-all text-slate-400 hover:text-white cursor-pointer flex items-center gap-1';
        if (gridContainer) gridContainer.classList.remove('hidden');
        if (listContainer) listContainer.classList.add('hidden');
    } else {
        if (gridBtn) gridBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-mono transition-all text-slate-400 hover:text-white cursor-pointer flex items-center gap-1';
        if (listBtn) listBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-mono transition-all bg-surface-800 text-emerald-300 shadow-sm cursor-pointer flex items-center gap-1';
        if (gridContainer) gridContainer.classList.add('hidden');
        if (listContainer) listContainer.classList.remove('hidden');
    }
}
window.setDocumentViewMode = setDocumentViewMode;

function openDocumentUploadModal(prefillCategory = null) {
    modalDocStagedFile = null;
    const titleInput = document.getElementById('modalDocTitleInput');
    const catSelect = document.getElementById('modalDocCategorySelect');
    const dateInput = document.getElementById('modalDocDateInput');
    const tagsInput = document.getElementById('modalDocTagsInput');
    const confCheck = document.getElementById('modalDocConfidentialCheck');
    const notesInput = document.getElementById('modalDocNotesInput');
    const fileInput = document.getElementById('modalDocFileInput');
    const fileChip = document.getElementById('modalDocSelectedFileInfo');

    if (titleInput) titleInput.value = '';
    if (catSelect) catSelect.value = prefillCategory || (docActiveCategoryFilter !== 'all' ? docActiveCategoryFilter : 'identity');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (tagsInput) tagsInput.value = '';
    if (confCheck) confCheck.checked = false;
    if (notesInput) notesInput.value = '';
    if (fileInput) fileInput.value = '';
    if (fileChip) fileChip.classList.add('hidden');

    openModal('documentUploadModal');
}
window.openDocumentUploadModal = openDocumentUploadModal;

function handleModalDocFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    stageDocumentFile(file);
}
window.handleModalDocFileSelect = handleModalDocFileSelect;

function handleModalDocDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('modalDocDropzone');
    if (el) el.classList.add('border-emerald-400', 'bg-emerald-500/10');
}
window.handleModalDocDragOver = handleModalDocDragOver;

function handleModalDocDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('modalDocDropzone');
    if (el) el.classList.remove('border-emerald-400', 'bg-emerald-500/10');
}
window.handleModalDocDragLeave = handleModalDocDragLeave;

function handleModalDocDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('modalDocDropzone');
    if (el) el.classList.remove('border-emerald-400', 'bg-emerald-500/10');

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        stageDocumentFile(e.dataTransfer.files[0]);
    }
}
window.handleModalDocDrop = handleModalDocDrop;

function handleDocDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('docDirectDropzone');
    if (el) el.classList.add('border-emerald-400', 'bg-emerald-500/10');
}
window.handleDocDragOver = handleDocDragOver;

function handleDocDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('docDirectDropzone');
    if (el) el.classList.remove('border-emerald-400', 'bg-emerald-500/10');
}
window.handleDocDragLeave = handleDocDragLeave;

function handleDocDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('docDirectDropzone');
    if (el) el.classList.remove('border-emerald-400', 'bg-emerald-500/10');

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        openDocumentUploadModal();
        stageDocumentFile(e.dataTransfer.files[0]);
    }
}
window.handleDocDrop = handleDocDrop;

function stageDocumentFile(file) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
        showToast('File too large! Max 10MB allowed per file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const isImg = file.type.startsWith('image/');

        modalDocStagedFile = {
            name: file.name,
            size: file.size,
            type: isPdf ? 'pdf' : (isImg ? 'photo' : 'other'),
            mimeType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
            data: evt.target.result
        };

        const fileChip = document.getElementById('modalDocSelectedFileInfo');
        const fileNameEl = document.getElementById('modalDocSelectedName');
        const fileMetaEl = document.getElementById('modalDocSelectedMeta');
        const fileIcon = document.getElementById('modalDocSelectedIcon');
        const titleInput = document.getElementById('modalDocTitleInput');

        if (fileNameEl) fileNameEl.innerText = file.name;
        if (fileMetaEl) fileMetaEl.innerText = `${(file.size / 1024).toFixed(1)} KB • ${file.type || 'Document'}`;
        if (fileIcon) {
            fileIcon.className = isPdf ? 'fa-solid fa-file-pdf text-rose-400 text-sm shrink-0' : (isImg ? 'fa-solid fa-image text-cyan-400 text-sm shrink-0' : 'fa-solid fa-file-lines text-emerald-400 text-sm shrink-0');
        }
        if (fileChip) fileChip.classList.remove('hidden');

        // Auto populate title if blank
        if (titleInput && !titleInput.value.trim()) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }
    };
    reader.readAsDataURL(file);
}

async function saveDocumentItem() {
    const titleInput = document.getElementById('modalDocTitleInput');
    const catSelect = document.getElementById('modalDocCategorySelect');
    const dateInput = document.getElementById('modalDocDateInput');
    const tagsInput = document.getElementById('modalDocTagsInput');
    const confCheck = document.getElementById('modalDocConfidentialCheck');
    const notesInput = document.getElementById('modalDocNotesInput');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
        showToast('Please enter a document title or description');
        return;
    }

    if (!Array.isArray(db.documents)) db.documents = [];

    const tags = (tagsInput ? tagsInput.value : '')
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => t.startsWith('#') ? t : `#${t}`);

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const fileData = modalDocStagedFile ? modalDocStagedFile.data : null;

    const newDoc = {
        id: docId,
        title: title,
        category: catSelect ? catSelect.value : 'identity',
        fileType: modalDocStagedFile ? modalDocStagedFile.type : 'pdf',
        mimeType: modalDocStagedFile ? modalDocStagedFile.mimeType : 'application/pdf',
        fileData: fileData,
        fileSize: modalDocStagedFile ? modalDocStagedFile.size : 124000,
        date: dateInput ? (dateInput.value || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        tags: tags,
        notes: notesInput ? notesInput.value.trim() : '',
        isConfidential: confCheck ? confCheck.checked : false,
        createdAt: new Date().toISOString()
    };

    if (fileData && window.vaultStorage) {
        try {
            await window.vaultStorage.saveFile(docId, fileData);
        } catch (e) {
            console.warn("Vault direct save error:", e);
        }
    }

    db.documents.unshift(newDoc);
    await saveDatabase(true);

    // Reset staged file & modal fields
    modalDocStagedFile = null;
    if (titleInput) titleInput.value = '';
    if (tagsInput) tagsInput.value = '';
    if (notesInput) notesInput.value = '';
    const fileChip = document.getElementById('modalDocSelectedFileInfo');
    if (fileChip) fileChip.classList.add('hidden');
    const fileInput = document.getElementById('docModalFileInput');
    if (fileInput) fileInput.value = '';

    closeModal('documentUploadModal');
    renderDocumentsPage();
    showToast(`Saved "${title}" to Documents Vault`);
}
window.saveDocumentItem = saveDocumentItem;

function renderDocumentsPage() {
    if (!Array.isArray(db.documents)) db.documents = [];

    const docs = db.documents;
    const searchVal = (document.getElementById('docSearchInput') ? document.getElementById('docSearchInput').value : '').toLowerCase().trim();

    // 1. Filter list
    let filtered = docs.filter(d => {
        // Top category filter
        if (docActiveCategoryFilter === 'pdf' && !(d.fileType === 'pdf' || (d.mimeType && d.mimeType.includes('pdf')))) return false;
        if (docActiveCategoryFilter === 'photo' && !(d.fileType === 'photo' || (d.mimeType && d.mimeType.startsWith('image/')))) return false;
        if (docActiveCategoryFilter === 'identity' && d.category !== 'identity') return false;
        if (docActiveCategoryFilter === 'financial' && d.category !== 'financial' && d.category !== 'receipts') return false;

        // Subcategory pill filter
        if (docActiveSubCategory !== 'all' && d.category !== docActiveSubCategory) return false;

        // Search filter
        if (searchVal) {
            const matchTitle = (d.title || '').toLowerCase().includes(searchVal);
            const matchNotes = (d.notes || '').toLowerCase().includes(searchVal);
            const matchCat = (d.category || '').toLowerCase().includes(searchVal);
            const matchTags = Array.isArray(d.tags) && d.tags.some(t => t.toLowerCase().includes(searchVal));
            if (!matchTitle && !matchNotes && !matchCat && !matchTags) return false;
        }

        return true;
    });

    // 2. Render Grid View
    const gridContainer = document.getElementById('documentsGridContainer');
    const tableBody = document.getElementById('documentsTableBody');

    if (gridContainer) {
        gridContainer.innerHTML = '';
        if (filtered.length === 0) {
            gridContainer.innerHTML = `
                <div class="col-span-full py-16 text-center space-y-3">
                    <div class="w-14 h-14 mx-auto rounded-2xl bg-surface-900 border border-surface-800 flex items-center justify-center text-slate-500">
                        <i class="fa-solid fa-folder-open text-2xl"></i>
                    </div>
                    <div class="text-white font-medium text-sm">No documents found</div>
                    <p class="text-xs font-mono text-slate-500 max-w-sm mx-auto">No files match your current category or search criteria. Click upload to secure new assets.</p>
                    <button onclick="openDocumentUploadModal()" class="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-mono transition-all">
                        + Upload Document
                    </button>
                </div>
            `;
        } else {
            filtered.forEach(d => {
                const isPdf = d.fileType === 'pdf' || (d.mimeType && d.mimeType.includes('pdf'));
                const isImg = d.fileType === 'photo' || (d.mimeType && d.mimeType.startsWith('image/'));
                const sizeText = d.fileSize ? (d.fileSize > 1024 * 1024 ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(d.fileSize / 1024)} KB`) : 'PDF Doc';

                const catBadge = getDocCategoryBadge(d.category);
                const tagPills = Array.isArray(d.tags) ? d.tags.slice(0, 3).map(t => `<span class="px-2 py-0.5 rounded-md bg-surface-900 border border-white/[0.04] text-[9px] font-mono text-slate-400">${t}</span>`).join('') : '';

                const card = document.createElement('div');
                card.className = 'premium-card p-4 flex flex-col justify-between group/dcard hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden';
                card.innerHTML = `
                    <div class="space-y-3">
                        <!-- Top Bar: Category & Confidential badge -->
                        <div class="flex items-center justify-between gap-2">
                            ${catBadge}
                            <div class="flex items-center gap-1.5">
                                ${d.isConfidential ? '<span class="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]" title="Executive Confidential"><i class="fa-solid fa-lock"></i></span>' : ''}
                                <span class="text-[10px] font-mono text-slate-500">${d.date || 'Active'}</span>
                            </div>
                        </div>

                        <!-- Center Media Preview / Icon -->
                        <div onclick="previewDocumentItem('${d.id}')" id="doc_card_preview_${d.id}" class="h-32 w-full rounded-xl bg-surface-950/80 border border-surface-800/80 flex flex-col items-center justify-center p-2 relative overflow-hidden group-hover/dcard:border-emerald-500/30 transition-all cursor-pointer">
                            ${isImg ? (d.fileData ? `
                                <img src="${d.fileData}" alt="${d.title}" class="w-full h-full object-cover rounded-lg group-hover/dcard:scale-105 transition-transform duration-300">
                                <div class="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover/dcard:opacity-100 transition-opacity">
                                    <span class="text-[10px] font-mono text-emerald-300 flex items-center gap-1"><i class="fa-solid fa-eye text-[9px]"></i> View Full Image</span>
                                </div>
                            ` : `
                                <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shadow-sm group-hover/dcard:scale-110 transition-transform">
                                    <i class="fa-solid fa-image text-2xl"></i>
                                </div>
                                <span class="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-1">
                                    <i class="fa-solid fa-expand text-[9px] text-cyan-400"></i> High-Res Photo
                                </span>
                            `) : `
                                <div class="w-12 h-12 rounded-2xl ${isPdf ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'} flex items-center justify-center shadow-sm group-hover/dcard:scale-110 transition-transform">
                                    <i class="fa-solid ${isPdf ? 'fa-file-pdf' : 'fa-file-shield'} text-2xl"></i>
                                </div>
                                <span class="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-1">
                                    <i class="fa-solid fa-expand text-[9px] text-emerald-400"></i> ${isPdf ? 'Open PDF Preview' : 'Preview Document'}
                                </span>
                            `}
                        </div>

                        <!-- Title & Meta -->
                        <div>
                            <h4 onclick="previewDocumentItem('${d.id}')" class="font-display text-sm font-bold text-white group-hover/dcard:text-emerald-300 transition-colors line-clamp-1 cursor-pointer" title="${d.title}">${d.title}</h4>
                            <p class="text-[10px] font-mono text-slate-400 mt-0.5">${sizeText} • ${isPdf ? 'PDF Document' : (isImg ? 'High-Res Photo' : 'Secure File')}</p>
                            ${d.notes ? `<p class="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-light">${d.notes}</p>` : ''}
                        </div>

                        <!-- Tags -->
                        ${tagPills ? `<div class="flex items-center gap-1 flex-wrap pt-1">${tagPills}</div>` : ''}
                    </div>

                    <!-- Footer Action Bar (Revealed smoothly on hover) -->
                    <div class="flex items-center justify-between pt-3 mt-3 border-t border-surface-800/80 text-xs">
                        <button onclick="previewDocumentItem('${d.id}')" class="text-slate-400 hover:text-emerald-300 text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer">
                            <i class="fa-regular fa-eye text-xs"></i> Preview
                        </button>
                        <div class="flex items-center gap-1 opacity-0 group-hover/dcard:opacity-100 transition-opacity duration-200">
                            <button onclick="openUniversalShare('document', '${d.id}', event)" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Share Options">
                                <i class="fa-solid fa-share-nodes text-xs"></i>
                            </button>
                            <button onclick="downloadDocumentItem('${d.id}')" class="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Download File">
                                <i class="fa-solid fa-download text-xs"></i>
                            </button>
                            <button onclick="openDocumentEditModal('${d.id}')" class="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Edit Metadata">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onclick="deleteDocumentItem('${d.id}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer" title="Delete Document">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </div>
                `;
                gridContainer.appendChild(card);

                // If image binary is not yet in memory, resolve in background and display immediately
                if (isImg && !d.fileData && window.vaultStorage) {
                    window.vaultStorage.getFile(d.id).then(url => {
                        if (url) {
                            d.fileData = url;
                            const prevBox = document.getElementById(`doc_card_preview_${d.id}`);
                            if (prevBox) {
                                prevBox.innerHTML = `
                                    <img src="${url}" alt="${d.title}" class="w-full h-full object-cover rounded-lg group-hover/dcard:scale-105 transition-transform duration-300">
                                    <div class="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover/dcard:opacity-100 transition-opacity">
                                        <span class="text-[10px] font-mono text-emerald-300 flex items-center gap-1"><i class="fa-solid fa-eye text-[9px]"></i> View Full Image</span>
                                    </div>
                                `;
                            }
                        }
                    }).catch(() => {});
                }
            });
        }
    }

    // 4. Render Table List View
    if (tableBody) {
        tableBody.innerHTML = '';
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500 font-light text-xs">No documents match the active filter.</td></tr>`;
        } else {
            filtered.forEach(d => {
                const isPdf = d.fileType === 'pdf' || (d.mimeType && d.mimeType.includes('pdf'));
                const isImg = d.fileType === 'photo' || (d.mimeType && d.mimeType.startsWith('image/'));
                const sizeText = d.fileSize ? (d.fileSize > 1024 * 1024 ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(d.fileSize / 1024)} KB`) : 'PDF';

                const tr = document.createElement('tr');
                tr.className = 'group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0';
                tr.innerHTML = `
                    <td class="p-3.5">
                        <div class="flex items-center gap-3 cursor-pointer" onclick="previewDocumentItem('${d.id}')">
                            <div class="w-8 h-8 rounded-lg ${isPdf ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : (isImg ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20')} flex items-center justify-center shrink-0">
                                <i class="fa-solid ${isPdf ? 'fa-file-pdf' : (isImg ? 'fa-image' : 'fa-file-lines')} text-xs"></i>
                            </div>
                            <div class="truncate">
                                <div class="font-medium text-white group-hover:text-emerald-300 transition-colors truncate">${d.title}</div>
                                <div class="text-[10px] font-mono text-slate-500 truncate">${d.notes || 'Encrypted record'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-3.5">${getDocCategoryBadge(d.category)}</td>
                    <td class="p-3.5 font-mono text-xs text-slate-400">${isPdf ? 'PDF Document' : (isImg ? 'Media Photo' : 'Record File')}</td>
                    <td class="p-3.5 font-mono text-xs text-slate-400">${sizeText}</td>
                    <td class="p-3.5 font-mono text-xs text-slate-400">${d.date || '-'}</td>
                    <td class="p-3.5 text-right">
                        <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="openUniversalShare('document', '${d.id}', event)" class="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Share Options">
                                <i class="fa-solid fa-share-nodes text-xs"></i>
                            </button>
                            <button onclick="previewDocumentItem('${d.id}')" class="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Preview">
                                <i class="fa-solid fa-eye text-xs"></i>
                            </button>
                            <button onclick="downloadDocumentItem('${d.id}')" class="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Download">
                                <i class="fa-solid fa-download text-xs"></i>
                            </button>
                            <button onclick="openDocumentEditModal('${d.id}')" class="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer" title="Edit">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onclick="deleteDocumentItem('${d.id}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer" title="Delete">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }
}
window.renderDocumentsPage = renderDocumentsPage;

function getDocCategoryBadge(cat) {
    switch ((cat || '').toLowerCase()) {
        case 'identity':
            return '<span class="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Identity</span>';
        case 'legal':
            return '<span class="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Legal Deed</span>';
        case 'financial':
            return '<span class="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Financial</span>';
        case 'business':
            return '<span class="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Business</span>';
        case 'receipts':
            return '<span class="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Receipts</span>';
        case 'personal':
            return '<span class="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Personal</span>';
        case 'medical':
            return '<span class="px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Medical</span>';
        default:
            return '<span class="px-2 py-0.5 rounded-md bg-surface-800 border border-surface-700 text-slate-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Document</span>';
    }
}

let currentPreviewDocId = null;

async function previewDocumentItem(id) {
    if (!Array.isArray(db.documents)) return;
    const doc = db.documents.find(x => x.id === id);
    if (!doc) return;

    currentPreviewDocId = id;
    window.currentPreviewDocId = id;

    const iconEl = document.getElementById('docViewerTypeIcon');
    const titleEl = document.getElementById('docViewerTitle');
    const confBadge = document.getElementById('docViewerConfidentialBadge');
    const catEl = document.getElementById('docViewerCategory');
    const dateEl = document.getElementById('docViewerDate');
    const sizeEl = document.getElementById('docViewerSize');
    const stageEl = document.getElementById('docViewerStage');
    const notesEl = document.getElementById('docViewerNotesText');
    const tagsContainer = document.getElementById('docViewerTagsContainer');
    const downloadBtn = document.getElementById('docViewerDownloadBtn');
    const editBtn = document.getElementById('docViewerEditBtn');
    const deleteBtn = document.getElementById('docViewerDeleteBtn');

    const isPdf = doc.fileType === 'pdf' || (doc.mimeType && doc.mimeType.includes('pdf'));
    const isImg = doc.fileType === 'photo' || (doc.mimeType && doc.mimeType.startsWith('image/'));

    if (titleEl) titleEl.innerText = doc.title;
    if (confBadge) {
        if (doc.isConfidential) confBadge.classList.remove('hidden');
        else confBadge.classList.add('hidden');
    }
    if (catEl) catEl.innerText = (doc.category || 'General').toUpperCase();
    if (dateEl) dateEl.innerText = doc.date || 'Active';
    if (sizeEl) sizeEl.innerText = doc.fileSize ? (doc.fileSize > 1024 * 1024 ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(doc.fileSize / 1024)} KB`) : 'Standard';

    if (iconEl) {
        iconEl.innerHTML = `<i class="fa-solid ${isPdf ? 'fa-file-pdf text-rose-400' : (isImg ? 'fa-image text-cyan-400' : 'fa-file-shield text-emerald-400')} text-base"></i>`;
    }

    if (notesEl) {
        notesEl.innerText = doc.notes || 'No confidential executive notes logged for this document.';
    }

    if (tagsContainer) {
        tagsContainer.innerHTML = Array.isArray(doc.tags) && doc.tags.length > 0
            ? doc.tags.map(t => `<span class="px-2 py-0.5 rounded-md bg-surface-800 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">${t}</span>`).join('')
            : '';
    }

    if (downloadBtn) {
        downloadBtn.onclick = () => downloadDocumentItem(doc.id);
    }
    if (editBtn) {
        editBtn.onclick = () => {
            closeModal('documentViewerModal');
            openDocumentEditModal(doc.id);
        };
    }
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            closeModal('documentViewerModal');
            deleteDocumentItem(doc.id);
        };
    }

    // Open modal immediately
    openModal('documentViewerModal');

    // Asynchronously resolve file binary if not cached in memory
    if (!doc.fileData && (doc.hasBinary || isPdf || isImg)) {
        if (stageEl) {
            stageEl.innerHTML = `
                <div class="text-center space-y-3 py-16">
                    <i class="fa-solid fa-circle-notch fa-spin text-3xl text-emerald-400"></i>
                    <div class="text-xs font-mono text-slate-300">Decrypting & loading document binary...</div>
                </div>
            `;
        }
        if (window.getOrFetchVaultFile) {
            const fetched = await window.getOrFetchVaultFile(doc.id);
            if (fetched) doc.fileData = fetched;
        }
    }

    // Render Stage
    if (stageEl) {
        stageEl.innerHTML = '';
        if (isImg && doc.fileData) {
            stageEl.innerHTML = `
                <div class="w-full h-full flex items-center justify-center p-2">
                    <img src="${doc.fileData}" alt="${doc.title}" class="max-h-[68vh] max-w-full rounded-xl shadow-2xl object-contain border border-surface-800">
                </div>
            `;
        } else if (isPdf && doc.fileData) {
            // Render High Fidelity Interactive PDF via PDF.js Canvas + Direct Native Controls
            stageEl.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-between relative">
                    <!-- PDF Controls Toolbar -->
                    <div class="w-full flex items-center justify-between px-4 py-2 bg-surface-900/90 border-b border-surface-800/80 rounded-t-xl shrink-0">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                                <i class="fa-solid fa-file-pdf text-rose-400"></i> PDF Reader
                            </span>
                            <span id="pdfPageInfo" class="text-[11px] font-mono text-slate-400">Page 1</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button id="pdfPrevBtn" class="px-2.5 py-1 bg-surface-800 hover:bg-surface-700 text-slate-300 text-xs font-mono rounded-lg transition-colors cursor-pointer" title="Previous Page">
                                <i class="fa-solid fa-chevron-left text-[10px]"></i> Prev
                            </button>
                            <button id="pdfNextBtn" class="px-2.5 py-1 bg-surface-800 hover:bg-surface-700 text-slate-300 text-xs font-mono rounded-lg transition-colors cursor-pointer" title="Next Page">
                                Next <i class="fa-solid fa-chevron-right text-[10px]"></i>
                            </button>
                            <button id="pdfZoomOutBtn" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer" title="Zoom Out">
                                <i class="fa-solid fa-magnifying-glass-minus text-xs"></i>
                            </button>
                            <button id="pdfZoomInBtn" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer" title="Zoom In">
                                <i class="fa-solid fa-magnifying-glass-plus text-xs"></i>
                            </button>
                            <button onclick="downloadDocumentItem('${doc.id}')" class="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono rounded-lg transition-colors cursor-pointer flex items-center gap-1">
                                <i class="fa-solid fa-download text-xs"></i> Save
                            </button>
                        </div>
                    </div>

                    <!-- PDF Canvas Area -->
                    <div id="pdfCanvasContainer" class="flex-1 w-full overflow-auto flex items-center justify-center p-4 custom-scrollbar bg-surface-950/90">
                        <div id="pdfLoadingSpinner" class="text-center space-y-2 py-10">
                            <i class="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-400"></i>
                            <div class="text-xs font-mono text-slate-400">Rendering high-resolution document...</div>
                        </div>
                        <canvas id="pdfViewerCanvas" class="hidden shadow-2xl rounded-lg border border-surface-800 max-w-full bg-white"></canvas>
                        <object id="pdfFallbackObject" data="${doc.fileData}" type="application/pdf" class="hidden w-full h-[62vh] rounded-xl border border-surface-800">
                            <embed src="${doc.fileData}" type="application/pdf" class="w-full h-[62vh] rounded-xl" />
                        </object>
                    </div>
                </div>
            `;

            // Initialize PDF.js Renderer
            setTimeout(() => {
                renderPdfDataWithPdfJs(doc.fileData);
            }, 50);
        } else {
            stageEl.innerHTML = `
                <div class="p-8 text-center space-y-4 max-w-md mx-auto">
                    <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                        <i class="fa-solid ${isPdf ? 'fa-file-pdf text-rose-400' : 'fa-file-shield'} text-3xl"></i>
                    </div>
                    <div>
                        <h4 class="text-white font-semibold text-base">${doc.title}</h4>
                        <p class="text-xs font-mono text-slate-400 mt-1">Encrypted ${isPdf ? 'PDF Document' : 'Media Asset'} secured in your Private Vault.</p>
                    </div>
                    <button onclick="downloadDocumentItem('${doc.id}')" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-surface-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-md">
                        <i class="fa-solid fa-download mr-1.5"></i> Download File
                    </button>
                </div>
            `;
        }
    }
}
window.previewDocumentItem = previewDocumentItem;

// High-fidelity PDF rendering engine using PDF.js with canvas and interactive pagination
let currentPdfDoc = null;
let currentPdfPage = 1;
let currentPdfScale = 1.3;

function renderPdfDataWithPdfJs(pdfDataUri) {
    const canvas = document.getElementById('pdfViewerCanvas');
    const spinner = document.getElementById('pdfLoadingSpinner');
    const fallbackObj = document.getElementById('pdfFallbackObject');
    const pageInfo = document.getElementById('pdfPageInfo');
    const prevBtn = document.getElementById('pdfPrevBtn');
    const nextBtn = document.getElementById('pdfNextBtn');
    const zoomInBtn = document.getElementById('pdfZoomInBtn');
    const zoomOutBtn = document.getElementById('pdfZoomOutBtn');

    if (!window.pdfjsLib) {
        // Fallback to native object tag if PDF.js library is not yet loaded
        if (spinner) spinner.classList.add('hidden');
        if (fallbackObj) fallbackObj.classList.remove('hidden');
        return;
    }

    try {
        // Convert Base64 dataURI to Uint8Array if necessary
        let loadingTask;
        if (pdfDataUri.startsWith('data:')) {
            const rawBase64 = pdfDataUri.split(',')[1];
            const raw = window.atob(rawBase64);
            const rawLength = raw.length;
            const array = new Uint8Array(new ArrayBuffer(rawLength));
            for (let i = 0; i < rawLength; i++) {
                array[i] = raw.charCodeAt(i);
            }
            loadingTask = window.pdfjsLib.getDocument({ data: array });
        } else {
            loadingTask = window.pdfjsLib.getDocument(pdfDataUri);
        }

        loadingTask.promise.then(pdf => {
            currentPdfDoc = pdf;
            currentPdfPage = 1;
            currentPdfScale = 1.3;

            function renderPage(pageNum) {
                if (!currentPdfDoc || !canvas) return;
                currentPdfDoc.getPage(pageNum).then(page => {
                    const ctx = canvas.getContext('2d');
                    const viewport = page.getViewport({ scale: currentPdfScale });

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: ctx,
                        viewport: viewport
                    };

                    page.render(renderContext).promise.then(() => {
                        if (spinner) spinner.classList.add('hidden');
                        if (canvas) canvas.classList.remove('hidden');
                        if (pageInfo) pageInfo.innerText = `Page ${pageNum} of ${currentPdfDoc.numPages}`;
                    });
                });
            }

            renderPage(currentPdfPage);

            if (prevBtn) {
                prevBtn.onclick = () => {
                    if (currentPdfPage <= 1) return;
                    currentPdfPage--;
                    renderPage(currentPdfPage);
                };
            }

            if (nextBtn) {
                nextBtn.onclick = () => {
                    if (!currentPdfDoc || currentPdfPage >= currentPdfDoc.numPages) return;
                    currentPdfPage++;
                    renderPage(currentPdfPage);
                };
            }

            if (zoomInBtn) {
                zoomInBtn.onclick = () => {
                    if (currentPdfScale >= 2.5) return;
                    currentPdfScale += 0.25;
                    renderPage(currentPdfPage);
                };
            }

            if (zoomOutBtn) {
                zoomOutBtn.onclick = () => {
                    if (currentPdfScale <= 0.6) return;
                    currentPdfScale -= 0.25;
                    renderPage(currentPdfPage);
                };
            }
        }).catch(err => {
            console.error('PDF.js rendering exception, falling back to browser object', err);
            if (spinner) spinner.classList.add('hidden');
            if (fallbackObj) fallbackObj.classList.remove('hidden');
        });
    } catch (e) {
        console.error('PDF loading error:', e);
        if (spinner) spinner.classList.add('hidden');
        if (fallbackObj) fallbackObj.classList.remove('hidden');
    }
}
window.renderPdfDataWithPdfJs = renderPdfDataWithPdfJs;

function openDocumentEditModal(id) {
    if (!Array.isArray(db.documents)) return;
    const doc = db.documents.find(x => x.id === id);
    if (!doc) return;

    const idInput = document.getElementById('editDocIdInput');
    const titleInput = document.getElementById('editDocTitleInput');
    const catSelect = document.getElementById('editDocCategorySelect');
    const tagsInput = document.getElementById('editDocTagsInput');
    const notesInput = document.getElementById('editDocNotesInput');

    if (idInput) idInput.value = doc.id;
    if (titleInput) titleInput.value = doc.title || '';
    if (catSelect) catSelect.value = doc.category || 'identity';
    if (tagsInput) tagsInput.value = Array.isArray(doc.tags) ? doc.tags.join(', ') : '';
    if (notesInput) notesInput.value = doc.notes || '';

    openModal('documentEditModal');
}
window.openDocumentEditModal = openDocumentEditModal;

function submitEditDocument() {
    const idInput = document.getElementById('editDocIdInput');
    const titleInput = document.getElementById('editDocTitleInput');
    const catSelect = document.getElementById('editDocCategorySelect');
    const tagsInput = document.getElementById('editDocTagsInput');
    const notesInput = document.getElementById('editDocNotesInput');

    const id = idInput ? idInput.value : null;
    if (!id || !Array.isArray(db.documents)) return;

    const doc = db.documents.find(x => x.id === id);
    if (!doc) return;

    doc.title = titleInput ? titleInput.value.trim() || doc.title : doc.title;
    doc.category = catSelect ? catSelect.value : doc.category;
    doc.tags = (tagsInput ? tagsInput.value : '')
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => t.startsWith('#') ? t : `#${t}`);
    doc.notes = notesInput ? notesInput.value.trim() : '';

    saveDatabase();
    closeModal('documentEditModal');
    renderDocumentsPage();
    showToast(`Updated document "${doc.title}"`);
}
window.submitEditDocument = submitEditDocument;

async function downloadDocumentItem(id) {
    if (!Array.isArray(db.documents)) return;
    const doc = db.documents.find(x => x.id === id);
    if (!doc) return;

    if (!doc.fileData && window.getOrFetchVaultFile) {
        const fetched = await window.getOrFetchVaultFile(doc.id);
        if (fetched) doc.fileData = fetched;
    }

    if (doc.fileData) {
        const a = document.createElement('a');
        a.href = doc.fileData;
        a.download = doc.title ? `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${doc.fileType === 'photo' ? 'jpg' : 'pdf'}` : 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`Downloading "${doc.title}"`);
    } else {
        // Fallback synthetic download if data is a seed or placeholder
        const blob = new Blob([`Executive Document: ${doc.title}\nCategory: ${doc.category}\nDate: ${doc.date}\nNotes: ${doc.notes || 'None'}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast(`Exported "${doc.title}" summary record`);
    }
}
window.downloadDocumentItem = downloadDocumentItem;

function deleteDocumentItem(id) {
    requireConfirmation('Delete this document from your vault?', () => {
        if (!Array.isArray(db.documents)) return;
        const item = db.documents.find(x => x.id === id);
        const idx = db.documents.findIndex(x => x.id === id);

        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'document',
                label: `Document: ${item.title || 'Document Record'}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }

        // Remove from memory and cloud/local vault storage
        if (window.vaultStorage) window.vaultStorage.deleteFile(id);
        if (window.deleteVaultFileFromCloud) window.deleteVaultFileFromCloud(id);

        db.documents = db.documents.filter(x => x.id !== id);
        saveDatabase();
        renderDocumentsPage();
    });
}
window.deleteDocumentItem = deleteDocumentItem;

// ==========================================
// UNIVERSAL SHARE ENGINE & DIRECT SHARE CHANNELS
// ==========================================
window.currentSharePayload = null;

function formatItemSharePayload(type, id) {
    let title = 'Executive Vault Item';
    let subject = 'Shared from Executive Vault';
    let shareText = '';
    let excerpt = '';
    let badgeHtml = '<span class="px-2 py-0.5 rounded-md bg-surface-800 text-slate-300 font-mono text-[9px] uppercase">Item</span>';

    if (type === 'note') {
        const note = (db.notes || []).find(x => x.id === id);
        if (note) {
            title = note.title || 'Untitled Note';
            subject = `Note: ${title}`;
            const temp = document.createElement('div');
            temp.innerHTML = note.body || note.content || '';
            const plainText = temp.innerText.trim();
            excerpt = plainText.length > 280 ? plainText.substring(0, 280) + '...' : (plainText || 'No content');
            
            shareText = `📌 *${title}*\n📁 Category: ${note.category || 'General'} | 📅 Date: ${note.date || 'Active'}\n\n${plainText}\n\n— Shared securely from Executive Vault`;
            badgeHtml = `<span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[9px] uppercase font-bold">Note</span>`;
        }
    } else if (type === 'document') {
        const doc = (db.documents || []).find(x => x.id === id);
        if (doc) {
            title = doc.title || 'Document Record';
            subject = `Document: ${title}`;
            excerpt = doc.notes || `Category: ${doc.category || 'General'} • Date: ${doc.date || 'Active'}`;
            const isPdf = doc.fileType === 'pdf' || (doc.mimeType && doc.mimeType.includes('pdf'));
            const isImg = doc.fileType === 'photo' || (doc.mimeType && doc.mimeType.startsWith('image/'));
            const fileKind = isPdf ? 'PDF Document' : (isImg ? 'Photo Asset' : 'Secure File');

            shareText = `📄 *Document: ${title}*\n📂 Category: ${(doc.category || 'General').toUpperCase()} | 📎 Type: ${fileKind} | 📅 Date: ${doc.date || 'Active'}${doc.notes ? `\n\n📝 Notes:\n${doc.notes}` : ''}\n\n— Shared securely from Executive Vault`;
            badgeHtml = `<span class="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-[9px] uppercase font-bold">Document</span>`;
        }
    } else if (type === 'favorite') {
        const fav = (db.favorites || []).find(x => x.id === id);
        if (fav) {
            if (fav.type === 'quote') {
                title = `Quote by ${fav.author || 'Anonymous'}`;
                subject = `Quote: ${fav.author || 'Inspiration'}`;
                excerpt = `"${fav.content || ''}" — ${fav.author || 'Anonymous'}`;
                shareText = `💬 *Quote*\n\n"${fav.content || ''}"\n— ${fav.author || 'Anonymous'}${fav.date ? ` (${fav.date})` : ''}\n\n— Shared from Executive Vault`;
                badgeHtml = `<span class="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[9px] uppercase font-bold">Quote</span>`;
            } else {
                title = fav.title || 'Photo Memory';
                subject = `Photo: ${title}`;
                excerpt = fav.notes || fav.date || 'High-Resolution Vault Photo';
                const photoSrc = fav.photoUrl ? `\n🖼️ Link: ${fav.photoUrl}` : '';
                shareText = `📸 *${title}*${photoSrc}${fav.date ? `\n📅 Date: ${fav.date}` : ''}${fav.notes ? `\n📝 Notes: ${fav.notes}` : ''}\n\n— Shared from Executive Vault`;
                badgeHtml = `<span class="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono text-[9px] uppercase font-bold">Photo</span>`;
            }
        }
    }

    return { type, id, title, subject, shareText, excerpt, badgeHtml };
}
window.formatItemSharePayload = formatItemSharePayload;

function shareItemDirect(type, id, channel, event) {
    if (event && event.stopPropagation) event.stopPropagation();
    
    const payload = formatItemSharePayload(type, id);
    if (!payload || !payload.shareText) {
        showToast('Item content not available to share.');
        return;
    }

    window.currentSharePayload = payload;

    if (channel === 'whatsapp') {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(payload.shareText)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening WhatsApp...');
    } else if (channel === 'email') {
        const mailtoUrl = `mailto:?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.shareText)}`;
        window.location.href = mailtoUrl;
        showToast('Opening Email Client...');
    } else if (channel === 'copy') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(payload.shareText).then(() => {
                showToast('Item text copied to clipboard!');
            }).catch(() => {
                showToast('Text ready to paste!');
            });
        } else {
            showToast('Text copied!');
        }
    } else {
        openUniversalShare(type, id);
    }
}
window.shareItemDirect = shareItemDirect;

function openUniversalShare(type, id, event) {
    if (event && event.stopPropagation) event.stopPropagation();

    const payload = formatItemSharePayload(type, id);
    if (!payload) return;

    window.currentSharePayload = payload;

    const badgeEl = document.getElementById('shareItemTypeBadge');
    const titleEl = document.getElementById('shareItemTitlePreview');
    const contentEl = document.getElementById('shareItemContentPreview');
    const customMsgEl = document.getElementById('shareCustomMessageInput');

    if (badgeEl) badgeEl.innerHTML = payload.badgeHtml;
    if (titleEl) titleEl.innerText = payload.title;
    if (contentEl) contentEl.innerText = payload.excerpt;
    if (customMsgEl) customMsgEl.value = '';

    openModal('universalShareModal');
}
window.openUniversalShare = openUniversalShare;

function executeShareWhatsApp() {
    if (!window.currentSharePayload) return;
    const customMsg = (document.getElementById('shareCustomMessageInput')?.value || '').trim();
    let textToSend = window.currentSharePayload.shareText;
    if (customMsg) {
        textToSend = `💬 *Note:* ${customMsg}\n\n${textToSend}`;
    }
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToSend)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    closeModal('universalShareModal');
    showToast('Opening WhatsApp...');
}
window.executeShareWhatsApp = executeShareWhatsApp;

function executeShareEmail() {
    if (!window.currentSharePayload) return;
    const customMsg = (document.getElementById('shareCustomMessageInput')?.value || '').trim();
    let textToSend = window.currentSharePayload.shareText;
    if (customMsg) {
        textToSend = `Note from sender: ${customMsg}\n\n--------------------\n\n${textToSend}`;
    }
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(window.currentSharePayload.subject)}&body=${encodeURIComponent(textToSend)}`;
    window.location.href = mailtoUrl;
    closeModal('universalShareModal');
    showToast('Opening Email Client...');
}
window.executeShareEmail = executeShareEmail;

function copyShareModalText() {
    if (!window.currentSharePayload) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.currentSharePayload.shareText).then(() => {
            showToast('Share content copied to clipboard!');
            closeModal('universalShareModal');
        }).catch(() => {
            showToast('Share content copied!');
            closeModal('universalShareModal');
        });
    } else {
        showToast('Share content copied!');
        closeModal('universalShareModal');
    }
}
window.copyShareModalText = copyShareModalText;

// Shortcuts from open viewer modals
function shareCurrentViewNote(channel) {
    const idEl = document.getElementById('currentViewNoteId');
    const id = (idEl && idEl.value) || window.currentViewNoteId;
    if (!id) {
        showToast('No note selected to share');
        return;
    }
    if (channel === 'modal') {
        openUniversalShare('note', id);
    } else {
        shareItemDirect('note', id, channel);
    }
}
window.shareCurrentViewNote = shareCurrentViewNote;

function openShareForCurrentViewNote() {
    shareCurrentViewNote('modal');
}
window.openShareForCurrentViewNote = openShareForCurrentViewNote;

function shareCurrentPreviewDoc(channel) {
    const id = window.currentPreviewDocId;
    if (!id) {
        showToast('No document selected to share');
        return;
    }
    if (channel === 'modal') {
        openUniversalShare('document', id);
    } else {
        shareItemDirect('document', id, channel);
    }
}
window.shareCurrentPreviewDoc = shareCurrentPreviewDoc;

function openShareForCurrentPreviewDoc() {
    shareCurrentPreviewDoc('modal');
}
window.openShareForCurrentPreviewDoc = openShareForCurrentPreviewDoc;



