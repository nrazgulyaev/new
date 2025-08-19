'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Scenario = {
  id: number
  name: string
  villa: any
}

function fmt(n: number, digits: number = 0) {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

export default function CalcPage() {
  const params = useParams()
  const [scenario, setScenario] = useState<Scenario | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/v1/scenarios/${params.id}`)
      const data = await res.json()
      setScenario(data)
    }
    load()
  }, [params.id])

  const kpis = useMemo(() => {
    if (!scenario?.villa) return null
    const v = scenario.villa

    const priceWithVat = v.priceWithVat
    const daily = v.dailyRateUSD ?? 0
    const occ = (v.occupancyPct ?? 60) / 100
    const grossYear = daily * 365 * occ
    const yearlyGrowth = (v.rentalGrowthPct ?? 0) / 100

    // simple: year1 net = gross * 0.8 (20% opex placeholder)
    const netYear1 = grossYear * 0.8
    const roiYear1 = priceWithVat > 0 ? (netYear1 / priceWithVat) * 100 : 0

    // cumulative 5y net with growth
    let cum = 0
    let cur = netYear1
    for (let y = 0; y < 5; y++) {
      cum += cur
      cur *= (1 + yearlyGrowth)
    }
    const irrApprox = roiYear1 / 100 // very rough placeholder

    return {
      priceWithVat,
      netYear1,
      roiYear1,
      cum5: cum,
      irrApprox: irrApprox * 100
    }
  }, [scenario])

  if (!scenario) return <div className="wrap"><div className="loader"/></div>

  return (
    <div className="wrap">
      <h1>Калькулятор: {scenario.name}</h1>
      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3>Параметры виллы</h3>
            <Link className="btn small" href="/catalog">← Каталог</Link>
          </div>
          <div className="row">
            <div className="field"><label>Проект</label><div className="pill">{scenario.villa?.project?.name ?? '—'}</div></div>
            <div className="field"><label>Вилла</label><div className="pill">{scenario.villa?.name}</div></div>
            <div className="field"><label>Тип</label><div className="pill">{scenario.villa?.villaType}</div></div>
            <div className="field"><label>Комнат</label><div className="pill">{scenario.villa?.rooms}</div></div>
          </div>
          <div className="row">
            <div className="field"><label>Площадь (м²)</label><div className="pill">{scenario.villa?.villaSqm}</div></div>
            <div className="field"><label>Цена с НДС ($)</label><div className="pill">${fmt(scenario.villa?.priceWithVat)}</div></div>
            <div className="field"><label>Ставка/день ($)</label><div className="pill">${scenario.villa?.dailyRateUSD ?? 0}</div></div>
            <div className="field"><label>Рост аренды/год (%)</label><div className="pill">{scenario.villa?.rentalGrowthPct ?? 0}%</div></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>KPI</h3></div>
          {kpis && (
            <div className="kpis">
              <div className="kpi"><div className="muted">Цена с НДС</div><div className="v">${fmt(kpis.priceWithVat)}</div></div>
              <div className="kpi"><div className="muted">Чистый доход Y1</div><div className="v">${fmt(kpis.netYear1, 0)}</div></div>
              <div className="kpi"><div className="muted">ROI Y1</div><div className="v">{fmt(kpis.roiYear1, 2)}%</div></div>
              <div className="kpi"><div className="muted">Кумулятив 5 лет</div><div className="v">${fmt(kpis.cum5, 0)}</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}