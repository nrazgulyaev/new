// app.js
// продолжаем
const { useEffect, useMemo, useState } = React;
const { createRoot } = ReactDOM;

/* =========================
   Константы и утилиты
========================= */
const PIN_CODE = "334346";
const LS_CATALOG = "arq_catalog_v2";
const LS_RATES = "arq_rates_v1";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmtInt = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmt2 = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(+n || 0);
const fmtMoney = (n, c = "USD", max = 0) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: max }).format(Math.round(+n || 0));

function ruMonthName(monthIndex) {
  const names = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
  return names[Math.max(0, Math.min(11, monthIndex))];
}
function formatPlannedCompletion(yyyyMm) {
  if (!yyyyMm || !/^\d{4}-\d{2}$/.test(yyyyMm)) return "";
  const [y, m] = yyyyMm.split("-");
  const monthName = ruMonthName(Number(m) - 1);
  return `${monthName} ${y}`;
}

/* =========================
   Данные (defaults) + storage
========================= */
function defaults() {
  return [
    {
      projectId: "ahau-gardens",
      projectName: "Ahau Gardens by Arconique",
      theme: "light",
      plannedCompletion: "2026-12",            // YYYY-MM
      constructionProgressPct: 20,             // 0..100
      includes: [
        "Полная комплектация (под ключ)",
        "Налог с продаж 10%",
        "Нотариальные 1%",
        "График платежей: 30%+30%+25%+10%+5%",
      ],
      villas: [
        { villaId: "ahau-a1-2br", name: "A1", status: "hold", rooms: "2", land: 201.7, area: 142.7, f1: 107.1, f2: 38.89, roof: 0, garden: 57.5, ppsm: 2200, baseUSD: 282828, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2055-01-01", dailyRateUSD: 220, occupancyPct: 55, rentalPriceIndexPct: 5, discountPct: 0 },
        { villaId: "ahau-a6-2br", name: "A6", status: "reserved", rooms: "2", land: 201.7, area: 142.7, f1: 107.1, f2: 38.89, roof: 0, garden: 57.5, ppsm: 2250, baseUSD: 289229, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2055-01-01", dailyRateUSD: 230, occupancyPct: 58, rentalPriceIndexPct: 5, discountPct: 0 },
        { villaId: "ahau-b1-2rt", name: "B1", status: "available", rooms: "2+rt", land: 100.5, area: 192.0, f1: 83.1, f2: 67.96, roof: 40.9, garden: 24.51, ppsm: 2410, baseUSD: 231000, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2055-01-01", dailyRateUSD: 260, occupancyPct: 60, rentalPriceIndexPct: 5, discountPct: 0 }
      ]
    },
    {
      projectId: "enso-villas",
      projectName: "ENSO by Arconique",
      theme: "light",
      plannedCompletion: "2026-12",
      constructionProgressPct: 20,
      includes: [
        "Полная комплектация (под ключ)",
        "Налог с продаж 10%",
        "Нотариальные 1%",
        "График платежей: 30%+30%+25%+10%+5%",
      ],
      villas: [
        { villaId: "enso-l1-2br", name: "L1", status: "available", rooms: "2", land: 174.6, area: 104.1, f1: 0, f2: 0, roof: 0, garden: 40.73, ppsm: 2410, baseUSD: 244775, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2054-12-01", dailyRateUSD: 220, occupancyPct: 55, rentalPriceIndexPct: 5, discountPct: 0 },
        { villaId: "enso-v1-2br", name: "V1", status: "available", rooms: "2", land: 165.8, area: 114.1, f1: 0, f2: 0, roof: 0, garden: 43.4, ppsm: 2549, baseUSD: 262018, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2054-12-01", dailyRateUSD: 230, occupancyPct: 58, rentalPriceIndexPct: 5, discountPct: 0 }
      ]
    },
    {
      projectId: "eternal-villas",
      projectName: "Eternal Villas by Arconique",
      theme: "light",
      plannedCompletion: "2026-12",
      constructionProgressPct: 0,
      includes: [
        "Полная комплектация (под ключ)",
        "Налог с продаж 10%",
        "Нотариальные 1%",
        "График платежей: 30%+30%+25%+10%+5%",
      ],
      villas: [
        { villaId: "eternal-premium-3br", name: "Premium 3 bedroom", status: "available", rooms: "3", land: 260, area: 218, f1: 0, f2: 0, roof: 0, garden: 82, ppsm: 2197, baseUSD: 479000, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2055-01-01", dailyRateUSD: 550, occupancyPct: 60, rentalPriceIndexPct: 5, discountPct: 0 },
        { villaId: "eternal-master-2br", name: "Master 2 bedroom", status: "available", rooms: "2", land: 180, area: 141.7, f1: 0, f2: 0, roof: 0, garden: 60, ppsm: 2451, baseUSD: 347307, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2052-01-01", dailyRateUSD: 400, occupancyPct: 58, rentalPriceIndexPct: 5, discountPct: 0 }
      ]
    }
  ];
}
const loadCatalog = () => {
  try {
    const raw = localStorage.getItem(LS_CATALOG);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaults();
  } catch {
    return defaults();
  }
};
const saveCatalog = (catalog) => { try { localStorage.setItem(LS_CATALOG, JSON.stringify(catalog)); } catch {} };

const loadRates = () => {
  try {
    const raw = localStorage.getItem(LS_RATES);
    if (!raw) return { idrPerUsd: 16300, eurPerUsd: 0.88, currency: "USD" };
    const obj = JSON.parse(raw);
    return {
      idrPerUsd: typeof obj.idrPerUsd === "number" ? obj.idrPerUsd : 16300,
      eurPerUsd: typeof obj.eurPerUsd === "number" ? obj.eurPerUsd : 0.88,
      currency: obj.currency || "USD",
    };
  } catch {
    return { idrPerUsd: 16300, eurPerUsd: 0.88, currency: "USD" };
  }
};
const saveRates = (r) => { try { localStorage.setItem(LS_RATES, JSON.stringify(r)); } catch {} };

/* =========================
   Маршрутизация (hash)
========================= */
function parseHash() {
  const hash = (window.location.hash || "").replace(/^#\/?/, "");
  const [route, queryString] = hash.split("?");
  const params = new URLSearchParams(queryString || "");
  return { route: route || "catalog", params };
}
function navigateTo(route, params = {}) {
  const qs = new URLSearchParams(params).toString();
  window.location.hash = qs ? `#/${route}?${qs}` : `#/${route}`;
}

/* =========================
   Примитивные UI-компоненты
========================= */
function Pill({ children }) {
  return <span className="pill">{children}</span>;
}
function StatusPill({ value }) {
  const label = value === "reserved" ? "Забронировано" : value === "hold" ? "На паузе" : "Доступно";
  const cls = value === "reserved" ? "status status-reserved" : value === "hold" ? "status status-hold" : "status status-available";
  return <span className={cls}>{label}</span>;
}
function Th({ children, className = "" }) {
  return <th className={`th ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`td ${className}`}>{children}</td>;
}

/* =========================
   Каталог
========================= */
function CatalogView({ catalog, isAdmin, onEditProject }) {
  return (
    <div className="container reveal">
      <div className="header">
        <h1 className="h1">Каталог проектов</h1>
        <div className="actions">
          {!isAdmin ? (
            <button className="btn" onClick={() => {
              const pin = prompt("Введите PIN для входа в админ‑режим");
              if (pin === PIN_CODE) navigateTo("admin");
              else alert("Неверный PIN");
            }}>Войти (админ)</button>
          ) : (
            <button className="btn" onClick={() => navigateTo("admin")}>Админ‑панель</button>
          )}
        </div>
      </div>

      {catalog.map(project => (
        <section key={project.projectId} className="card reveal">
          <div className="project-head">
            <div className="project-title">
              <h2 className="h2">{project.projectName}</h2>
              <div className="project-meta">
                {project.plannedCompletion && <Pill>План завершения: {formatPlannedCompletion(project.plannedCompletion)}</Pill>}
                <Pill>Прогресс: {fmt2(project.constructionProgressPct ?? 0)}%</Pill>
              </div>
            </div>
            {isAdmin && (
              <button className="btn-secondary" onClick={() => onEditProject(project.projectId)}>Править проект</button>
            )}
          </div>

          <ul className="spec-list">
            {project.includes?.map((text, i) => <li key={i}>• {text}</li>)}
            {project.plannedCompletion && (
              <li>• Планируемая дата завершения строительства — {formatPlannedCompletion(project.plannedCompletion)}</li>
            )}
            <li>• Достигнутый прогресс строительства — {fmt2(project.constructionProgressPct ?? 0)}%</li>
          </ul>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <Th>Статус</Th>
                  <Th>Вилла</Th>
                  <Th>Комнат</Th>
                  <Th>Земля, м²</Th>
                  <Th>Вилла, м²</Th>
                  <Th>$ / м²</Th>
                  <Th>Цена (USD)</Th>
                  <Th className="w-1">Действия</Th>
                </tr>
              </thead>
              <tbody>
                {project.villas.map(v => (
                  <tr key={v.villaId}>
                    <Td><StatusPill value={v.status} /></Td>
                    <Td>{v.name}</Td>
                    <Td>{v.rooms}</Td>
                    <Td>{fmt2(v.land || 0)}</Td>
                    <Td>{fmt2(v.area || 0)}</Td>
                    <Td>{v.ppsm ? fmtInt(v.ppsm) : "—"}</Td>
                    <Td>{v.baseUSD ? fmtMoney(v.baseUSD) : "—"}</Td>
                    <Td>
                      {v.status === "available" ? (
                        <button className="btn" onClick={() => navigateTo("calc", { projectId: project.projectId, villaId: v.villaId })}>Рассчитать</button>
                      ) : null}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

/* =========================
   Админ: редактирование проекта
========================= */
function ProjectEditModal({ project, onClose, onSave }) {
  const [state, setState] = useState(() => ({
    projectName: project.projectName || "",
    plannedCompletion: project.plannedCompletion || "",
    constructionProgressPct: project.constructionProgressPct ?? 0,
    includesText: (project.includes || []).join("\n"),
  }));

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h3 className="h3">Правка проекта</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="row">
            <label className="label">Название проекта</label>
            <input className="input" value={state.projectName} onChange={e => setState(s => ({ ...s, projectName: e.target.value }))} />
          </div>

          <div className="row">
            <label className="label">Планируемая дата завершения строительства</label>
            <input
              className="input"
              type="month"
              value={state.plannedCompletion}
              onChange={e => setState(s => ({ ...s, plannedCompletion: e.target.value }))}
            />
            {!!state.plannedCompletion && (
              <div className="muted mt-1">Отобразится как: {formatPlannedCompletion(state.plannedCompletion)}</div>
            )}
          </div>

          <div className="row">
            <label className="label">Достигнутый прогресс строительства, %</label>
            <div className="flex gap-2 items-center">
              <input
                className="input flex-1"
                type="range"
                min="0"
                max="100"
                step="1"
                value={state.constructionProgressPct}
                onChange={e => setState(s => ({ ...s, constructionProgressPct: clamp(+e.target.value || 0, 0, 100) }))}
              />
              <input
                className="input w-20"
                type="number"
                min="0"
                max="100"
                step="1"
                value={state.constructionProgressPct}
                onChange={e => setState(s => ({ ...s, constructionProgressPct: clamp(+e.target.value || 0, 0, 100) }))}
              />
              <span>%</span>
            </div>
          </div>

          <div className="row">
            <label className="label">Включено (по строке на пункт)</label>
            <textarea
              className="textarea"
              rows={6}
              value={state.includesText}
              onChange={e => setState(s => ({ ...s, includesText: e.target.value }))}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn" onClick={() => {
            const next = {
              ...project,
              projectName: state.projectName.trim() || "Без названия",
              plannedCompletion: state.plannedCompletion || "",
              constructionProgressPct: clamp(+state.constructionProgressPct || 0, 0, 100),
              includes: state.includesText.split("\n").map(s => s.trim()).filter(Boolean),
            };
            onSave(next);
          }}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function AdminView({ catalog, setCatalog }) {
  const [editingProjectId, setEditingProjectId] = useState(null);
  const project = useMemo(() => catalog.find(p => p.projectId === editingProjectId) || null, [catalog, editingProjectId]);

  function saveProject(updated) {
    const next = catalog.map(p => p.projectId === updated.projectId ? updated : p);
    setCatalog(next);
    saveCatalog(next);
    setEditingProjectId(null);
  }

  return (
    <div className="container reveal">
      <div className="header">
        <h1 className="h1">Админ‑панель</h1>
        <div className="actions">
          <button className="btn-secondary" onClick={() => navigateTo("catalog")}>К каталогу</button>
        </div>
      </div>

      <div className="card">
        <h2 className="h2">Проекты</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <Th>Проект</Th>
                <Th>План завершения</Th>
                <Th>Прогресс</Th>
                <Th>Вилл</Th>
                <Th className="w-1">Действия</Th>
              </tr>
            </thead>
            <tbody>
              {catalog.map(p => (
                <tr key={p.projectId}>
                  <Td>{p.projectName}</Td>
                  <Td>{p.plannedCompletion ? formatPlannedCompletion(p.plannedCompletion) : "—"}</Td>
                  <Td>{fmt2(p.constructionProgressPct ?? 0)}%</Td>
                  <Td>{p.villas?.length || 0}</Td>
                  <Td><button className="btn" onClick={() => setEditingProjectId(p.projectId)}>Править</button></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {project && (
        <ProjectEditModal
          project={project}
          onClose={() => setEditingProjectId(null)}
          onSave={saveProject}
        />
      )}
    </div>
  );
}

/* =========================
   Калькулятор (упрощён безопасный)
========================= */
function useRatesState() {
  const init = loadRates();
  const [currency, setCurrency] = useState(init.currency);
  const [idrPerUsd, setIdrPerUsd] = useState(init.idrPerUsd);
  const [eurPerUsd, setEurPerUsd] = useState(init.eurPerUsd);
  useEffect(() => saveRates({ currency, idrPerUsd, eurPerUsd }), [currency, idrPerUsd, eurPerUsd]);
  return { currency, setCurrency, idrPerUsd, setIdrPerUsd, eurPerUsd, setEurPerUsd };
}

function CalcView({ catalog, projectId, villaId }) {
  // хуки сверху — без ранних return
  const [handoverMonth, setHandoverMonth] = useState(""); // YYYY-MM
  const [monthsAfterKeys, setMonthsAfterKeys] = useState(12); // Пост‑ключи рассрочка
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33); // показывается только в админке на странице "Настройки"? — здесь просто есть
  const [discountPct, setDiscountPct] = useState(0); // скидка в объекте (админ)
  const rates = useRatesState();

  const selected = useMemo(() => {
    const project = catalog.find(p => p.projectId === projectId);
    if (!project) return null;
    const villa = project.villas.find(v => v.villaId === villaId);
    if (!villa) return null;
    return { project, villa };
  }, [catalog, projectId, villaId]);

  // Автоподстановка даты завершения строительства из проекта
  useEffect(() => {
    if (selected?.project?.plannedCompletion) {
      setHandoverMonth(selected.project.plannedCompletion);
    }
  }, [selected?.project?.plannedCompletion]);

  // Безопасные данные
  const villa = selected?.villa || {};
  const priceUSD = Math.max(0, +villa.baseUSD || 0);
  const priceAfterDiscountUSD = Math.max(0, priceUSD * (1 - (discountPct || villa.discountPct || 0) / 100));

  // Простейший план платежей (пример): до ключей 50%, после 50% / monthsAfterKeys
  const beforeKeysPct = 50;
  const payBefore = priceAfterDiscountUSD * beforeKeysPct / 100;
  const payAfterTotal = priceAfterDiscountUSD - payBefore;
  const payAfterMonthly = monthsAfterKeys > 0 ? payAfterTotal / monthsAfterKeys : 0;

  // Аренда (месячный доход)
  const monthlyRentalUSD = Math.max(0, (+villa.dailyRateUSD || 0) * 30 * ((+villa.occupancyPct || 0) / 100));

  // ROI/IRR: заглушки (без падений)
  const netIncomeSample = Math.max(0, monthlyRentalUSD * 12 - payAfterMonthly * 12 * ((100 - beforeKeysPct) / 50)); // простая иллюстрация
  const irrApprox = netIncomeSample > 0 ? 0.18 : 0.0;
  const roiCumulative = priceAfterDiscountUSD > 0 ? (netIncomeSample / priceAfterDiscountUSD) : 0;

  // Валюта отображения
  function display
