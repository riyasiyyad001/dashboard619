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
                        <div class="font-display font-medium text-slate-100 tracking-normal ${isComp ? 'line-through text-slate-500' : ''}">${g.title}</div>
                    </td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-400">${g.startDate || '-'}</td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300 font-medium">${g.targetDate || '-'}</td>
                    <td class="py-3 px-3 font-mono text-xs text-slate-300 text-right">₹${est.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td class="py-3 px-3 font-mono text-xs font-normal text-emerald-400 text-right">₹${paid.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
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
                        <div class="font-display font-medium text-slate-100 tracking-normal ${isComp ? 'line-through text-slate-500' : ''}">${g.title}</div>
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
                        <div class="font-display font-medium text-slate-100 tracking-normal">${g.title}</div>
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
                            <span class="text-xs font-mono font-normal text-slate-200 shrink-0 w-10 text-right">${progressPct}%</span>
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
            genreInput.placeholder = '';
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
    if (!db.uiState) db.uiState = {};
    if (!db.uiState.notes) db.uiState.notes = {};
    db.uiState.notes.viewMode = mode;
    saveDatabase();

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
    if (!db.uiState) db.uiState = {};
    if (!db.uiState.notes) db.uiState.notes = {};
    const catEl = document.getElementById('notesCategoryFilter');
    const colorEl = document.getElementById('notesColorFilter');
    const sortEl = document.getElementById('notesSortSelect');
    if (catEl) db.uiState.notes.category = catEl.value;
    if (colorEl) db.uiState.notes.color = colorEl.value;
    if (sortEl) db.uiState.notes.sortBy = sortEl.value;
    saveDatabase();
    renderNotesList();
}
window.filterNotes = filterNotes;

function renderNotesList() {
    const gridContainer = document.getElementById('notesGridContainer');
    const listTableBody = document.getElementById('notesListTableBody');
    const countBadge = document.getElementById('notesCountBadge');
    
    if (!db.notes) db.notes = [];
    if (countBadge) countBadge.innerText = db.notes.length.toString();

    // Restore persisted UI state
    const catEl = document.getElementById('notesCategoryFilter');
    const colorEl = document.getElementById('notesColorFilter');
    const sortEl = document.getElementById('notesSortSelect');

    if (db.uiState && db.uiState.notes) {
        if (catEl && db.uiState.notes.category && catEl.value !== db.uiState.notes.category) {
            catEl.value = db.uiState.notes.category;
        }
        if (colorEl && db.uiState.notes.color && colorEl.value !== db.uiState.notes.color) {
            colorEl.value = db.uiState.notes.color;
        }
        if (sortEl && db.uiState.notes.sortBy && sortEl.value !== db.uiState.notes.sortBy) {
            sortEl.value = db.uiState.notes.sortBy;
        }
        if (db.uiState.notes.viewMode && db.uiState.notes.viewMode !== notesViewMode) {
            notesViewMode = db.uiState.notes.viewMode;
            const btnGrid = document.getElementById('btnNoteViewGrid');
            const btnList = document.getElementById('btnNoteViewList');
            const listContainer = document.getElementById('notesListContainer');
            if (btnGrid && btnList) {
                if (notesViewMode === 'grid') {
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
        }
    }

    // Read filters
    const catFilter = (catEl ? catEl.value : 'all') || 'all';
    const colorFilter = (colorEl ? colorEl.value : 'all') || 'all';
    const sortBy = (sortEl ? sortEl.value : 'pinned') || 'pinned';

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
    const headingEl = document.getElementById('confirmDeleteHeading');
    const msgEl = document.getElementById('confirmDeleteMessage') || document.getElementById('confirmationDialogMsg');
    const badgeEl = document.getElementById('confirmStepBadge');
    const stepTextEl = document.getElementById('confirmStepText');
    const warnBox = document.getElementById('confirmStep2WarningBox');
    const btnText = document.getElementById('confirmExecuteBtnText');

    if (headingEl) headingEl.textContent = 'Confirm Deletion';
    if (msgEl) msgEl.innerText = msg;
    if (badgeEl) badgeEl.classList.remove('hidden');
    if (stepTextEl) stepTextEl.textContent = 'CONFIRMATION';
    if (warnBox) warnBox.classList.add('hidden');
    if (btnText) btnText.textContent = 'Delete';

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
let docViewMode = (function() {
    try {
        return localStorage.getItem('executive_doc_view_mode') || 'grid';
    } catch (e) {
        return 'grid';
    }
})();
let modalDocStagedFile = null;
let modalExcelStagedFile = null;

function openExcelUploadModal(source = 'documents') {
    modalExcelStagedFile = null;
    const titleInput = document.getElementById('modalExcelTitleInput');
    const catSelect = document.getElementById('modalExcelCategorySelect');
    const dateInput = document.getElementById('modalExcelDateInput');
    const tagsInput = document.getElementById('modalExcelTagsInput');
    const confCheck = document.getElementById('modalExcelConfidentialCheck');
    const notesInput = document.getElementById('modalExcelNotesInput');
    const fileInput = document.getElementById('modalExcelFileInput');
    const fileChip = document.getElementById('modalExcelSelectedFileInfo');

    if (titleInput) titleInput.value = '';
    if (catSelect) {
        if (source === 'credentials') {
            catSelect.value = 'personal';
        } else {
            catSelect.value = (typeof docActiveSubCategory !== 'undefined' && docActiveSubCategory !== 'all' && docActiveSubCategory !== 'identity') ? docActiveSubCategory : 'financial';
        }
    }
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    if (tagsInput) tagsInput.value = '';
    if (confCheck) confCheck.checked = (source === 'credentials');
    if (notesInput) notesInput.value = '';
    if (fileInput) fileInput.value = '';
    if (fileChip) fileChip.classList.add('hidden');

    openModal('excelUploadModal');
}
window.openExcelUploadModal = openExcelUploadModal;

function handleModalExcelFileSelect(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    stageExcelFile(file);
}
window.handleModalExcelFileSelect = handleModalExcelFileSelect;

function handleModalExcelDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('modalExcelDropzone');
    if (el) el.classList.add('border-emerald-400', 'bg-emerald-500/10');
}
window.handleModalExcelDragOver = handleModalExcelDragOver;

function handleModalExcelDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('modalExcelDropzone');
    if (el) el.classList.remove('border-emerald-400', 'bg-emerald-500/10');
}
window.handleModalExcelDragLeave = handleModalExcelDragLeave;

function handleModalExcelDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('modalExcelDropzone');
    if (el) el.classList.remove('border-emerald-400', 'bg-emerald-500/10');

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        stageExcelFile(e.dataTransfer.files[0]);
    }
}
window.handleModalExcelDrop = handleModalExcelDrop;

function stageExcelFile(file) {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
        showToast('File too large! Maximum 15MB allowed per Excel workbook.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
        modalExcelStagedFile = {
            name: file.name,
            size: file.size,
            type: 'excel',
            mimeType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            data: evt.target.result
        };

        const fileChip = document.getElementById('modalExcelSelectedFileInfo');
        const fileNameEl = document.getElementById('modalExcelSelectedName');
        const fileMetaEl = document.getElementById('modalExcelSelectedMeta');
        const titleInput = document.getElementById('modalExcelTitleInput');

        if (fileNameEl) fileNameEl.innerText = file.name;
        if (fileMetaEl) fileMetaEl.innerText = `${(file.size / 1024).toFixed(1)} KB • Excel Spreadsheet`;
        if (fileChip) fileChip.classList.remove('hidden');

        // Auto populate title if blank
        if (titleInput && !titleInput.value.trim()) {
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
            titleInput.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        }
    };
    reader.readAsDataURL(file);
}
window.stageExcelFile = stageExcelFile;

