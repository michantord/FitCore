import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Profile, Ejercicio, RutinaConEjercicios, PerfilFisico } from '../models/types';
import { supabase } from '../services/supabaseClient';
import { profileService } from '../services/profileService';
import { ejercicioService } from '../services/ejercicioService';
import { rutinaService } from '../services/rutinaService';
import { perfilFisicoService } from '../services/perfilFisicoService';

interface AppContextType {
  usuarioActual: Profile | null;
  profiles: Profile[];
  ejercicios: Ejercicio[];
  rutinas: RutinaConEjercicios[];
  perfilFisico: PerfilFisico | null;
  perfilesFisicos: PerfilFisico[];
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, nombre: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshEjercicios: () => Promise<void>;
  refreshRutinas: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
  refreshPerfilFisico: () => Promise<void>;
  refreshPerfilesFisicos: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuarioActual, setUsuarioActual] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [rutinas, setRutinas] = useState<RutinaConEjercicios[]>([]);
  const [perfilFisico, setPerfilFisico] = useState<PerfilFisico | null>(null);
  const [perfilesFisicos, setPerfilesFisicos] = useState<PerfilFisico[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (userId: string, email?: string) => {
    const profile = await profileService.getById(userId);
    if (profile) {
      setUsuarioActual({ ...profile, email });
    } else {
      setUsuarioActual(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email).finally(() =>
          setAuthLoading(false)
        );
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchProfile(session.user.id, session.user.email);
        } else {
          setUsuarioActual(null);
          setRutinas([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const refreshEjercicios = async () => {
    const data = await ejercicioService.getAll();
    setEjercicios(data);
  };

  const refreshRutinas = async () => {
    if (!usuarioActual) return;
    const data =
      usuarioActual.rol === 'admin'
        ? await rutinaService.getAll()
        : await rutinaService.getByUsuario(usuarioActual.id);

    setRutinas(data);
  };

  const refreshProfiles = async () => {
    const data = await profileService.getAll();
    setProfiles(data);
  };

  const refreshPerfilFisico = async () => {
    if (!usuarioActual) return;
    const data = await perfilFisicoService.getByUsuario(usuarioActual.id);
    setPerfilFisico(data);
  };

  const refreshPerfilesFisicos = async () => {
    const data = await perfilFisicoService.getAll();
    setPerfilesFisicos(data);
  };

  useEffect(() => {
    if (!usuarioActual) return;
    setLoading(true);
    const tasks = [refreshEjercicios(), refreshRutinas(), refreshProfiles(), refreshPerfilFisico()];
    if (usuarioActual.rol === 'admin') tasks.push(refreshPerfilesFisicos());
    Promise.all(tasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [usuarioActual?.id]);

  const login = async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const register = async (email: string, password: string, nombre: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.user) {
      try {
        await profileService.create(data.user.id, nombre);
      } catch (e: unknown) {
        return e instanceof Error ? e.message : 'Error al crear perfil';
      }
    }
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppContext.Provider
      value={{
        usuarioActual,
        profiles,
        ejercicios,
        rutinas,
        perfilFisico,
        perfilesFisicos,
        loading,
        authLoading,
        error,
        login,
        register,
        logout,
        refreshEjercicios,
        refreshRutinas,
        refreshProfiles,
        refreshPerfilFisico,
        refreshPerfilesFisicos,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
