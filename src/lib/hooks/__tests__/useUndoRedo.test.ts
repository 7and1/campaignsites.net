import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUndoRedo } from '../useUndoRedo'

describe('useUndoRedo', () => {
  it('should initialize with the provided state', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }))
    expect(result.current.state).toEqual({ count: 0 })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should update state and enable undo', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }))

    act(() => {
      result.current.set({ count: 1 })
    })

    expect(result.current.state).toEqual({ count: 1 })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should undo to previous state', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }))

    act(() => {
      result.current.set({ count: 1 })
      result.current.set({ count: 2 })
    })

    act(() => {
      result.current.undo()
    })

    expect(result.current.state).toEqual({ count: 1 })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(true)
  })

  it('should redo to next state', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }))

    act(() => {
      result.current.set({ count: 1 })
      result.current.set({ count: 2 })
      result.current.undo()
    })

    act(() => {
      result.current.redo()
    })

    expect(result.current.state).toEqual({ count: 2 })
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should clear future when setting new state after undo', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }))

    act(() => {
      result.current.set({ count: 1 })
      result.current.set({ count: 2 })
      result.current.undo()
      result.current.set({ count: 3 })
    })

    expect(result.current.state).toEqual({ count: 3 })
    expect(result.current.canRedo).toBe(false)
  })

  it('should reset state and clear history', () => {
    const { result } = renderHook(() => useUndoRedo({ count: 0 }))

    act(() => {
      result.current.set({ count: 1 })
      result.current.set({ count: 2 })
      result.current.reset({ count: 0 })
    })

    expect(result.current.state).toEqual({ count: 0 })
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })
})
