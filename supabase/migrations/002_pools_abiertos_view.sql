-- Vista que consolida sesiones con datos de tutor, materia e inscritos actuales.
-- Usada por usePools() y usePoolDetail() en el frontend.

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
  COUNT(i.id)::integer          AS inscritos_actuales,
  t.nombre                      AS tutor_nombre,
  t.calificacion                AS tutor_calificacion,
  t.foto_url                    AS tutor_foto_url,
  t.bio                         AS tutor_bio,
  t.precio_base_presencial      AS tutor_precio_presencial,
  t.precio_base_virtual         AS tutor_precio_virtual,
  m.nombre                      AS materia_nombre,
  m.codigo                      AS materia_codigo
FROM public.sesiones s
JOIN public.tutores   t ON t.id = s.tutor_id
JOIN public.materias  m ON m.id = s.materia_id
LEFT JOIN public.inscripciones i
       ON i.sesion_id = s.id
      AND i.estado_pago IN ('pendiente', 'pagado')
WHERE s.estado IN ('esperando_cupos', 'confirmada')
GROUP BY
  s.id, t.id, t.nombre, t.calificacion, t.foto_url, t.bio,
  t.precio_base_presencial, t.precio_base_virtual,
  m.nombre, m.codigo;
