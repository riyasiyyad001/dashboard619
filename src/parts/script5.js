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
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-full min-w-[250px]"><span class="font-display font-medium text-accent-cyan tracking-normal">${formatTradeParticular(sm.script)}</span>${sm.notes ? `<span class="text-[10px] text-slate-500 font-light ml-2 truncate max-w-xs" title="${sm.notes}">(${sm.notes})</span>` : ''}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors font-normal text-slate-300">₹${inv.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal font-mono ${pnl>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal font-mono ${pnlPct>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%</div></td>
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
                            <h5 class="font-display font-medium text-white text-sm tracking-normal">${formatTradeParticular(sm.script)}</h5>
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
                <span class="font-normal text-white tracking-wide">${seg.name}</span>
            </td>
            <td class="py-3 px-4 text-center font-mono text-xs text-slate-300">${count}</td>
            <td class="py-3 px-4 text-center font-mono text-xs text-slate-400">${segWins}W / ${segLosses}L</td>
            <td class="py-3 px-4 text-center font-mono text-xs ${winRate >= 50 ? 'text-emerald-400' : 'text-slate-300'} font-normal">${count > 0 ? winRate.toFixed(1) + '%' : '-'}</td>
            <td class="py-3 px-4 text-right font-mono text-xs text-slate-300">₹${avgCap.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4 text-right font-mono text-xs font-normal ${segPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${segPnl >= 0 ? '+' : ''}₹${segPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4 text-right font-mono text-xs font-normal ${pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${count > 0 ? (pnlPct >= 0 ? '+' : '') + pnlPct.toFixed(2) + '%' : '-'}</td>
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
            <td class="py-3 px-4 font-normal text-white font-mono text-xs">${item.month} ${item.year}</td>
            <td class="py-3 px-4 text-center font-mono text-xs text-slate-300">${item.trades}</td>
            <td class="py-3 px-4 text-center font-mono text-xs ${winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'} font-normal">${winRate.toFixed(1)}%</td>
            <td class="py-3 px-4 text-right font-mono text-xs text-slate-300">₹${avgCap.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4 text-right font-mono text-xs font-normal ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${item.pnl >= 0 ? '+' : ''}₹${item.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td class="py-3 px-4 text-right font-mono text-xs font-normal ${yieldPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${yieldPct >= 0 ? '+' : ''}${yieldPct.toFixed(2)}%</td>
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

let favCurrentFilter = 'all'; // 'all', 'photo', 'quote', 'word', 'excel', 'pdf'
let favViewMode = 'grid'; // 'grid' (compact icons) or 'list'

function setFavoriteFilter(filter) {
    const validFilters = ['all', 'photo', 'quote', 'word', 'excel', 'pdf'];
    favCurrentFilter = validFilters.includes(filter) ? filter : 'all';
    
    // Update Filter Buttons styling
    validFilters.forEach(f => {
        const btn = document.getElementById(`btnFavFilter-${f}`);
        if (!btn) return;
        if (f === favCurrentFilter) {
            const activeColors = {
                all: 'bg-surface-800 text-white border-surface-700',
                photo: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                quote: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                word: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                excel: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                pdf: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            };
            btn.className = `px-3 py-1.5 rounded-xl text-xs font-mono font-medium ${activeColors[f] || 'bg-surface-800 text-white'} border transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm`;
        } else {
            btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer border border-transparent flex items-center gap-1.5 shrink-0';
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

    const totalCount = db.favorites.length;
    const photoCount = db.favorites.filter(x => x.type === 'photo').length;
    const quoteCount = db.favorites.filter(x => x.type === 'quote').length;
    const wordCount = db.favorites.filter(x => x.type === 'word').length;
    const excelCount = db.favorites.filter(x => x.type === 'excel').length;
    const pdfCount = db.favorites.filter(x => x.type === 'pdf').length;

    // Update Filter Tab Pill Counts
    const cntAll = document.getElementById('cntFavFilterAll');
    const cntPhoto = document.getElementById('cntFavFilterPhoto');
    const cntQuote = document.getElementById('cntFavFilterQuote');
    const cntWord = document.getElementById('cntFavFilterWord');
    const cntExcel = document.getElementById('cntFavFilterExcel');
    const cntPdf = document.getElementById('cntFavFilterPdf');

    if (cntAll) cntAll.innerText = totalCount;
    if (cntPhoto) cntPhoto.innerText = photoCount;
    if (cntQuote) cntQuote.innerText = quoteCount;
    if (cntWord) cntWord.innerText = wordCount;
    if (cntExcel) cntExcel.innerText = excelCount;
    if (cntPdf) cntPdf.innerText = pdfCount;

    // Search query
    const searchInput = document.getElementById('favSearchInput');
    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

    // Filter Items by active category
    let items = db.favorites.filter(item => {
        if (favCurrentFilter !== 'all' && item.type !== favCurrentFilter) return false;

        if (searchQuery) {
            const titleMatch = (item.title || '').toLowerCase().includes(searchQuery);
            const contentMatch = (item.content || '').toLowerCase().includes(searchQuery);
            const authorMatch = (item.author || '').toLowerCase().includes(searchQuery);
            const notesMatch = (item.notes || '').toLowerCase().includes(searchQuery);
            const fileNameMatch = (item.fileName || '').toLowerCase().includes(searchQuery);
            if (!titleMatch && !contentMatch && !authorMatch && !notesMatch && !fileNameMatch) {
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
        const typeLabels = {
            all: 'favorites',
            photo: 'photos',
            quote: 'quotes',
            word: 'Word documents',
            excel: 'Excel spreadsheets',
            pdf: 'PDF files'
        };
        const typeBtnLabels = {
            all: 'Favorite',
            photo: 'Photo',
            quote: 'Quote',
            word: 'Word Document',
            excel: 'Excel Spreadsheet',
            pdf: 'PDF Document'
        };
        const activeTypeForAdd = favCurrentFilter === 'all' ? 'photo' : favCurrentFilter;
        container.innerHTML = `
            <div class="py-14 px-4 text-center bg-surface-900/30 border border-surface-800/80 rounded-3xl w-full">
                <div class="w-12 h-12 rounded-2xl bg-surface-800 border border-surface-700 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <i class="fa-solid fa-folder-open text-lg"></i>
                </div>
                <h4 class="text-white font-display text-base font-bold">No ${typeLabels[favCurrentFilter] || 'items'} found</h4>
                <p class="text-slate-400 font-mono text-xs max-w-sm mx-auto mt-1 mb-5">
                    ${searchQuery ? 'No items match your search keyword.' : `Add your favorite ${typeLabels[favCurrentFilter] || 'items'} to access them quickly.`}
                </p>
                <div class="flex items-center justify-center gap-2 flex-wrap max-w-xl mx-auto">
                    <button type="button" onclick="openFavoriteModal(null, '${activeTypeForAdd}')" class="px-4 py-2 bg-gradient-to-r from-brand-500/20 via-cyan-500/20 to-amber-500/20 hover:bg-surface-700 border border-brand-500/40 text-brand-300 rounded-xl text-xs font-mono transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95">
                        <i class="fa-solid fa-plus text-xs"></i> Add ${typeBtnLabels[favCurrentFilter] || 'Favorite'}
                    </button>
                    <button type="button" onclick="document.getElementById('directFavFileInput').click()" class="px-3.5 py-2 bg-surface-800 hover:bg-surface-700 border border-surface-700 hover:border-cyan-400 text-cyan-300 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95">
                        <i class="fa-solid fa-cloud-arrow-up text-cyan-400 text-xs"></i> Upload File
                    </button>
                    <button type="button" onclick="openFavoriteModal(null, 'word')" class="px-3 py-2 bg-surface-900 hover:bg-blue-500/10 border border-surface-700 hover:border-blue-500/50 text-blue-400 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95">
                        <i class="fa-solid fa-file-word text-xs"></i> Add Word (.docx)
                    </button>
                    <button type="button" onclick="openFavoriteModal(null, 'excel')" class="px-3 py-2 bg-surface-900 hover:bg-emerald-500/10 border border-surface-700 hover:border-emerald-500/50 text-emerald-400 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95">
                        <i class="fa-solid fa-file-excel text-xs"></i> Add Excel (.xlsx)
                    </button>
                    <button type="button" onclick="openFavoriteModal(null, 'pdf')" class="px-3 py-2 bg-surface-900 hover:bg-rose-500/10 border border-surface-700 hover:border-rose-500/50 text-rose-400 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer active:scale-95">
                        <i class="fa-solid fa-file-pdf text-xs"></i> Add PDF (.pdf)
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
                <div class="relative aspect-square w-full overflow-hidden bg-surface-950">
                    <img src="${escapeHtml(photoSrc)}" alt="${escapeHtml(item.title || 'Photo')}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" onerror="this.src='https://placehold.co/400x400/0A140F/00FF9D?text=Photo'">
                    <div class="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-surface-950/20 to-transparent"></div>
                    
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

                    <div class="absolute bottom-2 left-2 right-2">
                        <p class="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">${escapeHtml(item.title || 'Photo Memory')}</p>
                        ${dateFormatted ? `<p class="text-[9px] font-mono text-slate-400 truncate">${dateFormatted}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    } else if (item.type === 'quote') {
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
    } else if (item.type === 'word') {
        // Word Document Card
        return `
            <div class="group relative rounded-2xl border border-surface-800 hover:border-blue-500/60 bg-surface-900/80 p-3.5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer aspect-square" onclick="openFavoriteWordView('${item.id}')">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs border border-blue-500/20 shadow-sm">
                        <i class="fa-solid fa-file-word"></i>
                    </span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
                        <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 flex items-center justify-center transition-colors" title="Share Options">
                            <i class="fa-solid fa-share-nodes text-[10px]"></i>
                        </button>
                        <button onclick="downloadFavoriteItemFile('${item.id}')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-blue-300 flex items-center justify-center transition-colors" title="Download">
                            <i class="fa-solid fa-download text-[10px]"></i>
                        </button>
                        <button onclick="openFavoriteModal('${item.id}', 'word')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors" title="Edit">
                            <i class="fa-solid fa-pen text-[10px]"></i>
                        </button>
                        <button onclick="deleteFavorite('${item.id}')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="Delete">
                            <i class="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                    </div>
                </div>

                <div class="my-auto">
                    <h4 class="text-xs font-bold text-white group-hover:text-blue-300 line-clamp-2 transition-colors font-display leading-tight">${escapeHtml(item.title || 'Word Document')}</h4>
                    <p class="text-[10px] font-mono text-slate-400 line-clamp-2 mt-1">${escapeHtml(item.notes || item.fileName || 'Microsoft Word Document')}</p>
                </div>

                <div class="pt-1.5 border-t border-surface-800/60 flex items-center justify-between gap-1 text-[10px]">
                    <span class="text-blue-400 font-mono text-[9px] truncate">
                        ${item.fileSize ? formatFavFileSize(item.fileSize) : 'DOCX'}
                    </span>
                    ${dateFormatted ? `<span class="font-mono text-slate-500 text-[9px] shrink-0">${dateFormatted}</span>` : ''}
                </div>
            </div>
        `;
    } else if (item.type === 'excel') {
        // Excel Spreadsheet Card
        return `
            <div class="group relative rounded-2xl border border-surface-800 hover:border-emerald-500/60 bg-surface-900/80 p-3.5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer aspect-square" onclick="openFavoriteExcelView('${item.id}')">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs border border-emerald-500/20 shadow-sm">
                        <i class="fa-solid fa-file-excel"></i>
                    </span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
                        <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 flex items-center justify-center transition-colors" title="Share Options">
                            <i class="fa-solid fa-share-nodes text-[10px]"></i>
                        </button>
                        <button onclick="downloadFavoriteItemFile('${item.id}')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-emerald-300 flex items-center justify-center transition-colors" title="Download">
                            <i class="fa-solid fa-download text-[10px]"></i>
                        </button>
                        <button onclick="openFavoriteModal('${item.id}', 'excel')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors" title="Edit">
                            <i class="fa-solid fa-pen text-[10px]"></i>
                        </button>
                        <button onclick="deleteFavorite('${item.id}')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="Delete">
                            <i class="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                    </div>
                </div>

                <div class="my-auto">
                    <h4 class="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-2 transition-colors font-display leading-tight">${escapeHtml(item.title || 'Excel Spreadsheet')}</h4>
                    <p class="text-[10px] font-mono text-slate-400 line-clamp-2 mt-1">${escapeHtml(item.notes || item.fileName || 'Financial Model / Data')}</p>
                </div>

                <div class="pt-1.5 border-t border-surface-800/60 flex items-center justify-between gap-1 text-[10px]">
                    <span class="text-emerald-400 font-mono text-[9px] truncate">
                        ${item.fileSize ? formatFavFileSize(item.fileSize) : 'XLSX'}
                    </span>
                    ${dateFormatted ? `<span class="font-mono text-slate-500 text-[9px] shrink-0">${dateFormatted}</span>` : ''}
                </div>
            </div>
        `;
    } else {
        // PDF Document Card
        return `
            <div class="group relative rounded-2xl border border-surface-800 hover:border-rose-500/60 bg-surface-900/80 p-3.5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between cursor-pointer aspect-square" onclick="openFavoritePdfView('${item.id}')">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs border border-rose-500/20 shadow-sm">
                        <i class="fa-solid fa-file-pdf"></i>
                    </span>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
                        <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 flex items-center justify-center transition-colors" title="Share Options">
                            <i class="fa-solid fa-share-nodes text-[10px]"></i>
                        </button>
                        <button onclick="downloadFavoriteItemFile('${item.id}')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-colors" title="Download">
                            <i class="fa-solid fa-download text-[10px]"></i>
                        </button>
                        <button onclick="openFavoriteModal('${item.id}', 'pdf')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-colors" title="Edit">
                            <i class="fa-solid fa-pen text-[10px]"></i>
                        </button>
                        <button onclick="deleteFavorite('${item.id}')" class="w-6 h-6 rounded-lg bg-surface-800 hover:bg-rose-600 text-slate-400 hover:text-white flex items-center justify-center transition-colors" title="Delete">
                            <i class="fa-solid fa-trash-can text-[10px]"></i>
                        </button>
                    </div>
                </div>

                <div class="my-auto">
                    <h4 class="text-xs font-bold text-white group-hover:text-rose-300 line-clamp-2 transition-colors font-display leading-tight">${escapeHtml(item.title || 'PDF Document')}</h4>
                    <p class="text-[10px] font-mono text-slate-400 line-clamp-2 mt-1">${escapeHtml(item.notes || item.fileName || 'Adobe Acrobat PDF')}</p>
                </div>

                <div class="pt-1.5 border-t border-surface-800/60 flex items-center justify-between gap-1 text-[10px]">
                    <span class="text-rose-400 font-mono text-[9px] truncate">
                        ${item.fileSize ? formatFavFileSize(item.fileSize) : 'PDF'}
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
    } else if (item.type === 'quote') {
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
    } else if (item.type === 'word') {
        // Word row
        return `
            <div class="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border border-surface-800 hover:border-blue-500/50 bg-surface-900/70 transition-all hover:bg-surface-900 cursor-pointer" onclick="openFavoriteWordView('${item.id}')">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-base shadow-sm">
                        <i class="fa-solid fa-file-word"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20">Word</span>
                            <h4 class="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors">${escapeHtml(item.title || 'Word Document')}</h4>
                        </div>
                        <p class="text-xs text-slate-400 truncate mt-0.5 font-sans">${escapeHtml(item.notes || item.fileName || 'Microsoft Word Document')}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
                    <span class="text-[10px] font-mono text-slate-500 hidden md:inline mr-1">${item.fileSize ? formatFavFileSize(item.fileSize) : ''} · ${dateFormatted}</span>
                    <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 rounded-xl text-xs transition-colors cursor-pointer" title="Share Options">
                        <i class="fa-solid fa-share-nodes text-xs"></i>
                    </button>
                    <button onclick="downloadFavoriteItemFile('${item.id}')" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-blue-300 rounded-xl text-xs transition-colors cursor-pointer" title="Download">
                        <i class="fa-solid fa-download text-xs"></i>
                    </button>
                    <button onclick="openFavoriteWordView('${item.id}');" class="px-2.5 py-1.5 bg-surface-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-300 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-file-lines text-xs"></i> <span class="hidden sm:inline">Open</span>
                    </button>
                    <button onclick="openFavoriteModal('${item.id}', 'word');" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 rounded-xl text-xs transition-colors cursor-pointer" title="Edit">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteFavorite('${item.id}');" class="p-1.5 bg-surface-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer" title="Delete">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    } else if (item.type === 'excel') {
        // Excel row
        return `
            <div class="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border border-surface-800 hover:border-emerald-500/50 bg-surface-900/70 transition-all hover:bg-surface-900 cursor-pointer" onclick="openFavoriteExcelView('${item.id}')">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-base shadow-sm">
                        <i class="fa-solid fa-file-excel"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">Excel</span>
                            <h4 class="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">${escapeHtml(item.title || 'Excel Spreadsheet')}</h4>
                        </div>
                        <p class="text-xs text-slate-400 truncate mt-0.5 font-sans">${escapeHtml(item.notes || item.fileName || 'Financial Spreadsheet')}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
                    <span class="text-[10px] font-mono text-slate-500 hidden md:inline mr-1">${item.fileSize ? formatFavFileSize(item.fileSize) : ''} · ${dateFormatted}</span>
                    <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 rounded-xl text-xs transition-colors cursor-pointer" title="Share Options">
                        <i class="fa-solid fa-share-nodes text-xs"></i>
                    </button>
                    <button onclick="downloadFavoriteItemFile('${item.id}')" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-emerald-300 rounded-xl text-xs transition-colors cursor-pointer" title="Download">
                        <i class="fa-solid fa-download text-xs"></i>
                    </button>
                    <button onclick="openFavoriteExcelView('${item.id}');" class="px-2.5 py-1.5 bg-surface-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-table text-xs"></i> <span class="hidden sm:inline">Open</span>
                    </button>
                    <button onclick="openFavoriteModal('${item.id}', 'excel');" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 rounded-xl text-xs transition-colors cursor-pointer" title="Edit">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteFavorite('${item.id}');" class="p-1.5 bg-surface-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer" title="Delete">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        // PDF row
        return `
            <div class="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl border border-surface-800 hover:border-rose-500/50 bg-surface-900/70 transition-all hover:bg-surface-900 cursor-pointer" onclick="openFavoritePdfView('${item.id}')">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 text-base shadow-sm">
                        <i class="fa-solid fa-file-pdf"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[10px] font-mono border border-rose-500/20">PDF</span>
                            <h4 class="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-rose-300 transition-colors">${escapeHtml(item.title || 'PDF Document')}</h4>
                        </div>
                        <p class="text-xs text-slate-400 truncate mt-0.5 font-sans">${escapeHtml(item.notes || item.fileName || 'Adobe Acrobat PDF')}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
                    <span class="text-[10px] font-mono text-slate-500 hidden md:inline mr-1">${item.fileSize ? formatFavFileSize(item.fileSize) : ''} · ${dateFormatted}</span>
                    <button onclick="openUniversalShare('favorite', '${item.id}', event)" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-brand-400 rounded-xl text-xs transition-colors cursor-pointer" title="Share Options">
                        <i class="fa-solid fa-share-nodes text-xs"></i>
                    </button>
                    <button onclick="downloadFavoriteItemFile('${item.id}')" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-rose-300 rounded-xl text-xs transition-colors cursor-pointer" title="Download">
                        <i class="fa-solid fa-download text-xs"></i>
                    </button>
                    <button onclick="openFavoritePdfView('${item.id}');" class="px-2.5 py-1.5 bg-surface-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-eye text-xs"></i> <span class="hidden sm:inline">View</span>
                    </button>
                    <button onclick="openFavoriteModal('${item.id}', 'pdf');" class="p-1.5 bg-surface-800 hover:bg-surface-700 text-slate-400 hover:text-cyan-300 rounded-xl text-xs transition-colors cursor-pointer" title="Edit">
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

function formatFavFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return '';
    const b = parseInt(bytes, 10);
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
}
window.formatFavFileSize = formatFavFileSize;

function openFavoriteModal(id = null, defaultType = 'photo') {
    const editIdEl = document.getElementById('favEditId');
    const modalTitleEl = document.getElementById('favoriteModalTitle');
    const saveBtnText = document.getElementById('favSaveBtnText');

    const validTypes = ['photo', 'quote', 'word', 'excel', 'pdf'];
    const cleanDefaultType = validTypes.includes(defaultType) ? defaultType : 'photo';

    // Clear stored hidden file inputs
    const fileDataEl = document.getElementById('favFileData');
    const fileNameEl = document.getElementById('favFileNameStored');
    const fileSizeEl = document.getElementById('favFileSizeStored');
    const fileMimeEl = document.getElementById('favFileMimeStored');
    if (fileDataEl) fileDataEl.value = '';
    if (fileNameEl) fileNameEl.value = '';
    if (fileSizeEl) fileSizeEl.value = '';
    if (fileMimeEl) fileMimeEl.value = '';

    if (id) {
        const item = (db.favorites || []).find(x => x.id === id);
        if (item) {
            if (editIdEl) editIdEl.value = item.id;
            if (modalTitleEl) modalTitleEl.innerText = 'Edit Favorite';
            if (saveBtnText) saveBtnText.innerText = 'Save Changes';

            const itemType = validTypes.includes(item.type) ? item.type : 'photo';
            setFavoriteModalType(itemType);

            // Populate according to type
            if (itemType === 'photo') {
                if (document.getElementById('favPhotoCaptionInput')) document.getElementById('favPhotoCaptionInput').value = item.title || '';
                if (document.getElementById('favPhotoUrlInput')) document.getElementById('favPhotoUrlInput').value = item.photoUrl || '';
                if (item.photoUrl) previewFavoritePhoto(item.photoUrl);
            } else if (itemType === 'quote') {
                if (document.getElementById('favContentInput')) document.getElementById('favContentInput').value = item.content || '';
                if (document.getElementById('favAuthorInput')) document.getElementById('favAuthorInput').value = item.author || '';
            } else if (itemType === 'word') {
                if (document.getElementById('favWordTitleInput')) document.getElementById('favWordTitleInput').value = item.title || '';
                if (document.getElementById('favWordNotesInput')) document.getElementById('favWordNotesInput').value = item.notes || '';
                if (fileDataEl) fileDataEl.value = item.fileData || '';
                if (fileNameEl) fileNameEl.value = item.fileName || '';
                if (fileSizeEl) fileSizeEl.value = item.fileSize || '';
                if (fileMimeEl) fileMimeEl.value = item.mimeType || '';
                if (item.fileName) {
                    const infoBox = document.getElementById('favWordFileInfo');
                    const nameLabel = document.getElementById('favWordFileName');
                    const sizeLabel = document.getElementById('favWordFileSize');
                    if (nameLabel) nameLabel.innerText = item.fileName;
                    if (sizeLabel) sizeLabel.innerText = formatFavFileSize(item.fileSize);
                    if (infoBox) infoBox.classList.remove('hidden');
                }
            } else if (itemType === 'excel') {
                if (document.getElementById('favExcelTitleInput')) document.getElementById('favExcelTitleInput').value = item.title || '';
                if (document.getElementById('favExcelNotesInput')) document.getElementById('favExcelNotesInput').value = item.notes || '';
                if (fileDataEl) fileDataEl.value = item.fileData || '';
                if (fileNameEl) fileNameEl.value = item.fileName || '';
                if (fileSizeEl) fileSizeEl.value = item.fileSize || '';
                if (fileMimeEl) fileMimeEl.value = item.mimeType || '';
                if (item.fileName) {
                    const infoBox = document.getElementById('favExcelFileInfo');
                    const nameLabel = document.getElementById('favExcelFileName');
                    const sizeLabel = document.getElementById('favExcelFileSize');
                    const statsLabel = document.getElementById('favExcelStats');
                    if (nameLabel) nameLabel.innerText = item.fileName;
                    if (sizeLabel) sizeLabel.innerText = formatFavFileSize(item.fileSize);
                    if (statsLabel) statsLabel.innerText = item.sheetNames ? `${item.sheetNames.length} sheet(s)` : 'Excel';
                    if (infoBox) infoBox.classList.remove('hidden');
                }
            } else if (itemType === 'pdf') {
                if (document.getElementById('favPdfTitleInput')) document.getElementById('favPdfTitleInput').value = item.title || '';
                if (document.getElementById('favPdfNotesInput')) document.getElementById('favPdfNotesInput').value = item.notes || '';
                if (fileDataEl) fileDataEl.value = item.fileData || '';
                if (fileNameEl) fileNameEl.value = item.fileName || '';
                if (fileSizeEl) fileSizeEl.value = item.fileSize || '';
                if (fileMimeEl) fileMimeEl.value = item.mimeType || '';
                if (item.fileName) {
                    const infoBox = document.getElementById('favPdfFileInfo');
                    const nameLabel = document.getElementById('favPdfFileName');
                    const sizeLabel = document.getElementById('favPdfFileSize');
                    if (nameLabel) nameLabel.innerText = item.fileName;
                    if (sizeLabel) sizeLabel.innerText = formatFavFileSize(item.fileSize);
                    if (infoBox) infoBox.classList.remove('hidden');
                }
            }
        }
    } else {
        if (editIdEl) editIdEl.value = '';
        const titles = {
            photo: 'Add Photo',
            quote: 'Add Quote',
            word: 'Add Word Document',
            excel: 'Add Excel Spreadsheet',
            pdf: 'Add PDF Document'
        };
        if (modalTitleEl) modalTitleEl.innerText = titles[cleanDefaultType] || 'Add Favorite';
        if (saveBtnText) saveBtnText.innerText = 'Save';

        setFavoriteModalType(cleanDefaultType);

        // Reset all inputs
        if (document.getElementById('favPhotoCaptionInput')) document.getElementById('favPhotoCaptionInput').value = '';
        if (document.getElementById('favPhotoUrlInput')) document.getElementById('favPhotoUrlInput').value = '';
        if (document.getElementById('favContentInput')) document.getElementById('favContentInput').value = '';
        if (document.getElementById('favAuthorInput')) document.getElementById('favAuthorInput').value = '';
        if (document.getElementById('favWordTitleInput')) document.getElementById('favWordTitleInput').value = '';
        if (document.getElementById('favWordNotesInput')) document.getElementById('favWordNotesInput').value = '';
        if (document.getElementById('favExcelTitleInput')) document.getElementById('favExcelTitleInput').value = '';
        if (document.getElementById('favExcelNotesInput')) document.getElementById('favExcelNotesInput').value = '';
        if (document.getElementById('favPdfTitleInput')) document.getElementById('favPdfTitleInput').value = '';
        if (document.getElementById('favPdfNotesInput')) document.getElementById('favPdfNotesInput').value = '';

        clearFavoritePhotoPreview();
        clearFavoriteWordFile();
        clearFavoriteExcelFile();
        clearFavoritePdfFile();
    }

    openModal('favoriteModal');
}
window.openFavoriteModal = openFavoriteModal;

function setFavoriteModalType(type) {
    const validTypes = ['photo', 'quote', 'word', 'excel', 'pdf'];
    const targetType = validTypes.includes(type) ? type : 'photo';
    const typeInput = document.getElementById('favEditType');
    if (typeInput) typeInput.value = targetType;

    const tabs = {
        photo: document.getElementById('favTabPhoto'),
        quote: document.getElementById('favTabQuote'),
        word: document.getElementById('favTabWord'),
        excel: document.getElementById('favTabExcel'),
        pdf: document.getElementById('favTabPdf')
    };

    const containers = {
        photo: document.getElementById('favPhotoContainer'),
        quote: document.getElementById('favQuoteContainer'),
        word: document.getElementById('favWordContainer'),
        excel: document.getElementById('favExcelContainer'),
        pdf: document.getElementById('favPdfContainer')
    };

    const modalIcon = document.getElementById('favModalHeaderIcon');

    // Reset tabs
    Object.keys(tabs).forEach(k => {
        if (tabs[k]) {
            tabs[k].className = 'py-2 px-1 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer';
        }
        if (containers[k]) {
            containers[k].classList.add('hidden');
        }
    });

    const activeStyles = {
        photo: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        quote: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        word: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        excel: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        pdf: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    };

    const icons = {
        photo: '<i class="fa-solid fa-camera text-sm text-cyan-400"></i>',
        quote: '<i class="fa-solid fa-quote-left text-sm text-amber-400"></i>',
        word: '<i class="fa-solid fa-file-word text-sm text-blue-400"></i>',
        excel: '<i class="fa-solid fa-file-excel text-sm text-emerald-400"></i>',
        pdf: '<i class="fa-solid fa-file-pdf text-sm text-rose-400"></i>'
    };

    if (tabs[targetType]) {
        tabs[targetType].className = `py-2 px-1 rounded-xl text-xs font-mono font-medium transition-all flex items-center justify-center gap-1 ${activeStyles[targetType]} border shadow-sm cursor-pointer`;
    }
    if (containers[targetType]) {
        containers[targetType].classList.remove('hidden');
    }
    if (modalIcon && icons[targetType]) {
        modalIcon.innerHTML = icons[targetType];
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

/* Drag & Drop Common Handlers */
function handleFavDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-brand-500', 'bg-brand-500/10');
}
window.handleFavDragOver = handleFavDragOver;

function handleFavDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-brand-500', 'bg-brand-500/10');
}
window.handleFavDragLeave = handleFavDragLeave;

/* Word Upload & Drop */
function handleFavoriteWordUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    processFavoriteWordFile(file);
}
window.handleFavoriteWordUpload = handleFavoriteWordUpload;

function handleFavWordDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-brand-500', 'bg-brand-500/10');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) processFavoriteWordFile(file);
}
window.handleFavWordDrop = handleFavWordDrop;

function processFavoriteWordFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        document.getElementById('favFileData').value = base64Data;
        document.getElementById('favFileNameStored').value = file.name;
        document.getElementById('favFileSizeStored').value = file.size;
        document.getElementById('favFileMimeStored').value = file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const infoBox = document.getElementById('favWordFileInfo');
        const nameLabel = document.getElementById('favWordFileName');
        const sizeLabel = document.getElementById('favWordFileSize');
        if (nameLabel) nameLabel.innerText = file.name;
        if (sizeLabel) sizeLabel.innerText = formatFavFileSize(file.size);
        if (infoBox) infoBox.classList.remove('hidden');

        const titleInput = document.getElementById('favWordTitleInput');
        if (titleInput && !titleInput.value.trim()) {
            titleInput.value = file.name.replace(/\.[^/.]+$/, '');
        }
        showToast(`Loaded "${file.name}"`);
    };
    reader.readAsDataURL(file);
}

function clearFavoriteWordFile() {
    const input = document.getElementById('favWordFileInput');
    if (input) input.value = '';
    const infoBox = document.getElementById('favWordFileInfo');
    if (infoBox) infoBox.classList.add('hidden');
    const fData = document.getElementById('favFileData');
    if (fData && document.getElementById('favEditType').value === 'word') fData.value = '';
}
window.clearFavoriteWordFile = clearFavoriteWordFile;

/* Excel Upload & Drop */
function handleFavoriteExcelUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    processFavoriteExcelFile(file);
}
window.handleFavoriteExcelUpload = handleFavoriteExcelUpload;

function handleFavExcelDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-brand-500', 'bg-brand-500/10');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) processFavoriteExcelFile(file);
}
window.handleFavExcelDrop = handleFavExcelDrop;

function processFavoriteExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        document.getElementById('favFileData').value = base64Data;
        document.getElementById('favFileNameStored').value = file.name;
        document.getElementById('favFileSizeStored').value = file.size;
        document.getElementById('favFileMimeStored').value = file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        let sheetInfo = 'Excel';
        try {
            if (window.XLSX) {
                const rawBase64 = base64Data.split(',')[1] || base64Data;
                const wb = window.XLSX.read(rawBase64, { type: 'base64' });
                if (wb && wb.SheetNames) {
                    sheetInfo = `${wb.SheetNames.length} sheet(s)`;
                }
            }
        } catch (err) {
            console.warn('Excel preview parse info:', err);
        }

        const infoBox = document.getElementById('favExcelFileInfo');
        const nameLabel = document.getElementById('favExcelFileName');
        const sizeLabel = document.getElementById('favExcelFileSize');
        const statsLabel = document.getElementById('favExcelStats');
        if (nameLabel) nameLabel.innerText = file.name;
        if (sizeLabel) sizeLabel.innerText = formatFavFileSize(file.size);
        if (statsLabel) statsLabel.innerText = sheetInfo;
        if (infoBox) infoBox.classList.remove('hidden');

        const titleInput = document.getElementById('favExcelTitleInput');
        if (titleInput && !titleInput.value.trim()) {
            titleInput.value = file.name.replace(/\.[^/.]+$/, '');
        }
        showToast(`Loaded "${file.name}"`);
    };
    reader.readAsDataURL(file);
}

function clearFavoriteExcelFile() {
    const input = document.getElementById('favExcelFileInput');
    if (input) input.value = '';
    const infoBox = document.getElementById('favExcelFileInfo');
    if (infoBox) infoBox.classList.add('hidden');
    const fData = document.getElementById('favFileData');
    if (fData && document.getElementById('favEditType').value === 'excel') fData.value = '';
}
window.clearFavoriteExcelFile = clearFavoriteExcelFile;

/* PDF Upload & Drop */
function handleFavoritePdfUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    processFavoritePdfFile(file);
}
window.handleFavoritePdfUpload = handleFavoritePdfUpload;

function handleFavPdfDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-brand-500', 'bg-brand-500/10');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) processFavoritePdfFile(file);
}
window.handleFavPdfDrop = handleFavPdfDrop;

function processFavoritePdfFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Data = e.target.result;
        document.getElementById('favFileData').value = base64Data;
        document.getElementById('favFileNameStored').value = file.name;
        document.getElementById('favFileSizeStored').value = file.size;
        document.getElementById('favFileMimeStored').value = file.type || 'application/pdf';

        const infoBox = document.getElementById('favPdfFileInfo');
        const nameLabel = document.getElementById('favPdfFileName');
        const sizeLabel = document.getElementById('favPdfFileSize');
        if (nameLabel) nameLabel.innerText = file.name;
        if (sizeLabel) sizeLabel.innerText = formatFavFileSize(file.size);
        if (infoBox) infoBox.classList.remove('hidden');

        const titleInput = document.getElementById('favPdfTitleInput');
        if (titleInput && !titleInput.value.trim()) {
            titleInput.value = file.name.replace(/\.[^/.]+$/, '');
        }
        showToast(`Loaded "${file.name}"`);
    };
    reader.readAsDataURL(file);
}

function clearFavoritePdfFile() {
    const input = document.getElementById('favPdfFileInput');
    if (input) input.value = '';
    const infoBox = document.getElementById('favPdfFileInfo');
    if (infoBox) infoBox.classList.add('hidden');
    const fData = document.getElementById('favFileData');
    if (fData && document.getElementById('favEditType').value === 'pdf') fData.value = '';
}
window.clearFavoritePdfFile = clearFavoritePdfFile;

/* Direct File Upload & Drag-and-Drop Handlers for Favorites */
function handleDirectFavoriteFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    handleFavoriteDirectFile(file);
    event.target.value = '';
}
window.handleDirectFavoriteFileUpload = handleDirectFavoriteFileUpload;

function handleFavoriteDirectFile(file) {
    if (!file) return;
    const name = (file.name || '').toLowerCase();
    const mime = (file.type || '').toLowerCase();

    if (name.endsWith('.docx') || name.endsWith('.doc') || mime.includes('word') || mime.includes('officedocument.wordprocessingml')) {
        openFavoriteModal(null, 'word');
        processFavoriteWordFile(file);
    } else if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv') || mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) {
        openFavoriteModal(null, 'excel');
        processFavoriteExcelFile(file);
    } else if (name.endsWith('.pdf') || mime.includes('pdf')) {
        openFavoriteModal(null, 'pdf');
        processFavoritePdfFile(file);
    } else if (mime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name)) {
        openFavoriteModal(null, 'photo');
        const reader = new FileReader();
        reader.onload = function(e) {
            const url = e.target.result;
            const urlInput = document.getElementById('favPhotoUrlInput');
            if (urlInput) urlInput.value = url;
            const captionInput = document.getElementById('favPhotoCaptionInput');
            if (captionInput && !captionInput.value.trim()) {
                captionInput.value = file.name.replace(/\.[^/.]+$/, '');
            }
            if (typeof previewFavoritePhoto === 'function') previewFavoritePhoto(url);
            showToast(`Loaded image "${file.name}"`);
        };
        reader.readAsDataURL(file);
    } else {
        // Default to Word document for generic documents
        openFavoriteModal(null, 'word');
        processFavoriteWordFile(file);
    }
}
window.handleFavoriteDirectFile = handleFavoriteDirectFile;

function handleFavoritesPageDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById('favoritesDropOverlay');
    if (dropzone) dropzone.classList.remove('hidden');
}
window.handleFavoritesPageDragOver = handleFavoritesPageDragOver;

function handleFavoritesPageDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById('favoritesDropOverlay');
    if (dropzone && (!event.relatedTarget || !dropzone.contains(event.relatedTarget))) {
        dropzone.classList.add('hidden');
    }
}
window.handleFavoritesPageDragLeave = handleFavoritesPageDragLeave;

function handleFavoritesPageDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = document.getElementById('favoritesDropOverlay');
    if (dropzone) dropzone.classList.add('hidden');
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) {
        handleFavoriteDirectFile(file);
    }
}
window.handleFavoritesPageDrop = handleFavoritesPageDrop;

/* Link Document from Vault into Favorites */
function openPickDocumentModalForFav(type) {
    if (!db.documents || db.documents.length === 0) {
        showToast('No documents found in Vault. Please upload a file to your Vault or directly upload here.');
        return;
    }
    const container = document.getElementById('favDocPickerList');
    if (!container) return;

    let filtered = db.documents.filter(d => {
        const isXls = d.fileType === 'excel' || (d.mimeType && (d.mimeType.includes('spreadsheet') || d.mimeType.includes('excel') || d.mimeType.includes('csv')));
        const isPdf = d.fileType === 'pdf' || (d.mimeType && d.mimeType.includes('pdf'));
        const isWord = d.fileType === 'word' || (d.mimeType && (d.mimeType.includes('word') || d.mimeType.includes('officedocument.wordprocessingml')));
        const isPhoto = d.fileType === 'photo' || (d.mimeType && d.mimeType.startsWith('image/'));

        if (type === 'word') return isWord || (!isXls && !isPdf && !isPhoto);
        if (type === 'excel') return isXls;
        if (type === 'pdf') return isPdf;
        if (type === 'photo') return isPhoto;
        return true;
    });

    if (filtered.length === 0) {
        filtered = db.documents;
    }

    container.innerHTML = filtered.map(d => {
        const isXls = d.fileType === 'excel' || (d.mimeType && (d.mimeType.includes('spreadsheet') || d.mimeType.includes('excel') || d.mimeType.includes('csv')));
        const isPdf = d.fileType === 'pdf' || (d.mimeType && d.mimeType.includes('pdf'));
        const isWord = d.fileType === 'word' || (d.mimeType && (d.mimeType.includes('word') || d.mimeType.includes('officedocument.wordprocessingml')));
        const iconClass = isWord ? 'fa-solid fa-file-word text-blue-400' : (isXls ? 'fa-solid fa-file-excel text-emerald-400' : (isPdf ? 'fa-solid fa-file-pdf text-rose-400' : 'fa-solid fa-file text-cyan-400'));

        return `
            <div onclick="selectDocumentForFavorite('${d.id}', '${type}')" class="flex items-center justify-between p-3 rounded-xl border border-surface-800 hover:border-brand-500/50 bg-surface-950/60 hover:bg-surface-800/60 cursor-pointer transition-all">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-lg bg-surface-900 border border-surface-700 flex items-center justify-center shrink-0">
                        <i class="${iconClass} text-base"></i>
                    </div>
                    <div class="min-w-0">
                        <h5 class="text-xs font-semibold text-white truncate">${escapeHtml(d.title)}</h5>
                        <p class="text-[10px] font-mono text-slate-400 truncate">${escapeHtml(d.category || 'Document')} · ${d.date || 'Active'}</p>
                    </div>
                </div>
                <button type="button" class="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 text-xs font-mono shrink-0">Select</button>
            </div>
        `;
    }).join('');

    openModal('favDocPickerModal');
}
window.openPickDocumentModalForFav = openPickDocumentModalForFav;

