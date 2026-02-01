'use client'

import { Undo2, Redo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from './ui/Tooltip'

interface UndoRedoControlsProps {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  className?: string
}

export function UndoRedoControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  className,
}: UndoRedoControlsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Tooltip content="Undo (Ctrl+Z)">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={cn(
            'inline-flex items-center justify-center rounded-lg border border-mist-300 bg-white p-2 transition',
            canUndo
              ? 'text-ink-900 hover:bg-mist-50'
              : 'cursor-not-allowed text-mist-400 opacity-50'
          )}
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
      </Tooltip>

      <Tooltip content="Redo (Ctrl+Y)">
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={cn(
            'inline-flex items-center justify-center rounded-lg border border-mist-300 bg-white p-2 transition',
            canRedo
              ? 'text-ink-900 hover:bg-mist-50'
              : 'cursor-not-allowed text-mist-400 opacity-50'
          )}
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  )
}
