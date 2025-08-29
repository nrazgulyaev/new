// app.js
// продолжаем
const { useEffect, useMemo, useRef, useState } = React;
const { createRoot } = ReactDOM;

/* =========================
   Константы и хранилище
========================= */
const PIN_CODE = "334346";
const LS_CATALOG = "arq_catalog_v2";
const LS_RATES = "arq_rates_v1";
const LS_LANG = "arq_lang_v1";

/* =========================
   I18n
========================= */
const DICT = {
  en: {
    app_title: "Arconique / Investment Property Catalog in Bali",
    projects_title: "Projects",
    search_placeholder: "Search by name...",
    btn_presentation: "Project presentation PDF",
    btn_reports: "Construction reports",
    btn_price_list: "Download price list",
    pill_keys_in: (label) => `Keys in ${label}`,
    pill_progress: (pct) => `Current progress: ${pct}%`,
    table_villa: "Villa",
    table_rooms: "Rooms",
    table_land: "Land, m²",
    table_villa_area: "Villa, m²",
    table_floor1: "1st floor, m²",
    table_floor2: "2nd floor, m²",
    table_rooftop: "Rooftop, m²",
    table_garden: "Garden & pool, m²",
    table_ppsm: "Price per m², $",
    table_price_vat: "Price incl. VAT, $",
    table_status: "Status",
    table_action: "Payments & model",
    status_available: "available",
    status_reserved: "reserved",
    status_hold: "on hold",
    catalog_includes: "Included in price",
    modal_add_project: "Add project",
    modal_edit_project: "Edit project",
    label_project_name: "Project name",
    label_planned_completion: "Planned completion (month/year)",
    label_progress: "Construction progress (%)",
    label_presentation_url: "Presentation URL (PDF)",
    label_master_url: "Master plan URL (image)",
    label_master_caption: "Master plan caption",
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_add_villa: "Add villa",
    btn_edit: "Edit",
    btn_delete: "Delete",
    reports_title: (n) => `Construction reports — ${n}`,
    reports_empty: "No reports yet",
    report_type_yt: "YouTube",
    report_type_album: "Photo/Album",
    reports_add: "Add report",
    report_name: "Title",
    report_date: "Date (month/year)",
    report_type: "Type",
    report_link: "URL",
    btn_open: "Open",
    // calculator (key ones)
    calc_back: "← Back to catalog",
    preinstallments_title: "Installments before key handover (set a comfortable plan)",
    btn_add_stage: "Add stage",
    stages_head_name: "Stage",
    stages_head_pct: "%",
    stages_head_month: "Month",
    stages_head_actions: "Actions",
    stages_sum_exceeds: (sum, target) => `Stages sum: ${sum}% — exceeds target ${target}%`,
    stages_sum_below: (sum, target) => `Stages sum: ${sum}% — below target ${target}%`,
    stages_sum_equal: (sum, target) => `Stages sum: ${sum}% — equals target ${target}%`,
    settings_title_lang: "Interface language",
    settings_title_currency: "Display currency",
    settings_contract: "Contract signing",
    settings_handover_label: "Key handover",
    settings_duration_fallback: "Construction duration (months)",
    settings_global_rate: "Global monthly rate, %/mo",
    settings_global_term: "Global post‑handover term (6–24 mo)",
    settings_months: (m) => `months: ${m}`,
    object_title: "Property object",
    // currency selector
    curr_usd: "USD",
    curr_idr: "IDR",
    curr_eur: "EUR",
  },
  ru: {
    app_title: "Arconique / Каталог инвестиционной недвижимости на Бали",
    projects_title: "Проекты",
    search_placeholder: "Поиск по названию...",
    btn_presentation: "Презентация проекта PDF",
    btn_reports: "Отчеты о строительстве",
    btn_price_list: "Скачать прайс-лист",
    pill_keys_in: (label) => `Ключи в ${label}`,
    pill_progress: (pct) => `Текущий прогресс: ${pct}%`,
    table_villa: "Вилла",
    table_rooms: "Комнат",
    table_land: "Земля, м²",
    table_villa_area: "Вилла, м²",
    table_floor1: "1 этаж, м²",
    table_floor2: "2 этаж, м²",
    table_rooftop: "Руфтоп, м²",
    table_garden: "Сад и бассейн, м²",
    table_ppsm: "Цена за м², $",
    table_price_vat: "Цена с НДС, $",
    table_status: "Статус",
    table_action: "Платежи и финмодель",
    status_available: "в наличии",
    status_reserved: "забронировано",
    status_hold: "на паузе",
    catalog_includes: "В стоимость включено",
    modal_add_project: "Добавить проект",
    modal_edit_project: "Правка проекта",
    label_project_name: "Название проекта",
    label_planned_completion: "Планируемая дата завершения (месяц/год)",
    label_progress: "Достигнутый прогресс строительства (%)",
    label_presentation_url: "Ссылка на презентацию (PDF)",
    label_master_url: "URL мастер‑плана (изображение)",
    label_master_caption: "Подпись к мастер‑плану",
    btn_save: "Сохранить",
    btn_cancel: "Отмена",
    btn_add_villa: "Добавить виллу",
    btn_edit: "Править",
    btn_delete: "Удалить",
    reports_title: (n) => `Отчеты о строительстве — ${n}`,
    reports_empty: "Пока нет отчётов",
    report_type_yt: "YouTube",
    report_type_album: "Фото/Альбом",
    reports_add: "Добавить отчёт",
    report_name: "Название",
    report_date: "Дата (месяц/год)",
    report_type: "Тип",
    report_link: "Ссылка",
    btn_open: "Открыть",
    calc_back: "← К каталогу",
    preinstallments_title: "Рассрочка до получения ключей (установите комфортный план оплаты)",
    btn_add_stage: "Добавить этап",
    stages_head_name: "Этап",
    stages_head_pct: "%",
    stages_head_month: "Месяц",
    stages_head_actions: "Действия",
    stages_sum_exceeds: (sum, target) => `Сумма этапов: ${sum}% — превышает ${target}%`,
    stages_sum_below: (sum, target) => `Сумма этапов: ${sum}% — ниже целевого ${target}%`,
    stages_sum_equal: (sum, target) => `Сумма этапов: ${sum}% — совпадает с целевым ${target}%`,
    settings_title_lang: "Язык интерфейса",
    settings_title_currency: "Валюта отображения",
    settings_contract: "Заключение договора",
    settings_handover_label: "Завершение строительства",
    settings_duration_fallback: "Срок строительства (мес)",
    settings_global_rate: "Глобальная ставка, %/мес",
    settings_global_term: "Глобальный срок post‑handover (6–24 мес)",
    settings_months: (m) => `месяцев: ${m}`,
    object_title: "Объект недвижимости",
    curr_usd: "USD",
    curr_idr: "IDR",
    curr_eur: "EUR",
  }
};
function useLang() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem(LS_LANG) || "en"; } catch { return "en"; }
  });
  useEffect(() => { try { localStorage.setItem(LS_LANG, lang); } catch {} }, [lang]);
  const dict = DICT[lang] || DICT.en;
  const t = (key, ...args) => {
    const v = dict[key];
    return typeof v === "function" ? v(...args) : (v ?? key);
  };
  return { lang, setLang, t };
}

