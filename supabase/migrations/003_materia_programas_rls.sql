-- ─── 1. Tabla materia_programas ────────────────────────────────────────────────
-- Una materia puede pertenecer a múltiples carreras, con su propio semestre
-- dentro de cada carrera.

CREATE TABLE public.materia_programas (
  materia_id  uuid    NOT NULL REFERENCES public.materias(id)  ON DELETE CASCADE,
  programa_id uuid    NOT NULL REFERENCES public.programas(id) ON DELETE CASCADE,
  semestre    integer NOT NULL CHECK (semestre BETWEEN 1 AND 12),
  PRIMARY KEY (materia_id, programa_id)
);

-- ─── 2. Limpiar columnas legacy de materias ────────────────────────────────────
-- programa_id y semestre ya no viven en materias; ahora están en materia_programas.
ALTER TABLE public.materias DROP COLUMN IF EXISTS programa_id;
ALTER TABLE public.materias DROP COLUMN IF EXISTS semestre;

-- ─── 3. Actualizar vista pools_abiertos ────────────────────────────────────────
-- (no depende de semestre/programa, queda igual — solo recreamos para limpiar)
CREATE OR REPLACE VIEW public.pools_abiertos AS
SELECT
  s.id,
  s.materia_id,
  s.tutor_id,
  s.tipo,
  s.formato,
  s.estado,
  s.fecha_inicio,
  s.fecha_fin,
  s.ubicacion,
  s.enlace_virtual,
  s.precio_individual,
  s.precio_grupal,
  s.min_estudiantes,
  s.max_estudiantes,
  s.notas,
  s.created_at,
  COUNT(i.id)::integer     AS inscritos_actuales,
  t.nombre                 AS tutor_nombre,
  t.calificacion           AS tutor_calificacion,
  t.foto_url               AS tutor_foto_url,
  t.bio                    AS tutor_bio,
  t.precio_base_presencial AS tutor_precio_presencial,
  t.precio_base_virtual    AS tutor_precio_virtual,
  m.nombre                 AS materia_nombre,
  m.codigo                 AS materia_codigo
FROM public.sesiones s
JOIN public.tutores   t ON t.id = s.tutor_id
JOIN public.materias  m ON m.id = s.materia_id
LEFT JOIN public.inscripciones i
       ON i.sesion_id = s.id
      AND i.estado_pago IN ('pendiente', 'pagado')
WHERE s.estado IN ('esperando_cupos', 'confirmada')
GROUP BY s.id, t.id, t.nombre, t.calificacion, t.foto_url, t.bio,
         t.precio_base_presencial, t.precio_base_virtual,
         m.nombre, m.codigo;

-- ─── 4. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.programas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materia_programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_materias    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sesiones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_tutoria ENABLE ROW LEVEL SECURITY;

-- Lectura pública (catálogo)
CREATE POLICY "public_read" ON public.programas         FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.materias          FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.materia_programas FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.tutores           FOR SELECT USING (activo = true);
CREATE POLICY "public_read" ON public.tutor_materias    FOR SELECT USING (true);
CREATE POLICY "public_read" ON public.sesiones          FOR SELECT USING (true);

-- Inscripciones: solo el propio estudiante
CREATE POLICY "own_read"   ON public.inscripciones FOR SELECT USING (auth.uid() = estudiante_id);
CREATE POLICY "own_insert" ON public.inscripciones FOR INSERT WITH CHECK (auth.uid() = estudiante_id);

-- Solicitudes: solo el propio estudiante
CREATE POLICY "own_read"   ON public.solicitudes_tutoria FOR SELECT USING (auth.uid() = estudiante_id);
CREATE POLICY "own_insert" ON public.solicitudes_tutoria FOR INSERT WITH CHECK (auth.uid() = estudiante_id);
CREATE POLICY "own_update" ON public.solicitudes_tutoria FOR UPDATE USING (auth.uid() = estudiante_id);
