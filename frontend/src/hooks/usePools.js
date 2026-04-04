import { useState, useEffect } from 'react'
import {
  supabase,
  isDemoMode,
  DEMO_SESIONES,
  DEMO_TUTORES
} from '../lib/supabase'

export function usePools(materiaId) {
  const [pools, setPools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (materiaId) {
      fetchPools()
    }
  }, [materiaId])

  async function fetchPools() {
    setLoading(true)
    setError(null)
    try {
      if (isDemoMode) {
        const filtered = DEMO_SESIONES.filter(s => s.materia_id === materiaId)
        setPools(filtered)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('pools_abiertos')
        .select('*')
        .eq('materia_id', materiaId)
        .order('fecha_inicio')

      if (error) throw error
      setPools(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { pools, loading, error, refetch: fetchPools }
}

export function usePoolDetail(poolId) {
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (poolId) fetchPool()
  }, [poolId])

  async function fetchPool() {
    setLoading(true)
    try {
      if (isDemoMode) {
        const found = DEMO_SESIONES.find(s => s.id === poolId)
        if (found) {
          const tutor = DEMO_TUTORES.find(t => t.id === found.tutor_id)
          setPool({ ...found, tutor })
        }
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('pools_abiertos')
        .select('*')
        .eq('id', poolId)
        .single()

      if (error) throw error
      setPool(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { pool, loading }
}
