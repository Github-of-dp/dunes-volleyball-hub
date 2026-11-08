const express = require('express');
const cors = require('cors');
const supabase = require('./supabase');

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "DUNES2026";

// Auth verification middleware
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${ADMIN_PASSKEY}`) {
        return res.status(401).json({ error: "Unauthorized access. Invalid Passkey." });
    }
    next();
};

// GET initial payload (Dashboard, Leaderboards, Matches, Teams)
app.get('/api/data', async (req, res) => {
    try {
        const { data: teams, error: e1 } = await supabase.from('teams').select('*').order('points', { ascending: false });
        const { data: players, error: e2 } = await supabase.from('players').select('*').order('spike_points', { ascending: false });
        const { data: matches, error: e3 } = await supabase.from('matches').select(`
            *,
            team_a:teams!matches_team_a_id_fkey(name),
            team_b:teams!matches_team_b_id_fkey(name)
        `).order('id', { ascending: false });

        if (e1 || e2 || e3) throw e1 || e2 || e3;

        res.json({ teams, players, matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: Update Live Match Score
app.post('/api/admin/update-score', verifyAdmin, async (req, res) => {
    const { match_id, team_a_sets, team_b_sets, status, mvp_name } = req.body;
    try {
        const { data, error } = await supabase
            .from('matches')
            .update({ team_a_sets, team_b_sets, status, mvp_name })
            .eq('id', match_id)
            .select();

        if (error) throw error;
        res.json({ success: true, match: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;