import Link from 'next/link'

export default function Home() {
  return (
    <div className="wrap">
      <h1>Каталог вилл и калькулятор</h1>
      <div className="grid">
        <div className="card">
          <div className="card-header">
            <h3>Каталог</h3>
          </div>
          <p>Просматривайте все проекты и виллы, добавляйте виллу в расчёт.</p>
          <Link className="btn primary" href="/catalog">Перейти в каталог</Link>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Админка</h3>
          </div>
          <p>Единая админка (React‑Admin) для проектов, вилл и сценариев.</p>
          <Link className="btn" href="/admin">Открыть админку</Link>
        </div>
      </div>
    </div>
  )
}