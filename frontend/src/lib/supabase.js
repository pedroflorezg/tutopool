import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// For demo mode when Supabase is not configured
export const isDemoMode = !supabaseUrl || supabaseUrl === 'https://your-project.supabase.co'

export const supabase = isDemoMode
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)

// ============================================================
// DEMO DATA (used when Supabase is not configured)
// ============================================================

export const DEMO_PROGRAMAS = [
  { id: 'a1000000-0000-0000-0000-000000000001', nombre: 'Ingeniería de Sistemas', facultad: 'Facultad de Ingeniería' },
  { id: 'a1000000-0000-0000-0000-000000000002', nombre: 'Administración de Empresas', facultad: 'Facultad de Ciencias Económicas' },
  { id: 'a1000000-0000-0000-0000-000000000003', nombre: 'Medicina', facultad: 'Facultad de Ciencias de la Salud' },
]

export const DEMO_MATERIAS = [
  { id: 'b1000000-0000-0000-0000-000000000001', nombre: 'Cálculo Diferencial', codigo: 'MAT101', semestre: 1, programa_id: 'a1000000-0000-0000-0000-000000000001', descripcion: 'Fundamentos de cálculo: límites, derivadas y sus aplicaciones.', creditos: 4 },
  { id: 'b1000000-0000-0000-0000-000000000002', nombre: 'Programación I', codigo: 'SIS101', semestre: 1, programa_id: 'a1000000-0000-0000-0000-000000000001', descripcion: 'Introducción a la programación con Python.', creditos: 3 },
  { id: 'b1000000-0000-0000-0000-000000000003', nombre: 'Álgebra Lineal', codigo: 'MAT201', semestre: 2, programa_id: 'a1000000-0000-0000-0000-000000000001', descripcion: 'Espacios vectoriales, matrices y transformaciones lineales.', creditos: 4 },
  { id: 'b1000000-0000-0000-0000-000000000004', nombre: 'Estructuras de Datos', codigo: 'SIS201', semestre: 3, programa_id: 'a1000000-0000-0000-0000-000000000001', descripcion: 'Listas, árboles, grafos y algoritmos de búsqueda.', creditos: 4 },
  { id: 'b1000000-0000-0000-0000-000000000005', nombre: 'Bases de Datos', codigo: 'SIS301', semestre: 4, programa_id: 'a1000000-0000-0000-0000-000000000001', descripcion: 'Diseño relacional, SQL y normalización.', creditos: 3 },
  { id: 'b1000000-0000-0000-0000-000000000006', nombre: 'Contabilidad General', codigo: 'ADM101', semestre: 1, programa_id: 'a1000000-0000-0000-0000-000000000002', descripcion: 'Principios contables y estados financieros.', creditos: 3 },
  { id: 'b1000000-0000-0000-0000-000000000007', nombre: 'Microeconomía', codigo: 'ADM201', semestre: 2, programa_id: 'a1000000-0000-0000-0000-000000000002', descripcion: 'Oferta, demanda y equilibrio de mercados.', creditos: 3 },
  { id: 'b1000000-0000-0000-0000-000000000008', nombre: 'Estadística I', codigo: 'ADM301', semestre: 3, programa_id: 'a1000000-0000-0000-0000-000000000002', descripcion: 'Probabilidad, distribuciones y pruebas de hipótesis.', creditos: 4 },
  { id: 'b1000000-0000-0000-0000-000000000009', nombre: 'Anatomía I', codigo: 'MED101', semestre: 1, programa_id: 'a1000000-0000-0000-0000-000000000003', descripcion: 'Estructura del cuerpo humano: huesos, músculos y órganos.', creditos: 5 },
  { id: 'b1000000-0000-0000-0000-000000000010', nombre: 'Bioquímica', codigo: 'MED201', semestre: 2, programa_id: 'a1000000-0000-0000-0000-000000000003', descripcion: 'Biomoléculas, metabolismo y enzimas.', creditos: 4 },
  { id: 'b1000000-0000-0000-0000-000000000011', nombre: 'Fisiología', codigo: 'MED301', semestre: 3, programa_id: 'a1000000-0000-0000-0000-000000000003', descripcion: 'Funciones de sistemas corporales.', creditos: 5 },
  { id: 'b1000000-0000-0000-0000-000000000012', nombre: 'Cálculo Integral', codigo: 'MAT102', semestre: 2, programa_id: 'a1000000-0000-0000-0000-000000000001', descripcion: 'Integrales, técnicas de integración y aplicaciones.', creditos: 4 },
]

