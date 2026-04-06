-- ─── Admin: función is_admin() + políticas ────────────────────────────────────
-- El admin se identifica por email (pedro.florez.g@gmail.com).
-- Las políticas existentes (public_read) siguen activas; las de admin se suman (OR).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(auth.email() = 'pedro.florez.g@gmail.com', false)
$$;

-- Tutores: admin ve todos (incl. inactivos) y puede escribir
CREATE POLICY "admin_select" ON public.tutores FOR SELECT USING (is_admin());
CREATE POLICY "admin_insert" ON public.tutores FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update" ON public.tutores FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete" ON public.tutores FOR DELETE USING (is_admin());

-- Materias: admin puede escribir
CREATE POLICY "admin_insert" ON public.materias FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update" ON public.materias FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete" ON public.materias FOR DELETE USING (is_admin());

-- Programas: admin puede escribir
CREATE POLICY "admin_insert" ON public.programas FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update" ON public.programas FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete" ON public.programas FOR DELETE USING (is_admin());

-- materia_programas: admin puede escribir
CREATE POLICY "admin_insert" ON public.materia_programas FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update" ON public.materia_programas FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete" ON public.materia_programas FOR DELETE USING (is_admin());

-- Sesiones: admin puede crear / modificar / cancelar
CREATE POLICY "admin_insert" ON public.sesiones FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "admin_update" ON public.sesiones FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete" ON public.sesiones FOR DELETE USING (is_admin());

-- Solicitudes: admin ve todas y puede actualizarlas
CREATE POLICY "admin_select" ON public.solicitudes_tutoria FOR SELECT USING (is_admin());
CREATE POLICY "admin_update" ON public.solicitudes_tutoria FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Inscripciones: admin ve todas
CREATE POLICY "admin_select" ON public.inscripciones FOR SELECT USING (is_admin());
