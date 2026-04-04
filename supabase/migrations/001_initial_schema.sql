-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.inscripciones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sesion_id uuid NOT NULL,
  estudiante_id uuid NOT NULL,
  estado_pago USER-DEFINED NOT NULL DEFAULT 'pendiente'::estado_pago,
  precio_pagado numeric,
  metodo_pago text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inscripciones_pkey PRIMARY KEY (id),
  CONSTRAINT inscripciones_sesion_id_fkey FOREIGN KEY (sesion_id) REFERENCES public.sesiones(id),
  CONSTRAINT inscripciones_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES auth.users(id)
);
CREATE TABLE public.materias (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  codigo text UNIQUE,
  semestre integer NOT NULL CHECK (semestre >= 1 AND semestre <= 12),
  programa_id uuid,
  descripcion text,
  creditos integer DEFAULT 3,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT materias_pkey PRIMARY KEY (id),
  CONSTRAINT materias_programa_id_fkey FOREIGN KEY (programa_id) REFERENCES public.programas(id)
);
CREATE TABLE public.programas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL UNIQUE,
  facultad text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT programas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sesiones (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  materia_id uuid NOT NULL,
  tutor_id uuid,
  tipo USER-DEFINED NOT NULL DEFAULT 'grupal'::tipo_sesion,
  formato USER-DEFINED NOT NULL DEFAULT 'presencial'::formato_sesion,
  estado USER-DEFINED NOT NULL DEFAULT 'esperando_cupos'::estado_sesion,
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone NOT NULL,
  ubicacion text,
  enlace_virtual text,
  precio_individual numeric NOT NULL,
  min_estudiantes integer DEFAULT 2,
  max_estudiantes integer DEFAULT 5, -- REDUCIDO A 5 PERSONAS POR SESIÓN
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  precio_grupal numeric,
  CONSTRAINT sesiones_pkey PRIMARY KEY (id),
  CONSTRAINT sesiones_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT sesiones_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id)
);
CREATE TABLE public.solicitudes_tutoria (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  estudiante_id uuid NOT NULL,
  materia_id uuid NOT NULL,
  tipo USER-DEFINED NOT NULL DEFAULT 'individual'::tipo_sesion,
  formato USER-DEFINED NOT NULL DEFAULT 'presencial'::formato_sesion,
  fecha_preferida date NOT NULL,
  hora_preferida time without time zone NOT NULL,
  notas text,
  estado USER-DEFINED NOT NULL DEFAULT 'pendiente'::estado_solicitud,
  sesion_asignada_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT solicitudes_tutoria_pkey PRIMARY KEY (id),
  CONSTRAINT solicitudes_tutoria_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES auth.users(id),
  CONSTRAINT solicitudes_tutoria_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT solicitudes_tutoria_sesion_asignada_id_fkey FOREIGN KEY (sesion_asignada_id) REFERENCES public.sesiones(id)
);
CREATE TABLE public.tutor_materias (
  tutor_id uuid NOT NULL,
  materia_id uuid NOT NULL,
  CONSTRAINT tutor_materias_pkey PRIMARY KEY (tutor_id, materia_id),
  CONSTRAINT tutor_materias_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT tutor_materias_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.tutores(id)
);
CREATE TABLE public.tutores (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  foto_url text,
  bio text,
  calificacion numeric DEFAULT 5.0 CHECK (calificacion >= 1::numeric AND calificacion <= 5::numeric),
  total_sesiones integer DEFAULT 0,
  google_calendar_url text,
  disponibilidad jsonb DEFAULT '[]'::jsonb,
  activo boolean DEFAULT true,
  precio_base_presencial numeric DEFAULT 30000, -- NUEVO ESQUEMA DE COBROS
  precio_base_virtual numeric DEFAULT 25000,    -- NUEVO ESQUEMA DE COBROS
  precio_minuto numeric DEFAULT 500,            -- NUEVO ESQUEMA DE COBROS
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tutores_pkey PRIMARY KEY (id),
  CONSTRAINT tutores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);