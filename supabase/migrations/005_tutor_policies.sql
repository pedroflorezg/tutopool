-- ─── 005_tutor_policies.sql ──────────
-- Agrega políticas para que los tutores puedan crear su propio perfil y editar su información biográfica

-- Permitir a los usuarios registrados crear su perfil como tutor (signUp)
CREATE POLICY "tutor_insert_self" 
ON public.tutores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir a un tutor actualizar SOLO SU PROPIO perfil 
-- (biografía, teléfono, fotos, google calendar, etc.)
CREATE POLICY "tutor_update_self" 
ON public.tutores 
FOR UPDATE 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Permitir a un tutor enlazar las materias que dicta (durante su registro o edición)
CREATE POLICY "tutor_insert_materias" 
ON public.tutor_materias 
FOR INSERT 
WITH CHECK (
  tutor_id IN (SELECT id FROM public.tutores WHERE user_id = auth.uid())
);
