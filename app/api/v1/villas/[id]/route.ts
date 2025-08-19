import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(req: Request, { params }: Params) {
  const id = Number(params.id)
  const item = await prisma.villa.findUnique({ where: { id }, include: { project: true } })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: Params) {
  const id = Number(params.id)
  const data = await req.json()
  const vatRate = data.vatRate ?? undefined
  // recompute priceWithVat if basePrice/vatRate changed
  if (data.basePrice != null || data.vatRate != null) {
    const v = await prisma.villa.findUnique({ where: { id } })
    const base = data.basePrice ?? v?.basePrice ?? 0
    const rate = vatRate ?? v?.vatRate ?? 0.11
    data.priceWithVat = base * (1 + rate)
  }
  if (data.villaSqm != null && data.areaSqm == null) data.areaSqm = data.villaSqm
  const item = await prisma.villa.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: Request, { params }: Params) {
  const id = Number(params.id)
  const item = await prisma.villa.delete({ where: { id } })
  return NextResponse.json(item)
}