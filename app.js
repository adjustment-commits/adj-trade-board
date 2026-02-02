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
const FLOW_HISTORY_KEY = "adj_flow_history";

/* ===========================
   API SETTINGS
=========================== */

const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

/* ===========================
   LOW PRICE LIST
=========================== */

const LOW_PRICE_LIST = [
"1325.T","1356.T","1360.T","1366.T","1368.T","1435.T","1443.T","1447.T","1459.T","1466.T",
"1469.T","1472.T","1475.T","1571.T","1656.T","1678.T","1711.T","1726.T","1773.T","1783.T",
"179A.T","180A.T","1840.T","1853.T","1873.T","190A.T","196A.T","198A.T","2012.T","2013.T",
"2014.T","201A.T","2055.T","206A.T","2120.T","2134.T","213A.T","2146.T","2156.T","2164.T"
];

/* ===========================
   INIT
=========================== */

load();

/* ===========================
   FLOW HISTORY
=========================== */

function getFlowHistory(){
  return JSON.parse(localStorage.getItem(FLOW_HISTORY_KEY) || "{}");
}

function setFlowHistory(obj){
  localStorage.setItem(FLOW_HISTORY_KEY, JSON.stringify(obj));
}

function calcDeltaFlow(symbol, currentFlow){
  const hist = getFlowHistory();
  const prev = hist[symbol] ?? currentFlow;
  hist[symbol] = currentFlow;
  setFlowHistory(hist);
  return currentFlow - prev;
}

/* ===========================
   BUTTONS
=========================== */

addRowBtn.onclick = ()=>{ addRow(); save(); };
refreshBtn.onclick = ()=>{ updateAllRows(); };
clearBtn.onclick = ()=>{
  if(confirm("全削除しますか？")){
    board.innerHTML="";
    save();
  }
};

/* ===========================
   ROW CREATE
=========================== */

function addRow(data={}){

const tr=document.createElement("tr");

tr.innerHTML=`
<td><input class="code" value="${data.code||""}" placeholder="7203.T"></td>
<td><input class="name" value="${data.name||""}" disabled></td>
<td><input class="price" value="${data.price||""}" disabled></td>
<td><input class="change" value="${data.change||""}" disabled></td>
<td class="status">-</td>
<td class="power">-</td>
<td class="flow">0</td>
<td class="delta">0</td>
<td><button class="delBtn">✖</button></td>
`;

tr.querySelector(".delBtn").onclick=()=>{ tr.remove(); save(); };

tr.querySelector(".code").addEventListener("change", async(e)=>{

const symbol=e.target.value.trim().toUpperCase();
if(!symbol) return;

const data = await fetchStock(symbol);
if(!data){ alert("取得失敗"); return; }

const power = judgeRocketPower(data.raw);
const flow  = calcFlowScore(data.raw);
const delta = calcDeltaFlow(symbol, flow);

tr.querySelector(".name").value = data.name;
tr.querySelector(".price").value = data.price.toFixed(2);
tr.querySelector(".change").value = data.change.toFixed(2);
tr.querySelector(".power").textContent = power.label;

const flowCell = tr.querySelector(".flow");
flowCell.textContent = flow;
applyFlowColor(flowCell, flow);

const deltaCell = tr.querySelector(".delta");
deltaCell.textContent = (delta>0?"+":"")+delta;
applyDeltaColor(deltaCell, delta);

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
const url=`https://${API_HOST}/market/get-quotes?region=JP&symbols=${symbol}`;
const res=await fetch(url,{
headers:{
"x-rapidapi-key":API_KEY,
"x-rapidapi-host":API_HOST
}});
const json=await res.json();
const d=json.quoteResponse?.result?.[0];
if(!d) return null;

return{
name:d.longName||d.shortName||"-",
price:d.regularMarketPrice,
change:d.regularMarketChangePercent,
raw:d
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

const rows=document.querySelectorAll("#board tr");

for(const row of rows){

const code=row.querySelector(".code").value.trim();
if(!code) continue;

const data=await fetchStock(code);
if(!data) continue;

const power = judgeRocketPower(data.raw);
const flow  = calcFlowScore(data.raw);
const delta = calcDeltaFlow(code, flow);

row.querySelector(".name").value = data.name;
row.querySelector(".price").value = data.price.toFixed(2);
row.querySelector(".change").value = data.change.toFixed(2);
row.querySelector(".power").textContent = power.label;

const flowCell=row.querySelector(".flow");
flowCell.textContent=flow;
applyFlowColor(flowCell,flow);

const deltaCell=row.querySelector(".delta");
deltaCell.textContent=(delta>0?"+":"")+delta;
applyDeltaColor(deltaCell,delta);

judgeRow(row);
}
save();
}

/* ===========================
   JUDGE
=========================== */

function judgeRow(row){

const change=parseFloat(row.querySelector(".change").value);
row.className="";

if(isNaN(change)){
row.querySelector(".status").textContent="-";
return;
}

if(change>=2){
row.classList.add("buy");
row.querySelector(".status").textContent="🚀";
}
else if(change<=-2){
row.classList.add("sell");
row.querySelector(".status").textContent="🔥";
}
else{
row.classList.add("wait");
row.querySelector(".status").textContent="🫷";
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
delta:r.querySelector(".delta").textContent
}));

localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}

function load(){

const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");
saved.forEach(d=>{
const row=addRow(d);
row.querySelector(".power").textContent=d.power||"-";
row.querySelector(".flow").textContent=d.flow||"0";
row.querySelector(".delta").textContent=d.delta||"0";
});
}

/* ===========================
   ROCKET POWER
=========================== */

function judgeRocketPower(d){

if(!d) return {label:"-",score:0};

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

if(!d) return 0;

let score=0;
const price=d.regularMarketPrice;
const high=d.regularMarketDayHigh;
const low=d.regularMarketDayLow;
const vol=d.regularMarketVolume;
const chg=d.regularMarketChangePercent;

if(vol>=1e6) score+=10;
if(vol>=2e6) score+=10;
if(vol>=4e6) score+=10;

const pos=(price-low)/(high-low);
if(pos>=0.6) score+=10;
if(pos>=0.8) score+=15;

if(chg>=1) score+=10;
if(chg>=3) score+=8;
if(chg>=6) score+=7;

if(price>=high*0.99) score+=20;

return score;
}

/* ===========================
   COLOR
=========================== */

function applyFlowColor(cell,score){
let c="#555";
if(score>=80) c="#ff3b30";
else if(score>=60) c="#ff9500";
else if(score>=40) c="#34c759";
else if(score>=20) c="#0a84ff";
cell.style.background=c;
cell.style.color="#fff";
cell.style.fontWeight="700";
}

function applyDeltaColor(cell,d){
let c="#666";
if(d>=15) c="#ff3b30";
else if(d>=8) c="#ff9500";
else if(d>=3) c="#34c759";
else if(d<=-8) c="#0a84ff";
cell.style.background=c;
cell.style.color="#fff";
cell.style.fontWeight="700";
}

});
