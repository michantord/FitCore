import { supabase } from './supabaseClient';
import type { PerfilFisico } from '../models/types';

export const perfilFisicoService = {
  async getAll(): Promise<PerfilFisico[]> {
    const { data, error } = await supabase.from('perfil_fisico').select('*');
    if (error) throw error;
    return data as PerfilFisico[];
  },

  async getByUsuario(usuarioId: string): Promise<PerfilFisico | null> {
    const { data, error } = await supabase
      .from('perfil_fisico')
      .select('*')
      .eq('usuario_id', usuarioId)
      .single();
    if (error?.code === 'PGRST116') return null;
    if (error) throw error;
    return data as PerfilFisico;
  },

  async upsert(perfil: PerfilFisico): Promise<PerfilFisico> {
    const { data, error } = await supabase
      .from('perfil_fisico')
      .upsert(perfil, { onConflict: 'usuario_id' })
      .select()
      .single();
    if (error) throw error;
    return data as PerfilFisico;
  },
};