async function selectDocumentForFavorite(docId, type) {
    const doc = (db.documents || []).find(x => x.id === docId);
    if (!doc) return;

    let fileData = doc.fileData;
    if (!fileData && window.vaultStorage) {
        try {
            fileData = await window.vaultStorage.getFile(doc.id);
        } catch (e) {
            console.warn('Vault storage fetch error', e);
        }
    }

    closeModal('favDocPickerModal');

    const fDataEl = document.getElementById('favFileData');
    const fNameEl = document.getElementById('favFileNameStored');
    const fSizeEl = document.getElementById('favFileSizeStored');
    const fMimeEl = document.getElementById('favFileMimeStored');

    if (fDataEl) fDataEl.value = fileData || '';
    if (fNameEl) fNameEl.value = doc.fileName || doc.title;
    if (fSizeEl) fSizeEl.value = doc.fileSize || '';
    if (fMimeEl) fMimeEl.value = doc.mimeType || '';

    if (type === 'word') {
        const tInput = document.getElementById('favWordTitleInput');
        const nInput = document.getElementById('favWordNotesInput');
        if (tInput) tInput.value = doc.title || '';
        if (nInput) nInput.value = doc.notes || '';
        const infoBox = document.getElementById('favWordFileInfo');
        const nameLabel = document.getElementById('favWordFileName');
        const sizeLabel = document.getElementById('favWordFileSize');
        if (nameLabel) nameLabel.innerText = doc.fileName || doc.title;
        if (sizeLabel) sizeLabel.innerText = formatFavFileSize(doc.fileSize);
        if (infoBox) infoBox.classList.remove('hidden');
    } else if (type === 'excel') {
        const tInput = document.getElementById('favExcelTitleInput');
        const nInput = document.getElementById('favExcelNotesInput');
        if (tInput) tInput.value = doc.title || '';
        if (nInput) nInput.value = doc.notes || '';
        const infoBox = document.getElementById('favExcelFileInfo');
        const nameLabel = document.getElementById('favExcelFileName');
        const sizeLabel = document.getElementById('favExcelFileSize');
        const statsLabel = document.getElementById('favExcelStats');
        if (nameLabel) nameLabel.innerText = doc.fileName || doc.title;
        if (sizeLabel) sizeLabel.innerText = formatFavFileSize(doc.fileSize);
        if (statsLabel) statsLabel.innerText = 'From Vault';
        if (infoBox) infoBox.classList.remove('hidden');
    } else if (type === 'pdf') {
        const tInput = document.getElementById('favPdfTitleInput');
        const nInput = document.getElementById('favPdfNotesInput');
        if (tInput) tInput.value = doc.title || '';
        if (nInput) nInput.value = doc.notes || '';
        const infoBox = document.getElementById('favPdfFileInfo');
        const nameLabel = document.getElementById('favPdfFileName');
        const sizeLabel = document.getElementById('favPdfFileSize');
        if (nameLabel) nameLabel.innerText = doc.fileName || doc.title;
        if (sizeLabel) sizeLabel.innerText = formatFavFileSize(doc.fileSize);
        if (infoBox) infoBox.classList.remove('hidden');
    }

    showToast(`Loaded "${doc.title}" from Vault`);
}
window.selectDocumentForFavorite = selectDocumentForFavorite;

