// продолжаем
async function rafFrames(n=2){for(let i=0;i<n;i++)await new Promise(r=>requestAnimationFrame(()=>r()));}

async function exportNodeToPDF(node, options = {}) {
  const {
    filename = `export-${new Date().toISOString().slice(0,10)}.pdf`,
    orientation = "portrait",            // "portrait" | "landscape"
    margin = 6,                          // мм
    scale = 1.75,                        // 1.25–2.0 (качество/память)
    hideMedia = true,                    // скрыть img/video/iframe
    stripSticky = true,                  // убрать position: sticky
    forceNoWrap = true,                  // white-space: nowrap для ячеек
    pagebreak = ["css","legacy"],        // режимы разрывов
    beforeClone = null,                  // (clone) => void — произвольная подготовка
    afterDone = null                     // () => void — коллбек после выгрузки
  } = options;

  try {
    if (typeof html2pdf === "undefined") {
      alert("html2pdf не загружен (нужен bundle).");
      return;
    }
    if (!node) { alert("Нет узла для экспорта"); return; }

    const clone = node.cloneNode(true);
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, { position:"fixed", inset:"0", background:"#fff", overflow:"auto", opacity:"0", zIndex:"999999" });
    wrapper.className = "print-mode";
    if (hideMedia) clone.querySelectorAll("img,video,iframe").forEach(el => el.style.display="none");
    if (stripSticky) clone.querySelectorAll("*").forEach(el => { const s=getComputedStyle(el); if (s.position==="sticky") el.style.position="static"; });
    clone.querySelectorAll(".calc-scroll,.factors-table-scroll,.table-wrap").forEach(el => { el.style.overflow="visible"; el.style.maxWidth="none"; });
    clone.querySelectorAll(".calc-table,.factors-table,.catalog-table").forEach(t => { t.style.width="100%"; t.style.minWidth="auto"; t.style.tableLayout="fixed"; });
    if (forceNoWrap) clone.querySelectorAll("th,td").forEach(td => { td.style.whiteSpace="nowrap"; });

    if (typeof beforeClone === "function") { try { beforeClone(clone); } catch {} }
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    if (document.fonts?.ready) { try { await document.fonts.ready; } catch {} }
    await rafFrames(2);

    const windowWidth = wrapper.scrollWidth || wrapper.clientWidth || 1200;
    const windowHeight = Math.max(wrapper.scrollHeight, 800);
    const adjScale = windowHeight > 30000 ? Math.min(1.25, scale) : (windowHeight > 15000 ? Math.min(1.5, scale) : scale);

    await html2pdf().from(wrapper).set({
      margin,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        backgroundColor: "#fff",
        scale: adjScale,
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth,
        windowHeight
      },
      jsPDF: { unit: "mm", format: "a4", orientation },
      pagebreak: { mode: pagebreak }
    }).save();

    try { document.body.removeChild(wrapper); } catch {}
    if (typeof afterDone === "function") afterDone();
  } catch (e) {
    console.error(e);
    alert("PDF не сформирован, см. консоль");
  }
}

// Примеры вызова:
async function exportProjectPDF(projectId) {
  const el = document.getElementById(`project-${projectId}`);
  await exportNodeToPDF(el, { filename: `arconique-price-list-${projectId}.pdf`, orientation: "landscape", scale: 2 });
}
async function exportCalcPDF() {
  const scope = document.getElementById("calc-print-scope");
  await exportNodeToPDF(scope, { filename: `arconique-calculator-${new Date().toISOString().slice(0,10)}.pdf`, orientation: "portrait", scale: 1.75 });
}
