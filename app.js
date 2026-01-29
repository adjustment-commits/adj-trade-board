const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

const refreshBtn = document.getElementById("refreshBtn");
const autoBtn = document.getElementById("autoBtn");
const rows = document.getElementById("rows");

const STORAGE_KEY = "adj_trade_board";

let auto=false;
let timer=null;

/* ---------- 初期20行 ---------- */
function buildRows(){

const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

rows.innerHTML="";
for(let i=0;i<20;i++){

const sym = saved[i]?.symbol || "";
const entry = saved[i]?.entry || "";
const note = saved[i]?.note || "";

const tr=document.createElement("tr");
tr.innerHTML=`
<td><input class="symbol" value="${sym}"></td>
<td class="name">-</td>
<td class="price">-</td>
<td class="change">-</td>
<td class="status">🫷</td>
<td><input class="entry" type="number" value="${entry}"></td>
<td class="tp">-</td>
<td class="sl">-</td>
<td><input class="note" value="${note}"></td>
`;
rows.appendChild(tr);
}
}
buildRows();

/* ---------- データ取得 ---------- */
async function fetchQuotes(symbols){
try{
const url=`https://${API_HOST}/market/get-quotes?region=JP&symbols=${symbols.join(",")}`;

const res=await fetch(url,{
headers:{
"x-rapidapi-key":API_KEY,
"x-rapidapi-host":API_HOST
}
});

const json=await res.json();
if(!json.quoteResponse) return [];
return json.quoteResponse.result;

}catch(e){
console.log(e);
return [];
}
}

/* ---------- 更新処理 ---------- */
async function refresh(){

const symbolInputs=[...document.querySelectorAll(".symbol")];
const symbols=symbolInputs
.map(i=>i.value.trim())
.filter(v=>v!=="");

if(symbols.length===0) return;

const data=await fetchQuotes(symbols);

symbolInputs.forEach((input)=>{
const row=input.closest("tr");
const priceCell = row.querySelector(".price");
const changeCell = row.querySelector(".change");
const statusCell = row.querySelector(".status");
const nameCell  = row.querySelector(".name");

if(!row.dataset.prevStatus){
  row.dataset.prevStatus = "";
}

const d = data.find(x => x.symbol === input.value.toUpperCase());

if(!d){
priceCell.textContent="-";
changeCell.textContent="-";
statusCell.textContent="🫷";
return;
}

priceCell.textContent =
  d.regularMarketPrice ? d.regularMarketPrice.toFixed(2) : "-";

changeCell.textContent =
  d.regularMarketChangePercent
    ? d.regularMarketChangePercent.toFixed(2)+"%"
    : "-";

nameCell.textContent = d.shortName || d.longName || "-";

const pct = d.regularMarketChangePercent;

row.className = "";

if(pct >= 2){
  statusCell.textContent="🚀 BUY";
  row.classList.add("buy");
}
else if(pct <= -2){
  statusCell.textContent="🔥 SL";
  row.classList.add("sl");
}
else if(pct >= 1){
  statusCell.textContent="✨ TP候補";
  row.classList.add("tp");
}
else{
  statusCell.textContent="🫷 WAIT";
  row.classList.add("wait");
}

// --- 状態変化チェック ---
const prev = row.dataset.prevStatus;
const current = statusCell.textContent;

if(prev && prev !== current){
  statusCell.textContent = `${prev} → ${current}`;
}

row.dataset.prevStatus = current;

// --- TP / SL 自動計算 ---
const entryInput = row.querySelector(".entry");
const tpCell = row.querySelector(".tp");
const slCell = row.querySelector(".sl");

const entryPrice = parseFloat(entryInput.value);

if(entryPrice){
  tpCell.textContent = (entryPrice * 1.02).toFixed(2);
  slCell.textContent = (entryPrice * 0.99).toFixed(2);
}else{
  tpCell.textContent = "-";
  slCell.textContent = "-";
}

});

/* ===== localStorage保存 ===== */
const saveData = [...document.querySelectorAll("#rows tr")]
  .map(tr => ({
    symbol: tr.querySelector(".symbol").value,
    entry: tr.querySelector(".entry").value,
    note: tr.querySelector(".note").value
  }));

localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
/* ============================ */

}

/* ---------- Auto ---------- */
function toggleAuto(){
if(auto){
clearInterval(timer);
auto=false;
autoBtn.textContent="自動更新 OFF";
}else{
timer=setInterval(refresh,5000);
auto=true;
autoBtn.textContent="自動更新 ON";
}
}

refreshBtn.onclick=refresh;
autoBtn.onclick=toggleAuto;