/* Sample Generators for Word, Excel, PDF */
function generateSampleFavoriteWord() {
    const sampleTitle = 'Strategic Asset Management & Wealth Mandate 2026';
    const sampleNotes = 'Executive leadership brief outlining target capital yields, private market allocations, liquidity buffers, and macroeconomic risk hedging strategies.';
    
    // Create a structured base64 DOCX package using JSZip if available, or rich HTML data URI
    try {
        if (window.JSZip) {
            const zip = new JSZip();
            zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);
            zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);
            zip.folder("word").file("document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="0F172A"/></w:rPr><w:t>Strategic Asset Management &amp; Wealth Mandate 2026</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:i/><w:color w:val="64748B"/></w:rPr><w:t>Confidential Executive Portfolio Dossier — Version 3.4</w:t></w:r></w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>
    <w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1E293B"/></w:rPr><w:t>1. Executive Summary &amp; Directives</w:t></w:r></w:p>
    <w:p><w:r><w:t>This institutional charter formalizes our asset allocation targets for the upcoming fiscal cycle. The principal objective is capital compounding at 12.8% net ARR while strictly capping maximum portfolio drawdown to under 6.5% during liquidity crunches.</w:t></w:r></w:p>
    <w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1E293B"/></w:rPr><w:t>2. Core Asset Classes &amp; Weightings</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Liquid Global Equities &amp; Index Funds: 35.0%</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Commercial Real Estate &amp; REIT Facilities: 25.0%</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Sovereign Debt &amp; Ultra-Short Treasury Bills: 15.0%</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Private Equity &amp; Venture Secondary Stakes: 15.0%</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Physical Gold &amp; Commodity Reserves: 10.0%</w:t></w:r></w:p>
    <w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1E293B"/></w:rPr><w:t>3. Risk Mitigation &amp; Stress Testing</w:t></w:r></w:p>
    <w:p><w:r><w:t>Rebalancing is executed semi-annually or whenever any asset category diverges by more than ±300 basis points from target allocation. Cash equivalents maintain a continuous 90-day operating threshold.</w:t></w:r></w:p>
  </w:body>
</w:document>`);
            zip.generateAsync({ type: "base64" }).then(base64Zip => {
                const dataUri = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," + base64Zip;
                document.getElementById('favFileData').value = dataUri;
                document.getElementById('favFileNameStored').value = 'Wealth_Mandate_2026.docx';
                document.getElementById('favFileSizeStored').value = Math.round(base64Zip.length * 0.75);
                document.getElementById('favFileMimeStored').value = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

                const infoBox = document.getElementById('favWordFileInfo');
                const nameLabel = document.getElementById('favWordFileName');
                const sizeLabel = document.getElementById('favWordFileSize');
                if (nameLabel) nameLabel.innerText = 'Wealth_Mandate_2026.docx';
                if (sizeLabel) sizeLabel.innerText = '14.2 KB';
                if (infoBox) infoBox.classList.remove('hidden');

                document.getElementById('favWordTitleInput').value = sampleTitle;
                document.getElementById('favWordNotesInput').value = sampleNotes;
                showToast('Generated sample Word document (.docx)!');
            });
            return;
        }
    } catch (e) {
        console.warn('Word zip generation fallback', e);
    }

    // Fallback if JSZip fails
    document.getElementById('favWordTitleInput').value = sampleTitle;
    document.getElementById('favWordNotesInput').value = sampleNotes;
    showToast('Populated sample Word metadata!');
}
window.generateSampleFavoriteWord = generateSampleFavoriteWord;

function generateSampleFavoriteExcel() {
    if (!window.XLSX) {
        showToast('SheetJS not ready. Please try again in a moment.');
        return;
    }

    const sampleTitle = 'Multi-Asset Portfolio Valuation & Yield Model';
    const sampleNotes = 'Comprehensive breakdown of global investments, monthly dividend cashflows, risk weightings, and return on equity calculations.';

    try {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Asset Allocation
        const wsData1 = [
            ['Asset Category', 'Ticker / Fund', 'Current Value ($)', 'Weight (%)', 'Target Yield (%)', 'Annual Income ($)'],
            ['US Large Cap Equities', 'VTI / SPY', 1450000, 29.0, 1.85, 26825],
            ['Tech Innovation Growth', 'QQQ / Direct', 950000, 19.0, 0.65, 6175],
            ['Commercial Real Estate', 'Prime Urban RE', 1200000, 24.0, 6.20, 74400],
            ['Short-Term Treasuries', 'SHV / T-Bills', 650000, 13.0, 4.80, 31200],
            ['Private Equity Holding', 'Series B Co-Invest', 450000, 9.0, 14.50, 65250],
            ['Precious Metals (Gold)', 'Physical Vaulted', 300000, 6.0, 0.00, 0],
            ['TOTAL PORTFOLIO', 'AGGREGATED', 5000000, 100.0, 4.08, 203850]
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(wsData1);
        XLSX.utils.book_append_sheet(wb, ws1, 'Allocation & Yield');

        // Sheet 2: Monthly Cashflow Projections
        const wsData2 = [
            ['Month', 'Dividends', 'Rental Yield', 'Fixed Income', 'Total Projected ($)', 'Realized ($)'],
            ['January', 2800, 6200, 2600, 11600, 11750],
            ['February', 2950, 6200, 2600, 11750, 11800],
            ['March', 8400, 6200, 2600, 17200, 17450],
            ['April', 3100, 6200, 2600, 11900, 11900],
            ['May', 3200, 6200, 2600, 12000, 12150],
            ['June', 9100, 6200, 2600, 17900, 18050]
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(wsData2);
        XLSX.utils.book_append_sheet(wb, ws2, 'Cashflow 2026');

        const base64Wb = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const dataUri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + base64Wb;

        document.getElementById('favFileData').value = dataUri;
        document.getElementById('favFileNameStored').value = 'Portfolio_Model_2026.xlsx';
        document.getElementById('favFileSizeStored').value = Math.round(base64Wb.length * 0.75);
        document.getElementById('favFileMimeStored').value = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const infoBox = document.getElementById('favExcelFileInfo');
        const nameLabel = document.getElementById('favExcelFileName');
        const sizeLabel = document.getElementById('favExcelFileSize');
        const statsLabel = document.getElementById('favExcelStats');
        if (nameLabel) nameLabel.innerText = 'Portfolio_Model_2026.xlsx';
        if (sizeLabel) sizeLabel.innerText = formatFavFileSize(base64Wb.length * 0.75);
        if (statsLabel) statsLabel.innerText = '2 sheets';
        if (infoBox) infoBox.classList.remove('hidden');

        document.getElementById('favExcelTitleInput').value = sampleTitle;
        document.getElementById('favExcelNotesInput').value = sampleNotes;
        showToast('Generated sample Excel financial model (.xlsx)!');
    } catch (err) {
        console.error('Error creating sample excel:', err);
        showToast('Failed to generate sample Excel spreadsheet');
    }
}
window.generateSampleFavoriteExcel = generateSampleFavoriteExcel;

function generateSampleFavoritePdf() {
    const sampleTitle = 'Global Wealth & Family Office Mandate 2026';
    const sampleNotes = 'Executive governance charter detailing capital preservation guidelines, sovereign wealth benchmarks, tax optimization strategies, and multi-generational trust allocations.';

    // Generate a clean valid PDF data URI
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Title (Global Wealth & Family Office Mandate 2026)
   /Author (Executive Governance Board)
   /Subject (Strategic Investment Framework) >>
endobj
2 0 obj
<< /Type /Catalog
   /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages
   /Kids [4 0 R]
   /Count 1 >>
endobj
4 0 obj
<< /Type /Page
   /Parent 3 0 R
   /MediaBox [0 0 612 792]
   /Resources << /Font << /F1 5 0 R >> >>
   /Contents 6 0 R >>
endobj
5 0 obj
<< /Type /Font
   /Subtype /Type1
   /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Length 420 >>
stream
BT
/F1 22 Tf
50 720 Td
(EXECUTIVE INVESTMENT MANDATE 2026) Tj
/F1 12 Tf
0 -30 Td
(CONFIDENTIAL FAMILY OFFICE & SOVEREIGN ALLOCATION DIRECTIVE) Tj
0 -40 Td
(1. Macroeconomic Capital Preservation Charter) Tj
0 -20 Td
(The allocation threshold mandates a minimum 15% liquid liquidity cushion,) Tj
0 -15 Td
(with institutional exposure diversified across sovereign yield curves.) Tj
0 -30 Td
(2. Target ARR: 11.5% - 14.0% Net of Management Fees) Tj
0 -20 Td
(Global Real Estate, Private Credit Facilities, and Infrastructure Stakes.) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000010 00000 n 
0000000140 00000 n 
0000000195 00000 n 
0000000260 00000 n 
0000000375 00000 n 
0000000455 00000 n 
trailer
<< /Size 7
   /Root 2 0 R
   /Info 1 0 R >>
startxref
940
%%EOF`;

    const base64Pdf = window.btoa(pdfContent);
    const dataUri = 'data:application/pdf;base64,' + base64Pdf;

    document.getElementById('favFileData').value = dataUri;
    document.getElementById('favFileNameStored').value = 'Executive_Mandate_2026.pdf';
    document.getElementById('favFileSizeStored').value = pdfContent.length;
    document.getElementById('favFileMimeStored').value = 'application/pdf';

    const infoBox = document.getElementById('favPdfFileInfo');
    const nameLabel = document.getElementById('favPdfFileName');
    const sizeLabel = document.getElementById('favPdfFileSize');
    if (nameLabel) nameLabel.innerText = 'Executive_Mandate_2026.pdf';
    if (sizeLabel) sizeLabel.innerText = formatFavFileSize(pdfContent.length);
    if (infoBox) infoBox.classList.remove('hidden');

    document.getElementById('favPdfTitleInput').value = sampleTitle;
    document.getElementById('favPdfNotesInput').value = sampleNotes;
    showToast('Generated sample Executive PDF document!');
}
window.generateSampleFavoritePdf = generateSampleFavoritePdf;

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
    } else if (type === 'quote') {
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
    } else if (type === 'word') {
        const title = (document.getElementById('favWordTitleInput').value || '').trim();
        const notes = (document.getElementById('favWordNotesInput').value || '').trim();
        const fileData = document.getElementById('favFileData').value;
        const fileName = document.getElementById('favFileNameStored').value || 'document.docx';
        const fileSize = document.getElementById('favFileSizeStored').value || '';
        const mimeType = document.getElementById('favFileMimeStored').value || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        if (!title) {
            showToast('Please enter a document title.');
            return;
        }

        if (id) {
            const item = db.favorites.find(x => x.id === id);
            if (item) {
                item.type = 'word';
                item.title = title;
                item.notes = notes;
                if (fileData) {
                    item.fileData = fileData;
                    item.fileName = fileName;
                    item.fileSize = fileSize;
                    item.mimeType = mimeType;
                }
                showToast('Word document updated');
            }
        } else {
            if (!fileData) {
                showToast('Please select a Word file (.docx) or generate a sample template.');
                return;
            }
            const newItem = {
                id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                type: 'word',
                title: title,
                notes: notes,
                fileData: fileData,
                fileName: fileName,
                fileSize: fileSize,
                mimeType: mimeType,
                createdAt: new Date().toISOString(),
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            db.favorites.unshift(newItem);
            showToast('Word document added to favorites');
        }
    } else if (type === 'excel') {
        const title = (document.getElementById('favExcelTitleInput').value || '').trim();
        const notes = (document.getElementById('favExcelNotesInput').value || '').trim();
        const fileData = document.getElementById('favFileData').value;
        const fileName = document.getElementById('favFileNameStored').value || 'spreadsheet.xlsx';
        const fileSize = document.getElementById('favFileSizeStored').value || '';
        const mimeType = document.getElementById('favFileMimeStored').value || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        if (!title) {
            showToast('Please enter a spreadsheet title.');
            return;
        }

        // Get sheet names if SheetJS is available
        let sheetNames = ['Sheet1'];
        if (fileData && window.XLSX) {
            try {
                const raw = fileData.split(',')[1] || fileData;
                const wb = XLSX.read(raw, { type: 'base64' });
                if (wb && wb.SheetNames && wb.SheetNames.length) {
                    sheetNames = wb.SheetNames;
                }
            } catch (e) {
                console.warn('Sheet parse:', e);
            }
        }

        if (id) {
            const item = db.favorites.find(x => x.id === id);
            if (item) {
                item.type = 'excel';
                item.title = title;
                item.notes = notes;
                if (fileData) {
                    item.fileData = fileData;
                    item.fileName = fileName;
                    item.fileSize = fileSize;
                    item.mimeType = mimeType;
                    item.sheetNames = sheetNames;
                }
                showToast('Excel spreadsheet updated');
            }
        } else {
            if (!fileData) {
                showToast('Please select an Excel file (.xlsx) or generate a sample model.');
                return;
            }
            const newItem = {
                id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                type: 'excel',
                title: title,
                notes: notes,
                fileData: fileData,
                fileName: fileName,
                fileSize: fileSize,
                mimeType: mimeType,
                sheetNames: sheetNames,
                createdAt: new Date().toISOString(),
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            db.favorites.unshift(newItem);
            showToast('Excel spreadsheet added to favorites');
        }
    } else if (type === 'pdf') {
        const title = (document.getElementById('favPdfTitleInput').value || '').trim();
        const notes = (document.getElementById('favPdfNotesInput').value || '').trim();
        const fileData = document.getElementById('favFileData').value;
        const fileName = document.getElementById('favFileNameStored').value || 'document.pdf';
        const fileSize = document.getElementById('favFileSizeStored').value || '';
        const mimeType = document.getElementById('favFileMimeStored').value || 'application/pdf';

        if (!title) {
            showToast('Please enter a document title.');
            return;
        }

        if (id) {
            const item = db.favorites.find(x => x.id === id);
            if (item) {
                item.type = 'pdf';
                item.title = title;
                item.notes = notes;
                if (fileData) {
                    item.fileData = fileData;
                    item.fileName = fileName;
                    item.fileSize = fileSize;
                    item.mimeType = mimeType;
                }
                showToast('PDF document updated');
            }
        } else {
            if (!fileData) {
                showToast('Please select a PDF file (.pdf) or generate a sample mandate.');
                return;
            }
            const newItem = {
                id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                type: 'pdf',
                title: title,
                notes: notes,
                fileData: fileData,
                fileName: fileName,
                fileSize: fileSize,
                mimeType: mimeType,
                createdAt: new Date().toISOString(),
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            };
            db.favorites.unshift(newItem);
            showToast('PDF document added to favorites');
        }
    }

    saveDatabase();
    closeModal('favoriteModal');
    renderFavoritesPage();
}
window.saveFavoriteItem = saveFavoriteItem;

function downloadFavoriteItemFile(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item || !item.fileData) {
        showToast('No downloadable file attached to this favorite.');
        return;
    }

    const a = document.createElement('a');
    a.href = item.fileData;
    a.download = item.fileName || (item.title ? `${item.title}.${item.type === 'word' ? 'docx' : item.type === 'excel' ? 'xlsx' : 'pdf'}` : 'download');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading "${a.download}"`);
}
window.downloadFavoriteItemFile = downloadFavoriteItemFile;

function deleteFavorite(id) {
    if (!db.favorites) return;
    const index = db.favorites.findIndex(x => x.id === id);
    if (index === -1) return;

    const item = db.favorites[index];
    const typeLabel = item.type === 'photo' ? 'photo memory' : (item.type === 'quote' ? 'quote' : 'favorite item');
    const confirmMsg = `Are you sure you want to delete this ${typeLabel}?`;

    const doDelete = () => {
        const curIdx = db.favorites.findIndex(x => x.id === id);
        if (curIdx === -1) return;
        const deletedItem = db.favorites[curIdx];

        if (typeof pushUndoDelete === 'function') {
            pushUndoDelete('favorite', deletedItem, curIdx);
        }

        db.favorites.splice(curIdx, 1);
        saveDatabase();
        renderFavoritesPage();
        if (typeof closeModal === 'function') {
            closeModal('favoritePhotoLightboxModal');
            closeModal('favoriteQuoteViewModal');
        }
        showToast('Item deleted from favorites', true);
    };

    if (typeof requireConfirmation === 'function') {
        requireConfirmation(confirmMsg, doDelete);
    } else {
        doDelete();
    }
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

/* ==========================================================================
   FAVORITES WORD DOCUMENT VIEWER (.DOCX)
   ========================================================================== */
let currentFavWordId = null;
window.currentFavWordId = null;
let favWordFontSize = 16;

function openFavoriteWordView(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item) return;

    currentFavWordId = id;
    window.currentFavWordId = id;

    const titleEl = document.getElementById('viewFavWordTitle');
    const dateEl = document.getElementById('viewFavWordDate');
    const sizeEl = document.getElementById('viewFavWordSize');
    const bodyEl = document.getElementById('favWordContentBody');
    const editBtn = document.getElementById('viewFavWordEditBtn');
    const deleteBtn = document.getElementById('viewFavWordDeleteBtn');

    if (titleEl) titleEl.innerText = item.title || item.fileName || 'Word Document';
    if (dateEl) dateEl.innerText = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
    if (sizeEl) sizeEl.innerText = item.fileSize ? formatFavFileSize(item.fileSize) : '';

    favWordFontSize = 16;
    if (bodyEl) {
        bodyEl.style.fontSize = favWordFontSize + 'px';
        bodyEl.innerHTML = `
            <div class="py-12 text-center text-slate-400 space-y-3">
                <i class="fa-solid fa-circle-notch fa-spin text-2xl text-blue-400"></i>
                <div class="text-xs font-mono">Reading Word document (.docx)...</div>
            </div>
        `;
    }

    // Process Word File Data
    let base64 = item.fileData || '';
    if (base64.includes(',')) {
        base64 = base64.split(',')[1];
    }

    if (base64 && window.mammoth) {
        try {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            window.mammoth.convertToHtml({ arrayBuffer: bytes.buffer })
                .then(result => {
                    let htmlContent = result.value || '';
                    if (!htmlContent.trim()) {
                        htmlContent = `<p class="italic text-slate-400">The document contains no readable text body.</p>`;
                    }

                    let notesBanner = '';
                    if (item.notes && item.notes.trim()) {
                        notesBanner = `
                            <div class="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-200 text-xs leading-relaxed font-sans">
                                <div class="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1 flex items-center gap-1.5">
                                    <i class="fa-solid fa-memo-circle-check"></i> Executive Notes &amp; Summary
                                </div>
                                <p class="whitespace-pre-wrap">${escapeCredHtml(item.notes)}</p>
                            </div>
                        `;
                    }

                    if (bodyEl) {
                        bodyEl.innerHTML = notesBanner + `<div class="word-doc-rendered font-sans text-slate-100 leading-relaxed space-y-3">${htmlContent}</div>`;
                    }
                })
                .catch(err => {
                    console.warn('Mammoth docx parse notice:', err);
                    renderFavWordFallback(item, bodyEl);
                });
        } catch (e) {
            console.error('Error decoding word binary:', e);
            renderFavWordFallback(item, bodyEl);
        }
    } else {
        renderFavWordFallback(item, bodyEl);
    }

    if (editBtn) {
        editBtn.onclick = () => {
            closeModal('favoriteWordViewModal');
            openFavoriteModal(item.id, 'word');
        };
    }
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            deleteFavorite(item.id);
            closeModal('favoriteWordViewModal');
        };
    }

    openModal('favoriteWordViewModal');
}
window.openFavoriteWordView = openFavoriteWordView;

function renderFavWordFallback(item, containerEl) {
    if (!containerEl) return;
    let notesSection = '';
    if (item.notes && item.notes.trim()) {
        notesSection = `
            <div class="mb-5 p-4 rounded-xl bg-surface-900 border border-surface-700 text-slate-200 text-xs leading-relaxed font-sans">
                <div class="font-mono text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1.5 flex items-center gap-1.5">
                    <i class="fa-solid fa-file-lines"></i> Executive Summary / Notes
                </div>
                <p class="whitespace-pre-wrap text-slate-300">${escapeCredHtml(item.notes)}</p>
            </div>
        `;
    }

    containerEl.innerHTML = `
        ${notesSection}
        <div class="p-8 text-center bg-surface-900/60 rounded-2xl border border-surface-800 space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-3xl mx-auto">
                <i class="fa-solid fa-file-word"></i>
            </div>
            <div class="space-y-1">
                <h5 class="font-display font-bold text-base text-white">${escapeCredHtml(item.title || item.fileName || 'Word Document')}</h5>
                <p class="text-xs font-mono text-slate-400">${item.fileName || 'document.docx'} • ${item.fileSize ? formatFavFileSize(item.fileSize) : 'Ready to read'}</p>
            </div>
            <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                This document is encrypted and stored in your Favorites. You can download the native .docx file or print it anytime.
            </p>
            <div class="pt-2 flex items-center justify-center gap-3">
                <button onclick="downloadCurrentFavWord()" class="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-surface-950 font-bold text-xs font-mono rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer">
                    <i class="fa-solid fa-download"></i> Download .docx
                </button>
                <button onclick="openShareForCurrentWordFav()" class="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-slate-200 text-xs font-mono rounded-xl border border-surface-700 transition-all flex items-center gap-1.5 cursor-pointer">
                    <i class="fa-solid fa-share-nodes"></i> Share
                </button>
            </div>
        </div>
    `;
}

function zoomFavWordFont(delta) {
    favWordFontSize = Math.min(26, Math.max(12, favWordFontSize + delta * 2));
    const bodyEl = document.getElementById('favWordContentBody');
    if (bodyEl) {
        bodyEl.style.fontSize = favWordFontSize + 'px';
    }
}
window.zoomFavWordFont = zoomFavWordFont;

function printFavWordDocument() {
    if (!currentFavWordId || !db.favorites) return;
    const item = db.favorites.find(x => x.id === currentFavWordId);
    if (!item) return;

    const bodyEl = document.getElementById('favWordContentBody');
    const docTitle = item.title || 'Word Document';
    const docContent = bodyEl ? bodyEl.innerHTML : '';

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
        window.print();
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${escapeCredHtml(docTitle)}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
                h1, h2, h3 { color: #0f172a; margin-top: 1.5em; margin-bottom: 0.5em; }
                p { margin-bottom: 1em; }
                .meta-header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; }
                .meta-title { font-size: 24px; font-weight: bold; margin: 0 0 6px 0; }
                .meta-date { font-size: 12px; color: #64748b; }
            </style>
        </head>
        <body>
            <div class="meta-header">
                <div class="meta-title">${escapeCredHtml(docTitle)}</div>
                <div class="meta-date">Date: ${item.date || new Date().toLocaleDateString()} | File: ${escapeCredHtml(item.fileName || 'document.docx')}</div>
            </div>
            <div>${docContent}</div>
            <script>
                window.onload = function() { window.print(); window.close(); };
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
window.printFavWordDocument = printFavWordDocument;

function downloadCurrentFavWord() {
    if (!currentFavWordId) return;
    downloadFavoriteItemFile(currentFavWordId);
}
window.downloadCurrentFavWord = downloadCurrentFavWord;

function copyFavWordContentText() {
    const bodyEl = document.getElementById('favWordContentBody');
    if (!bodyEl) return;
    const text = bodyEl.innerText || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Document text copied to clipboard!');
        }).catch(() => {
            showToast('Copied to clipboard!');
        });
    } else {
        showToast('Copied to clipboard!');
    }
}
window.copyFavWordContentText = copyFavWordContentText;

function openShareForCurrentWordFav() {
    if (!currentFavWordId) return;
    if (typeof openUniversalShare === 'function') {
        openUniversalShare('favorite', currentFavWordId);
    }
}
window.openShareForCurrentWordFav = openShareForCurrentWordFav;

/* ==========================================================================
   FAVORITES EXCEL SPREADSHEET VIEWER (.XLSX)
   ========================================================================== */
let currentFavExcelId = null;
window.currentFavExcelId = null;
let activeFavExcelWorkbook = null;
window.activeFavExcelWorkbook = null;
let activeFavExcelSheetName = '';
let activeFavExcelRawRows = [];

function openFavoriteExcelView(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item) return;

    currentFavExcelId = id;
    window.currentFavExcelId = id;

    const titleEl = document.getElementById('viewFavExcelTitle');
    const dateEl = document.getElementById('viewFavExcelDate');
    const sizeEl = document.getElementById('viewFavExcelSize');
    const statsEl = document.getElementById('viewFavExcelStats');
    const tabsEl = document.getElementById('favExcelViewSheetTabs');
    const containerEl = document.getElementById('favExcelTableContainer');
    const searchInput = document.getElementById('favExcelSearchInput');
    const editBtn = document.getElementById('viewFavExcelEditBtn');
    const deleteBtn = document.getElementById('viewFavExcelDeleteBtn');

    if (titleEl) titleEl.innerText = item.title || item.fileName || 'Spreadsheet';
    if (dateEl) dateEl.innerText = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
    if (sizeEl) sizeEl.innerText = item.fileSize ? formatFavFileSize(item.fileSize) : '';
    if (searchInput) searchInput.value = '';

    if (containerEl) {
        containerEl.innerHTML = `
            <div class="py-16 text-center text-slate-400 space-y-3 m-auto">
                <i class="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-400"></i>
                <div class="text-xs font-mono">Parsing Excel workbook (.xlsx)...</div>
            </div>
        `;
    }

    let base64 = item.fileData || '';
    if (base64.includes(',')) {
        base64 = base64.split(',')[1];
    }

    try {
        if (typeof XLSX === 'undefined') {
            if (containerEl) {
                containerEl.innerHTML = `
                    <div class="p-8 text-center text-slate-400 space-y-3">
                        <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                        <div class="text-xs font-mono">Excel library initializing. Please click download to open directly.</div>
                    </div>
                `;
            }
            return;
        }

        const wb = XLSX.read(base64, { type: 'base64' });
        activeFavExcelWorkbook = wb;
        window.activeFavExcelWorkbook = wb;

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
            if (containerEl) containerEl.innerHTML = `<div class="p-8 text-center text-xs font-mono text-slate-500">Workbook contains no visible worksheets.</div>`;
            return;
        }

        if (statsEl) statsEl.innerText = `${wb.SheetNames.length} sheet(s)`;

        // Render sheet buttons
        if (tabsEl) {
            tabsEl.innerHTML = '';
            wb.SheetNames.forEach((name, idx) => {
                const btn = document.createElement('button');
                btn.className = `px-3 py-1.5 text-xs font-mono rounded-xl transition-all cursor-pointer whitespace-nowrap ${idx === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm' : 'bg-surface-800 text-slate-400 hover:text-white border border-surface-700/60'}`;
                btn.innerHTML = `<i class="fa-solid fa-table-cells mr-1.5 text-[10px]"></i><span>${escapeCredHtml(name)}</span>`;
                btn.onclick = () => selectFavExcelSheet(name);
                tabsEl.appendChild(btn);
            });
        }

        selectFavExcelSheet(wb.SheetNames[0]);
    } catch (err) {
        console.error('Error opening favorite excel file:', err);
        if (containerEl) {
            containerEl.innerHTML = `
                <div class="p-8 text-center space-y-3">
                    <i class="fa-solid fa-file-excel text-3xl text-emerald-400"></i>
                    <div class="text-sm font-bold text-white">${escapeCredHtml(item.title || item.fileName || 'Spreadsheet')}</div>
                    <div class="text-xs font-mono text-slate-400">File is securely stored. Click below to download and open.</div>
                    <button onclick="downloadCurrentFavExcel()" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-surface-950 font-bold text-xs font-mono rounded-xl">
                        <i class="fa-solid fa-download mr-1"></i> Download File
                    </button>
                </div>
            `;
        }
    }

    if (editBtn) {
        editBtn.onclick = () => {
            closeModal('favoriteExcelViewModal');
            openFavoriteModal(item.id, 'excel');
        };
    }
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            deleteFavorite(item.id);
            closeModal('favoriteExcelViewModal');
        };
    }

    openModal('favoriteExcelViewModal');
}
window.openFavoriteExcelView = openFavoriteExcelView;

