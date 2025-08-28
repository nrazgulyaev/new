// app.js
// продолжаем
const { useEffect, useMemo, useState } = React;
const { createRoot } = ReactDOM;

const PIN_CODE = "334346";
const LS_CATALOG = "arq_catalog_v2";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmtInt = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmt2 = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(+n || 0);
const fmtMoney = (n, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(Math.round(n || 0));

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

function defaults() {
  return [
    {
      projectId: "ahau-gardens",
      projectName: "Ahau Gardens by Arconique",
      theme: "light",
      includes: ["Полная комплектация (под ключ)", "Налог с продаж 10%", "Нотариальные 1%", "График платежей: 30%+30%+25%+10%+5%"],
      villas: [
        { villaId: "ahau-a1-2br", name: "A1", status: "hold", rooms: "2", land: 201.7, area: 142.7, f1: 107.1, f2: 38.89, roof: 0, garden: 57.5, ppsm: 2200, baseUSD: 282828, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2055-01-01", dailyRateUSD: 220, rentalPriceIndexPct: 5 },
        { villaId: "ahau-a6-2br", name: "A6", status: "reserved", rooms: "2", land: 201.7, area: 142.7, f1: 107.1, f2: 38.89, roof: 0, garden: 57.5, ppsm: 2250, baseUSD: 289229, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2055-01-01", dailyRateUSD: 230, rentalPriceIndexPct: 5 },
        { villaId: "ahau-b1-2rt", name: "B1", status: "hold", rooms: "2+rt", land: 100.5, area: 192.0, f1: 83.1, f2: 67.96, roof: 40.9, garden: 24.51, ppsm: null, baseUSD: null, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2055-01-01", dailyRateUSD: 260, rentalPriceIndexPct: 5 }
      ]
    },
    {
      projectId: "enso-villas",
      projectName: "ENSO by Arconique",
      theme: "light",
      includes: ["Полная комплектация (под ключ)", "Налог с продаж 10%", "Нотариальные 1%", "График платежей: 30%+30%+25%+10%+5%"],
      villas: [
        { villaId: "enso-l1-2br", name: "L1", status: "hold", rooms: "2", land: 174.6, area: 104.1, f1: 0, f2: 0, roof: 0, garden: 40.73, ppsm: 2410, baseUSD: 244775, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2054-12-01", dailyRateUSD: 220, rentalPriceIndexPct: 5 },
        { villaId: "enso-v1-2br", name: "V1", status: "hold", rooms: "2", land: 165.8, area: 114.1, f1: 0, f2: 0, roof: 0, garden: 43.4, ppsm: 2549, baseUSD: 262018, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2054-12-01", dailyRateUSD: 230, rentalPriceIndexPct: 5 }
      ]
    },
    {
      projectId: "eternal-villas",
      projectName: "Eternal Villas by Arconique",
      theme: "light",
      includes: ["Полная комплектация (под ключ)", "Налог с продаж 10%", "Нотариальные 1%", "График платежей: 30%+30%+25%+10%+5%"],
      villas: [
        { villaId: "eternal-p1-3rt", name: "P1", status: "hold", rooms: "3+rt", land: 124, area: 218, f1: 109.8, f2: 76.07, roof: 32.09, garden: 44.21, ppsm: 2200, baseUSD: 431531, monthlyPriceGrowthPct: 2, leaseholdEndDate: "2055-01-01", dailyRateUSD: 550, rentalPriceIndexPct: 5 }
      ]
    }
  ];
}

function useHashRoute() {
  const parse = () => {
    const hash = window.location.hash || "#/catalog";
    const [path, q] = hash.split("?");
    const params = {};
    if (q) q.split("&").forEach(s => { const [k,v] = s.split("="); params[decodeURIComponent(k)] = decodeURIComponent(v||""); });
    return { path, params };
  };
  const [route, setRoute] = useState(parse());
  useEffect(() => { const onHash = () => setRoute(parse()); window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash); }, []);
  return route;
}

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-neutral-900 text-white grid place-items-center font-semibold">A</div>
          <div className="leading-tight">
            <div className="font-semibold">Arconique</div>
            <div className="text-xs text-neutral-500">Каталог · Админ · Калькулятор</div>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <a href="#/catalog" className="px-3 py-1.5 rounded-lg border hover:bg-neutral-50">Каталог</a>
          <a href="#/admin" className="px-3 py-1.5 rounded-lg border hover:bg-neutral-50">Админ</a>
        </nav>
      </div>
    </header>
  );
}
function Th({ children }) { return <th className="px-2 py-2 md:px-3 md:py-3 text-left font-medium align-top whitespace-normal leading-snug">{children}</th>; }
function Td({ children, className="", style }) { return <td className={`px-2 py-2 md:px-3 md:py-3 align-top leading-snug ${className}`} style={style}>{children}</td>; }
function StatusPill({ value }) {
  const map = { available: "bg-emerald-100 text-emerald-800", reserved: "bg-amber-100 text-amber-800", hold: "bg-slate-100 text-slate-700" };
  const label = value==="available"?"Доступно": value==="reserved"?"Забронировано":"На паузе";
  return <span className={`px-2 py-1 rounded-xl text-xs inline-block w-[120px] text-center ${map[value]||"bg-slate-100 text-slate-700"}`}>{label}</span>;
}

function AdminGate({ onLogin }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="mx-auto max-w-md p-5">
      <h2 className="text-xl font-semibold mb-3">Вход в админ‑панель</h2>
      <div className="grid gap-3 border rounded-2xl p-4">
        <label className="grid gap-1">
          <span className="text-sm text-neutral-600">PIN</span>
          <input className="px-3 py-2 rounded-xl border" type="password" value={pin} onChange={e=>setPin(e.target.value)} />
        </label>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl bg-neutral-900 text-white" onClick={()=> pin===PIN_CODE ? onLogin() : setErr("Неверный PIN")}>Войти</button>
          <a className="px-4 py-2 rounded-xl border" href="#/catalog">Назад</a>
        </div>
      </div>
    </div>
  );
}

function VillaModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || {});
  useEffect(()=> setForm(initial||{}), [initial]);
  const set = (k,v) => setForm(s=>({...s, [k]:v}));
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onMouseDown={onClose}>
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl" onMouseDown={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{initial?.villaId ? "Редактировать виллу" : "Добавить виллу"}</h3>
            <div className="text-xs text-neutral-500">Укажите все параметры для каталога и финмодели</div>
          </div>
          <button className="text-neutral-500 hover:text-black" onClick={onClose}>✕</button>
        </div>
        <div className="p-4 grid gap-4">
          <div className="grid md:grid-cols-3 gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Название (Villa type)</span>
              <input className="px-3 py-2 rounded-xl border" value={form.name||""} onChange={(e)=>set("name", e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Статус</span>
              <select className="px-3 py-2 rounded-xl border" value={form.status||"available"} onChange={(e)=>set("status", e.target.value)}>
                <option value="available">Доступно</option>
                <option value="reserved">Забронировано</option>
                <option value="hold">На паузе</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Комнат (Q Rooms)</span>
              <input className="px-3 py-2 rounded-xl border" value={form.rooms||""} onChange={(e)=>set("rooms", e.target.value)} />
            </label>
          </div>

          <div className="grid md:grid-cols-6 gap-3">
            <Num label="Земля, м²" value={form.land} set={(v)=>set("land", v)} />
            <Num label="Вилла, м²" value={form.area} set={(v)=>set("area", v)} />
            <Num label="1 этаж, м²" value={form.f1} set={(v)=>set("f1", v)} />
            <Num label="2 этаж, м²" value={form.f2} set={(v)=>set("f2", v)} />
            <Num label="Руфтоп, м²" value={form.roof} set={(v)=>set("roof", v)} />
            <Num label="Сад+бассейн, м²" value={form.garden} set={(v)=>set("garden", v)} />
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            <Num label="$ / м²" value={form.ppsm} set={(v)=>set("ppsm", v)} />
            <Num label="База, $" value={form.baseUSD} set={(v)=>set("baseUSD", v)} />
            <Num label="Рост до ключей, %/мес" value={form.monthlyPriceGrowthPct} set={(v)=>set("monthlyPriceGrowthPct", v)} />
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Лизхолд до (YYYY-MM-DD)</span>
              <input className="px-3 py-2 rounded-xl border" value={form.leaseholdEndDate||""} onChange={(e)=>set("leaseholdEndDate", e.target.value)} />
            </label>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Num label="Ночь, $" value={form.dailyRateUSD} set={(v)=>set("dailyRateUSD", v)} />
            <Num label="Заполняемость, %" value={form.occupancyPct} set={(v)=>set("occupancyPct", v)} />
            <Num label="Индекс аренды %/год" value={form.rentalPriceIndexPct} set={(v)=>set("rentalPriceIndexPct", v)} />
          </div>

          <div className="text-xs text-neutral-500">
            Подсказка: если указать только «База, $» и «Вилла, м²», система вычислит «$ / м²». И наоборот.
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <button className="px-3 py-2 rounded-xl border" onClick={onClose}>Отмена</button>
          <button
            className="px-3 py-2 rounded-xl bg-neutral-900 text-white"
            onClick={()=>{
              const data = { ...form };
              const area = +data.area || 0, ppsm = +data.ppsm || 0, base = +data.baseUSD || 0;
              if (!ppsm && base && area) data.ppsm = Math.round(base/area);
              if (!base && ppsm && area) data.baseUSD = Math.round(ppsm*area);
              onSave(data);
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
function Num({ label, value, set }) {
  const [txt, setTxt] = useState(value ?? "");
  useEffect(()=> setTxt(value ?? ""), [value]);
  return (
    <label className="grid gap-1">
      <span className="text-sm text-neutral-600">{label}</span>
      <input
        inputMode="decimal"
        className="px-3 py-2 rounded-xl border"
        value={txt}
        onChange={(e)=>{ setTxt(e.target.value); set(e.target.value===""? null : +e.target.value); }}
      />
    </label>
  );
}

function AdminPanel({ catalog, setCatalog }) {
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [villaModal, setVillaModal] = useState({ open:false, projectId:null, init:null });
  const fileRef = React.useRef(null);

  const addProject = () => {
    const name = (newProjectName||"").trim();
    if (!name) return;
    const projectId = name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    if (catalog.some(p=>p.projectId===projectId)) { alert("Проект с таким ID уже есть"); return; }
    const next = [...catalog, { projectId, projectName: name, theme:"light", includes:[], villas: [] }];
    setCatalog(next); saveCatalog(next); setNewProjectName(""); setShowAddProject(false);
  };

  const openAddVilla = (projectId) => setVillaModal({ open:true, projectId, init:{ status:"available", monthlyPriceGrowthPct:2, rentalPriceIndexPct:5 }});
  const openEditVilla = (projectId, v) => setVillaModal({ open:true, projectId, init:{ ...v } });

  const saveVilla = (data) => {
    const projectId = villaModal.projectId;
    if (!projectId) return;
    const name = (data.name||"").trim();
    if (!name) { alert("Введите название виллы"); return; }

    const next = catalog.map(p=>{
      if (p.projectId !== projectId) return p;
      const villaId = data.villaId || (projectId+"-"+name.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""));
      const exists = p.villas.some(v=>v.villaId===villaId);
      const record = { ...data, villaId };
      return { ...p, villas: exists ? p.villas.map(v=> v.villaId===villaId ? record : v) : [...p.villas, record] };
    });
    setCatalog(next); saveCatalog(next); setVillaModal({ open:false, projectId:null, init:null });
  };

  const deleteVilla = (projectId, villaId) => {
    if (!confirm("Удалить виллу?")) return;
    const next = catalog.map(p=> p.projectId===projectId ? { ...p, villas: p.villas.filter(v=>v.villaId!==villaId) } : p);
    setCatalog(next); saveCatalog(next);
  };
  const deleteProject = (projectId) => {
    if (!confirm("Удалить проект и все виллы?")) return;
    const next = catalog.filter(p=>p.projectId!==projectId);
    setCatalog(next); saveCatalog(next);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(catalog,null,2)], {type:"application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href=url; a.download=`arconique_catalog_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const importJSON = (file) => {
    if (!file) return;
    file.text().then(txt=>{
      try {
        const data = JSON.parse(txt);
        if (!Array.isArray(data)) throw new Error("Неверный формат");
        setCatalog(data); saveCatalog(data);
      } catch(e){ alert("Ошибка импорта: "+e.message); }
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Админ‑панель</h2>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border" onClick={()=>setShowAddProject(true)}>Добавить проект</button>
          <button className="px-3 py-1.5 rounded-lg border" onClick={exportJSON}>Экспорт JSON</button>
          <label className="px-3 py-1.5 rounded-lg border cursor-pointer">Импорт JSON
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={e=>importJSON(e.target.files?.[0])} />
          </label>
          <a className="px-3 py-1.5 rounded-lg border" href="#/catalog">Выйти</a>
        </div>
      </div>

      <div className="grid gap-8">
        {catalog.map(project=>(
          <section key={project.projectId} className={`${project.theme==="dark" ? "bg-[#0f3b33] text-white" : "bg-[#f8f5ef] text-neutral-900"} rounded-3xl border p-4`}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className={`text-xl font-semibold ${project.theme==="dark"?"text-white":"text-neutral-900"}`}>{project.projectName}</h3>
                {project.includes?.length>0 && (
                  <ul className={`mt-1 text-sm space-y-1 ${project.theme==="dark"?"text-white/80":"text-neutral-700"}`}>
                    {project.includes.map((x,i)=><li key={i}>• {x}</li>)}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg border" onClick={()=>openAddVilla(project.projectId)}>Добавить виллу</button>
                <button className="px-3 py-1.5 rounded-lg border text-red-600" onClick={()=>deleteProject(project.projectId)}>Удалить проект</button>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[clamp(11px,0.9vw,14px)] min-w-[1200px]">
                <thead>
                  <tr className={`${project.theme==="dark"?"bg-white/10 text-white":"bg-neutral-50"}`}>
                    <Th>Вилла</Th><Th>Q Rooms</Th><Th>Земля, м²</Th><Th>Вилла, м²</Th><Th>1 этаж, м²</Th><Th>2 этаж, м²</Th><Th>Руфтоп, м²</Th><Th>Сад+бассейн, м²</Th>
                    <Th>$ / м²</Th><Th>База, $</Th><Th><span className="inline-block w-[140px]">Статус</span></Th><Th><span className="inline-block w-[200px]">Действия</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {project.villas.map(v=>(
                    <tr key={v.villaId} className={`${project.theme==="dark" ? "border-white/15" : "border-neutral-200"} border-t`}>
                      <Td className="whitespace-nowrap">{v.name}</Td>
                      <Td>{v.rooms||""}</Td>
                      <Td>{v.land!=null? fmt2(v.land) : ""}</Td>
                      <Td>{v.area!=null? fmt2(v.area) : ""}</Td>
                      <Td>{v.f1!=null? fmt2(v.f1) : ""}</Td>
                      <Td>{v.f2!=null? fmt2(v.f2) : ""}</Td>
                      <Td>{v.roof!=null? fmt2(v.roof) : ""}</Td>
                      <Td>{v.garden!=null? fmt2(v.garden) : ""}</Td>
                      <Td>{v.ppsm!=null? fmtInt(v.ppsm) : ""}</Td>
                      <Td>{v.baseUSD!=null? fmtInt(v.baseUSD) : ""}</Td>
                      <Td><div className="w-[140px] overflow-hidden"><StatusPill value={v.status||"available"} /></div></Td>
                      <Td>
                        <div className="w-[200px] flex gap-2">
                          {v.status==="available"
                            ? <a className="px-3 py-1.5 rounded-lg text-xs bg-neutral-900 text-white" href={`#/calc?villaId=${encodeURIComponent(v.villaId)}`}>Рассчитать</a>
                            : <span className="px-3 py-1.5 rounded-lg text-xs border bg-white">Недоступно</span>}
                          <button className="px-3 py-1.5 rounded-lg text-xs border" onClick={()=>openEditVilla(project.projectId, v)}>Править</button>
                          <button className="px-3 py-1.5 rounded-lg text-xs border" onClick={()=>deleteVilla(project.projectId, v.villaId)}>Удалить</button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                  {project.villas.length===0 && <tr><td className="px-3 py-3 text-neutral-500" colSpan={12}>Нет вилл</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {showAddProject && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4" onMouseDown={()=>setShowAddProject(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white border" onMouseDown={(e)=>e.stopPropagation()}>
            <div className="p-4 border-b font-semibold">Добавить проект</div>
            <div className="p-4 grid gap-2">
              <label className="grid gap-1">
                <span className="text-sm text-neutral-600">Название</span>
                <input className="px-3 py-2 rounded-xl border" value={newProjectName} onChange={e=>setNewProjectName(e.target.value)} />
              </label>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button className="px-3 py-2 rounded-xl border" onClick={()=>setShowAddProject(false)}>Отмена</button>
              <button className="px-3 py-2 rounded-xl bg-neutral-900 text-white" onClick={addProject}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      <VillaModal
        open={villaModal.open}
        initial={villaModal.init}
        onClose={()=>setVillaModal({ open:false, projectId:null, init:null })}
        onSave={saveVilla}
      />
    </div>
  );
}

function CatalogView({ catalog }) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Каталог проектов</h2>
        <a href="#/admin" className="px-3 py-1.5 rounded-lg border">Админ</a>
      </div>

      <div className="grid gap-8">
        {catalog.map(project=>(
          <section key={project.projectId} className={`${project.theme==="dark" ? "bg-[#0f3b33] text-white" : "bg-[#f8f5ef] text-neutral-900"} rounded-3xl border p-4`}>
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className={`text-xl font-semibold ${project.theme==="dark"?"text-white":"text-neutral-900"}`}>{project.projectName}</h3>
                {project.includes?.length>0 && (
                  <ul className={`mt-1 text-sm space-y-1 ${project.theme==="dark"?"text-white/80":"text-neutral-700"}`}>
                    {project.includes.map((x,i)=><li key={i}>• {x}</li>)}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-[clamp(11px,0.9vw,14px)] min-w-[1200px]">
                <thead>
                  <tr className={`${project.theme==="dark"?"bg-white/10 text-white":"bg-neutral-50"}`}>
                    <Th>Вилла</Th><Th>Q Rooms</Th><Th>Земля, м²</Th><Th>Вилла, м²</Th><Th>1 этаж, м²</Th><Th>2 этаж, м²</Th><Th>Руфтоп, м²</Th><Th>Сад+бассейн, м²</Th>
                    <Th>$ / м²</Th><Th>База, $</Th><Th><span className="inline-block w-[140px]">Статус</span></Th><Th><span className="inline-block w-[140px]">Действия</span></Th>
                  </tr>
                </thead>
                <tbody>
                  {project.villas.map(v=>(
                    <tr key={v.villaId} className={`${project.theme==="dark" ? "border-white/15" : "border-neutral-200"} border-t`}>
                      <Td className="whitespace-nowrap">{v.name}</Td>
                      <Td>{v.rooms||""}</Td>
                      <Td>{v.land!=null? fmt2(v.land) : ""}</Td>
                      <Td>{v.area!=null? fmt2(v.area) : ""}</Td>
                      <Td>{v.f1!=null? fmt2(v.f1) : ""}</Td>
                      <Td>{v.f2!=null? fmt2(v.f2) : ""}</Td>
                      <Td>{v.roof!=null? fmt2(v.roof) : ""}</Td>
                      <Td>{v.garden!=null? fmt2(v.garden) : ""}</Td>
                      <Td>{v.ppsm!=null? fmtInt(v.ppsm) : ""}</Td>
                      <Td>{v.baseUSD!=null? fmtInt(v.baseUSD) : ""}</Td>
                      <Td><div className="w-[140px] overflow-hidden"><StatusPill value={v.status||"available"} /></div></Td>
                      <Td>
                        <div className="w-[140px]">
                          {v.status==="available"
                            ? <a className="px-3 py-1.5 rounded-lg text-xs bg-neutral-900 text-white" href={`#/calc?villaId=${encodeURIComponent(v.villaId)}`}>Рассчитать</a>
                            : <span className="px-3 py-1.5 rounded-lg text-xs border bg-white">Недоступно</span>}
                        </div>
                      </Td>
                    </tr>
                  ))}
                  {project.villas.length===0 && <tr><td className="px-3 py-3 text-neutral-500" colSpan={12}>Нет вилл</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// FACTORS & helpers
const leaseFactorF = (year, totalYears, alpha) => { try { if (totalYears<=0 || year<0) return 1; return Math.pow((totalYears - year)/totalYears, alpha); } catch { return 1; } };
const ageFactorF   = (year, beta) => { try { if (year<0 || beta<0) return 1; return Math.exp(-beta * year); } catch { return 1; } };
const brandFactorF = (year, cfg) => {
  try {
    const { brandPeak, brandRampYears, brandPlateauYears, brandDecayYears, brandTail } = cfg;
    if (year <= brandRampYears) return 1 + (brandPeak-1) * (year/brandRampYears);
    if (year <= brandRampYears + brandPlateauYears) return brandPeak;
    if (year <= brandRampYears + brandPlateauYears + brandDecayYears) {
      const d = (year - brandRampYears - brandPlateauYears) / brandDecayYears;
      return brandPeak - (brandPeak - brandTail) * d;
    }
    return brandTail;
  } catch { return 1; }
};
const calculateIRR = (cashFlows, maxIterations=100, tolerance=1e-4) => {
  try {
    if (cashFlows.length<2) return 0;
    let guess=0.1;
    for (let it=0; it<maxIterations; it++) {
      let npv=0, der=0;
      for (let i=0;i<cashFlows.length;i++){
        const df = Math.pow(1+guess, i);
        npv += cashFlows[i]/df;
        if (i>0) der -= i*cashFlows[i]/(df*(1+guess));
      }
      if (Math.abs(npv)<tolerance) return guess*100;
      if (Math.abs(der)<tolerance) break;
      guess = guess - npv/der;
      if (guess<-0.99 || guess>10) break;
    }
    return guess*100;
  } catch { return 0; }
};

function CalcView({ catalog, villaId, isAdmin }) {
  const selected = useMemo(()=>{
    for (const p of catalog) {
      const v = p.villas.find(x=>x.villaId===villaId);
      if (v) return { project:p, villa:v };
    }
    return null;
  },[catalog, villaId]);

  // Настройки
  const [lang, setLang] = useState('ru');
  const [currency, setCurrency] = useState('USD');
  const [handoverMonth, setHandoverMonth] = useState(12);
  const [months, setMonths] = useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33);
  const [startMonth] = useState(new Date());
  const [pricingConfig] = useState({ inflationRatePct:10, leaseAlpha:1, agingBeta:0.025, brandPeak:1.2, brandRampYears:3, brandPlateauYears:4, brandDecayYears:8, brandTail:1.0 });

  // Стадии
  const [stages, setStages] = useState([
    {id:1,label:'Договор',pct:30,month:0},
    {id:2,label:'50% готовности',pct:30,month:6},
    {id:3,label:'70% готовности',pct:20,month:9},
    {id:4,label:'90% готовности',pct:15,month:11},
    {id:5,label:'Ключи',pct:5,month:12},
  ]);
  const stagesSumPct = stages.reduce((s,x)=> s+(+x.pct||0), 0);
  const addStage = () => setStages(prev=>[...prev, { id:prev.length+1, label:'Новый этап', pct:0, month:0 }]);
  const updStage = (id, patch) => setStages(prev=>prev.map(s=> s.id===id ? {...s, ...(patch.pct!==undefined ? {pct: clamp(+patch.pct||0,0,100)}:patch)} : s));
  const delStage = (id) => setStages(prev=>prev.filter(s=>s.id!==id));

  // Позиции
  const [lines, setLines] = useState([]);
  useEffect(()=>{
    if (!selected) return;
    if (lines.length>0) return;
    const { project, villa } = selected;
    setLines([{
      id:1, projectId: project.projectId, villaId: villa.villaId, qty:1, prePct:70, ownTerms:false,
      months:null, monthlyRatePct:null, firstPostUSD:0, discountPct:0,
      monthlyPriceGrowthPct: villa.monthlyPriceGrowthPct||2,
      dailyRateUSD: villa.dailyRateUSD||150, occupancyPct:75, rentalPriceIndexPct: villa.rentalPriceIndexPct||5,
      snapshot: { name: villa.name, area: villa.area, ppsm: villa.ppsm, baseUSD: villa.baseUSD, leaseholdEndDate: villa.leaseholdEndDate ? new Date(villa.leaseholdEndDate) : null }
    }]);
  },[selected, lines.length]);

  const updLine = (id, patch) => setLines(prev=>prev.map(l=> l.id===id ? {...l, ...patch} : l));
  const delLine = (id) => setLines(prev=>prev.filter(l=> l.id!==id));

  // Расчеты линий
  const linesData = useMemo(()=>{
    return lines.map(line=>{
      const base0 = line.snapshot?.baseUSD ?? ((line.snapshot?.area||0)*(line.snapshot?.ppsm||0));
      const disc = clamp(+line.discountPct||0,0,20);
      const base = base0 * (1 - disc/100);
      const prePct = clamp(line.prePct ?? 0, 50, 100);

      const vMonths = line.ownTerms && line.months ? line.months : months;
      const rate = (line.ownTerms && line.monthlyRatePct!=null) ? (line.monthlyRatePct/100) : (monthlyRatePct/100);
      const firstPostUSD = Math.max(0,+line.firstPostUSD||0);

      const k = stagesSumPct===0 ? 0 : prePct/stagesSumPct;
      const preSchedule = stages.map(s=>({
        month: Math.max(0, Math.min(handoverMonth, Math.round(+s.month||0))),
        label: s.label,
        amountUSD: base * (((+s.pct||0)*k)/100),
      })).filter(r=>r.amountUSD>0).sort((a,b)=>a.month-b.month);

      const preTotalOne = preSchedule.reduce((s,r)=>s+r.amountUSD,0);

      let bal = Math.max(0, base - preTotalOne - firstPostUSD);
      let totalInterest = 0;
      const principalShare = vMonths>0 ? bal/vMonths : 0;
      const postRows = [];
      for (let i=1;i<=vMonths;i++){
        const interest = bal*rate; totalInterest += interest;
        const payment = principalShare + interest;
        postRows.push({ month: handoverMonth+i, label:`${i}`, principalUSD:principalShare, interestUSD:interest, paymentUSD:payment, balanceAfterUSD: Math.max(0, bal-principalShare) });
        bal -= principalShare;
      }

      const lineTotalOne = base + totalInterest;

      const qty = Math.max(1, parseInt(line.qty||1,10));
      const preScheduleQ = preSchedule.map(r=>({...r, amountUSD:r.amountUSD*qty}));
      const postRowsQ = postRows.map(r=>({...r, principalUSD:r.principalUSD*qty, interestUSD:r.interestUSD*qty, paymentUSD:r.paymentUSD*qty}));
      const preTotal = preTotalOne*qty;
      const baseQ = base*qty;
      const lineTotal = lineTotalOne*qty;

      return { line, qty, baseOne:base, base:baseQ, preSchedule:preScheduleQ, preTotal, firstPostUSD:firstPostUSD*qty, postRows:postRowsQ, lineTotal, vMonths, rate, discountPct:disc, prePct };
    });
  },[lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct]);

  const totals = useMemo(()=>{
    const baseUSD  = linesData.reduce((s,x)=> s+x.base, 0);
    const preUSD   = linesData.reduce((s,x)=> s+x.preTotal, 0);
    const finalUSD = linesData.reduce((s,x)=> s+x.lineTotal,0);
    const interestUSD = finalUSD - baseUSD;
    const afterUSD = finalUSD - preUSD;
    return { baseUSD, preUSD, finalUSD, interestUSD, afterUSD };
  },[linesData]);

  // Вспомогательные
  const getCleanLeaseholdTerm = (leaseholdEndDate) => {
    if (!leaseholdEndDate) return { years: 0, months: 0 };
    const handoverDate = new Date(startMonth);
    handoverDate.setMonth(handoverDate.getMonth() + handoverMonth);
    const diffTime = leaseholdEndDate.getTime() - handoverDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { years: 0, months: 0 };
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return { years, months };
  };
  const calculateMarketPriceAtHandover = (villa, line) => {
    if (!villa) return 0;
    const basePrice = villa.baseUSD || ((villa.area || 0) * (villa.ppsm || 0));
    const monthlyGrowthRate = ((line?.monthlyPriceGrowthPct ?? villa.monthlyPriceGrowthPct ?? 2) / 100);
    return basePrice * Math.pow(1 + monthlyGrowthRate, handoverMonth);
  };
  const getIndexedRentalPrice = (baseDailyUSD, indexPct, yearOffset) => {
    if (yearOffset <= 0) return baseDailyUSD || 0;
    return (baseDailyUSD || 0) * Math.pow(1 + (indexPct || 0) / 100, yearOffset);
  };
  const generatePricingData = (villa, line) => {
    if (!villa?.leaseholdEndDate) return [];
    const leaseEnd = new Date(villa.leaseholdEndDate);
    const totalYears = Math.max(0, Math.ceil((leaseEnd - startMonth) / (365 * 24 * 60 * 60 * 1000)));
    const data = [];
    const baseAtHandover = calculateMarketPriceAtHandover(villa, line);
    for (let year = 0; year <= totalYears; year++) {
      const inflation = Math.pow(1 + pricingConfig.inflationRatePct / 100, year);
      const lf = leaseFactorF(year, totalYears, pricingConfig.leaseAlpha);
      const af = ageFactorF(year, pricingConfig.agingBeta);
      const bf = brandFactorF(year, pricingConfig);
      const finalPrice = baseAtHandover * inflation * lf * af * bf;
      data.push({ year, finalPrice, leaseFactor:lf, ageFactor:af, brandFactor:bf, inflation });
    }
    return data;
  };
  const formatMonth = (monthOffset) => {
    const date = new Date(startMonth); date.setMonth(date.getMonth()+monthOffset);
    return date.toLocaleDateString('ru-RU', { month:'long', year:'numeric' });
  };
  const getDaysInMonth = (monthOffset) => {
    const date = new Date(startMonth);
    date.setMonth(date.getMonth() + monthOffset);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstLine = lines[0];
  const selectedVilla = React.useMemo(()=>{
    if (!firstLine) return null;
    for (const p of catalog) {
      const v = p.villas.find(x=>x.villaId===firstLine.villaId);
      if (v) return v;
    }
    return null;
  }, [catalog, lines]);

  const leaseTerm = React.useMemo(()=>{
    return selectedVilla?.leaseholdEndDate ? getCleanLeaseholdTerm(new Date(selectedVilla.leaseholdEndDate)) : { years: 0, months: 0 };
  }, [selectedVilla, startMonth, handoverMonth]);

  const monthBeforeKeys = Math.max(0, handoverMonth - 1);
  const basePrice0 = selectedVilla ? (selectedVilla.baseUSD || ((selectedVilla.area||0)*(selectedVilla.ppsm||0))) : 0;
  const monthlyGrowthRate = ((firstLine?.monthlyPriceGrowthPct ?? selectedVilla?.monthlyPriceGrowthPct ?? 2) / 100);
  const priceBeforeKeys = basePrice0 * Math.pow(1 + monthlyGrowthRate, monthBeforeKeys);
  const roiBeforeKeysAnnual = totals.finalUSD > 0
    ? (((priceBeforeKeys - totals.finalUSD) / totals.finalUSD) * (12 / Math.max(1, monthBeforeKeys + 1)) * 100)
    : 0;
  const netIncomeBeforeKeys = priceBeforeKeys - totals.finalUSD;

  const optimalExit = React.useMemo(()=>{
    const pricing = selectedVilla ? generatePricingData(selectedVilla, firstLine) : [];
    if (!pricing.length) return { year: 0, irr: 0, totalValue: 0 };
    let best = { year: 0, irr: -Infinity, totalValue: 0 };
    for (let i = 1; i < pricing.length; i++) {
      const cf = [-totals.finalUSD, ...Array(i).fill(0), pricing[i].finalPrice];
      const irr = calculateIRR(cf);
      if (irr > best.irr) best = { year: pricing[i].year, irr, totalValue: pricing[i].finalPrice };
    }
    return best;
  }, [selectedVilla, firstLine, totals.finalUSD, pricingConfig, handoverMonth, startMonth]);
  const exitYearAbs = Math.floor(startMonth.getFullYear() + handoverMonth/12 + (optimalExit?.year||0));
  const finalCumulativeROI = totals.finalUSD > 0
    ? (((optimalExit.totalValue - totals.finalUSD) / totals.finalUSD) * 100)
    : 0;

  // Таблицы и графики
  const m = new Map();
  const push=(month, amt, desc)=>{ if (amt<=0) return; const prev=m.get(month)||{month,items:[],amountUSD:0}; prev.items.push(desc); prev.amountUSD+=amt; m.set(month,prev); };
  const linesDataLocal = linesData; // alias
  linesDataLocal.forEach(ld=>{
    ld.preSchedule.forEach(r=> push(r.month, r.amountUSD, `${ld.line.snapshot?.name||'Villa'} ×${ld.qty}: ${r.label}`));
    if (ld.firstPostUSD>0) push(handoverMonth+1, ld.firstPostUSD, `${ld.line.snapshot?.name||'Villa'} ×${ld.qty}: Первый платёж`);
    ld.postRows.forEach(r=> push(r.month, r.paymentUSD, `${ld.line.snapshot?.name||'Villa'} ×${ld.qty}: Месяц ${r.label}`));
  });
  const rentalMap = new Map();
  lines.forEach(ln=>{
    const occ = (ln.occupancyPct ?? 75)/100;
    const baseDaily = ln.dailyRateUSD ?? 0;
    const idxPct = ln.rentalPriceIndexPct ?? 0;
    for (let mon = handoverMonth+3; mon <= handoverMonth + (linesDataLocal[0]?.vMonths || months); mon++){
      const yOff = Math.floor((mon - handoverMonth)/12);
      const daily = getIndexedRentalPrice(baseDaily, idxPct, yOff);
      const val = daily * 0.55 * occ * getDaysInMonth(mon) * (ln.qty || 1);
      rentalMap.set(mon, (rentalMap.get(mon)||0) + val);
    }
  });
  const rows = [...m.values()].sort((a,b)=>a.month-b.month);

  const pricing = selectedVilla ? generatePricingData(selectedVilla, firstLine) : [];
  const occ = (firstLine?.occupancyPct ?? 75) / 100;
  const baseDaily = firstLine?.dailyRateUSD ?? selectedVilla?.dailyRateUSD ?? 0;
  const indexPct = firstLine?.rentalPriceIndexPct ?? selectedVilla?.rentalPriceIndexPct ?? 0;
  const rentalData = pricing.map((d) => {
    const daily = getIndexedRentalPrice(baseDaily, indexPct, d.year);
    const workingMonths = d.year===0 ? (handoverMonth>=12 ? 0 : Math.max(0, 12 - Math.max(0, handoverMonth + 3))) : 12;
    return { year: d.year, rentalIncome: daily * 0.55 * occ * 30.44 * workingMonths };
  });
  const globalMax = Math.max(1, Math.max(...pricing.map(d=>d.finalPrice), ...(rentalData.length?[Math.max(...rentalData.map(d=>d.rentalIncome))]:[1])));
  const scaleY = (val) => 250 - (val/globalMax) * 200;

  const annualRows = useMemo(()=>{
    if (!selectedVilla || !firstLine) return [];
    const occ = (firstLine?.occupancyPct ?? 75) / 100;
    const baseDaily = firstLine?.dailyRateUSD ?? selectedVilla?.dailyRateUSD ?? 0;
    const indexPct = firstLine?.rentalPriceIndexPct ?? selectedVilla?.rentalPriceIndexPct ?? 0;
    const avgDays = 30.44;
    return pricing.map((d, idx)=>{
      let workingMonths = idx===0 ? (handoverMonth>=12 ? 0 : Math.max(0, 12 - Math.max(0, handoverMonth + 3))) : 12;
      const daily = getIndexedRentalPrice(baseDaily, indexPct, d.year);
      const rentalIncome = daily * 0.55 * occ * avgDays * workingMonths * (firstLine?.qty || 1);
      const totalCapitalization = d.finalPrice + rentalIncome;
      const prev = idx>0 ? pricing[idx-1] : null;
      const priceChange = prev ? (d.finalPrice - prev.finalPrice) : 0;
      const yearlyRoi = prev ? ((rentalIncome + priceChange) / Math.max(1, prev.finalPrice)) * 100 : 0;
      let cumRent = 0;
      for (let y=0;y<=idx;y++){
        const wd = (y===0) ? (handoverMonth>=12 ? 0 : Math.max(0, 12 - Math.max(0, handoverMonth + 3))) : 12;
        const dly = getIndexedRentalPrice(baseDaily, indexPct, y);
        cumRent += dly * 0.55 * occ * avgDays * wd * (firstLine?.qty || 1);
      }
      const cumulativeRoi = totals.finalUSD>0 ? ((cumRent + d.finalPrice - totals.finalUSD) / totals.finalUSD) * 100 : 0;
      const cashFlows = [-totals.finalUSD];
      for (let y=0;y<=idx;y++){
        const wd = (y===0) ? (handoverMonth>=12 ? 0 : Math.max(0, 12 - Math.max(0, handoverMonth + 3))) : 12;
        const dly = getIndexedRentalPrice(baseDaily, indexPct, y);
        const rent = dly * 0.55 * occ * 30.44 * wd * (firstLine?.qty || 1);
        if (y===idx) cashFlows.push(rent + d.finalPrice); else cashFlows.push(rent);
      }
      const irr = calculateIRR(cashFlows);
      return { displayYear: Math.floor(startMonth.getFullYear() + handoverMonth/12 + d.year), ...d, rentalIncome, totalCapitalization, yearlyRoi, cumulativeRoi, irr };
    });
  },[selectedVilla, firstLine, pricingConfig, handoverMonth, startMonth, totals.finalUSD]);

  const generateMonthlyPricingData = (villa, line) => {
    if (!villa) return [];
    const baseAtHandover = calculateMarketPriceAtHandover(villa, line);
    const vMonths = linesDataLocal[0]?.vMonths || months;
    const totalMonths = handoverMonth + vMonths;
    const occ = (line?.occupancyPct ?? 75) / 100;
    const baseDaily = line?.dailyRateUSD ?? villa?.dailyRateUSD ?? 0;
    const indexPct = line?.rentalPriceIndexPct ?? villa?.rentalPriceIndexPct ?? 0;

    const preMap = new Map();
    const postMap = new Map();
    linesDataLocal.forEach(ld=>{
      ld.preSchedule.forEach(r=> preMap.set(r.month, (preMap.get(r.month)||0) + r.amountUSD));
      ld.postRows.forEach(r=> postMap.set(r.month, (postMap.get(r.month)||0) + r.paymentUSD));
    });

    const result = [];
    let totalPaymentsToDate = 0;
    for (let m = 0; m <= totalMonths; m++) {
      let inflationFactor = 1, lf=1, af=1, bf=1, finalPrice = 0;
      if (m <= handoverMonth) {
        const base = (villa.baseUSD || ((villa.area||0)*(villa.ppsm||0)));
        finalPrice = base * Math.pow(1 + ((line?.monthlyPriceGrowthPct ?? villa?.monthlyPriceGrowthPct ?? 2)/100), m);
      } else {
        const yearOffset = (m - handoverMonth) / 12;
        inflationFactor = Math.pow(1 + pricingConfig.inflationRatePct / 100, yearOffset);
        lf = leaseFactorF(yearOffset, 30, pricingConfig.leaseAlpha);
        af = ageFactorF(yearOffset, pricingConfig.agingBeta);
        bf = brandFactorF(yearOffset, pricingConfig);
        finalPrice = baseAtHandover * inflationFactor * lf * af * bf;
      }

      const paymentAmount = (preMap.get(m)||0) + (postMap.get(m)||0);
      totalPaymentsToDate += paymentAmount;

      let rentalIncome = 0;
      if (m >= handoverMonth + 3) {
        const yearOffset = (m - handoverMonth) / 12;
        const daily = getIndexedRentalPrice(baseDaily, indexPct, Math.floor(yearOffset));
        rentalIncome = daily * 0.55 * occ * getDaysInMonth(m) * (line?.qty || 1);
      }

      const prev = result[result.length-1];
      const priceChange = prev ? (finalPrice - prev.finalPrice) : 0;
      const monthlyRoi = totalPaymentsToDate>0 ? ((rentalIncome + priceChange) / totalPaymentsToDate) * 100 : 0;
      const cumulativeRoi = totals.finalUSD>0 ? ((finalPrice - totals.finalUSD) / totals.finalUSD) * 100 : 0;

      const cashFlows = [-totals.finalUSD];
      for (let j=0;j<=m;j++){
        const rj = (j >= handoverMonth + 3)
          ? (getIndexedRentalPrice(baseDaily, indexPct, Math.floor((j - handoverMonth)/12)) * 0.55 * occ * getDaysInMonth(j) * (line?.qty || 1))
          : 0;
        if (j===m) cashFlows.push(rj + finalPrice); else cashFlows.push(rj);
      }
      const irr = calculateIRR(cashFlows);

      result.push({
        month: m, monthLabel: formatMonth(m),
        leaseFactor: lf, ageFactor: af, brandFactor: bf, inflationFactor,
        finalPrice, rentalIncome, totalInvestorCapital: finalPrice + rentalIncome,
        paymentAmount, totalPaymentsToDate, monthlyRoi, cumulativeRoi, irr
      });
    }
    return result;
  };

  const monthlyRows = useMemo(()=>{
    if (!selectedVilla || !firstLine) return [];
    return generateMonthlyPricingData(selectedVilla, firstLine);
  },[selectedVilla, firstLine, pricingConfig, handoverMonth, months, monthlyRatePct, linesDataLocal, totals.finalUSD]);

  // UI — порядок секций
  let acc=0;

  return (
    <div className="mx-auto max-w-7xl px-5 py-6">
      <div className="flex items-center justify-between">
        <a className="px-3 py-1.5 rounded-lg border" href="#/catalog">← Каталог</a>
        {selected && <div className="text-sm text-neutral-500">{selected.project.projectName}</div>}
      </div>
      <h2 className="text-xl font-semibold mt-4">Полный калькулятор</h2>

      {/* Стадии слева, Настройки справа */}
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <div className="rounded-2xl border p-4 bg-white">
          <h3 className="font-medium mb-3">Рассрочка до получения ключей (установите комфортный план оплаты)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="bg-neutral-50"><Th>Этап</Th><Th>%</Th><Th>Месяц</Th><Th>Удалить</Th></tr></thead>
              <tbody>
                {stages.map(s=>(
                  <tr key={s.id} className="border-t">
                    <Td><input className="px-2 py-1 rounded border w-full" value={s.label} onChange={e=>updStage(s.id,{label:e.target.value})}/></Td>
                    <Td><input className="px-2 py-1 rounded border w-24" type="number" value={s.pct} onChange={e=>updStage(s.id,{pct:e.target.value})}/></Td>
                    <Td><input className="px-2 py-1 rounded border w-24" type="number" value={s.month} onChange={e=>updStage(s.id,{month:+e.target.value})}/></Td>
                    <Td><button className="px-2 py-1 rounded-lg border" onClick={()=>delStage(s.id)}>Удалить</button></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button className="px-3 py-1.5 rounded-lg border" onClick={addStage}>Добавить этап</button>
            <div className="text-sm text-neutral-600">Σ: {stagesSumPct.toFixed(2)}%</div>
          </div>
        </div>

        <div className="rounded-2xl border p-4 bg-white">
          <h3 className="font-medium mb-3">Настройки</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Язык интерфейса</span>
              <select className="px-3 py-2 rounded-xl border" value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="ru">Русский</option><option value="en">English</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Валюта отображения</span>
              <select className="px-3 py-2 rounded-xl border" value={currency} onChange={e=>setCurrency(e.target.value)}>
                <option>USD</option><option>EUR</option><option>IDR</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Заключение договора</span>
              <div className="px-3 py-2 rounded-xl border bg-neutral-50">{startMonth.toLocaleDateString('ru-RU',{month:'long',year:'numeric'})}</div>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Срок строительства (мес)</span>
              <input className="px-3 py-2 rounded-xl border" type="number" min="1" step="1" value={handoverMonth} onChange={e=>setHandoverMonth(clamp(parseInt(e.target.value||0,10),1,120))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Post‑handover рассрочка (мес)</span>
              <input className="px-3 py-2 rounded-xl border" type="number" min="6" step="1" value={months} onChange={e=>setMonths(clamp(parseInt(e.target.value||0,10),6,120))}/>
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-neutral-600">Ставка, %/мес</span>
              <input className="px-3 py-2 rounded-xl border" type="number" min="0" step="0.01" value={monthlyRatePct} onChange={e=>setMonthlyRatePct(clamp(parseFloat(e.target.value||0),0,1000))}/>
            </label>
          </div>
        </div>
      </div>

      {/* Объект недвижимости */}
      <div className="object-card mt-4">
        <h3 className="font-medium mb-2">Объект недвижимости</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="bg-neutral-50">
                <Th>Проект</Th><Th>Вилла</Th><Th>Кол-во</Th><Th>м²</Th><Th>$ / м²</Th><Th>Текущая стоимость (USD)</Th>
                <Th>Скидка, %</Th><Th>До ключей, %</Th><Th>Месяцы</Th><Th>Ставка, %/мес</Th><Th>Итоговая стоимость</Th><Th>—</Th>
              </tr>
            </thead>
            <tbody>
              {linesData.map(ld=>(
                <tr key={ld.line.id} className="border-t">
                  <Td style={{textAlign:'left'}}>{selected?.project.projectName}</Td>
                  <Td style={{textAlign:'left'}}>{ld.line.snapshot?.name}</Td>
                  <Td><input className="px-2 py-1 rounded border w-20" type="number" min="1" step="1" value={ld.line.qty} onChange={e=>updLine(ld.line.id,{qty: clamp(parseInt(e.target.value||0,10),1,9999)})}/></Td>
                  <Td>{fmtInt(ld.line.snapshot?.area||0)}</Td>
                  <Td>{fmtInt(ld.line.snapshot?.ppsm||0)}</Td>
                  <Td>{fmtMoney(ld.base, 'USD')}</Td>
                  <Td><input className="px-2 py-1 rounded border w-20" type="number" min="0" max="20" step="0.1" value={ld.line.discountPct||0} onChange={e=>updLine(ld.line.id,{discountPct:clamp(parseFloat(e.target.value||0),0,20)})}/></Td>
                  <Td>
                    <input type="range" min="50" max="100" step="1" value={Math.max(50,Math.min(100, ld.prePct||0))} onChange={e=>updLine(ld.line.id,{prePct: parseInt(e.target.value,10)})}/>
                    <div className="text-xs text-neutral-600">{Math.max(50,Math.min(100, ld.prePct||0))}%</div>
                  </Td>
                  <Td><input className="px-2 py-1 rounded border w-20" type="number" min="6" step="1" value={ld.vMonths} onChange={e=>updLine(ld.line.id,{ownTerms:true, months: clamp(parseInt(e.target.value||0,10),6,120)})}/></Td>
                  <Td><input className="px-2 py-1 rounded border w-24" type="number" min="0" step="0.01" value={ld.line.monthlyRatePct??monthlyRatePct} onChange={e=>updLine(ld.line.id,{ownTerms:true, monthlyRatePct: clamp(parseFloat(e.target.value||0),0,1000)})}/></Td>
                  <Td className="font-semibold">{fmtMoney(ld.lineTotal, 'USD')}</Td>
                  <Td><button className="px-2 py-1 rounded-lg border" onClick={()=>delLine(ld.line.id)}>Удалить</button></Td>
                </tr>
              ))}
              {linesData.length===0 && <tr><td colSpan={12} className="px-3 py-3 text-neutral-500">Нет выбранных вилл</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI */}
      <div className="kpi-wrap mt-4">
        <div className="kpi-pills">
          <span className="pill">Выбрано вилл: {lines.length || 0}</span>
          <span className="pill">Ключи через {handoverMonth} мес.</span>
          <span className="pill">Срок рассрочки после получения ключей: {months} мес.</span>
        </div>
        <div className="kpi-grid">
          <div className="kpi-item">
            <div className="title">Общая сумма</div>
            <div className="value">{fmtMoney(totals.baseUSD, 'USD')}</div>
          </div>

          <div className="kpi-item stack">
            <div>
              <div className="title">Оплата до ключей</div>
              <div className="value">{fmtMoney(totals.preUSD, 'USD')}</div>
            </div>
            <div>
              <div className="title">Оплата после ключей</div>
              <div className="value">{fmtMoney(totals.afterUSD, 'USD')}</div>
            </div>
          </div>

          {isAdmin && (
            <div className="kpi-item">
              <div className="title">Проценты (только админ)</div>
              <div className="value">{fmtMoney(totals.interestUSD, 'USD')}</div>
            </div>
          )}

          <div className="kpi-item">
            <div className="title">Итоговая стоимость</div>
            <div className="value">{fmtMoney(totals.finalUSD, 'USD')}</div>
          </div>

          <div className="kpi-item stack">
            <div>
              <div className="title">ROI при продаже до ключей</div>
              <div className="value">{roiBeforeKeysAnnual.toFixed(1)}%</div>
            </div>
            <div>
              <div className="title">Чистый доход</div>
              <div className="value">{fmtMoney(netIncomeBeforeKeys, 'USD')}</div>
            </div>
          </div>

          <div className="kpi-item">
            <div className="title">Чистый срок лизхолда (с момента получения ключей)</div>
            <div className="value">{leaseTerm.years} лет {leaseTerm.months} мес.</div>
          </div>

          <div className="kpi-item stack">
            <div>
              <div className="title">Точка выхода с макс. IRR</div>
              <div className="value">{exitYearAbs}</div>
            </div>
            <div>
              <div className="title">IRR</div>
              <div className="value">{optimalExit.irr.toFixed(1)}%</div>
            </div>
            <div>
              <div className="title">Итоговый ROI (накопительный)</div>
              <div className="value">{finalCumulativeROI.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Полный график платежей */}
      <div className="rounded-2xl border p-4 bg-white mt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Полный график платежей</h3>
          <button className="px-3 py-1.5 rounded-lg border" onClick={()=>{
            const head = ["Месяц","Описание","Платеж","Арендный доход","Чистый платеж/доход в месяц","Остаток по договору"];
            const out = [head];
            let sum=0;
            rows.forEach(row=>{
              sum += row.amountUSD;
              const balance = Math.max(0, totals.finalUSD - sum);
              const rent = rentalMap.get(row.month)||0;
              const net = row.amountUSD - rent;
              out.push([formatMonth(row.month), row.items.join(" + "), Math.round(row.amountUSD), Math.round(rent), Math.round(net), Math.round(balance)]);
            });
            const csv = out.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'}); const a=document.createElement('a');
            a.href=URL.createObjectURL(blob); a.download=`arconique_cashflow_${new Date().toISOString().slice(0,10)}.csv`; a.click();
          }}>Export CSV</button>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr className="bg-neutral-50">
                <Th>Месяц</Th>
                <Th style={{textAlign:'left'}}>Описание</Th>
                <Th>Платеж</Th>
                <Th>Арендный доход</Th>
                <Th>Чистый платеж/доход в месяц</Th>
                <Th>Остаток по договору</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length>0 ? rows.map(row=>{
                acc += row.amountUSD;
                const balance = Math.max(0, totals.finalUSD - acc);
                const rent = rentalMap.get(row.month)||0;
                const net = row.amountUSD - rent;
                return (
                  <tr key={row.month} className="border-t">
                    <Td>{formatMonth(row.month)}</Td>
                    <Td style={{textAlign:'left'}}>{row.items.join(' + ')}</Td>
                    <Td>{fmtMoney(row.amountUSD, currency)}</Td>
                    <Td>{fmtMoney(rent, currency)}</Td>
                    <Td className={net>=0 ? 'text-red-600' : 'text-emerald-600'}>{fmtMoney(net, currency)}</Td>
                    <Td>{fmtMoney(balance, currency)}</Td>
                  </tr>
                );
              }) : <tr><td colSpan={6} className="px-3 py-3 text-neutral-500">Нет платежей</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Финмодель (факторы + график) */}
      <div className="rounded-2xl border p-4 bg-white mt-4">
        <h3 className="font-medium">Investment Return Financial Model</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <Kpi label="ИНФЛЯЦИЯ" value={`${pricingConfig.inflationRatePct}%/год`} />
          <Kpi label="СТАРЕНИЕ" value={`${pricingConfig.agingBeta}/год`} />
          <Kpi label="LEASE DECAY" value={`α = ${pricingConfig.leaseAlpha}`} />
          <Kpi label="BRAND FACTOR" value={`Peak = ${pricingConfig.brandPeak}×`} />
        </div>
        <div className="mt-4">
          <h4 className="text-sm text-neutral-600 mb-2">Динамика стоимости виллы и арендного дохода</h4>
          <div className="w-full overflow-x-auto">
            <svg width="800" height="300" viewBox="0 0 800 300">
              <line x1="50" y1="50" x2="50" y2="250" stroke="#666" strokeWidth="1" />
              <line x1="50" y1="250" x2="750" y2="250" stroke="#666" strokeWidth="1" />
              <polyline fill="none" stroke="#1f2937" strokeWidth="2" points={pricing.map((d,i)=>`${50 + i*35},${scaleY(d.finalPrice)}`).join(" ")} />
              {pricing.map((d,i)=><circle key={`p-${i}`} cx={50 + i*35} cy={scaleY(d.finalPrice)} r="3" fill="#1f2937" />)}
              <polyline fill="none" stroke="#9a6c3a" strokeWidth="2" points={rentalData.map((d,i)=>`${50 + i*35},${scaleY(d.rentalIncome)}`).join(" ")} />
              {rentalData.map((d,i)=><circle key={`r-${i}`} cx={50 + i*35} cy={scaleY(d.rentalIncome)} r="3" fill="#9a6c3a" />)}
              {pricing.map((d,i)=>{
                const realYear = Math.floor(startMonth.getFullYear() + handoverMonth/12 + d.year);
                return <text key={`x-${i}`} x={50 + i*35} y="270" fontSize="12" textAnchor="middle" fill="#666">{realYear}</text>;
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Годовая таблица */}
      <div className="rounded-2xl border p-4 bg-white mt-4">
        <h3 className="font-medium">Расчет показателей (годовой)</h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm min-w-[1200px]">
            <thead>
              <tr className="bg-neutral-50">
                <Th>Year</Th>
                <Th>Lease Factor</Th>
                <Th>Age Factor</Th>
                <Th>Brand Factor</Th>
                <Th>Inflation</Th>
                <Th>Market value</Th>
                <Th>Rental income</Th>
                <Th>Total capitalization</Th>
                <Th>Yearly ROI (%)</Th>
                <Th>Cumulative ROI (%)</Th>
                <Th>IRR (%)</Th>
              </tr>
            </thead>
            <tbody>
              {annualRows.length>0 ? annualRows.map((r,i)=>(
                <tr key={i} className="border-t">
                  <Td>{r.displayYear}</Td>
                  <Td>{r.leaseFactor.toFixed(3)}</Td>
                  <Td>{r.ageFactor.toFixed(3)}</Td>
                  <Td>{r.brandFactor.toFixed(3)}</Td>
                  <Td>{r.inflation.toFixed(3)}</Td>
                  <Td>{fmtMoney(r.finalPrice, 'USD')}</Td>
                  <Td>{fmtMoney(r.rentalIncome, 'USD')}</Td>
                  <Td>{fmtMoney(r.totalCapitalization, 'USD')}</Td>
                  <Td>{r.yearlyRoi.toFixed(2)}%</Td>
                  <Td>{r.cumulativeRoi.toFixed(2)}%</Td>
                  <Td>{r.irr.toFixed(2)}%</Td>
                </tr>
              )) : <tr><td colSpan={11} className="px-3 py-3 text-neutral-500">Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Помесячная таблица */}
      <div className="rounded-2xl border p-4 bg-white mt-4">
        <h3 className="font-medium">Расчет показателей (на период рассрочки)</h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm min-w-[1400px]">
            <thead>
              <tr className="bg-neutral-50">
                <Th>Period</Th>
                <Th>Lease Factor</Th>
                <Th>Age Factor</Th>
                <Th>Brand Factor</Th>
                <Th>Inflation</Th>
                <Th>Market value</Th>
                <Th>Rental income</Th>
                <Th>Total capitalization</Th>
                <Th>Installment payment</Th>
                <Th>Monthly ROI (%)</Th>
                <Th>Cumulative ROI (%)</Th>
                <Th>IRR (%)</Th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.length>0 ? monthlyRows.map((r)=>(
                <tr key={r.month} className="border-t">
                  <Td>{r.monthLabel}</Td>
                  <Td>{(r.leaseFactor||1).toFixed(3)}</Td>
                  <Td>{(r.ageFactor||1).toFixed(3)}</Td>
                  <Td>{(r.brandFactor||1).toFixed(3)}</Td>
                  <Td>{(r.inflationFactor||1).toFixed(3)}</Td>
                  <Td>{fmtMoney(r.finalPrice, 'USD')}</Td>
                  <Td>{fmtMoney(r.rentalIncome, 'USD')}</Td>
                  <Td>{fmtMoney(r.totalInvestorCapital, 'USD')}</Td>
                  <Td>{r.paymentAmount>0 ? fmtMoney(r.paymentAmount, 'USD') : '-'}</Td>
                  <Td>{r.monthlyRoi.toFixed(2)}%</Td>
                  <Td>{r.cumulativeRoi.toFixed(2)}%</Td>
                  <Td>{r.irr.toFixed(2)}%</Td>
                </tr>
              )) : <tr><td colSpan={12} className="px-3 py-3 text-neutral-500">Нет данных</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="rounded-2xl border p-4 bg-white">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

function App() {
  const route = useHashRoute();
  const [catalog, setCatalog] = useState(loadCatalog());
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(()=>saveCatalog(catalog),[catalog]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {route.path==="#/admin" ? (
        isAdmin ? <AdminPanel catalog={catalog} setCatalog={setCatalog} /> : <AdminGate onLogin={()=>setIsAdmin(true)} />
      ) : route.path==="#/calc" ? (
        <CalcView catalog={catalog} villaId={route.params.villaId} isAdmin={isAdmin} />
      ) : (
        <CatalogView catalog={catalog} />
      )}
      <footer className="mx-auto max-w-7xl px-5 py-10 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Arconique · Данные каталога сохраняются локально в вашем браузере.
      </footer>
    </div>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
