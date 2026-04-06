-- ============================================================
-- TutoPool – Seed Data (EIA – Universidad EIA)
-- Compatible con migration 003: materias sin programa_id/semestre
-- ============================================================

-- ─── 1. Programas ─────────────────────────────────────────────────────────────
INSERT INTO programas (id, nombre, facultad) VALUES
  -- Escuela de Ciencias e Ingeniería
  ('a1000000-0000-0000-0000-000000000001', 'Ingeniería de Sistemas y Computación', 'Escuela de Ciencias e Ingeniería'),
  ('a1000000-0000-0000-0000-000000000002', 'Ingeniería Industrial',               'Escuela de Ciencias e Ingeniería'),
  ('a1000000-0000-0000-0000-000000000003', 'Ingeniería Civil',                    'Escuela de Ciencias e Ingeniería'),
  ('a1000000-0000-0000-0000-000000000004', 'Ingeniería Mecánica',                 'Escuela de Ciencias e Ingeniería'),
  ('a1000000-0000-0000-0000-000000000005', 'Ingeniería Electrónica',              'Escuela de Ciencias e Ingeniería'),
  ('a1000000-0000-0000-0000-000000000006', 'Ingeniería Biomédica',                'Escuela de Ciencias e Ingeniería'),
  -- Escuela de Ciencias Administrativas y Afines
  ('a1000000-0000-0000-0000-000000000007', 'Administración de Negocios',          'Escuela de Ciencias Administrativas y Afines'),
  ('a1000000-0000-0000-0000-000000000008', 'Economía',                            'Escuela de Ciencias Administrativas y Afines'),
  -- Escuela de Ciencias de la Salud y Ciencias Biológicas
  ('a1000000-0000-0000-0000-000000000009', 'Medicina',                            'Escuela de Ciencias de la Salud y Ciencias Biológicas'),
  ('a1000000-0000-0000-0000-000000000010', 'Psicología',                          'Escuela de Ciencias de la Salud y Ciencias Biológicas'),
  ('a1000000-0000-0000-0000-000000000011', 'Ciencias del Deporte y la Actividad Física', 'Escuela de Ciencias de la Salud y Ciencias Biológicas');