function selectFavExcelSheet(sheetName) {
    activeFavExcelSheetName = sheetName;
    const wb = activeFavExcelWorkbook;
    if (!wb || !wb.Sheets || !wb.Sheets[sheetName]) return;

    // Update tab visual states
    const tabsEl = document.getElementById('favExcelViewSheetTabs');
    if (tabsEl) {
        Array.from(tabsEl.children).forEach(btn => {
            if (btn.innerText.includes(sheetName)) {
                btn.className = 'px-3 py-1.5 text-xs font-mono rounded-xl transition-all cursor-pointer whitespace-nowrap bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm';
            } else {
                btn.className = 'px-3 py-1.5 text-xs font-mono rounded-xl transition-all cursor-pointer whitespace-nowrap bg-surface-800 text-slate-400 hover:text-white border border-surface-700/60';
            }
        });
    }

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    activeFavExcelRawRows = rows || [];

    filterFavExcelTable();
}
window.selectFavExcelSheet = selectFavExcelSheet;

function filterFavExcelTable() {
    const containerEl = document.getElementById('favExcelTableContainer');
    const searchInput = document.getElementById('favExcelSearchInput');
    const rowCountEl = document.getElementById('favExcelRowCountText');
    if (!containerEl) return;

    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const rows = activeFavExcelRawRows;

    if (!rows || rows.length === 0) {
        containerEl.innerHTML = `<div class="p-8 text-center text-xs font-mono text-slate-500">Sheet "${escapeCredHtml(activeFavExcelSheetName)}" is empty.</div>`;
        if (rowCountEl) rowCountEl.innerText = '0 rows';
        return;
    }

    const headerRow = rows[0] || [];
    const dataRows = rows.slice(1);
    const colCount = Math.max(...rows.map(r => (Array.isArray(r) ? r.length : 0)));

    let filteredData = dataRows;
    if (query) {
        filteredData = dataRows.filter(row => {
            return row.some(cell => String(cell).toLowerCase().includes(query));
        });
    }

    if (rowCountEl) {
        rowCountEl.innerText = query ? `${filteredData.length} matching of ${dataRows.length} rows` : `${dataRows.length} data rows • ${colCount} cols`;
    }

    let tableHtml = `<table class="w-full text-left text-xs font-mono border-collapse select-text">`;
    
    // Header
    tableHtml += `<thead class="sticky top-0 z-10 bg-surface-950/95 border-b border-surface-700/80"><tr>`;
    tableHtml += `<th class="py-2.5 px-3 text-slate-500 bg-surface-950 text-center w-12 border-r border-surface-800/80 text-[10px]">#</th>`;
    for (let c = 0; c < colCount; c++) {
        const val = headerRow[c] !== undefined ? String(headerRow[c]) : '';
        tableHtml += `<th class="py-2.5 px-3.5 border-r border-surface-800/70 text-emerald-400 font-bold whitespace-nowrap max-w-xs truncate" title="${escapeCredHtml(val)}">${escapeCredHtml(val) || `Col ${c + 1}`}</th>`;
    }
    tableHtml += `</tr></thead>`;

    // Body
    tableHtml += `<tbody class="divide-y divide-surface-800/40">`;
    if (filteredData.length === 0) {
        tableHtml += `<tr><td colspan="${colCount + 1}" class="py-12 text-center text-slate-500 font-mono text-xs">No cells match "${escapeCredHtml(query)}"</td></tr>`;
    } else {
        filteredData.forEach((row, rIdx) => {
            const rowClass = rIdx % 2 === 0 ? 'bg-surface-900/40 hover:bg-surface-800/60' : 'bg-surface-950/40 hover:bg-surface-800/60';
            tableHtml += `<tr class="${rowClass} transition-colors">`;
            tableHtml += `<td class="py-2 px-3 text-slate-600 bg-surface-950/80 border-r border-surface-800/80 text-[10px] text-center select-none font-mono">${rIdx + 1}</td>`;

            for (let c = 0; c < colCount; c++) {
                const cellVal = (Array.isArray(row) && row[c] !== undefined) ? String(row[c]) : '';
                const isNum = !isNaN(Number(cellVal)) && cellVal.trim() !== '';
                const highlight = query && cellVal.toLowerCase().includes(query) ? 'bg-amber-500/20 text-amber-200 font-semibold' : '';
                tableHtml += `<td class="py-2 px-3.5 border-r border-surface-800/30 text-slate-200 whitespace-nowrap max-w-xs truncate ${isNum ? 'text-right text-emerald-300/90' : ''} ${highlight}" title="${escapeCredHtml(cellVal)}">${escapeCredHtml(cellVal)}</td>`;
            }
            tableHtml += `</tr>`;
        });
    }
    tableHtml += `</tbody></table>`;

    containerEl.innerHTML = tableHtml;
}
window.filterFavExcelTable = filterFavExcelTable;

