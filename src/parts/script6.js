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
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl font-normal text-slate-100 flex items-center gap-2 h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[180px]">
                <span class="font-display font-medium text-slate-100 tracking-normal">${b.category}</span>
                ${b.notes ? `<span class="text-[10px] text-slate-500 font-normal italic">(${b.notes})</span>` : ''}
            </div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal text-slate-200 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${currSymbol}${budgetAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal text-rose-400 font-mono flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${currSymbol}${spendAmt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-normal font-mono ${varClass} flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${varDisplay}</div></td>
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
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-slate-200 font-display font-medium tracking-normal flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${exp.category || 'General'}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-white font-medium flex items-center h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors min-w-[200px]">${particularText}</div></td>
            <td class="py-px px-1"><div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono font-normal text-slate-200 flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">${curr === 'QAR' ? 'QR ' : '₹'}${amt.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div></td>
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
                            <span class="font-display font-medium text-slate-100 text-xs tracking-normal">${c.category}</span>
                        </div>
                    </td>
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono font-normal text-slate-200 text-xs flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                            ${currSym}${catBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </td>
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono font-normal text-amber-400 text-xs flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
                            ${currSym}${catSpend.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </td>
                    <td class="py-px px-1">
                        <div class="px-3 py-2 border border-slate-500/25 rounded-xl text-right font-mono font-normal ${varColor} text-xs flex items-center justify-end h-full bg-surface-900/20 group-hover:bg-surface-800/50 transition-colors">
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
