-- ============================================================
-- TutoPool - Seed Data (Demo)
-- ============================================================

-- Programas
INSERT INTO programas (id, nombre, facultad) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Ingeniería de Sistemas', 'Facultad de Ingeniería'),
  ('a1000000-0000-0000-0000-000000000002', 'Administración de Empresas', 'Facultad de Ciencias Económicas'),
  ('a1000000-0000-0000-0000-000000000003', 'Medicina', 'Facultad de Ciencias de la Salud');

-- Materias
INSERT INTO materias (id, nombre, codigo, semestre, programa_id, descripcion, creditos) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Cálculo Diferencial', 'MAT101', 1, 'a1000000-0000-0000-0000-000000000001', 'Fundamentos de cálculo: límites, derivadas y sus aplicaciones.', 4),
  ('b1000000-0000-0000-0000-000000000002', 'Programación I', 'SIS101', 1, 'a1000000-0000-0000-0000-000000000001', 'Introducción a la programación con Python.', 3),
  ('b1000000-0000-0000-0000-000000000003', 'Álgebra Lineal', 'MAT201', 2, 'a1000000-0000-0000-0000-000000000001', 'Espacios vectoriales, matrices y transformaciones lineales.', 4),
  ('b1000000-0000-0000-0000-000000000004', 'Estructuras de Datos', 'SIS201', 3, 'a1000000-0000-0000-0000-000000000001', 'Listas, árboles, grafos y algoritmos de búsqueda.', 4),
  ('b1000000-0000-0000-0000-000000000005', 'Bases de Datos', 'SIS301', 4, 'a1000000-0000-0000-0000-000000000001', 'Diseño relacional, SQL y normalización.', 3),
  ('b1000000-0000-0000-0000-000000000006', 'Contabilidad General', 'ADM101', 1, 'a1000000-0000-0000-0000-000000000002', 'Principios contables y estados financieros.', 3),
  ('b1000000-0000-0000-0000-000000000007', 'Microeconomía', 'ADM201', 2, 'a1000000-0000-0000-0000-000000000002', 'Oferta, demanda y equilibrio de mercados.', 3),
  ('b1000000-0000-0000-0000-000000000008', 'Estadística I', 'ADM301', 3, 'a1000000-0000-0000-0000-000000000002', 'Probabilidad, distribuciones y pruebas de hipótesis.', 4),
  ('b1000000-0000-0000-0000-000000000009', 'Anatomía I', 'MED101', 1, 'a1000000-0000-0000-0000-000000000003', 'Estructura del cuerpo humano: huesos, músculos y órganos.', 5),
  ('b1000000-0000-0000-0000-000000000010', 'Bioquímica', 'MED201', 2, 'a1000000-0000-0000-0000-000000000003', 'Biomoléculas, metabolismo y enzimas.', 4),
  ('b1000000-0000-0000-0000-000000000011', 'Fisiología', 'MED301', 3, 'a1000000-0000-0000-0000-000000000003', 'Funciones de sistemas corporales.', 5),
  ('b1000000-0000-0000-0000-000000000012', 'Cálculo Integral', 'MAT102', 2, 'a1000000-0000-0000-0000-000000000001', 'Integrales, técnicas de integración y aplicaciones.', 4);

-- Tutores (sin user_id ya que son datos demo)
INSERT INTO tutores (id, nombre, email, telefono, bio, calificacion, total_sesiones, google_calendar_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'María García López', 'maria.garcia@tutopool.com', '+57 301 234 5678', 'Ingeniera de Sistemas con 5 años de experiencia docente. Especialista en matemáticas y programación.', 4.8, 120, NULL),
  ('c1000000-0000-0000-0000-000000000002', 'Carlos Rodríguez Martínez', 'carlos.rodriguez@tutopool.com', '+57 302 345 6789', 'Magíster en Matemáticas Aplicadas. Tutor certificado con enfoque en resolución de problemas.', 4.9, 200, NULL),
  ('c1000000-0000-0000-0000-000000000003', 'Ana Sofía Hernández', 'ana.hernandez@tutopool.com', '+57 303 456 7890', 'Administradora de empresas con MBA. Especialista en finanzas y contabilidad.', 4.7, 85, NULL),
  ('c1000000-0000-0000-0000-000000000004', 'Dr. Javier Morales', 'javier.morales@tutopool.com', '+57 304 567 8901', 'Médico internista. 8 años como tutor de ciencias básicas médicas.', 4.9, 150, NULL);

-- Tutor-Materias
INSERT INTO tutor_materias (tutor_id, materia_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000012'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000008'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000009'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000010'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000011');

-- Sesiones (pools abiertos para la próxima semana)
-- NOTA: precio_grupal se calcula automáticamente como 60% de precio_individual en la vista pools_abiertos
INSERT INTO sesiones (id, materia_id, tutor_id, tipo, formato, estado, fecha_inicio, fecha_fin, ubicacion, enlace_virtual, precio_individual, min_estudiantes, max_estudiantes, notas) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 'grupal', 'presencial', 'esperando_cupos', now() + interval '2 days', now() + interval '2 days' + interval '2 hours', 'Biblioteca Central, Sala 3B', NULL, 45000, 2, 5, 'Revisión de derivadas parciales y regla de la cadena.'),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'grupal', 'virtual', 'esperando_cupos', now() + interval '3 days', now() + interval '3 days' + interval '1.5 hours', NULL, 'https://meet.google.com/abc-xyz', 40000, 2, 6, 'Taller de límites al infinito.'),
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'grupal', 'presencial', 'confirmada', now() + interval '1 day', now() + interval '1 day' + interval '2 hours', 'Lab. Computación, Bloque 4', NULL, 50000, 2, 4, 'Proyecto final: repaso de POO con Python.'),
  ('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'grupal', 'virtual', 'esperando_cupos', now() + interval '4 days', now() + interval '4 days' + interval '2 hours', NULL, 'https://meet.google.com/def-uvw', 48000, 3, 6, 'Diagonalización de matrices y valores propios.'),
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'grupal', 'presencial', 'esperando_cupos', now() + interval '5 days', now() + interval '5 days' + interval '2 hours', 'Biblioteca Central, Sala 2A', NULL, 55000, 2, 5, 'Normalización y consultas JOIN avanzadas.'),
  ('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'grupal', 'presencial', 'confirmada', now() + interval '2 days', now() + interval '2 days' + interval '1.5 hours', 'Aula 201, Bloque Administrativo', NULL, 42000, 2, 5, 'Preparación para parcial: libro diario y balance general.'),
  ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000004', 'grupal', 'presencial', 'esperando_cupos', now() + interval '3 days', now() + interval '3 days' + interval '3 hours', 'Anfiteatro de Anatomía', NULL, 60000, 3, 6, 'Repaso de sistema musculoesquelético con modelos anatómicos.'),
  ('d1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'grupal', 'virtual', 'esperando_cupos', now() + interval '6 days', now() + interval '6 days' + interval '2 hours', NULL, 'https://meet.google.com/ghi-rst', 52000, 2, 5, 'Implementación de árboles AVL y grafos.');