-- ─── 2. Materias (sin programa_id ni semestre) ────────────────────────────────
-- Matemáticas y Ciencias Básicas (compartidas entre muchos programas)
INSERT INTO materias (id, nombre, codigo, descripcion, creditos) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Cálculo Diferencial',         'MAT101', 'Límites, derivadas y sus aplicaciones.', 4),
  ('b1000000-0000-0000-0000-000000000002', 'Cálculo Integral',            'MAT102', 'Integrales, técnicas y aplicaciones.', 4),
  ('b1000000-0000-0000-0000-000000000003', 'Álgebra Lineal',              'MAT201', 'Matrices, determinantes y transformaciones lineales.', 3),
  ('b1000000-0000-0000-0000-000000000004', 'Cálculo Vectorial',           'MAT202', 'Funciones vectoriales, gradiente, divergencia y rotacional.', 4),
  ('b1000000-0000-0000-0000-000000000005', 'Ecuaciones Diferenciales',    'MAT301', 'EDOs y EDPs con aplicaciones a ingeniería.', 3),
  ('b1000000-0000-0000-0000-000000000006', 'Probabilidad y Estadística',  'EST201', 'Distribuciones, estimación e inferencia.', 3),
  -- Ciencias Naturales
  ('b1000000-0000-0000-0000-000000000007', 'Física Mecánica',             'FIS101', 'Cinemática, dinámica y energía mecánica.', 3),
  ('b1000000-0000-0000-0000-000000000008', 'Física Eléctrica y Óptica',   'FIS201', 'Electromagnetismo, óptica y ondas.', 3),
  ('b1000000-0000-0000-0000-000000000009', 'Química General',             'QUI101', 'Estructura atómica, enlaces y reacciones básicas.', 3),
  -- Ingeniería de Sistemas
  ('b1000000-0000-0000-0000-000000000010', 'Programación I',              'SIS101', 'Fundamentos de programación con Python.', 3),
  ('b1000000-0000-0000-0000-000000000011', 'Programación II',             'SIS201', 'POO, patrones de diseño y programación funcional.', 3),
  ('b1000000-0000-0000-0000-000000000012', 'Estructuras de Datos',        'SIS202', 'Listas, árboles, grafos y búsqueda.', 4),
  ('b1000000-0000-0000-0000-000000000013', 'Bases de Datos',              'SIS301', 'Diseño relacional, SQL y normalización.', 3),
  ('b1000000-0000-0000-0000-000000000014', 'Algoritmos y Complejidad',    'SIS303', 'Análisis de algoritmos, NP-completitud.', 3),
  ('b1000000-0000-0000-0000-000000000015', 'Redes de Computadores',       'SIS401', 'Modelos OSI/TCP-IP, protocolos y seguridad.', 3),
  ('b1000000-0000-0000-0000-000000000016', 'Ingeniería de Software',      'SIS501', 'Ciclo de vida, metodologías ágiles y testing.', 3),
  ('b1000000-0000-0000-0000-000000000017', 'Inteligencia Artificial',     'SIS601', 'Búsqueda heurística, ML y redes neuronales.', 3),
  -- Ingeniería Industrial
  ('b1000000-0000-0000-0000-000000000018', 'Investigación de Operaciones','IND301', 'Programación lineal, redes y teoría de colas.', 3),
  ('b1000000-0000-0000-0000-000000000019', 'Gestión de Calidad',          'IND401', 'TQM, Seis Sigma y control estadístico.', 3),
  ('b1000000-0000-0000-0000-000000000020', 'Simulación de Sistemas',      'IND501', 'Modelos discretos y continuos, Arena.', 3),
  -- Ingeniería Civil
  ('b1000000-0000-0000-0000-000000000021', 'Resistencia de Materiales',   'CIV201', 'Tensión, deformación y flexión de vigas.', 3),
  ('b1000000-0000-0000-0000-000000000022', 'Mecánica de Fluidos',         'CIV301', 'Flujo interno, externo y hidráulica.', 3),
  ('b1000000-0000-0000-0000-000000000023', 'Análisis Estructural',        'CIV401', 'Métodos matriciales y análisis de pórticos.', 3),
  -- Ingeniería Mecánica
  ('b1000000-0000-0000-0000-000000000024', 'Termodinámica',               'MEC201', 'Leyes de la termodinámica y ciclos térmicos.', 3),
  ('b1000000-0000-0000-0000-000000000025', 'Mecánica de Sólidos',         'MEC301', 'Deformaciones, esfuerzos y criterios de falla.', 3),
  ('b1000000-0000-0000-0000-000000000026', 'Dinámica de Máquinas',        'MEC401', 'Mecanismos, vibraciones y transmisión de potencia.', 3),
  -- Ingeniería Electrónica
  ('b1000000-0000-0000-0000-000000000027', 'Circuitos Eléctricos I',      'ELE101', 'Leyes de Kirchhoff, análisis nodal y mesh.', 3),
  ('b1000000-0000-0000-0000-000000000028', 'Señales y Sistemas',          'ELE301', 'Transformada de Fourier, Laplace y Z.', 3),
  ('b1000000-0000-0000-0000-000000000029', 'Electrónica Analógica',       'ELE302', 'Diodos, transistores y amplificadores operacionales.', 3),
  -- Ciencias de la Salud
  ('b1000000-0000-0000-0000-000000000030', 'Anatomía Humana',             'BIO101', 'Sistemas musculoesquelético, nervioso y cardiovascular.', 5),
  ('b1000000-0000-0000-0000-000000000031', 'Bioquímica',                  'BIO201', 'Biomoléculas, enzimas y vías metabólicas.', 4),
  ('b1000000-0000-0000-0000-000000000032', 'Fisiología Humana',           'BIO301', 'Funciones integradas de los sistemas corporales.', 5),
  -- Administración y Economía
  ('b1000000-0000-0000-0000-000000000033', 'Contabilidad General',        'ADM101', 'Principios contables, libro diario y estados financieros.', 3),
  ('b1000000-0000-0000-0000-000000000034', 'Microeconomía',               'ECO101', 'Oferta, demanda, mercados y teoría del consumidor.', 3),
  ('b1000000-0000-0000-0000-000000000035', 'Macroeconomía',               'ECO201', 'PIB, inflación, política monetaria y fiscal.', 3),
  ('b1000000-0000-0000-0000-000000000036', 'Finanzas Corporativas',       'ADM301', 'Valoración de proyectos, WACC y decisiones de inversión.', 3),
  -- Psicología y Deporte
  ('b1000000-0000-0000-0000-000000000037', 'Psicología General',          'PSI101', 'Percepción, memoria, aprendizaje y personalidad.', 3),
  ('b1000000-0000-0000-0000-000000000038', 'Neurociencias',               'PSI301', 'Neuronas, sinapsis y bases neurales del comportamiento.', 3),
  ('b1000000-0000-0000-0000-000000000039', 'Fisiología del Ejercicio',    'DEP201', 'Respuestas cardiovasculares, musculares y metabólicas.', 3);