function generateSampleExcelTemplate() {
    try {
        if (typeof XLSX === 'undefined') {
            showToast('Excel engine loading, please try in a moment');
            return;
        }

        // Build a multi-sheet financial workbook using SheetJS
        const wb = XLSX.utils.book_new();

        // 1. Executive Summary Sheet
        const summaryData = [
            ["EXECUTIVE FINANCIAL PORTFOLIO & AUDIT LEDGER 2026", "", "", ""],
            ["Generated on", new Date().toLocaleDateString(), "Currency", "USD / INR"],
            ["", "", "", ""],
            ["Category", "Asset / Description", "Valuation (USD)", "Allocation %"],
            ["Real Estate", "Prime Commercial Plot & Luxury Residence", 850000, "41.5%"],
            ["Equity & Securities", "NSE / NASDAQ Growth Portfolio", 420000, "20.5%"],
            ["Treasury & Cash", "Private Reserve & Term Deposits", 310000, "15.1%"],
            ["Business Ventures", "Operating Entity Equity Stakes", 350000, "17.1%"],
            ["Precious Metals", "Sovereign Gold & Safe Custody", 120000, "5.8%"],
            ["TOTAL NET ASSETS", "", 2050000, "100.0%"]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Portfolio Summary");

        // 2. Cash Flow Forecast Sheet
        const cashFlowData = [
            ["QUARTERLY CASH FLOW ANALYSIS 2026", "", "", ""],
            ["Quarter", "Projected Inflow", "Operating Outflow", "Net Surplus"],
            ["Q1 2026", 75000, 28000, 47000],
            ["Q2 2026", 82000, 31000, 51000],
            ["Q3 2026", 90000, 30000, 60000],
            ["Q4 2026", 110000, 35000, 75000],
            ["TOTALS", 357000, 124000, 233000]
        ];
        const wsCashFlow = XLSX.utils.aoa_to_sheet(cashFlowData);
        XLSX.utils.book_append_sheet(wb, wsCashFlow, "Cash Flow Forecast");

        // Write as Base64 data URL
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
        const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;

        modalExcelStagedFile = {
            name: 'Executive_Financial_Ledger_2026.xlsx',
            size: Math.round(dataUrl.length * 0.75),
            type: 'excel',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            data: dataUrl
        };

        const fileChip = document.getElementById('modalExcelSelectedFileInfo');
        const fileNameEl = document.getElementById('modalExcelSelectedName');
        const fileMetaEl = document.getElementById('modalExcelSelectedMeta');
        const titleInput = document.getElementById('modalExcelTitleInput');

        if (fileNameEl) fileNameEl.innerText = 'Executive_Financial_Ledger_2026.xlsx';
        if (fileMetaEl) fileMetaEl.innerText = `${(modalExcelStagedFile.size / 1024).toFixed(1)} KB • Multi-Sheet Excel Workbook`;
        if (fileChip) fileChip.classList.remove('hidden');

        if (titleInput && !titleInput.value.trim()) {
            titleInput.value = 'Executive Financial Portfolio & Cash Flow Model 2026';
        }

        showToast('Created sample multi-sheet Excel model ready to save!');
    } catch (err) {
        console.error('Error generating template:', err);
        showToast('Error generating template: ' + err.message);
    }
}
window.generateSampleExcelTemplate = generateSampleExcelTemplate;

async function saveExcelDocumentItem() {
    const titleInput = document.getElementById('modalExcelTitleInput');
    const catSelect = document.getElementById('modalExcelCategorySelect');
    const dateInput = document.getElementById('modalExcelDateInput');
    const tagsInput = document.getElementById('modalExcelTagsInput');
    const confCheck = document.getElementById('modalExcelConfidentialCheck');
    const notesInput = document.getElementById('modalExcelNotesInput');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
        showToast('Please enter a spreadsheet title or description');
        return;
    }

    // If no file uploaded, automatically build sample template so user can save immediately
    if (!modalExcelStagedFile) {
        generateSampleExcelTemplate();
    }

    if (!Array.isArray(db.documents)) db.documents = [];

    const tags = (tagsInput ? tagsInput.value : '')
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .map(t => t.startsWith('#') ? t : `#${t}`);

    const docId = `doc_xls_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const fileData = modalExcelStagedFile ? modalExcelStagedFile.data : null;

    const newDoc = {
        id: docId,
        title: title,
        category: catSelect ? catSelect.value : 'financial',
        fileType: 'excel',
        mimeType: modalExcelStagedFile ? modalExcelStagedFile.mimeType : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileData: fileData,
        fileSize: modalExcelStagedFile ? modalExcelStagedFile.size : 52000,
        date: dateInput ? (dateInput.value || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        tags: tags.length > 0 ? tags : ['#Excel', '#Financial'],
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
    modalExcelStagedFile = null;
    if (titleInput) titleInput.value = '';
    if (notesInput) notesInput.value = '';
    const fileChip = document.getElementById('modalExcelSelectedFileInfo');
    if (fileChip) fileChip.classList.add('hidden');
    const fileInput = document.getElementById('modalExcelFileInput');
    if (fileInput) fileInput.value = '';

    closeModal('excelUploadModal');
    renderDocumentsPage();
    showToast(`Saved Excel spreadsheet "${title}" to Vault`);
}
window.saveExcelDocumentItem = saveExcelDocumentItem;

function setDocumentCategoryFilter(cat) {
    docActiveCategoryFilter = cat;
    renderDocumentsPage();
}
window.setDocumentCategoryFilter = setDocumentCategoryFilter;

function setDocumentSubCategory(subCat) {
    docActiveSubCategory = subCat;

    const cats = ['home', 'properties', 'identity', 'financial', 'business', 'bills', 'personal', 'all', 'legal', 'receipts'];
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
    try {
        localStorage.setItem('executive_doc_view_mode', mode);
        if (window.db) {
            if (!window.db.uiState) window.db.uiState = {};
            if (!window.db.uiState.documents) window.db.uiState.documents = {};
            window.db.uiState.documents.viewMode = mode;
            if (typeof saveDatabase === 'function') saveDatabase(false);
        }
    } catch (e) {}

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
        const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.csv') || (file.type && (file.type.includes('spreadsheet') || file.type.includes('excel')));

        modalDocStagedFile = {
            name: file.name,
            size: file.size,
            type: isExcel ? 'excel' : (isPdf ? 'pdf' : (isImg ? 'photo' : 'other')),
            mimeType: file.type || (isExcel ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : (isPdf ? 'application/pdf' : 'application/octet-stream')),
            data: evt.target.result
        };

        const fileChip = document.getElementById('modalDocSelectedFileInfo');
        const fileNameEl = document.getElementById('modalDocSelectedName');
        const fileMetaEl = document.getElementById('modalDocSelectedMeta');
        const fileIcon = document.getElementById('modalDocSelectedIcon');
        const titleInput = document.getElementById('modalDocTitleInput');

        if (fileNameEl) fileNameEl.innerText = file.name;
        if (fileMetaEl) fileMetaEl.innerText = `${(file.size / 1024).toFixed(1)} KB • ${isExcel ? 'Excel Spreadsheet' : (file.type || 'Document')}`;
        if (fileIcon) {
            fileIcon.className = isExcel ? 'fa-solid fa-file-excel text-emerald-400 text-sm shrink-0' : (isPdf ? 'fa-solid fa-file-pdf text-rose-400 text-sm shrink-0' : (isImg ? 'fa-solid fa-image text-cyan-400 text-sm shrink-0' : 'fa-solid fa-file-lines text-emerald-400 text-sm shrink-0'));
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
        if (docActiveSubCategory !== 'all') {
            const cat = (d.category || '').toLowerCase();
            if (docActiveSubCategory === 'home') {
                if (cat !== 'home' && cat !== 'my_home') return false;
            } else if (docActiveSubCategory === 'properties') {
                if (cat !== 'properties' && cat !== 'property' && cat !== 'legal') return false;
            } else if (docActiveSubCategory === 'identity') {
                if (cat !== 'identity') return false;
            } else if (docActiveSubCategory === 'financial') {
                if (cat !== 'financial' && cat !== 'fin_tax' && cat !== 'tax') return false;
            } else if (docActiveSubCategory === 'business') {
                if (cat !== 'business') return false;
            } else if (docActiveSubCategory === 'bills') {
                if (cat !== 'bills' && cat !== 'bills_warranty' && cat !== 'warranty' && cat !== 'receipts') return false;
            } else if (docActiveSubCategory === 'personal') {
                if (cat !== 'personal' && cat !== 'photo') return false;
            } else if (cat !== docActiveSubCategory) {
                return false;
            }
        }

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
                const isXls = d.fileType === 'excel' || (d.mimeType && (d.mimeType.includes('spreadsheet') || d.mimeType.includes('excel') || d.mimeType.includes('csv')));
                const sizeText = d.fileSize ? (d.fileSize > 1024 * 1024 ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(d.fileSize / 1024)} KB`) : (isXls ? 'Excel Sheet' : 'PDF Doc');

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
                            `) : (isXls ? `
                                <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-sm group-hover/dcard:scale-110 transition-transform">
                                    <i class="fa-solid fa-file-excel text-2xl text-emerald-400"></i>
                                </div>
                                <span class="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-1">
                                    <i class="fa-solid fa-table-cells text-[9px] text-emerald-400"></i> Interactive Sheet
                                </span>
                            ` : `
                                <div class="w-12 h-12 rounded-2xl ${isPdf ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'} flex items-center justify-center shadow-sm group-hover/dcard:scale-110 transition-transform">
                                    <i class="fa-solid ${isPdf ? 'fa-file-pdf' : 'fa-file-shield'} text-2xl"></i>
                                </div>
                                <span class="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-1">
                                    <i class="fa-solid fa-expand text-[9px] text-emerald-400"></i> ${isPdf ? 'Open PDF Preview' : 'Preview Document'}
                                </span>
                            `)}
                        </div>

                        <!-- Title & Meta -->
                        <div>
                            <h4 onclick="previewDocumentItem('${d.id}')" class="font-display text-sm font-bold text-white group-hover/dcard:text-emerald-300 transition-colors line-clamp-1 cursor-pointer" title="${d.title}">${d.title}</h4>
                            <p class="text-[10px] font-mono text-slate-400 mt-0.5">${sizeText} • ${isXls ? 'Excel Spreadsheet' : (isPdf ? 'PDF Document' : (isImg ? 'High-Res Photo' : 'Secure File'))}</p>
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
                            <button onclick="toggleDocumentFavorite('${d.id}', event)" class="p-1.5 rounded-lg ${((db.favorites || []).some(x => x.linkedDocId === d.id || x.title === d.title)) ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-amber-300 hover:bg-surface-800'} transition-colors cursor-pointer" title="${((db.favorites || []).some(x => x.linkedDocId === d.id || x.title === d.title)) ? 'Favorited' : 'Add to Favorites'}">
                                <i class="${((db.favorites || []).some(x => x.linkedDocId === d.id || x.title === d.title)) ? 'fa-solid' : 'fa-regular'} fa-star text-xs"></i>
                            </button>
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
                const isXls = d.fileType === 'excel' || (d.mimeType && (d.mimeType.includes('spreadsheet') || d.mimeType.includes('excel') || d.mimeType.includes('csv')));
                const sizeText = d.fileSize ? (d.fileSize > 1024 * 1024 ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(d.fileSize / 1024)} KB`) : (isXls ? 'Excel' : 'PDF');

                const tr = document.createElement('tr');
                tr.className = 'group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0';
                tr.innerHTML = `
                    <td class="p-3.5">
                        <div class="flex items-center gap-3 cursor-pointer" onclick="previewDocumentItem('${d.id}')">
                            <div class="w-8 h-8 rounded-lg ${isXls ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : (isPdf ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : (isImg ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'))} flex items-center justify-center shrink-0">
                                <i class="fa-solid ${isXls ? 'fa-file-excel text-emerald-400' : (isPdf ? 'fa-file-pdf' : (isImg ? 'fa-image' : 'fa-file-lines'))} text-xs"></i>
                            </div>
                            <div class="truncate">
                                <div class="font-medium text-white group-hover:text-emerald-300 transition-colors truncate">${d.title}</div>
                                <div class="text-[10px] font-mono text-slate-500 truncate">${d.notes || 'Encrypted record'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="p-3.5">${getDocCategoryBadge(d.category)}</td>
                    <td class="p-3.5 font-mono text-xs text-slate-400">${isXls ? 'Excel Spreadsheet' : (isPdf ? 'PDF Document' : (isImg ? 'Media Photo' : 'Record File'))}</td>
                    <td class="p-3.5 font-mono text-xs text-slate-400">${sizeText}</td>
                    <td class="p-3.5 font-mono text-xs text-slate-400">${d.date || '-'}</td>
                    <td class="p-3.5 text-right">
                        <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="toggleDocumentFavorite('${d.id}', event)" class="p-1.5 rounded-lg ${((db.favorites || []).some(x => x.linkedDocId === d.id || x.title === d.title)) ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-amber-300 hover:bg-surface-800'} transition-colors cursor-pointer" title="${((db.favorites || []).some(x => x.linkedDocId === d.id || x.title === d.title)) ? 'Favorited' : 'Add to Favorites'}">
                                <i class="${((db.favorites || []).some(x => x.linkedDocId === d.id || x.title === d.title)) ? 'fa-solid' : 'fa-regular'} fa-star text-xs"></i>
                            </button>
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

    setDocumentViewMode(docViewMode);
}
window.renderDocumentsPage = renderDocumentsPage;

function toggleDocumentFavorite(docId, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    if (!db.documents) return;
    const doc = db.documents.find(x => x.id === docId);
    if (!doc) return;
    if (!db.favorites) db.favorites = [];

    const existingIndex = db.favorites.findIndex(x => x.linkedDocId === docId || (x.title === doc.title && (x.type === 'word' || x.type === 'excel' || x.type === 'pdf' || x.type === 'photo')));
    if (existingIndex >= 0) {
        db.favorites.splice(existingIndex, 1);
        if (typeof saveDatabase === 'function') saveDatabase();
        if (typeof renderDocumentsPage === 'function') renderDocumentsPage();
        if (typeof renderFavoritesPage === 'function') renderFavoritesPage();
        showToast(`Removed "${doc.title}" from Favorites`);
        return;
    }

    const isXls = doc.fileType === 'excel' || (doc.mimeType && (doc.mimeType.includes('spreadsheet') || doc.mimeType.includes('excel') || doc.mimeType.includes('csv')));
    const isImg = doc.fileType === 'photo' || (doc.mimeType && doc.mimeType.startsWith('image/'));
    const isWord = doc.fileType === 'word' || (doc.mimeType && (doc.mimeType.includes('word') || doc.mimeType.includes('officedocument.wordprocessingml')));
    const isPdf = doc.fileType === 'pdf' || (doc.mimeType && doc.mimeType.includes('pdf'));

    let favType = 'pdf';
    if (isXls) favType = 'excel';
    else if (isImg) favType = 'photo';
    else if (isWord) favType = 'word';
    else if (isPdf) favType = 'pdf';

    const newFav = {
        id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        linkedDocId: doc.id,
        type: favType,
        title: doc.title || 'Favorite Document',
        notes: doc.notes || '',
        fileData: doc.fileData || '',
        fileName: doc.fileName || `${doc.title}.${favType === 'word' ? 'docx' : favType === 'excel' ? 'xlsx' : favType === 'photo' ? 'jpg' : 'pdf'}`,
        fileSize: doc.fileSize || '',
        mimeType: doc.mimeType || (favType === 'word' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : favType === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'),
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    if (favType === 'photo') {
        newFav.photoUrl = doc.fileData || '';
    }

    db.favorites.unshift(newFav);
    if (typeof saveDatabase === 'function') saveDatabase();
    if (typeof renderDocumentsPage === 'function') renderDocumentsPage();
    if (typeof renderFavoritesPage === 'function') renderFavoritesPage();
    showToast(`Added "${doc.title}" to Favorites ⭐`);
}
window.toggleDocumentFavorite = toggleDocumentFavorite;

function getDocCategoryBadge(cat) {
    switch ((cat || '').toLowerCase()) {
        case 'home':
        case 'my_home':
            return '<span class="px-2 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono text-[9px] uppercase tracking-wider font-semibold">My Home</span>';
        case 'properties':
        case 'property':
        case 'legal':
            return '<span class="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Properties</span>';
        case 'identity':
            return '<span class="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Identity</span>';
        case 'financial':
        case 'fin_tax':
        case 'tax':
            return '<span class="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Fin &amp; Tax</span>';
        case 'business':
            return '<span class="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Business</span>';
        case 'bills':
        case 'bills_warranty':
        case 'warranty':
        case 'receipts':
            return '<span class="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[9px] uppercase tracking-wider font-semibold">Bills &amp; Warranty</span>';
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
    const isXls = doc.fileType === 'excel' || (doc.mimeType && (doc.mimeType.includes('spreadsheet') || doc.mimeType.includes('excel') || doc.mimeType.includes('csv')));

    if (titleEl) titleEl.innerText = doc.title;
    if (confBadge) {
        if (doc.isConfidential) confBadge.classList.remove('hidden');
        else confBadge.classList.add('hidden');
    }
    if (catEl) catEl.innerText = (doc.category || 'General').toUpperCase();
    if (dateEl) dateEl.innerText = doc.date || 'Active';
    if (sizeEl) sizeEl.innerText = doc.fileSize ? (doc.fileSize > 1024 * 1024 ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(doc.fileSize / 1024)} KB`) : 'Standard';

    if (iconEl) {
        iconEl.innerHTML = `<i class="fa-solid ${isXls ? 'fa-file-excel text-emerald-400' : (isPdf ? 'fa-file-pdf text-rose-400' : (isImg ? 'fa-image text-cyan-400' : 'fa-file-shield text-emerald-400'))} text-base"></i>`;
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
    if (!doc.fileData && (doc.hasBinary || isPdf || isImg || isXls)) {
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
        } else if (isXls && doc.fileData) {
            stageEl.innerHTML = renderExcelViewerHtml(doc);
            setTimeout(() => {
                initExcelViewer(doc);
            }, 50);
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
                        <i class="fa-solid ${isXls ? 'fa-file-excel text-emerald-400' : (isPdf ? 'fa-file-pdf text-rose-400' : 'fa-file-shield')} text-3xl"></i>
                    </div>
                    <div>
                        <h4 class="text-white font-semibold text-base">${doc.title}</h4>
                        <p class="text-xs font-mono text-slate-400 mt-1">Encrypted ${isXls ? 'Excel Spreadsheet' : (isPdf ? 'PDF Document' : 'Media Asset')} secured in your Private Vault.</p>
                    </div>
                    <button onclick="downloadDocumentItem('${doc.id}')" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-surface-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-md">
                        <i class="fa-solid fa-download mr-1.5"></i> Download ${isXls ? 'Excel File' : 'File'}
                    </button>
                </div>
            `;
        }
    }
}
window.previewDocumentItem = previewDocumentItem;

function renderExcelViewerHtml(doc) {
    return `
        <div class="w-full h-full flex flex-col items-center justify-between relative">
            <!-- Excel Controls Toolbar -->
            <div class="w-full flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2 bg-surface-900/90 border-b border-surface-800/80 rounded-t-xl gap-2 shrink-0">
                <div class="flex items-center gap-2 overflow-x-auto custom-scrollbar" id="excelSheetTabsContainer">
                    <span class="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5 shrink-0">
                        <i class="fa-solid fa-file-excel text-emerald-400"></i> Sheets:
                    </span>
                    <div id="excelSheetTabs" class="flex items-center gap-1"></div>
                </div>
                <div class="flex items-center gap-2 shrink-0 justify-end">
                    <span id="excelSheetStats" class="text-[10px] font-mono text-slate-400">Loading...</span>
                    <button onclick="downloadDocumentItem('${doc.id}')" class="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono rounded-lg transition-colors cursor-pointer flex items-center gap-1">
                        <i class="fa-solid fa-download text-xs"></i> Download .xlsx
                    </button>
                </div>
            </div>

            <!-- Excel Table Sheet Container -->
            <div id="excelSheetViewContainer" class="flex-1 w-full overflow-auto p-4 custom-scrollbar bg-surface-950/90 flex flex-col">
                <div id="excelLoadingSpinner" class="text-center space-y-2 py-12 m-auto">
                    <i class="fa-solid fa-circle-notch fa-spin text-2xl text-emerald-400"></i>
                    <div class="text-xs font-mono text-slate-400">Reading Excel spreadsheet...</div>
                </div>
                <div id="excelTableWrapper" class="hidden overflow-x-auto w-full border border-surface-800 rounded-xl bg-surface-900/60 shadow-lg"></div>
            </div>
        </div>
    `;
}

window.activeExcelWorkbook = null;
window.activeExcelDocId = null;

function initExcelViewer(doc) {
    if (!doc || !doc.fileData) return;
    window.activeExcelDocId = doc.id;

    const spinner = document.getElementById('excelLoadingSpinner');
    const tableWrapper = document.getElementById('excelTableWrapper');
    const sheetTabs = document.getElementById('excelSheetTabs');
    const sheetStats = document.getElementById('excelSheetStats');

    try {
        if (typeof XLSX === 'undefined') {
            if (spinner) spinner.innerHTML = `<span class="text-rose-400 text-xs font-mono">Excel engine loading. Please retry in a moment.</span>`;
            return;
        }

        let base64 = doc.fileData;
        if (base64.includes(',')) {
            base64 = base64.split(',')[1];
        }

        const wb = XLSX.read(base64, { type: 'base64' });
        window.activeExcelWorkbook = wb;

        if (!wb.SheetNames || wb.SheetNames.length === 0) {
            if (spinner) spinner.innerHTML = `<span class="text-slate-400 text-xs font-mono">Workbook contains no sheets.</span>`;
            return;
        }

        // Render sheet tabs
        if (sheetTabs) {
            sheetTabs.innerHTML = '';
            wb.SheetNames.forEach((sheetName, index) => {
                const tabBtn = document.createElement('button');
                tabBtn.className = `px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer whitespace-nowrap ${index === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' : 'bg-surface-800 text-slate-400 hover:text-white border border-surface-700/50'}`;
                tabBtn.innerText = sheetName;
                tabBtn.onclick = () => switchExcelActiveSheet(sheetName);
                sheetTabs.appendChild(tabBtn);
            });
        }

        switchExcelActiveSheet(wb.SheetNames[0]);
    } catch (err) {
        console.error('Failed to parse Excel file:', err);
        if (spinner) {
            spinner.innerHTML = `
                <div class="text-center space-y-3 py-8">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-2xl"></i>
                    <div class="text-xs font-mono text-slate-400">Spreadsheet loaded. Click download to open in Excel.</div>
                    <button onclick="downloadDocumentItem('${doc.id}')" class="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono rounded-xl">
                        <i class="fa-solid fa-download mr-1"></i> Download File
                    </button>
                </div>
            `;
        }
    }
}

