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
        <td class="py-px px-1"><div class="px-3 py-2 border border-amber-500/25 rounded-xl flex items-center h-full bg-amber-500/5 group-hover:bg-amber-500/10 font-bold text-amber-400/80 transition-colors">Auto-Synced (QR ${qatarAssetsTotalQr.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})</div></td>
        <td class="py-px px-1"><div class="px-3 py-2 border border-amber-500/25 rounded-xl text-right font-bold font-mono text-amber-400 flex items-center justify-end h-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors">₹${qatarAssetsTotalRs.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div></td>
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
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl text-right font-bold font-mono text-amber-400 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">QR ${qrVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl text-right font-mono text-slate-400 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors text-xs">₹${perQr.toFixed(2)}</div></td>
                <td class="py-px px-1"><div class="px-3 py-2.5 border border-slate-500/25 rounded-xl text-right font-bold font-mono text-emerald-400 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${inrVal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div></td>
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

    if (totalQrEl) totalQrEl.innerText = `QR ${totalQr.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (totalInrEl) totalInrEl.innerText = `₹${totalInr.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (countEl) countEl.innerText = `${sortedList.length} ${sortedList.length === 1 ? 'Holding' : 'Holdings'}`;

    // Render footer totals
    const foot = document.getElementById('qatarAssetsTableFoot');
    if (foot) {
        foot.innerHTML = `
            <tr class="border-t border-surface-800 bg-surface-900/90 font-bold">
                <td colspan="4" class="py-3.5 px-4 text-right uppercase tracking-widest text-slate-400 text-[10px]">Total Qatar Portfolio Valuation:</td>
                <td class="py-3.5 px-4 text-right font-mono text-amber-400 text-sm">QR ${totalQr.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="py-3.5 px-4 text-right font-mono text-slate-400 text-xs">Avg: ₹${totalQr > 0 ? (totalInr / totalQr).toFixed(2) : '23.50'}</td>
                <td class="py-3.5 px-4 text-right font-mono text-emerald-400 text-sm">₹${totalInr.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
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
            if (valQrEl) valQrEl.value = item.valueQr || '';
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
        if (valRsEl) valRsEl.value = '₹0.00';
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
        valRsEl.value = `₹${inr.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
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
    if (isNaN(valueQr) || valueQr <= 0) {
        showToast('Please enter a valid Value in QR greater than 0');
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
