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

            const progressBarHtml = `
                <div class="flex items-center gap-2 w-full justify-center">
                    <div class="w-24 bg-surface-950 rounded-full h-2 overflow-hidden border border-surface-700/60">
                        <div class="h-full bg-brand-500 rounded-full transition-all" style="width: ${progressPct}%"></div>
                    </div>
                    <span class="text-[10px] font-mono text-slate-400 shrink-0 w-8 text-right">${progressPct}%</span>
                </div>
            `;

            const manageHtml = `
                <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="toggleGoalStatus('${g.id}')" class="p-1 text-slate-400 hover:text-emerald-400 transition-colors" title="${isComp ? 'Reactivate' : 'Mark Complete'}">
                        <i class="fa-solid ${isComp ? 'fa-rotate-left text-amber-400' : 'fa-check text-emerald-400'} text-xs"></i>
                    </button>
                    <button onclick="openGoalModal('${g.id}')" class="p-1 text-slate-400 hover:text-brand-500 transition-colors" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteGoal('${g.id}')" class="p-1 text-slate-400 hover:text-rose-500 transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
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
                    <td class="py-3 px-3 text-center">${manageHtml}</td>
                `;
            }
            return tr;
        };

        activeGoals.forEach((g, idx) => activeTableBody.appendChild(renderRow(g, idx, false)));
        if (completedTableBody) {
            completedGoals.forEach((g, idx) => completedTableBody.appendChild(renderRow(g, idx, true)));
        }

        const colSpan = cat === 'financial' ? 9 : 7;
        if (activeGoals.length === 0) {
            activeTableBody.innerHTML = `<tr><td colspan="${colSpan}" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-flag-checkered text-2xl mb-2 block opacity-40"></i> No active milestones in this track. Click Add Goal to create one.</td></tr>`;
        }
        if (completedTableBody && completedGoals.length === 0) {
            completedTableBody.innerHTML = `<tr><td colspan="${colSpan}" class="p-8 text-center text-slate-500 font-light text-xs"><i class="fa-solid fa-box-archive text-2xl mb-2 block opacity-40"></i> No archived milestones.</td></tr>`;
        }
    });
}
window.renderGoalsTable = renderGoalsTable;

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
        saveDatabase();
        renderGoalsTable();
        showToast(g.completed ? 'Milestone marked as complete' : 'Milestone reactivated');
    }
}
window.toggleGoalStatus = toggleGoalStatus;

function deleteGoal(id) {
    requireConfirmation('Delete this milestone?', () => {
        if (db.goals) {
            db.goals = db.goals.filter(x => x.id !== id);
            saveDatabase();
            renderGoalsTable();
            showToast('Milestone removed');
        }
    });
}
window.deleteGoal = deleteGoal;

function renderNotesList() {
    const container = document.getElementById('notesGridContainer') || document.getElementById('notesListContainer');
    if (!container) return;
    container.innerHTML = '';
    if (!db.notes) db.notes = [];

    db.notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'p-6 rounded-2xl bg-surface-900/70 border border-surface-800 hover:border-amber-500/40 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between gap-4 group cursor-pointer';
        card.onclick = (e) => {
            if (e.target.closest('button')) return;
            openNoteReader(note.id);
        };

        const plainText = note.body || note.content || '';

        card.innerHTML = `
            <div class="space-y-3">
                <div class="flex items-start justify-between gap-3">
                    <h4 class="font-display text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">${note.title || 'Untitled Note'}</h4>
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onclick="event.stopPropagation()">
                        <button onclick="openNoteModal('${note.id}')" class="p-1.5 rounded-lg bg-surface-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                        <button onclick="deleteNote('${note.id}')" class="p-1.5 rounded-lg bg-surface-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors" title="Delete"><i class="fa-solid fa-trash text-xs"></i></button>
                    </div>
                </div>
                <p class="text-xs text-slate-400 font-light line-clamp-4 leading-relaxed whitespace-pre-wrap">${plainText}</p>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-surface-800/60 text-[10px] font-mono text-slate-500">
                <span class="px-2 py-0.5 rounded-md border border-surface-700 bg-surface-950 uppercase tracking-wider text-slate-400">${note.category || 'General'}</span>
                <span class="flex items-center gap-1"><i class="fa-regular fa-clock text-[9px] text-amber-400"></i> ${note.date || 'Recent'}</span>
            </div>
        `;
        container.appendChild(card);
    });

    if (db.notes.length === 0) {
        container.innerHTML = `<div class="col-span-full p-12 text-center text-slate-500 font-light"><i class="fa-regular fa-file-lines text-3xl mb-3 block opacity-40"></i> No journal records or executive notes yet. Click "New Note" to create one.</div>`;
    }
}
window.renderNotesList = renderNotesList;

