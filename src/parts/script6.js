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
