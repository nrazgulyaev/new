// app.js — внутри CatalogManager: ЗАМЕНИТЕ рендер секции проектов (внутри .catalog-list.map)
<div key={project.projectId} className="project-card">
  <div className="project-header">
    <h3>{project.projectName}</h3>
    <div className="project-actions">
      {!isClient && <button className="btn small" onClick={() => openEditProject(project)}>✏️</button>}
      {!isClient && <button className="btn danger small" onClick={() => deleteProject(project.projectId)}>🗑️</button>}
      {!isClient && <button className="btn success small" onClick={() => addVilla(project.projectId)}>Добавить виллу</button>}
    </div>
  </div>

  {/* Пилюли: План завершения + Прогресс стройки */}
  <div className="pill-row">
    {project.plannedCompletion && (
      <span className="pill">{`План завершения: ${ymLabel(project.plannedCompletion)}`}</span>
    )}
    {Number.isFinite(project.constructionProgressPct) && (
      <span className="pill pill-muted">{`Прогресс стройки: ${project.constructionProgressPct}%`}</span>
    )}
  </div>

  {/* Блок "В стоимость включено" */}
  <div className="project-includes">
    <div className="includes-title">В стоимость включено</div>
    <ul className="includes-list">
      {(project.includes || []).map((item, i) => (<li key={i}>{item}</li>))}
    </ul>
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
          <th className="w-1">Статус</th>
          <th className="w-1">Действие</th>
        </tr>
      </thead>
      <tbody>
        {project.villas.map(v => (
          <tr key={v.villaId}>
            <td className="td-left">{v.name}</td>
            <td>{v.rooms || "—"}</td>
            <td>{v.land ?? 0}</td>
            <td>{v.area ?? 0}</td>
            <td>{v.f1 ?? 0}</td>
            <td>{v.f2 ?? 0}</td>
            <td>{v.roof ?? 0}</td>
            <td>{v.garden ?? 0}</td>
            <td>{v.ppsm ?? 0}</td>
            <td>
              <span className={`status ${v.status === "available" ? "status-available" : v.status === "reserved" ? "status-reserved" : "status-hold"}`}>
                {v.status === "available" ? "в наличии" : v.status === "reserved" ? "забронировано" : "на паузе"}
              </span>
            </td>
            <td>
              {v.status === "available" ? (
                <button className="btn primary btn-sm" onClick={() => onCalculate(project, v)}>Рассчитать</button>
              ) : (
                <span className="badge">Недоступно</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
