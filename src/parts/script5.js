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

function renderShareMarketTable() {
    const body = document.getElementById('shareMarketTableBody');
    if (!body) return;
    body.innerHTML = '';
    let totalInvested = 0, totalPnl = 0;

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
        tr.innerHTML = `<td colspan="9" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-chart-pie text-2xl mb-2 block opacity-40"></i> No equity positions found for ${eqFilterMonth} ${eqFilterYear}. Click "+ Log Trade" above to add one.</td>`;
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
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-full min-w-[250px]"><span class="uppercase font-bold text-accent-cyan tracking-wide">${sm.script}</span>${sm.notes ? `<span class="text-[10px] text-slate-500 font-light ml-2 truncate max-w-xs" title="${sm.notes}">(${sm.notes})</span>` : ''}</div></td>
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
                const hasNotes = Boolean(sm.detailedNotes || sm.notes);
                
                const card = document.createElement('div');
                card.className = 'p-5 flex flex-col gap-3 hover:bg-surface-800/40 transition-colors';
                card.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h5 class="font-bold text-white text-sm tracking-wide uppercase">${sm.script}</h5>
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
        }
    }

    const foot = document.getElementById('shareMarketTableFoot');
    if (foot) {
        const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
        foot.className = 'font-mono text-xs bg-surface-900/80 border-none';
        foot.innerHTML = `
            <tr>
                <td colspan="4" class="py-4 pr-4 pl-4 text-right uppercase text-slate-400 font-mono tracking-widest text-xs font-bold align-middle border-none">Period Totals:</td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border border-slate-500/30 text-base font-mono tracking-wider font-bold text-slate-300">₹${totalInvested.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border ${totalPnl>=0?'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-emerald-400':'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400'} text-base font-mono tracking-wider font-bold">${totalPnl >= 0 ? '+' : ''}₹${totalPnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </td>
                <td class="py-4 pr-0 pl-4 text-right align-middle border-none">
                    <span class="inline-block px-4 py-2.5 rounded-xl bg-surface-950 border ${totalPnlPct>=0?'border-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.15)] text-emerald-400':'border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] text-rose-400'} text-base font-mono tracking-wider font-bold">${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%</span>
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
    
    if (id) {
        const sm = db.indiaOps.shareMarket.find(x => x.id === id);
        if (sm) {
            const titleEl = document.getElementById('shareTradeModalTitle');
            if (titleEl) titleEl.innerText = 'Edit Equity Trade';
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
        const item = db.indiaOps.shareMarket.find(x => x.id === id);
        const idx = db.indiaOps.shareMarket.findIndex(x => x.id === id);
        if (item && typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'equity',
                label: `Equity Position: ${item.scriptName || item.stockName || 'Stock Position'}`,
                data: JSON.parse(JSON.stringify(item)),
                originalIndex: idx
            });
        }
        db.indiaOps.shareMarket = db.indiaOps.shareMarket.filter(x => x.id !== id);
        saveDatabase();
        renderShareMarketTable();
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

function openFavoritePhotoLightbox(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item) return;

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

function openFavoriteQuoteView(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item) return;

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