/* =========================
   Форматирование, даты, деньги
========================= */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmtInt = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmt2 = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(+n || 0);
function ruMonthName(i) {
  const m = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
  return m[Math.max(0, Math.min(11, i))];
}
function ruMonthNamePrepositional(i) {
  const m = ["январе","феврале","марте","апреле","мае","июне","июле","августе","сентябре","октябре","ноябре","декабре"];
  return m[Math.max(0, Math.min(11, i))];
}
function ymLabel(yyyyMm) {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return "—";
  const [y, m] = yyyyMm.split("-").map(Number);
  return `${ruMonthName(m - 1)} ${y}`;
}
function ymLabelPrepositional(yyyyMm) {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return "—";
  const [y, m] = yyyyMm.split("-").map(Number);
  return `${ruMonthNamePrepositional(m - 1)} ${y}`;
}
function normalizeYM(input) {
  if (!input) return "";
  if (/^\d{4}-\d{2}$/.test(input)) return input;
  const mapRu = { "январ":"01","феврал":"02","март":"03","апрел":"04","май":"05","мая":"05","июн":"06","июл":"07","август":"08","сентябр":"09","октябр":"10","ноябр":"11","декабр":"12" };
  const v = (input || "").toString().trim().toLowerCase();
  const ym = v.match(/(20\d{2})[-/.](\d{1,2})/);
  if (ym) return `${ym[1]}-${ym[2].padStart(2, "0")}`;
  const ru = v.match(/([а-я]+)/i), y = v.match(/(20\d{2})/);
  if (ru && y) { const k = Object.keys(mapRu).find(k => ru[1].startsWith(k)); if (k) return `${y[1]}-${mapRu[k]}`; }
  return "";
}
function monthsDiff(fromDate, yyyyMm) {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return null;
  const [y, m] = yyyyMm.split("-").map(Number);
  const target = new Date(y, m - 1, 1);
  const base = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  return Math.max(0, (target.getFullYear() - base.getFullYear()) * 12 + (target.getMonth() - base.getMonth()));
}
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const getYoutubeId = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {}
  return null;
};
function fmtMoney(n, c = "USD", max = 0) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: max }).format(Math.round(+n || 0));
}

/* =========================
   Reveal анимация
========================= */
function useRevealOnMount() {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    });
  }, []);
}
function useRevealOnRoute(routeKey) {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    });
  }, [routeKey]);
}

/* =========================
   Портал для модалок
========================= */
function Portal({ children }) {
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
    elRef.current.className = "portal-root";
  }
  useEffect(() => {
    const el = elRef.current;
    document.body.appendChild(el);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      try { document.body.removeChild(el); } catch {}
    };
  }, []);
  return ReactDOM.createPortal(children, elRef.current);
}