const addDays = (days) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

const addDaysHours = (days, hours) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(d.getHours() + hours)
  return d.toISOString()
}

export const DEMO_TUTORES = [
  { id: 'c1000000-0000-0000-0000-000000000001', nombre: 'María García López', email: 'maria.garcia@tutopool.com', bio: 'Ingeniera de Sistemas con 5 años de experiencia docente. Especialista en matemáticas y programación.', calificacion: 4.8, total_sesiones: 120, foto_url: null, precio_base_presencial: 30000, precio_base_virtual: 20000, precio_minuto: 400 },
  { id: 'c1000000-0000-0000-0000-000000000002', nombre: 'Carlos Rodríguez Martínez', email: 'carlos.rodriguez@tutopool.com', bio: 'Magíster en Matemáticas Aplicadas. Tutor certificado con enfoque en resolución de problemas.', calificacion: 4.9, total_sesiones: 200, foto_url: null, precio_base_presencial: 35000, precio_base_virtual: 25000, precio_minuto: 500 },
  { id: 'c1000000-0000-0000-0000-000000000003', nombre: 'Ana Sofía Hernández', email: 'ana.hernandez@tutopool.com', bio: 'Administradora de empresas con MBA. Especialista en finanzas y contabilidad.', calificacion: 4.7, total_sesiones: 85, foto_url: null, precio_base_presencial: 28000, precio_base_virtual: 22000, precio_minuto: 350 },
  { id: 'c1000000-0000-0000-0000-000000000004', nombre: 'Dr. Javier Morales', email: 'javier.morales@tutopool.com', bio: 'Médico internista. 8 años como tutor de ciencias básicas médicas.', calificacion: 4.9, total_sesiones: 150, foto_url: null, precio_base_presencial: 40000, precio_base_virtual: 30000, precio_minuto: 600 },
]

// Precio grupal = 60% del precio individual, redondeado a centenas
export const calcPrecioGrupal = (precioIndividual) =>
  Math.round(precioIndividual * 0.6 / 100) * 100

