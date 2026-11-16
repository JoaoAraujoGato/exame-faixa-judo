const SUPABASE_URL = "https://byhqytcadlcohshxfvnv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Rg8_44UdR0k4wjyayIq-1A_pCIBI7l6";
const $ = (id) => document.getElementById(id);
const LOCAL_KEY = "judo-exams-v1";
let materials,
  exams = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"),
  editingId = null;
let marromSelection = null;
let classes = JSON.parse(localStorage.getItem("judo-classes-v1") || "[]");
let historySort = { key: "date", direction: "desc" };
const beltNames = {
  cinza: "Cinza",
  azul: "Azul",
  amarela: "Amarela",
  laranja: "Laranja",
  verde: "Verde",
  roxa: "Roxa",
  marrom: "Marrom",
};
const examBelts = [
  "cinza",
  "azul",
  "amarela",
  "laranja",
  "verde",
  "roxa",
  "marrom",
];
function beltBadge(belt) {
  const color = materials?.beltColors?.[belt] || "#e2e8f0";
  const light = [
    "#eeeeee",
    "#b8ccec",
    "#ffda62",
    "#f6b263",
    "#aed29f",
  ].includes(color);
  return `<span class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-bold ${light ? "text-slate-800" : "text-white"}" style="background-color:${color}"><span class="h-2 w-2 rounded-full bg-current"></span>${beltNames[belt]}</span>`;
}
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
async function load() {
  materials = await fetch("judomaterials.json").then((r) => r.json());
  for (const s of [$("belt"), $("filterBelt")])
    examBelts.forEach((b) => {
      const o = document.createElement("option");
      o.value = b;
      o.textContent = beltNames[b];
      s.append(o);
    });
  if (supabase) {
    document.getElementById("storageMode").textContent = "Local + nuvem disponível";
  }
  renderClasses();
  $("belt").value = "cinza";
  renderItems();
  renderHistory();
}
function renderClasses() {
  for (const id of ["className", "filterClass"]) {
    const s = $(id);
    if (!s) return;
    const first =
      id === "filterClass"
        ? '<option value="">Todas</option>'
        : '<option value="">Selecione a turma</option>';
    s.innerHTML =
      first + classes.map((c) => `<option value="${c}">${c}</option>`).join("");
  }
}
function accumulated() {
  const target = $("belt").value,
    i = materials.examOrder.indexOf(target);
  let items = materials.items.filter(
    (x) => materials.examOrder.indexOf(x.belt) <= i,
  );
  if (target === "marrom") {
    const techniques = items.filter((x) => x.type === "tecnica"),
      fundamentals = items.filter((x) => x.type === "fundamento"),
      groups = {};
    if (!marromSelection) {
      techniques.forEach((x) => (groups[x.group] ??= []).push(x));
      marromSelection = Object.values(groups).flatMap((group) =>
        group
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((x) => x.id),
      );
    }
    const selected = new Set(marromSelection);
    items = [...techniques.filter((x) => selected.has(x.id)), ...fundamentals];
  }
  return items;
}
function renderItems() {
  const groups = {};
  accumulated().forEach((x) => (groups[x.group] ??= []).push(x));
  $("items").innerHTML = Object.entries(groups)
    .map(
      ([g, items]) =>
        `<fieldset class="rounded-xl bg-white p-4 shadow"><legend class="mb-3 text-lg font-black text-red-800">${g}</legend><div class="space-y-3">${items.map((item) => (item.type === "tecnica" ? tech(item) : fund(item))).join("")}</div></fieldset>`,
    )
    .join("");
  document
    .querySelectorAll("input,textarea,select")
    .forEach((x) => x.addEventListener("input", calculate));
  calculate();
}
function tech(x) {
  return `<div class="border-b pb-3"><div class="flex flex-wrap items-center justify-between gap-2"><label class="font-semibold">${x.name}<input type="hidden" data-id="${x.id}" data-type="tecnica"></label><div class="flex gap-1">${[0, 1, 2, 3, 4, 5].map((n) => `<label class="cursor-pointer"><input class="peer sr-only score" type="radio" name="${x.id}" value="${n}"><span class="block rounded bg-slate-200 px-3 py-2 peer-checked:bg-red-700 peer-checked:text-white">${n}</span></label>`).join("")}</div></div><textarea data-note="${x.id}" class="mt-2 w-full rounded border p-2 text-sm" placeholder="Observações"></textarea></div>`;
}
function fund(x) {
  return `<div class="border-b pb-3"><label class="block font-semibold">${x.name}<select title="Avaliação de ${x.name}" data-id="${x.id}" data-group="${x.group}" data-type="fundamento" class="mt-2 block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal leading-5 text-slate-900 shadow-sm outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"><option value="">Selecione uma avaliação</option><option value="0">0 — Não demonstrou</option><option value="2">2 — Reconhece, mas não explica</option><option value="3">3 — Conhecimento parcial</option><option value="4">4 — Domínio parcial</option><option value="5">5 — Domínio completo</option></select></label><textarea data-note="${x.id}" class="mt-2 w-full rounded-lg border border-slate-300 p-2 text-sm shadow-sm outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100" placeholder="Sugestão de melhoria"></textarea></div>`;
}
function calculate() {
  const techs = [...document.querySelectorAll(".score:checked")].map(
      (x) => +x.value,
    ),
    fundGroups = {};
  document.querySelectorAll('[data-type="fundamento"]').forEach((el) => {
    if (el.value !== "") (fundGroups[el.dataset.group] ??= []).push(+el.value);
  });
  const funds = Object.values(fundGroups).map(
    (values) => values.reduce((a, b) => a + b, 0) / values.length,
  );
  const max = techs.length * 5 + funds.length * 5;
  const value = max
    ? ((techs.reduce((a, b) => a + b, 0) + funds.reduce((a, b) => a + b, 0)) /
        max) *
      5
    : 0;
  $("result").textContent =
    `Média: ${value.toFixed(2)} / 5 — ${value >= +$("cutoff").value ? "Aprovado" : "Reprovado"}`;
  return { value, techs, funds };
}
async function save(e) {
  e.preventDefault();
  const c = calculate();
  const row = {
    id: editingId || crypto.randomUUID(),
    student_name: $("studentName").value.trim(),
    class_name: $("className").value,
    belt: $("belt").value,
    score: +c.value.toFixed(2),
    cutoff: +$("cutoff").value,
    status: c.value >= +$("cutoff").value ? "Aprovado" : "Reprovado",
    details: [...document.querySelectorAll("[data-id]")].map((el) => ({
      item_id: el.dataset.id,
      type: el.dataset.type,
      value:
        el.dataset.type === "tecnica"
          ? document.querySelector(`input[name="${el.dataset.id}"]:checked`)
              ?.value || null
          : el.value,
      note:
        document.querySelector(`[data-note="${el.dataset.id}"]`)?.value || "",
    })),
    created_at: new Date().toISOString(),
  };
  exams = editingId
    ? exams.map((x) => (x.id === editingId ? row : x))
    : [row, ...exams];
  localStorage.setItem(LOCAL_KEY, JSON.stringify(exams));
  if (supabase) {
    await supabase.from("exames").upsert(row);
  }
  editingId = null;
  $("examForm").reset();
  $("belt").value = "cinza";
  renderItems();
  renderHistory();
  alert("Exame salvo com sucesso.");
}
function renderHistory() {
  let rows = exams.filter(
    (x) =>
      (!$("filterClass").value || x.class_name === $("filterClass").value) &&
      (!$("filterBelt").value || x.belt === $("filterBelt").value) &&
      (!$("dateFrom").value ||
        x.created_at.slice(0, 10) >= $("dateFrom").value) &&
      (!$("dateTo").value || x.created_at.slice(0, 10) <= $("dateTo").value),
  );
  rows.sort((a, b) => {
    const values = {
      date: [a.created_at, b.created_at],
      student: [a.student_name, b.student_name],
      class: [a.class_name || "", b.class_name || ""],
      belt: [beltNames[a.belt] || "", beltNames[b.belt] || ""],
      score: [Number(a.score), Number(b.score)],
      status: [a.status, b.status],
    }[historySort.key];
    const left = values[0], right = values[1];
    const result = typeof left === "number" && typeof right === "number"
      ? left - right
      : String(left).localeCompare(String(right), "pt-BR", { sensitivity: "base" });
    return historySort.direction === "asc" ? result : -result;
  });
  $("historyRows").innerHTML =
    rows
      .map(
        (x) =>
          `<tr class="border-t"><td class="p-3">${new Date(x.created_at).toLocaleDateString("pt-BR")}</td><td class="p-3 font-semibold">${x.student_name}</td><td class="p-3">${x.class_name || "-"}</td><td class="p-3">${beltBadge(x.belt)}</td><td class="p-3">${x.score.toFixed(2)}</td><td class="p-3"><span class="rounded-full px-2 py-1 text-xs font-bold ${x.status === "Aprovado" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}">${x.status}</span></td><td class="p-3 whitespace-nowrap"><button data-edit="${x.id}" class="mr-2 text-blue-700">Editar</button><button data-pdf="${x.id}" class="mr-2 text-emerald-700">PDF</button><button data-delete="${x.id}" class="text-red-700">Excluir</button></td></tr>`,
      )
      .join("") ||
    '<tr><td colspan="7" class="p-6 text-center">Nenhum exame encontrado.</td></tr>';
}
function addPdfGuide(doc) {
  doc.setFontSize(9);
  doc.text(
    "Notas técnicas: 0 Não sabe | 1 Insuficiente | 2 Em desenvolvimento | 3 Básico | 4 Bom | 5 Perfeito",
    14,
    24,
  );
  doc.text(
    "Fundamentos: 0 Não demonstrou | 2 Reconhece, mas não explica | 3 Conhecimento parcial",
    14,
    30,
  );
  doc.text("4 Domínio parcial | 5 Domínio completo", 14, 36);
}
function exportExamPdf(exam) {
  const { jsPDF } = window.jspdf,
    doc = new jsPDF();
  doc.text("Exame de Faixa de Judô", 14, 15);
  addPdfGuide(doc);
  doc.setFontSize(10);
  doc.text(
    `Aluno: ${exam.student_name} | Turma: ${exam.class_name || "-"} | Faixa: ${beltNames[exam.belt]}`,
    14,
    44,
  );
  doc.text(
    `Nota: ${Number(exam.score).toFixed(2)} | Status: ${exam.status}`,
    14,
    50,
  );
  doc.autoTable({
    startY: 59,
    head: [["Item", "Tipo", "Avaliação", "Observação"]],
    body: (exam.details || []).map((d) => {
      const item = materials.items.find((i) => i.id === d.item_id);
      return [
        item?.name || d.item_id,
        d.type === "tecnica" ? "Técnica" : "Fundamento",
        d.value || "-",
        d.note || "-",
      ];
    }),
  });
  doc.save(`exame-${exam.student_name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
async function edit(id) {
  const x = exams.find((e) => e.id === id);
  if (!x) return;
  editingId = id;
  marromSelection =
    x.belt === "marrom"
      ? (x.details || [])
          .filter((d) => d.type === "tecnica")
          .map((d) => d.item_id)
      : null;
  $("studentName").value = x.student_name;
  $("className").value = x.class_name || "";
  $("belt").value = x.belt;
  $("cutoff").value = x.cutoff;
  renderItems();
  x.details?.forEach((d) => {
    const el = document.querySelector(`[data-id="${d.item_id}"]`);
    if (d.type === "fundamento" && el) el.value = d.value;
    const radio = document.querySelector(
      `input[name="${d.item_id}"][value="${d.value}"]`,
    );
    if (radio) radio.checked = true;
    const note = document.querySelector(`[data-note="${d.item_id}"]`);
    if (note) note.value = d.note;
  });
  document.querySelector('[data-tab="exam"]').click();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
let deferredInstallPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  $("installApp").classList.remove("hidden");
});
$("installApp").addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    alert("Use o menu do navegador e escolha “Adicionar à tela inicial”.");
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $("installApp").classList.add("hidden");
});
if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
document.addEventListener("click", async (e) => {
  if (e.target.matches(".tab")) {
    document.querySelectorAll(".tab").forEach((x) => {
      x.classList.remove("bg-red-700", "text-white");
      x.classList.add("bg-white", "text-slate-900");
    });
    e.target.classList.remove("bg-white", "text-slate-900");
    e.target.classList.add("bg-red-700", "text-white");
    $("examTab").classList.toggle("hidden", e.target.dataset.tab !== "exam");
    $("historyTab").classList.toggle(
      "hidden",
      e.target.dataset.tab !== "history",
    );
  }
  if (e.target.dataset.edit) edit(e.target.dataset.edit);
  if (e.target.dataset.pdf)
    exportExamPdf(exams.find((x) => x.id === e.target.dataset.pdf));
  if (e.target.dataset.delete && confirm("Excluir este exame?")) {
    const id = e.target.dataset.delete;
    if (supabase) {
      const { error } = await supabase.from("exames").delete().eq("id", id);
      if (error) {
        alert("Não foi possível excluir o exame no Supabase.");
        return;
      }
    }
    exams = exams.filter((x) => x.id !== id);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(exams));
    renderHistory();
  }
});
$("belt").addEventListener("change", () => {
  marromSelection = null;
  renderItems();
});
$("examForm").addEventListener("submit", save);
document.querySelectorAll(".sort-button").forEach((button) =>
  button.addEventListener("click", () => {
    const key = button.dataset.sort;
    historySort = {
      key,
      direction:
        historySort.key === key && historySort.direction === "asc"
          ? "desc"
          : "asc",
    };
    document.querySelectorAll(".sort-button").forEach((item) => {
      item.textContent = item.textContent.replace(/[▲▼↕]/g, "").trim() + " ↕";
    });
    button.textContent = `${button.textContent.replace(/[▲▼↕]/g, "").trim()} ${historySort.direction === "asc" ? "▲" : "▼"}`;
    renderHistory();
  }),
);
$("addClass").addEventListener("click", async () => {
  const name = $("newClass").value.trim();
  if (!name) return;
  if (!classes.includes(name)) classes.push(name);
  classes.sort((a, b) => a.localeCompare(b));
  localStorage.setItem("judo-classes-v1", JSON.stringify(classes));
  if (supabase) await supabase.from("turmas").upsert({ nome: name });
  renderClasses();
  $("className").value = name;
  $("newClass").value = "";
});
["filterClass", "filterBelt", "dateFrom", "dateTo"].forEach((id) =>
  $(id).addEventListener("change", renderHistory),
);
function filteredExams(){return exams.filter((x)=>(!document.getElementById("filterClass").value||x.class_name===document.getElementById("filterClass").value)&&(!document.getElementById("filterBelt").value||x.belt===document.getElementById("filterBelt").value)&&(!document.getElementById("dateFrom").value||x.created_at.slice(0,10)>=document.getElementById("dateFrom").value)&&(!document.getElementById("dateTo").value||x.created_at.slice(0,10)<=document.getElementById("dateTo").value))}function exportSummaryPdf(){const{jsPDF}=window.jspdf,doc=new jsPDF(),rows=filteredExams();doc.text("Exame de Faixa de Judô",14,15);doc.text("Resumo dos exames",14,21);addPdfGuide(doc);doc.autoTable({startY:42,head:[["Data","Aluno","Turma","Faixa","Nota","Status"]],body:rows.map((x)=>[new Date(x.created_at).toLocaleDateString("pt-BR"),x.student_name,x.class_name||"-",beltNames[x.belt],Number(x.score).toFixed(2),x.status])});doc.save("exames-de-judo-resumo.pdf")}document.getElementById("exportSummary").addEventListener("click",exportSummaryPdf);document.getElementById("exportPdf").addEventListener("click", () => {
  const { jsPDF } = window.jspdf,
    doc = new jsPDF();
  const rows = exams.filter(
    (x) =>
      (!$("filterClass").value || x.class_name === $("filterClass").value) &&
      (!$("filterBelt").value || x.belt === $("filterBelt").value) &&
      (!$("dateFrom").value ||
        x.created_at.slice(0, 10) >= $("dateFrom").value) &&
      (!$("dateTo").value || x.created_at.slice(0, 10) <= $("dateTo").value),
  );
  doc.text("Exame de Faixa de Judô", 14, 15);
  doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 21);
  addPdfGuide(doc);
  doc.autoTable({
    startY: 42,
    head: [["Data", "Aluno", "Turma", "Faixa", "Nota", "Status"]],
    body: rows.map((x) => [
      new Date(x.created_at).toLocaleDateString("pt-BR"),
      x.student_name,
      x.class_name || "-",
      beltNames[x.belt],
      Number(x.score).toFixed(2),
      x.status,
    ]),
  });
  let y = doc.lastAutoTable.finalY + 12;
  rows.forEach((x) => {
    if (y > 265) {
      doc.addPage();
      y = 15;
    }
    doc.setFontSize(11);
    doc.text(`${x.student_name} - ${beltNames[x.belt]} - ${x.status}`, 14, y);
    doc.autoTable({
      startY: y + 3,
      head: [["Item", "Tipo", "Avaliação", "Observação"]],
      body: (x.details || []).map((d) => {
        const item = materials.items.find((i) => i.id === d.item_id);
        return [
          item?.name || d.item_id,
          d.type === "tecnica" ? "Técnica" : "Fundamento",
          d.value || "-",
          d.note || "-",
        ];
      }),
    });
    y = doc.lastAutoTable.finalY + 10;
  });
  doc.save("exames-de-judo-completo.pdf");
});
async function importCloudData(){if(!supabase){alert("Configure o Supabase primeiro.");return}const results=await Promise.all([supabase.from("exames").select("*").order("created_at",{ascending:false}),supabase.from("turmas").select("*").order("nome")]);const cloudExams=results[0].data||[],cloudClasses=results[1].data||[];if(results[0].error||results[1].error){alert("Não foi possível importar os dados.");return}const localById=new Map(exams.map(x=>[x.id,x]));cloudExams.forEach(x=>localById.set(x.id,x));exams=[...localById.values()];classes=[...new Set([...classes,...cloudClasses.map(x=>x.nome)])].sort((a,b)=>a.localeCompare(b));localStorage.setItem(LOCAL_KEY,JSON.stringify(exams));localStorage.setItem("judo-classes-v1",JSON.stringify(classes));renderClasses();renderHistory();alert(cloudExams.length+" exame(s) importado(s).")}async function exportCloudData(){if(!supabase){alert("Configure o Supabase primeiro.");return}const examResult=await supabase.from("exames").upsert(exams),classResult=await supabase.from("turmas").upsert(classes.map(nome=>({nome})));if(examResult.error||classResult.error){alert("Não foi possível exportar todos os dados.");return}alert(exams.length+" exame(s) e "+classes.length+" turma(s) exportados para a nuvem.")}document.getElementById("importCloud").addEventListener("click",importCloudData);document.getElementById("exportCloud").addEventListener("click",exportCloudData);const syncMenu=document.getElementById("syncMenuItems");if(syncMenu){syncMenu.append(document.getElementById("importCloud"),document.getElementById("exportCloud"));document.getElementById("importCloud").className="w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-200";document.getElementById("exportCloud").className="w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-200"}load();
