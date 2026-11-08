let state = { teams: [], players: [], matches: [] };
let adminKey = "";

async function fetchData() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        state = data;
        renderUI();
    } catch (err) {
        console.error("Failed to fetch data:", err);
    }
}

function renderUI() {
    const matchesGrid = document.getElementById('matches-grid');
    matchesGrid.innerHTML = state.matches.map(m => `
        <div class="glass-card p-4 rounded-xl space-y-3 border-l-4 ${m.status === 'LIVE' ? 'border-red-500' : 'border-amber-500'}">
            <div class="flex justify-between items-center text-xs text-slate-400">
                <span>${m.court}</span>
                <span class="px-2 py-0.5 rounded ${m.status === 'LIVE' ? 'bg-red-500/20 text-red-400 animate-pulse font-bold' : 'bg-slate-800'}">${m.status}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="font-bold text-slate-200">${m.team_a?.name || 'Team A'}</span>
                <span class="text-xl font-bold text-amber-400">${m.team_a_sets} - ${m.team_b_sets}</span>
                <span class="font-bold text-slate-200">${m.team_b?.name || 'Team B'}</span>
            </div>
            ${m.mvp_name ? `<div class="text-xs text-amber-300/80"><i class="fa-solid fa-star text-amber-400"></i> MVP: ${m.mvp_name}</div>` : ''}
        </div>
    `).join('');

    const lbBody = document.getElementById('leaderboard-body');
    lbBody.innerHTML = state.players.map((p, idx) => `
        <tr class="hover:bg-slate-800/40">
            <td class="p-3 font-bold text-amber-400">#${idx + 1}</td>
            <td class="p-3 font-medium text-slate-100">${p.name}</td>
            <td class="p-3 text-slate-400">${p.grade}</td>
            <td class="p-3 text-center font-bold text-amber-400">${p.spike_points}</td>
            <td class="p-3 text-center text-slate-300">${p.blocks}</td>
            <td class="p-3 text-center text-slate-300">${p.aces}</td>
        </tr>
    `).join('');

    const stBody = document.getElementById('standings-body');
    stBody.innerHTML = state.teams.map(t => `
        <tr class="hover:bg-slate-800/40">
            <td class="p-2 font-semibold text-slate-200">${t.name}</td>
            <td class="p-2 text-center text-slate-400">${t.played}</td>
            <td class="p-2 text-center text-green-400">${t.won}</td>
            <td class="p-2 text-center text-red-400">${t.lost}</td>
            <td class="p-2 text-center font-bold text-amber-400">${t.points}</td>
        </tr>
    `).join('');
}

function toggleAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
}

function authenticateAdmin() {
    const keyInput = document.getElementById('admin-passkey').value;
    if (keyInput) {
        adminKey = keyInput;
        document.getElementById('admin-auth').classList.add('hidden');
        document.getElementById('admin-controls').classList.remove('hidden');

        const select = document.getElementById('admin-match-select');
        select.innerHTML = state.matches.map(m => `
            <option value="${m.id}">Match #${m.id}: ${m.team_a?.name} vs ${m.team_b?.name}</option>
        `).join('');
    }
}

async function saveMatchScore() {
    const match_id = document.getElementById('admin-match-select').value;
    const team_a_sets = parseInt(document.getElementById('team-a-sets').value) || 0;
    const team_b_sets = parseInt(document.getElementById('team-b-sets').value) || 0;
    const status = document.getElementById('match-status').value;

    try {
        const res = await fetch('/api/admin/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminKey}`
            },
            body: JSON.stringify({ match_id, team_a_sets, team_b_sets, status })
        });
        
        if (res.ok) {
            alert("Match Updated Successfully!");
            fetchData();
            toggleAdminModal();
        } else {
            alert("Unauthorized / Invalid Passkey");
        }
    } catch (err) {
        alert("Update failed.");
    }
}

fetchData();