import { supabase } from './supabaseClient';
import type { Ejercicio } from '../models/types';

export const ejercicioService = {
  async getAll(): Promise<Ejercicio[]> {
    const { data, error } = await supabase
      .from('ejercicio')
      .select('*')
      .order('nombre');
    if (error) throw error;
    return data as Ejercicio[];
  },

  async create(payload: Omit<Ejercicio, 'id'>): Promise<Ejercicio> {
    const { data, error } = await supabase
      .from('ejercicio')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Ejercicio;
  },

  async update(id: number, payload: Partial<Ejercicio>): Promise<Ejercicio> {
    const { data, error } = await supabase
      .from('ejercicio')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Ejercicio;
  },

  async toggleActivo(id: number, activo: boolean): Promise<void> {
    const { error } = await supabase
      .from('ejercicio')
      .update({ activo })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('ejercicio').delete().eq('id', id);
    if (error) throw error;
  },
};