function openNoteModal(id = null) {
    const idEl = document.getElementById('noteId');
    if (idEl) idEl.value = id || '';
    
    const titleEl = document.getElementById('noteModalTitle');
    const nameInput = document.getElementById('noteTitleInput');
    const catInput = document.getElementById('noteCategoryInput');
    const contentInput = document.getElementById('noteContentInput') || document.getElementById('noteEditor');

    if (id) {
        const n = (db.notes || []).find(x => x.id === id);
        if (n) {
            if (titleEl) titleEl.innerText = 'Edit Note';
            if (nameInput) nameInput.value = n.title || '';
            if (catInput) catInput.value = n.category || 'general';
            if (contentInput) {
                if ('value' in contentInput) contentInput.value = n.body || n.content || '';
                else contentInput.innerHTML = n.body || n.content || '';
            }
        }
    } else {
        if (titleEl) titleEl.innerText = 'Compose Note';
        if (nameInput) nameInput.value = '';
        if (catInput) catInput.value = 'general';
        if (contentInput) {
            if ('value' in contentInput) contentInput.value = '';
            else contentInput.innerHTML = '';
        }
    }
    openModal('noteModal');
}
window.openNoteModal = openNoteModal;

function runNoteCommand(cmd, val = null) {
    document.execCommand(cmd, false, val);
}
window.runNoteCommand = runNoteCommand;