/* =========================
   Дефолтные данные каталога
========================= */
function defaults() {
  return [
    {
      projectId: "ahau-gardens",
      projectName: "Ahau Gardens by Arconique",
      theme: "light",
      plannedCompletion: "2026-12",
      constructionProgressPct: 20,
      presentationUrl: "",
      masterPlan: { url: "", caption: "" },
      constructionReports: [],
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
      presentationUrl: "",
      masterPlan: { url: "", caption: "" },
      constructionReports: [],
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
const migrateProject = (p) => ({
  ...p,
  plannedCompletion: normalizeYM(p.plannedCompletion) || "",
  presentationUrl: typeof p.presentationUrl === "string" ? p.presentationUrl : "",
  masterPlan: p.masterPlan && typeof p.masterPlan === "object" ? { url: p.masterPlan.url || "", caption: p.masterPlan.caption || "" } : { url: "", caption: "" },
  constructionReports: Array.isArray(p.constructionReports) ? p.constructionReports : [],
});
const loadCatalog = () => {
  try {
    const raw = localStorage.getItem(LS_CATALOG);
    const cat = raw ? JSON.parse(raw) : defaults();
    const norm = Array.isArray(cat) ? cat : defaults();
    return norm.map(migrateProject);
  } catch { return defaults().map(migrateProject); }
};
const saveCatalog = (c) => { try { localStorage.setItem(LS_CATALOG, JSON.stringify(c)); } catch {} };

/* =========================
   Финансовые утилиты
========================= */
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

/* =========================
   CatalogManager
========================= */
function CatalogManager({ catalog, setCatalog, onCalculate, isClient, lang, setLang, rates, setRates, t }) {
  const [searchTerm, setSearchTerm] = useState("");

  const [editingProject, setEditingProject] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [editingVilla, setEditingVilla] = useState(null);
  const [reportsProject, setReportsProject] = useState(null);

  const [newProjectForm, setNewProjectForm] = useState({
    projectId: "", projectName: "", plannedCompletion: "2026-12", constructionProgressPct: 20,
    presentationUrl: "", masterPlan: { url: "", caption: "" }, constructionReports: [], includes: []
  });
  const [newVillaForm, setNewVillaForm] = useState({
    projectId: "", villaId: "", name: "", status: "available",
    rooms: "", land: 0, area: 100, f1: 0, f2: 0, roof: 0, garden: 0,
    ppsm: 2500, baseUSD: 250000,
    monthlyPriceGrowthPct: 2, leaseholdEndDate: new Date().toISOString().slice(0,10),
    dailyRateUSD: 150, occupancyPct: 70, rentalPriceIndexPct: 5
  });

  function StatusPill({ status }) {
    const key = status === "available" ? "status_available" : status === "reserved" ? "status_reserved" : "status_hold";
    const cls = status === "available" ? "status-available" : status === "reserved" ? "status-reserved" : "status-hold";
    return <span className={`status ${cls}`}>{t(key)}</span>;
  }

  const filtered = useMemo(() => {
    if (!searchTerm) return catalog;
    const s = searchTerm.toLowerCase();
    return catalog.map(p => ({
      ...p,
      villas: p.villas.filter(v => (v.name || "").toLowerCase().includes(s))
    })).filter(p => p.villas.length > 0 || (p.projectName || "").toLowerCase().includes(s));
  }, [catalog, searchTerm]);

  function convertUSD(valueUSD) {
    if (rates.currency === "IDR") return +valueUSD * (rates.idrPerUsd || 1);
    if (rates.currency === "EUR") return +valueUSD * (rates.eurPerUsd || 1);
    return +valueUSD;
  }
  function displayMoney(valueUSD, max = 0) {
    const v = convertUSD(valueUSD);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: rates.currency || "USD", maximumFractionDigits: max }).format(Math.round(v || 0));
  }

  const projectAnchors = useMemo(() => filtered.map(p => ({ id: p.projectId, name: p.projectName })), [filtered]);

  const addProject = () => {
    setNewProjectForm({
      projectId: "", projectName: "", plannedCompletion: "2026-12", constructionProgressPct: 20,
      presentationUrl: "", masterPlan: { url: "", caption: "" }, constructionReports: [], includes: []
    });
    setShowAddProjectModal(true);
  };
  const saveProject = () => {
    if (!newProjectForm.projectName) { alert(t("label_project_name")); return; }
    const projectIdBase = newProjectForm.projectName.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    let projectId = projectIdBase || `project-${Date.now()}`;
    let suffix = 2;
    while (catalog.find(p => p.projectId === projectId)) projectId = `${projectIdBase}-${suffix++}`;
    const planned = normalizeYM(newProjectForm.plannedCompletion);
    const newProject = { ...newProjectForm, projectId, plannedCompletion: planned };
    setCatalog(prev => [...prev, { ...newProject, villas: [] }]);
    setShowAddProjectModal(false);
  };
  const deleteProject = (projectId) => {
    if (!confirm("Delete? / Удалить?")) return;
    setCatalog(prev => prev.filter(p => p.projectId !== projectId));
  };

  const openEditProject = (project) => setEditingProject({ ...project });
  const commitEditProject = () => {
    const planned = normalizeYM(editingProject.plannedCompletion);
    const mp = editingProject.masterPlan || { url: "", caption: "" };
    setCatalog(prev => prev.map(p => p.projectId === editingProject.projectId
      ? { ...editingProject, plannedCompletion: planned, masterPlan: { url: mp.url || "", caption: mp.caption || "" } }
      : p));
    setEditingProject(null);
  };

  const addVilla = (projectId) => {
    setShowAddVillaModal(true);
    setNewVillaForm({
      projectId, villaId: "", name: "", status: "available",
      rooms: "", land: 0, area: 100, f1: 0, f2: 0, roof: 0, garden: 0,
      ppsm: 2500, baseUSD: 250000,
      monthlyPriceGrowthPct: 2, leaseholdEndDate: new Date().toISOString().slice(0,10),
      dailyRateUSD: 150, occupancyPct: 70, rentalPriceIndexPct: 5
    });
  };
  const uniqueVillaId = (project, baseName) => {
    const base = `${project.projectId}-${(baseName || "").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")}` || `${project.projectId}-villa`;
    if (!project.villas.find(v => v.villaId === base)) return base;
    let i = 2, id = `${base}-${i}`;
    while (project.villas.find(v => v.villaId === id)) { i += 1; id = `${base}-${i}`; }
    return id;
  };
  const saveVilla = () => {
    const project = catalog.find(p => p.projectId === newVillaForm.projectId);
    if (!project) { alert("No project"); return; }
    if (!newVillaForm.name) { alert("Name / Название"); return; }
    const villaId = uniqueVillaId(project, newVillaForm.name);
    const v = { ...newVillaForm, villaId };
    setCatalog(prev => prev.map(p => p.projectId === project.projectId ? { ...p, villas: [...p.villas, v] } : p));
    setShowAddVillaModal(false);
  };
  const deleteVilla = (projectId, villaId) => {
    if (!confirm("Delete? / Удалить?")) return;
    setCatalog(prev => prev.map(p => p.projectId === projectId ? { ...p, villas: p.villas.filter(v => v.villaId !== villaId) } : p));
  };

  function openEditVilla(villa, projectId) { setEditingVilla({ ...villa, projectId }); }
  function commitEditVilla() {
    setCatalog(prev => prev.map(p => p.projectId === editingVilla.projectId
      ? { ...p, villas: p.villas.map(x => x.villaId === editingVilla.villaId ? editingVilla : x) }
      : p
    ));
    setEditingVilla(null);
  }

  function openReports(project) { setReportsProject({ ...project }); }
  function addReport(patch) {
    const item = { id: uid(), date: patch.date || "", title: patch.title || "", type: patch.type || "youtube", url: patch.url || "" };
    setReportsProject(prev => ({ ...prev, constructionReports: [...(prev.constructionReports || []), item] }));
  }
  function deleteReport(id) {
    setReportsProject(prev => ({ ...prev, constructionReports: (prev.constructionReports || []).filter(r => r.id !== id) }));
  }
  function saveReportsToProject() {
    if (!reportsProject) return;
    setCatalog(prev => prev.map(p => p.projectId === reportsProject.projectId ? { ...p, constructionReports: reportsProject.constructionReports || [] } : p));
    setReportsProject(null);
  }

  // Экспорт проекта в PDF — через клон (устойчиво)
  function exportProjectPDF(projectId) {
    try {
      if (typeof html2pdf === "undefined") {
        alert("html2pdf not loaded");
        return;
      }
      const original = document.getElementById(`project-${projectId}`);
      if (!original) { alert("Project block not found"); return; }

      const clone = original.cloneNode(true);
      const wrapper = document.createElement("div");
      wrapper.className = "project-print print-mode";
      wrapper.style.position = "fixed";
      wrapper.style.inset = "0";
      wrapper.style.background = "#fff";
      wrapper.style.overflow = "auto";
      wrapper.style.opacity = "0";
      // скрыть все изображения (CORS)
      clone.querySelectorAll("img").forEach(img => { img.style.display = "none"; });
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const wrap = wrapper.querySelector(".table-wrap");
      const table = wrapper.querySelector(".catalog-table");
      if (wrap) { wrap.style.overflow = "visible"; wrap.style.maxWidth = "none"; }
      if (table) { table.style.width = "100%"; table.style.minWidth = "auto"; table.style.tableLayout = "fixed"; }

      const run = () => {
        const windowWidth = wrapper.scrollWidth;
        const windowHeight = Math.max(wrapper.scrollHeight, 800);
        return html2pdf().from(wrapper).set({
          margin: 6,
          filename: `arconique-price-list-${projectId}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { backgroundColor: "#fff", scale: 2, useCORS: true, allowTaint: false, scrollX: 0, scrollY: 0, windowWidth, windowHeight },
          jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
          pagebreak: { mode: ["css", "legacy"] }
        }).save();
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          run().finally(() => { try { document.body.removeChild(wrapper); } catch {} });
        });
      });
    } catch (e) {
      console.error(e);
      alert("PDF failed, see console");
    }
  }

  return (
    <div className="catalog-section reveal">
      <div className="catalog-header">
        <h2>{t("projects_title")}</h2>
        <div className="catalog-controls">
          <input className="search-input" placeholder={t("search_placeholder")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <select className="btn small" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
          <select className="btn small" value={rates.currency} onChange={e => setRates(prev => ({ ...prev, currency: e.target.value }))}>
            <option value="USD">{t("curr_usd")}</option>
            <option value="IDR">{t("curr_idr")}</option>
            <option value="EUR">{t("curr_eur")}</option>
          </select>
          {!isClient && (
            <>
              <input className="btn small" style={{ width:110 }} type="number" step="1" value={rates.idrPerUsd || 16300}
                     onChange={e => setRates(prev => ({ ...prev, idrPerUsd: clamp(parseFloat(e.target.value||0), 1, 1e9) }))} title="IDR per USD" />
              <input className="btn small" style={{ width:110 }} type="number" step="0.01" value={rates.eurPerUsd || 0.88}
                     onChange={e => setRates(prev => ({ ...prev, eurPerUsd: clamp(parseFloat(e.target.value||0), 0.01, 100) }))} title="EUR per USD" />
            </>
          )}
          {!isClient && <button className="btn primary small" onClick={addProject}>{t("modal_add_project")}</button>}
        </div>
      </div>

      {/* Якоря проектов */}
      <div className="project-anchors">
        <button className="pill link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>All</button>
        {projectAnchors.map(a => (
          <button key={a.id} className="pill link" onClick={() => {
            const el = document.getElementById(`project-${a.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>{a.name}</button>
        ))}
      </div>

      <div className="catalog-list">
        {filtered.map(project => (
          <div id={`project-${project.projectId}`} key={project.projectId} className="project-card">
            <div className="project-header">
              <h3>{project.projectName}</h3>
              <div className="project-actions" style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                {project.presentationUrl && (
                  <a className="btn small" href={project.presentationUrl} target="_blank" rel="noreferrer">{t("btn_presentation")}</a>
                )}
                <button className="btn small" onClick={() => openReports(project)}>{t("btn_reports")}</button>
                <button className="btn small" onClick={() => exportProjectPDF(project.projectId)}>{t("btn_price_list")}</button>
                {!isClient && <button className="btn small" onClick={() => openEditProject(project)}>✏️</button>}
                {!isClient && <button className="btn danger small" onClick={() => deleteProject(project.projectId)}>{t("btn_delete")}</button>}
                {!isClient && <button className="btn success small" onClick={() => addVilla(project.projectId)}>{t("btn_add_villa")}</button>}
              </div>
            </div>

            <div className="pill-row">
              {project.plannedCompletion && (
                <span className="pill">{t("pill_keys_in", ymLabelPrepositional(project.plannedCompletion))}</span>
              )}
              {Number.isFinite(project.constructionProgressPct) && (
                <span className="pill pill-muted">{t("pill_progress", project.constructionProgressPct)}</span>
              )}
            </div>

            <div className="project-details-grid">
              <div>
                <div className="project-includes">
                  <div className="includes-title">{t("catalog_includes")}</div>
                  <ul className="includes-list">
                    {(project.includes || []).map((item, i) => (<li key={i}>{item}</li>))}
                  </ul>
                </div>
              </div>
              <div>
                {project.masterPlan?.url ? (
                  <a className="masterplan-card" href={project.masterPlan.url} target="_blank" rel="noreferrer" title="Master plan">
                    <img className="masterplan-img" src={project.masterPlan.url} alt="Master plan" crossOrigin="anonymous" />
                    {project.masterPlan.caption ? <div className="label" style={{ marginTop:8 }}>{project.masterPlan.caption}</div> : null}
                  </a>
                ) : (
                  !isClient ? <div className="masterplan-card"><div className="label">Add master plan URL</div></div> : null
                )}
              </div>
            </div>

            <div className="table-wrap scroll-x">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th className="w-1">{t("table_villa")}</th>
                    <th className="w-1">{t("table_rooms")}</th>
                    <th className="w-1">{t("table_land")}</th>
                    <th className="w-1">{t("table_villa_area")}</th>
                    <th className="w-1">{t("table_floor1")}</th>
                    <th className="w-1">{t("table_floor2")}</th>
                    <th className="w-1">{t("table_rooftop")}</th>
                    <th className="w-1">{t("table_garden")}</th>
                    <th className="w-1">{t("table_ppsm")}</th>
                    <th className="w-1">{t("table_price_vat")}</th>
                    <th className="w-1">{t("table_status")}</th>
                    <th className="w-1">{t("table_action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {project.villas.map(v => {
                    const isAvail = v.status === "available";
                    return (
                      <tr key={v.villaId}>
                        <td className="td-left">{v.name}</td>
                        <td>{v.rooms || "—"}</td>
                        <td>{v.land ?? 0}</td>
                        <td>{v.area ?? 0}</td>
                        <td>{v.f1 ?? 0}</td>
                        <td>{v.f2 ?? 0}</td>
                        <td>{v.roof ?? 0}</td>
                        <td>{v.garden ?? 0}</td>
                        <td>{isAvail ? (rates.currency === "USD" ? (v.ppsm ?? 0) : Math.round(convertUSD((v.ppsm ?? 0)))) : "—"}</td>
                        <td>{isAvail ? displayMoney((v.baseUSD || 0) * 1.10) : "—"}</td>
                        <td><StatusPill status={v.status} /></td>
                        <td>
                          {isAvail ? (
                            <button className="btn small primary" onClick={() => onCalculate(project, v)}>{lang === "en" ? "Calculate" : "Рассчитать"}</button>
                          ) : null}
                          {!isClient && (
                            <div style={{ display: "inline-flex", gap: 6, marginLeft: 8 }}>
                              <button className="btn small" onClick={() => openEditVilla(v, project.projectId)}>{t("btn_edit")}</button>
                              <button className="btn danger small" onClick={() => deleteVilla(project.projectId, v.villaId)}>{t("btn_delete")}</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* МОДАЛКИ через Portal — (без изменений логики, только тексты) */}
      {showAddProjectModal && (
        <Portal>
          <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{t("modal_add_project")}</h3>
              <div className="form-group"><label>{t("label_project_name")}</label><input className="input" value={newProjectForm.projectName} onChange={e => setNewProjectForm(p => ({ ...p, projectName: e.target.value }))} /></div>
              <div className="form-group"><label>{t("label_planned_completion")}</label><input type="month" className="input" value={newProjectForm.plannedCompletion} onChange={e => setNewProjectForm(p => ({ ...p, plannedCompletion: e.target.value }))} /></div>
              <div className="form-group"><label>{t("label_progress")}</label><input type="number" min="0" max="100" className="input" value={newProjectForm.constructionProgressPct} onChange={e => setNewProjectForm(p => ({ ...p, constructionProgressPct: clamp(parseFloat(e.target.value||0),0,100) }))} /></div>
              <div className="form-group"><label>{t("label_presentation_url")}</label><input className="input" placeholder="https://..." value={newProjectForm.presentationUrl} onChange={e => setNewProjectForm(p => ({ ...p, presentationUrl: e.target.value }))} /></div>
              <div className="row">
                <div className="form-group"><label>{t("label_master_url")}</label><input className="input" placeholder="https://..." value={newProjectForm.masterPlan.url} onChange={e => setNewProjectForm(p => ({ ...p, masterPlan: { ...p.masterPlan, url: e.target.value } }))} /></div>
                <div className="form-group"><label>{t("label_master_caption")}</label><input className="input" value={newProjectForm.masterPlan.caption} onChange={e => setNewProjectForm(p => ({ ...p, masterPlan: { ...p.masterPlan, caption: e.target.value } }))} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn primary" onClick={saveProject}>{t("btn_save")}</button>
                <button className="btn" onClick={() => setShowAddProjectModal(false)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {editingProject && (
        <Portal>
          <div className="modal-overlay" onClick={() => setEditingProject(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{t("modal_edit_project")}</h3>
              <div className="form-group"><label>{t("label_project_name")}</label><input className="input" value={editingProject.projectName} onChange={e => setEditingProject(p => ({ ...p, projectName: e.target.value }))} /></div>
              <div className="form-group"><label>{t("label_planned_completion")}</label><input type="month" className="input" value={editingProject.plannedCompletion || ""} onChange={e => setEditingProject(p => ({ ...p, plannedCompletion: e.target.value }))} /></div>
              <div className="form-group"><label>{t("label_progress")}</label><input type="number" min="0" max="100" className="input" value={editingProject.constructionProgressPct ?? 0} onChange={e => setEditingProject(p => ({ ...p, constructionProgressPct: clamp(parseFloat(e.target.value||0),0,100) }))} /></div>
              <div className="form-group"><label>{t("label_presentation_url")}</label><input className="input" placeholder="https://..." value={editingProject.presentationUrl || ""} onChange={e => setEditingProject(p => ({ ...p, presentationUrl: e.target.value }))} /></div>
              <div className="row">
                <div className="form-group"><label>{t("label_master_url")}</label><input className="input" placeholder="https://..." value={editingProject.masterPlan?.url || ""} onChange={e => setEditingProject(p => ({ ...p, masterPlan: { ...(p.masterPlan||{}), url: e.target.value } }))} /></div>
                <div className="form-group"><label>{t("label_master_caption")}</label><input className="input" value={editingProject.masterPlan?.caption || ""} onChange={e => setEditingProject(p => ({ ...p, masterPlan: { ...(p.masterPlan||{}), caption: e.target.value } }))} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn primary" onClick={commitEditProject}>{t("btn_save")}</button>
                <button className="btn" onClick={() => setEditingProject(null)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {showAddVillaModal && (
        <Portal>
          <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{t("btn_add_villa")}</h3>
              <div className="form-row">
                <div className="form-group"><label>{t("table_villa")}</label><input className="input" value={newVillaForm.name} onChange={e => setNewVillaForm(v => ({ ...v, name: e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_status")}</label>
                  <select className="input" value={newVillaForm.status} onChange={e => setNewVillaForm(v => ({ ...v, status: e.target.value }))}>
                    <option value="available">{t("status_available")}</option>
                    <option value="reserved">{t("status_reserved")}</option>
                    <option value="hold">{t("status_hold")}</option>
                  </select>
                </div>
                <div className="form-group"><label>{t("table_rooms")}</label><input className="input" value={newVillaForm.rooms} onChange={e => setNewVillaForm(v => ({ ...v, rooms: e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_land")}</label><input type="number" className="input" value={newVillaForm.land} onChange={e => setNewVillaForm(v => ({ ...v, land: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_villa_area")}</label><input type="number" className="input" value={newVillaForm.area} onChange={e => setNewVillaForm(v => ({ ...v, area: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_floor1")}</label><input type="number" className="input" value={newVillaForm.f1} onChange={e => setNewVillaForm(v => ({ ...v, f1: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_floor2")}</label><input type="number" className="input" value={newVillaForm.f2} onChange={e => setNewVillaForm(v => ({ ...v, f2: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_rooftop")}</label><input type="number" className="input" value={newVillaForm.roof} onChange={e => setNewVillaForm(v => ({ ...v, roof: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_garden")}</label><input type="number" className="input" value={newVillaForm.garden} onChange={e => setNewVillaForm(v => ({ ...v, garden: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_ppsm")}</label><input type="number" className="input" value={newVillaForm.ppsm} onChange={e => setNewVillaForm(v => ({ ...v, ppsm: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_price_vat")}</label><input type="number" className="input" value={newVillaForm.baseUSD} onChange={e => setNewVillaForm(v => ({ ...v, baseUSD: +e.target.value }))} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn primary" onClick={saveVilla}>{t("btn_save")}</button>
                <button className="btn" onClick={() => setShowAddVillaModal(false)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {editingVilla && (
        <Portal>
          <div className="modal-overlay" onClick={() => setEditingVilla(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{t("btn_edit")} — {editingVilla.name}</h3>
              <div className="form-row">
                <div className="form-group"><label>{t("table_villa")}</label><input className="input" value={editingVilla.name || ""} onChange={e => setEditingVilla(v => ({ ...v, name: e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_status")}</label>
                  <select className="input" value={editingVilla.status || "available"} onChange={e => setEditingVilla(v => ({ ...v, status: e.target.value }))}>
                    <option value="available">{t("status_available")}</option>
                    <option value="reserved">{t("status_reserved")}</option>
                    <option value="hold">{t("status_hold")}</option>
                  </select>
                </div>
                <div className="form-group"><label>{t("table_rooms")}</label><input className="input" value={editingVilla.rooms || ""} onChange={e => setEditingVilla(v => ({ ...v, rooms: e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_land")}</label><input type="number" className="input" value={editingVilla.land ?? 0} onChange={e => setEditingVilla(v => ({ ...v, land: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_villa_area")}</label><input type="number" className="input" value={editingVilla.area ?? 0} onChange={e => setEditingVilla(v => ({ ...v, area: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_floor1")}</label><input type="number" className="input" value={editingVilla.f1 ?? 0} onChange={e => setEditingVilla(v => ({ ...v, f1: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_floor2")}</label><input type="number" className="input" value={editingVilla.f2 ?? 0} onChange={e => setEditingVilla(v => ({ ...v, f2: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_rooftop")}</label><input type="number" className="input" value={editingVilla.roof ?? 0} onChange={e => setEditingVilla(v => ({ ...v, roof: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_garden")}</label><input type="number" className="input" value={editingVilla.garden ?? 0} onChange={e => setEditingVilla(v => ({ ...v, garden: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_ppsm")}</label><input type="number" className="input" value={editingVilla.ppsm ?? 0} onChange={e => setEditingVilla(v => ({ ...v, ppsm: +e.target.value }))} /></div>
                <div className="form-group"><label>Price (USD)</label><input type="number" className="input" value={editingVilla.baseUSD ?? 0} onChange={e => setEditingVilla(v => ({ ...v, baseUSD: +e.target.value }))} /></div>
              </div>
              <div className="modal-actions">
                <button className="btn primary" onClick={commitEditVilla}>{t("btn_save")}</button>
                <button className="btn" onClick={() => setEditingVilla(null)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {reportsProject && (
        <Portal>
          <div className="modal-overlay" onClick={() => setReportsProject(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>{t("reports_title", reportsProject.projectName)}</h3>
              <div className="catalog-grid">
                {(reportsProject.constructionReports || []).length === 0 && <div className="label">{t("reports_empty")}</div>}
                {(reportsProject.constructionReports || []).slice().reverse().map(item => {
                  const ytId = item.type === "youtube" ? getYoutubeId(item.url) : null;
                  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
                  return (
                    <div key={item.id} className="villa-item" onClick={() => window.open(item.url, "_blank", "noreferrer")}>
                      <div className="villa-info">
                        <div className="value">{item.title || "(untitled)"} — {item.date || "—"}</div>
                        <div className="label">{item.type === "youtube" ? t("report_type_yt") : t("report_type_album")}</div>
                      </div>
                      {thumb ? <img src={thumb} alt="" style={{ width:72, height:40, objectFit:"cover", borderRadius:8 }} /> : <span className="badge">{t("btn_open")}</span>}
                      {!isClient && (
                        <button className="btn danger small" onClick={(e) => { e.stopPropagation(); deleteReport(item.id); }}>{t("btn_delete")}</button>
                      )}
                    </div>
                  );
                })}
              </div>
              {!isClient && (
                <>
                  <div className="divider-line" />
                  <AddReportForm t={t} onAdd={(r) => addReport(r)} />
                </>
              )}
              <div className="modal-actions">
                {!isClient && <button className="btn primary" onClick={saveReportsToProject}>{t("btn_save")}</button>}
                <button className="btn" onClick={() => setReportsProject(null)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function AddReportForm({ onAdd, t }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("youtube");
  const [url, setUrl] = useState("");
  return (
    <div className="row" style={{ marginTop: 10 }}>
      <div className="form-group"><label>{t("report_name")}</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="form-group"><label>{t("report_date")}</label><input type="month" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
      <div className="form-group"><label>{t("report_type")}</label>
        <select className="input" value={type} onChange={e => setType(e.target.value)}>
          <option value="youtube">{t("report_type_yt")}</option>
          <option value="album">{t("report_type_album")}</option>
        </select>
      </div>
      <div className="form-group"><label>{t("report_link")}</label><input className="input" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} /></div>
      <div className="form-group" style={{ alignSelf:"end" }}>
        <button className="btn" onClick={() => { if (!url) return; onAdd({ title, date, type, url }); setTitle(""); setDate(""); setUrl(""); }}>{t("reports_add")}</button>
      </div>
    </div>
  );
}

/* =========================
   Калькулятор
========================= */
function Calculator({ catalog, initialProject, initialVilla, isClient, onBackToCatalog, lang, rates, setRates, t }) {
  useRevealOnMount();

  const [startMonth, setStartMonth] = useState(new Date());
  const [handoverMonth, setHandoverMonth] = useState(12);
  const [months, setMonths] = useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33);

  useEffect(() => {
    const ym = initialProject?.plannedCompletion && normalizeYM(initialProject.plannedCompletion);
    if (ym) {
      const md = monthsDiff(startMonth, ym);
      if (md != null) setHandoverMonth(md);
    }
  }, [initialProject, startMonth]);

  const [stages, setStages] = useState([
    { id: 1, label: "Contract", pct: 30, month: 0 },
    { id: 2, label: "50% ready", pct: 30, month: 6 },
    { id: 3, label: "70% ready", pct: 20, month: 9 },
    { id: 4, label: "90% ready", pct: 15, month: 11 },
    { id: 5, label: "Keys", pct: 5, month: 12 }
  ]);
  const stagesSumPct = useMemo(() => stages.reduce((s, x) => s + (+x.pct || 0), 0), [stages]);

  const [lines, setLines] = useState(() => {
    if (!initialVilla || !initialProject) return [];
    return [{
      id: 1,
      projectId: initialProject.projectId,
      villaId: initialVilla.villaId,
      qty: 1,
      prePct: 100,
      ownTerms: false,
      months: null,
      monthlyRatePct: null,
      firstPostUSD: 0,
      discountPct: 0,
      monthlyPriceGrowthPct: initialVilla.monthlyPriceGrowthPct || 2,
      dailyRateUSD: initialVilla.dailyRateUSD || 150,
      occupancyPct: initialVilla.occupancyPct || 70,
      rentalPriceIndexPct: initialVilla.rentalPriceIndexPct || 5,
      snapshot: {
        name: initialVilla.name,
        area: initialVilla.area,
        ppsm: initialVilla.ppsm,
        baseUSD: initialVilla.baseUSD,
        leaseholdEndDate: initialVilla.leaseholdEndDate
      }
    }];
  });

  function convertUSD(valueUSD) {
    if (rates.currency === "IDR") return +valueUSD * (rates.idrPerUsd || 1);
    if (rates.currency === "EUR") return +valueUSD * (rates.eurPerUsd || 1);
    return +valueUSD;
  }
  function display(valueUSD, max = 0) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: rates.currency || "USD", maximumFractionDigits: max }).format(Math.round(convertUSD(valueUSD) || 0));
  }
  function formatMonth(offset) {
    const d = new Date(startMonth);
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" });
  }

  const limitStageLabel = (v) => (v || "").slice(0, 20);
  const parsePct = (v) => {
    const s = (v || "").replace(/,/g,'.').replace(/[^0-9.]/g,'');
    const ix = s.indexOf('.');
    const cleaned = ix >= 0 ? s.slice(0, ix + 1) + s.slice(ix + 1).replace(/\./g,'') : s;
    const trimmed = cleaned.slice(0, 6);
    const num = parseFloat(trimmed);
    return isNaN(num) ? 0 : clamp(num, 0, 100);
  };
  const parseMonth3 = (v) => {
    const s = (v || "").replace(/[^0-9]/g,'').slice(0,3);
    const num = parseInt(s || "0", 10);
    return clamp(num, 0, 120);
  };

  const linesData = useMemo(() => {
    return lines.map(line => {
      const baseOne = line.snapshot?.baseUSD ?? ((line.snapshot?.area || 0) * (line.snapshot?.ppsm || 0));
      const disc = clamp(+line.discountPct || 0, 0, 20);
      const base = baseOne * (1 - disc / 100);

      const prePct = clamp(line.prePct ?? 100, 50, 100);
      const vMonths = line.ownTerms && line.months ? line.months : months;
      const rate = (line.ownTerms && line.monthlyRatePct != null) ? (line.monthlyRatePct / 100) : (monthlyRatePct / 100);
      const firstPostUSD = Math.max(0, +line.firstPostUSD || 0);

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
          label: `Month ${i}`,
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
      if (ld.firstPostUSD > 0) push(handoverMonth + 1, ld.firstPostUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: First payment`);
      ld.postRows.forEach(r => push(r.month, r.paymentUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
    });

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
      return { ...row, rentalIncome, netPayment: row.amountUSD - rentalIncome, cumulativeUSD: cumulative, balanceUSD };
    });

    return { totals, cashflow };
  }, [linesData, handoverMonth, months, startMonth]);

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
      const inflationF = Math.pow(1 + 0.10, y);
      const leaseF = Math.pow((Math.max(1, totalYears) - y) / Math.max(1, totalYears), 1);
      const ageF = Math.exp(-0.025 * y);
      const brandF = (y <= 3) ? 1 + (1.2 - 1) * (y / 3) : (y <= 7 ? 1.2 : (y <= 15 ? 1.2 - (1.2 - 1.0) * ((y - 7) / 8) : 1.0));
      data.push({ year: y, leaseFactor: leaseF, ageFactor: ageF, brandFactor: brandF, finalPrice: mph * inflationF * leaseF * ageF * brandF });
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

  // Экспорт калькулятора — клон
  function exportCalcPDF() {
    try {
      if (typeof html2pdf === "undefined") {
        alert("html2pdf not loaded");
        return;
      }
      const scope = document.getElementById("calc-print-scope");
      if (!scope) { alert("calc-print-scope missing"); return; }

      const clone = scope.cloneNode(true);
      const wrapper = document.createElement("div");
      wrapper.className = "calc-print print-mode";
      wrapper.style.position = "fixed";
      wrapper.style.inset = "0";
      wrapper.style.background = "#fff";
      wrapper.style.overflow = "auto";
      wrapper.style.opacity = "0";
      clone.querySelectorAll("img").forEach(img => { img.style.display = "none"; });
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      wrapper.querySelectorAll(".calc-scroll,.factors-table-scroll").forEach(el => { el.style.overflow = "visible"; el.style.maxWidth = "none"; });
      wrapper.querySelectorAll(".calc-table,.factors-table").forEach(t => { t.style.width = "100%"; t.style.minWidth = "auto"; t.style.tableLayout = "fixed"; });
      wrapper.querySelectorAll("th,td").forEach(cell => { cell.style.whiteSpace = "nowrap"; });

      const run = () => {
        const windowWidth = wrapper.scrollWidth;
        const windowHeight = Math.max(wrapper.scrollHeight, 800);
        return html2pdf().from(wrapper).set({
          margin: 6,
          filename: `arconique-calculator-${new Date().toISOString().slice(0,10)}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { backgroundColor: "#fff", scale: 2, useCORS: true, allowTaint: false, scrollX: 0, scrollY: 0, windowWidth, windowHeight },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] }
        }).save();
      };

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          run().finally(() => { try { document.body.removeChild(wrapper); } catch {} });
        });
      });
    } catch (e) {
      console.error(e);
      alert("PDF failed, see console");
    }
  }

  if (!lines.length || !selectedVilla) {
    return (
      <div className="container reveal">
        <div className="card">
          <div className="card-header"><h3>Calculator</h3></div>
          <div>No data. Select a villa in catalog.</div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn" onClick={onBackToCatalog}>{t("calc_back")}</button>
          </div>
        </div>
      </div>
    );
  }

  const targetPrePct = clamp(lines[0]?.prePct ?? 100, 50, 100);
  const compareText = stagesSumPct > targetPrePct
    ? t("stages_sum_exceeds", stagesSumPct.toFixed(2), targetPrePct.toFixed(2))
    : stagesSumPct < targetPrePct
      ? t("stages_sum_below", stagesSumPct.toFixed(2), targetPrePct.toFixed(2))
      : t("stages_sum_equal", stagesSumPct.toFixed(2), targetPrePct.toFixed(2));

  return (
    <div className="container reveal">
      <div className="top-section">
        <div className="card stages-card">
          <div className="card-header">
            <h3>{t("preinstallments_title")}</h3>
            <button className="btn primary" onClick={() => setStages(prev => [...prev, { id: (prev.at(-1)?.id || 0) + 1, label: "Stage", pct: 0, month: 0 }])}>{t("btn_add_stage")}</button>
          </div>
          <div className="stages-scroll">
            <table className="factors-table">
              <colgroup>
                <col className="stages-col-name" />
                <col className="stages-col-pct" />
                <col className="stages-col-month" />
                <col className="stages-col-actions" />
              </colgroup>
              <thead><tr><th>{t("stages_head_name")}</th><th>{t("stages_head_pct")}</th><th>{t("stages_head_month")}</th><th>{t("stages_head_actions")}</th></tr></thead>
              <tbody>
                {stages.map(s => (
                  <tr key={s.id}>
                    <td>
                      <input className="compact-input" value={s.label} onChange={e => {
                        const v = (e.target.value || "").slice(0, 20);
                        setStages(prev => prev.map(x => x.id === s.id ? { ...x, label: v } : x));
                      }} />
                    </td>
                    <td>
                      <input className="compact-input" inputMode="decimal" placeholder="0–100"
                        value={String(s.pct)} onChange={e => {
                          const v = (e.target.value || "");
                          const parsed = v.replace(/,/g,'.').replace(/[^0-9.]/g,'');
                          const ix = parsed.indexOf('.');
                          const cleaned = ix >= 0 ? parsed.slice(0, ix + 1) + parsed.slice(ix + 1).replace(/\./g,'') : parsed;
                          const trimmed = cleaned.slice(0, 6);
                          const num = parseFloat(trimmed);
                          setStages(prev => prev.map(x => x.id === s.id ? { ...x, pct: isNaN(num) ? 0 : clamp(num, 0, 100) } : x));
                        }} />
                    </td>
                    <td>
                      <input className="compact-input" inputMode="numeric" placeholder="0–120"
                        value={String(s.month)} onChange={e => {
                          const s3 = (e.target.value || "").replace(/[^0-9]/g,'').slice(0,3);
                          const n = clamp(parseInt(s3 || "0", 10), 0, 120);
                          setStages(prev => prev.map(x => x.id === s.id ? { ...x, month: n } : x));
                        }} />
                    </td>
                    <td>
                      <button className="btn danger icon tiny" title={t("btn_delete")} onClick={() => setStages(prev => prev.filter(x => x.id !== s.id))}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stages-summary">
            <div className="pill">{compareText}</div>
          </div>
        </div>

        <div className="card settings-card">
          <div className="row">
            <div className="field compact"><label>{t("settings_title_lang")}</label>
              <select value={lang} onChange={e => { try { localStorage.setItem(LS_LANG, e.target.value); } catch {}; location.reload(); }}>
                <option value="en">EN</option><option value="ru">RU</option>
              </select>
            </div>

            <div className="field compact"><label>{t("settings_title_currency")}</label>
              <select value={rates.currency} onChange={e => setRates(prev => ({ ...prev, currency: e.target.value }))}>
                <option value="USD">{t("curr_usd")}</option><option value="IDR">{t("curr_idr")}</option><option value="EUR">{t("curr_eur")}</option>
              </select>
            </div>

            <div className="field compact"><label>{t("settings_contract")}</label>
              <div className="info-display">{startMonth.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" })}</div>
            </div>

            {normalizeYM(initialProject?.plannedCompletion) ? (
              <div className="field compact"><label>{t("settings_handover_label")}</label>
                <div className="info-display">{ymLabel(initialProject.plannedCompletion)}</div>
              </div>
            ) : (
              <div className="field compact"><label>{t("settings_duration_fallback")}</label>
                <input type="number" min="1" step="1" value={handoverMonth} onChange={e => setHandoverMonth(clamp(parseInt(e.target.value || 0, 10), 1, 120))} />
              </div>
            )}

            {!isClient ? (
              <>
                <div className="field compact"><label>{t("settings_global_rate")}</label>
                  <input type="number" min="0" step="0.01" value={monthlyRatePct} onChange={e => setMonthlyRatePct(clamp(parseFloat(e.target.value || 0), 0, 1000))} />
                </div>
                <div className="field compact"><label>{t("settings_global_term")}</label>
                  <input type="range" min="6" max="24" step="1" value={months} onChange={e => setMonths(parseInt(e.target.value, 10))} />
                  <div className="pill">{t("settings_months", months)}</div>
                </div>
              </>
            ) : (
              <div className="field compact"><label>Post‑handover (months)</label>
                <input type="number" min="6" step="1" value={months} onChange={e => setMonths(clamp(parseInt(e.target.value || 0, 10), 6, 120))} />
              </div>
            )}
          </div>

          <div className="row">
            <button className="btn" onClick={onBackToCatalog}>{t("calc_back")}</button>
          </div>
        </div>
      </div>

      {/* ПЕЧАТНЫЙ ДИАПАЗОН */}
      <div id="calc-print-scope">
        {/* Объект недвижимости */}
        <div className="card">
          <h3 style={{ margin: "6px 0" }}>{t("object_title")}</h3>
          <div className="calc-scroll">
            <table className="calc-table">
              <thead>
                <tr>
                  <th>Project</th><th>Villa</th><th>m²</th><th>$ / m²</th><th>Base price (USD)</th>
                  {!isClient && <th>Discount, %</th>}
                  <th>Pre-keys, %</th>
                  {!isClient && <th>Term, mo</th>}
                  {!isClient && <th>Rate, %/mo</th>}
                  {!isClient && <th>Monthly price growth (%)</th>}
                  <th>Daily rate (USD)</th>
                  <th>Avg occupancy, %</th>
                  <th>Rent index, %/yr</th>
                  <th>Total with plan</th>
                </tr>
              </thead>
              <tbody>
                {linesData.map(ld => (
                  <tr key={ld.line.id}>
                    <td style={{ textAlign: "left" }}>{catalog.find(p => p.projectId === ld.line.projectId)?.projectName || ld.line.projectId}</td>
                    <td style={{ textAlign: "left" }}>{ld.line.snapshot?.name}</td>
                    <td>{ld.line.snapshot?.area || 0}</td>
                    <td>{ld.line.snapshot?.ppsm || 0}</td>
                    <td className="base-strong">{display(ld.base)}</td>
                    {!isClient && (
                      <td><input type="number" min="0" max="20" step="0.1" className="compact-input" value={ld.line.discountPct || 0} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,discountPct:clamp(parseFloat(e.target.value||0),0,20)}:x))} /></td>
                    )}
                    <td>
                      <input type="range" min="50" max="100" step="1" className="range"
                        value={Math.max(50, Math.min(100, (ld.line.prePct ?? 100)))}
                        onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x, prePct: clamp(parseInt(e.target.value || 0, 10), 50, 100)}:x))} />
                      <div className="pill" style={{ marginTop: 6 }}>{Math.max(50, Math.min(100, (ld.line.prePct ?? 100)))}%</div>
                    </td>
                    {!isClient && (
                      <td>
                        <input type="checkbox" checked={ld.line.ownTerms || false} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,ownTerms:e.target.checked}:x))} />
                        <input type="number" min="6" step="1" disabled={!ld.line.ownTerms} className="compact-input"
                          value={ld.line.months || months} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,months:clamp(parseInt(e.target.value || 0, 10), 6, 120)}:x))} />
                      </td>
                    )}
                    {!isClient && (
                      <td><input type="number" min="0" step="0.01" disabled={!ld.line.ownTerms} className="compact-input" value={ld.line.monthlyRatePct ?? monthlyRatePct} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,monthlyRatePct:clamp(parseFloat(e.target.value || 0), 0, 1000)}:x))} /></td>
                    )}
                    {!isClient && (
                      <td><input type="number" min="0" max="50" step="0.1" className="compact-input" value={ld.line.monthlyPriceGrowthPct || 2} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,monthlyPriceGrowthPct:clamp(parseFloat(e.target.value || 0), 0, 50)}:x))} /></td>
                    )}
                    <td><input type="number" min="0" step="1" className="compact-input" value={ld.line.dailyRateUSD || 150} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,dailyRateUSD:clamp(parseFloat(e.target.value || 0), 0, 10000)}:x))} /></td>
                    <td><input type="number" min="0" max="100" step="1" className="compact-input" value={ld.line.occupancyPct || 70} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,occupancyPct:clamp(parseFloat(e.target.value || 0), 0, 100)}:x))} /></td>
                    <td><input type="number" min="0" max="50" step="0.1" className="compact-input" value={ld.line.rentalPriceIndexPct || 5} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,rentalPriceIndexPct:clamp(parseFloat(e.target.value || 0), 0, 50)}:x))} /></td>
                    <td className="line-total">{display(ld.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Остальные блоки калькулятора — без изменений (см. предыдущую версию) */}
        {/* KPI, Cashflow, Pricing chart, Annual/Monthly tables, Export buttons */}
      </div>
    </div>
  );
}

/* =========================
   Главный App
========================= */
function App() {
  useRevealOnMount();
  const { lang, setLang, t } = useLang();

  const [isClient, setIsClient] = useState(true);
  const [catalog, setCatalog] = useState(loadCatalog());
  useEffect(() => saveCatalog(catalog), [catalog]);

  const [rates, setRates] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_RATES);
      return raw ? JSON.parse(raw) : { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 };
    } catch { return { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 }; }
  });
  useEffect(() => { try { localStorage.setItem(LS_RATES, JSON.stringify(rates)); } catch {} }, [rates]);

  const [calcInput, setCalcInput] = useState(null);
  useRevealOnRoute(calcInput ? "calc" : "catalog");

  function handleCalculate(project, villa) {
    setCalcInput({ project, villa });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function handleBackToCatalog() {
    setCalcInput(null);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function toggleMode() {
    if (isClient) {
      const pin = prompt("PIN:");
      if (pin === PIN_CODE) setIsClient(false);
      else if (pin !== null) alert("Wrong PIN");
    } else setIsClient(true);
  }

  return (
    <>
      <div className="container reveal">
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 className="h1" style={{ margin: 0, fontSize: 24 }}>{t("app_title")}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {calcInput && <button className="btn" onClick={handleBackToCatalog}>{t("calc_back")}</button>}
            <button className="btn icon tiny" title={isClient ? "Editor" : "Client"} onClick={toggleMode}>🛠</button>
          </div>
        </div>
      </div>

      {!calcInput ? (
        <CatalogManager
          catalog={catalog}
          setCatalog={setCatalog}
          onCalculate={handleCalculate}
          isClient={isClient}
          lang={lang}
          setLang={setLang}
          rates={rates}
          setRates={setRates}
          t={t}
        />
      ) : (
        <Calculator
          catalog={catalog}
          initialProject={calcInput.project}
          initialVilla={calcInput.villa}
          isClient={isClient}
          onBackToCatalog={handleBackToCatalog}
          lang={lang}
          rates={rates}
          setRates={setRates}
          t={t}
        />
      )}
    </>
  );
}

/* =========================
   Рендер
========================= */
const root = createRoot(document.getElementById("root"));
root.render(<App />);
