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
function fmtMoney(n, c = "USD", max = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: c,
    maximumFractionDigits: max
  }).format(Math.round(+n || 0));
}
function ruMonthName(i) {
  const m = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
  return m[Math.max(0, Math.min(11, i))];
}
function ymLabel(yyyyMm) {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return "—";
  const [y, m] = yyyyMm.split("-");
  return `${ruMonthName(+m - 1)} ${y}`;
}
function formatPlannedCompletion(yyyyMm) {
  if (!yyyyMm || !/^\d{4}-\d{2}$/.test(yyyyMm)) return "";
  return ymLabel(yyyyMm);
}

/* Анимация появления */
function useRevealOnMount() {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    });
  }, []);
}
function useRevealOnRoute(route) {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    });
  }, [route?.route]);
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
      plannedCompletion: "2026-12",
      constructionProgressPct: 20,
      includes: [
        "Полная комплектация (под ключ)",
        "Налог с продаж 10%",
        "Нотариальные 1%",
        "График платежей: 30%+30%+25%+10%+5%"
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
        "График платежей: 30%+30%+25%+10%+5%"
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
        "График платежей: 30%+30%+25%+10%+5%"
      ],
      villas: [
        { villaId: "eternal-premium-3br", name: "Premium 3 bedroom", status: "available", rooms: "3", land: 260, area: 218, f1: 0, f2: 0, roof: 0, garden: 82, ppsm: 2197, baseUSD: 479000, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2055-01-01", dailyRateUSD: 550, occupancyPct: 60, rentalPriceIndexPct: 5, discountPct: 0 },
        { villaId: "eternal-master-2br", name: "Master 2 bedroom", status: "available", rooms: "2", land: 180, area: 141.7, f1: 0, f2: 0, roof: 0, garden: 60, ppsm: 2451, baseUSD: 347307, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2052-01-01", dailyRateUSD: 400, occupancyPct: 58, rentalPriceIndexPct: 5, discountPct: 0 }
      ]
    }
  ];
}
function loadCatalog() {
  try {
    const raw = localStorage.getItem(LS_CATALOG);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaults();
  } catch {
    return defaults();
  }
}
function saveCatalog(catalog) { try { localStorage.setItem(LS_CATALOG, JSON.stringify(catalog)); } catch {} }

function loadRates() {
  try {
    const raw = localStorage.getItem(LS_RATES);
    if (!raw) return { idrPerUsd: 16300, eurPerUsd: 0.88, currency: "USD" };
    const o = JSON.parse(raw);
    return {
      idrPerUsd: typeof o.idrPerUsd === "number" ? o.idrPerUsd : 16300,
      eurPerUsd: typeof o.eurPerUsd === "number" ? o.eurPerUsd : 0.88,
      currency: o.currency || "USD"
    };
  } catch {
    return { idrPerUsd: 16300, eurPerUsd: 0.88, currency: "USD" };
  }
}
function saveRates(r) { try { localStorage.setItem(LS_RATES, JSON.stringify(r)); } catch {} }