function switchExcelActiveSheet(sheetName) {
    const wb = window.activeExcelWorkbook;
    if (!wb || !wb.Sheets || !wb.Sheets[sheetName]) return;

    const spinner = document.getElementById('excelLoadingSpinner');
    const tableWrapper = document.getElementById('excelTableWrapper');
    const sheetTabs = document.getElementById('excelSheetTabs');
    const sheetStats = document.getElementById('excelSheetStats');

    if (sheetTabs) {
        Array.from(sheetTabs.children).forEach(btn => {
            if (btn.innerText === sheetName) {
                btn.className = 'px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer whitespace-nowrap bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm';
            } else {
                btn.className = 'px-2.5 py-1 text-xs font-mono rounded-lg transition-all cursor-pointer whitespace-nowrap bg-surface-800 text-slate-400 hover:text-white border border-surface-700/50';
            }
        });
    }

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

    if (spinner) spinner.classList.add('hidden');
    if (tableWrapper) {
        tableWrapper.classList.remove('hidden');
        if (!rows || rows.length === 0) {
            tableWrapper.innerHTML = `<div class="p-8 text-center text-xs font-mono text-slate-500">Sheet "${sheetName}" is empty.</div>`;
            return;
        }

        const rowCount = rows.length;
        const colCount = Math.max(...rows.map(r => (Array.isArray(r) ? r.length : 0)));
        if (sheetStats) sheetStats.innerText = `${rowCount} rows • ${colCount} cols`;

        let tableHtml = `<table class="w-full text-left text-xs font-mono border-collapse select-text">`;
        rows.forEach((row, rIdx) => {
            const isHeader = rIdx === 0;
            const bgClass = isHeader ? 'bg-surface-950/90 text-emerald-400 font-bold border-b border-surface-700/80 sticky top-0' : (rIdx % 2 === 0 ? 'bg-surface-900/40 hover:bg-surface-800/60' : 'bg-surface-950/40 hover:bg-surface-800/60');
            tableHtml += `<tr class="${bgClass} transition-colors border-b border-surface-800/50">`;
            
            tableHtml += `<td class="py-2 px-3 text-slate-600 bg-surface-950/80 border-r border-surface-800/80 text-[10px] select-none text-center w-10">${rIdx + 1}</td>`;

            for (let cIdx = 0; cIdx < colCount; cIdx++) {
                const cellVal = (Array.isArray(row) && row[cIdx] !== undefined) ? String(row[cIdx]) : '';
                if (isHeader) {
                    tableHtml += `<th class="py-2.5 px-3.5 border-r border-surface-800/60 font-semibold tracking-wider whitespace-nowrap max-w-xs truncate" title="${cellVal}">${cellVal || `Col ${cIdx + 1}`}</th>`;
                } else {
                    const isNum = !isNaN(Number(cellVal)) && cellVal.trim() !== '';
                    tableHtml += `<td class="py-2 px-3.5 border-r border-surface-800/40 text-slate-300 whitespace-nowrap max-w-xs truncate ${isNum ? 'text-right text-emerald-300' : ''}" title="${cellVal}">${cellVal}</td>`;
                }
            }
            tableHtml += `</tr>`;
        });
        tableHtml += `</table>`;
        tableWrapper.innerHTML = tableHtml;
    }
}
window.switchExcelActiveSheet = switchExcelActiveSheet;

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
        const isXls = doc.fileType === 'excel' || (doc.mimeType && (doc.mimeType.includes('spreadsheet') || doc.mimeType.includes('excel') || doc.mimeType.includes('csv')));
        const ext = isXls ? 'xlsx' : (doc.fileType === 'photo' ? 'jpg' : 'pdf');
        const a = document.createElement('a');
        a.href = doc.fileData;
        a.download = doc.title ? `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}` : `document.${ext}`;
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

