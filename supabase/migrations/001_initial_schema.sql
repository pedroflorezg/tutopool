-- TutoPool: schema inicial
-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tipos enum ──────────────────────────────────────────────────────────────
CREATE TYPE tipo_sesion      AS ENUM ('individual', 'grupal');
CREATE TYPE formato_sesion   AS ENUM ('presencial', 'virtual');
CREATE TYPE estado_sesion    AS ENUM ('esperando_cupos', 'confirmada', 'cancelada', 'notificacion_enviada', 'completada');
CREATE TYPE estado_solicitud AS ENUM ('pendiente', 'notificacion_enviada', 'confirmada', 'rechazada', 'cancelada');
CREATE TYPE estado_pago      AS ENUM ('pendiente', 'pagado', 'reembolsado');

-- ─── Tablas (orden que respeta foreign keys) ─────────────────────────────────

CREATE TABLE public.programas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL UNIQUE,
  facultad    text,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE public.tutores (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid REFERENCES auth.users(id),
  nombre                  text NOT NULL,
  email                   text NOT NULL,
  telefono                text,
  foto_url                text,
  bio                     text,
  calificacion            numeric DEFAULT 5.0 CHECK (calificacion BETWEEN 1 AND 5),
  total_sesiones          integer DEFAULT 0,
  google_calendar_url     text,
  disponibilidad          jsonb DEFAULT '[]'::jsonb,
  activo                  boolean DEFAULT true,
  precio_base_presencial  numeric DEFAULT 30000,
  precio_base_virtual     numeric DEFAULT 25000,
  precio_minuto           numeric DEFAULT 500,
  created_at              timestamptz DEFAULT now()
);

CREATE TABLE public.materias (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  codigo      text UNIQUE,
  semestre    integer NOT NULL CHECK (semestre BETWEEN 1 AND 12),
  programa_id uuid REFERENCES public.programas(id),
  descripcion text,
  creditos    integer DEFAULT 3,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE public.tutor_materias (
  tutor_id    uuid NOT NULL REFERENCES public.tutores(id),
  materia_id  uuid NOT NULL REFERENCES public.materias(id),
  PRIMARY KEY (tutor_id, materia_id)
);

CREATE TABLE public.sesiones (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  materia_id       uuid NOT NULL REFERENCES public.materias(id),
  tutor_id         uuid REFERENCES public.tutores(id),
  tipo             tipo_sesion    NOT NULL DEFAULT 'grupal',
  formato          formato_sesion NOT NULL DEFAULT 'presencial',
  estado           estado_sesion  NOT NULL DEFAULT 'esperando_cupos',
  fecha_inicio     timestamptz NOT NULL,
  fecha_fin        timestamptz NOT NULL,
  ubicacion        text,
  enlace_virtual   text,
  precio_individual numeric NOT NULL,
  precio_grupal    numeric,
  min_estudiantes  integer DEFAULT 2,
  max_estudiantes  integer DEFAULT 5,
  notas            text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE TABLE public.inscripciones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id      uuid NOT NULL REFERENCES public.sesiones(id),
  estudiante_id  uuid NOT NULL REFERENCES auth.users(id),
  estado_pago    estado_pago NOT NULL DEFAULT 'pendiente',
  precio_pagado  numeric,
  metodo_pago    text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE public.solicitudes_tutoria (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id       uuid NOT NULL REFERENCES auth.users(id),
  materia_id          uuid NOT NULL REFERENCES public.materias(id),
  tipo                tipo_sesion    NOT NULL DEFAULT 'individual',
  formato             formato_sesion NOT NULL DEFAULT 'presencial',
  fecha_preferida     date NOT NULL,
  hora_preferida      time NOT NULL,
  notas               text,
  estado              estado_solicitud NOT NULL DEFAULT 'pendiente',
  sesion_asignada_id  uuid REFERENCES public.sesiones(id),
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);
