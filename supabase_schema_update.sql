-- 1. Eliminar la columna de contraseña en texto plano de la tabla pública 'users'
ALTER TABLE public.users 
DROP COLUMN IF EXISTS password;

-- 2. Crear la función disparadora para sincronizar nuevos usuarios de Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
SECURITY DEFINER -- Ejecuta con privilegios elevados para poder insertar ignorando políticas RLS restrictivas
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear el trigger para que se ejecute automáticamente tras un registro en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