/* ==========================================================================
   SECURE CREDENTIALS VAULT (DOCUMENTS PAGE SUB-SECTION)
   Protected with secondary master passcode, change passcode, & CRUD
   ========================================================================== */

window.activeDocumentSubTab = (function() {
    try {
        return localStorage.getItem('executive_doc_subtab') || 'files';
    } catch (e) {
        return 'files';
    }
})();
window.isCredentialVaultUnlocked = false;
window.activeCredCategory = (function() {
    try {
        return localStorage.getItem('executive_cred_category') || 'all';
    } catch (e) {
        return 'all';
    }
})();
window.revealedCredSecrets = new Set();
window.revealedCredPins = new Set();

function setDocumentSubTab(subTab) {
    window.activeDocumentSubTab = subTab;
    try {
        localStorage.setItem('executive_doc_subtab', subTab);
        if (window.db) {
            if (!window.db.uiState) window.db.uiState = {};
            window.db.uiState.docSubTab = subTab;
            if (typeof saveDatabase === 'function') saveDatabase(false);
        }
    } catch (e) {}
    const btnFiles = document.getElementById('btnDocSubTab-files');
    const btnCreds = document.getElementById('btnDocSubTab-credentials');
    const secFiles = document.getElementById('docFilesSection');
    const secCreds = document.getElementById('docCredentialsSection');
    const topFiles = document.getElementById('docFilesTopActions');
    const topCreds = document.getElementById('docCredentialsTopActions');
    const headerTitle = document.getElementById('docHeaderMainTitle');
    const headerIcon = document.getElementById('docHeaderMainIcon');
    const headerIconContainer = document.getElementById('docHeaderIconContainer');
    const lockBadge = document.getElementById('credVaultLockStatusBadge');

    if (subTab === 'credentials') {
        if (btnFiles) {
            btnFiles.className = 'group px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center text-slate-400 hover:text-white';
        }
        if (btnCreds) {
            btnCreds.className = 'group px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center bg-surface-800 text-amber-300 shadow-sm border border-amber-500/30';
        }
        if (secFiles) secFiles.classList.add('hidden');
        if (secCreds) secCreds.classList.remove('hidden');
        if (topFiles) topFiles.classList.add('hidden');
        if (headerTitle) headerTitle.textContent = 'Credentials Vault';
        if (headerIcon) headerIcon.className = 'fa-solid fa-key text-base';
        if (headerIconContainer) headerIconContainer.className = 'w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-inner transition-colors';
        if (lockBadge) lockBadge.classList.remove('hidden');

        updateCredLockBadge();
        renderCredentialsVault();
    } else {
        if (btnFiles) {
            btnFiles.className = 'group px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center bg-surface-800 text-emerald-300 shadow-sm border border-emerald-500/30';
        }
        if (btnCreds) {
            btnCreds.className = 'group px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer flex items-center text-slate-400 hover:text-white';
        }
        if (secFiles) secFiles.classList.remove('hidden');
        if (secCreds) secCreds.classList.add('hidden');
        if (topFiles) topFiles.classList.remove('hidden');
        if (topCreds) topCreds.classList.add('hidden');
        if (headerTitle) headerTitle.textContent = 'Documents';
        if (headerIcon) headerIcon.className = 'fa-solid fa-folder-open text-base';
        if (headerIconContainer) headerIconContainer.className = 'w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner transition-colors';
        if (lockBadge) lockBadge.classList.add('hidden');

        renderDocumentsPage();
    }
}
window.setDocumentSubTab = setDocumentSubTab;

