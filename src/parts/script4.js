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

    let physicalAssets = 0;
    if (db.assetLogs) {
        db.assetLogs.forEach(log => {
            physicalAssets += parseFloat(log.value) || 0;
        });
    }

    const totalAssets = bankAssets + mfAssets + physicalAssets;

    let totalLiabilities = 0;
    if (db.loans) {
        db.loans.forEach(l => {
            let amt = parseFloat(l.amount) || 0;
            let rep = parseFloat(l.repaid) || 0;
            totalLiabilities += (amt - rep);
        });
    }

    const netWorth = totalAssets - totalLiabilities;

    const formatINR = (val) => '₹' + val.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    const elTotalAssets = document.getElementById('nwTotalAssets');
    const elTotalLiab = document.getElementById('nwTotalLiabilities');
    const elTotalNW = document.getElementById('nwTotalNetWorth');
    if (elTotalAssets) elTotalAssets.innerText = formatINR(totalAssets);
    if (elTotalLiab) elTotalLiab.innerText = formatINR(totalLiabilities);
    if (elTotalNW) elTotalNW.innerText = formatINR(netWorth);

    const elRepBank = document.getElementById('repBankAssets');
    const elRepMf = document.getElementById('repMfAssets');
    const elRepPhys = document.getElementById('repPhysicalAssets');
    const elRepLiab = document.getElementById('repLiabilities');
    const elRepNW = document.getElementById('repNetWorthFinal');

    if (elRepBank) elRepBank.innerText = formatINR(bankAssets);
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
                    labels: ['Banking & Liquid', 'Mutual Funds', 'Physical Assets'],
                    datasets: [{
                        data: [bankAssets, mfAssets, physicalAssets],
                        backgroundColor: [
                            '#88A3D6',
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
