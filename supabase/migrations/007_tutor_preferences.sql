-- Preferencias de sesión del tutor
ALTER TABLE public.tutores
  ADD COLUMN IF NOT EXISTS tipo_sesion      text    DEFAULT 'ambos'    CHECK (tipo_sesion IN ('individual','grupal','ambos')),
  ADD COLUMN IF NOT EXISTS formato_preferido text   DEFAULT 'ambos'    CHECK (formato_preferido IN ('presencial','virtual','ambos')),
  ADD COLUMN IF NOT EXISTS max_estudiantes_grupales integer DEFAULT 6  CHECK (max_estudiantes_grupales BETWEEN 2 AND 20),
  ADD COLUMN IF NOT EXISTS horas_bloqueadas jsonb   DEFAULT '[]';
-- horas_bloqueadas: array de strings "HH" (ej. ["08","14","19"])
-- representa horas completas en que el tutor nunca está disponible