function updateCredLockBadge() {
    const lockBadge = document.getElementById('credVaultLockStatusBadge');
    const badgeText = document.getElementById('credVaultLockBadgeText');
    const statusDot = document.getElementById('credPillStatusDot');
    const topCreds = document.getElementById('docCredentialsTopActions');

    if (window.isCredentialVaultUnlocked) {
        if (lockBadge) {
            lockBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5';
            lockBadge.innerHTML = '<i class="fa-solid fa-unlock-keyhole text-[9px]"></i> <span>Unlocked</span>';
        }
        if (statusDot) {
            statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]';
        }
        if (topCreds && window.activeDocumentSubTab === 'credentials') {
            topCreds.classList.remove('hidden');
        }
    } else {
        if (lockBadge) {
            lockBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5';
            lockBadge.innerHTML = '<i class="fa-solid fa-lock text-[9px]"></i> <span>Locked</span>';
        }
        if (statusDot) {
            statusDot.className = 'w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]';
        }
        if (topCreds) {
            topCreds.classList.add('hidden');
        }
    }
}
window.updateCredLockBadge = updateCredLockBadge;

function unlockCredentialVault() {
    const input = document.getElementById('credVaultPasscodeInput');
    const entered = input ? input.value : '';
    const master = (db.credentialVault && db.credentialVault.passcode) ? String(db.credentialVault.passcode) : '1234';

    if (!entered) {
        showToast('Please enter your vault passcode');
        if (input) input.focus();
        return;
    }

    if (entered === master) {
        window.isCredentialVaultUnlocked = true;
        if (input) input.value = '';
        const hintBox = document.getElementById('credVaultHintBox');
        if (hintBox) hintBox.classList.add('hidden');

        updateCredLockBadge();
        renderCredentialsVault();
        showToast('Credentials Vault unlocked successfully');
    } else {
        showToast('Incorrect passcode. Try again or check hint.');
        if (input) {
            input.classList.add('border-rose-500', 'animate-shake');
            setTimeout(() => input.classList.remove('border-rose-500', 'animate-shake'), 1200);
            input.focus();
        }
    }
}
window.unlockCredentialVault = unlockCredentialVault;

function lockCredentialVault() {
    window.isCredentialVaultUnlocked = false;
    window.revealedCredSecrets.clear();
    const input = document.getElementById('credVaultPasscodeInput');
    if (input) input.value = '';
    
    updateCredLockBadge();
    renderCredentialsVault();
    showToast('Credentials Vault locked');
}
window.lockCredentialVault = lockCredentialVault;

function toggleCredVaultHint() {
    const hintBox = document.getElementById('credVaultHintBox');
    const hintText = document.getElementById('credVaultHintText');
    if (!hintBox) return;

    if (hintBox.classList.contains('hidden')) {
        const hint = (db.credentialVault && db.credentialVault.hint) ? db.credentialVault.hint : 'Default PIN is 1234';
        if (hintText) hintText.textContent = hint;
        hintBox.classList.remove('hidden');
    } else {
        hintBox.classList.add('hidden');
    }
}
window.toggleCredVaultHint = toggleCredVaultHint;

function toggleCredPasscodeVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;

    if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}
window.toggleCredPasscodeVisibility = toggleCredPasscodeVisibility;

function openChangeCredentialPasscodeModal() {
    const curr = document.getElementById('credChangeCurrentPasscode');
    const next = document.getElementById('credChangeNewPasscode');
    const conf = document.getElementById('credChangeConfirmPasscode');
    const hint = document.getElementById('credChangeHint');

    if (curr) curr.value = '';
    if (next) next.value = '';
    if (conf) conf.value = '';
    if (hint) hint.value = (db.credentialVault && db.credentialVault.hint) ? db.credentialVault.hint : '';

    openModal('changeCredentialPasscodeModal');
}
window.openChangeCredentialPasscodeModal = openChangeCredentialPasscodeModal;

function saveNewCredentialPasscode() {
    const curr = document.getElementById('credChangeCurrentPasscode');
    const next = document.getElementById('credChangeNewPasscode');
    const conf = document.getElementById('credChangeConfirmPasscode');
    const hint = document.getElementById('credChangeHint');

    const currVal = curr ? curr.value : '';
    const nextVal = next ? next.value : '';
    const confVal = conf ? conf.value : '';
    const hintVal = hint ? hint.value.trim() : '';

    const master = (db.credentialVault && db.credentialVault.passcode) ? String(db.credentialVault.passcode) : '1234';

    if (currVal !== master) {
        showToast('Current passcode is incorrect');
        if (curr) curr.focus();
        return;
    }

    if (!nextVal || nextVal.length < 3) {
        showToast('New passcode must be at least 3 characters');
        if (next) next.focus();
        return;
    }

    if (nextVal !== confVal) {
        showToast('New passcode confirmation does not match');
        if (conf) conf.focus();
        return;
    }

    if (!db.credentialVault) db.credentialVault = {};
    db.credentialVault.passcode = nextVal;
    db.credentialVault.hint = hintVal || 'Custom secure passcode';
    db.credentialVault.lastChanged = Date.now();

    saveDatabase(true);
    closeModal('changeCredentialPasscodeModal');
    showToast('Vault passcode updated successfully');
    renderCredentialsVault();
}
window.saveNewCredentialPasscode = saveNewCredentialPasscode;

function generateStrongPasswordForInput(inputId) {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
    let result = '';
    const randomArray = new Uint32Array(16);
    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(randomArray);
        for (let i = 0; i < 16; i++) {
            result += chars[randomArray[i] % chars.length];
        }
    } else {
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }

    const input = document.getElementById(inputId);
    if (input) {
        input.value = result;
        input.type = 'text';
        const icon = document.getElementById('credModalEyeIcon');
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    }
    showToast('Strong 16-char password generated');
}
window.generateStrongPasswordForInput = generateStrongPasswordForInput;

