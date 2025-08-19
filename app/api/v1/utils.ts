export function parseRaQuery(searchParams: URLSearchParams) {
  // React-Admin simple-rest sends JSON strings in 'range', 'sort', 'filter'
  const range = searchParams.get('range')
  const sort = searchParams.get('sort')
  const filter = searchParams.get('filter')

  let skip = 0, take = 100, orderBy: any = undefined, where: any = {}
  if (range) {
    try {
      const [start, end] = JSON.parse(range)
      skip = start ?? 0
      take = end != null ? end - (start ?? 0) + 1 : 100
    } catch {}
  }
  if (sort) {
    try {
      const [field, dir] = JSON.parse(sort)
      orderBy = { [field]: (dir || 'ASC').toLowerCase() === 'asc' ? 'asc' : 'desc' }
    } catch {}
  }
  if (filter) {
    try {
      const obj = JSON.parse(filter)
      where = {}
      for (const [k, v] of Object.entries(obj)) {
        if (v === undefined || v === null || v === '') continue
        if (typeof v === 'string') {
          where[k] = { contains: v, mode: 'insensitive' }
        } else {
          where[k] = v
        }
      }
    } catch {}
  }
  return { skip, take, orderBy, where }
}

export function setTotalCountHeaders(headers: Headers, total: number) {
  headers.set('X-Total-Count', String(total))
  headers.set('Access-Control-Expose-Headers', 'X-Total-Count')
}