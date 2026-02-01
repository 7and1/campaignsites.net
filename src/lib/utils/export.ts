import html2canvas from 'html2canvas'
import QRCode from 'qrcode'

export async function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header]
        const stringValue = value?.toString() || ''
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    return false
  }
}

export async function generateQRCode(text: string, size = 256): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  } catch (err) {
    console.error('Failed to generate QR code:', err)
    throw err
  }
}

export async function downloadQRCode(text: string, filename: string) {
  const dataUrl = await generateQRCode(text, 512)
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}

export async function exportElementAsImage(
  element: HTMLElement,
  filename: string,
  options?: {
    backgroundColor?: string
    scale?: number
  }
) {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: options?.backgroundColor || '#ffffff',
      scale: options?.scale || 2,
      logging: false,
      useCORS: true,
    })

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    })
  } catch (err) {
    console.error('Failed to export as image:', err)
    throw err
  }
}