function saveNote() {
    const idEl = document.getElementById('noteId');
    const id = idEl ? idEl.value : '';
    const nameInput = document.getElementById('noteTitleInput');
    const title = nameInput ? (nameInput.value.trim() || 'Untitled Note') : 'Untitled Note';
    const catInput = document.getElementById('noteCategoryInput');
    const category = catInput ? catInput.value : 'general';
    const contentInput = document.getElementById('noteContentInput') || document.getElementById('noteEditor');
    const body = contentInput ? ('value' in contentInput ? contentInput.value : contentInput.innerHTML) : '';
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (!db.notes) db.notes = [];
    if (id) {
        const n = db.notes.find(x => x.id === id);
        if (n) { n.title = title; n.body = body; n.content = body; n.category = category; n.date = date; }
    } else {
        db.notes.push({ id: Date.now().toString(), title, body, content: body, category, date });
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

    const catColors = {
        'work': 'border-blue-500/40 text-blue-400 bg-blue-500/10',
        'finance': 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
        'personal': 'border-purple-500/40 text-purple-400 bg-purple-500/10',
        'ideas': 'border-amber-500/40 text-amber-400 bg-amber-500/10',
        'general': 'border-slate-500/40 text-slate-300 bg-surface-800'
    };

    if (catEl) {
        catEl.innerText = (n.category || 'General').toUpperCase();
        catEl.className = `px-4 py-1.5 rounded-lg text-[10px] uppercase font-mono tracking-widest border font-bold shadow-lg ${catColors[n.category] || catColors['general']}`;
    }
    if (dateEl) dateEl.innerHTML = `<i class="fa-regular fa-clock text-amber-400"></i> ${n.date || 'Recent'}`;
    if (titleEl) titleEl.innerText = n.title || 'Untitled Note';
    if (contentEl) contentEl.innerText = n.body || n.content || '';
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
    requireConfirmation('Delete this note?', () => {
        db.notes = db.notes.filter(x => x.id !== id);
        saveDatabase();
        renderNotesList();
    });
}
window.deleteNote = deleteNote;

let currentReminderFilter = 'all';

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

function setReminderFilter(filter) {
    currentReminderFilter = filter;
    ['all', 'active', 'high', 'completed'].forEach(f => {
        const btn = document.getElementById(`btnReminderFilter-${f}`);
        if (!btn) return;
        if (f === filter) {
            btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-800 text-white shadow-sm transition-all';
        } else {
            btn.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all';
        }
    });
    renderRemindersTable();
}
window.setReminderFilter = setReminderFilter;

function renderRemindersTable() {
    const body = document.getElementById('remindersTableBody');
    if (!body) return;
    body.innerHTML = '';
    if (!db.reminders) db.reminders = [];

    // Update stats
    const activeStat = document.getElementById('remindersActiveStat');
    const highStat = document.getElementById('remindersHighStat');
    const overdueStat = document.getElementById('remindersOverdueStat');
    const completedStat = document.getElementById('remindersCompletedStat');

    const totalActive = db.reminders.filter(r => !r.completed && r.status !== 'completed').length;
    const totalHigh = db.reminders.filter(r => (!r.completed && r.status !== 'completed') && (r.priority || '').toLowerCase() === 'high').length;
    const totalOverdue = db.reminders.filter(r => isReminderOverdue(r)).length;
    const totalCompleted = db.reminders.filter(r => r.completed || r.status === 'completed').length;

    if (activeStat) activeStat.innerText = totalActive.toString();
    if (highStat) highStat.innerText = totalHigh.toString();
    if (overdueStat) overdueStat.innerText = totalOverdue.toString();
    if (completedStat) completedStat.innerText = totalCompleted.toString();

    // Search query
    const searchInput = document.getElementById('reminderSearchInput');
    const q = (searchInput ? searchInput.value : '').toLowerCase().trim();

    // Sort by date/time
    let list = [...db.reminders].sort((a, b) => {
        const dateA = a.date ? (a.date.includes('/') ? a.date.split('/').reverse().join('-') : a.date) : '';
        const dateB = b.date ? (b.date.includes('/') ? b.date.split('/').reverse().join('-') : b.date) : '';
        return (dateA + (a.time || '')) > (dateB + (b.time || '')) ? 1 : -1;
    });

    // Apply Filter
    if (currentReminderFilter === 'active') {
        list = list.filter(r => !r.completed && r.status !== 'completed');
    } else if (currentReminderFilter === 'high') {
        list = list.filter(r => (r.priority || '').toLowerCase() === 'high');
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

    list.forEach((r, idx) => {
        const isComp = r.completed || r.status === 'completed';
        const isOverdue = isReminderOverdue(r);

        let prioBadgeClass = 'border-slate-700 bg-surface-900 text-slate-400';
        const prio = r.priority || r.category || 'Medium';
        if (prio.toLowerCase() === 'high') prioBadgeClass = 'border-rose-500/30 bg-rose-500/10 text-rose-400';
        else if (prio.toLowerCase() === 'medium') prioBadgeClass = 'border-amber-500/30 bg-amber-500/10 text-amber-400';
        else if (prio.toLowerCase() === 'low') prioBadgeClass = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';

        const tr = document.createElement('tr');
        tr.className = `group hover:bg-surface-800/20 transition-colors border-b border-surface-800/40 last:border-0 ${isComp ? 'opacity-60 hover:opacity-100' : ''}`;
        
        tr.innerHTML = `
            <td class="py-3 px-4">
                <div class="flex items-start gap-3">
                    <button onclick="toggleReminderStatus('${r.id}')" class="mt-0.5 w-5 h-5 rounded-md border ${isComp ? 'bg-emerald-500 border-emerald-500 text-surface-950' : 'border-surface-700 bg-surface-900/60 hover:border-indigo-400 text-transparent'} flex items-center justify-center transition-colors shrink-0" title="${isComp ? 'Reactivate' : 'Mark Completed'}">
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
                    <i class="fa-regular fa-calendar text-[10px] text-indigo-400"></i>
                    <span>${formatToDDMMYYYY(r.date)}</span>
                </div>
                ${r.time ? `<div class="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5"><i class="fa-regular fa-clock text-[9px] text-indigo-400"></i><span>${r.time}</span></div>` : ''}
                ${isOverdue && !isComp ? `<span class="inline-block mt-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold font-mono uppercase tracking-wider">Overdue</span>` : ''}
            </td>
            <td class="py-3 px-4">
                <span class="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-bold border ${prioBadgeClass}">
                    ${prio}
                </span>
            </td>
            <td class="py-3 px-4 font-mono text-xs text-slate-400">
                <span class="flex items-center gap-1.5">
                    <i class="fa-solid ${r.repeat && r.repeat !== 'None' ? 'fa-arrows-rotate text-indigo-400' : 'fa-minus text-slate-600'} text-[10px]"></i>
                    ${r.repeat || 'None'}
                </span>
            </td>
            <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="toggleReminderStatus('${r.id}')" class="p-1.5 rounded-lg bg-surface-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors" title="${isComp ? 'Reactivate' : 'Mark Complete'}">
                        <i class="fa-solid ${isComp ? 'fa-rotate-left text-amber-400' : 'fa-check text-emerald-400'} text-xs"></i>
                    </button>
                    <button onclick="openReminderModal('${r.id}')" class="p-1.5 rounded-lg bg-surface-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition-colors" title="Edit">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteReminder('${r.id}')" class="p-1.5 rounded-lg bg-surface-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors" title="Delete">
                        <i class="fa-solid fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        `;
        body.appendChild(tr);
    });

    if (list.length === 0) {
        body.innerHTML = `<tr><td colspan="5" class="p-12 text-center text-slate-500 font-light text-xs"><i class="fa-regular fa-bell-slash text-3xl mb-3 block opacity-40"></i> No reminders found matching the current filter. Click "Add Reminder" to schedule one.</td></tr>`;
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

    // Reflect directly in Notification Hub
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const notifItem = {
        id: 'notif-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
        type: 'reminder',
        category: 'reminder',
        title: isNew ? `New Reminder: ${title}` : `Updated Reminder: ${title}`,
        desc: `${date}${time ? ' at ' + time : ''} • Priority: ${priority}${repeat !== 'None' ? ' • Repeat: ' + repeat : ''}`,
        date: nowStr,
        read: false,
        linkPage: 'reminders'
    };
    db.notifications.unshift(notifItem);

    if (db.notifications.length > 50) {
        db.notifications = db.notifications.slice(0, 50);
    }

    saveDatabase();
    renderRemindersTable();
    renderNotifications();
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
        if (!db.notifications) db.notifications = [];
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        db.notifications.unshift({
            id: 'notif-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
            type: 'reminder',
            category: 'reminder',
            title: `Reminder Completed: ${r.title}`,
            desc: `Scheduled for ${r.date} marked as completed`,
            date: nowStr,
            read: false,
            linkPage: 'reminders'
        });
        if (db.notifications.length > 50) {
            db.notifications = db.notifications.slice(0, 50);
        }
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
            db.reminders = db.reminders.filter(x => x.id !== id);
            saveDatabase();
            renderRemindersTable();
            renderNotifications();
            showToast('Reminder deleted');
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
                if (!db.notifications) db.notifications = [];
                const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                db.notifications.unshift({
                    id: 'notif-due-' + Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
                    type: 'reminder',
                    category: 'reminder',
                    title: `Reminder Due: ${r.title}`,
                    desc: `${r.date}${r.time ? ' at ' + r.time : ''} • Priority: ${r.priority || 'Medium'}`,
                    date: nowStr,
                    read: false,
                    linkPage: 'reminders'
                });
                triggerCount++;
            }
        }
    });

    if (triggerCount > 0) {
        if (db.notifications.length > 50) db.notifications = db.notifications.slice(0, 50);
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
        if ((b.bankName && b.bankName.toLowerCase().includes(q)) || (b.accountName && b.accountName.toLowerCase().includes(q))) {
            results.push({ page: 'assets', tab: 'banking', label: `Bank: ${b.bankName} - ${b.accountName}` });
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

    if (targetPage === 'assets' || targetPage === 'portfolio') {
        targetTitle = 'Portfolio records (Bank accounts, Credit liabilities, Mutual funds & Asset Valuation logs)';
        clearAction = () => {
            db.bankAccounts = [];
            db.loans = [];
            db.assetMutualFunds = [];
            db.assetLogs = [];
            db.assetCards = [];
            showToast('Portfolio data cleared successfully');
        };
    } else if (targetPage === 'india-ops' || targetPage === 'equities') {
        targetTitle = 'Equities and Trading Desk entries';
        clearAction = () => {
            if (db.indiaOps) {
                db.indiaOps.shareMarket = [];
                db.indiaOps.ventures = [];
                db.indiaOps.othersEntries = [];
            }
            showToast('Equities data cleared successfully');
        };
    } else if (targetPage === 'budget' || targetPage === 'budgets') {
        targetTitle = 'Budget allocations and Daily Outflows';
        clearAction = () => {
            db.budget = { INR: [], QAR: [] };
            db.dailyExpenses = [];
            showToast('Budget data cleared successfully');
        };
    } else if (targetPage === 'goals' || targetPage === 'milestones') {
        targetTitle = 'Milestones and Goals';
        clearAction = () => {
            db.goals = [];
            showToast('Milestones cleared successfully');
        };
    } else if (targetPage === 'notes' || targetPage === 'journal') {
        targetTitle = 'Executive Notes and Journal entries';
        clearAction = () => {
            db.notes = [];
            showToast('Notes cleared successfully');
        };
    } else if (targetPage === 'reminders') {
        targetTitle = 'Reminders and Alerts';
        clearAction = () => {
            db.reminders = [];
            showToast('Reminders cleared successfully');
        };
    } else if (targetPage === 'all') {
        targetTitle = 'ALL application records across the entire dashboard';
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
            showToast('All dashboard data cleared');
        };
    } else {
        targetTitle = 'Portfolio records';
        clearAction = () => {
            db.bankAccounts = [];
            db.loans = [];
            db.assetMutualFunds = [];
            db.assetLogs = [];
            showToast('Portfolio data cleared successfully');
        };
    }

    requireConfirmation(`Are you sure you want to clear ${targetTitle}? This will only delete data for this page and keep the rest intact.`, () => {
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

function showToast(msg) {
    const toast = document.getElementById('appToast');
    const toastMsg = document.getElementById('appToastMsg');
    if (toast && toastMsg) {
        toastMsg.innerText = msg;
        toast.classList.remove('translate-y-24', 'opacity-0');
        setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
        }, 3000);
    }
}

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
