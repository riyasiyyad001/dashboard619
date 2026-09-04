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
    credentials: [],
    credentialVault: {
        passcode: '1234',
        hint: 'Default PIN is 1234',
        lastChanged: Date.now()
    },
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
            name: 'Executive Leader',
            subtitle: 'Financial Operating System',
            headquartersBadge: 'Executive Headquarters',
            protocolPillText: 'High-Net-Worth Wealth & Operations Protocol',
            principlesTitle: 'Determine to Overcome',
            contact1: '',
            contact2: '',
            whatsapp: '',
            gmail: '',
            facebook: '',
            instagram: '',
            photo: '',
            address: ''
        };
    }
    if (data.profile) {
        if (data.profile.name === undefined) data.profile.name = 'Executive Leader';
        if (data.profile.subtitle === undefined) data.profile.subtitle = 'Financial Operating System';
        if (data.profile.headquartersBadge === undefined) data.profile.headquartersBadge = 'Executive Headquarters';
        if (data.profile.protocolPillText === undefined) data.profile.protocolPillText = 'High-Net-Worth Wealth & Operations Protocol';
        if (data.profile.principlesTitle === undefined) data.profile.principlesTitle = 'Determine to Overcome';
        if (data.profile.contact1 === undefined) data.profile.contact1 = '';
        if (data.profile.contact2 === undefined) data.profile.contact2 = '';
        if (data.profile.whatsapp === undefined) data.profile.whatsapp = '';
        if (data.profile.gmail === undefined) data.profile.gmail = '';
        if (data.profile.facebook === undefined) data.profile.facebook = '';
        if (data.profile.instagram === undefined) data.profile.instagram = '';
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
    if (!data.uiState || typeof data.uiState !== 'object') data.uiState = {};
    if (!data.uiState.notes || typeof data.uiState.notes !== 'object') {
        data.uiState.notes = { viewMode: 'grid', category: 'all', color: 'all', sortBy: 'pinned' };
    }
    if (!data.preferences || typeof data.preferences !== 'object') data.preferences = {};
    if (!data.vault || typeof data.vault !== 'object') data.vault = { documents: [], captures: [] };
    if (!Array.isArray(data.vault.documents)) data.vault.documents = [];
    if (!Array.isArray(data.vault.captures)) data.vault.captures = [];
    if (!data.bgConfig || typeof data.bgConfig !== 'object') data.bgConfig = { opacity: 0.2, solidColor: '#0f172a', imgUrl: '' };
    if (!data.navCustomTitles || typeof data.navCustomTitles !== 'object') data.navCustomTitles = {};
    if (!Array.isArray(data.credentials)) data.credentials = [];
    if (!data.credentialVault || typeof data.credentialVault !== 'object') {
        data.credentialVault = {
            passcode: '1234',
            hint: 'Default PIN is 1234',
            lastChanged: Date.now()
        };
    }
    if (!data.credentialVault.passcode) data.credentialVault.passcode = '1234';
    if (!data.credentialVault.hint) data.credentialVault.hint = 'Default PIN is 1234';

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
                preferences: { ...(db.preferences || {}), ...(parsed.preferences || {}) },
                uiState: { ...(db.uiState || {}), ...(parsed.uiState || {}) }
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
                        preferences: { ...(db.preferences || {}), ...(idbState.preferences || {}) },
                        uiState: { ...(db.uiState || {}), ...(idbState.uiState || {}) }
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
    if (!db.theme || db.theme === 'theme-gradient') {
        db.theme = 'theme-military';
    }
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('dark', 'theme-green', 'theme-black', 'theme-light', 'theme-military', 'theme-gradient');
    if (db.theme === 'theme-green' || db.theme === 'theme-black' || db.theme === 'theme-military') htmlEl.classList.add('dark');
    htmlEl.classList.add(db.theme);
    currentThemeIndex = themes.indexOf(db.theme);
    if (currentThemeIndex === -1) currentThemeIndex = 0;
    
    setTimeout(() => {
        const icon = document.getElementById('themeToggleIcon');
        if (icon) {
            if (db.theme === 'theme-military') icon.className = 'fa-solid fa-shield-halved fa-fw text-sm text-[#a3c99a] group-hover:scale-110 transition-transform duration-300';
            else if (db.theme === 'theme-green') icon.className = 'fa-solid fa-leaf fa-fw text-sm group-hover:-rotate-12 transition-transform duration-300';
            else if (db.theme === 'theme-black') icon.className = 'fa-solid fa-moon fa-fw text-sm group-hover:-rotate-12 transition-transform duration-300';
            else icon.className = 'fa-solid fa-sun fa-fw text-sm group-hover:rotate-90 transition-transform duration-300';
        }
    }, 100);

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

    // Restore last active page if saved
    try {
        const savedActivePage = localStorage.getItem('executive_active_page');
        if (savedActivePage && savedActivePage !== 'home' && document.getElementById(`page-${savedActivePage}`)) {
            switchPage(savedActivePage);
        }
    } catch (e) {}
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
    if (typeof renderDocumentsPage === 'function') renderDocumentsPage();
    if (typeof renderCredentialsVault === 'function') renderCredentialsVault();
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

const themes = ['theme-military', 'theme-green', 'theme-black', 'theme-light'];
let currentThemeIndex = 0;

function toggleTheme() {
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('dark', 'theme-green', 'theme-black', 'theme-light', 'theme-military', 'theme-gradient');
    
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];
    
    if (newTheme === 'theme-green' || newTheme === 'theme-black' || newTheme === 'theme-military') {
        htmlEl.classList.add('dark');
    }
    htmlEl.classList.add(newTheme);
    
    const icon = document.getElementById('themeToggleIcon');
    if (newTheme === 'theme-military') {
        icon.className = 'fa-solid fa-shield-halved fa-fw text-sm text-[#a3c99a] group-hover:scale-110 transition-transform duration-300';
        showToast('Tactical Military Theme Applied');
    } else if (newTheme === 'theme-green') {
        icon.className = 'fa-solid fa-leaf fa-fw text-sm group-hover:-rotate-12 transition-transform duration-300';
        showToast('Cyber Nature Theme Applied');
    } else if (newTheme === 'theme-black') {
        icon.className = 'fa-solid fa-moon fa-fw text-sm group-hover:-rotate-12 transition-transform duration-300';
        showToast('OLED Black Theme Applied');
    } else if (newTheme === 'theme-light') {
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
    try {
        localStorage.setItem('executive_active_page', pageId);
    } catch (e) {}
    document.querySelectorAll('.page-view').forEach(p => p.classList.add('hidden'));
    
    const target = document.getElementById(`page-${pageId}`);
    if (target) {
        target.classList.remove('hidden');
    }
    renderNavTabs();

    if (pageId === 'graphs') {
        if (typeof renderFinancialIntelligencePage === 'function') renderFinancialIntelligencePage();
    } else if (pageId === 'documents') {
        const savedSubTab = (typeof window !== 'undefined' && window.activeDocumentSubTab) ? window.activeDocumentSubTab : (localStorage.getItem('executive_doc_subtab') || 'files');
        if (typeof setDocumentSubTab === 'function') {
            setDocumentSubTab(savedSubTab);
        } else {
            if (typeof renderDocumentsPage === 'function') renderDocumentsPage();
            if (typeof renderCredentialsVault === 'function') renderCredentialsVault();
        }
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
    const titleEl = document.getElementById('homePrinciplesTitle');

    if (nameEl) db.profile.name = nameEl.innerText.trim();
    if (subtitleEl) db.profile.subtitle = subtitleEl.innerText.trim();
    if (hqBadgeEl) db.profile.headquartersBadge = hqBadgeEl.innerText.trim();
    if (protocolPillEl) db.profile.protocolPillText = protocolPillEl.innerText.trim();
    if (titleEl) db.profile.principlesTitle = titleEl.innerText.trim();

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

    if (nameEl && document.activeElement !== nameEl) {
        nameEl.innerText = db.profile.name !== undefined ? db.profile.name : 'Executive Leader';
    }
    if (subtitleEl && document.activeElement !== subtitleEl) {
        subtitleEl.innerText = db.profile.subtitle !== undefined ? db.profile.subtitle : 'Financial Operating System';
    }
    if (hqBadgeEl && document.activeElement !== hqBadgeEl) {
        hqBadgeEl.innerText = db.profile.headquartersBadge !== undefined ? db.profile.headquartersBadge : 'Executive Headquarters';
    }
    if (protocolPillEl && document.activeElement !== protocolPillEl) {
        protocolPillEl.innerText = db.profile.protocolPillText !== undefined ? db.profile.protocolPillText : 'High-Net-Worth Wealth & Operations Protocol';
    }
    if (photoEl && db.profile.photo) {
        photoEl.src = db.profile.photo;
    }
    if (titleEl && document.activeElement !== titleEl) {
        titleEl.innerText = db.profile.principlesTitle !== undefined ? db.profile.principlesTitle : 'Determine to Overcome';
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
            case 'document':
                if (!db.documents) db.documents = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.documents.length) {
                    db.documents.splice(item.originalIndex, 0, item.data);
                } else {
                    db.documents.push(item.data);
                }
                if (typeof renderDocumentsPage === 'function') renderDocumentsPage();
                restored = true;
                break;
            case 'credential':
                if (!db.credentials) db.credentials = [];
                if (typeof item.originalIndex === 'number' && item.originalIndex >= 0 && item.originalIndex <= db.credentials.length) {
                    db.credentials.splice(item.originalIndex, 0, item.data);
                } else {
                    db.credentials.push(item.data);
                }
                if (typeof renderCredentialsVault === 'function') renderCredentialsVault();
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
        btn.disabled = false;
        btn.classList.remove('cursor-not-allowed', 'pointer-events-none');
        btn.classList.add('cursor-pointer');
        if (count > 0) {
            btn.setAttribute('title', `Undo last delete: ${lastItem ? (lastItem.label || 'Item') : ''} (Ctrl+Z)`);
            btn.classList.add('text-brand-400');
            btn.classList.remove('text-slate-500/70');
        } else {
            btn.setAttribute('title', 'Undo (Ctrl+Z)');
            btn.classList.remove('text-brand-400');
            btn.classList.add('text-slate-500/70');
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
