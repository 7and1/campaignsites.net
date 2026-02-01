import { useState, useEffect, useCallback } from 'react'

interface AutoSaveOptions<T> {
  key: string
  data: T
  delay?: number
  onSave?: (data: T) => void
}

export function useAutoSave<T>({ key, data, delay = 2000, onSave }: AutoSaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const save = useCallback(() => {
    setIsSaving(true)
    try {
      localStorage.setItem(key, JSON.stringify(data))
      setLastSaved(new Date())
      onSave?.(data)
    } catch (err) {
      console.error('Failed to auto-save:', err)
    } finally {
      setIsSaving(false)
    }
  }, [key, data, onSave])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      save()
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [data, delay, save])

  const loadSaved = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : null
    } catch (err) {
      console.error('Failed to load saved data:', err)
      return null
    }
  }, [key])

  const clearSaved = useCallback(() => {
    localStorage.removeItem(key)
    setLastSaved(null)
  }, [key])

  return {
    isSaving,
    lastSaved,
    loadSaved,
    clearSaved,
    forceSave: save,
  }
}
