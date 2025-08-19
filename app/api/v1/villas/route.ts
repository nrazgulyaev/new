import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseRaQuery, setTotalCountHeaders } from '../utils'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { skip, take, orderBy, where } = parseRaQuery(searchParams)
  const [items, total] = await Promise.all([
    prisma.villa.findMany({ skip, take, orderBy, where }),
    prisma.villa.count({ where })
  ])
  const res = NextResponse.json(items)
  setTotalCountHeaders(res.headers, total)
  return res
}

export async function POST(req: Request) {
  const data = await req.json()
  // auto-calc some fields if absent
  const vatRate = data.vatRate ?? 0.11
  const priceWithVat = data.priceWithVat ?? (data.basePrice ? data.basePrice * (1 + vatRate) : null)
  const areaSqm = data.areaSqm ?? data.villaSqm
  const item = await prisma.villa.create({ data: { ...data, vatRate, priceWithVat, areaSqm } })
  return NextResponse.json(item)
}