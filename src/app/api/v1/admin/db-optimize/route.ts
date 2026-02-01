import { NextResponse } from 'next/server'
import { withMonitoring } from '@/lib/monitoring'
import { logError } from '@/lib/errors'
import { addDatabaseIndexes, getDatabaseStats, vacuumDatabase } from '@/lib/db-optimization'

/**
 * Database optimization endpoint
 * Run migrations and optimizations
 */
async function handler(request: Request) {
  try {
    // Verify admin access
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.ADMIN_SECRET || process.env.PAYLOAD_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'stats'

    switch (action) {
      case 'indexes':
        await addDatabaseIndexes()
        return NextResponse.json({
          ok: true,
          message: 'Database indexes added successfully',
        })

      case 'vacuum':
        await vacuumDatabase()
        return NextResponse.json({
          ok: true,
          message: 'Database vacuumed and analyzed',
        })

      case 'stats':
        const stats = await getDatabaseStats()
        return NextResponse.json({
          ok: true,
          stats,
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logError('db-optimize', error)
    return NextResponse.json({ error: 'Database optimization failed' }, { status: 500 })
  }
}

export const GET = withMonitoring(handler)
export const POST = withMonitoring(handler)
