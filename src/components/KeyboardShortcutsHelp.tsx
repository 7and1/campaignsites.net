export function KeyboardShortcutsHelp() {
  return (
    <div className="rounded-lg border border-mist-200 bg-mist-50 p-4">
      <h3 className="text-sm font-semibold text-ink-900">Keyboard Shortcuts</h3>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <dt className="text-ink-600">Undo</dt>
          <dd className="font-mono text-ink-900">Ctrl+Z</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-600">Redo</dt>
          <dd className="font-mono text-ink-900">Ctrl+Y</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-600">Copy result</dt>
          <dd className="font-mono text-ink-900">Ctrl+C</dd>
        </div>
      </dl>
    </div>
  )
}
