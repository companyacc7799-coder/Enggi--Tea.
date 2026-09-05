const SUPABASE_URL = "https://vuxlcgoydablshzkgnbl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_X9RkbzO76cmW-lvuIu8BOg_w5B8FY7r";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);