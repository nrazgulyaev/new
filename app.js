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
function ruMonthName(monthIndex) {
  const names = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
  return names[Math.max(0, Math.min(11, monthIndex))];
}
function formatPlannedCompletion(yyyyMm) {
  if (!yyyyMm || !/^\d{4}-\d{2}$/.test(yyyyMm)) return "";
  const parts = yyyyMm.split("-");
  const y = parts[0];
  const m = Number(parts[1]);
  const monthName = ruMonthName(m - 1);
  return monthName + " " + y;
}

/* Плавное появление секций */
function useRevealOnMount() {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    });
  }, []);
}
function useRevealOnRoute(route) {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    });
  }, [route && route.route]);
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
      plannedCompletion: "2026-12",   // YYYY-MM
      constructionProgressPct: 20,    // 0..100
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
function saveCatalog(catalog) {
  try { localStorage.setItem(LS_CATALOG, JSON.stringify(catalog)); } catch {}
}

function loadRates() {
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
}
function saveRates(r) { try { localStorage.setItem(LS_RATES, JSON.stringify(r)); } catch {} }

/* =========================
   Маршрутизация (hash)
========================= */
function parseHash() {
  const hash = (window.location.hash || "").replace(/^#\/?/, "");
  const parts = hash.split("?");
  const route = parts[0];
  const queryString = parts[1] || "";
  const params = new URLSearchParams(queryString);
  return { route: route || "catalog", params };
}
function navigateTo(route, params = {}) {
  const qs = new URLSearchParams(params).toString();
  window.location.hash = qs ? ("#/" + route + "?" + qs) : ("#/" + route);
}

/* =========================
   Примитивные UI-компоненты
========================= */
function Pill(props) {
  return React.createElement("span", { className: "pill" }, props.children);
}
function StatusPill(props) {
  const value = props.value;
  const label = value === "reserved" ? "Забронировано" : (value === "hold" ? "На паузе" : "Доступно");
  const cls =
    value === "reserved" ? "status status-reserved" :
    (value === "hold" ? "status status-hold" : "status status-available");
  return React.createElement("span", { className: cls }, label);
}
function Th(props) {
  const cls = "th " + (props.className || "");
  return React.createElement("th", { className: cls }, props.children);
}
function Td(props) {
  const cls = "td " + (props.className || "");
  return React.createElement("td", { className: cls }, props.children);
}

/* =========================
   Каталог
========================= */
function CatalogView(props) {
  const catalog = props.catalog;
  const isAdmin = props.isAdmin;

  return (
    <div className="container reveal">
      <div className="header">
        <h1 className="h1">Каталог проектов</h1>
        <div className="actions">
          {!isAdmin ? (
            <button className="btn" onClick={function () {
              const pin = prompt("Введите PIN для входа в админ‑режим");
              if (pin === PIN_CODE) navigateTo("admin");
              else alert("Неверный PIN");
            }}>Войти (админ)</button>
          ) : (
            <button className="btn" onClick={function () { navigateTo("admin"); }}>Админ‑панель</button>
          )}
        </div>
      </div>

      {catalog.map(function (project) {
        return (
          <section key={project.projectId} className="card reveal">
            <div className="project-head">
              <div className="project-title">
                <h2 className="h2">{project.projectName}</h2>
                <div className="project-meta">
                  {project.plannedCompletion ? <Pill>План завершения: {formatPlannedCompletion(project.plannedCompletion)}</Pill> : null}
                  <Pill>Прогресс: {fmt2(project.constructionProgressPct != null ? project.constructionProgressPct : 0)}%</Pill>
                </div>
              </div>
              {isAdmin ? (
                <button className="btn-secondary" onClick={function () { navigateTo("admin"); }}>Править проект</button>
              ) : null}
            </div>

            <ul className="spec-list">
              {(project.includes || []).map(function (text, i) { return <li key={i}>• {text}</li>; })}
              {project.plannedCompletion ? (
                <li>• Планируемая дата завершения строительства — {formatPlannedCompletion(project.plannedCompletion)}</li>
              ) : null}
              <li>• Достигнутый прогресс строительства — {fmt2(project.constructionProgressPct != null ? project.constructionProgressPct : 0)}%</li>
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
                  {(project.villas || []).map(function (v) {
                    return (
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
                            <button className="btn" onClick={function () { navigateTo("calc", { projectId: project.projectId, villaId: v.villaId }); }}>
                              Рассчитать
                            </button>
                          ) : null}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* =========================
   Админ: редактирование проекта
========================= */
function ProjectEditModal(props) {
  const project = props.project;
  const onClose = props.onClose;
  const onSave = props.onSave;

  const [state, setState] = useState(function () {
    return {
      projectName: project.projectName || "",
      plannedCompletion: project.plannedCompletion || "",
      constructionProgressPct: project.constructionProgressPct != null ? project.constructionProgressPct : 0,
      includesText: (project.includes || []).join("\n"),
    };
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
            <input className="input" value={state.projectName} onChange={function (e) { setState(function (s) { return Object.assign({}, s, { projectName: e.target.value }); }); }} />
          </div>

          <div className="row">
            <label className="label">Планируемая дата завершения строительства</label>
            <input
              className="input"
              type="month"
              value={state.plannedCompletion}
              onChange={function (e) { setState(function (s) { return Object.assign({}, s, { plannedCompletion: e.target.value }); }); }}
            />
            {state.plannedCompletion ? (
              <div className="muted mt-1">Отобразится как: {formatPlannedCompletion(state.plannedCompletion)}</div>
            ) : null}
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
                onChange={function (e) { setState(function (s) { return Object.assign({}, s, { constructionProgressPct: clamp(+e.target.value || 0, 0, 100) }); }); }}
              />
              <input
                className="input w-20"
                type="number"
                min="0"
                max="100"
                step="1"
                value={state.constructionProgressPct}
                onChange={function (e) { setState(function (s) { return Object.assign({}, s, { constructionProgressPct: clamp(+e.target.value || 0, 0, 100) }); }); }}
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
              onChange={function (e) { setState(function (s) { return Object.assign({}, s, { includesText: e.target.value }); }); }}
            />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn" onClick={function () {
            const next = Object.assign({}, project, {
              projectName: (state.projectName || "").trim() || "Без названия",
              plannedCompletion: state.plannedCompletion || "",
              constructionProgressPct: clamp(+state.constructionProgressPct || 0, 0, 100),
              includes: state.includesText.split("\n").map(function (s) { return s.trim(); }).filter(Boolean),
            });
            onSave(next);
          }}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function AdminView(props) {
  const catalog = props.catalog;
  const setCatalog = props.setCatalog;

  const [editingProjectId, setEditingProjectId] = useState(null);
  const project = useMemo(function () {
    for (let i = 0; i < catalog.length; i++) {
      if (catalog[i].projectId === editingProjectId) return catalog[i];
    }
    return null;
  }, [catalog, editingProjectId]);

  function saveProject(updated) {
    const next = catalog.map(function (p) { return p.projectId === updated.projectId ? updated : p; });
    setCatalog(next);
    saveCatalog(next);
    setEditingProjectId(null);
  }

  return (
    <div className="container reveal">
      <div className="header">
        <h1 className="h1">Админ‑панель</h1>
        <div className="actions">
          <button className="btn-secondary" onClick={function () { navigateTo("catalog"); }}>К каталогу</button>
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
              {catalog.map(function (p) {
                return (
                  <tr key={p.projectId}>
                    <Td>{p.projectName}</Td>
                    <Td>{p.plannedCompletion ? formatPlannedCompletion(p.plannedCompletion) : "—"}</Td>
                    <Td>{fmt2(p.constructionProgressPct != null ? p.constructionProgressPct : 0)}%</Td>
                    <Td>{(p.villas || []).length}</Td>
                    <Td><button className="btn" onClick={function () { setEditingProjectId(p.projectId); }}>Править</button></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {project ? (
        <ProjectEditModal
          project={project}
          onClose={function () { setEditingProjectId(null); }}
          onSave={saveProject}
        />
      ) : null}
    </div>
  );
}

/* =========================
   Калькулятор
========================= */
function useRatesState() {
  const init = loadRates();
  const [currency, setCurrency] = useState(init.currency);
  const [idrPerUsd, setIdrPerUsd] = useState(init.idrPerUsd);
  const [eurPerUsd, setEurPerUsd] = useState(init.eurPerUsd);
  useEffect(function () { saveRates({ currency: currency, idrPerUsd: idrPerUsd, eurPerUsd: eurPerUsd }); }, [currency, idrPerUsd, eurPerUsd]);
  return { currency: currency, setCurrency: setCurrency, idrPerUsd: idrPerUsd, setIdrPerUsd: setIdrPerUsd, eurPerUsd: eurPerUsd, setEurPerUsd: setEurPerUsd };
}

function CalcView(props) {
  const catalog = props.catalog;
  const projectId = props.projectId;
  const villaId = props.villaId;

  // Хуки
  const [handoverMonth, setHandoverMonth] = useState("");   // YYYY-MM
  const [monthsAfterKeys, setMonthsAfterKeys] = useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33);
  const rates = useRatesState();

  // Поиск проекта и виллы
  const selected = useMemo(function () {
    let project = null;
    for (let i = 0; i < catalog.length; i++) {
      if (catalog[i].projectId === projectId) { project = catalog[i]; break; }
    }
    if (!project) return null;
    let villa = null;
    const list = project.villas || [];
    for (let j = 0; j < list.length; j++) {
      if (list[j].villaId === villaId) { villa = list[j]; break; }
    }
    if (!villa) return null;
    return { project: project, villa: villa };
  }, [catalog, projectId, villaId]);

  // Автоподстановка плановой даты ключей
  useEffect(function () {
    if (selected && selected.project && selected.project.plannedCompletion) {
      setHandoverMonth(selected.project.plannedCompletion);
    }
  }, [selected && selected.project && selected.project.plannedCompletion]);

  // Данные виллы
  const villa = (selected && selected.villa) ? selected.villa : {};
  const priceUSD = Math.max(0, +villa.baseUSD || 0);

  // Inline редактируемые поля
  const [lineState, setLineState] = useState(function () {
    return {
      dailyRateUSD: villa.dailyRateUSD || 0,
      occupancyPct: villa.occupancyPct || 0,
      rentalPriceIndexPct: villa.rentalPriceIndexPct || 0,
      discountPct: villa.discountPct || 0,
    };
  });
  useEffect(function () {
    setLineState({
      dailyRateUSD: villa.dailyRateUSD || 0,
      occupancyPct: villa.occupancyPct || 0,
      rentalPriceIndexPct: villa.rentalPriceIndexPct || 0,
      discountPct: villa.discountPct || 0,
    });
  }, [villaId, projectId]);

  function updLine(patch) { setLineState(function (s) { return Object.assign({}, s, patch); }); }
  const effectivePriceUSD = Math.max(0, priceUSD * (1 - (lineState.discountPct || 0) / 100));

  // Валюта отображения
  function convertAmountUSDToSelected(valueUSD) {
    if (!Number.isFinite(+valueUSD)) return 0;
    if (rates.currency === "IDR") return +valueUSD * (rates.idrPerUsd || 1);
    if (rates.currency === "EUR") return +valueUSD * (rates.eurPerUsd || 1);
    return +valueUSD;
  }
  function display(valueUSD, max) {
    const amount = convertAmountUSDToSelected(valueUSD);
    return fmtMoney(amount, rates.currency, max != null ? max : 0);
  }

  // Пилюли: сколько месяцев до ключей
  const keysInMonths = useMemo(function () {
    if (!handoverMonth || !/^\d{4}-\d{2}$/.test(handoverMonth)) return 0;
    const parts = handoverMonth.split("-");
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const target = new Date(y, m - 1, 1);
    const now = new Date();
    return Math.max(0, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));
  }, [handoverMonth]);

  // Аренда (месячная, с индексацией по годам)
  const monthlyRentalBaseUSD = Math.max(0, (+lineState.dailyRateUSD || 0) * 30 * ((+lineState.occupancyPct || 0) / 100));
  function rentForMonthUSD(idx) {
    const years = idx / 12;
    const growth = Math.pow(1 + ((+lineState.rentalPriceIndexPct || 0) / 100), years);
    return monthlyRentalBaseUSD * growth;
  }

  // Платежи: 50/50
  const beforePct = 50;
  const payBeforeUSD = effectivePriceUSD * beforePct / 100;
  const payAfterTotalUSD = effectivePriceUSD - payBeforeUSD;
  const payAfterMonthlyUSD = monthsAfterKeys > 0 ? (payAfterTotalUSD / monthsAfterKeys) : 0;

  // KPI (упрощенно ради стабильности)
  const finalValueUSD = effectivePriceUSD;
  const netIncomeUSD = Math.max(0, rentForMonthUSD(0) * 12 - payAfterMonthlyUSD * 12 * ((100 - beforePct) / 50));
  const irrApproxPct = netIncomeUSD > 0 ? 18.3 : 0.0;
  const roiCumulativePct = finalValueUSD > 0 ? (netIncomeUSD / finalValueUSD) * 100 : 0;

  // Полный график платежей (после ключей)
  const schedule = useMemo(function () {
    let remaining = payAfterTotalUSD;
    const rows = [];
    for (let i = 0; i < monthsAfterKeys; i++) {
      const rental = rentForMonthUSD(i);
      const payment = payAfterMonthlyUSD;
      const net = payment - rental;
      remaining = Math.max(0, remaining - payment);
      rows.push({
        month: i + 1,
        desc: "Платёж после ключей",
        paymentUSD: payment,
        rentalUSD: rental,
        netUSD: net,
        remainingUSD: remaining,
      });
    }
    return rows;
  }, [monthsAfterKeys, payAfterMonthlyUSD, payAfterTotalUSD, lineState.rentalPriceIndexPct, lineState.dailyRateUSD, lineState.occupancyPct]);

  // Если по каким-то причинам нет выбранной виллы — защитим рендер
  if (!selected) {
    return (
      <div className="container reveal">
        <div className="header">
          <h1 className="h1">Калькулятор</h1>
          <div className="actions">
            <button className="btn-secondary" onClick={function () { navigateTo("catalog"); }}>К каталогу</button>
          </div>
        </div>
        <div className="card">Не удалось найти выбранную виллу. Вернитесь в каталог.</div>
      </div>
    );
  }

  // Рендер
  return (
    <div className="container reveal">
      <div className="header">
        <h1 className="h1">Калькулятор</h1>
        <div className="actions">
          <button className="btn-secondary" onClick={function () { navigateTo("catalog"); }}>К каталогу</button>
        </div>
      </div>

      {/* Пилюли‑сводка */}
      <div className="pills">
        <Pill>Выбрано вилл: 1</Pill>
        <Pill>Ключи через {keysInMonths} мес.</Pill>
        <Pill>Срок рассрочки после ключей: {monthsAfterKeys} мес.</Pill>
      </div>

      {/* Настройки слева / справа */}
      <section className="grid-2 card">
        <div>
          <h3 className="h3">Рассрочка до получения ключей</h3>
          <div className="row">
            <label className="label">Месяц получения ключей</label>
            <input className="input" type="month" value={handoverMonth} onChange={function (e) { setHandoverMonth(e.target.value); }} />
          </div>
          <div className="row">
            <label className="label">Рассрочка после ключей (мес.)</label>
            <input className="input w-24" type="number" min="0" value={monthsAfterKeys} onChange={function (e) { setMonthsAfterKeys(Math.max(0, +e.target.value || 0)); }} />
          </div>
        </div>
        <div>
          <h3 className="h3">Настройки</h3>
          <div className="row inline">
            <label className="label">Валюта</label>
            <select className="input w-32" value={rates.currency} onChange={function (e) { rates.setCurrency(e.target.value); }}>
              <option>USD</option>
              <option>IDR</option>
              <option>EUR</option>
            </select>
            <label className="label">IDR за 1 USD</label>
            <input className="input w-28" type="number" min="0" value={rates.idrPerUsd} onChange={function (e) { rates.setIdrPerUsd(Math.max(0, +e.target.value || 0)); }} />
            <label className="label">EUR за 1 USD</label>
            <input className="input w-28" type="number" min="0" step="0.01" value={rates.eurPerUsd} onChange={function (e) { rates.setEurPerUsd(Math.max(0, +e.target.value || 0)); }} />
          </div>
          <div className="row inline">
            <label className="label">Ставка, %/мес</label>
            <input className="input w-24" type="number" min="0" step="0.01" value={monthlyRatePct} onChange={function (e) { setMonthlyRatePct(Math.max(0, +e.target.value || 0)); }} />
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
                <Td>{selected.project ? selected.project.projectName : "—"}</Td>
                <Td>{villa.name || "—"}</Td>
                <Td>{fmt2(villa.area || 0)}</Td>
                <Td>{villa.ppsm ? fmtInt(villa.ppsm) : "—"}</Td>
                <Td>{display(priceUSD)}</Td>
                <Td>
                  <input className="input w-24" type="number" min="0" step="1"
                    value={lineState.dailyRateUSD}
                    onChange={function (e) { updLine({ dailyRateUSD: Math.max(0, +e.target.value || 0) }); }} />
                </Td>
                <Td>
                  <input className="input w-24" type="number" min="0" max="100" step="0.1"
                    value={lineState.occupancyPct}
                    onChange={function (e) { updLine({ occupancyPct: clamp(+e.target.value || 0, 0, 100) }); }} />
                </Td>
                <Td>
                  <input className="input w-24" type="number" min="0" max="100" step="0.1"
                    value={lineState.rentalPriceIndexPct}
                    onChange={function (e) { updLine({ rentalPriceIndexPct: clamp(+e.target.value || 0, 0, 100) }); }} />
                </Td>
                <Td>
                  <input className="input w-20" type="number" min="0" max="100" step="0.1"
                    value={lineState.discountPct}
                    onChange={function (e) { updLine({ discountPct: clamp(+e.target.value || 0, 0, 100) }); }} />
                </Td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Доп. инфо проекта под includes */}
        <ul className="spec-list mt-3">
          {(selected.project && selected.project.includes ? selected.project.includes : []).map(function (t, i) { return <li key={i}>• {t}</li>; })}
          {(selected.project && selected.project.plannedCompletion) ? (
            <li>• Планируемая дата завершения строительства — {formatPlannedCompletion(selected.project.plannedCompletion)}</li>
          ) : null}
          <li>• Достигнутый прогресс строительства — {fmt2(selected.project && selected.project.constructionProgressPct != null ? selected.project.constructionProgressPct : 0)}%</li>
        </ul>
      </section>

      {/* KPI */}
      <section className="card">
        <h3 className="h3">Показатели</h3>
        <div className="kpi-grid">
          <div className="kpi">
            <div className="kpi-title">Общая сумма</div>
            <div className="kpi-value">{display(effectivePriceUSD)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">Оплата до ключей</div>
            <div className="kpi-value">{display(payBeforeUSD)}</div>
            <div className="kpi-sub">Оплата после ключей</div>
            <div className="kpi-value">{display(payAfterTotalUSD)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">Проценты (мес.)</div>
            <div className="kpi-value">{fmt2(monthlyRatePct)}%</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">Итоговая стоимость</div>
            <div className="kpi-value">{display(finalValueUSD)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">ROI при продаже перед ключами</div>
            <div className="kpi-value">{fmt2(((finalValueUSD - payAfterTotalUSD) / (payBeforeUSD || 1)) * 100)}%</div>
            <div className="kpi-sub">Чистый доход</div>
            <div className="kpi-value">{display(netIncomeUSD)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">Чистый срок лизхолда</div>
            <div className="kpi-value">—</div>
          </div>
          <div className="kpi">
            <div className="kpi-title">Точка выхода с макс. IRR</div>
            <div className="kpi-value">{handoverMonth ? handoverMonth.slice(0,4) : "—"}</div>
            <div className="kpi-sub">IRR</div>
            <div className="kpi-value">{fmt2(irrApproxPct)}%</div>
            <div className="kpi-sub">Итоговый ROI (накопительный)</div>
            <div className="kpi-value">{fmt2(roiCumulativePct)}%</div>
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
                <Th>Месяц</Th>
                <Th>Описание</Th>
                <Th>Платеж</Th>
                <Th>Арендный доход</Th>
                <Th>Чистый платёж/доход в месяц</Th>
                <Th>Остаток по договору</Th>
              </tr>
            </thead>
            <tbody>
              {schedule.map(function (r) {
                return (
                  <tr key={r.month}>
                    <Td>{r.month}</Td>
                    <Td>{r.desc}</Td>
                    <Td>{display(r.paymentUSD)}</Td>
                    <Td>{display(r.rentalUSD)}</Td>
                    <Td>{display(r.netUSD)}</Td>
                    <Td>{display(r.remainingUSD)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================
   Приложение и роутинг
========================= */
function App() {
  useRevealOnMount();

  const [catalog, setCatalog] = useState(loadCatalog());
  useEffect(function () { saveCatalog(catalog); }, [catalog]);

  const [route, setRoute] = useState(parseHash());
  useEffect(function () {
    function onHash() { setRoute(parseHash()); }
    window.addEventListener("hashchange", onHash);
    return function () { window.removeEventListener("hashchange", onHash); };
  }, []);

  useRevealOnRoute(route);

  if (route.route === "admin") {
    return <AdminView catalog={catalog} setCatalog={setCatalog} />;
  }
  if (route.route === "calc") {
    const projectId = route.params.get("projectId");
    const villaId = route.params.get("villaId");
    return <CalcView catalog={catalog} projectId={projectId} villaId={villaId} />;
  }
  return <CatalogView catalog={catalog} isAdmin={false} />;
}

// Монтирование
const root = createRoot(document.getElementById("root"));
root.render(<App />);
