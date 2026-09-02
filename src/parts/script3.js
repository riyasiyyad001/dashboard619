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
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[220px] w-full font-display font-medium text-slate-100 tracking-normal">${b.bankName}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-mono text-xs text-slate-300 flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[150px]">${accNo}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.accountName}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.branch}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${typeBadge}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl uppercase font-mono tracking-wider text-slate-400 text-xs flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.ifsc}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal text-brand-500 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${b.currency || 'INR'} ${bal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
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
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full font-normal bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[250px] w-full"><span class="font-display font-medium text-slate-100 tracking-normal">${l.source}</span>${l.notes ? `<span class="text-[10px] text-slate-500 font-light ml-2 truncate max-w-xs" title="${l.notes}">(${l.notes})</span>` : ''}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${l.type}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${amt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${rep.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal text-rose-400 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${outstanding.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
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
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl uppercase font-display font-medium text-accent-cyan tracking-normal flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors w-full min-w-[250px]">${mf.symbol}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${mf.type}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${qty.toLocaleString('en-IN')}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${avgBuy.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono text-slate-300 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${invested.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${ltp.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal text-brand-500 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${presentVal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal font-mono ${pnl>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">₹${pnl.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal font-mono ${pnlPct>=0?'text-emerald-400':'text-rose-400'} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${pnlPct.toFixed(2)}%</div></td>
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