function openAddCredentialModal(preselectedCat) {
    const idEl = document.getElementById('credModalEditId');
    const catEl = document.getElementById('credModalCategorySelect');
    const descEl = document.getElementById('credModalDescriptionInput');
    const userEl = document.getElementById('credModalUsernameInput');
    const secEl = document.getElementById('credModalSecretInput');
    const pinEl = document.getElementById('credModalSecondaryCodeInput');
    const notesEl = document.getElementById('credModalNotesInput');
    const titleHeader = document.getElementById('credentialModalTitle');

    if (idEl) idEl.value = '';
    if (titleHeader) titleHeader.textContent = 'Add Credential';
    if (catEl) catEl.value = (preselectedCat && preselectedCat !== 'all') ? preselectedCat : 'email';
    if (descEl) descEl.value = '';
    if (userEl) userEl.value = '';
    if (secEl) {
        secEl.value = '';
        secEl.type = 'password';
    }
    const icon = document.getElementById('credModalEyeIcon');
    if (icon) {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
    if (pinEl) {
        pinEl.value = '';
        pinEl.type = 'password';
    }
    const pinIcon = document.getElementById('credModalSecondaryEyeIcon');
    if (pinIcon) {
        pinIcon.classList.remove('fa-eye-slash');
        pinIcon.classList.add('fa-eye');
    }
    if (notesEl) notesEl.value = '';

    const delBtn = document.getElementById('credModalDeleteBtn');
    if (delBtn) delBtn.classList.add('hidden');

    openModal('credentialModal');
}
window.openAddCredentialModal = openAddCredentialModal;

function openEditCredentialModal(id) {
    if (!Array.isArray(db.credentials)) db.credentials = [];
    const item = db.credentials.find(c => c.id === id);
    if (!item) {
        showToast('Credential record not found');
        return;
    }

    const idEl = document.getElementById('credModalEditId');
    const catEl = document.getElementById('credModalCategorySelect');
    const descEl = document.getElementById('credModalDescriptionInput');
    const userEl = document.getElementById('credModalUsernameInput');
    const secEl = document.getElementById('credModalSecretInput');
    const pinEl = document.getElementById('credModalSecondaryCodeInput');
    const notesEl = document.getElementById('credModalNotesInput');
    const titleHeader = document.getElementById('credentialModalTitle');

    if (idEl) idEl.value = item.id;
    if (titleHeader) titleHeader.textContent = 'Edit Credential';
    if (catEl) catEl.value = item.category || 'email';
    if (descEl) descEl.value = item.description || '';
    if (userEl) userEl.value = item.username || '';
    if (secEl) {
        secEl.value = item.secret || '';
        secEl.type = 'password';
    }
    const icon = document.getElementById('credModalEyeIcon');
    if (icon) {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
    if (pinEl) {
        pinEl.value = item.secondaryCode || '';
        pinEl.type = 'password';
    }
    const pinIcon = document.getElementById('credModalSecondaryEyeIcon');
    if (pinIcon) {
        pinIcon.classList.remove('fa-eye-slash');
        pinIcon.classList.add('fa-eye');
    }
    if (notesEl) notesEl.value = item.notes || '';

    const delBtn = document.getElementById('credModalDeleteBtn');
    if (delBtn) {
        delBtn.classList.remove('hidden');
        delBtn.onclick = () => {
            closeModal('credentialModal');
            deleteCredentialItem(id);
        };
    }

    openModal('credentialModal');
}
window.openEditCredentialModal = openEditCredentialModal;

function saveCredentialItem() {
    const idEl = document.getElementById('credModalEditId');
    const catEl = document.getElementById('credModalCategorySelect');
    const descEl = document.getElementById('credModalDescriptionInput');
    const userEl = document.getElementById('credModalUsernameInput');
    const secEl = document.getElementById('credModalSecretInput');
    const pinEl = document.getElementById('credModalSecondaryCodeInput');
    const notesEl = document.getElementById('credModalNotesInput');

    const id = idEl ? idEl.value : '';
    const category = catEl ? catEl.value : 'email';
    const description = descEl ? descEl.value.trim() : '';
    const username = userEl ? userEl.value.trim() : '';
    const secret = secEl ? secEl.value : '';
    const secondaryCode = pinEl ? pinEl.value.trim() : '';
    const notes = notesEl ? notesEl.value.trim() : '';

    if (!secret && !secondaryCode) {
        showToast('Please enter a password, PIN, or secret key');
        if (secEl) secEl.focus();
        return;
    }

    const meta = getCredentialCategoryMeta(category);
    const title = description || username || meta.name;

    if (!Array.isArray(db.credentials)) db.credentials = [];

    if (id) {
        const item = db.credentials.find(c => c.id === id);
        if (item) {
            item.category = category;
            item.description = description;
            item.title = title;
            item.username = username;
            item.secret = secret;
            item.secondaryCode = secondaryCode;
            item.notes = notes;
            item.updatedAt = Date.now();
        }
    } else {
        const newItem = {
            id: 'cred_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            category,
            description,
            title,
            username,
            secret,
            secondaryCode,
            notes,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        db.credentials.unshift(newItem);
    }

    saveDatabase(true);
    closeModal('credentialModal');
    renderCredentialsVault();
    showToast(id ? 'Credential updated successfully' : 'New credential stored securely');
}
window.saveCredentialItem = saveCredentialItem;

function deleteCredentialItem(id) {
    if (!Array.isArray(db.credentials)) db.credentials = [];
    const index = db.credentials.findIndex(c => c.id === id);
    if (index === -1) return;

    const item = db.credentials[index];
    const displayLabel = item.description || item.username || item.title || 'this credential';
    const confirmMsg = `Are you sure you want to delete "${displayLabel}"? This credential will be permanently removed from your vault.`;

    const doDelete = () => {
        const curIdx = db.credentials.findIndex(c => c.id === id);
        if (curIdx === -1) return;
        const deletedItem = db.credentials[curIdx];

        if (typeof recordDeletion === 'function') {
            recordDeletion({
                type: 'credential',
                label: `Credential: ${displayLabel}`,
                data: JSON.parse(JSON.stringify(deletedItem)),
                originalIndex: curIdx
            });
        }

        db.credentials.splice(curIdx, 1);
        if (window.revealedCredSecrets) window.revealedCredSecrets.delete(id);
        if (window.revealedCredPins) window.revealedCredPins.delete(id);
        saveDatabase(true);
        renderCredentialsVault();
        if (typeof showToast === 'function') {
            showToast(`Deleted: "${displayLabel}"`);
        }
    };

    if (typeof requireConfirmation === 'function') {
        requireConfirmation(confirmMsg, doDelete);
    } else {
        doDelete();
    }
}
window.deleteCredentialItem = deleteCredentialItem;

function toggleSecretCardVisibility(id) {
    if (window.revealedCredSecrets.has(id)) {
        window.revealedCredSecrets.delete(id);
    } else {
        window.revealedCredSecrets.add(id);
    }
    renderCredentialsVault();
}
window.toggleSecretCardVisibility = toggleSecretCardVisibility;

function toggleSecretPinVisibility(id) {
    if (window.revealedCredPins.has(id)) {
        window.revealedCredPins.delete(id);
    } else {
        window.revealedCredPins.add(id);
    }
    renderCredentialsVault();
}
window.toggleSecretPinVisibility = toggleSecretPinVisibility;

function copyCredentialField(text, label) {
    if (!text) {
        showToast(`No ${label} to copy`);
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`${label} copied to clipboard!`);
        }).catch(() => {
            fallbackCopyText(text, label);
        });
    } else {
        fallbackCopyText(text, label);
    }
}
window.copyCredentialField = copyCredentialField;

function fallbackCopyText(text, label) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        document.execCommand('copy');
        showToast(`${label} copied to clipboard!`);
    } catch (e) {
        showToast(`Failed to copy ${label}`);
    }
    document.body.removeChild(ta);
}

function setCredCategoryFilter(cat) {
    window.activeCredCategory = cat;
    try {
        localStorage.setItem('executive_cred_category', cat);
    } catch (e) {}
    renderCredentialsVault();
}
window.setCredCategoryFilter = setCredCategoryFilter;

window.activeCredViewMode = (function() {
    try {
        return localStorage.getItem('executive_cred_view_mode') || 'grid';
    } catch (e) {
        return 'grid';
    }
})();

function setCredViewMode(mode) {
    window.activeCredViewMode = mode;
    try {
        localStorage.setItem('executive_cred_view_mode', mode);
        if (window.db) {
            if (!window.db.uiState) window.db.uiState = {};
            if (!window.db.uiState.credentials) window.db.uiState.credentials = {};
            window.db.uiState.credentials.viewMode = mode;
            if (typeof saveDatabase === 'function') saveDatabase(false);
        }
    } catch (e) {}

    const btnGrid = document.getElementById('btnCredViewGrid');
    const btnList = document.getElementById('btnCredViewList');
    const gridContainer = document.getElementById('credentialsCardsContainer');
    const listContainer = document.getElementById('credentialsListContainer');

    if (mode === 'list') {
        if (btnGrid) {
            btnGrid.className = 'p-1.5 px-2.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all cursor-pointer';
        }
        if (btnList) {
            btnList.className = 'p-1.5 px-2.5 rounded-lg text-xs text-amber-400 bg-surface-800 transition-all cursor-pointer shadow-sm';
        }
        if (gridContainer) gridContainer.classList.add('hidden');
        if (listContainer) listContainer.classList.remove('hidden');
    } else {
        if (btnGrid) {
            btnGrid.className = 'p-1.5 px-2.5 rounded-lg text-xs text-amber-400 bg-surface-800 transition-all cursor-pointer shadow-sm';
        }
        if (btnList) {
            btnList.className = 'p-1.5 px-2.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all cursor-pointer';
        }
        if (gridContainer) gridContainer.classList.remove('hidden');
        if (listContainer) listContainer.classList.add('hidden');
    }
    renderCredentialsVault();
}
window.setCredViewMode = setCredViewMode;

function escapeCredHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getCredentialCategoryMeta(cat) {
    switch ((cat || '').toLowerCase()) {
        case 'email':
            return {
                name: 'E-Mail',
                icon: 'fa-envelope',
                badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                accentColor: 'text-cyan-400',
                accentBg: 'bg-cyan-500/10'
            };
        case 'banking':
            return {
                name: 'Banking',
                icon: 'fa-building-columns',
                badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                accentColor: 'text-emerald-400',
                accentBg: 'bg-emerald-500/10'
            };
        case 'demats':
        case 'demat':
            return {
                name: 'Demats',
                icon: 'fa-chart-line',
                badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
                accentColor: 'text-indigo-400',
                accentBg: 'bg-indigo-500/10'
            };
        case 'social':
            return {
                name: 'Social Media',
                icon: 'fa-globe',
                badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                accentColor: 'text-blue-400',
                accentBg: 'bg-blue-500/10'
            };
        case 'clouds':
        case 'server':
            return {
                name: 'Clouds',
                icon: 'fa-cloud',
                badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
                accentColor: 'text-purple-400',
                accentBg: 'bg-purple-500/10'
            };
        case 'personal':
        case 'apple':
        case 'pin':
            return {
                name: 'Personal',
                icon: 'fa-user-shield',
                badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                accentColor: 'text-amber-400',
                accentBg: 'bg-amber-500/10'
            };
        case 'others':
        case 'other':
        default:
            return {
                name: 'Others',
                icon: 'fa-key',
                badgeClass: 'bg-slate-500/15 text-slate-200 border-slate-500/30',
                accentColor: 'text-slate-300',
                accentBg: 'bg-slate-500/10'
            };
    }
}

