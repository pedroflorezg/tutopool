-- Columna para rastrear cuándo se envió la notificación solitaria al estudiante.
-- El cron la usa para no reenviar el mensaje en cada ejecución.

ALTER TABLE public.sesiones
  ADD COLUMN IF NOT EXISTS notificado_solitario_at timestamptz DEFAULT NULL;
