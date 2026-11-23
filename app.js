const KEY = "garaje.coches";
const SAMPLE = [
  {id:"s1",brand:"Seat",model:"León FR",year:2019,km:78000,price:15900,fuel:"Gasolina",color:"#c0392b",desc:"Un solo dueño, revisiones en la marca."},
  {id:"s2",brand:"Toyota",model:"Corolla Hybrid",year:2021,km:42000,price:21500,fuel:"Híbrido",color:"#7f8c8d",desc:"Etiqueta ECO, garantía hasta 2026."},
  {id:"s3",brand:"Volkswagen",model:"Golf TDI",year:2017,km:130000,price:12400,fuel:"Diésel",color:"#2b4c7e",desc:"Cambio manual, ITV pasada."},
  {id:"s4",brand:"Renault",model:"Zoe",year:2020,km:36000,price:11800,fuel:"Eléctrico",color:"#e8e8e8",desc:"Batería en propiedad, cargador incluido."},
  {id:"s5",brand:"Ford",model:"Fiesta",year:2016,km:98000,price:7900,fuel:"Gasolina",color:"#f1c40f",desc:"Ideal para ciudad, muy económico."},
];
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const eur = n => Number(n).toLocaleString("es-ES") + " €";
const km = n => Number(n).toLocaleString("es-ES") + " km";

function loadOwn(){ try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
function saveOwn(a){ try { localStorage.setItem(KEY, JSON.stringify(a)); } catch {} }
let own = loadOwn();
const all = () => [...own.map(c => ({...c, own:true})), ...SAMPLE];

const carSvg = color => `<svg viewBox="0 0 120 50" aria-hidden="true">
  <path d="M8 36 L14 24 Q18 16 30 15 L52 14 Q62 6 78 14 L98 18 Q108 20 112 30 L114 36 Z" fill="${esc(color)}" stroke="#16233B" stroke-width="2"/>
  <circle cx="32" cy="38" r="8" fill="#16233B"/><circle cx="92" cy="38" r="8" fill="#16233B"/>
  <circle cx="32" cy="38" r="3" fill="#fff"/><circle cx="92" cy="38" r="3" fill="#fff"/></svg>`;

function render(){
  const q = $("#q").value.trim().toLowerCase();
  const brand = $("#brand").value, sort = $("#sort").value;
  let list = all().filter(c => (!brand || c.brand === brand) &&
    `${c.brand} ${c.model}`.toLowerCase().includes(q));
  if (sort === "asc") list.sort((a,b) => a.price - b.price);
  if (sort === "desc") list.sort((a,b) => b.price - a.price);
  $("#count").textContent = `${list.length} coche${list.length === 1 ? "" : "s"}`;
  $("#list").innerHTML = list.length ? list.map(c => `
    <button class="card" data-id="${esc(c.id)}">
      <div class="pic" style="background:${esc(c.color)}22">${carSvg(c.color)}</div>
      <div class="body">
        <h3>${esc(c.brand)} ${esc(c.model)}</h3>
        <p class="meta">${esc(c.year)} · ${km(c.km)} · ${esc(c.fuel)}</p>
        <span class="plate"><span>${eur(c.price)}</span></span>
        ${c.own ? '<span class="own">Publicado por ti</span>' : ""}
      </div>
    </button>`).join("")
    : '<p class="empty">No hay coches con esos filtros. Prueba a quitar alguno.</p>';
}

function fillBrands(){
  const sel = $("#brand"), cur = sel.value;
  const brands = [...new Set(all().map(c => c.brand))].sort();
  sel.innerHTML = '<option value="">Todas las marcas</option>' +
    brands.map(b => `<option>${esc(b)}</option>`).join("");
  sel.value = brands.includes(cur) ? cur : "";
}

function showDetail(id){
  const c = all().find(x => x.id === id); if (!c) return;
  const d = $("#detail");
  d.innerHTML = `<div class="pic" style="background:${esc(c.color)}22;border-radius:8px">${carSvg(c.color)}</div>
    <h2>${esc(c.brand)} ${esc(c.model)}</h2>
    <span class="plate"><span>${eur(c.price)}</span></span>
    <dl class="specs">
      <div><dt>Año</dt><dd>${esc(c.year)}</dd></div>
      <div><dt>Kilómetros</dt><dd>${km(c.km)}</dd></div>
      <div><dt>Combustible</dt><dd>${esc(c.fuel)}</dd></div>
    </dl>
    <p>${esc(c.desc || "Sin descripción.")}</p>
    <div class="actions">
      ${c.own ? '<button class="btn danger" id="del">Eliminar anuncio</button>' : ""}
      <button class="btn ghost" id="close">Cerrar</button>
    </div>`;
  d.showModal();
  $("#close").onclick = () => d.close();
  if (c.own) $("#del").onclick = () => {
    own = own.filter(x => x.id !== id); saveOwn(own); d.close(); fillBrands(); render();
  };
}

$("#list").addEventListener("click", e => {
  const card = e.target.closest(".card"); if (card) showDetail(card.dataset.id);
});
["input","change"].forEach(ev => {
  $("#q").addEventListener(ev, render);
  $("#brand").addEventListener(ev, render);
  $("#sort").addEventListener(ev, render);
});
$("#btn-add").onclick = () => $("#form-dlg").showModal();
$("#cancel").onclick = () => $("#form-dlg").close();
$("#form").addEventListener("submit", e => {
  const f = new FormData(e.target);
  own.unshift({id: "u" + Date.now(), brand: f.get("brand").trim(), model: f.get("model").trim(),
    year: +f.get("year"), km: +f.get("km"), price: +f.get("price"), fuel: f.get("fuel"),
    color: f.get("color"), desc: f.get("desc").trim()});
  saveOwn(own); e.target.reset(); fillBrands(); render();
});

fillBrands(); render();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
