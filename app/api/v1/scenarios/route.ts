import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseRaQuery, setTotalCountHeaders } from '../utils'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { skip, take, orderBy, where } = parseRaQuery(searchParams)
  const [items, total] = await Promise.all([
    prisma.scenario.findMany({ skip, take, orderBy, where }),
    prisma.scenario.count({ where })
  ])
  const res = NextResponse.json(items)
  setTotalCountHeaders(res.headers, total)
  return res
}

export async function POST(req: Request) {
  const data = await req.json()
  const villaId = Number(data.villaId)
  if (!villaId) return NextResponse.json({ error: 'villaId is required' }, { status: 400 })
  const villa = await prisma.villa.findUnique({ where: { id: villaId } })
  if (!villa) return NextResponse.json({ error: 'villa not found' }, { status: 404 })
  const item = await prisma.scenario.create({
    data: {
      villaId,
      name: data.name ?? `Scenario for ${villa.name}`
    }
  })
  return NextResponse.json(item)
}