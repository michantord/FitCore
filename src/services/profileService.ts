import { supabase } from './supabaseClient';
import type { Profile } from '../models/types';

export const profileService = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nombre');
    if (error) throw error;
    return data as Profile[];
  },

  async create(id: string, nombre: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .insert({ id, nombre, rol: 'usuario' });
    if (error) throw error;
  },

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Profile;
  },
};
