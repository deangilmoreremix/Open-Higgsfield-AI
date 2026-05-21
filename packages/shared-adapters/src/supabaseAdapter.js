import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

let client = null;

export function getClient() {
    if (!client) {
        client = createClient(supabaseUrl, supabaseAnonKey);
    }
    return client;
}

export async function getUser() {
    const { data: { user }, error } = await getClient().auth.getUser();
    if (error) throw error;
    return user;
}

export async function getSession() {
    const { data: { session }, error } = await getClient().auth.getSession();
    if (error) throw error;
    return session;
}

export async function signIn(email, password) {
    const { data, error } = await getClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await getClient().auth.signOut();
    if (error) throw error;
}

export function onAuthStateChange(callback) {
    const { data: { subscription } } = getClient().auth.onAuthStateChange(callback);
    return subscription;
}
