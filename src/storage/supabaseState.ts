import { supabase } from '../lib/supabase';
import type { AppState } from '../types';
import { emptyState, isAppState, prunePersistedState } from './storage';

export async function loadUserState(userId: string): Promise<AppState> {
  const { data, error } = await supabase
    .from('user_data')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const empty = emptyState();
    await saveUserState(userId, empty);
    return empty;
  }

  if (!isAppState(data.state)) return emptyState();
  return prunePersistedState(data.state);
}

export async function saveUserState(userId: string, state: AppState): Promise<boolean> {
  const payload = prunePersistedState(state);
  const { error } = await supabase.from('user_data').upsert(
    {
      user_id: userId,
      state: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  return !error;
}
