import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseRaQuery, setTotalCountHeaders } from '../utils'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const { skip, take, orderBy, where } = parseRaQuery(searchParams)
  const [items, total] = await Promise.all([
    prisma.project.findMany({ skip, take, orderBy, where }),
    prisma.project.count({ where })
  ])
  const res = NextResponse.json(items)
  setTotalCountHeaders(res.headers, total)
  return res
}

export async function POST(req: Request) {
  const data = await req.json()
  const item = await prisma.project.create({ data })
  return NextResponse.json(item)
}