export const DEMO_SESIONES = [
  { id: 'd1000000-0000-0000-0000-000000000001', materia_id: 'b1000000-0000-0000-0000-000000000001', tutor_id: 'c1000000-0000-0000-0000-000000000002', tipo: 'grupal', formato: 'presencial', estado: 'esperando_cupos', fecha_inicio: addDays(2), fecha_fin: addDaysHours(2, 2), ubicacion: 'Biblioteca Central, Sala 3B', enlace_virtual: null, precio_individual: 45000, min_estudiantes: 2, max_estudiantes: 5, notas: 'Revisión de derivadas parciales y regla de la cadena.', inscritos_actuales: 1, tutor_nombre: 'Carlos Rodríguez Martínez', tutor_calificacion: 4.9, materia_nombre: 'Cálculo Diferencial', materia_codigo: 'MAT101' },
  { id: 'd1000000-0000-0000-0000-000000000002', materia_id: 'b1000000-0000-0000-0000-000000000001', tutor_id: 'c1000000-0000-0000-0000-000000000001', tipo: 'grupal', formato: 'virtual', estado: 'esperando_cupos', fecha_inicio: addDays(3), fecha_fin: addDaysHours(3, 1.5), ubicacion: null, enlace_virtual: 'https://meet.google.com/abc-xyz', precio_individual: 40000, min_estudiantes: 2, max_estudiantes: 5, notas: 'Taller de límites al infinito.', inscritos_actuales: 3, tutor_nombre: 'María García López', tutor_calificacion: 4.8, materia_nombre: 'Cálculo Diferencial', materia_codigo: 'MAT101' },
  { id: 'd1000000-0000-0000-0000-000000000003', materia_id: 'b1000000-0000-0000-0000-000000000002', tutor_id: 'c1000000-0000-0000-0000-000000000001', tipo: 'grupal', formato: 'presencial', estado: 'confirmada', fecha_inicio: addDays(1), fecha_fin: addDaysHours(1, 2), ubicacion: 'Lab. Computación, Bloque 4', enlace_virtual: null, precio_individual: 50000, min_estudiantes: 2, max_estudiantes: 5, notas: 'Proyecto final: repaso de POO con Python.', inscritos_actuales: 3, tutor_nombre: 'María García López', tutor_calificacion: 4.8, materia_nombre: 'Programación I', materia_codigo: 'SIS101' },
  { id: 'd1000000-0000-0000-0000-000000000004', materia_id: 'b1000000-0000-0000-0000-000000000003', tutor_id: 'c1000000-0000-0000-0000-000000000002', tipo: 'grupal', formato: 'virtual', estado: 'esperando_cupos', fecha_inicio: addDays(4), fecha_fin: addDaysHours(4, 2), ubicacion: null, enlace_virtual: 'https://meet.google.com/def-uvw', precio_individual: 48000, min_estudiantes: 3, max_estudiantes: 5, notas: 'Diagonalización de matrices y valores propios.', inscritos_actuales: 2, tutor_nombre: 'Carlos Rodríguez Martínez', tutor_calificacion: 4.9, materia_nombre: 'Álgebra Lineal', materia_codigo: 'MAT201' },
  { id: 'd1000000-0000-0000-0000-000000000005', materia_id: 'b1000000-0000-0000-0000-000000000005', tutor_id: 'c1000000-0000-0000-0000-000000000001', tipo: 'grupal', formato: 'presencial', estado: 'esperando_cupos', fecha_inicio: addDays(5), fecha_fin: addDaysHours(5, 2), ubicacion: 'Biblioteca Central, Sala 2A', enlace_virtual: null, precio_individual: 55000, min_estudiantes: 2, max_estudiantes: 5, notas: 'Normalización y consultas JOIN avanzadas.', inscritos_actuales: 1, tutor_nombre: 'María García López', tutor_calificacion: 4.8, materia_nombre: 'Bases de Datos', materia_codigo: 'SIS301' },
  { id: 'd1000000-0000-0000-0000-000000000006', materia_id: 'b1000000-0000-0000-0000-000000000006', tutor_id: 'c1000000-0000-0000-0000-000000000003', tipo: 'grupal', formato: 'presencial', estado: 'confirmada', fecha_inicio: addDays(2), fecha_fin: addDaysHours(2, 1.5), ubicacion: 'Aula 201, Bloque Administrativo', enlace_virtual: null, precio_individual: 42000, min_estudiantes: 2, max_estudiantes: 5, notas: 'Preparación para parcial: libro diario y balance general.', inscritos_actuales: 4, tutor_nombre: 'Ana Sofía Hernández', tutor_calificacion: 4.7, materia_nombre: 'Contabilidad General', materia_codigo: 'ADM101' },
  { id: 'd1000000-0000-0000-0000-000000000007', materia_id: 'b1000000-0000-0000-0000-000000000009', tutor_id: 'c1000000-0000-0000-0000-000000000004', tipo: 'grupal', formato: 'presencial', estado: 'esperando_cupos', fecha_inicio: addDays(3), fecha_fin: addDaysHours(3, 3), ubicacion: 'Anfiteatro de Anatomía', enlace_virtual: null, precio_individual: 60000, min_estudiantes: 3, max_estudiantes: 5, notas: 'Repaso de sistema musculoesquelético con modelos anatómicos.', inscritos_actuales: 2, tutor_nombre: 'Dr. Javier Morales', tutor_calificacion: 4.9, materia_nombre: 'Anatomía I', materia_codigo: 'MED101' },
  { id: 'd1000000-0000-0000-0000-000000000008', materia_id: 'b1000000-0000-0000-0000-000000000004', tutor_id: 'c1000000-0000-0000-0000-000000000002', tipo: 'grupal', formato: 'virtual', estado: 'esperando_cupos', fecha_inicio: addDays(6), fecha_fin: addDaysHours(6, 2), ubicacion: null, enlace_virtual: 'https://meet.google.com/ghi-rst', precio_individual: 52000, min_estudiantes: 2, max_estudiantes: 5, notas: 'Implementación de árboles AVL y grafos.', inscritos_actuales: 1, tutor_nombre: 'Carlos Rodríguez Martínez', tutor_calificacion: 4.9, materia_nombre: 'Estructuras de Datos', materia_codigo: 'SIS201' },
]

