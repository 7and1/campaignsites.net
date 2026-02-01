'use client'

import { useState } from 'react'
import { Download, Copy, QrCode, Image as ImageIcon, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { copyToClipboard, downloadQRCode, exportElementAsImage, exportToCSV } from '@/lib/utils/export'
import { Tooltip } from './ui/Tooltip'

interface ExportOption {
  id: string
  label: string
  icon: React.ReactNode
  action: () => Promise<void>
}

interface ToolExportMenuProps {
  toolName: string
  exportOptions: {
    csv?: {
      data: Record<string, unknown>[]
      filename: string
    }
    qrCode?: {
      text: string
      filename: string
    }
    clipboard?: {
      text: string
    }
    image?: {
      elementId: string
      filename: string
    }
  }
  className?: string
}

export function ToolExportMenu({ exportOptions, className }: ToolExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const options: ExportOption[] = []

  if (exportOptions.clipboard) {
    options.push({
      id: 'clipboard',
      label: 'Copy to Clipboard',
      icon: <Copy className="h-4 w-4" />,
      action: async () => {
        const success = await copyToClipboard(exportOptions.clipboard!.text)
        if (success) {
          toast.success('Copied to clipboard')
        } else {
          toast.error('Failed to copy to clipboard')
        }
      },
    })
  }

  if (exportOptions.csv) {
    options.push({
      id: 'csv',
      label: 'Export as CSV',
      icon: <FileText className="h-4 w-4" />,
      action: async () => {
        try {
          await exportToCSV(exportOptions.csv!.data, exportOptions.csv!.filename)
          toast.success('CSV exported successfully')
        } catch {
          toast.error('Failed to export CSV')
        }
      },
    })
  }

  if (exportOptions.qrCode) {
    options.push({
      id: 'qrcode',
      label: 'Download QR Code',
      icon: <QrCode className="h-4 w-4" />,
      action: async () => {
        try {
          await downloadQRCode(exportOptions.qrCode!.text, exportOptions.qrCode!.filename)
          toast.success('QR code downloaded')
        } catch {
          toast.error('Failed to generate QR code')
        }
      },
    })
  }

  if (exportOptions.image) {
    options.push({
      id: 'image',
      label: 'Download as Image',
      icon: <ImageIcon className="h-4 w-4" />,
      action: async () => {
        try {
          const element = document.getElementById(exportOptions.image!.elementId)
          if (!element) {
            toast.error('Element not found')
            return
          }
          await exportElementAsImage(element, exportOptions.image!.filename)
          toast.success('Image downloaded')
        } catch {
          toast.error('Failed to export image')
        }
      },
    })
  }

  if (options.length === 0) return null

  return (
    <div className={cn('relative', className)}>
      <Tooltip content="Export options">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 rounded-full border border-mist-300 bg-white px-4 py-2 text-sm font-medium text-ink-900 transition hover:bg-mist-50"
          aria-label="Export options"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </Tooltip>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-mist-200 bg-white shadow-lg">
            <div className="p-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={async () => {
                    setIsOpen(false)
                    await option.action()
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink-900 transition hover:bg-mist-50"
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
