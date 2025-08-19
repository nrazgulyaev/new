'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Villa = {
  id: number
  name: string
  villaType: string
  rooms: number
  landSqm: number
  villaSqm: number
  pricePerSqm: number
  basePrice: number
  priceWithVat: number
  status: string
  projectId: number
  dailyRateUSD?: number | null
  rentalGrowthPct?: number | null
  leaseholdEndDate?: string | null
}

type Project = {
  id: number
  name: string
  description?: string | null
}

export default function CatalogPage() {
  const [villas, setVillas] = useState<Villa[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const [vres, pres] = await Promise.all([
        fetch('/api/v1/villas').then(r => r.json()),
        fetch('/api/v1/projects').then(r => r.json())
      ])
      setVillas(vres)
      setProjects(pres)
      setLoading(false)
    }
    load()
  }, [])

  const grouped = useMemo(() => {
    const map: Record<number, { project: Project, villas: Villa[] }> = {}
    for (const p of projects) {
      map[p.id] = { project: p, villas: [] }
    }
    for (const v of villas) {
      if (!map[v.projectId]) continue
      map[v.projectId].villas.push(v)
    }
    return Object.values(map)
  }, [villas, projects])

  async function addToCalc(villaId: number) {
    const res = await fetch('/api/v1/scenarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ villaId })
    })
    const scenario = await res.json()
    router.push(`/calc/${scenario.id}`)
  }

  return (
    <div className="wrap">
      <h1>Каталог проектов и вилл</h1>
      {loading && <div className="loader" />}
      {!loading && grouped.map((g) => (
        <div key={g.project.id} className="project-card">
          <div className="project-header">
            <h3>{g.project.name}</h3>
            <div className="project-actions">
              <span className="badge">{g.villas.length} вилл</span>
              <Link className="btn small" href={`/admin`}>Редактировать</Link>
            </div>
          </div>
          <div className="villas-grid">
            {g.villas.map(v => (
              <div key={v.id} className="villa-card">
                <div className="villa-header">
                  <h4>{v.name}</h4>
                  <div className="villa-actions">
                    <button className="btn success" onClick={() => addToCalc(v.id)}>В расчёт</button>
                  </div>
                </div>
                <div className="villa-details">
                  <div className="detail-item"><span className="detail-label">Тип</span><span className="detail-value">{v.villaType}</span></div>
                  <div className="detail-item"><span className="detail-label">Комнат</span><span className="detail-value">{v.rooms}</span></div>
                  <div className="detail-item"><span className="detail-label">Площадь (м²)</span><span className="detail-value">{v.villaSqm}</span></div>
                  <div className="detail-item"><span className="detail-label">Цена (без НДС)</span><span className="detail-value">${v.basePrice.toLocaleString()}</span></div>
                  <div className="detail-item"><span className="detail-label">Цена с НДС</span><span className="detail-value">${v.priceWithVat.toLocaleString()}</span></div>
                  {v.dailyRateUSD ? (<div className="detail-item"><span className="detail-label">Ставка/день</span><span className="detail-value">${v.dailyRateUSD}</span></div>) : null}
                  {v.leaseholdEndDate ? (<div className="detail-item"><span className="detail-label">Лизхолд до</span><span className="detail-value">{new Date(v.leaseholdEndDate).toLocaleDateString()}</span></div>) : null}
                  <div className="detail-item"><span className="detail-label">Статус</span><span className="detail-value">{v.status}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}