function downloadCurrentFavExcel() {
    if (!currentFavExcelId) return;
    downloadFavoriteItemFile(currentFavExcelId);
}
window.downloadCurrentFavExcel = downloadCurrentFavExcel;

function openShareForCurrentExcelFav() {
    if (!currentFavExcelId) return;
    if (typeof openUniversalShare === 'function') {
        openUniversalShare('favorite', currentFavExcelId);
    }
}
window.openShareForCurrentExcelFav = openShareForCurrentExcelFav;

/* ==========================================================================
   FAVORITES PDF DOCUMENT VIEWER (.PDF)
   ========================================================================== */
let currentFavPdfId = null;
window.currentFavPdfId = null;
let currentFavPdfDoc = null;
let currentFavPdfPage = 1;
let currentFavPdfScale = 1.3;

function openFavoritePdfView(id) {
    if (!db.favorites) return;
    const item = db.favorites.find(x => x.id === id);
    if (!item) return;

    currentFavPdfId = id;
    window.currentFavPdfId = id;

    const titleEl = document.getElementById('viewFavPdfTitle');
    const dateEl = document.getElementById('viewFavPdfDate');
    const sizeEl = document.getElementById('viewFavPdfSize');
    const canvas = document.getElementById('favPdfCanvas');
    const fallback = document.getElementById('favPdfFallbackEmbed');
    const editBtn = document.getElementById('viewFavPdfEditBtn');
    const deleteBtn = document.getElementById('viewFavPdfDeleteBtn');
    const zoomText = document.getElementById('favPdfZoomText');

    if (titleEl) titleEl.innerText = item.title || item.fileName || 'PDF Document';
    if (dateEl) dateEl.innerText = item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
    if (sizeEl) sizeEl.innerText = item.fileSize ? formatFavFileSize(item.fileSize) : '';
    if (zoomText) zoomText.innerText = '130%';

    currentFavPdfPage = 1;
    currentFavPdfScale = 1.3;

    if (fallback) {
        fallback.classList.add('hidden');
        fallback.innerHTML = '';
    }
    if (canvas) {
        canvas.classList.remove('hidden');
    }

    let pdfDataUri = item.fileData || '';

    if (window.pdfjsLib && pdfDataUri) {
        try {
            let loadingTask;
            if (pdfDataUri.startsWith('data:')) {
                const rawBase64 = pdfDataUri.split(',')[1];
                const raw = window.atob(rawBase64);
                const rawLen = raw.length;
                const array = new Uint8Array(new ArrayBuffer(rawLen));
                for (let i = 0; i < rawLen; i++) {
                    array[i] = raw.charCodeAt(i);
                }
                loadingTask = window.pdfjsLib.getDocument({ data: array });
            } else {
                loadingTask = window.pdfjsLib.getDocument(pdfDataUri);
            }

            loadingTask.promise.then(pdf => {
                currentFavPdfDoc = pdf;
                const totalPagesEl = document.getElementById('favPdfTotalPages');
                if (totalPagesEl) totalPagesEl.innerText = pdf.numPages;
                renderFavPdfPage(1);
            }).catch(err => {
                console.warn('PDF.js render fallback:', err);
                renderFavPdfFallback(pdfDataUri, item);
            });
        } catch (err) {
            console.error('Error with PDF.js:', err);
            renderFavPdfFallback(pdfDataUri, item);
        }
    } else {
        renderFavPdfFallback(pdfDataUri, item);
    }

    if (editBtn) {
        editBtn.onclick = () => {
            closeModal('favoritePdfViewModal');
            openFavoriteModal(item.id, 'pdf');
        };
    }
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            deleteFavorite(item.id);
            closeModal('favoritePdfViewModal');
        };
    }

    openModal('favoritePdfViewModal');
}
window.openFavoritePdfView = openFavoritePdfView;