-- ─── 3. materia_programas (carrera × materia × semestre) ─────────────────────
-- SIS = Ingeniería de Sistemas
INSERT INTO materia_programas (materia_id, programa_id, semestre) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1), -- Cálculo Dif
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 2), -- Cálculo Int
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 2), -- Álgebra Lineal
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 3), -- Cálculo Vec
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 4), -- Ec. Dif.
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 5), -- Prob & Est
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 1), -- Física Mec
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001', 2), -- Física Elec
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000001', 1), -- Prog I
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000001', 2), -- Prog II
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000001', 3), -- Estructuras de Datos
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000001', 4), -- Bases de Datos
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000001', 4), -- Algoritmos
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000001', 5), -- Redes
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000001', 6), -- Ing. Software
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000001', 7), -- IA
  -- IND = Ingeniería Industrial
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 1), -- Cálculo Dif
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 2), -- Cálculo Int
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 2), -- Álgebra Lineal
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 3), -- Prob & Est
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 1), -- Física Mec
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 2), -- Prog I (comp. con SIS)
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000002', 5), -- Inv. Operaciones
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000002', 6), -- Gest. Calidad
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000002', 7), -- Simulación
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000002', 3), -- Contabilidad
  -- CIV = Ingeniería Civil
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 1), -- Cálculo Dif
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 2), -- Cálculo Int
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 2), -- Álgebra Lineal
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 3), -- Cálculo Vec
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 4), -- Ec. Dif.
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 1), -- Física Mec
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 2), -- Física Elec
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 1), -- Química
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000003', 3), -- Resistencia Mat
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000003', 4), -- Mec. Fluidos
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000003', 5), -- Análisis Estructural
  -- MEC = Ingeniería Mecánica
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 1), -- Cálculo Dif
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 2), -- Cálculo Int
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 2), -- Álgebra Lineal
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 1), -- Física Mec
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 2), -- Física Elec
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 1), -- Química
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000004', 3), -- Resistencia Mat
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000004', 3), -- Mec. Fluidos
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000004', 4), -- Termodinámica
  ('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000004', 4), -- Mec. Sólidos
  ('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000004', 5), -- Din. Máquinas
  -- ELE = Ingeniería Electrónica
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 1), -- Cálculo Dif
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 2), -- Cálculo Int
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005', 2), -- Álgebra Lineal
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005', 3), -- Cálculo Vec
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 4), -- Ec. Dif.
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000005', 1), -- Física Mec
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000005', 2), -- Física Elec
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000005', 2), -- Circuitos I
  ('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000005', 4), -- Señales
  ('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000005', 3), -- Electrónica Anal.
  -- BIO = Ingeniería Biomédica
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', 1), -- Cálculo Dif
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 2), -- Cálculo Int
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000006', 1), -- Física Mec
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000006', 2), -- Física Elec
  ('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000006', 3), -- Circuitos I
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000006', 2), -- Anatomía
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000006', 3), -- Bioquímica
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000006', 4), -- Fisiología
  -- ADM = Administración de Negocios
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007', 1), -- Cálculo Dif
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000007', 2), -- Prob & Est
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000007', 1), -- Contabilidad
  ('b1000000-0000-0000-0000-000000000034', 'a1000000-0000-0000-0000-000000000007', 2), -- Microeconomía
  ('b1000000-0000-0000-0000-000000000035', 'a1000000-0000-0000-0000-000000000007', 3), -- Macroeconomía
  ('b1000000-0000-0000-0000-000000000036', 'a1000000-0000-0000-0000-000000000007', 5), -- Finanzas Corp.
  -- ECO = Economía
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000008', 1), -- Cálculo Dif
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', 2), -- Cálculo Int
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000008', 2), -- Prob & Est
  ('b1000000-0000-0000-0000-000000000033', 'a1000000-0000-0000-0000-000000000008', 1), -- Contabilidad
  ('b1000000-0000-0000-0000-000000000034', 'a1000000-0000-0000-0000-000000000008', 1), -- Microeconomía
  ('b1000000-0000-0000-0000-000000000035', 'a1000000-0000-0000-0000-000000000008', 2), -- Macroeconomía
  ('b1000000-0000-0000-0000-000000000036', 'a1000000-0000-0000-0000-000000000008', 5), -- Finanzas Corp.
  -- MED = Medicina
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000009', 1), -- Química
  ('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000009', 1), -- Anatomía
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000009', 2), -- Bioquímica
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000009', 3), -- Fisiología
  -- PSI = Psicología
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000010', 2), -- Prob & Est
  ('b1000000-0000-0000-0000-000000000037', 'a1000000-0000-0000-0000-000000000010', 1), -- Psicología Gral.
  ('b1000000-0000-0000-0000-000000000038', 'a1000000-0000-0000-0000-000000000010', 3), -- Neurociencias
  -- DEP = Ciencias del Deporte
  ('b1000000-0000-0000-0000-000000000031', 'a1000000-0000-0000-0000-000000000011', 2), -- Bioquímica
  ('b1000000-0000-0000-0000-000000000032', 'a1000000-0000-0000-0000-000000000011', 2), -- Fisiología
  ('b1000000-0000-0000-0000-000000000039', 'a1000000-0000-0000-0000-000000000011', 3); -- Fisiología del Ejercicio

