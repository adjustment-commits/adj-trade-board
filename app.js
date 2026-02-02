document.addEventListener("DOMContentLoaded", () => {

/* ===========================
   ELEMENTS
=========================== */

const board = document.getElementById("board");
const addRowBtn = document.getElementById("addRowBtn");
const refreshBtn = document.getElementById("refreshBtn");
const clearBtn = document.getElementById("clearBtn");
const rocketBtn = document.getElementById("rocketBtn");
const rocketArea = document.getElementById("rocketArea");

const STORAGE_KEY = "adj_stock_board";

/* ===========================
   API SETTINGS
=========================== */

const API_KEY  = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

/* ===========================
   LOW PRICE LIST
=========================== */

const LOW_PRICE_LIST = [
"1325.T","1356.T","1360.T","1366.T","1368.T",
"1435.T","1443.T","1447.T","1459.T","1466.T",
"1469.T","1472.T","1475.T","1571.T","1656.T",
"1678.T","1711.T","1726.T","1773.T","1783.T",
"179A.T","180A.T","1840.T","1853.T","1873.T",
"190A.T","196A.T","198A.T","2012.T","2013.T",
"2014.T","201A.T","2055.T","206A.T","2120.T",
"2134.T","213A.T","2146.T","2156.T","2164.T"
];

/* ===========================
   INIT
=========================== */

load();

/* ===========================
   BUTTONS
=========================== */

addRowBtn.onclick = () => {
  addRow();
  save();
};

refreshBtn.onclick = () => {
  updateAllRows();
};

clearBtn.onclick = () => {
  if(confirm("全削除しますか？")){
    board.innerHTML = "";
    localStorage.removeItem(STORAGE_KEY);
  }
};

rocketBtn.onclick = () => {
  runRocketScan();
};

/* ===========================
   ROW CREATE
=========================== */

function addRow(data={}){

const tr = document.createElement("tr");

tr.innerHTML = `
<td><input class="code" value="${data.code||""}" placeholder="7203.T"></td>
<td><input class="name" value="${data.name||""}" disabled></td>
<td><input class="price" value="${data.price||""}" disabled></td>
<td><input class="change" value="${data.change||""}" disabled></td>
<td class="power">${data.power||"-"}</td>
<td class="flow">${data.flow||"0"}</td>
<td class="delta">${data.delta||"0"}</td>
<td class="star">${data.star||""}</td>
<td><button class="delBtn">✖</button></td>
`;

tr.querySelector(".delBtn").onclick = ()=>{
  tr.remove();
  save();
};

tr.querySelector(".code").addEventListener("change", async(e)=>{

const symbol = e.target.value.trim().toUpperCase();
if(!symbol) return;

const data = await fetchStock(symbol);
if(!data){ alert("取得失敗"); return; }

const power = judgeRocketPower(data.raw);
const flow  = calcFlowScore(data.raw);

/* 表示 */
tr.querySelector(".name").value   = data.name;
tr.querySelector(".price").value  = data.price.toFixed(2);
tr.querySelector(".change").value = data.change.toFixed(2);
tr.querySelector(".power").textContent = power.label;

/* FLOW */
const flowCell = tr.querySelector(".flow");
flowCell.textContent = flow;
applyFlowColor(flowCell, flow);

/* ΔFLOW */
const deltaCell = tr.querySelector(".delta");
deltaCell.textContent = flow;
applyDeltaColor(deltaCell, flow);

/* ⭐ */
tr.querySelector(".star").textContent =
  (power.label==="🚀+" && flow>=60) ? "⭐" : "";

judgeRow(tr);
save();

});

board.appendChild(tr);
return tr;
}

/* ===========================
   FETCH
=========================== */

async function fetchStock(symbol){

try{
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;

  const res = await fetch(url);
  const json = await res.json();

  const d = json.quoteResponse?.result?.[0];
  if(!d) return null;

  return{
    name: d.longName || d.shortName || "-",
    price: d.regularMarketPrice,
    change: d.regularMarketChangePercent,
    raw: d
  };

}catch(e){
  console.error(e);
  return null;
}

}

/* ===========================
   UPDATE ALL
=========================== */

async function updateAllRows(){

const rows = document.querySelectorAll("#board tr");

for(const row of rows){

const code = row.querySelector(".code").value.trim();
if(!code) continue;

const data = await fetchStock(code);
if(!data) continue;

const power = judgeRocketPower(data.raw);
const flow  = calcFlowScore(data.raw);

row.querySelector(".name").value = data.name;
row.querySelector(".price").value = data.price.toFixed(2);
row.querySelector(".change").value = data.change.toFixed(2);
row.querySelector(".power").textContent = power.label;

const flowCell=row.querySelector(".flow");
flowCell.textContent=flow;
applyFlowColor(flowCell,flow);

const deltaCell=row.querySelector(".delta");
deltaCell.textContent=flow;
applyDeltaColor(deltaCell,flow);

row.querySelector(".star").textContent =
  (power.label==="🚀+" && flow>=60) ? "⭐" : "";

judgeRow(row);
}

save();
}

/* ===========================
   JUDGE ROW COLOR
=========================== */

function judgeRow(row){

const change=parseFloat(row.querySelector(".change").value);
row.className="";

if(isNaN(change)) return;

if(change>=2){
row.classList.add("buy");
}
else if(change<=-2){
row.classList.add("sell");
}
else{
row.classList.add("wait");
}
}

/* ===========================
   SAVE / LOAD
=========================== */

function save(){

const data=[...document.querySelectorAll("#board tr")]
.map(r=>({
code:r.querySelector(".code").value,
name:r.querySelector(".name").value,
price:r.querySelector(".price").value,
change:r.querySelector(".change").value,
power:r.querySelector(".power").textContent,
flow:r.querySelector(".flow").textContent,
delta:r.querySelector(".delta").textContent,
star:r.querySelector(".star").textContent
}));

localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}

function load(){

const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
saved.forEach(d=>addRow(d));
}

/* ===========================
   ROCKET POWER
=========================== */

function judgeRocketPower(d){

let score=0;

const price=d.regularMarketPrice;
const open=d.regularMarketOpen;
const high=d.regularMarketDayHigh;
const low=d.regularMarketDayLow;

const upper=high-price;
const body=Math.abs(price-open);

if(upper < body*0.5) score++;
if(d.regularMarketVolume>=1000000) score++;
if(d.regularMarketChangePercent>=5) score++;
if((price-low)/(high-low)>0.7) score++;

let label="🚀-";
if(score>=3) label="🚀+";
else if(score==2) label="🚀±";

return {label,score};
}

/* ===========================
   FLOW SCORE
=========================== */

function calcFlowScore(d){

let score=0;

const price=d.regularMarketPrice;
const high=d.regularMarketDayHigh;
const low=d.regularMarketDayLow;
const vol=d.regularMarketVolume;
const chg=d.regularMarketChangePercent;

if(vol>=1e6) score+=20;
if(vol>=2e6) score+=20;
if(vol>=4e6) score+=20;

const pos=(price-low)/(high-low);
if(pos>=0.6) score+=20;
if(pos>=0.8) score+=20;

if(chg>=3) score+=10;
if(chg>=6) score+=10;

return score;
}

/* ===========================
   COLOR
=========================== */

function applyFlowColor(cell,score){
let c="#334155";
if(score>=80) c="#ff3b30";
else if(score>=60) c="#ff9500";
else if(score>=40) c="#34c759";
else if(score>=20) c="#0a84ff";
cell.style.background=c;
cell.style.color="#fff";
cell.style.fontWeight="700";
}

function applyDeltaColor(cell,score){
applyFlowColor(cell,score);
}

/* ===========================
   ROCKET SCAN
=========================== */

async function runRocketScan(){

rocketArea.textContent="スキャン中...\n";

let result=[];

for(const code of LOW_PRICE_LIST){

const data = await fetchStock(code);
if(!data) continue;

const power = judgeRocketPower(data.raw);
const flow  = calcFlowScore(data.raw);

console.log(code, power.label, flow);

if(power.label!=="-" && flow>=20){
  result.push(
   `${code} | ${data.name} | ${data.price.toFixed(1)}円 | ${power.label} | FLOW:${flow}`
  );
}

// API負荷軽減
await new Promise(r=>setTimeout(r,150));

}

if(result.length===0){
  rocketArea.textContent="該当なし";
}else{
  rocketArea.textContent=result.join("\n");
}

}
});