/* =========================
   Роутинг
========================= */
function parseHash() {
  const hash = (window.location.hash || "").replace(/^#\/?/, "");
  const [route, qs] = hash.split("?");
  const params = new URLSearchParams(qs || "");
  return { route: route || "catalog", params };
}
function navigateTo(route, params = {}) {
  const qs = new URLSearchParams(params).toString();
  window.location.hash = qs ? `#/${route}?${qs}` : `#/${route}`;
}

/* =========================
   Примитивные UI
========================= */
function Pill({ children }) { return <span className="pill">{children}</span>; }
function StatusPill({ value }) {
  const label = value === "reserved" ? "Забронировано" : value === "hold" ? "На паузе" : "Доступно";
  const cls = value === "reserved" ? "status status-reserved" : value === "hold" ? "status status-hold" : "status status-available";
  return <span className={cls}>{label}</span>;
}
function Th({ children, className = "" }) { return <th className={`th ${className}`}>{children}</th>; }
function Td({ children, className = "" }) { return <td className={`td ${className}`}>{children}</td>; }

/* =========================
   Catalog (публичный вид)
========================= */
function CatalogView({ catalog }) {
  return (
    <div className="container reveal">
      <div className="header">
        <h1 className="h1">Каталог проектов</h1>
        <div className="actions">
          <button className="btn" onClick={() => {
            const pin = prompt("Введите PIN для входа в админ‑режим");
            if (pin === PIN_CODE) navigateTo("admin");
            else alert("Неверный PIN");
          }}>Войти (админ)</button>
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
            <button className="btn-secondary" onClick={() => navigateTo("admin")}>Админ‑панель</button>
          </div>

          <ul className="spec-list">
            {(project.includes || []).map((t, i) => <li key={i}>• {t}</li>)}
            {project.plannedCompletion && (
              <li>• Планируемая дата завершения строительства — {formatPlannedCompletion(project.plannedCompletion)}</li>
            )}
            <li>• Достигнутый прогресс строительства — {fmt2(project.constructionProgressPct ?? 0)}%</li>
          </ul>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <Th>Вилла</Th>
                  <Th>Комнат</Th>
                  <Th>Земля, м²</Th>
                  <Th>Вилла, м²</Th>
                  <Th>$ / м²</Th>
                  <Th>Цена (USD)</Th>
                  <Th>Статус</Th>
                  <Th className="w-1">Действия</Th>
                </tr>
              </thead>
              <tbody>
                {(project.villas || []).map(v => (
                  <tr key={v.villaId}>
                    <Td>{v.name}</Td>
                    <Td>{v.rooms}</Td>
                    <Td>{fmt2(v.land || 0)}</Td>
                    <Td>{fmt2(v.area || 0)}</Td>
                    <Td>{v.ppsm ? fmtInt(v.ppsm) : "—"}</Td>
                    <Td>{v.baseUSD ? fmtMoney(v.baseUSD) : "—"}</Td>
                    <Td><StatusPill value={v.status} /></Td>
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
   Admin (CRUD вилл + правка проекта)
========================= */
function ProjectEditModal({ project, onClose, onSave }) {
  const [state, setState] = useState({
    projectName: project.projectName || "",
    plannedCompletion: project.plannedCompletion || "",
    constructionProgressPct: project.constructionProgressPct ?? 0,
    includesText: (project.includes || []).join("\n")
  });

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
            <input className="input" type="month" value={state.plannedCompletion} onChange={e => setState(s => ({ ...s, plannedCompletion: e.target.value }))} />
            {!!state.plannedCompletion && <div className="muted mt-1">Отобразится как: {formatPlannedCompletion(state.plannedCompletion)}</div>}
          </div>
          <div className="row">
            <label className="label">Достигнутый прогресс строительства, %</label>
            <div className="flex gap-2 items-center">
              <input className="input flex-1" type="range" min="0" max="100" step="1"
                     value={state.constructionProgressPct}
                     onChange={e => setState(s => ({ ...s, constructionProgressPct: clamp(+e.target.value || 0, 0, 100) }))}/>
              <input className="input w-20" type="number" min="0" max="100" step="1"
                     value={state.constructionProgressPct}
                     onChange={e => setState(s => ({ ...s, constructionProgressPct: clamp(+e.target.value || 0, 0, 100) }))}/>
              <span>%</span>
            </div>
          </div>
          <div className="row">
            <label className="label">Включено (по строке на пункт)</label>
            <textarea className="textarea" rows={6}
                      value={state.includesText}
                      onChange={e => setState(s => ({ ...s, includesText: e.target.value }))}/>
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
              includes: state.includesText.split("\n").map(s => s.trim()).filter(Boolean)
            };
            onSave(next);
          }}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function emptyVilla() {
  return {
    villaId: "villa-" + Math.random().toString(36).slice(2, 9),
    name: "",
    status: "available",
    rooms: "",
    land: 0,
    area: 0,
    f1: 0, f2: 0, roof: 0, garden: 0,
    ppsm: null, baseUSD: null,
    dailyRateUSD: 0, occupancyPct: 0, rentalPriceIndexPct: 0,
    discountPct: 0,
    monthlyPriceGrowthPct: 0,
    leaseholdEndDate: ""
  };
}

function VillaEditModal({ initial, onClose, onSave }) {
  const [v, setV] = useState({ ...initial });
  function onChangeNum(key, value) { setV(s => ({ ...s, [key]: value === "" ? "" : +value })); }
  return (
    <div className="modal-backdrop">
      <div className="modal large">
        <div className="modal-head">
          <h3 className="h3">{initial?.villaId ? "Правка виллы" : "Добавить виллу"}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          <div className="grid-2">
            <div className="row"><label className="label">Название</label><input className="input" value={v.name || ""} onChange={e => setV(s => ({ ...s, name: e.target.value }))}/></div>
            <div className="row"><label className="label">Статус</label>
              <select className="input" value={v.status} onChange={e => setV(s => ({ ...s, status: e.target.value }))}>
                <option value="available">Доступно</option><option value="reserved">Забронировано</option><option value="hold">На паузе</option>
              </select>
            </div>
            <div className="row"><label className="label">Комнат</label><input className="input" value={v.rooms || ""} onChange={e => setV(s => ({ ...s, rooms: e.target.value }))}/></div>
            <div className="row"><label className="label">Земля, м²</label><input className="input" type="number" step="0.01" value={v.land ?? ""} onChange={e => onChangeNum("land", e.target.value)}/></div>
            <div className="row"><label className="label">Вилла, м²</label><input className="input" type="number" step="0.01" value={v.area ?? ""} onChange={e => onChangeNum("area", e.target.value)}/></div>
            <div className="row"><label className="label">$ / м²</label><input className="input" type="number" step="1" value={v.ppsm ?? ""} onChange={e => onChangeNum("ppsm", e.target.value)}/></div>
            <div className="row"><label className="label">Цена (USD)</label><input className="input" type="number" step="1" value={v.baseUSD ?? ""} onChange={e => onChangeNum("baseUSD", e.target.value)}/></div>
            <div className="row"><label className="label">Дата конца лизхолда</label><input className="input" type="month" value={(v.leaseholdEndDate || "").slice(0,7)} onChange={e => setV(s => ({ ...s, leaseholdEndDate: e.target.value + "-01" }))}/></div>
            <div className="row"><label className="label">Этаж 1, м²</label><input className="input" type="number" step="0.01" value={v.f1 ?? ""} onChange={e => onChangeNum("f1", e.target.value)}/></div>
            <div className="row"><label className="label">Этаж 2, м²</label><input className="input" type="number" step="0.01" value={v.f2 ?? ""} onChange={e => onChangeNum("f2", e.target.value)}/></div>
            <div className="row"><label className="label">Руфтоп, м²</label><input className="input" type="number" step="0.01" value={v.roof ?? ""} onChange={e => onChangeNum("roof", e.target.value)}/></div>
            <div className="row"><label className="label">Сад+бассейн, м²</label><input className="input" type="number" step="0.01" value={v.garden ?? ""} onChange={e => onChangeNum("garden", e.target.value)}/></div>
            <div className="row"><label className="label">Сутки (USD)</label><input className="input" type="number" step="1" value={v.dailyRateUSD ?? ""} onChange={e => onChangeNum("dailyRateUSD", e.target.value)}/></div>
            <div className="row"><label className="label">Заполняемость, %</label><input className="input" type="number" step="0.1" min="0" max="100" value={v.occupancyPct ?? ""} onChange={e => onChangeNum("occupancyPct", e.target.value)}/></div>
            <div className="row"><label className="label">Рост аренды, %/год</label><input className="input" type="number" step="0.1" min="0" value={v.rentalPriceIndexPct ?? ""} onChange={e => onChangeNum("rentalPriceIndexPct", e.target.value)}/></div>
            <div className="row"><label className="label">Скидка, %</label><input className="input" type="number" step="0.1" min="0" max="100" value={v.discountPct ?? ""} onChange={e => onChangeNum("discountPct", e.target.value)}/></div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn" onClick={() => onSave(v)}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function AdminView({ catalog, setCatalog }) {
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [villaModal, setVillaModal] = useState(null);
  const project = useMemo(
    () => catalog.find(p => p.projectId === editingProjectId) || null,
    [catalog, editingProjectId]
  );

  function saveProject(updated) {
    const next = catalog.map(p => p.projectId === updated.projectId ? updated : p);
    setCatalog(next); saveCatalog(next);
    setEditingProjectId(null);
  }
  function openEditProject(pid) { setEditingProjectId(pid); }
  function openAddVilla(pid) { setVillaModal({ projectId: pid, villa: emptyVilla() }); }
  function openEditVilla(pid, v) { setVillaModal({ projectId: pid, villa: { ...v } }); }
  function saveVilla(v) {
    const pid = villaModal.projectId;
    const next = catalog.map(p => {
      if (p.projectId !== pid) return p;
      const exists = (p.villas || []).some(x => x.villaId === v.villaId);
      const villas = exists
        ? p.villas.map(x => x.villaId === v.villaId ? v : x)
        : [...(p.villas || []), { ...v, villaId: v.villaId || "villa-" + Math.random().toString(36).slice(2,9) }];
      return { ...p, villas };
    });
    setCatalog(next); saveCatalog(next);
    setVillaModal(null);
  }
  function deleteVilla(pid, id) {
    if (!confirm("Удалить виллу?")) return;
    const next = catalog.map(p => p.projectId === pid ? { ...p, villas: (p.villas || []).filter(v => v.villaId !== id) } : p);
    setCatalog(next); saveCatalog(next);
  }

  return (
    <div className="container reveal">
      <div className="header">
        <h1 className="h1">Админ‑панель</h1>
        <div className="actions">
          <button className="btn-secondary" onClick={() => navigateTo("catalog")}>К каталогу</button>
        </div>
      </div>

      {catalog.map(p => (
        <section key={p.projectId} className="card reveal">
          <div className="project-head">
            <div className="project-title">
              <h2 className="h2">{p.projectName}</h2>
              <div className="project-meta">
                {p.plannedCompletion && <Pill>План завершения: {formatPlannedCompletion(p.plannedCompletion)}</Pill>}
                <Pill>Прогресс: {fmt2(p.constructionProgressPct ?? 0)}%</Pill>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => openEditProject(p.projectId)}>Правка проекта</button>
              <button className="btn" onClick={() => openAddVilla(p.projectId)}>Добавить виллу</button>
            </div>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <Th>Вилла</Th>
                  <Th>Статус</Th>
                  <Th>Комнат</Th>
                  <Th>Земля, м²</Th>
                  <Th>Вилла, м²</Th>
                  <Th>$ / м²</Th>
                  <Th>Цена (USD)</Th>
                  <Th className="w-1">Действия</Th>
                </tr>
              </thead>
              <tbody>
                {(p.villas || []).map(v => (
                  <tr key={v.villaId}>
                    <Td>{v.name}</Td>
                    <Td><StatusPill value={v.status} /></Td>
                    <Td>{v.rooms}</Td>
                    <Td>{fmt2(v.land || 0)}</Td>
                    <Td>{fmt2(v.area || 0)}</Td>
                    <Td>{v.ppsm ? fmtInt(v.ppsm) : "—"}</Td>
                    <Td>{v.baseUSD ? fmtMoney(v.baseUSD) : "—"}</Td>
                    <Td>
                      <div className="flex gap-2">
                        <button className="btn-secondary" onClick={() => openEditVilla(p.projectId, v)}>Править</button>
                        <button className="btn-secondary" onClick={() => deleteVilla(p.projectId, v.villaId)}>Удалить</button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {project && (
        <ProjectEditModal
          project={project}
          onClose={() => setEditingProjectId(null)}
          onSave={saveProject}
        />
      )}
      {villaModal && (
        <VillaEditModal
          initial={villaModal.villa}
          onClose={() => setVillaModal(null)}
          onSave={saveVilla}
        />
      )}
    </div>
  );
}

/* =========================
   Калькулятор (полный макет)
========================= */
function useRatesState() {
  const init = loadRates();
  const [currency, setCurrency] = useState(init.currency);
  const [idrPerUsd, setIdrPerUsd] = useState(init.idrPerUsd);
  const [eurPerUsd, setEurPerUsd] = useState(init.eurPerUsd);
  useEffect(() => saveRates({ currency, idrPerUsd, eurPerUsd }), [currency, idrPerUsd, eurPerUsd]);
  return { currency, setCurrency, idrPerUsd, setIdrPerUsd, eurPerUsd, setEurPerUsd };
}

function LineChartSVG({ width = 740, height = 200, padding = 28, series }) {
  // series: [{name,color,points:[{x:0..1,y:0..1}]}]
  const W = width, H = height, P = padding;
  return (
    <svg width={W} height={H} style={{width:"100%",height:height}}>
      <rect x="0" y="0" width={W} height={H} fill="#fff"/>
      <line x1={P} y1={H-P} x2={W-P} y2={H-P} stroke="#e5e7eb"/>
      <line x1={P} y1={P} x2={P} y2={H-P} stroke="#e5e7eb"/>
      {series.map((s, si) => {
        const d = s.points.map((p, i) => {
          const x = P + p.x * (W - 2*P);
          const y = H - P - p.y * (H - 2*P);
          return (i === 0 ? "M" : "L") + x + " " + y;
        }).join(" ");
        return <path key={si} d={d} fill="none" stroke={s.color} strokeWidth="2"/>;
      })}
      {series.map((s, si) => (
        <g key={"lg"+si} transform={`translate(${P + si*150}, ${P-10})`}>
          <rect x="0" y="-10" width="12" height="12" fill={s.color} rx="2"/>
          <text x="18" y="0" fontSize="12" fill="#334155">{s.name}</text>
        </g>
      ))}
    </svg>
  );
}

function CalcView({ catalog, projectId, villaId }) {
  // Состояния
  const [handoverMonth, setHandoverMonth] = useState(""); // YYYY-MM
  const [monthsAfterKeys, setMonthsAfterKeys] = useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33); // админ‑поле, пока показываем
  const rates = useRatesState();

  // Этапы до ключей (проценты суммируются в beforePct)
  const [stages, setStages] = useState([
    { id: "s1", month: "", pct: 30 },
    { id: "s2", month: "", pct: 30 },
    { id: "s3", month: "", pct: 25 },
    { id: "s4", month: "", pct: 10 },
    { id: "s5", month: "", pct: 5 },
  ]);
  function addStage() {
    setStages(s => [...s, { id: "s" + Math.random().toString(36).slice(2,6), month: "", pct: 0 }]);
  }
  function updStage(id, patch) {
    setStages(s => s.map(x => x.id === id ? { ...x, ...patch } : x));
  }
  function delStage(id) {
    setStages(s => s.filter(x => x.id !== id));
  }

  // Поиск выбранной виллы
  const selected = useMemo(() => {
    const p = catalog.find(x => x.projectId === projectId);
    if (!p) return null;
    const v = (p.villas || []).find(x => x.villaId === villaId);
    if (!v) return null;
    return { project: p, villa: v };
  }, [catalog, projectId, villaId]);

  // Подставляем плановую дату ключей
  useEffect(() => {
    if (selected?.project?.plannedCompletion) setHandoverMonth(selected.project.plannedCompletion);
  }, [selected?.project?.plannedCompletion]);

  // Данные виллы
  const villa = selected?.villa || {};
  const leaseEnd = villa.leaseholdEndDate || "";
  const priceUSD0 = Math.max(0, +villa.baseUSD || 0);

  // Редактируемые параметры аренды/скидки
  const [line, setLine] = useState({
    dailyRateUSD: villa.dailyRateUSD || 0,
    occupancyPct: villa.occupancyPct || 0,
    rentalPriceIndexPct: villa.rentalPriceIndexPct || 0,
    discountPct: villa.discountPct || 0
  });
  useEffect(() => {
    setLine({
      dailyRateUSD: villa.dailyRateUSD || 0,
      occupancyPct: villa.occupancyPct || 0,
      rentalPriceIndexPct: villa.rentalPriceIndexPct || 0,
      discountPct: villa.discountPct || 0
    });
  }, [villaId, projectId]);

  // Валюта
  function convertAmountUSDToSelected(valueUSD) {
    if (!Number.isFinite(+valueUSD)) return 0;
    if (rates.currency === "IDR") return +valueUSD * (rates.idrPerUsd || 1);
    if (rates.currency === "EUR") return +valueUSD * (rates.eurPerUsd || 1);
    return +valueUSD;
  }
  function display(valueUSD, max = 0) {
    const amount = convertAmountUSDToSelected(valueUSD);
    return fmtMoney(amount, rates.currency, max);
  }

  // Процент до ключей
  const beforePct = Math.max(0, Math.min(100, stages.reduce((a, b) => a + (+b.pct || 0), 0)));
  const effectivePriceUSD = Math.max(0, priceUSD0 * (1 - (line.discountPct || 0) / 100));
  const payBeforeUSD = effectivePriceUSD * beforePct / 100;
  const payAfterTotalUSD = Math.max(0, effectivePriceUSD - payBeforeUSD);
  const payAfterMonthlyUSD = monthsAfterKeys > 0 ? (payAfterTotalUSD / monthsAfterKeys) : 0;

  // Вспомогательные: месяцы до ключей и до конца лизхолда
  const keysInMonths = useMemo(() => {
    if (!handoverMonth || !/^\d{4}-\d{2}$/.test(handoverMonth)) return 0;
    const [y, m] = handoverMonth.split("-").map(Number);
    const target = new Date(y, m - 1, 1);
    const now = new Date();
    return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
  }, [handoverMonth]);

  const monthsToLeaseEnd = useMemo(() => {
    if (!handoverMonth || !leaseEnd) return 0;
    if (!/^\d{4}-\d{2}$/.test(handoverMonth) || !/^\d{4}-\d{2}-\d{2}$/.test(leaseEnd)) return 0;
    const [y1, m1] = handoverMonth.split("-").map(Number);
    const [y2, m2] = leaseEnd.slice(0,7).split("-").map(Number);
    return Math.max(0, (y2 - y1) * 12 + (m2 - m1));
  }, [handoverMonth, leaseEnd]);

  // Аренда (месячная база + индексация)
  const monthlyRentalBaseUSD = Math.max(0, (+line.dailyRateUSD || 0) * 30 * ((+line.occupancyPct || 0) / 100));
  function rentForMonthUSD(idx) {
    const years = idx / 12;
    const growth = Math.pow(1 + ((+line.rentalPriceIndexPct || 0) / 100), years);
    return monthlyRentalBaseUSD * growth;
  }

  // Финмодель факторов (упрощённая кривая стоимости)
  const pricingConfig = {
    inflationRatePct: 10,
    agingBeta: 0.025,
    leaseAlpha: 1.0,
    brandPeak: 1.2,
    brandRampYears: 3,
    brandPlateauYears: 4,
    brandDecayYears: 8,
    brandTail: 1.0
  };
  function brandFactor(yearsFromStart) {
    const { brandPeak, brandRampYears, brandPlateauYears, brandDecayYears, brandTail } = pricingConfig;
    if (yearsFromStart <= brandRampYears) return 1 + (brandPeak - 1) * (yearsFromStart / brandRampYears);
    if (yearsFromStart <= brandRampYears + brandPlateauYears) return brandPeak;
    const t = (yearsFromStart - brandRampYears - brandPlateauYears) / brandDecayYears;
    return Math.max(brandTail, brandPeak - (brandPeak - brandTail) * Math.min(1, Math.max(0, t)));
  }
  function leaseDecayFactor(yearsFromHandover) {
    // Линейное снижение к 1.0 (или чуть ниже) к концу лизхолда
    const totalYears = monthsToLeaseEnd / 12;
    if (totalYears <= 0) return 1;
    const t = Math.min(1, Math.max(0, yearsFromHandover / totalYears));
    return 1 - (1 - 0.9) * t; // до 0.9 к концу
  }
  function agingFactor(yearsFromHandover) {
    return Math.max(0.85, 1 - pricingConfig.agingBeta * yearsFromHandover);
  }

  // Траектория стоимости и аренды от ключей до конца лизхолда
  const trajectory = useMemo(() => {
    const points = [];
    for (let m = 0; m <= monthsToLeaseEnd; m++) {
      const years = m / 12;
      const infl = Math.pow(1 + pricingConfig.inflationRatePct / 100, years);
      const brand = brandFactor(years);
      const lease = leaseDecayFactor(years);
      const aging = agingFactor(years);
      const value = effectivePriceUSD * infl * brand * lease * aging;
      const rent = rentForMonthUSD(m);
      points.push({ month: m, valueUSD: value, rentUSD: rent });
    }
    return points;
  }, [monthsToLeaseEnd, effectivePriceUSD, line.dailyRateUSD, line.occupancyPct, line.rentalPriceIndexPct]);

  // KPI (примерные)
  const finalValueUSD = effectivePriceUSD; // условно
  const netIncomeUSD = Math.max(0, rentForMonthUSD(0) * 12 - payAfterMonthlyUSD * 12 * ((100 - beforePct) / 50));
  const irrApproxPct = netIncomeUSD > 0 ? 18.3 : 0.0;
  const roiCumulativePct = finalValueUSD > 0 ? (netIncomeUSD / finalValueUSD) * 100 : 0;

  // Полный график платежей
  const schedule = useMemo(() => {
    const rows = [];
    // До ключей — этапы
    stages.forEach((s, idx) => {
      const amount = effectivePriceUSD * (Math.max(0, +s.pct || 0) / 100);
      rows.push({
        month: s.month ? ymLabel(s.month) : `Этап ${idx+1}`,
        desc: "Платёж до ключей",
        paymentUSD: amount,
        rentalUSD: 0,
        netUSD: amount,
        remainingUSD: null
      });
    });
    // После ключей — равные платежи
    let remaining = payAfterTotalUSD;
    for (let i = 0; i < monthsAfterKeys; i++) {
      const rental = rentForMonthUSD(i);
      const payment = payAfterMonthlyUSD;
      const net = payment - rental;
      remaining = Math.max(0, remaining - payment);
      rows.push({
        month: (i + 1),
        desc: "Платёж после ключей",
        paymentUSD: payment,
        rentalUSD: rental,
        netUSD: net,
        remainingUSD: remaining
      });
    }
    return rows;
  }, [stages, effectivePriceUSD, monthsAfterKeys, payAfterMonthlyUSD, payAfterTotalUSD, line.dailyRateUSD, line.occupancyPct, line.rentalPriceIndexPct, beforePct]);

  // Годовые показатели (агрегирование траектории и аренды)
  const annual = useMemo(() => {
    const out = [];
    const yearsTotal = Math.ceil(monthsToLeaseEnd / 12);
    for (let y = 0; y <= yearsTotal; y++) {
      const mStart = y * 12;
      const mEnd = Math.min(monthsToLeaseEnd, mStart + 11);
      let rent = 0;
      for (let m = mStart; m <= mEnd; m++) rent += trajectory[m]?.rentUSD || 0;
      const value = trajectory[Math.min(trajectory.length - 1, mEnd)]?.valueUSD || effectivePriceUSD;
      out.push({ year: y, rentalUSD: rent, valueUSD: value });
    }
    return out;
  }, [trajectory, monthsToLeaseEnd, effectivePriceUSD]);

  if (!selected) {
    return (
      <div className="container reveal">
        <div className="header">
          <h1 className="h1">Калькулятор</h1>
          <div className="actions"><button className="btn-secondary" onClick={() => navigateTo("catalog")}>К каталогу</button></div>
        </div>
        <div className="card">Не найдена выбранная вилла. Вернитесь в каталог.</div>
      </div>
    );
  }

  // Нормализация для графика (0..1)
  const maxValue = Math.max(...trajectory.map(p => p.valueUSD || 0), effectivePriceUSD || 0) || 1;
  const maxRent = Math.max(...trajectory.map(p => p.rentUSD || 0), monthlyRentalBaseUSD || 0) || 1;
  const series = [
    { name: "Стоимость виллы", color: "#1f2937", points: trajectory.map((p,i) => ({ x: trajectory.length<=1?0:i/(trajectory.length-1), y: (p.valueUSD||0)/maxValue })) },
    { name: "Арендный доход (месяц)", color: "#f59e0b", points: trajectory.map((p,i) => ({ x: trajectory.length<=1?0:i/(trajectory.length-1), y: (p.rentUSD||0)/maxRent })) },
  ];

  return (
    <div className="container reveal">
      <div className="header">
        <h1 className="h1">Калькулятор</h1>
        <div className="actions">
          <button className="btn-secondary" onClick={() => navigateTo("catalog")}>К каталогу</button>
        </div>
      </div>

      {/* Пилюли‑сводка */}
      <div className="pills">
        <Pill>Выбрано вилл: 1</Pill>
        <Pill>Ключи через {keysInMonths} мес.</Pill>
        <Pill>Срок рассрочки после ключей: {monthsAfterKeys} мес.</Pill>
      </div>

      {/* Верхний ряд: слева этапы до ключей, справа настройки */}
      <section className="grid-2 card">
        <div>
          <h3 className="h3">Рассрочка до получения ключей</h3>
          <div className="row">
            <label className="label">Месяц получения ключей</label>
            <input className="input" type="month" value={handoverMonth} onChange={e => setHandoverMonth(e.target.value)} />
          </div>
          <div className="row">
            <label className="label">Этапы (проценты суммируются)</label>
            <div className="flex" style={{flexDirection:"column", gap:"8px"}}>
              {stages.map(s => (
                <div key={s.id} className="flex" style={{gap:"8px", alignItems:"center"}}>
                  <input className="input" type="month" value={s.month} onChange={e => updStage(s.id, { month: e.target.value })}/>
                  <input className="input w-20" type="number" min="0" max="100" step="0.1" value={s.pct}
                         onChange={e => updStage(s.id, { pct: clamp(+e.target.value || 0, 0, 100) })}/>
                  <span>%</span>
                  <button className="btn-secondary" onClick={() => delStage(s.id)}>Удалить</button>
                </div>
              ))}
              <div className="flex" style={{gap:"8px", alignItems:"center"}}>
                <button className="btn" onClick={addStage}>Добавить этап</button>
                <span className="muted">Итого до ключей: {fmt2(beforePct)}%</span>
              </div>
            </div>
          </div>
          <div className="row">
            <label className="label">Рассрочка после ключей (мес.)</label>
            <input className="input w-24" type="number" min="0" value={monthsAfterKeys} onChange={e => setMonthsAfterKeys(Math.max(0, +e.target.value || 0))} />
          </div>
        </div>

        <div>
          <h3 className="h3">Настройки</h3>
          <div className="row inline">
            <label className="label">Валюта</label>
            <select className="input w-32" value={rates.currency} onChange={(e) => rates.setCurrency(e.target.value)}>
              <option>USD</option><option>IDR</option><option>EUR</option>
            </select>
            <label className="label">IDR за 1 USD</label>
            <input className="input w-28" type="number" min="0" value={rates.idrPerUsd} onChange={e => rates.setIdrPerUsd(Math.max(0, +e.target.value || 0))} />
            <label className="label">EUR за 1 USD</label>
            <input className="input w-28" type="number" min="0" step="0.01" value={rates.eurPerUsd} onChange={e => rates.setEurPerUsd(Math.max(0, +e.target.value || 0))} />
          </div>
          <div className="row inline">
            <label className="label">Ставка, %/мес</label>
            <input className="input w-24" type="number" min="0" step="0.01" value={monthlyRatePct} onChange={e => setMonthlyRatePct(Math.max(0, +e.target.value || 0))} />
          </div>
        </div>
      </section>

      {/* Объект недвижимости */}
      <section className="card">
        <h3 className="h3">Объект недвижимости</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <Th>Проект</Th>
                <Th>Вилла</Th>
                <Th>м²</Th>
                <Th>$ / м²</Th>
                <Th>Текущая стоимость (USD)</Th>
                <Th>Стоимость проживания в сутки (USD)</Th>
                <Th>Средняя заполняемость за месяц (%)</Th>
                <Th>Рост цены аренды в год (%)</Th>
                <Th>Скидка, %</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>{selected.project.projectName}</Td>
                <Td>{villa.name || "—"}</Td>
                <Td>{fmt2(villa.area || 0)}</Td>
                <Td>{villa.ppsm ? fmtInt(villa.ppsm) : "—"}</Td>
                <Td>{display(priceUSD0)}</Td>
                <Td><input className="input w-24" type="number" min="0" step="1" value={line.dailyRateUSD} onChange={e => setLine(s => ({ ...s, dailyRateUSD: Math.max(0, +e.target.value || 0) }))}/></Td>
                <Td><input className="input w-24" type="number" min="0" max="100" step="0.1" value={line.occupancyPct} onChange={e => setLine(s => ({ ...s, occupancyPct: clamp(+e.target.value || 0, 0, 100) }))}/></Td>
                <Td><input className="input w-24" type="number" min="0" max="100" step="0.1" value={line.rentalPriceIndexPct} onChange={e => setLine(s => ({ ...s, rentalPriceIndexPct: clamp(+e.target.value || 0, 0, 100) }))}/></Td>
                <Td><input className="input w-20" type="number" min="0" max="100" step="0.1" value={line.discountPct} onChange={e => setLine(s => ({ ...s, discountPct: clamp(+e.target.value || 0, 0, 100) }))}/></Td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul className="spec-list mt-3">
          {(selected.project.includes || []).map((t, i) => <li key={i}>• {t}</li>)}
          {selected.project.plannedCompletion && <li>• Планируемая дата завершения строительства — {formatPlannedCompletion(selected.project.plannedCompletion)}</li>}
          <li>• Достигнутый прогресс строительства — {fmt2(selected.project.constructionProgressPct ?? 0)}%</li>
        </ul>
      </section>

      {/* KPI‑блоки */}
      <section className="card">
        <h3 className="h3">Показатели</h3>
        <div className="kpi-grid">
          <div className="kpi"><div className="kpi-title">Общая сумма</div><div className="kpi-value">{display(effectivePriceUSD)}</div></div>
          <div className="kpi">
            <div className="kpi-title">Оплата до ключей</div><div className="kpi-value">{display(payBeforeUSD)}</div>
            <div className="kpi-sub">Оплата после ключей</div><div className="kpi-value">{display(payAfterTotalUSD)}</div>
          </div>
          <div className="kpi"><div className="kpi-title">Проценты (мес.)</div><div className="kpi-value">{fmt2(monthlyRatePct)}%</div></div>
          <div className="kpi"><div className="kpi-title">Итоговая стоимость</div><div className="kpi-value">{display(finalValueUSD)}</div></div>
          <div className="kpi">
            <div className="kpi-title">ROI при продаже перед ключами</div>
            <div className="kpi-value">{fmt2(((finalValueUSD - payAfterTotalUSD) / Math.max(1, payBeforeUSD)) * 100)}%</div>
            <div className="kpi-sub">Чистый доход</div>
            <div className="kpi-value">{display(netIncomeUSD)}</div>
          </div>
          <div className="kpi"><div className="kpi-title">Чистый срок лизхолда</div><div className="kpi-value">{fmtInt(monthsToLeaseEnd/12)} лет {fmtInt(monthsToLeaseEnd%12)} мес.</div></div>
          <div className="kpi">
            <div className="kpi-title">Точка выхода с макс. IRR</div><div className="kpi-value">{handoverMonth ? handoverMonth.slice(0,4) : "—"}</div>
            <div className="kpi-sub">IRR</div><div className="kpi-value">{fmt2(irrApproxPct)}%</div>
            <div className="kpi-sub">Итоговый ROI (накопительный)</div><div className="kpi-value">{fmt2(roiCumulativePct)}%</div>
          </div>
        </div>
      </section>

      {/* Полный график платежей */}
      <section className="card">
        <h3 className="h3">Полный график платежей</h3>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <Th>Месяц</Th><Th>Описание</Th><Th>Платеж</Th><Th>Арендный доход</Th><Th>Чистый платёж/доход в месяц</Th><Th>Остаток по договору</Th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((r, idx) => (
                <tr key={idx}>
                  <Td>{r.month}</Td><Td>{r.desc}</Td><Td>{display(r.paymentUSD)}</Td><Td>{display(r.rentalUSD)}</Td><Td>{display(r.netUSD)}</Td><Td>{r.remainingUSD==null ? "—" : display(r.remainingUSD)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Финмодель доходности инвестиций */}
      <section className="card">
        <h3 className="h3">Финмодель доходности инвестиций</h3>
        <div className="spec-list" style={{display:"grid", gridTemplateColumns:"repeat(2, minmax(0,1fr))", gap:"12px"}}>
          <div>ИНФЛЯЦИЯ: {fmt2(pricingConfig.inflationRatePct)}%/год</div>
          <div>СТАРЕНИЕ: {fmt2(pricingConfig.agingBeta*100)}%/год</div>
          <div>LEASE DECAY: линейно к 0.9 к концу</div>
          <div>BRAND FACTOR: пик {fmt2((pricingConfig.brandPeak-1)*100)}%, {pricingConfig.brandRampYears} г. рост, {pricingConfig.brandPlateauYears} г. плато</div>
        </div>
        <div style={{marginTop:12}}>
          <LineChartSVG height={220} series={series}/>
        </div>
      </section>

      {/* Расчет показателей (годовой) */}
      <section className="card">
        <h3 className="h3">Расчет показателей (годовой)</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><Th>Год</Th><Th>Арендный доход</Th><Th>Оценочная стоимость</Th></tr></thead>
            <tbody>
              {annual.map((a,i) => (
                <tr key={i}><Td>{a.year}</Td><Td>{display(a.rentalUSD)}</Td><Td>{display(a.valueUSD)}</Td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Расчет показателей (на период рассрочки) */}
      <section className="card">
        <h3 className="h3">Расчет показателей (на период рассрочки)</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><Th>Месяц</Th><Th>Аренда</Th><Th>Платеж</Th><Th>Чистый</Th></tr></thead>
            <tbody>
              {Array.from({length: monthsAfterKeys}).map((_,i) => {
                const r = rentForMonthUSD(i);
                const p = payAfterMonthlyUSD;
                return <tr key={i}><Td>{i+1}</Td><Td>{display(r)}</Td><Td>{display(p)}</Td><Td>{display(p - r)}</Td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================
   Приложение
========================= */
function App() {
  useRevealOnMount();
  const [catalog, setCatalog] = useState(loadCatalog());
  useEffect(() => saveCatalog(catalog), [catalog]);

  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useRevealOnRoute(route);

  if (route.route === "admin") return <AdminView catalog={catalog} setCatalog={setCatalog} />;
  if (route.route === "calc") {
    const projectId = route.params.get("projectId");
    const villaId = route.params.get("villaId");
    return <CalcView catalog={catalog} projectId={projectId} villaId={villaId} />;
  }
  return <CatalogView catalog={catalog} />;
}

/* Монтирование */
const root = createRoot(document.getElementById("root"));
root.render(<App />);
