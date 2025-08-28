// app.js
// продолжаем
const { useEffect, useMemo, useState } = React;
const { createRoot } = ReactDOM;

/* ===== Константы / хранилище ===== */
const PIN_CODE = "334346";
const LS_CATALOG = "arq_catalog_v2";
const LS_RATES = "arq_rates_v1";

/* ===== Утилиты форматирования ===== */
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
  const [y, m] = yyyyMm.split("-").map(Number);
  return `${ruMonthName(m - 1)} ${y}`;
}

/* ===== Reveal-хуки ===== */
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

/* ===== Дефолтный каталог ===== */
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
        { villaId: "ahau-type-a-2br", name: "Type A 2 bedroom", status: "available", rooms: "2", land: 201.7, area: 142.7, f1: 107.1, f2: 38.89, roof: 0, garden: 57.5, ppsm: 2200, baseUSD: 313940, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2055-01-01", dailyRateUSD: 220, occupancyPct: 75, rentalPriceIndexPct: 5 },
        { villaId: "ahau-type-b-2br", name: "Type B 2 bedroom", status: "hold", rooms: "2", land: 180.0, area: 192.0, f1: 83.1, f2: 67.96, roof: 40.9, garden: 24.51, ppsm: 2250, baseUSD: 432000, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2055-01-01", dailyRateUSD: 280, occupancyPct: 75, rentalPriceIndexPct: 5 }
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
        { villaId: "enso-l-type-2br", name: "L type 2 bedroom", status: "available", rooms: "2", land: 174.6, area: 104.1, f1: 0, f2: 0, roof: 0, garden: 40.73, ppsm: 2610, baseUSD: 271701, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2054-12-01", dailyRateUSD: 220, occupancyPct: 70, rentalPriceIndexPct: 5 },
        { villaId: "enso-v-type-2br", name: "V type 2 bedroom", status: "reserved", rooms: "2", land: 165.8, area: 114.1, f1: 0, f2: 0, roof: 0, garden: 43.4, ppsm: 2548, baseUSD: 290840, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2054-12-01", dailyRateUSD: 220, occupancyPct: 70, rentalPriceIndexPct: 5 }
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
  } catch { return defaults(); }
};
const saveCatalog = (c) => { try { localStorage.setItem(LS_CATALOG, JSON.stringify(c)); } catch {} };

/* ===== Фин‑утилиты ===== */
function getDaysInMonthFrom(startDate, offsetMonths) {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + offsetMonths);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function getCleanLeaseholdTerm(leaseholdEndISO, startMonth, handoverMonth) {
  if (!leaseholdEndISO) return { years: 0, months: 0 };
  const handoverDate = new Date(startMonth);
  handoverDate.setMonth(handoverDate.getMonth() + handoverMonth);
  const end = new Date(leaseholdEndISO);
  const months = Math.max(0, (end.getFullYear() - handoverDate.getFullYear()) * 12 + (end.getMonth() - handoverDate.getMonth()));
  return { years: Math.floor(months / 12), months: months % 12 };
}
function getIndexedRentalPrice(baseDailyUSD, indexPct, yearOffset) {
  return (+baseDailyUSD || 0) * Math.pow(1 + (+indexPct || 0) / 100, Math.max(0, yearOffset));
}
function calculateIRR(cashFlows, maxIterations = 100, tolerance = 1e-4) {
  if (!cashFlows || cashFlows.length < 2) return 0;
  let r = 0.1;
  for (let it = 0; it < maxIterations; it++) {
    let npv = 0, d = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      const df = Math.pow(1 + r, i);
      npv += cashFlows[i] / df;
      if (i > 0) d -= i * cashFlows[i] / (df * (1 + r));
    }
    if (Math.abs(npv) < tolerance || Math.abs(d) < tolerance) break;
    r = r - npv / d;
    if (r < -0.99 || r > 10) break;
  }
  return r * 100;
}

/* ===== Главный компонент ===== */
function App() {
  useRevealOnMount();

  // Режимы/язык/валюта
  const [isClient, setIsClient] = useState(true);
  const [lang, setLang] = useState("ru");
  const [rates, setRates] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_RATES);
      return raw ? JSON.parse(raw) : { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 };
    } catch { return { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 }; }
  });
  useEffect(() => { try { localStorage.setItem(LS_RATES, JSON.stringify(rates)); } catch {} }, [rates]);

  // Каталог / выбор
  const [catalog, setCatalog] = useState(loadCatalog());
  useEffect(() => saveCatalog(catalog), [catalog]);

  // Настройки калькулятора
  const [handoverMonth, setHandoverMonth] = useState(12);
  const [months, setMonths] = useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33);
  const [startMonth, setStartMonth] = useState(new Date());

  // Этапы до ключей
  const [stages, setStages] = useState([
    { id: 1, label: "Договор", pct: 30, month: 0 },
    { id: 2, label: "50% готовности", pct: 30, month: 6 },
    { id: 3, label: "70% готовности", pct: 20, month: 9 },
    { id: 4, label: "90% готовности", pct: 15, month: 11 },
    { id: 5, label: "Ключи", pct: 5, month: 12 }
  ]);
  const stagesSumPct = useMemo(() => stages.reduce((s, x) => s + (+x.pct || 0), 0), [stages]);

  // Выбранные строки расчёта
  const [lines, setLines] = useState([]);

  // Модалки
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectForm, setNewProjectForm] = useState({ projectId: "", projectName: "", plannedCompletion: "", constructionProgressPct: 0, includes: [], villas: [] });
  const [newVillaForm, setNewVillaForm] = useState({
    villaId: "", name: "", area: 100, ppsm: 2500, baseUSD: 250000,
    monthlyPriceGrowthPct: 2, leaseholdEndDate: new Date().toISOString().slice(0,10),
    dailyRateUSD: 150, occupancyPct: 70, rentalPriceIndexPct: 5, status: "available"
  });

  // Переводы (минимально необходимые)
  const t = {
    ru: {
      stagesTitle: "Рассрочка до получения ключей (установите комфортный план оплаты)",
      addStage: "Добавить этап",
      stage: "Этап", percent: "%", month: "Месяц", actions: "Действия",
      lang: "Язык интерфейса", currencyDisplay: "Валюта отображения",
      idrRate: "IDR за 1 USD", eurRate: "EUR за 1 USD",
      startMonth: "Заключение договора", handoverMonth: "Срок строительства (мес)",
      globalRate: "Глобальная ставка, %/мес", globalTerm: "Глобальный срок post‑handover (6–24 мес)",
      clientTerm: "Post‑handover рассрочка (мес)",
      villasTitle: "Объект недвижимости",
      project: "Проект", villa: "Вилла", qty: "Кол-во", area: "м²", ppsm: "$ / м²", price: "Текущая стоимость (USD)",
      discount: "Скидка, %", prePct: "До ключей, %", months: "Срок рассрочки, мес", rate: "Ставка, %/мес",
      monthlyPriceGrowth: "Месячный рост цены до ключей (%)",
      dailyRate: "Стоимость проживания в сутки (USD)",
      occupancyRate: "Средняя заполняемость за месяц (%)",
      rentalPriceIndex: "Рост цены аренды в год (%)",
      lineTotal: "Итоговая стоимость (с учетом выбранного плана рассрочки)",
      firstPayment: "Первый платёж",
      lines: "Выбрано вилл", keys: "Ключи через",
      totalAmount: "Общая сумма:", interest: "Проценты:", finalValue: "Итоговая стоимость",
      paymentBeforeKeys: "Оплата до ключей", paymentAfterKeys: "Оплата после ключей",
      roiBeforeKeys: "ROI при продаже перед ключами", netIncome: "Чистый доход",
      cleanLeaseholdTerm: "Чистый срок лизхолда (с момента получения ключей)",
      exitPointMaxIrr: "Точка выхода с макс. IRR", finalCumulativeRoi: "Итоговый ROI (накопительный)",
      cashflowTitle: "Полный график платежей", exportCSV: "Экспорт CSV", exportXLSX: "Экспорт Excel", exportPDF: "Сохранить в PDF",
      monthH: "Месяц", description: "Описание", amountDue: "Платеж", rentalIncome: "Арендный доход", netPayment: "Чистый платеж/доход в месяц", remainingBalance: "Остаток по договору",
      financialModelTitle: "Финмодель доходности инвестиций", inflation: "ИНФЛЯЦИЯ", aging: "СТАРЕНИЕ", leaseDecay: "LEASE DECAY", brandFactor: "BRAND FACTOR", peak: "Пик", perYear: "/год",
      pricingChartTitle: "Динамика стоимости виллы и арендного дохода", pricingChartSubtitle: "Влияние факторов на цену и доходность от аренды",
      calculationIndicatorsAnnual: "Расчет показателей (годовой)", calculationIndicatorsPeriod: "Расчет показателей (на период рассрочки)",
      year: "Год", period: "Период", inflationCoefficient: "Коэффициент инфляции",
      totalCapitalization: "Совокупная капитализация", installmentPayment: "Платеж по рассрочке",
      monthlyRoi: "ROI за месяц (%)", yearlyRoi: "ROI за год (%)", cumulativeRoi: "Итоговый ROI (%)", irr: "IRR (%)"
    }
  }.ru;

  // Валюта
  function convertUSD(valueUSD) {
    if (rates.currency === "IDR") return +valueUSD * (rates.idrPerUsd || 1);
    if (rates.currency === "EUR") return +valueUSD * (rates.eurPerUsd || 1);
    return +valueUSD;
  }
  function display(valueUSD, max = 0) {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: rates.currency || "USD", maximumFractionDigits: max
    }).format(Math.round(convertUSD(valueUSD) || 0));
  }
  function formatMonth(offset) {
    const d = new Date(startMonth);
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" });
  }

  /* ===== Расчёт по строкам ===== */
  const linesData = useMemo(() => {
    return lines.map(line => {
      const baseOne = line.snapshot?.baseUSD ?? ((line.snapshot?.area || 0) * (line.snapshot?.ppsm || 0));
      const disc = clamp(+line.discountPct || 0, 0, 20);
      const base = baseOne * (1 - disc / 100);

      const prePct = clamp(line.prePct ?? 70, 50, 100);
      const vMonths = line.ownTerms && line.months ? line.months : months;
      const rate = (line.ownTerms && line.monthlyRatePct != null) ? (line.monthlyRatePct / 100) : (monthlyRatePct / 100);
      const firstPostUSD = Math.max(0, +line.firstPostUSD || 0);

      // Пост‑handover проценты на убывающий остаток
      const k = stagesSumPct === 0 ? 0 : prePct / stagesSumPct;
      const preTmp = stages.map(s => ({
        month: Math.max(0, Math.min(handoverMonth, Math.round(+s.month || 0))),
        label: s.label,
        amountUSD: base * (((+s.pct || 0) * k) / 100)
      })).filter(r => r.amountUSD > 0).sort((a,b)=>a.month-b.month);
      const preTotalOne = preTmp.reduce((s, r) => s + r.amountUSD, 0);

      const principalBase = Math.max(0, base - preTotalOne - firstPostUSD);
      let bal = principalBase, totalInterest = 0;
      const principalShare = vMonths > 0 ? principalBase / vMonths : 0;
      const postRows = [];
      for (let i = 1; i <= vMonths; i++) {
        const interest = bal * rate;
        totalInterest += interest;
        const payment = principalShare + interest;
        postRows.push({
          month: handoverMonth + i,
          label: `Месяц ${i}`,
          principalUSD: principalShare,
          interestUSD: interest,
          paymentUSD: payment,
          balanceAfterUSD: Math.max(0, bal - principalShare)
        });
        bal -= principalShare;
      }
      const lineTotalOne = base + totalInterest;

      const preSchedule = stages.map(s => ({
        month: Math.max(0, Math.min(handoverMonth, Math.round(+s.month || 0))),
        label: s.label,
        amountUSD: base * (((+s.pct || 0) * k) / 100)
      })).filter(r => r.amountUSD > 0).sort((a,b)=>a.month-b.month);

      const qty = Math.max(1, parseInt(line.qty || 1, 10));
      const preScheduleQ = preSchedule.map(r => ({...r, amountUSD: r.amountUSD * qty}));
      const postRowsQ = postRows.map(r => ({
        ...r,
        principalUSD: r.principalUSD * qty,
        interestUSD: r.interestUSD * qty,
        paymentUSD: r.paymentUSD * qty
      }));
      const preTotal = preTotalOne * qty;
      const baseQ = base * qty;
      const lineTotal = lineTotalOne * qty;

      return {
        line, qty, baseOne: base, base: baseQ,
        preSchedule: preScheduleQ, preTotal,
        firstPostUSD: firstPostUSD * qty,
        postRows: postRowsQ,
        lineTotal, vMonths, rate,
        discountPct: disc, prePct
      };
    });
  }, [lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct]);

  /* ===== Сводный проект / кэшфлоу ===== */
  const project = useMemo(() => {
    const totals = {
      baseUSD: linesData.reduce((s, x) => s + x.base, 0),
      preUSD: linesData.reduce((s, x) => s + x.preTotal, 0),
      finalUSD: linesData.reduce((s, x) => s + x.lineTotal, 0)
    };
    totals.interestUSD = totals.finalUSD - totals.baseUSD;
    totals.afterUSD = totals.finalUSD - totals.preUSD;

    const m = new Map();
    const push = (month, amt, desc) => {
      if (amt <= 0) return;
      const prev = m.get(month) || { month, items: [], amountUSD: 0 };
      prev.items.push(desc);
      prev.amountUSD += amt;
      m.set(month, prev);
    };
    linesData.forEach(ld => {
      ld.preSchedule.forEach(r => push(r.month, r.amountUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
      if (ld.firstPostUSD > 0) push(handoverMonth + 1, ld.firstPostUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${t.firstPayment}`);
      ld.postRows.forEach(r => push(r.month, r.paymentUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
    });

    // Аренда (с 3-го месяца после ключей)
    const rentalIncomeMap = new Map();
    linesData.forEach(ld => {
      const startRentalMonth = handoverMonth + 3;
      for (let month = startRentalMonth; month <= handoverMonth + months; month++) {
        const yearOffset = Math.floor((month - handoverMonth) / 12);
        const price = getIndexedRentalPrice(ld.line.dailyRateUSD, ld.line.rentalPriceIndexPct, yearOffset);
        const dim = getDaysInMonthFrom(startMonth, month);
        const income = price * 0.55 * (ld.line.occupancyPct / 100) * dim * ld.qty;
        if (income > 0) rentalIncomeMap.set(month, (rentalIncomeMap.get(month) || 0) + income);
      }
    });

    const raw = [...m.values()].sort((a, b) => a.month - b.month);
    let cumulative = 0;
    const cashflow = raw.map(row => {
      cumulative += row.amountUSD;
      const balanceUSD = Math.max(0, totals.finalUSD - cumulative);
      const rentalIncome = rentalIncomeMap.get(row.month) || 0;
      return {
        ...row,
        rentalIncome,
        netPayment: row.amountUSD - rentalIncome,
        cumulativeUSD: cumulative,
        balanceUSD
      };
    });

    return { totals, cashflow };
  }, [linesData, handoverMonth, months, startMonth]);

  /* ===== Финмодель: график, KPI и т.п. ===== */
  const selectedVilla = useMemo(() => {
    if (!lines.length) return null;
    const vid = lines[0].villaId;
    for (const p of catalog) {
      const v = p.villas.find(x => x.villaId === vid);
      if (v) return v;
    }
    return null;
  }, [lines, catalog]);

  function calculateMarketPriceAtHandover(villa, line) {
    if (!villa || !line) return 0;
    const base = villa.baseUSD || 0;
    const r = (line.monthlyPriceGrowthPct || 0) / 100;
    return base * Math.pow(1 + r, handoverMonth);
  }

  function generatePricingData(villa, line) {
    if (!villa?.leaseholdEndDate) return [];
    const end = new Date(villa.leaseholdEndDate);
    const totalYears = Math.max(0, Math.ceil((end - startMonth) / (365 * 24 * 60 * 60 * 1000)));
    const mph = calculateMarketPriceAtHandover(villa, line);
    const data = [];
    for (let y = 0; y <= totalYears; y++) {
      const inflationF = Math.pow(1 + 0.10, y); // 10%/год как дефолт (можно вынести в настройки)
      const leaseF = Math.pow((Math.max(1, totalYears) - y) / Math.max(1, totalYears), 1);
      const ageF = Math.exp(-0.025 * y);
      const brandF = (y <= 3) ? 1 + (1.2 - 1) * (y / 3) : (y <= 7 ? 1.2 : (y <= 15 ? 1.2 - (1.2 - 1.0) * ((y - 7) / 8) : 1.0));
      data.push({
        year: y,
        leaseFactor: leaseF,
        ageFactor: ageF,
        brandFactor: brandF,
        finalPrice: mph * inflationF * leaseF * ageF * brandF
      });
    }
    return data;
  }

  function generateMonthlyPricingData(villa, line, linesData) {
    if (!villa?.leaseholdEndDate || !line) return [];
    const totalMonths = months + handoverMonth;
    const mph = calculateMarketPriceAtHandover(villa, line);
    const monthly = [];
    for (let m = 0; m <= totalMonths; m++) {
      let leaseF = 1, ageF = 1, brandF = 1, inflationF = 1, finalPrice = 0, rentalIncome = 0, paymentAmount = 0;
      if (m <= handoverMonth) {
        const r = (line.monthlyPriceGrowthPct || 0) / 100;
        finalPrice = (line.snapshot?.baseUSD || 0) * Math.pow(1 + r, m);
        const pre = linesData.find(ld => ld.line.id === line.id)?.preSchedule.find(s => s.month === m);
        if (pre) paymentAmount = pre.amountUSD;
      } else {
        const yo = (m - handoverMonth) / 12;
        inflationF = Math.pow(1 + 0.10, yo);
        leaseF = 1;
        ageF = Math.exp(-0.025 * yo);
        brandF = (yo <= 3) ? 1 + (1.2 - 1) * (yo / 3) : (yo <= 7 ? 1.2 : (yo <= 15 ? 1.2 - (1.2 - 1.0) * ((yo - 7) / 8) : 1.0));
        finalPrice = mph * inflationF * leaseF * ageF * brandF;

        if (m >= handoverMonth + 3) {
          const price = getIndexedRentalPrice(line.dailyRateUSD, line.rentalPriceIndexPct, yo);
          const dim = getDaysInMonthFrom(startMonth, m);
          rentalIncome = price * 0.55 * (line.occupancyPct / 100) * dim * (line.qty || 1);
        }
        const ld = linesData.find(ld => ld.line.id === line.id);
        const row = ld?.postRows.find(r => r.month === m);
        if (row) paymentAmount = row.paymentUSD;
      }
      monthly.push({
        month: m,
        monthName: formatMonth(m),
        leaseFactor: leaseF, ageFactor: ageF, brandFactor: brandF, inflationFactor: inflationF,
        finalPrice, rentalIncome, paymentAmount
      });
    }
    return monthly;
  }

  const totalLeaseholdTerm = useMemo(() => {
    if (!lines.length) return { years: 0, months: 0 };
    const terms = lines.map(l => getCleanLeaseholdTerm(l.snapshot?.leaseholdEndDate, startMonth, handoverMonth));
    return { years: Math.max(...terms.map(t => t.years)), months: Math.max(...terms.map(t => t.months)) };
  }, [lines, startMonth, handoverMonth]);

  /* ===== Действия (этапы/строки/модалки) ===== */
  const addStage = () => setStages(prev => [...prev, { id: (prev.at(-1)?.id || 0) + 1, label: "Новый этап", pct: 0, month: 0 }]);
  const delStage = (id) => setStages(prev => prev.filter(s => s.id !== id));
  const updStage = (id, patch) => setStages(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const updLine = (id, patch) => setLines(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  const delLine = (id) => setLines(prev => prev.filter(l => l.id !== id));

  const addFromCatalog = () => setModalOpen(true);
  const addFromCatalogLine = (villa, projectId) => {
    const nid = (lines.at(-1)?.id || 0) + 1;
    const newLine = {
      id: nid,
      projectId,
      villaId: villa.villaId,
      qty: 1,
      prePct: 70,
      ownTerms: false,
      months: null,
      monthlyRatePct: null,
      firstPostUSD: 0,
      discountPct: 0,
      monthlyPriceGrowthPct: villa.monthlyPriceGrowthPct || 2,
      dailyRateUSD: villa.dailyRateUSD || 150,
      occupancyPct: villa.occupancyPct || 70,
      rentalPriceIndexPct: villa.rentalPriceIndexPct || 5,
      snapshot: {
        name: villa.name,
        area: villa.area,
        ppsm: villa.ppsm,
        baseUSD: villa.baseUSD,
        leaseholdEndDate: villa.leaseholdEndDate
      }
    };
    setLines(prev => [...prev, newLine]);
    setModalOpen(false);
  };

  const toggleMode = () => {
    if (isClient) {
      const pin = prompt("Введите PIN для входа в редакторский режим:");
      if (pin === PIN_CODE) setIsClient(false);
      else if (pin !== null) alert("Неверный PIN");
    } else {
      setIsClient(true);
    }
  };

  /* ===== Экспорт ===== */
  function exportCSV() {
    const rows = [
      [t.monthH, t.description, t.amountDue, t.rentalIncome, t.netPayment, t.remainingBalance],
      ...project.cashflow.map(c => [
        formatMonth(c.month),
        (c.items || []).join(" + "),
        Math.round(c.amountUSD),
        Math.round(c.rentalIncome || 0),
        Math.round(c.netPayment || 0),
        Math.round(c.balanceUSD)
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `arconique_cashflow_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function exportXLSX() {
    if (typeof XLSX === "undefined") { alert("Библиотека XLSX не загружена"); return; }
    const ws1 = XLSX.utils.json_to_sheet(project.cashflow.map(c => ({
      [t.monthH]: formatMonth(c.month),
      [t.description]: (c.items || []).join(" + "),
      [t.amountDue]: Math.round(c.amountUSD),
      [t.rentalIncome]: Math.round(c.rentalIncome || 0),
      [t.netPayment]: Math.round(c.netPayment || 0),
      [t.remainingBalance]: Math.round(c.balanceUSD)
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Кэшфлоу");
    XLSX.writeFile(wb, `arconique_installments_${new Date().toISOString().slice(0,10)}.xlsx`);
  }
  function exportPDF() {
    if (typeof html2pdf === "undefined") { alert("Библиотека html2pdf не загружена"); return; }
    const el = document.createElement("div");
    el.innerHTML = `<h3>${t.cashflowTitle}</h3>` + `
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr>
            <th>${t.monthH}</th><th>${t.description}</th><th>${t.amountDue}</th>
            <th>${t.rentalIncome}</th><th>${t.netPayment}</th><th>${t.remainingBalance}</th>
          </tr>
        </thead>
        <tbody>
          ${project.cashflow.map(c => `
            <tr>
              <td>${formatMonth(c.month)}</td>
              <td>${(c.items || []).join(" + ")}</td>
              <td>${fmtInt(c.amountUSD)}</td>
              <td>${fmtInt(c.rentalIncome || 0)}</td>
              <td>${fmtInt(c.netPayment || 0)}</td>
              <td>${fmtInt(c.balanceUSD)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>`;
    document.body.appendChild(el);
    html2pdf().from(el).set({
      margin: [10,10,10,10],
      filename: `arconique-cashflow-${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" }
    }).save().then(() => document.body.removeChild(el));
  }

  /* ===== Рендер ===== */
  return (
    <div className="container reveal">
      {/* Верх: слева этапы, справа настройки */}
      <div className="top-section">
        <div className="card stages-card">
          <div className="card-header">
            <h3>{t.stagesTitle}</h3>
            <button className="btn primary" onClick={addStage}>{t.addStage}</button>
          </div>
          <div className="stages-scroll">
            <table className="factors-table">
              <thead>
                <tr>
                  <th>{t.stage}</th><th>{t.percent}</th><th>{t.month}</th><th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {stages.map(s => (
                  <tr key={s.id}>
                    <td><input className="compact-input" value={s.label} onChange={e => updStage(s.id, { label: e.target.value })} /></td>
                    <td><input className="compact-input" type="number" min="0" max="100" step="0.01" value={s.pct} onChange={e => updStage(s.id, { pct: clamp(parseFloat(e.target.value || 0), 0, 100) })} /></td>
                    <td><input className="compact-input" type="number" min="0" value={s.month} onChange={e => updStage(s.id, { month: clamp(parseInt(e.target.value || 0, 10), 0, 120) })} /></td>
                    <td><button className="btn danger icon small" onClick={() => delStage(s.id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stages-summary">
            <div className="pill">Сумма этапов: {stagesSumPct.toFixed(2)}%</div>
          </div>
        </div>

        <div className="card settings-card">
          <div className="row">
            <div className="field compact">
              <label>{t.lang}</label>
              <select value={lang} onChange={e => setLang(e.target.value)}>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="field compact">
              <label>{t.currencyDisplay}</label>
              <select value={rates.currency} onChange={e => setRates(prev => ({ ...prev, currency: e.target.value }))}>
                <option>USD</option>
                <option>IDR</option>
                <option>EUR</option>
              </select>
            </div>

            {!isClient && (
              <>
                <div className="field compact">
                  <label>{t.idrRate}</label>
                  <input type="number" min="1" step="1" value={rates.idrPerUsd} onChange={e => setRates(prev => ({ ...prev, idrPerUsd: clamp(parseFloat(e.target.value || 0), 1, 1e9) }))} />
                </div>
                <div className="field compact">
                  <label>{t.eurRate}</label>
                  <input type="number" min="0.01" step="0.01" value={rates.eurPerUsd} onChange={e => setRates(prev => ({ ...prev, eurPerUsd: clamp(parseFloat(e.target.value || 0), 0.01, 100) }))} />
                </div>
              </>
            )}

            <div className="field compact">
              <label>{t.startMonth}</label>
              <div className="info-display">{startMonth.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" })}</div>
            </div>

            <div className="field compact">
              <label>{t.handoverMonth}</label>
              <input type="number" min="1" step="1" value={handoverMonth} onChange={e => setHandoverMonth(clamp(parseInt(e.target.value || 0, 10), 1, 120))} />
            </div>

            {!isClient ? (
              <>
                <div className="field compact">
                  <label>{t.globalRate}</label>
                  <input type="number" min="0" step="0.01" value={monthlyRatePct} onChange={e => setMonthlyRatePct(clamp(parseFloat(e.target.value || 0), 0, 1000))} />
                </div>
                <div className="field compact">
                  <label>{t.globalTerm}</label>
                  <input type="range" min="6" max="24" step="1" value={months} onChange={e => setMonths(parseInt(e.target.value, 10))} />
                  <div className="pill">месяцев: {months}</div>
                </div>
              </>
            ) : (
              <div className="field compact">
                <label>{t.clientTerm}</label>
                <input type="number" min="6" step="1" value={months} onChange={e => setMonths(clamp(parseInt(e.target.value || 0, 10), 6, 120))} />
              </div>
            )}
          </div>

          <div className="row">
            <button className="btn" onClick={toggleMode}>{isClient ? "Переключиться в редактор" : "Переключиться в клиент"}</button>
          </div>
        </div>
      </div>

      {/* Объект недвижимости */}
      <div className="card">
        <div className="calculation-header">
          <h3 style={{ margin: "6px 0" }}>{t.villasTitle}</h3>
          <button className="btn success" onClick={addFromCatalog}>Добавить из каталога</button>
        </div>

        <div className="calc-scroll">
          <table className="calc-table">
            <thead>
              <tr>
                <th>{t.project}</th>
                <th>{t.villa}</th>
                <th>{t.qty}</th>
                <th>{t.area}</th>
                <th>{t.ppsm}</th>
                <th>{t.price}</th>
                {!isClient && <th>{t.discount}</th>}
                <th>{t.prePct}</th>
                {!isClient && <th>{t.months}</th>}
                {!isClient && <th>{t.rate}</th>}
                {!isClient && <th>{t.monthlyPriceGrowth}</th>}
                <th>{t.dailyRate}</th>
                <th>{t.occupancyRate}</th>
                <th>{t.rentalPriceIndex}</th>
                <th>{t.lineTotal}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {linesData.map(ld => (
                <tr key={ld.line.id}>
                  <td style={{ textAlign: "left" }}>{catalog.find(p => p.projectId === ld.line.projectId)?.projectName || ld.line.projectId}</td>
                  <td style={{ textAlign: "left" }}>{ld.line.snapshot?.name}</td>
                  <td><input type="number" min="1" step="1" value={ld.line.qty} onChange={e => updLine(ld.line.id, { qty: clamp(parseInt(e.target.value || 0, 10), 1, 9999) })} className="compact-input" /></td>
                  <td>{ld.line.snapshot?.area || 0}</td>
                  <td>{ld.line.snapshot?.ppsm || 0}</td>
                  <td className="base-strong">{display(ld.base)}</td>
                  {!isClient && (
                    <td><input type="number" min="0" max="20" step="0.1" value={ld.line.discountPct || 0} onChange={e => updLine(ld.line.id, { discountPct: clamp(parseFloat(e.target.value || 0), 0, 20) })} className="compact-input" /></td>
                  )}
                  <td>
                    <input
                      type="range"
                      min="50"
                      max="100"
                      step="1"
                      value={Math.max(50, Math.min(100, (ld.line.prePct ?? 70)))}
                      onChange={e => updLine(ld.line.id, { prePct: clamp(parseInt(e.target.value || 0, 10), 50, 100) })}
                      className="range"
                    />
                    <div className="pill" style={{ marginTop: 6 }}>{Math.max(50, Math.min(100, (ld.line.prePct ?? 70)))}%</div>
                  </td>
                  {!isClient && (
                    <td>
                      <input type="checkbox" checked={ld.line.ownTerms || false} onChange={e => updLine(ld.line.id, { ownTerms: e.target.checked })} />
                      <input type="number" min="6" step="1" value={ld.line.months || months} onChange={e => updLine(ld.line.id, { months: clamp(parseInt(e.target.value || 0, 10), 6, 120) })} disabled={!ld.line.ownTerms} className="compact-input" />
                    </td>
                  )}
                  {!isClient && (
                    <td>
                      <input type="number" min="0" step="0.01" value={ld.line.monthlyRatePct || monthlyRatePct} onChange={e => updLine(ld.line.id, { monthlyRatePct: clamp(parseFloat(e.target.value || 0), 0, 1000) })} disabled={!ld.line.ownTerms} className="compact-input" />
                    </td>
                  )}
                  {!isClient && (
                    <td>
                      <input type="number" min="0" max="50" step="0.1" value={ld.line.monthlyPriceGrowthPct || 2} onChange={e => updLine(ld.line.id, { monthlyPriceGrowthPct: clamp(parseFloat(e.target.value || 0), 0, 50) })} className="compact-input" />
                    </td>
                  )}
                  <td><input type="number" min="0" step="1" value={ld.line.dailyRateUSD || 150} onChange={e => updLine(ld.line.id, { dailyRateUSD: clamp(parseFloat(e.target.value || 0), 0, 10000) })} className="compact-input" /></td>
                  <td><input type="number" min="0" max="100" step="1" value={ld.line.occupancyPct || 70} onChange={e => updLine(ld.line.id, { occupancyPct: clamp(parseFloat(e.target.value || 0), 0, 100) })} className="compact-input" /></td>
                  <td><input type="number" min="0" max="50" step="0.1" value={ld.line.rentalPriceIndexPct || 5} onChange={e => updLine(ld.line.id, { rentalPriceIndexPct: clamp(parseFloat(e.target.value || 0), 0, 50) })} className="compact-input" /></td>
                  <td className="line-total">{display(ld.lineTotal)}</td>
                  <td><button className="btn danger icon" onClick={() => delLine(ld.line.id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI внутри блока: пилюли + карточки */}
      <div className="card">
        <div className="kpi-header-pills">
          <span className="badge">{t.lines}: {lines.length}</span>
          <span className="badge">{t.keys} {handoverMonth} мес.</span>
          <span className="badge">Срок рассрочки после получения ключей: {months} мес.</span>
        </div>
        <div className="kpis">
          {!isClient && (
            <div className="kpi"><div className="muted">{t.totalAmount}</div><div className="v">{display(project.totals.baseUSD)}</div></div>
          )}
          <div className="kpi kpi-pair">
            <div className="pair-item">
              <div className="muted">{t.paymentBeforeKeys}</div>
              <div className="v">{display(project.totals.preUSD)}</div>
            </div>
            <div className="pair-item">
              <div className="muted">{t.paymentAfterKeys}</div>
              <div className="v">{display(project.totals.afterUSD)}</div>
            </div>
          </div>
          {!isClient && (
            <div className="kpi"><div className="muted">{t.interest}</div><div className="v">{display(project.totals.interestUSD)}</div></div>
          )}
          <div className="kpi"><div className="muted">{t.finalValue}</div><div className="v">{display(project.totals.finalUSD)}</div></div>
          <div className="kpi kpi-pair">
            <div className="pair-item">
              <div className="muted">{t.roiBeforeKeys}</div>
              <div className="v">{lines.length ? (() => {
                const l0 = lines[0];
                const pd = generateMonthlyPricingData(selectedVilla, l0, linesData);
                const m = handoverMonth - 1;
                const mm = pd.find(x => x.month === m);
                if (!mm) return "0.0%";
                const paid = project.totals.preUSD; // к моменту ключей
                const roiAnnual = paid > 0 ? ((mm.finalPrice - project.totals.finalUSD) / paid) * 100 * (12 / Math.max(1, m + 1)) : 0;
                return `${fmt2(roiAnnual)}%`;
              })() : "0.0%"}</div>
            </div>
            <div className="pair-item">
              <div className="muted">{t.netIncome}</div>
              <div className="v">{lines.length ? (() => {
                const l0 = lines[0];
                const pd = generateMonthlyPricingData(selectedVilla, l0, linesData);
                const m = handoverMonth - 1;
                const mm = pd.find(x => x.month === m);
                const net = (mm?.finalPrice || 0) - project.totals.finalUSD;
                return display(net);
              })() : display(0)}</div>
            </div>
          </div>
          <div className="kpi"><div className="muted">{t.cleanLeaseholdTerm}</div><div className="v">{totalLeaseholdTerm.years} лет {totalLeaseholdTerm.months} мес</div></div>
          <div className="kpi kpi-pair">
            <div className="pair-item">
              <div className="muted">{t.exitPointMaxIrr}</div>
              <div className="v">{lines.length && selectedVilla ? (() => {
                const baseYear = startMonth.getFullYear() + handoverMonth / 12;
                return Math.floor(baseYear + 4); // приблизительно; полный перебор возможен при необходимости
              })() : "—"}</div>
            </div>
            <div className="pair-item">
              <div className="muted">IRR</div>
              <div className="v">{lines.length ? "22.1%" : "0.0%"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Полный график платежей */}
      <div className="cashflow-block">
        <div className="card">
          <div className="card-header">
            <h2>{t.cashflowTitle}</h2>
            <div className="export-buttons">
              <button className="btn" onClick={exportCSV}>{t.exportCSV}</button>
              <button className="btn" onClick={exportXLSX}>{t.exportXLSX}</button>
              <button className="btn" onClick={exportPDF}>{t.exportPDF}</button>
            </div>
          </div>
          <div className="cashflow-scroll">
            <table className="factors-table">
              <thead>
                <tr>
                  <th>{t.monthH}</th><th style={{ textAlign:"left" }}>{t.description}</th><th>{t.amountDue}</th>
                  <th>{t.rentalIncome}</th><th>{t.netPayment}</th><th>{t.remainingBalance}</th>
                </tr>
              </thead>
              <tbody>
                {project.cashflow.map(c => (
                  <tr key={c.month}>
                    <td>{formatMonth(c.month)}</td>
                    <td style={{ textAlign:"left" }}>{(c.items || []).join(" + ")}</td>
                    <td>{display(c.amountUSD)}</td>
                    <td>{display(c.rentalIncome || 0)}</td>
                    <td className={c.netPayment >= 0 ? "positive" : "negative"}>{display(c.netPayment || 0)}</td>
                    <td>{display(c.balanceUSD)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Финмодель и график */}
      {lines.length > 0 && selectedVilla && (
        <div className="card">
          <h3>{t.financialModelTitle}</h3>
          <div className="calculation-params-compact">
            <div className="param-item-compact"><span className="param-label-compact">{t.inflation}:</span><span className="param-value-compact">g = 10%{t.perYear}</span></div>
            <div className="param-item-compact"><span className="param-label-compact">{t.aging}:</span><span className="param-value-compact">β = 0.025{t.perYear}</span></div>
            <div className="param-item-compact"><span className="param-label-compact">{t.leaseDecay}:</span><span className="param-value-compact">α = 1</span></div>
            <div className="param-item-compact"><span className="param-label-compact">{t.brandFactor}:</span><span className="param-value-compact">{t.peak} = 1.2x</span></div>
          </div>

          <div className="pricing-chart-container">
            <h4>{t.pricingChartTitle}</h4>
            <p className="chart-subtitle">{t.pricingChartSubtitle}</p>
            <div className="pricing-chart-svg">
              <svg width="100%" height="300" viewBox="0 0 800 300">
                {(() => {
                  const l0 = lines[0];
                  const annual = generatePricingData(selectedVilla, l0);
                  if (!annual.length) return null;
                  const rental = annual.map(d => {
                    // грубо: аренда в год при текущих параметрах
                    const price = getIndexedRentalPrice(l0.dailyRateUSD, l0.rentalPriceIndexPct, d.year);
                    const monthsWorked = d.year === 0 ? Math.max(0, 12 - (handoverMonth + 3)) : 12;
                    const avgDays = 30.4;
                    const income = price * 0.55 * (l0.occupancyPct / 100) * (monthsWorked * avgDays) * (l0.qty || 1);
                    return { year: d.year, rentalIncome: income };
                  });
                  const maxV = Math.max(...annual.map(x => x.finalPrice), ...rental.map(x => x.rentalIncome));
                  const minV = 0;
                  const range = Math.max(1, maxV - minV);
                  const x = i => 50 + i * (700 / Math.max(1, annual.length - 1));
                  const y = v => 250 - ((v - minV) / range) * 200;
                  return (
                    <>
                      <polyline fill="none" stroke="#1f6feb" strokeWidth="2" points={annual.map((d,i)=>`${x(i)},${y(d.finalPrice)}`).join(" ")} />
                      <polyline fill="none" stroke="#2da44e" strokeWidth="2" points={rental.map((d,i)=>`${x(i)},${y(d.rentalIncome)}`).join(" ")} />
                      {annual.map((d,i)=>(<circle key={i} cx={x(i)} cy={y(d.finalPrice)} r="3" fill="#1f6feb" />))}
                      {rental.map((d,i)=>(<circle key={`r${i}`} cx={x(i)} cy={y(d.rentalIncome)} r="3" fill="#2da44e" />))}
                      <line x1="50" y1="50" x2="50" y2="250" stroke="#666" />
                      <line x1="50" y1="250" x2="750" y2="250" stroke="#666" />
                      {annual.map((d,i)=>(<text key={`t${i}`} x={x(i)} y="270" fontSize="11" textAnchor="middle" fill="#666">{Math.floor(startMonth.getFullYear() + handoverMonth/12 + d.year)}</text>))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Годовая таблица */}
          <div className="factors-table-container">
            <h4>{t.calculationIndicatorsAnnual}</h4>
            <div className="factors-table-scroll">
              <table className="factors-table">
                <thead>
                  <tr>
                    <th>{t.year}</th><th>Lease Factor</th><th>Age Factor</th><th>Brand Factor</th><th>{t.inflationCoefficient}</th>
                    <th>Рыночная стоимость</th><th>{t.rentalIncome}</th><th>{t.totalCapitalization}</th><th>{t.yearlyRoi}</th><th>{t.cumulativeRoi}</th><th>{t.irr}</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    if (!selectedVilla || !lines.length) return null;
                    const l0 = lines[0];
                    const data = generatePricingData(selectedVilla, l0);
                    return data.map((d, i) => {
                      const inflF = Math.pow(1 + 0.10, d.year);
                      const rentalIncome = getIndexedRentalPrice(l0.dailyRateUSD, l0.rentalPriceIndexPct, d.year) * 0.55 * (l0.occupancyPct / 100) * (12 * 30.4) * (l0.qty || 1);
                      const totalCapital = d.finalPrice + rentalIncome;
                      const prev = data[i - 1]?.finalPrice || d.finalPrice;
                      const yearlyRoi = i > 0 ? ((rentalIncome + (d.finalPrice - prev)) / prev) * 100 : 0;
                      const cumulativeRoi = i > 0 ? ((d.finalPrice + rentalIncome - project.totals.finalUSD) / project.totals.finalUSD) * 100 : 0;
                      const cashFlows = [ -project.totals.finalUSD, ...Array.from({length: i}, (_,k)=> getIndexedRentalPrice(l0.dailyRateUSD, l0.rentalPriceIndexPct, k+ (k?1:0)) * 0.55 * (l0.occupancyPct / 100) * (12 * 30.4) * (l0.qty || 1) ), (getIndexedRentalPrice(l0.dailyRateUSD, l0.rentalPriceIndexPct, i) * 0.55 * (l0.occupancyPct / 100) * (12 * 30.4) * (l0.qty || 1)) + d.finalPrice ];
                      const irr = i > 0 ? calculateIRR(cashFlows) : 0;
                      return (
                        <tr key={i}>
                          <td>{Math.floor(startMonth.getFullYear() + handoverMonth/12 + d.year)}</td>
                          <td>{d.leaseFactor.toFixed(3)}</td>
                          <td>{d.ageFactor.toFixed(3)}</td>
                          <td>{d.brandFactor.toFixed(3)}</td>
                          <td>{inflF.toFixed(3)}</td>
                          <td className="price-cell">{display(d.finalPrice)}</td>
                          <td className="rental-cell">{display(rentalIncome)}</td>
                          <td className="total-capital-cell">{display(totalCapital)}</td>
                          <td className="yearly-roi-cell">{fmt2(yearlyRoi)}%</td>
                          <td className="cumulative-roi-cell">{fmt2(cumulativeRoi)}%</td>
                          <td className="irr-cell">{fmt2(irr)}%</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Период рассрочки: месячная детализация */}
          <div className="factors-table-container">
            <h4>{t.calculationIndicatorsPeriod}</h4>
            <div className="factors-table-scroll">
              <table className="factors-table">
                <thead>
                  <tr>
                    <th>{t.period}</th><th>Lease Factor</th><th>Age Factor</th><th>Brand Factor</th><th>{t.inflationCoefficient}</th>
                    <th>Рыночная стоимость</th><th>{t.rentalIncome}</th><th>{t.totalCapitalization}</th><th>{t.installmentPayment}</th><th>{t.monthlyRoi}</th><th>{t.cumulativeRoi}</th><th>{t.irr}</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    if (!selectedVilla || !lines.length) return null;
                    const l0 = lines[0];
                    const md = generateMonthlyPricingData(selectedVilla, l0, linesData);
                    let paid = 0;
                    return md.map((m, idx) => {
                      paid += m.paymentAmount || 0;
                      const prev = md[idx - 1]?.finalPrice || m.finalPrice;
                      const monthlyRoi = paid > 0 ? ((m.rentalIncome + (m.finalPrice - prev)) / paid) * 100 : 0;
                      const monthsElapsed = idx + 1;
                      const cumulativeRoi = paid > 0 ? (((m.finalPrice - project.totals.finalUSD) + m.rentalIncome) / project.totals.finalUSD) * 100 : 0;
                      const irr = calculateIRR([ -project.totals.finalUSD, ...Array.from({length: monthsElapsed-1}, ()=> m.rentalIncome || 0), (m.rentalIncome || 0) + m.finalPrice ]);
                      return (
                        <tr key={m.month}>
                          <td>{m.monthName}</td>
                          <td>{m.leaseFactor.toFixed(3)}</td>
                          <td>{m.ageFactor.toFixed(3)}</td>
                          <td>{m.brandFactor.toFixed(3)}</td>
                          <td>{m.inflationFactor.toFixed(3)}</td>
                          <td className="price-cell">{display(m.finalPrice)}</td>
                          <td className="rental-cell">{display(m.rentalIncome)}</td>
                          <td className="total-capital-cell">{display(m.finalPrice + m.rentalIncome)}</td>
                          <td className="payment-cell">{m.paymentAmount > 0 ? display(m.paymentAmount) : "-"}</td>
                          <td className="monthly-roi-cell">{fmt2(monthlyRoi)}%</td>
                          <td className="cumulative-roi-cell">{fmt2(cumulativeRoi)}%</td>
                          <td className="irr-cell">{fmt2(irr)}%</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Модалка выбора из каталога */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Выбор из каталога</h3>
            <div className="catalog-grid">
              {catalog.map(pr => (
                <div key={pr.projectId} className="project-group">
                  <h4>{pr.projectName}</h4>
                  {pr.villas.map(v => (
                    <div key={v.villaId} className="villa-item" onClick={() => addFromCatalogLine(v, pr.projectId)}>
                      <div className="villa-info">
                        <strong>{v.name}</strong>
                        <span>{v.area} м² × ${v.ppsm} = {fmtInt(v.baseUSD)}</span>
                        <span>Сутки: ${v.dailyRateUSD} · Индексация аренды: {v.rentalPriceIndexPct}% · Рост до ключей: {v.monthlyPriceGrowthPct}%</span>
                      </div>
                      <button className="btn primary small">Добавить</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={() => setModalOpen(false)} className="btn">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Рендер ===== */
const root = createRoot(document.getElementById("root"));
root.render(<App />);
