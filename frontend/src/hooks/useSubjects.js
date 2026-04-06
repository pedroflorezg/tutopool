import { useState, useEffect } from 'react'
import {
  supabase,
  isDemoMode,
  DEMO_MATERIAS,
  DEMO_PROGRAMAS,
  DEMO_SESIONES
} from '../lib/supabase'

const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

export function useSubjects(filters = {}) {
  const [materias, setMaterias] = useState([])
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchProgramas() }, [])

  useEffect(() => { fetchMaterias() }, [filters.programaId, filters.semestre, filters.search])

  async function fetchProgramas() {
    if (isDemoMode) { setProgramas(DEMO_PROGRAMAS); return }
    try {
      const { data, error } = await supabase.from('programas').select('*').order('nombre')
      if (error) throw error
      setProgramas(data || [])
    } catch (err) { setError(err.message) }
  }

  async function fetchMaterias() {
    setLoading(true)
    setError(null)
    try {
      if (isDemoMode) {
        const materiasConTutores = new Set(DEMO_SESIONES?.map(s => s.materia_id) || [])
        let filtered = DEMO_MATERIAS.filter(m => materiasConTutores.has(m.id))
        if (filters.programaId) filtered = filtered.filter(m => m.programa_id === filters.programaId)
        if (filters.semestre)   filtered = filtered.filter(m => m.semestre === parseInt(filters.semestre))
        if (filters.search) {
          const q = normalize(filters.search)
          filtered = filtered.filter(m => normalize(m.nombre).includes(q) || normalize(m.codigo).includes(q))
        }
        filtered = filtered.map(m => ({
          ...m,
          programa_nombre: DEMO_PROGRAMAS.find(p => p.id === m.programa_id)?.nombre || '',
          tutores: [],
          openPools: 0,
        }))
        setMaterias(filtered)
        setLoading(false)
        return
      }

      // Fetch materias with tutors (inner join ensures only subjects with tutors)
      // and include tutor names via tutor_materias → tutores
      const { data, error } = await supabase
        .from('materias')
        .select(`
          id, nombre, codigo, descripcion, creditos,
          tutor_materias!inner(tutor_id, tutores(id, nombre, activo)),
          materia_programas(semestre, programa_id, programas(nombre))
        `)
        .order('nombre')
      if (error) throw error

      // Fetch open pools per materia in one query
      const { data: sesData } = await supabase
        .from('sesiones')
        .select('id, materia_id, estado')
        .in('estado', ['esperando_cupos', 'confirmada'])

      // Map materia_id → open pool count
      const openPoolsMap = {}
      ;(sesData || []).forEach(s => {
        openPoolsMap[s.materia_id] = (openPoolsMap[s.materia_id] || 0) + 1
      })

      // Deduplicate (inner join on tutor_materias can produce duplicates)
      const seen = new Set()
      let unique = (data || []).filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true })

      // Client-side filtering for programa
      if (filters.programaId) {
        unique = unique.filter(m =>
          m.materia_programas?.some(mp => mp.programa_id === filters.programaId)
        )
      }
      // Client-side filtering for semestre
      if (filters.semestre) {
        const sem = parseInt(filters.semestre)
        unique = unique.filter(m =>
          m.materia_programas?.some(mp => mp.semestre === sem)
        )
      }
      // Client-side accent-insensitive search
      if (filters.search) {
        const q = normalize(filters.search)
        unique = unique.filter(m => normalize(m.nombre).includes(q) || normalize(m.codigo || '').includes(q))
      }

      setMaterias(unique.map(m => {
        const mp = filters.programaId
          ? m.materia_programas?.find(mp => mp.programa_id === filters.programaId)
          : m.materia_programas?.[0]

        // Extract unique active tutors for this materia
        const seenTutors = new Set()
        const tutores = (m.tutor_materias || [])
          .map(tm => tm.tutores)
          .filter(t => t && t.activo && !seenTutors.has(t.id) && seenTutors.add(t.id))

        return {
          ...m,
          semestre: mp?.semestre ?? null,
          programa_nombre: mp?.programas?.nombre || '',
          tutores,
          openPools: openPoolsMap[m.id] || 0,
        }
      }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { materias, programas, loading, error, refetch: fetchMaterias }
}
