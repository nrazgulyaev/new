import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

export async function GET(req: Request, { params }: Params) {
  const id = Number(params.id)
  const item = await prisma.project.findUnique({ where: { id } })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: Params) {
  const id = Number(params.id)
  const data = await req.json()
  const item = await prisma.project.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: Request, { params }: Params) {
  const id = Number(params.id)
  const item = await prisma.project.delete({ where: { id } })
  return NextResponse.json(item)
}