function renderFavPdfPage(pageNum) {
    if (!currentFavPdfDoc) return;
    const canvas = document.getElementById('favPdfCanvas');
    const pageCurrentEl = document.getElementById('favPdfCurrentPage');
    if (!canvas) return;

    currentFavPdfDoc.getPage(pageNum).then(page => {
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: currentFavPdfScale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderContext).promise.then(() => {
            if (pageCurrentEl) pageCurrentEl.innerText = pageNum;
            currentFavPdfPage = pageNum;
        });
    });
}

function changeFavPdfPage(delta) {
    if (!currentFavPdfDoc) return;
    const newPage = currentFavPdfPage + delta;
    if (newPage >= 1 && newPage <= currentFavPdfDoc.numPages) {
        renderFavPdfPage(newPage);
    }
}
window.changeFavPdfPage = changeFavPdfPage;

function zoomFavPdf(delta) {
    const newScale = Math.min(2.8, Math.max(0.6, currentFavPdfScale + delta));
    currentFavPdfScale = newScale;
    const zoomText = document.getElementById('favPdfZoomText');
    if (zoomText) zoomText.innerText = Math.round(newScale * 100) + '%';
    if (currentFavPdfDoc) {
        renderFavPdfPage(currentFavPdfPage);
    }
}
window.zoomFavPdf = zoomFavPdf;