function renderCredentialsVault() {
    const lockedView = document.getElementById('credVaultLockedView');
    const unlockedView = document.getElementById('credVaultUnlockedView');
    const topCreds = document.getElementById('docCredentialsTopActions');
    updateCredLockBadge();

    if (!window.isCredentialVaultUnlocked) {
        if (lockedView) lockedView.classList.remove('hidden');
        if (unlockedView) unlockedView.classList.add('hidden');
        if (topCreds) topCreds.classList.add('hidden');
        return;
    }

    if (lockedView) lockedView.classList.add('hidden');
    if (unlockedView) unlockedView.classList.remove('hidden');
    if (topCreds && window.activeDocumentSubTab === 'credentials') {
        topCreds.classList.remove('hidden');
    }

    if (!Array.isArray(db.credentials)) db.credentials = [];

    // Update category pills
    const cats = ['email', 'banking', 'demats', 'social', 'clouds', 'personal', 'others', 'all', 'apple', 'pin', 'server', 'other'];
    cats.forEach(c => {
        const btn = document.getElementById(`btnCredCat-${c}`);
        if (btn) {
            if (c === window.activeCredCategory) {
                btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 transition-all cursor-pointer whitespace-nowrap shadow-sm';
            } else {
                btn.className = 'px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-slate-200 transition-all cursor-pointer whitespace-nowrap';
            }
        }
    });

    // Filter by category & search
    const searchInput = document.getElementById('credSearchInput');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = db.credentials.filter(item => {
        if (window.activeCredCategory !== 'all') {
            const cat = (item.category || '').toLowerCase();
            if (window.activeCredCategory === 'email') {
                if (cat !== 'email') return false;
            } else if (window.activeCredCategory === 'banking') {
                if (cat !== 'banking') return false;
            } else if (window.activeCredCategory === 'demats') {
                if (cat !== 'demats' && cat !== 'demat' && cat !== 'trading') return false;
            } else if (window.activeCredCategory === 'social') {
                if (cat !== 'social' && cat !== 'social media') return false;
            } else if (window.activeCredCategory === 'clouds') {
                if (cat !== 'clouds' && cat !== 'cloud' && cat !== 'server' && cat !== 'servers') return false;
            } else if (window.activeCredCategory === 'personal') {
                if (cat !== 'personal' && cat !== 'apple' && cat !== 'pin') return false;
            } else if (window.activeCredCategory === 'others') {
                if (cat !== 'others' && cat !== 'other') return false;
            } else if (cat !== window.activeCredCategory) {
                return false;
            }
        }
        if (!query) return true;
        const inDesc = (item.description || '').toLowerCase().includes(query);
        const inTitle = (item.title || '').toLowerCase().includes(query);
        const inUser = (item.username || '').toLowerCase().includes(query);
        const inNotes = (item.notes || '').toLowerCase().includes(query);
        const inPin = (item.secondaryCode || '').toLowerCase().includes(query);
        const inCat = (item.category || '').toLowerCase().includes(query);
        return inDesc || inTitle || inUser || inNotes || inPin || inCat;
    });

    const isListView = window.activeCredViewMode === 'list';
    const gridContainer = document.getElementById('credentialsCardsContainer');
    const listContainer = document.getElementById('credentialsListContainer');
    const listTbody = document.getElementById('credentialsListTableBody');

    // Sync button styling and container visibility
    const btnGrid = document.getElementById('btnCredViewGrid');
    const btnList = document.getElementById('btnCredViewList');
    if (isListView) {
        if (btnGrid) btnGrid.className = 'p-1.5 px-2.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all cursor-pointer';
        if (btnList) btnList.className = 'p-1.5 px-2.5 rounded-lg text-xs text-amber-400 bg-surface-800 transition-all cursor-pointer shadow-sm';
        if (gridContainer) gridContainer.classList.add('hidden');
        if (listContainer) listContainer.classList.remove('hidden');
    } else {
        if (btnGrid) btnGrid.className = 'p-1.5 px-2.5 rounded-lg text-xs text-amber-400 bg-surface-800 transition-all cursor-pointer shadow-sm';
        if (btnList) btnList.className = 'p-1.5 px-2.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all cursor-pointer';
        if (gridContainer) gridContainer.classList.remove('hidden');
        if (listContainer) listContainer.classList.add('hidden');
    }

    // Render Empty State
    if (filtered.length === 0) {
        const emptyHtml = `
            <div class="col-span-full py-12 px-4 text-center premium-card border border-surface-800 space-y-4">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                    <i class="fa-solid fa-key"></i>
                </div>
                <div class="space-y-1">
                    <h5 class="text-sm font-display font-bold text-white">${query ? 'No matching credentials found' : 'No credentials saved yet'}</h5>
                    <p class="text-xs text-slate-400 max-w-sm mx-auto">
                        ${query ? 'Try a different search keyword or category filter.' : 'Securely save your email accounts, passwords, PIN numbers, or Apple ID credentials.'}
                    </p>
                </div>
                <div>
                    <button onclick="openAddCredentialModal('${window.activeCredCategory !== 'all' ? window.activeCredCategory : 'email'}')" class="px-4 py-2 rounded-xl text-xs font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer font-bold inline-flex items-center gap-2">
                        <i class="fa-solid fa-plus text-xs"></i>
                        <span>Add First Credential</span>
                    </button>
                </div>
            </div>
        `;
        if (gridContainer) gridContainer.innerHTML = emptyHtml;
        if (listTbody) {
            listTbody.innerHTML = `
                <tr>
                    <td colspan="7" class="py-12 text-center text-slate-400">
                        <div class="space-y-3">
                            <i class="fa-solid fa-key text-2xl text-amber-400/60"></i>
                            <div class="text-xs text-slate-400">${query ? 'No matching credentials found' : 'No credentials saved yet'}</div>
                            <button onclick="openAddCredentialModal('${window.activeCredCategory !== 'all' ? window.activeCredCategory : 'email'}')" class="px-3.5 py-1.5 rounded-xl text-xs font-mono bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer font-semibold inline-flex items-center gap-1.5">
                                <i class="fa-solid fa-plus text-[10px]"></i>
                                <span>Add Credential</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
        return;
    }

    // Render Grid View Cards
    if (gridContainer) {
        gridContainer.innerHTML = '';
        filtered.forEach(item => {
            const meta = getCredentialCategoryMeta(item.category);
            const isRevealed = window.revealedCredSecrets.has(item.id);
            const maskedSecret = '••••••••••••';
            const displaySecret = isRevealed ? (item.secret || '') : maskedSecret;
            const primaryTitle = item.description || item.username || item.title || meta.name;

            const isRevealedPin = window.revealedCredPins.has(item.id);
            const maskedPin = '••••••';
            const displayPin = isRevealedPin ? item.secondaryCode : maskedPin;

            const card = document.createElement('div');
            card.className = 'premium-card p-4 space-y-3.5 border border-surface-800 hover:border-surface-700 transition-all duration-200 group relative flex flex-col justify-between';

            // Secondary code rendering
            let secCodeHtml = '';
            if (item.secondaryCode) {
                secCodeHtml = `
                    <div class="p-2.5 rounded-xl bg-surface-950/70 border border-surface-800/80 flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 shrink-0">Code:</span>
                            <span class="font-mono ${isRevealedPin ? 'text-amber-300 font-semibold select-all' : 'text-slate-400 tracking-wider'} truncate">${escapeCredHtml(displayPin)}</span>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button onclick="toggleSecretPinVisibility('${item.id}')" title="${isRevealedPin ? 'Hide Code' : 'Show Code'}" class="p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer">
                                <i class="fa-solid ${isRevealedPin ? 'fa-eye-slash' : 'fa-eye'} text-xs"></i>
                            </button>
                            <button onclick="copyCredentialField('${item.secondaryCode.replace(/'/g, "\\'")}', 'Code')" title="Copy Code" class="p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer">
                                <i class="fa-regular fa-copy text-xs"></i>
                            </button>
                        </div>
                    </div>
                `;
            }

            // Notes rendering
            let notesHtml = '';
            if (item.notes) {
                notesHtml = `
                    <div class="p-2.5 rounded-xl bg-surface-950/40 border border-surface-800/50 text-[11px] font-mono text-slate-400 line-clamp-2 leading-relaxed">
                        <span class="text-slate-500 font-semibold">Note:</span> ${escapeCredHtml(item.notes)}
                    </div>
                `;
            }

            card.innerHTML = `
                <div class="space-y-3">
                    <!-- Top Row: Icon, Title, Badge, Action Dropdown -->
                    <div class="flex items-start justify-between gap-2.5">
                        <div class="flex items-center gap-2.5 overflow-hidden">
                            <div class="w-9 h-9 rounded-xl ${meta.accentBg} border border-surface-700/60 ${meta.accentColor} flex items-center justify-center shrink-0 shadow-sm">
                                <i class="${meta.brandIcon ? 'fa-brands' : 'fa-solid'} ${meta.icon} text-sm"></i>
                            </div>
                            <div class="overflow-hidden">
                                <h4 class="font-display font-bold text-white text-sm truncate leading-snug group-hover:text-amber-300 transition-colors" title="${escapeCredHtml(primaryTitle)}">${escapeCredHtml(primaryTitle)}</h4>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <span class="px-2 py-0.5 rounded-md ${meta.badgeClass} font-mono text-[9px] uppercase tracking-wider font-semibold border">${meta.name}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Edit & Delete Actions -->
                        <div class="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onclick="openEditCredentialModal('${item.id}')" title="Edit Credential" class="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button onclick="deleteCredentialItem('${item.id}')" title="Delete Credential" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Identifier Field (if exists and differs from title) -->
                    ${(item.username && item.username !== primaryTitle) ? `
                    <div class="p-2.5 rounded-xl bg-surface-950/70 border border-surface-800/80 flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 shrink-0">Identifier:</span>
                            <span class="font-mono text-slate-200 truncate font-medium select-all">${escapeCredHtml(item.username)}</span>
                        </div>
                        <button onclick="copyCredentialField('${item.username.replace(/'/g, "\\'")}', 'Identifier')" title="Copy Identifier" class="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0">
                            <i class="fa-regular fa-copy text-xs"></i>
                        </button>
                    </div>
                    ` : ''}

                    <!-- Passcode Field with Reveal & Copy -->
                    ${item.secret ? `
                    <div class="p-2.5 rounded-xl bg-surface-950/90 border border-surface-800 flex items-center justify-between text-xs">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <span class="text-[10px] font-mono uppercase tracking-wider text-slate-500 shrink-0">Passcode:</span>
                            <span class="font-mono ${isRevealed ? 'text-emerald-300 font-semibold select-all' : 'text-slate-400 tracking-wider'} truncate">${escapeCredHtml(displaySecret)}</span>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button onclick="toggleSecretCardVisibility('${item.id}')" title="${isRevealed ? 'Hide Passcode' : 'Show Passcode'}" class="p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer">
                                <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'} text-xs"></i>
                            </button>
                            <button onclick="copyCredentialField('${(item.secret || '').replace(/'/g, "\\'")}', 'Passcode')" title="Copy Passcode" class="p-1 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer">
                                <i class="fa-regular fa-copy text-xs"></i>
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    ${secCodeHtml}
                    ${notesHtml}
                </div>
            `;
            gridContainer.appendChild(card);
        });
    }

    // Render List View Table
    if (listTbody) {
        listTbody.innerHTML = '';
        filtered.forEach(item => {
            const meta = getCredentialCategoryMeta(item.category);
            const isRevealed = window.revealedCredSecrets.has(item.id);
            const maskedSecret = '••••••••••••';
            const displaySecret = isRevealed ? (item.secret || '') : maskedSecret;

            const isRevealedPin = window.revealedCredPins.has(item.id);
            const maskedPin = '••••••';
            const displayPin = isRevealedPin ? item.secondaryCode : maskedPin;

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-surface-900/50 transition-colors border-b border-surface-800/40';

            tr.innerHTML = `
                <!-- Category: Icon only, no text label as requested -->
                <td class="py-3 px-3 text-center">
                    <div class="inline-flex items-center justify-center w-7 h-7 rounded-lg ${meta.accentBg} ${meta.accentColor} border border-surface-700/50 text-xs shadow-sm" title="${meta.name}">
                        <i class="${meta.brandIcon ? 'fa-brands' : 'fa-solid'} ${meta.icon}"></i>
                    </div>
                </td>

                <!-- Description (Double Width) -->
                <td class="py-3 px-4 min-w-[340px] max-w-[420px]">
                    ${item.description ? `
                        <span class="font-mono text-white text-xs font-semibold truncate block" title="${escapeCredHtml(item.description)}">${escapeCredHtml(item.description)}</span>
                    ` : '<span class="text-slate-600 font-mono text-xs italic">-</span>'}
                </td>

                <!-- Identifier -->
                <td class="py-3 px-4">
                    ${item.username ? `
                        <div class="flex items-center gap-2 max-w-[240px]">
                            <span class="font-mono text-slate-200 text-xs font-medium truncate select-all">${escapeCredHtml(item.username)}</span>
                            <button onclick="copyCredentialField('${item.username.replace(/'/g, "\\'")}', 'Identifier')" title="Copy Identifier" class="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0">
                                <i class="fa-regular fa-copy text-[11px]"></i>
                            </button>
                        </div>
                    ` : '<span class="text-slate-600 font-mono text-xs italic">-</span>'}
                </td>

                <!-- Passcode -->
                <td class="py-3 px-4">
                    ${item.secret ? `
                        <div class="flex items-center gap-2">
                            <span class="font-mono ${isRevealed ? 'text-emerald-300 font-semibold select-all' : 'text-slate-400 tracking-wider'} text-xs">${escapeCredHtml(displaySecret)}</span>
                            <div class="flex items-center gap-1 shrink-0">
                                <button onclick="toggleSecretCardVisibility('${item.id}')" title="${isRevealed ? 'Hide' : 'Show'}" class="p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer">
                                    <i class="fa-solid ${isRevealed ? 'fa-eye-slash' : 'fa-eye'} text-[11px]"></i>
                                </button>
                                <button onclick="copyCredentialField('${(item.secret || '').replace(/'/g, "\\'")}', 'Passcode')" title="Copy Passcode" class="p-1 text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer">
                                    <i class="fa-regular fa-copy text-[11px]"></i>
                                </button>
                            </div>
                        </div>
                    ` : '<span class="text-slate-600 font-mono text-xs italic">-</span>'}
                </td>

                <!-- Code with Eye Icon Toggle and Copy -->
                <td class="py-3 px-4">
                    ${item.secondaryCode ? `
                        <div class="flex items-center gap-2">
                            <span class="font-mono ${isRevealedPin ? 'text-amber-300 font-semibold select-all' : 'text-slate-400 tracking-wider'} text-xs">${escapeCredHtml(displayPin)}</span>
                            <div class="flex items-center gap-1 shrink-0">
                                <button onclick="toggleSecretPinVisibility('${item.id}')" title="${isRevealedPin ? 'Hide Code' : 'Show Code'}" class="p-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer">
                                    <i class="fa-solid ${isRevealedPin ? 'fa-eye-slash' : 'fa-eye'} text-[11px]"></i>
                                </button>
                                <button onclick="copyCredentialField('${item.secondaryCode.replace(/'/g, "\\'")}', 'Code')" title="Copy Code" class="p-1 text-slate-500 hover:text-amber-300 transition-colors cursor-pointer">
                                    <i class="fa-regular fa-copy text-[11px]"></i>
                                </button>
                            </div>
                        </div>
                    ` : '<span class="text-slate-600 font-mono text-xs italic">-</span>'}
                </td>

                <!-- Note -->
                <td class="py-3 px-4 max-w-[240px]">
                    ${item.notes ? `
                        <span class="text-slate-400 text-xs font-mono truncate block" title="${escapeCredHtml(item.notes)}">${escapeCredHtml(item.notes)}</span>
                    ` : '<span class="text-slate-600 font-mono text-xs italic">-</span>'}
                </td>

                <!-- Actions -->
                <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="openEditCredentialModal('${item.id}')" title="Edit Credential" class="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-surface-800 rounded-lg transition-colors cursor-pointer">
                            <i class="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button onclick="deleteCredentialItem('${item.id}')" title="Delete Credential" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                </td>
            `;
            listTbody.appendChild(tr);
        });
    }
}
window.renderCredentialsVault = renderCredentialsVault;



