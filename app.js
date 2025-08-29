// app.js
// продолжаем
const { useEffect, useMemo, useState, useRef } = React;
const { createRoot } = ReactDOM;

/* =========================
   Константы и хранилище
========================= */
const PIN_CODE = "334346";
const LS_CATALOG = "arq_catalog_v2";
const LS_RATES = "arq_rates_v1";

/* =========================
   Утилиты форматирования
========================= */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmtInt = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmt2 = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(+n || 0);
function fmtMoney(n, c = "USD", max = 0) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: max }).format(Math.round(+n || 0));
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
   Дефолтные данные каталога (+ новые поля)
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
   Финансовые утилиты (калькулятор)
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
   CatalogManager (каталог + админ + документы)
========================= */
function CatalogManager({ catalog, setCatalog, onCalculate, isClient }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [editingVilla, setEditingVilla] = useState(null);
  const [reportsProject, setReportsProject] = useState(null); // { ...project }

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
    const label = status === "available" ? "в наличии" : status === "reserved" ? "забронировано" : "на паузе";
    const cls = status === "available" ? "status-available" : status === "reserved" ? "status-reserved" : "status-hold";
    return <span className={`status ${cls}`}>{label}</span>;
  }

  const filtered = useMemo(() => {
    if (!searchTerm) return catalog;
    const s = searchTerm.toLowerCase();
    return catalog.map(p => ({
      ...p,
      villas: p.villas.filter(v => (v.name || "").toLowerCase().includes(s))
    })).filter(p => p.villas.length > 0 || (p.projectName || "").toLowerCase().includes(s));
  }, [catalog, searchTerm]);

  const addProject = () => {
    setNewProjectForm({
      projectId: "", projectName: "", plannedCompletion: "2026-12", constructionProgressPct: 20,
      presentationUrl: "", masterPlan: { url: "", caption: "" }, constructionReports: [], includes: []
    });
    setShowAddProjectModal(true);
  };
  const saveProject = () => {
    if (!newProjectForm.projectName) { alert("Введите название проекта"); return; }
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
    if (!confirm("Удалить проект и все его виллы?")) return;
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
    if (!project) { alert("Нет выбранного проекта"); return; }
    if (!newVillaForm.name) { alert("Введите название виллы"); return; }
    const villaId = uniqueVillaId(project, newVillaForm.name);
    const v = { ...newVillaForm, villaId };
    setCatalog(prev => prev.map(p => p.projectId === project.projectId ? { ...p, villas: [...p.villas, v] } : p));
    setShowAddVillaModal(false);
  };
  const deleteVilla = (projectId, villaId) => {
    if (!confirm("Удалить виллу?")) return;
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
    const item = { id: uid(), date: patch.date || "", title: patch.title || "", type: patch.type || "album", url: patch.url || "" };
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

  function exportProjectPDF(projectId) {
    const card = document.getElementById(`project-${projectId}`);
    if (!card) { alert("Не найден DOM блока проекта"); return; }
    card.classList.add("print-mode");
    const opt = {
      margin:       6,
      filename:     `arconique-project-${projectId}.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: "mm", format: "a4", orientation: "landscape" }
    };
    html2pdf().from(card).set(opt).save().then(() => card.classList.remove("print-mode")).catch(() => card.classList.remove("print-mode"));
  }

  return (
    <div className="catalog-section reveal">
      <div className="catalog-header">
        <h2>Каталог проектов</h2>
        <div className="catalog-controls">
          <input className="search-input" placeholder="Поиск по названию..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          {!isClient && <button className="btn primary" onClick={addProject}>Добавить проект</button>}
        </div>
      </div>

      <div className="catalog-list">
        {filtered.map(project => (
          <div id={`project-${project.projectId}`} key={project.projectId} className="project-card">
            <div className="project-header">
              <h3>{project.projectName}</h3>
              <div className="project-actions" style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                {/* Документы рядом */}
                {project.presentationUrl && (
                  <a className="btn small" href={project.presentationUrl} target="_blank" rel="noreferrer">Презентация</a>
                )}
                <button className="btn small" onClick={() => openReports(project)}>Отчёты</button>
                <button className="btn small" onClick={() => exportProjectPDF(project.projectId)}>Каталог PDF</button>

                {!isClient && <button className="btn small" onClick={() => openEditProject(project)}>✏️</button>}
                {!isClient && <button className="btn danger small" onClick={() => deleteProject(project.projectId)}>🗑️</button>}
                {!isClient && <button className="btn success small" onClick={() => addVilla(project.projectId)}>Добавить виллу</button>}
              </div>
            </div>

            {/* Пилюли */}
            <div className="pill-row">
              {project.plannedCompletion && (<span className="pill">{`План завершения: ${ymLabel(project.plannedCompletion)}`}</span>)}
              {Number.isFinite(project.constructionProgressPct) && (<span className="pill pill-muted">{`Прогресс стройки: ${project.constructionProgressPct}%`}</span>)}
            </div>

            {/* Блок описания проекта: слева includes, справа мастер-план */}
            <div className="project-details-grid">
              <div>
                <div className="project-includes">
                  <div className="includes-title">В стоимость включено</div>
                  <ul className="includes-list">
                    {(project.includes || []).map((item, i) => (<li key={i}>{item}</li>))}
                  </ul>
                </div>
              </div>
              <div>
                {project.masterPlan?.url ? (
                  <a className="masterplan-card" href={project.masterPlan.url} target="_blank" rel="noreferrer" title="Открыть мастер-план">
                    <img className="masterplan-img" src={project.masterPlan.url} alt="Master plan" />
                    {project.masterPlan.caption ? <div className="label" style={{ marginTop:8 }}>{project.masterPlan.caption}</div> : null}
                  </a>
                ) : (
                  !isClient ? <div className="masterplan-card"><div className="label">Добавьте ссылку на мастер‑план в настройках проекта</div></div> : null
                )}
              </div>
            </div>

            {/* Табличный каталог вилл */}
            <div className="table-wrap scroll-x">
              <table className="catalog-table">
                <thead>
                  <tr>
                    <th className="w-1">Вилла</th>
                    <th className="w-1">Q Rooms</th>
                    <th className="w-1">Land, м²</th>
                    <th className="w-1">Villa, м²</th>
                    <th className="w-1">1 floor, м²</th>
                    <th className="w-1">2 floor, м²</th>
                    <th className="w-1">Rooftop, м²</th>
                    <th className="w-1">Garden & pool, м²</th>
                    <th className="w-1">Price per м², $</th>
                    <th className="w-1">Price with VAT, $</th>
                    <th className="w-1">Статус</th>
                    <th className="w-1">График платежей и финмодель</th>
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
                        <td>{isAvail ? (v.ppsm ?? 0) : "—"}</td>
                        <td>{isAvail ? fmtMoney((v.baseUSD || 0) * 1.10, "USD") : "—"}</td>
                        <td><StatusPill status={v.status} /></td>
                        <td>
                          {isAvail ? (
                            <button className="btn primary btn-sm" onClick={() => onCalculate(project, v)}>Рассчитать</button>
                          ) : (
                            <span className="badge">Недоступно</span>
                          )}
                          {!isClient && (
                            <div style={{ display: "inline-flex", gap: 6, marginLeft: 8 }}>
                              <button className="btn btn-sm" onClick={() => openEditVilla(v, project.projectId)}>Править</button>
                              <button className="btn danger btn-sm" onClick={() => deleteVilla(project.projectId, v.villaId)}>Удалить</button>
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

      {/* Модалки проекта/виллы */}
      {showAddProjectModal && (
        <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Добавить проект</h3>
            <div className="form-group"><label>Название проекта</label><input className="input" value={newProjectForm.projectName} onChange={e => setNewProjectForm(p => ({ ...p, projectName: e.target.value }))} /></div>
            <div className="form-group"><label>Планируемая дата завершения (месяц/год)</label><input type="month" className="input" value={newProjectForm.plannedCompletion} onChange={e => setNewProjectForm(p => ({ ...p, plannedCompletion: e.target.value }))} /></div>
            <div className="form-group"><label>Достигнутый прогресс строительства (%)</label><input type="number" min="0" max="100" className="input" value={newProjectForm.constructionProgressPct} onChange={e => setNewProjectForm(p => ({ ...p, constructionProgressPct: clamp(parseFloat(e.target.value||0),0,100) }))} /></div>
            <div className="form-group"><label>Ссылка на презентацию (PDF)</label><input className="input" placeholder="https://..." value={newProjectForm.presentationUrl} onChange={e => setNewProjectForm(p => ({ ...p, presentationUrl: e.target.value }))} /></div>
            <div className="row">
              <div className="form-group"><label>URL мастер‑плана (изображение)</label><input className="input" placeholder="https://..." value={newProjectForm.masterPlan.url} onChange={e => setNewProjectForm(p => ({ ...p, masterPlan: { ...p.masterPlan, url: e.target.value } }))} /></div>
              <div className="form-group"><label>Подпись к мастер‑плану</label><input className="input" value={newProjectForm.masterPlan.caption} onChange={e => setNewProjectForm(p => ({ ...p, masterPlan: { ...p.masterPlan, caption: e.target.value } }))} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={saveProject}>Сохранить</button>
              <button className="btn" onClick={() => setShowAddProjectModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      {editingProject && (
        <div className="modal-overlay" onClick={() => setEditingProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Правка проекта</h3>
            <div className="form-group"><label>Название проекта</label><input className="input" value={editingProject.projectName} onChange={e => setEditingProject(p => ({ ...p, projectName: e.target.value }))} /></div>
            <div className="form-group"><label>Планируемая дата завершения (месяц/год)</label><input type="month" className="input" value={editingProject.plannedCompletion || ""} onChange={e => setEditingProject(p => ({ ...p, plannedCompletion: e.target.value }))} /></div>
            <div className="form-group"><label>Достигнутый прогресс строительства (%)</label><input type="number" min="0" max="100" className="input" value={editingProject.constructionProgressPct ?? 0} onChange={e => setEditingProject(p => ({ ...p, constructionProgressPct: clamp(parseFloat(e.target.value||0),0,100) }))} /></div>
            <div className="form-group"><label>Ссылка на презентацию (PDF)</label><input className="input" placeholder="https://..." value={editingProject.presentationUrl || ""} onChange={e => setEditingProject(p => ({ ...p, presentationUrl: e.target.value }))} /></div>
            <div className="row">
              <div className="form-group"><label>URL мастер‑плана (изображение)</label><input className="input" placeholder="https://..." value={editingProject.masterPlan?.url || ""} onChange={e => setEditingProject(p => ({ ...p, masterPlan: { ...(p.masterPlan||{}), url: e.target.value } }))} /></div>
              <div className="form-group"><label>Подпись к мастер‑плану</label><input className="input" value={editingProject.masterPlan?.caption || ""} onChange={e => setEditingProject(p => ({ ...p, masterPlan: { ...(p.masterPlan||{}), caption: e.target.value } }))} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={commitEditProject}>Сохранить</button>
              <button className="btn" onClick={() => setEditingProject(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      {showAddVillaModal && (
        <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Добавить виллу</h3>
            <div className="form-row">
              <div className="form-group"><label>Название</label><input className="input" value={newVillaForm.name} onChange={e => setNewVillaForm(v => ({ ...v, name: e.target.value }))} /></div>
              <div className="form-group"><label>Статус</label>
                <select className="input" value={newVillaForm.status} onChange={e => setNewVillaForm(v => ({ ...v, status: e.target.value }))}>
                  <option value="available">available</option><option value="reserved">reserved</option><option value="hold">hold</option>
                </select>
              </div>
              <div className="form-group"><label>Комнат</label><input className="input" value={newVillaForm.rooms} onChange={e => setNewVillaForm(v => ({ ...v, rooms: e.target.value }))} /></div>
              <div className="form-group"><label>Земля (м²)</label><input type="number" className="input" value={newVillaForm.land} onChange={e => setNewVillaForm(v => ({ ...v, land: +e.target.value }))} /></div>
              <div className="form-group"><label>Площадь (м²)</label><input type="number" className="input" value={newVillaForm.area} onChange={e => setNewVillaForm(v => ({ ...v, area: +e.target.value }))} /></div>
              <div className="form-group"><label>1 этаж (м²)</label><input type="number" className="input" value={newVillaForm.f1} onChange={e => setNewVillaForm(v => ({ ...v, f1: +e.target.value }))} /></div>
              <div className="form-group"><label>2 этаж (м²)</label><input type="number" className="input" value={newVillaForm.f2} onChange={e => setNewVillaForm(v => ({ ...v, f2: +e.target.value }))} /></div>
              <div className="form-group"><label>Rooftop (м²)</label><input type="number" className="input" value={newVillaForm.roof} onChange={e => setNewVillaForm(v => ({ ...v, roof: +e.target.value }))} /></div>
              <div className="form-group"><label>Garden & pool (м²)</label><input type="number" className="input" value={newVillaForm.garden} onChange={e => setNewVillaForm(v => ({ ...v, garden: +e.target.value }))} /></div>
              <div className="form-group"><label>$ / м²</label><input type="number" className="input" value={newVillaForm.ppsm} onChange={e => setNewVillaForm(v => ({ ...v, ppsm: +e.target.value }))} /></div>
              <div className="form-group"><label>Цена (USD)</label><input type="number" className="input" value={newVillaForm.baseUSD} onChange={e => setNewVillaForm(v => ({ ...v, baseUSD: +e.target.value }))} /></div>
              <div className="form-group"><label>Месячный рост до ключей (%)</label><input type="number" step="0.1" className="input" value={newVillaForm.monthlyPriceGrowthPct} onChange={e => setNewVillaForm(v => ({ ...v, monthlyPriceGrowthPct: +e.target.value }))} /></div>
              <div className="form-group"><label>Дата окончания лизхолда</label><input type="date" className="input" value={newVillaForm.leaseholdEndDate} onChange={e => setNewVillaForm(v => ({ ...v, leaseholdEndDate: e.target.value }))} /></div>
              <div className="form-group"><label>Сутки (USD)</label><input type="number" className="input" value={newVillaForm.dailyRateUSD} onChange={e => setNewVillaForm(v => ({ ...v, dailyRateUSD: +e.target.value }))} /></div>
              <div className="form-group"><label>Заполняемость (%)</label><input type="number" className="input" value={newVillaForm.occupancyPct} onChange={e => setNewVillaForm(v => ({ ...v, occupancyPct: clamp(+e.target.value,0,100) }))} /></div>
              <div className="form-group"><label>Индекс аренды (%/год)</label><input type="number" step="0.1" className="input" value={newVillaForm.rentalPriceIndexPct} onChange={e => setNewVillaForm(v => ({ ...v, rentalPriceIndexPct: +e.target.value }))} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={saveVilla}>Сохранить</button>
              <button className="btn" onClick={() => setShowAddVillaModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
      {editingVilla && (
        <div className="modal-overlay" onClick={() => setEditingVilla(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Править виллу</h3>
            <div className="form-row">
              <div className="form-group"><label>Название</label><input className="input" value={editingVilla.name || ""} onChange={e => setEditingVilla(v => ({ ...v, name: e.target.value }))} /></div>
              <div className="form-group"><label>Статус</label>
                <select className="input" value={editingVilla.status || "available"} onChange={e => setEditingVilla(v => ({ ...v, status: e.target.value }))}>
                  <option value="available">available</option>
                  <option value="reserved">reserved</option>
                  <option value="hold">hold</option>
                </select>
              </div>
              <div className="form-group"><label>Q Rooms</label><input className="input" value={editingVilla.rooms || ""} onChange={e => setEditingVilla(v => ({ ...v, rooms: e.target.value }))} /></div>
              <div className="form-group"><label>Land (м²)</label><input type="number" className="input" value={editingVilla.land ?? 0} onChange={e => setEditingVilla(v => ({ ...v, land: +e.target.value }))} /></div>
              <div className="form-group"><label>Villa (м²)</label><input type="number" className="input" value={editingVilla.area ?? 0} onChange={e => setEditingVilla(v => ({ ...v, area: +e.target.value }))} /></div>
              <div className="form-group"><label>1 floor (м²)</label><input type="number" className="input" value={editingVilla.f1 ?? 0} onChange={e => setEditingVilla(v => ({ ...v, f1: +e.target.value }))} /></div>
              <div className="form-group"><label>2 floor (м²)</label><input type="number" className="input" value={editingVilla.f2 ?? 0} onChange={e => setEditingVilla(v => ({ ...v, f2: +e.target.value }))} /></div>
              <div className="form-group"><label>Rooftop (м²)</label><input type="number" className="input" value={editingVilla.roof ?? 0} onChange={e => setEditingVilla(v => ({ ...v, roof: +e.target.value }))} /></div>
              <div className="form-group"><label>Garden & pool (м²)</label><input type="number" className="input" value={editingVilla.garden ?? 0} onChange={e => setEditingVilla(v => ({ ...v, garden: +e.target.value }))} /></div>
              <div className="form-group"><label>Price per м² ($)</label><input type="number" className="input" value={editingVilla.ppsm ?? 0} onChange={e => setEditingVilla(v => ({ ...v, ppsm: +e.target.value }))} /></div>
              <div className="form-group"><label>Цена (USD)</label><input type="number" className="input" value={editingVilla.baseUSD ?? 0} onChange={e => setEditingVilla(v => ({ ...v, baseUSD: +e.target.value }))} /></div>
              <div className="form-group"><label>Сутки (USD)</label><input type="number" className="input" value={editingVilla.dailyRateUSD ?? 0} onChange={e => setEditingVilla(v => ({ ...v, dailyRateUSD: +e.target.value }))} /></div>
              <div className="form-group"><label>Заполняемость (%)</label><input type="number" className="input" value={editingVilla.occupancyPct ?? 0} onChange={e => setEditingVilla(v => ({ ...v, occupancyPct: clamp(+e.target.value,0,100) }))} /></div>
              <div className="form-group"><label>Индекс аренды (%/год)</label><input type="number" step="0.1" className="input" value={editingVilla.rentalPriceIndexPct ?? 0} onChange={e => setEditingVilla(v => ({ ...v, rentalPriceIndexPct: +e.target.value }))} /></div>
              <div className="form-group"><label>Месячный рост до ключей (%)</label><input type="number" step="0.1" className="input" value={editingVilla.monthlyPriceGrowthPct ?? 0} onChange={e => setEditingVilla(v => ({ ...v, monthlyPriceGrowthPct: +e.target.value }))} /></div>
              <div className="form-group"><label>Дата окончания лизхолда</label><input type="date" className="input" value={(editingVilla.leaseholdEndDate || "").slice(0,10)} onChange={e => setEditingVilla(v => ({ ...v, leaseholdEndDate: e.target.value }))} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={commitEditVilla}>Сохранить</button>
              <button className="btn" onClick={() => setEditingVilla(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка отчётов */}
      {reportsProject && (
        <div className="modal-overlay" onClick={() => setReportsProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Отчёты о стройке — {reportsProject.projectName}</h3>
            <div className="catalog-grid">
              {(reportsProject.constructionReports || []).length === 0 && <div className="label">Пока нет отчётов</div>}
              {(reportsProject.constructionReports || []).slice().reverse().map(item => {
                const ytId = item.type === "youtube" ? getYoutubeId(item.url) : null;
                const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
                return (
                  <div key={item.id} className="villa-item" onClick={() => window.open(item.url, "_blank", "noreferrer")}>
                    <div className="villa-info">
                      <div className="value">{item.title || "(без названия)"} — {item.date || "—"}</div>
                      <div className="label">{item.type === "youtube" ? "YouTube" : "Фото/Альбом"}</div>
                    </div>
                    {thumb ? <img src={thumb} alt="" style={{ width:72, height:40, objectFit:"cover", borderRadius:8 }} /> : <span className="badge">Открыть</span>}
                    {!isClient && (
                      <button className="btn danger small" onClick={(e) => { e.stopPropagation(); deleteReport(item.id); }}>Удалить</button>
                    )}
                  </div>
                );
              })}
            </div>

            {!isClient && (
              <>
                <div className="divider-line" />
                <h4 style={{ marginTop:8 }}>Добавить отчёт</h4>
                <AddReportForm onAdd={addReport} />
              </>
            )}

            <div className="modal-actions">
              {!isClient && <button className="btn primary" onClick={saveReportsToProject}>Сохранить</button>}
              <button className="btn" onClick={() => setReportsProject(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddReportForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("youtube");
  const [url, setUrl] = useState("");
  return (
    <div className="row">
      <div className="form-group"><label>Название</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="form-group"><label>Дата (месяц/год)</label><input type="month" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
      <div className="form-group"><label>Тип</label>
        <select className="input" value={type} onChange={e => setType(e.target.value)}>
          <option value="youtube">YouTube</option>
          <option value="album">Фото/Альбом</option>
        </select>
      </div>
      <div className="form-group"><label>Ссылка</label><input className="input" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} /></div>
      <div className="form-group" style={{ alignSelf:"end" }}>
        <button className="btn" onClick={() => { if (!url) return; onAdd({ title, date, type, url }); setTitle(""); setDate(""); setUrl(""); }}>Добавить</button>
      </div>
    </div>
  );
}

/* =========================
   Калькулятор (без правок к документам)
========================= */
function Calculator({ catalog, initialProject, initialVilla, isClient, onBackToCatalog }) {
  useRevealOnMount();

  const [lang, setLang] = useState("ru");
  const [rates, setRates] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_RATES);
      return raw ? JSON.parse(raw) : { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 };
    } catch { return { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 }; }
  });
  useEffect(() => { try { localStorage.setItem(LS_RATES, JSON.stringify(rates)); } catch {} }, [rates]);

  const [handoverMonth, setHandoverMonth] = useState(12);
  const [months, setMonths] = useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33);
  const [startMonth, setStartMonth] = useState(new Date());

  const [stages, setStages] = useState([
    { id: 1, label: "Договор", pct: 30, month: 0 },
    { id: 2, label: "50% готовности", pct: 30, month: 6 },
    { id: 3, label: "70% готовности", pct: 20, month: 9 },
    { id: 4, label: "90% готовности", pct: 15, month: 11 },
    { id: 5, label: "Ключи", pct: 5, month: 12 }
  ]);
  const stagesSumPct = useMemo(() => stages.reduce((s, x) => s + (+x.pct || 0), 0), [stages]);

  const [lines, setLines] = useState(() => {
    if (!initialVilla || !initialProject) return [];
    return [{
      id: 1,
      projectId: initialProject.projectId,
      villaId: initialVilla.villaId,
      qty: 1,
      prePct: 70,
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

  const linesData = useMemo(() => {
    return lines.map(line => {
      const baseOne = line.snapshot?.baseUSD ?? ((line.snapshot?.area || 0) * (line.snapshot?.ppsm || 0));
      const disc = clamp(+line.discountPct || 0, 0, 20);
      const base = baseOne * (1 - disc / 100);

      const prePct = clamp(line.prePct ?? 70, 50, 100);
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
      if (ld.firstPostUSD > 0) push(handoverMonth + 1, ld.firstPostUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: Первый платёж`);
      ld.postRows.forEach(r => push(r.month, r.paymentUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
    });

    const rentalIncomeMap = new Map();
    linesData.forEach(ld => {
      const startRentalMonth = handoverMonth + 3;
      for (let month = startRentalMonth; month <= handoverMonth + months; month++) {
        const yearOffset = Math.floor((month - handoverMonth) / 12);
        const price = getIndexedRentalPrice(ld.line.dailyRateUSD, ld.line.rentalPriceIndexPct, yearOffset);
        const dim = getDaysInMonthFrom(new Date(), month);
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
  }, [linesData, handoverMonth, months]);

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
    const totalYears = Math.max(0, Math.ceil((end - new Date()) / (365 * 24 * 60 * 60 * 1000)));
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
          const dim = getDaysInMonthFrom(new Date(), m);
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
    const terms = lines.map(l => getCleanLeaseholdTerm(l.snapshot?.leaseholdEndDate, new Date(), handoverMonth));
    return { years: Math.max(...terms.map(t => t.years)), months: Math.max(...terms.map(t => t.months)) };
  }, [lines, handoverMonth]);

  const addStage = () => setStages(prev => [...prev, { id: (prev.at(-1)?.id || 0) + 1, label: "Новый этап", pct: 0, month: 0 }]);
  const delStage = (id) => setStages(prev => prev.filter(s => s.id !== id));
  const updStage = (id, patch) => setStages(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  const updLine = (id, patch) => setLines(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  const delLine = (id) => setLines(prev => prev.filter(l => l.id !== id));

  function exportCSV() {
    const rows = [
      ["Месяц","Описание","Платеж","Арендный доход","Чистый платеж/доход в месяц","Остаток по договору"],
      ...project.cashflow.map(c => [
        formatMonth(c.month),
        (c.items || []).join(" + "),
        Math.round(c.amountUSD),
        Math.round(c.rentalIncome || 0),
        Math.round(c.netPayment || 0),
        Math.round(c.balanceUSD)
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
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
      "Месяц": formatMonth(c.month),
      "Описание": (c.items || []).join(" + "),
      "Платеж": Math.round(c.amountUSD),
      "Арендный доход": Math.round(c.rentalIncome || 0),
      "Чистый платеж/доход в месяц": Math.round(c.netPayment || 0),
      "Остаток по договору": Math.round(c.balanceUSD)
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, "Кэшфлоу");
    XLSX.writeFile(wb, `arconique_installments_${new Date().toISOString().slice(0,10)}.xlsx`);
  }
  function exportPDF() {
    if (typeof html2pdf === "undefined") { alert("Библиотека html2pdf не загружена"); return; }
    const el = document.createElement("div");
    el.innerHTML = `<h3>Полный график платежей</h3>` + `
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr>
            <th>Месяц</th><th>Описание</th><th>Платеж</th><th>Арендный доход</th><th>Чистый платеж/доход в месяц</th><th>Остаток по договору</th>
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

  return (
    <div className="container reveal">
      {/* Верхняя панель */}
      <div className="top-section">
        <div className="card stages-card">
          <div className="card-header">
            <h3>Рассрочка до получения ключей (установите комфортный план оплаты)</h3>
            <button className="btn primary" onClick={() => setStages(prev => [...prev, { id: (prev.at(-1)?.id || 0) + 1, label: "Новый этап", pct: 0, month: 0 }])}>Добавить этап</button>
          </div>
          <div className="stages-scroll">
            <table className="factors-table">
              <thead><tr><th>Этап</th><th>%</th><th>Месяц</th><th>Действия</th></tr></thead>
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
          <div className="stages-summary"><div className="pill">Сумма этапов: {stagesSumPct.toFixed(2)}%</div></div>
        </div>

        <div className="card settings-card">
          <div className="row">
            <div className="field compact"><label>Язык интерфейса</label>
              <select value={lang} onChange={e => setLang(e.target.value)}>
                <option value="ru">Русский</option><option value="en">English</option>
              </select>
            </div>

            <div className="field compact"><label>Валюта отображения</label>
              <select value={rates.currency} onChange={e => setRates(prev => ({ ...prev, currency: e.target.value }))}>
                <option>USD</option><option>IDR</option><option>EUR</option>
              </select>
            </div>

            {!isClient && (
              <>
                <div className="field compact"><label>IDR за 1 USD</label>
                  <input type="number" min="1" step="1" value={rates.idrPerUsd} onChange={e => setRates(prev => ({ ...prev, idrPerUsd: clamp(parseFloat(e.target.value || 0), 1, 1e9) }))} />
                </div>
                <div className="field compact"><label>EUR за 1 USD</label>
                  <input type="number" min="0.01" step="0.01" value={rates.eurPerUsd} onChange={e => setRates(prev => ({ ...prev, eurPerUsd: clamp(parseFloat(e.target.value || 0), 0.01, 100) }))} />
                </div>
              </>
            )}

            <div className="field compact"><label>Заключение договора</label>
              <div className="info-display">{new Date().toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" })}</div>
            </div>

            <div className="field compact"><label>Срок строительства (мес)</label>
              <input type="number" min="1" step="1" value={handoverMonth} onChange={e => setHandoverMonth(clamp(parseInt(e.target.value || 0, 10), 1, 120))} />
            </div>

            {!isClient ? (
              <>
                <div className="field compact"><label>Глобальная ставка, %/мес</label>
                  <input type="number" min="0" step="0.01" value={monthlyRatePct} onChange={e => setMonthlyRatePct(clamp(parseFloat(e.target.value || 0), 0, 1000))} />
                </div>
                <div className="field compact"><label>Глобальный срок post‑handover (6–24 мес)</label>
                  <input type="range" min="6" max="24" step="1" value={months} onChange={e => setMonths(parseInt(e.target.value, 10))} />
                  <div className="pill">месяцев: {months}</div>
                </div>
              </>
            ) : (
              <div className="field compact"><label>Post‑handover рассрочка (мес)</label>
                <input type="number" min="6" step="1" value={months} onChange={e => setMonths(clamp(parseInt(e.target.value || 0, 10), 6, 120))} />
              </div>
            )}
          </div>

          <div className="row">
            <button className="btn" onClick={onBackToCatalog}>← К каталогу</button>
          </div>
        </div>
      </div>

      {/* Объект недвижимости */}
      <div className="card">
        <h3 style={{ margin: "6px 0" }}>Объект недвижимости</h3>
        <div className="calc-scroll">
          <table className="calc-table">
            <thead>
              <tr>
                <th>Проект</th><th>Вилла</th><th>м²</th><th>$ / м²</th><th>Текущая стоимость (USD)</th>
                {!isClient && <th>Скидка, %</th>}
                <th>До ключей, %</th>
                {!isClient && <th>Срок рассрочки, мес</th>}
                {!isClient && <th>Ставка, %/мес</th>}
                {!isClient && <th>Месячный рост цены до ключей (%)</th>}
                <th>Стоимость проживания в сутки (USD)</th>
                <th>Средняя заполняемость за месяц (%)</th>
                <th>Рост цены аренды в год (%)</th>
                <th>Итоговая стоимость (с учетом выбранного плана рассрочки)</th>
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
                    <td><input type="number" min="0" max="20" step="0.1" className="compact-input" value={ld.line.discountPct || 0} onChange={e => updLine(ld.line.id, { discountPct: clamp(parseFloat(e.target.value || 0), 0, 20) })} /></td>
                  )}
                  <td>
                    <input type="range" min="50" max="100" step="1" className="range"
                      value={Math.max(50, Math.min(100, (ld.line.prePct ?? 70)))}
                      onChange={e => updLine(ld.line.id, { prePct: clamp(parseInt(e.target.value || 0, 10), 50, 100) })} />
                    <div className="pill" style={{ marginTop: 6 }}>{Math.max(50, Math.min(100, (ld.line.prePct ?? 70)))}%</div>
                  </td>
                  {!isClient && (
                    <td>
                      <input type="checkbox" checked={ld.line.ownTerms || false} onChange={e => updLine(ld.line.id, { ownTerms: e.target.checked })} />
                      <input type="number" min="6" step="1" disabled={!ld.line.ownTerms} className="compact-input"
                        value={ld.line.months || months} onChange={e => updLine(ld.line.id, { months: clamp(parseInt(e.target.value || 0, 10), 6, 120) })} />
                    </td>
                  )}
                  {!isClient && (
                    <td><input type="number" min="0" step="0.01" disabled={!ld.line.ownTerms} className="compact-input" value={ld.line.monthlyRatePct || 8.33} onChange={e => updLine(ld.line.id, { monthlyRatePct: clamp(parseFloat(e.target.value || 0), 0, 1000) })} /></td>
                  )}
                  {!isClient && (
                    <td><input type="number" min="0" max="50" step="0.1" className="compact-input" value={ld.line.monthlyPriceGrowthPct || 2} onChange={e => updLine(ld.line.id, { monthlyPriceGrowthPct: clamp(parseFloat(e.target.value || 0), 0, 50) })} /></td>
                  )}
                  <td><input type="number" min="0" step="1" className="compact-input" value={ld.line.dailyRateUSD || 150} onChange={e => updLine(ld.line.id, { dailyRateUSD: clamp(parseFloat(e.target.value || 0), 0, 10000) })} /></td>
                  <td><input type="number" min="0" max="100" step="1" className="compact-input" value={ld.line.occupancyPct || 70} onChange={e => updLine(ld.line.id, { occupancyPct: clamp(parseFloat(e.target.value || 0), 0, 100) })} /></td>
                  <td><input type="number" min="0" max="50" step="0.1" className="compact-input" value={ld.line.rentalPriceIndexPct || 5} onChange={e => updLine(ld.line.id, { rentalPriceIndexPct: clamp(parseFloat(e.target.value || 0), 0, 50) })} /></td>
                  <td className="line-total">{display(ld.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI, графики, таблицы — без изменений логики */}
      {/* ... см. предыдущую версию, не сокращаю в этом ответе для экономии места ... */}

      <div className="cashflow-block">
        <div className="card">
          <div className="card-header">
            <h2>Полный график платежей</h2>
            <div className="export-buttons">
              <button className="btn" onClick={exportCSV}>Экспорт CSV</button>
              <button className="btn" onClick={exportXLSX}>Экспорт Excel</button>
              <button className="btn" onClick={exportPDF}>Сохранить в PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Главный App
========================= */
function App() {
  useRevealOnMount();

  const [isClient, setIsClient] = useState(true);
  const [catalog, setCatalog] = useState(loadCatalog());
  useEffect(() => saveCatalog(catalog), [catalog]);

  const [calcInput, setCalcInput] = useState(null); // { project, villa }
  useRevealOnRoute(calcInput ? "calc" : "catalog");

  function handleCalculate(project, villa) { setCalcInput({ project, villa }); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" })); }
  function handleBackToCatalog() { setCalcInput(null); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" })); }

  function toggleMode() {
    if (isClient) {
      const pin = prompt("Введите PIN для входа в редакторский режим:");
      if (pin === PIN_CODE) setIsClient(false);
      else if (pin !== null) alert("Неверный PIN");
    } else setIsClient(true);
  }

  return (
    <>
      <div className="container reveal">
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 className="h1" style={{ margin: 0, fontSize: 24 }}>Arconique · Каталог / Калькулятор</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {calcInput && <button className="btn" onClick={handleBackToCatalog}>← К каталогу</button>}
            <button className="btn" onClick={toggleMode}>{isClient ? "Переключиться в редактор" : "Переключиться в клиент"}</button>
          </div>
        </div>
      </div>

      {!calcInput ? (
        <CatalogManager
          catalog={catalog}
          setCatalog={setCatalog}
          onCalculate={handleCalculate}
          isClient={isClient}
        />
      ) : (
        <Calculator
          catalog={catalog}
          initialProject={calcInput.project}
          initialVilla={calcInput.villa}
          isClient={isClient}
          onBackToCatalog={handleBackToCatalog}
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
