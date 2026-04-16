import { NextRequest } from 'next/server'
import { getGlobalFeed } from '@/lib/actions/feed.actions'
import { ok, fail } from '@/lib/http/response'
import { requireRouteUser } from '@/lib/auth/route-auth'
import { connectToDatabase } from '@/lib/db'

type FeedPageData = {
  items: Awaited<ReturnType<typeof getGlobalFeed>>
  page: number
  pageSize: number
  hasMore: boolean
}

export async function GET(req: NextRequest) {
  await connectToDatabase()
  try {
    await requireRouteUser()

    const search = req.nextUrl.searchParams
    const pageRaw = Number(search.get('page') ?? '1')
    const pageSizeRaw = Number(search.get('pageSize') ?? '20')

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1
    const pageSize =
      Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 && pageSizeRaw <= 50
        ? pageSizeRaw
        : 20

    const limit = page * pageSize
    const rows = await getGlobalFeed({ limit })

    const start = (page - 1) * pageSize
    const end = start + pageSize

    const payload: FeedPageData = {
      items: rows.slice(start, end),
      page,
      pageSize,
      hasMore: rows.length > end,
    }

    return ok(payload)
  } catch (error) {
    return fail(error, 'Failed to load feed')
  }
}
