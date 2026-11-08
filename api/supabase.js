const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://agpxofzartbkgelljmeo.supabase.co';
const supabaseKey = 'sb_publishable_oxkPdxHk477KlXVJSpxVmA_TGRnrWh1';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;