function renderFavPdfFallback(dataUri, item) {
    const canvas = document.getElementById('favPdfCanvas');
    const fallback = document.getElementById('favPdfFallbackEmbed');
    if (canvas) canvas.classList.add('hidden');
    if (fallback) {
        fallback.classList.remove('hidden');
        if (dataUri) {
            fallback.innerHTML = `<embed src="${dataUri}" type="application/pdf" class="w-full h-full min-h-[500px] rounded-xl border border-surface-800">`;
        } else {
            fallback.innerHTML = `
                <div class="p-8 text-center space-y-3">
                    <i class="fa-solid fa-file-pdf text-3xl text-rose-400"></i>
                    <div class="text-sm font-bold text-white">${escapeCredHtml(item.title || 'PDF Document')}</div>
                    <div class="text-xs font-mono text-slate-400">Preview not available in this view. Click download to read.</div>
                    <button onclick="downloadCurrentFavPdf()" class="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-surface-950 font-bold text-xs font-mono rounded-xl">
                        <i class="fa-solid fa-download mr-1"></i> Download PDF
                    </button>
                </div>
            `;
        }
    }
}

function downloadCurrentFavPdf() {
    if (!currentFavPdfId) return;
    downloadFavoriteItemFile(currentFavPdfId);
}
window.downloadCurrentFavPdf = downloadCurrentFavPdf;

function openShareForCurrentPdfFav() {
    if (!currentFavPdfId) return;
    if (typeof openUniversalShare === 'function') {
        openUniversalShare('favorite', currentFavPdfId);
    }
}
window.openShareForCurrentPdfFav = openShareForCurrentPdfFav;
