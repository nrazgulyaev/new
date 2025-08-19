import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(req: Request, { params }: Params) {
  const id = Number(params.id)
  const item = await prisma.scenario.findUnique({
    where: { id },
    include: { villa: { include: { project: true } } }
  })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: Params) {
  const id = Number(params.id)
  const data = await req.json()
  const item = await prisma.scenario.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: Request, { params }: Params) {
  const id = Number(params.id)
  const item = await prisma.scenario.delete({ where: { id } })
  return NextResponse.json(item)
}