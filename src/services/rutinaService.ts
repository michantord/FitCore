import { supabase } from './supabaseClient';
import type { Rutina, RutinaConEjercicios, RutinaEjercicio } from '../models/types';

export const rutinaService = {
  async getByUsuario(usuarioId: string): Promise<RutinaConEjercicios[]> {
    const { data, error } = await supabase
      .from('rutina')
      .select(`
        *,
        rutina_ejercicio (
          rutina_id,
          ejercicio_id,
          series,
          repeticiones,
          ejercicio (*)
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('id');
    if (error) throw error;
    return data as RutinaConEjercicios[];
  },

  async getAll(): Promise<RutinaConEjercicios[]> {
    const { data, error } = await supabase
      .from('rutina')
      .select(`
        *,
        rutina_ejercicio (
          rutina_id,
          ejercicio_id,
          series,
          repeticiones,
          ejercicio (*)
        )
      `)
      .order('usuario_id');
    if (error) throw error;
    return data as RutinaConEjercicios[];
  },

  async create(payload: Omit<Rutina, 'id' | 'fecha_modificacion'>): Promise<Rutina> {
    const { data, error } = await supabase
      .from('rutina')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Rutina;
  },

  async update(id: number, payload: Partial<Rutina>): Promise<Rutina> {
    const { data, error } = await supabase
      .from('rutina')
      .update({ ...payload, fecha_modificacion: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Rutina;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase.from('rutina').delete().eq('id', id);
    if (error) throw error;
  },

  async setEjercicios(
    rutinaId: number,
    ejercicios: Omit<RutinaEjercicio, 'ejercicio'>[]
  ): Promise<void> {
    const { error: delError } = await supabase
      .from('rutina_ejercicio')
      .delete()
      .eq('rutina_id', rutinaId);
    if (delError) throw delError;

    if (ejercicios.length === 0) return;

    const { error: insError } = await supabase
      .from('rutina_ejercicio')
      .insert(ejercicios);
    if (insError) throw insError;
  },
};
