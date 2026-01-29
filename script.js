const API_KEY = "9da2719fc4mshd3a78b9ad23f661p120cb6jsn71fe0d28e188";
const API_HOST = "yahoo-finance-real-time1.p.rapidapi.com";

/* ---------- 低位株ユニバース ---------- */
const LOW_PRICE_LIST = [
"2134.T","2315.T","2330.T","2345.T","2370.T",
"2687.T","2929.T","3031.T","3070.T","3315.T",
"3521.T","3664.T","3823.T","3907.T","4180.T",
"4594.T","4764.T","5017.T","5955.T","6298.T",
"6335.T","6731.T","6993.T","7527.T","7615.T",
"7777.T","8013.T","8202.T","8411.T","8746.T",
"8894.T","9424.T","9878.T"
];

const refreshBtn = document.getElementById("refreshBtn");
const autoBtn = document.getElementById("autoBtn");
const rows = document.getElementById("rows");

const scanBtn = document.getElementById("scanBtn");
const scannerList = document.getElementById("scannerList");

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

const d = data.find(x => x.symbol === input.value.trim().toUpperCase());
  
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

const pct = Number(d.regularMarketChangePercent || 0);

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

async function scanLowStocks(){

  scannerList.innerHTML = "スキャン中...";

  const data = await fetchQuotes(LOW_PRICE_LIST);

  const rockets = data.filter(d=>{
    const pct = d.regularMarketChangePercent;
    return d.regularMarketPrice <= 300 &&
           pct >= 2 &&
           d.regularMarketVolume > 1000000;
  });

  if(rockets.length===0){
    scannerList.innerHTML = "<div class='empty'>候補なし</div>";
    return;
  }

  scannerList.innerHTML="";
rockets.forEach(d=>{
  const div=document.createElement("div");
  div.className="scanItem";
  div.textContent=`${d.symbol}  ${d.shortName || ""}  🚀`;

  // ★ クリックで右表へ転記
  div.onclick = () => insertSymbolToBoard(d.symbol);

  scannerList.appendChild(div);
});

}

scanBtn.onclick = scanLowStocks;
