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

        if (compCountBadge) compCountBadge.innerText = completedGoals.length.toString();
        if (compBadgeCount) compBadgeCount.innerText = `${completedGoals.length} Items`;

        const renderRow = (g, idx, isComp) => {
            const tr = document.createElement('tr');
            tr.className = 'group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0';

            const statusBadge = getStatusBadge(g.status, isComp);
            
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
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100 ${isComp ? 'line-through text-slate-500' : ''}">${g.title}</div>
                        ${(g.notes || g.desc) ? `<div class="text-[10px] text-slate-400 font-light mt-0.5">${g.notes || g.desc}</div>` : ''}
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
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100 ${isComp ? 'line-through text-slate-500' : ''}">${g.title}</div>
                        ${(g.notes || g.desc) ? `<div class="text-[10px] text-slate-400 font-light mt-0.5">${g.notes || g.desc}</div>` : ''}
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

        const colSpan = cat === 'financial' ? 10 : 8;
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

        if (activeList.length === 0) {
            activeTable.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-flag-checkered text-2xl mb-2 block opacity-40"></i> All milestones completed or no active targets logged.</td></tr>`;
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
                
                tr.innerHTML = `
                    <td class="py-3 px-3 w-12 text-center font-mono text-xs text-slate-400">${idx + 1}</td>
                    <td class="py-3 px-3">
                        <div class="font-semibold text-slate-100">${g.title}</div>
                        ${(g.notes || g.desc) ? `<div class="text-[10px] text-slate-400 font-light mt-0.5">${g.notes || g.desc}</div>` : ''}
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
    if (!g.notes || g.notes === g.desc) {
        g.notes = textContent.slice(0, 120);
        g.desc = g.notes;
    }
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
            return (b.id || '').localeCompare(a.id || '');
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
                card.onclick = (e) => {
                    if (e.target.closest('button')) return;
                    openNoteReader(note.id);
                };

                card.innerHTML = `
                    <!-- Accent top glow bar -->
                    <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.gradient}"></div>
                    
                    <div class="space-y-3">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-2 min-w-0">
                                ${isPinned ? `<span class="w-5 h-5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-[10px] shrink-0" title="Pinned Note"><i class="fa-solid fa-thumbtack"></i></span>` : ''}
                                <h4 class="font-display text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1 ${fontClass}">${note.title || 'Untitled Note'}</h4>
                            </div>
                            <!-- Quick Action Buttons on Hover -->
                            <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onclick="event.stopPropagation()">
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
                tr.onclick = (e) => {
                    if (e.target.closest('button')) return;
                    openNoteReader(note.id);
                };

                tr.innerHTML = `
                    <td class="p-4 text-center" onclick="event.stopPropagation()">
                        <button onclick="toggleNotePin('${note.id}')" class="p-1 text-slate-500 hover:text-amber-400 transition-colors cursor-pointer">
                            <i class="fa-solid fa-thumbtack ${isPinned ? 'text-amber-400' : 'opacity-30'}"></i>
                        </button>
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
        } else {
            btn.className = 'px-3 py-1.5 rounded-xl border border-surface-700 bg-surface-900 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-sm';
            label.innerText = 'Pin';
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
        showToast(note.pinned ? 'Note pinned to top' : 'Note unpinned');
    }
}
window.toggleNotePin = toggleNotePin;

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

function openNoteModal(id = null) {
    const idEl = document.getElementById('noteId');
    if (idEl) idEl.value = id || '';
    
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
            if (titleInput) titleInput.value = n.title || '';
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
    const title = titleInput ? (titleInput.value.trim() || 'Untitled Note') : 'Untitled Note';
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
    const wordCountEl = document.getElementById('viewNoteWordCount');
    const wrapper = document.getElementById('viewNoteWrapper');
    const glow = document.getElementById('viewNoteGlow');

    const colorKey = n.accentColor || 'gold';
    const theme = noteThemeMap[colorKey] || noteThemeMap['gold'];
    const fontClass = noteFontMap[n.fontFamily] || 'note-font-inter';

    if (wrapper) {
        wrapper.className = `max-w-4xl w-full h-full max-h-[88vh] rounded-[2rem] p-[2px] bg-gradient-to-br ${theme.gradient} shadow-[0_0_60px_rgba(201,164,107,0.25)] relative group`;
    }
    if (glow) {
        glow.className = `absolute inset-0 bg-gradient-to-br ${theme.gradient} rounded-[2rem] blur-2xl opacity-25 group-hover:opacity-45 transition-opacity duration-700 -z-10`;
    }

    if (pinBadge) {
        if (n.pinned) pinBadge.classList.remove('hidden');
        else pinBadge.classList.add('hidden');
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
    if (!r.date) return false;
    let dStr = r.date;
    if (dStr.includes('/')) {
        const p = dStr.split('/');
        if (p.length === 3) dStr = `${p[2]}-${p[1]}-${p[0]}`;
    }
    const timeStr = r.time || '23:59';
    const due = new Date(`${dStr}T${timeStr}:00`);
    return !isNaN(due.getTime()) && due < new Date();
}

function isReminderToday(r) {
    if (!r.date) return false;
    let dStr = r.date;
    if (dStr.includes('/')) {
        const p = dStr.split('/');
        if (p.length === 3) dStr = `${p[2]}-${p[1]}-${p[0]}`;
    }
    const today = new Date().toISOString().split('T')[0];
    return dStr === today;
}

function setReminderFilter(filter) {
    currentReminderFilter = filter;
    ['all', 'active', 'high', 'overdue', 'completed'].forEach(f => {
        const btn = document.getElementById(`btnReminderFilter-${f}`);
        if (!btn) return;
        if (f === filter) {
            btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-medium bg-brand-500/15 text-brand-300 border border-brand-500/30 transition-all whitespace-nowrap cursor-pointer shadow-sm';
        } else {
            btn.className = 'px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-all whitespace-nowrap cursor-pointer';
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
    if (r.date) {
        let dStr = r.date;
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
    r.date = newDDMMYYYY;
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

    // Update KPI Elements
    const activeStat = document.getElementById('remindersActiveStat');
    const highStat = document.getElementById('remindersHighStat');
    const overdueStat = document.getElementById('remindersOverdueStat');
    const completedStat = document.getElementById('remindersCompletedStat');
    const completionRateEl = document.getElementById('remindersCompletionRate');

    if (activeStat) activeStat.innerText = totalActive.toString();
    if (highStat) highStat.innerText = totalHigh.toString();
    if (overdueStat) overdueStat.innerText = totalOverdue.toString();
    if (completedStat) completedStat.innerText = totalCompleted.toString();
    if (completionRateEl) completionRateEl.innerText = `${completionRate}% Done`;

    // Update Count Badges on Filters
    const cntAll = document.getElementById('cntFilterAll');
    const cntAct = document.getElementById('cntFilterActive');
    const cntHigh = document.getElementById('cntFilterHigh');
    const cntOverdue = document.getElementById('cntFilterOverdue');
    const cntComp = document.getElementById('cntFilterCompleted');

    if (cntAll) cntAll.innerText = totalAll.toString();
    if (cntAct) cntAct.innerText = totalActive.toString();
    if (cntHigh) cntHigh.innerText = totalHigh.toString();
    if (cntOverdue) cntOverdue.innerText = totalOverdue.toString();
    if (cntComp) cntComp.innerText = totalCompleted.toString();

    // Search query & clear button visibility
    const searchInput = document.getElementById('reminderSearchInput');
    const clearBtn = document.getElementById('btnClearReminderSearch');
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();
    if (clearBtn) {
        if (q) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }

    // Sort by Date & Priority
    let list = [...db.reminders].sort((a, b) => {
        const isCompA = a.completed || a.status === 'completed';
        const isCompB = b.completed || b.status === 'completed';
        if (isCompA !== isCompB) return isCompA ? 1 : -1;

        const dateA = a.date ? (a.date.includes('/') ? a.date.split('/').reverse().join('-') : a.date) : '';
        const dateB = b.date ? (b.date.includes('/') ? b.date.split('/').reverse().join('-') : b.date) : '';
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

                // Date Parsing for Date Box
                let dayNum = '--';
                let monthStr = 'DATE';
                let dayOfWeek = '';
                if (r.date) {
                    let dStr = r.date;
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
                                <span class="flex items-center gap-1.5 text-slate-300">
                                    <i class="fa-regular fa-calendar text-[10px] text-brand-400"></i>
                                    <span>${dayOfWeek ? dayOfWeek + ', ' : ''}${formatToDDMMYYYY(r.date)}</span>
                                </span>
                                ${r.time ? `<span class="flex items-center gap-1 text-slate-400"><i class="fa-regular fa-clock text-[9px] text-brand-400"></i>${r.time}</span>` : ''}
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
            body.innerHTML = `<tr><td colspan="5" class="p-12 text-center text-slate-500 font-light text-xs"><i class="fa-regular fa-calendar-check text-3xl mb-3 block opacity-40"></i> No reminders found matching the current filter.</td></tr>`;
        } else {
            list.forEach(r => {
                const isComp = r.completed || r.status === 'completed';
                const isOverdue = isReminderOverdue(r);

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
                        <div class="flex items-center gap-1.5 text-slate-300">
                            <i class="fa-regular fa-calendar text-[10px] text-brand-400"></i>
                            <span>${formatToDDMMYYYY(r.date)}</span>
                        </div>
                        ${r.time ? `<div class="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5"><i class="fa-regular fa-clock text-[9px] text-brand-400"></i><span>${r.time}</span></div>` : ''}
                        ${isOverdue && !isComp ? `<span class="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold font-mono uppercase tracking-wider">Overdue</span>` : ''}
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
    const dateInput = document.getElementById('reminderDateInput');
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
            if (dateInput) {
                if (dateInput._flatpickr) {
                    dateInput._flatpickr.setDate(r.date && r.date.includes('-') ? r.date.split('-').reverse().join('/') : (r.date || todayFormatted));
                } else {
                    dateInput.value = r.date || todayFormatted;
                }
            }
            if (timeInput) timeInput.value = r.time || '';
            if (prioInput) prioInput.value = r.priority || r.category || 'Medium';
            if (repInput) repInput.value = r.repeat || 'None';
            if (notesInput) notesInput.value = r.notes || '';
        }
    } else {
        if (titleEl) titleEl.innerText = 'Add Reminder';
        if (titleInput) titleInput.value = '';
        if (dateInput) {
            if (dateInput._flatpickr) {
                dateInput._flatpickr.setDate(new Date());
            } else {
                dateInput.value = todayFormatted;
            }
        }
        if (timeInput) timeInput.value = '';
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

        const now = ctx.currentTime;

        const playTone = (freq, startTime, duration, gainLevel, type = 'sine') => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        // Modern harmonic 2-tone executive bell chime (E5 -> A5 with sparkling overtones)
        playTone(659.25, now, 0.35, 0.22, 'sine');
        playTone(987.77, now + 0.015, 0.22, 0.06, 'triangle');
        playTone(880.00, now + 0.12, 0.55, 0.26, 'sine');
        playTone(1318.51, now + 0.135, 0.38, 0.07, 'triangle');
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
    const dateInput = document.getElementById('reminderDateInput');
    const dateRaw = dateInput ? dateInput.value.trim() : '';
    let date = dateRaw;
    if (dateRaw && dateRaw.includes('-')) {
        const p = dateRaw.split('-');
        if (p.length === 3) date = `${p[2]}/${p[1]}/${p[0]}`;
    }
    const titleInput = document.getElementById('reminderTitleInput');
    const title = titleInput ? (titleInput.value.trim() || 'Reminder') : 'Reminder';
    const timeInput = document.getElementById('reminderTimeInput');
    const time = timeInput ? timeInput.value.trim() : '';
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
            r.date = date;
            r.time = time;
            r.title = title;
            r.priority = priority;
            r.category = priority;
            r.repeat = repeat;
            r.notes = notes;
        }
    } else {
        db.reminders.push({
            id: Date.now().toString(),
            date,
            time,
            title,
            priority,
            category: priority,
            repeat,
            notes,
            status: 'active',
            completed: false,
            createdAt: new Date().toISOString()
        });
    }

    // Reflect directly in Notification Hub with chime
    pushNotification({
        title: isNew ? `New Reminder: ${title}` : `Updated Reminder: ${title}`,
        desc: `${date}${time ? ' at ' + time : ''} • Priority: ${priority}${repeat !== 'None' ? ' • Repeat: ' + repeat : ''}`,
        type: 'reminder',
        category: 'reminder',
        linkPage: 'reminders',
        playSound: isNew
    });

    renderRemindersTable();
    closeModal('reminderModal');
    showToast(isNew ? 'Reminder created & added to Notification Hub' : 'Reminder updated');
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
            desc: `Scheduled for ${r.date} marked as completed`,
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
    let triggerCount = 0;

    db.reminders.forEach(r => {
        if (!r.completed && r.status !== 'completed' && r.date) {
            let d;
            if (r.date.includes('/')) {
                const p = r.date.split('/');
                d = new Date(`${p[2]}-${p[1]}-${p[0]}T${r.time || '23:59'}:00`);
            } else {
                d = new Date(`${r.date}T${r.time || '23:59'}:00`);
            }

            if (!isNaN(d.getTime()) && d <= now && !r.notifiedDue) {
                r.notifiedDue = true;
                pushNotification({
                    title: `Reminder Due: ${r.title}`,
                    desc: `${r.date}${r.time ? ' at ' + r.time : ''} • Priority: ${r.priority || 'Medium'}`,
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
    if (!list) return;

    list.innerHTML = '';
    const notifs = db.notifications || [];
    const unreadCount = notifs.filter(n => !n.read).length;

    if (badge) {
        if (unreadCount > 0) {
            badge.innerText = unreadCount.toString();
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    notifs.forEach(n => {
        const item = document.createElement('div');
        const isRead = !!n.read;
        item.className = `p-4 rounded-xl border flex items-start justify-between gap-3 transition-all ${
            isRead 
            ? 'bg-surface-900/40 border-surface-800/60 text-slate-500 hover:border-surface-700' 
            : 'bg-surface-900/80 border-surface-700 text-slate-200 shadow-md hover:border-amber-500/40'
        }`;

        let iconClass = 'fa-solid fa-bell text-indigo-400';
        if (n.category === 'transaction' || n.type === 'transaction') iconClass = 'fa-solid fa-receipt text-emerald-400';
        else if (n.category === 'goal' || n.type === 'goal') iconClass = 'fa-solid fa-bullseye text-brand-500';
        else if (n.category === 'asset' || n.type === 'asset') iconClass = 'fa-solid fa-vault text-accent-cyan';

        item.innerHTML = `
            <div class="flex items-start gap-3 flex-1 min-w-0 cursor-pointer" onclick="handleNotificationClick('${n.id}', '${n.linkPage || ''}')">
                <div class="w-8 h-8 rounded-lg bg-surface-800/80 border border-surface-700 flex items-center justify-center shrink-0 mt-0.5">
                    <i class="${iconClass} text-xs"></i>
                </div>
                <div class="space-y-1 flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <h5 class="text-xs font-semibold ${isRead ? 'text-slate-400' : 'text-slate-100'} truncate">${n.title}</h5>
                        <span class="font-mono text-[9px] text-slate-500 shrink-0">${n.date}</span>
                    </div>
                    ${n.desc ? `<p class="text-[11px] font-light ${isRead ? 'text-slate-500' : 'text-slate-400'} line-clamp-2 leading-relaxed">${n.desc}</p>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0 self-center">
                ${!isRead ? `<button onclick="toggleSingleNotificationRead('${n.id}')" class="p-1 text-slate-500 hover:text-amber-400 transition-colors" title="Mark Read"><i class="fa-solid fa-circle-check text-xs"></i></button>` : ''}
                <button onclick="deleteNotification('${n.id}')" class="p-1 text-slate-500 hover:text-rose-400 transition-colors" title="Delete"><i class="fa-solid fa-xmark text-xs"></i></button>
            </div>
        `;
        list.appendChild(item);
    });

    if (notifs.length === 0) {
        list.innerHTML = `<div class="p-10 text-center text-slate-500 text-xs font-light"><i class="fa-regular fa-bell text-2xl mb-2 block opacity-30"></i> No notifications yet. Reminders and milestone updates will appear here.</div>`;
    }
}
window.renderNotifications = renderNotifications;

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
    const canvas = document.getElementById('growthChartCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (window.growthChartInst) window.growthChartInst.destroy();

    const labels = ['2021', '2022', '2023', '2024', '2025', '2026 (Live)'];
    const data = [1200000, 2400000, 4800000, 8500000, 14200000, 21850000];

    window.growthChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Consolidated Wealth Trajectory (INR)',
                data: data,
                borderColor: '#C9A46B',
                backgroundColor: 'rgba(201, 164, 107, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#C9A46B',
                pointBorderColor: '#070A0F',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { grid: chartGridOptions },
                y: {
                    grid: chartGridOptions,
                    ticks: {
                        callback: function(val) {
                            return '₹' + (val / 100000).toFixed(1) + 'L';
                        }
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

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

    if (window.firebaseUser) {
        if (window.firebaseUser.isAnonymous) {
            if (emailDisp) emailDisp.innerHTML = '<span class="text-emerald-400 font-mono text-xs">● Connected (Worldwide Cloud Sync Active)</span>';
            if (authBtn) {
                authBtn.innerHTML = '<i class="fa-brands fa-google text-brand-500"></i> <span>Sign in with Google</span>';
                authBtn.className = 'px-4 py-2 bg-brand-600 hover:bg-brand-500 text-surface-950 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md';
            }
        } else {
            const email = window.firebaseUser.email || window.firebaseUser.displayName || 'Google Account';
            if (emailDisp) emailDisp.innerHTML = `<span class="text-emerald-400 font-mono text-xs">● Signed In:</span> <span class="text-white font-medium text-xs">${email}</span>`;
            if (authBtn) {
                authBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket text-rose-400"></i> <span>Sign Out</span>';
                authBtn.className = 'px-4 py-2 bg-surface-800 hover:bg-rose-900/40 text-rose-300 rounded-xl text-xs font-semibold border border-surface-700 transition-all flex items-center gap-2';
            }
        }
    } else {
        if (emailDisp) emailDisp.innerText = 'Connecting to Firebase...';
    }

    if (syncTime) {
        syncTime.innerText = 'Last sync: ' + new Date().toLocaleTimeString();
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