-- ─── 4. Tutores ───────────────────────────────────────────────────────────────
INSERT INTO tutores (id, nombre, email, telefono, bio, calificacion, total_sesiones, google_calendar_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'María García López',        'maria.garcia@tutopool.com',    '+57 301 234 5678', 'Ingeniera de Sistemas con 5 años de experiencia docente. Especialista en programación y bases de datos.', 4.8, 120, NULL),
  ('c1000000-0000-0000-0000-000000000002', 'Carlos Rodríguez Martínez', 'carlos.rodriguez@tutopool.com','+57 302 345 6789', 'Magíster en Matemáticas Aplicadas. Tutor certificado enfocado en cálculo, álgebra y física.', 4.9, 200, NULL),
  ('c1000000-0000-0000-0000-000000000003', 'Ana Sofía Hernández',       'ana.hernandez@tutopool.com',   '+57 303 456 7890', 'Administradora de empresas con MBA. Especialista en finanzas, contabilidad y economía.', 4.7, 85, NULL),
  ('c1000000-0000-0000-0000-000000000004', 'Dr. Javier Morales',        'javier.morales@tutopool.com',  '+57 304 567 8901', 'Médico internista. 8 años como tutor de ciencias básicas médicas y biomédicas.', 4.9, 150, NULL),
  ('c1000000-0000-0000-0000-000000000005', 'Valentina Torres Pérez',    'valentina.torres@tutopool.com','+57 305 678 9012', 'Ingeniería Electrónica con maestría en sistemas embebidos. Tutora de circuitos y señales.', 4.6, 70, NULL),
  ('c1000000-0000-0000-0000-000000000006', 'Sebastián Ospina Ríos',     'sebastian.ospina@tutopool.com','+57 306 789 0123', 'Ingeniero Civil con énfasis en estructuras. Tutor de mecánica, resistencia y fluidos.', 4.8, 95, NULL);

