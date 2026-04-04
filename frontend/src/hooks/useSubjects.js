import { useState, useEffect } from 'react'
import {
  supabase,
  isDemoMode,
  DEMO_MATERIAS,
  DEMO_PROGRAMAS,
  DEMO_SESIONES
} from '../lib/supabase'

// Función auxiliar para quitar tildes y normalizar textos
const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function useSubjects(filters = {}) {
  const [materias, setMaterias] = useState([])
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProgramas()
  }, [])

  useEffect(() => {
    fetchMaterias()
  }, [filters.programaId, filters.semestre, filters.search])

  async function fetchProgramas() {
    if (isDemoMode) {
      setProgramas(DEMO_PROGRAMAS)
      return
    }
    try {
      const { data, error } = await supabase
        .from('programas')
        .select('*')
        .order('nombre')
      if (error) throw error
      setProgramas(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  async function fetchMaterias() {
    setLoading(true)
    setError(null)
    try {
      if (isDemoMode) {
        // Filtrar solo materias que tienen al menos un tutor activo u oferta docente 
        // (En demo: aquellas que tienen al menos una sesión registrada)
        const materiasConTutores = new Set(DEMO_SESIONES?.map(s => s.materia_id) || [])
        let filtered = DEMO_MATERIAS.filter(m => materiasConTutores.has(m.id))

        if (filters.programaId) {
          filtered = filtered.filter(m => m.programa_id === filters.programaId)
        }
        if (filters.semestre) {
          filtered = filtered.filter(m => m.semestre === parseInt(filters.semestre))
        }
        if (filters.search) {
          const q = normalize(filters.search)
          // Búsqueda inteligente ignorando tildes y minúsculas
          filtered = filtered.filter(
            m => normalize(m.nombre).includes(q) || normalize(m.codigo).includes(q)
          )
        }

        filtered = filtered.map(m => ({
          ...m,
          programa_nombre: DEMO_PROGRAMAS.find(p => p.id === m.programa_id)?.nombre || ''
        }))
        setMaterias(filtered)
        setLoading(false)
        return
      }

      // Supabase Query: inner join con tutor_materias para OCULTAR materias sin oferta docente
      let query = supabase
        .from('materias')
        .select('*, programas(nombre), tutor_materias!inner(tutor_id)')
        .order('semestre')
        .order('nombre')

      if (filters.programaId) {
        query = query.eq('programa_id', filters.programaId)
      }
      if (filters.semestre) {
        query = query.eq('semestre', parseInt(filters.semestre))
      }
      if (filters.search) {
        // En un entorno real se recomienda usar una función RPC en supabase que soporte unaccent
        query = query.or(`nombre.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      // Eliminamos duplicados producidos por el inner join si un material tiene varios tutores
      const uniqueData = Array.from(new Set(data.map(m => m.id)))
        .map(id => data.find(m => m.id === id));

      setMaterias(
        (uniqueData || []).map(m => ({
          ...m,
          programa_nombre: m.programas?.nombre || ''
        }))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { materias, programas, loading, error, refetch: fetchMaterias }
}