-- ─── 5. Tutor-Materias ────────────────────────────────────────────────────────
INSERT INTO tutor_materias (tutor_id, materia_id) VALUES
  -- María: programación, BD, algoritmos
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000010'),
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000011'),
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000012'),
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000013'),
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000014'),
  -- Carlos: cálculo, álgebra, física, ecuaciones dif
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000007'),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008'),
  -- Ana: contabilidad, microeconomía, macroeconomía, finanzas, probabilidad
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000033'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000034'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000035'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000036'),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006'),
  -- Dr. Javier: anatomía, bioquímica, fisiología
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000030'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000031'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000032'),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000039'),
  -- Valentina: circuitos, señales, electrónica
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000027'),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000028'),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000029'),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000008'),
  -- Sebastián: resistencia, mec. fluidos, termodinámica, estática
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000021'),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000022'),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000023'),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000024'),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000025');

-- ─── 6. Sesiones ─────────────────────────────────────────────────────────────
INSERT INTO sesiones (id, materia_id, tutor_id, tipo, formato, estado, fecha_inicio, fecha_fin, ubicacion, enlace_virtual, precio_individual, precio_grupal, min_estudiantes, max_estudiantes, notas) VALUES
  ('d1000000-0000-0000-0000-000000000001',
   'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'grupal', 'presencial', 'esperando_cupos',
   now() + interval '2 days', now() + interval '2 days' + interval '2 hours',
   'Biblioteca Central, Sala 3B', NULL, 45000, 27000, 2, 5,
   'Revisión de límites, regla de L''Hôpital y derivadas parciales.'),
  ('d1000000-0000-0000-0000-000000000002',
   'b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002',
   'grupal', 'virtual', 'esperando_cupos',
   now() + interval '3 days', now() + interval '3 days' + interval '1 hours' + interval '30 minutes',
   NULL, 'https://meet.google.com/tutopool-calculo', 40000, 24000, 2, 6,
   'Taller de optimización y criterio de la segunda derivada.'),
  ('d1000000-0000-0000-0000-000000000003',
   'b1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000001',
   'grupal', 'presencial', 'confirmada',
   now() + interval '1 day', now() + interval '1 day' + interval '2 hours',
   'Lab. Computación Bloque 4, Piso 2', NULL, 50000, 30000, 2, 4,
   'Proyecto final: repaso de POO, herencia y polimorfismo con Python.'),
  ('d1000000-0000-0000-0000-000000000004',
   'b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002',
   'grupal', 'virtual', 'esperando_cupos',
   now() + interval '4 days', now() + interval '4 days' + interval '2 hours',
   NULL, 'https://meet.google.com/tutopool-algebra', 48000, 29000, 3, 6,
   'Diagonalización de matrices, valores y vectores propios.'),
  ('d1000000-0000-0000-0000-000000000005',
   'b1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000001',
   'grupal', 'presencial', 'esperando_cupos',
   now() + interval '5 days', now() + interval '5 days' + interval '2 hours',
   'Biblioteca Central, Sala 2A', NULL, 55000, 33000, 2, 5,
   'Normalización hasta 3FN y consultas JOIN avanzadas.'),
  ('d1000000-0000-0000-0000-000000000006',
   'b1000000-0000-0000-0000-000000000033', 'c1000000-0000-0000-0000-000000000003',
   'grupal', 'presencial', 'confirmada',
   now() + interval '2 days', now() + interval '2 days' + interval '1 hours' + interval '30 minutes',
   'Aula 201, Bloque Administrativo', NULL, 42000, 25000, 2, 5,
   'Preparación para parcial: libro diario, mayor y balance de comprobación.'),
  ('d1000000-0000-0000-0000-000000000007',
   'b1000000-0000-0000-0000-000000000030', 'c1000000-0000-0000-0000-000000000004',
   'grupal', 'presencial', 'esperando_cupos',
   now() + interval '3 days', now() + interval '3 days' + interval '3 hours',
   'Anfiteatro de Anatomía, Edificio Médico', NULL, 60000, 36000, 3, 6,
   'Repaso del sistema musculoesquelético con modelos anatómicos y atlas.'),
  ('d1000000-0000-0000-0000-000000000008',
   'b1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000001',
   'grupal', 'virtual', 'esperando_cupos',
   now() + interval '6 days', now() + interval '6 days' + interval '2 hours',
   NULL, 'https://meet.google.com/tutopool-ed', 52000, 31000, 2, 5,
   'Implementación de árboles AVL y recorridos DFS/BFS en grafos.');
